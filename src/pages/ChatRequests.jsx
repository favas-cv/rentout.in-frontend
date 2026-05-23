import React from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { selectCurrentUser } from '../store/authSlice';
import { fetchMyRequests, updateChatRequest } from '../services/ownerChatService';
import { MessageSquare, Check, X, Clock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * Decode user_id from the stored JWT access token as a fallback.
 */
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.user_id ?? payload.id ?? payload.sub);
  } catch (err) {
    return null;
  }
};

const ChatRequests = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  // Robust ID extraction: Redux -> JWT Fallback
  const currentUserId =
    (currentUser?.id != null ? Number(currentUser.id) : null) ??
    (currentUser?.pk != null ? Number(currentUser.pk) : null) ??
    getUserIdFromToken();

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ['chat-requests'],
    queryFn: fetchMyRequests,
  });

  const chatRequests = Array.isArray(requests)
    ? requests
    : (requests?.results ?? []);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => updateChatRequest(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-requests'] });
      if (variables.status === 'accepted') {
        toast.success('Chat accepted!');
        // Use the room_id returned by the backend upon acceptance
        const roomId = data.room_id || data.room;
        if (roomId) {
          navigate(`/chat/${roomId}`);
        }
      } else {
        toast.info('Request rejected');
      }
    },
    onError: () => toast.error('Failed to update request'),
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#635465]" />
    </div>
  );

  if (isError) return (
    <div className="flex justify-center items-center h-96 text-red-400 font-medium">
      Failed to load requests. Please try again.
    </div>
  );

  if (chatRequests.length === 0) return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeader />
      <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
        <Clock className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-slate-400 font-medium">No requests yet.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeader />
      <div className="grid gap-4">
        {chatRequests.map((req) => {
          const senderId   = Number(req.sender);
          const receiverId = Number(req.receiver);

          const iAmReceiver = currentUserId !== null && receiverId === currentUserId;

          // WhatsApp style: Show the name of the OTHER person
          // If I am NOT the receiver, I am the sender -> show receiver details
          const otherName = !iAmReceiver
            ? (req.receiver_details?.username || `User #${receiverId}`)
            : (req.sender_details?.username   || `User #${senderId}`);

          const isMutating =
            updateMutation.isPending && updateMutation.variables?.id === req.id;

          return (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              {/* Status Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                  iAmReceiver ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {iAmReceiver ? '📥 Incoming' : '📤 Sent'}
                </span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                  req.status === 'accepted' ? 'bg-green-50 text-green-600' :
                  req.status === 'pending'  ? 'bg-amber-50 text-amber-600' :
                                              'bg-red-50 text-red-600'
                }`}>
                  {req.status}
                </span>
              </div>

              {/* Main Content Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#635465]/10 rounded-full flex items-center justify-center text-[#635465]">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{otherName}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {new Date(req.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}{' · '}
                      {new Date(req.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Accept / Reject — ONLY for the receiver while pending */}
                  {iAmReceiver && req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateMutation.mutate({ id: req.id, status: 'accepted' })}
                        disabled={isMutating}
                        className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => updateMutation.mutate({ id: req.id, status: 'rejected' })}
                        disabled={isMutating}
                        className="flex items-center gap-1.5 bg-red-400 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}

                  {/* Open Chat — both parties, once accepted */}
                  {req.status === 'accepted' && (
                    <button
                      onClick={() => {
                        if (!req.room) {
                          toast.warning("Room ID missing for this chat.");
                          return;
                        }
                        navigate(`/chat/${req.room}`);
                      }}
                      className="flex items-center gap-1.5 bg-[#635465] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#4e4151] active:scale-95 transition-all"
                    >
                      <MessageSquare size={14} /> Open Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PageHeader = () => (
  <div className="flex items-center gap-3 mb-8">
    <MessageSquare className="text-[#635465]" size={28} />
    <h1 className="text-3xl font-black text-slate-900 italic">Chat Requests</h1>
  </div>
);

export default ChatRequests;
