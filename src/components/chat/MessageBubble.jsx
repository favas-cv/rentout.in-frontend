import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn }) => {
  const isSeen = message.is_seen;
  const isDelivered = message.is_delivered || isSeen;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex w-full mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl relative ${
          isOwn
            ? 'bg-[#635465] text-white rounded-tr-none shadow-sm'
            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
        }`}
      >
        <p className="text-sm font-medium leading-relaxed">{message.content}</p>
        
        <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[9px] font-bold uppercase ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
          </span>
          
          {isOwn && (
            <div className="flex">
              {isSeen ? (
                <CheckCheck size={12} className="text-blue-300" />
              ) : isDelivered ? (
                <CheckCheck size={12} className="text-white/40" />
              ) : (
                <Check size={12} className="text-white/40" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
