import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bot, Sparkles, Send, TrendingUp, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInvest } from '../context/InvestContext';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { investments } = useInvest();

  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello ${user?.username || 'Investor'}! I am **Hens Bedo AI**, your intelligent portfolio advisor. Based on your current wallet balance (Rs ${user?.balance.toLocaleString()}) and active plans (${investments.length}), how can I assist your strategy today?`,
    },
  ]);

  const handleSend = async (customText?: string) => {
    const query = customText || prompt;
    if (!query.trim()) return;

    const newMessages = [...messages, { sender: 'user' as const, text: query }];
    setMessages(newMessages);
    if (!customText) setPrompt('');
    setLoading(true);

    try {
      // Call server API route /api/ai-insights or generate smart response
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          userContext: {
            username: user?.username,
            balance: user?.balance,
            activeInvestments: investments,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        // Fallback intelligent response if server offline
        setTimeout(() => {
          let reply = `Based on your profile, I recommend considering a balanced re-allocation. `;
          if (query.toLowerCase().includes('plan') || query.toLowerCase().includes('recommend')) {
            reply = `For your balance of **Rs ${user?.balance.toLocaleString()}**, **Plan 02 (Growth)** or **Plan 03 (Premium Growth)** provides an optimal blend of daily liquidity (Rs 255 - Rs 566/day) with a steady 77-day compound return.`;
          } else if (query.toLowerCase().includes('withdraw') || query.toLowerCase().includes('payout')) {
            reply = `Withdrawals are processed free of charge via EasyPaisa, JazzCash, or Meezan Bank. Always make sure your account title matches your ID.`;
          } else if (query.toLowerCase().includes('referral') || query.toLowerCase().includes('team')) {
            reply = `Your Tier 1 referral bonus yields **18%** of every plan purchase made by your network! Sharing your link **${user?.referralCode}** is the fastest way to compound capital without extra principal.`;
          } else {
            reply = `Hens Bedo uses institutional risk-weighted pools to generate consistent daily yields across all 14 plan tiers. Let me know if you need a yield breakdown for a specific target!`;
          }
          setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
        }, 800);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Hens Bedo AI Strategy Advice: To maximize your 77-day cycle, re-investing your daily payouts into Plan 01 or Plan 02 builds compounding velocity!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg h-[80vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-900 text-white dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    Hens Bedo AI Assistant <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Smart Financial & Yield Analytics</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto dark:bg-slate-800/50 dark:border-slate-800">
              {[
                'Best plan for my balance?',
                'How does referral 18% work?',
                'Yield compounding strategy',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap hover:border-blue-500 hover:text-blue-600 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-2xl text-slate-500 text-xs flex items-center gap-2 dark:bg-slate-800 dark:text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    Analyzing market parameters...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask Hens Bedo AI anything about plans or ROI..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50 hover:bg-blue-700 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
