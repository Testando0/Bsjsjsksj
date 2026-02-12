"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Menu, Plus, MessageSquare, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.content, 
          history: messages // Envia histórico para contexto
        }),
      });

      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      const botMessage: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Erro ao conectar com a IA. Verifique as credenciais." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gpt-dark text-gpt-text font-sans overflow-hidden">
      {/* Sidebar (Estilo Gemini/ChatGPT) */}
      <div className={`${isSidebarOpen ? "w-[260px]" : "w-0"} bg-gpt-sidebar transition-all duration-300 ease-in-out flex flex-col border-r border-gray-700/50 relative`}>
        <div className="p-3">
          <button onClick={() => setMessages([])} className="flex items-center gap-3 w-full px-3 py-3 rounded-md border border-gray-600 hover:bg-gpt-hover transition-colors text-sm text-white">
            <Plus size={16} />
            Nova Conversa
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Histórico</div>
          {/* Exemplo de histórico estático */}
          <div className="flex items-center gap-3 px-3 py-3 text-sm text-gray-100 hover:bg-gpt-hover rounded-md cursor-pointer truncate">
            <MessageSquare size={16} />
            <span className="truncate">Resumo da API Cris</span>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header Mobile/Toggle */}
        <div className="sticky top-0 p-4 text-gray-300 z-10 flex items-center gap-2">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gpt-hover rounded-md">
             <Menu size={20} />
           </button>
           <span className="font-medium text-gpt-text">Cris AI Chat</span>
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
              <div className="bg-gpt-green/20 p-4 rounded-full mb-6">
                 <Bot size={48} className="text-gpt-green" />
              </div>
              <h1 className="text-4xl font-semibold mb-2">Como posso ajudar?</h1>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-32">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "assistant" ? "bg-[#444654]/0" : ""} p-4 rounded-xl`}>
                  <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-gpt-green" : "bg-purple-600"}`}>
                    {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="prose prose-invert max-w-none leading-7">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex gap-4 p-4 animate-pulse">
                   <div className="w-8 h-8 bg-gpt-green rounded-sm flex items-center justify-center"><Bot size={20}/></div>
                   <div className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span></div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area (Estilo Gemini - Bottom Center Floating) */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gpt-dark via-gpt-dark to-transparent">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gpt-input p-3 rounded-2xl shadow-lg border border-gray-600/50 focus-within:border-gray-500 transition-colors">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Envie uma mensagem para a Cris AI..."
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 px-2 py-1 max-h-32 resize-none"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className={`p-2 rounded-lg transition-all ${input.trim() ? "bg-gpt-green text-white" : "bg-transparent text-gray-400 cursor-not-allowed"}`}
              >
                <Send size={18} />
              </button>
            </form>
            <div className="text-center mt-2 text-xs text-gray-500">
              A IA pode gerar informações imprecisas. Verifique detalhes importantes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
