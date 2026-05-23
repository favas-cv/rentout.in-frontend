import React, { useState } from 'react';
import { Bell, Check, Trash2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notificationsData, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
        const res = await api.get('/notifications/');
        return res.data;
    },
  });

  const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.results ?? []);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
        await api.patch('/notifications/read-all/');
        refetch();
    } catch (err) {
        console.error('Failed to mark all as read', err);
    }
  };

  const markSingleRead = async (id) => {
    try {
        await api.patch(`/notifications/${id}/read/`);
        refetch();
    } catch (err) {
        console.error('Failed to mark notification as read', err);
    }
  };

  const removeNotification = async (id) => {
    // Backend dependent logic (e.g. DELETE /notifications/id/)
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-2xl transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[8px] text-white font-black">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800 z-[100] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Notifications</h3>
                <button 
                  onClick={markAllRead}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                {notifications.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <Bell size={40} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[1.8rem] transition-all group relative mb-1 flex items-center justify-between gap-4 ${!n.is_read ? 'bg-indigo-50/40 border border-indigo-100/50' : 'opacity-60'}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          n.notification_type === 'MESSAGE' ? 'bg-indigo-100 text-indigo-600' :
                          n.notification_type === 'ORDER' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {n.notification_type === 'MESSAGE' ? <MessageCircle size={18} /> : <Check size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold text-sm ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{n.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed line-clamp-2 ${!n.is_read ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{n.message}</p>
                        </div>
                      </div>
                      
                      {!n.is_read && (
                        <div className="flex flex-col gap-2">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-sm shadow-indigo-200 self-end" />
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                markSingleRead(n.id);
                            }}
                            className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95 transition-all"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-50 dark:border-slate-800 text-center">
                <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">
                  View all history
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
