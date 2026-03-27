import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, RefreshCcw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getChatModel } from './lib/gemini';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: "Hello! I'm your FAQ assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat model
  useEffect(() => {
    chatRef.current = getChatModel();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = getChatModel();
      }

      const response = await chatRef.current.sendMessage({ message: userMessage.text });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.text || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: "Oops! Something went wrong. Please check your connection or API key.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    chatRef.current = getChatModel();
    setMessages([
      {
        id: Date.now().toString(),
        role: 'bot',
        text: "Chat reset. How can I help you now?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4 font-sans text-[#1a1a1a]">
      {/* Header */}
      <header className="w-full max-w-2xl flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">FAQ Assistant</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Powered by Gemini AI</p>
          </div>
        </div>
        <button 
          onClick={resetChat}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          title="Reset Chat"
        >
          <RefreshCcw className="w-5 h-5 text-gray-400" />
        </button>
      </header>

      {/* Chat Container */}
      <main className="w-full max-w-2xl bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[70vh]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-[20px] ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    <div className="prose prose-sm max-w-none prose-invert">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    <span className={`text-[10px] mt-2 block opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium italic">Assistant is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 p-2 rounded-xl transition-all ${
                !input.trim() || isLoading 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 justify-center">
            <Info className="w-3 h-3" />
            <span>AI can make mistakes. Verify important info.</span>
          </div>
        </div>
      </main>

      {/* Footer / Instructions for local run */}
      <footer className="mt-8 text-center max-w-md">
        <p className="text-xs text-gray-400 leading-relaxed">
          To run this locally in VS Code: <br />
          1. Download the code <br />
          2. Run <code className="bg-gray-200 px-1 rounded">npm install</code> <br />
          3. Create a <code className="bg-gray-200 px-1 rounded">.env</code> file and add <code className="bg-gray-200 px-1 rounded">VITE_GEMINI_API_KEY=your_key</code> <br />
          4. Run <code className="bg-gray-200 px-1 rounded">npm run dev</code>
        </p>
      </footer>
    </div>
  );
}
