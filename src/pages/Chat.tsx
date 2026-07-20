import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Bot, User, Trash2, Plus, MessageSquare, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Olá! 👋 Eu sou a **Luz**, sua consultora de skincare com IA. Posso ajudar com dúvidas sobre ingredientes, rotina, produtos e cuidados com a pele. Como posso te ajudar hoje?",
};

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    setConversations((data as Conversation[]) || []);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("role,content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    const msgs = ((data as Message[]) || []).map((m) => ({ role: m.role, content: m.content }));
    setMessages(msgs.length ? msgs : [WELCOME]);
  }, []);

  const selectConversation = useCallback(
    async (id: string) => {
      setActiveId(id);
      setSidebarOpen(false);
      await loadMessages(id);
    },
    [loadMessages],
  );

  const newConversation = useCallback(() => {
    setActiveId(null);
    setMessages([WELCOME]);
    setSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("chat_conversations").delete().eq("id", id);
      if (error) {
        toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
        return;
      }
      if (activeId === id) newConversation();
      await loadConversations();
    },
    [activeId, loadConversations, newConversation],
  );

  const persistTurn = useCallback(
    async (userText: string, assistantText: string, currentId: string | null) => {
      if (!user) return currentId;
      let convId = currentId;
      if (!convId) {
        const title = userText.slice(0, 60);
        const { data, error } = await supabase
          .from("chat_conversations")
          .insert({ user_id: user.id, title })
          .select("id")
          .single();
        if (error || !data) return null;
        convId = data.id;
        setActiveId(convId);
      } else {
        await supabase
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);
      }
      await supabase.from("chat_messages").insert([
        { conversation_id: convId, user_id: user.id, role: "user", content: userText },
        { conversation_id: convId, user_id: user.id, role: "assistant", content: assistantText },
      ]);
      loadConversations();
      return convId;
    },
    [user, loadConversations],
  );

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const userText = input.trim();
      const userMsg: Message = { role: "user", content: userText };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setLoading(true);

      try {
        const chatMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));

        const { data: { session } } = await supabase.auth.getSession();
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const response = await fetch(`${SUPABASE_URL}/functions/v1/skincare-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${session?.access_token ?? SUPABASE_KEY}`,
          },
          body: JSON.stringify({ messages: chatMessages }),
        });

        if (!response.ok) {
          if (response.status === 429) throw new Error("Limite de requisições excedido. Tente novamente em alguns segundos.");
          if (response.status === 402) throw new Error("Créditos insuficientes.");
          const errTxt = await response.text().catch(() => "");
          throw new Error(errTxt || "Erro no chat.");
        }

        if (!response.body) throw new Error("Resposta sem corpo.");

        const reader = response.body.getReader();
        const textDecoder = new TextDecoder();
        let assistantContent = "";
        let buffer = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += textDecoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const raw of lines) {
            const line = raw.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                const content = assistantContent;
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content };
                  return copy;
                });
              }
            } catch {
              // skip
            }
          }
        }

        if (assistantContent) {
          await persistTurn(userText, assistantContent, activeId);
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `❌ Erro: ${err.message || "Não foi possível processar sua mensagem. Tente novamente."}` },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, activeId, persistTurn],
  );

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button onClick={newConversation} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Nova conversa
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6 px-3">
            Suas conversas aparecerão aqui.
          </p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors ${
              activeId === c.id ? "bg-secondary" : "hover:bg-secondary/60"
            }`}
            onClick={() => selectConversation(c.id)}
          >
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1 min-w-0 truncate text-xs text-foreground">{c.title}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Excluir esta conversa?")) deleteConversation(c.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              aria-label="Excluir conversa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Chat Luz">
      <div className="max-w-6xl mx-auto flex gap-4 h-[calc(100vh-8rem)]">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 bg-card border border-border rounded-2xl overflow-hidden">
          {Sidebar}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile trigger */}
          <div className="md:hidden mb-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4 mr-2" /> Conversas
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                {Sidebar}
              </SheetContent>
            </Sheet>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-rose-soft flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-foreground/70" />
                    </div>
                  )}
                  <Card className={`max-w-[80%] p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                    <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </Card>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-soft flex items-center justify-center">
                  <Bot className="w-4 h-4 text-foreground/70" />
                </div>
                <Card className="p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Pensando...</span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="pt-4 border-t border-border space-y-2">
            <form onSubmit={handleSend} className="flex gap-3">
              <Textarea
                placeholder="Pergunte sobre skincare, ingredientes, rotina..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground">
              ⚠️ Respostas de IA não substituem consulta dermatológica.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
