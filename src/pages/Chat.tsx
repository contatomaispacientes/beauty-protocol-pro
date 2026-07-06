import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! 👋 Eu sou a **Luz**, sua consultora de skincare com IA. Posso ajudar com dúvidas sobre ingredientes, rotina, produtos e cuidados com a pele. Como posso te ajudar hoje?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
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
            // skip unparseable chunks
          }
        }
      }
    } catch (err: any) {

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Erro: ${err.message || "Não foi possível processar sua mensagem. Tente novamente."}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const clearChat = () => {
    setMessages([
      { role: "assistant", content: "Olá! 👋 Chat reiniciado. Como posso te ajudar?" },
    ]);
  };

  return (
    <DashboardLayout title="Chat Luz">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
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
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-muted-foreground">⚠️ Respostas de IA não substituem consulta dermatológica.</p>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={clearChat}>
              <Trash2 className="w-3 h-3 mr-1" /> Limpar chat
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
