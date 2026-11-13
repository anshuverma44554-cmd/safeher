import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  User as UserIcon,
  Send,
  AlertTriangle,
  Languages,
  BookOpen,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useEmergency } from '../context/EmergencyContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiSafetyPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome to the **SafeHer AI Travel Copilot** powered by Google Gemini! 🛡️

I am here to guide solo women travellers with reliable, immediate safety advice. Ask me anything about:
• **Area Safety Assessments** in unfamiliar cities
• **Night Travel Strategies** & safe public transportation choices
• **Cab / Taxi Verification** checklist
• **Hotel Room Security** measures
• **Emergency Language Translations**

How can I help keep your journey secure today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [phrases, setPhrases] = useState<any[]>([]);
  const { openConfirmModal } = useEmergency();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load language phrasebook
  useEffect(() => {
    const fetchPhrases = async () => {
      const res = await api.getQuickPhrases(selectedLanguage);
      if (res.success) setPhrases(res.phrases);
    };
    fetchPhrases();
  }, [selectedLanguage]);

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: query };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.chatWithAi(
        updated.map(m => ({ role: m.role, content: m.content })),
        { lat: 28.6315, lng: 77.2167, city: 'Delhi / NCR' },
        false
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.response }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered an issue connecting to the AI backend. For immediate emergency assistance, please call 112 or use the red SOS button.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 rounded-3xl p-8 text-white space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Google Gemini API Integration • Backend Connected</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          AI Travel Safety Copilot
        </h1>
        <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
          Trained specifically on women's solo travel security protocols, situational awareness, and de-escalation strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chat Area (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-purple-700" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-purple-700 text-white rounded-br-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-700 flex items-center justify-center shrink-0 mt-0.5 text-white">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-slate-500">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-700 animate-spin" />
                </div>
                <span className="italic">SafeHer AI is analyzing safety guidance...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about neighborhood safety, taxi checks, hotel security..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-2xl transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Sidebar: Emergency Phrasebook & Presets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Prompts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Suggested Inquiries</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[
                'Is Connaught Place safe around 10 PM?',
                'What should I check before getting into a cab?',
                'Hotel room safety checklist for solo women',
                'What are the local emergency numbers in Delhi?'
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-slate-700 hover:text-purple-700 transition-colors flex items-center justify-between gap-2"
                >
                  <span className="truncate">{q}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Multilingual Emergency Phrasebook */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-600" />
                <span>Emergency Phrasebook</span>
              </h3>

              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-semibold text-slate-700"
              >
                <option value="hi">Hindi (हिंदी)</option>
                <option value="fr">French (Français)</option>
                <option value="es">Spanish (Español)</option>
              </select>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
              {phrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs space-y-1"
                >
                  <div className="font-bold text-purple-950">
                    "{phrase.english}"
                  </div>
                  <div className="font-semibold text-purple-800 text-sm">
                    {phrase.localized}
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    Phonetic: {phrase.phonetic}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency SOS Shortcut */}
          <div className="p-5 bg-red-50 rounded-3xl border border-red-200 text-center space-y-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
            <div>
              <h4 className="font-extrabold text-sm text-red-950">Immediate Danger?</h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                Never rely solely on AI during urgent threats.
              </p>
            </div>
            <button
              onClick={openConfirmModal}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm"
            >
              Trigger Emergency SOS
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

