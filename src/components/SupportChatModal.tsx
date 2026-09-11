import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import {
  X,
  Bot,
  Send,
  Sparkles,
  Loader2,
  HelpCircle,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  "How to pay with OPay or PalmPay?",
  "How does receipt approval work?",
  "How can I track my transactions?",
  "What is needed for seller verification?",
  "Details on the Lv.62 ❝Linx account",
];

export const SupportChatModal: React.FC = () => {
  const { isSupportChatOpen, setIsSupportChatOpen, showToast, setIsTransactionsModalOpen } = useApp();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_welcome",
      sender: "bot",
      text: "👋 Hi! I am RAY Support AI powered by Gemini. I can assist you with payment accounts (OPay & PalmPay), transfer receipt verification, tracking pending/confirmed orders, and seller verification (No NIN required!). How can I help you?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isSupportChatOpen) {
      scrollToBottom();
    }
  }, [messages, isSupportChatOpen]);

  if (!isSupportChatOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history format
      const history = messages
        .filter((m) => m.id !== "msg_welcome")
        .slice(-6)
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          parts: m.text,
        }));

      const res = await api.askSupportAssistant(textToSend, history);

      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `bot_err_${Date.now()}`,
        sender: "bot",
        text: "I'm having trouble connecting right now. Official payment info: PalmPay (7067252385) or OPay (8081885757). Remember to upload your transfer receipt and wait for the seller to click 'Approve / Seen'!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (account: string, label: string) => {
    navigator.clipboard.writeText(account);
    setCopiedAccount(account);
    showToast(`${label} Account (${account}) copied!`, "success");
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div
      id="support-chat-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsSupportChatOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-[#0f121e] border border-[#262c42] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f253a] bg-[#121524]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121524]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
                  RAY Support AI
                </h3>
                <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/40 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                  Gemini
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Online 24/7 • Instant Escrow & Account Help</p>
            </div>
          </div>
          <button
            onClick={() => setIsSupportChatOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1b2032] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Payment Details Strip */}
        <div className="bg-[#0b0e18] px-4 py-2 border-b border-[#1c2237] flex items-center justify-between text-[11px] gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-gray-400 font-medium">Quick Accounts:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => copyText("7067252385", "PalmPay")}
              className="flex items-center gap-1 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-purple-300 px-2 py-0.5 rounded-lg font-mono text-[10px] transition-colors"
            >
              <span>PalmPay: 7067252385</span>
              {copiedAccount === "7067252385" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
            </button>
            <button
              onClick={() => copyText("8081885757", "OPay")}
              className="flex items-center gap-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 px-2 py-0.5 rounded-lg font-mono text-[10px] transition-colors"
            >
              <span>OPay: 8081885757</span>
              {copiedAccount === "8081885757" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0d16]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white rounded-tr-none shadow-md"
                    : "bg-[#141827] border border-[#232a42] text-gray-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-line break-words">{m.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === "user" ? "text-red-200/80" : "text-gray-500"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#141827] border border-[#232a42] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Gemini is preparing your answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-[#0e1220] border-t border-[#1d2338] flex gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(q)}
              className="text-[10px] whitespace-nowrap px-2.5 py-1.5 rounded-full bg-[#161c2e] hover:bg-[#202842] border border-[#27314d] text-gray-300 hover:text-white transition-colors disabled:opacity-50 shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[#121524] border-t border-[#1f253a] flex items-center gap-2"
        >
          <input
            id="support-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about OPay, PalmPay, receipts, tracking, or verification..."
            disabled={loading}
            className="flex-1 bg-[#0c0f1b] border border-[#232b44] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
          <button
            id="support-chat-send-btn"
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
