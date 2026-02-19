import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! 👋 Sou sua assistente de skincare com IA. Posso ajudar com dúvidas sobre ingredientes, rotina, produtos e cuidados com a pele. Como posso te ajudar hoje?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Placeholder — will connect to Lovable AI streaming edge function
    await new Promise((r) => setTimeout(r, 1500));
    const assistantMsg: Message = {
      role: "assistant",
      content: "Essa é uma ótima pergunta! Com base no seu perfil dermatológico, posso te orientar. O ácido hialurônico é excelente para hidratação e pode ser usado tanto de manhã quanto à noite, após a limpeza e antes do hidratante. Ele funciona bem para todos os tipos de pele.\n\nLembre-se: para melhores resultados, aplique na pele úmida! 💧\n\n⚠️ *Esta orientação não substitui consulta dermatológica.*",
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  };

  return (
    <DashboardLayout title="Chat com IA">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-rose-soft flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-foreground/70" />
                </div>
              )}
              <Card className={`max-w-[80%] p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </Card>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-soft flex items-center justify-center">
                <Bot className="w-4 h-4 text-foreground/70" />
              </div>
              <Card className="p-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </Card>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-border">
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
      </div>
    </DashboardLayout>
  );
};

export default Chat;
