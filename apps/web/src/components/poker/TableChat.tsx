'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, ChevronDown } from 'lucide-react';

interface ChatMessage {
  id?: string;
  odiserId?: string;
  username: string;
  message: string;
  timestamp: number;
  type?: 'chat' | 'system' | 'action';
}

interface TableChatProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function TableChat({ messages, onSend, isOpen = true, onToggle }: TableChatProps) {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={onToggle}
        className="fixed bottom-4 right-4 w-12 h-12 bg-[#0d1320] border border-gray-700/50 rounded-full flex items-center justify-center hover:border-[#00ff88]/50 transition-all shadow-lg"
      >
        <MessageCircle className="w-5 h-5 text-[#00ff88]" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00ff88] text-[#0a0e17] text-xs font-bold rounded-full flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0d1320]/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden transition-all ${
        isMinimized ? 'h-12' : 'h-80'
      } w-80`}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-[#1a1f2e] cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#00ff88]" />
          <span className="text-white font-medium text-sm">Table Chat</span>
          <span className="text-gray-500 text-xs">({messages.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isMinimized ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
          {onToggle && (
            <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="hover:text-red-400">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col h-[calc(100%-48px)]"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-sm ${msg.type === 'system' ? 'text-center' : ''}`}
                  >
                    {msg.type === 'system' ? (
                      <span className="text-gray-500 italic text-xs">{msg.message}</span>
                    ) : msg.type === 'action' ? (
                      <span className="text-[#ffd700] text-xs">
                        <span className="font-medium">{msg.username}</span> {msg.message}
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[#00ff88] font-medium text-xs">{msg.username}</span>
                          <span className="text-gray-600 text-[10px]">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-gray-300 break-words">{msg.message}</p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-700/50">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  maxLength={200}
                  className="flex-1 px-3 py-2 bg-[#0a0e17] border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:border-[#00ff88]/50 focus:outline-none transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="px-4 py-2 bg-[#00ff88] hover:bg-[#00dd77] disabled:bg-gray-700 disabled:text-gray-500 text-[#0a0e17] rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
