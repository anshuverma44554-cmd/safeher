import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Shield,
  PhoneCall
} from 'lucide-react';
import { api } from '../../services/api';
import { useEmergency } from '../../context/EmergencyContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isAiGenerated?: boolean;
}

export const AiAssistantDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const { openConfirmModal } = useEmergency();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am **SafeHer AI**, your solo travel safety copilot powered by Google Gemini.

I can help you with:
• **Neighborhood Safety Advice** (e.g. night travel precautions, transit options)
• **Emergency Phrasebook** (translations into Hindi, French, Spanish, etc.)
• **In-Transit Guidance** (taxi/cab safety checks, hotel room security)
• **Local Emergency Resources**

How can I assist your safe journey today?`,
      isAiGenerated: true,
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.chatWithAi(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        { lat: 28.6315, lng: 77.2167, city: 'Delhi / NCR' },
        isEmergencyMode
      );

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.response,
          isAiGenerated: res.isAiGenerated,
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered a temporary connection issue. If you are in immediate danger, please dial 112 or press the red Emergency SOS button.',
          isAiGenerated: false,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Is Connaught Place safe around 10 PM?',
    'What should I check before boarding a night cab?',
    'Emergency phrases in Hindi for help',
    'Hotel room security essentials for solo women',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-purple-500/35 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group border border-white/60 backdrop-blur-md"
          title="Open SafeHer AI Travel Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-purple-700"></span>
          </div>
          <span className="font-extrabold text-xs sm:text-sm tracking-wide">
            Ask Safety AI
          </span>
        </button>
      )}

      {/* Slide-out Drawer - Dark OLED Theme */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#0B0F19] shadow-2xl border-l border-purple-900/40 flex flex-col animate-in slide-in-from-right duration-200 text-slate-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 text-white flex items-center justify-between border-b border-purple-900/40 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white">SafeHer AI Copilot</span>
                  <span className="bg-purple-900/80 text-[9px] font-black px-1.5 py-0.5 rounded text-purple-300 border border-purple-600/50">
                    GEMINI
                  </span>
                </div>
                <p className="text-[10px] text-purple-300">
                  Real-time Women Solo Travel Safety Advice
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Emergency Crisis Mode Switch */}
          <div className="px-4 py-2 bg-[#0D121F] border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className={`w-3.5 h-3.5 ${isEmergencyMode ? 'text-red-400' : 'text-slate-500'}`} />
              <span className={`font-semibold ${isEmergencyMode ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                Emergency Priority Mode
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEmergencyMode(!isEmergencyMode)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                isEmergencyMode ? 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-800'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  isEmergencyMode ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center shrink-0 mt-0.5 text-purple-300">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-purple-600/20'
                      : 'bg-[#0D121F] border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-white">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-purple-300">
                <div className="w-7 h-7 rounded-lg bg-purple-950 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-400 animate-spin" />
                </div>
                <span className="italic">SafeHer AI is synthesizing safety advice...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2 bg-[#090D16] border-t border-slate-800/80 overflow-x-auto flex gap-1.5 text-[11px]">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-lg bg-[#0D121F] border border-slate-800 text-slate-300 hover:text-purple-300 hover:border-purple-600/60 whitespace-nowrap transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#0B0F19] border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={isEmergencyMode ? 'Describe your emergency immediately...' : 'Ask about area safety, cabs, phrases...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 text-xs bg-[#0D121F] border border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-purple-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>Safety Advice Powered by Gemini</span>
              <button
                onClick={openConfirmModal}
                className="text-red-400 font-bold hover:underline flex items-center gap-0.5"
              >
                <AlertTriangle className="w-3 h-3" />
                Trigger SOS
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

