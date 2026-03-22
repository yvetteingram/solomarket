import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import Groq from 'groq-sdk';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are SoloMarket's AI Marketing Assistant — a friendly, knowledgeable marketing advisor built specifically for solopreneurs.

Your expertise includes:
- Marketing strategy (positioning, messaging, funnels)
- Social media marketing (LinkedIn, Twitter/X, Facebook, Instagram, TikTok, YouTube, Pinterest, Threads)
- Email marketing and list building
- Content strategy and repurposing
- SEO basics and blogging
- Lead generation and conversion
- Brand voice and storytelling
- Pricing strategy
- Launch planning

Guidelines:
- Keep answers concise and actionable — solopreneurs are busy
- Use bullet points and short paragraphs for readability
- Give specific examples when possible
- If the user asks about something outside marketing, politely redirect them
- Be encouraging — solopreneurs often wear many hats and need confidence
- When suggesting content ideas, be specific to their context
- Don't use excessive emojis — keep it professional but warm`;

const STARTER_SUGGESTIONS = [
  'How do I grow my LinkedIn following as a solopreneur?',
  'What\'s a good launch strategy for a digital product?',
  'Help me write a compelling brand story',
  'What email sequences should I set up first?',
];

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || streaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setStreaming(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      const chatMessages = updatedMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...chatMessages,
        ],
        temperature: 0.7,
        stream: true,
      });

      let fullContent = '';
      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta?.content || '';
        fullContent += delta;
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m)
        );
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, I had trouble responding. Please try again.' }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      <PageHeader
        title="AI Assistant"
        subtitle="Your marketing advisor — ask anything about strategy, content, or growth."
        actions={
          messages.length > 0 ? (
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              <span>Clear Chat</span>
            </button>
          ) : undefined
        }
      />

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={32} className="text-brand" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">How can I help with your marketing?</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-md">
              I can help with strategy, content ideas, social media, email marketing, pricing, launches, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {STARTER_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-sm text-left text-slate-700 hover:border-brand/30 hover:bg-brand/5 transition-all"
                >
                  <Sparkles size={14} className="text-brand inline mr-2" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} className="text-brand" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-brand text-white'
                    : 'bg-white border border-slate-200'
                }`}
              >
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'user' ? 'text-white' : 'text-slate-700'
                }`}>
                  {message.content || (
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-slate-500" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 pt-4 bg-bg-main">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about marketing..."
            rows={1}
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 resize-none max-h-32"
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || streaming}
            className="px-4 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Powered by AI. Responses are suggestions — always use your best judgment.
        </p>
      </div>
    </div>
  );
};
