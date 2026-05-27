import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Minus, Smartphone, Sofa, Tv, ExternalLink, ShoppingCart, CheckCircle2, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { sendMessage, fetchChatHistory } from '../services/chatbotService';
import { addToCart } from '../services/cartService';
import { fetchProductById } from '../services/productService';
import { addItem, selectCartItems } from '../store/cartSlice';
import ChatbotIcon from '../assets/ChatbotIcon.svg?react';

const Chatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  // Get or initialize session key
  const [sessionKey, setSessionKey] = useState(() => localStorage.getItem('chat_session_key'));

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: ({ productId }) => addToCart({ productId }),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      dispatch(addItem(data));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to add to cart';
      toast.error(msg);
    },
  });

  // Load history on mount or when chat is reopened
  useEffect(() => {
    if (sessionKey && isOpen) {
      const loadHistory = async () => {
        try {
          const history = await fetchChatHistory(sessionKey);
          setMessages(history.map(m => ({ 
            text: m.message, 
            isBot: m.role === 'bot' 
          })));
        } catch (err) {
          console.error("Failed to load chat history", err);
        }
      };
      loadHistory();
    } else if (!sessionKey && isOpen && messages.length === 0) {
      // Initial greeting
      setMessages([{ text: "Hi! I'm your Rentout assistant. How can I help you find the right furniture today? 🏠", isBot: true }]);
    }
  }, [sessionKey, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage, sessionKey);
      
      if (response.session_key && !sessionKey) {
        setSessionKey(response.session_key);
        localStorage.setItem('chat_session_key', response.session_key);
      }

      setMessages(prev => [...prev, { 
        text: response.answer, 
        isBot: true,
        products: response.matched_products 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now. Please try again later.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="bg-[#635465] p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl overflow-hidden">
                <ChatbotIcon width={32} height={32} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Rentout Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-medium opacity-80">Always Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  msg.isBot 
                    ? 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100' 
                    : 'bg-[#635465] text-white rounded-tr-none shadow-md shadow-[#635465]/10'
                }`}>
                  {msg.text}

                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                      {msg.products.map((product) => (
                        <ChatProductCard 
                          key={product.product_id || product.id} 
                          product={product} 
                          addToCartMutation={addToCartMutation}
                          cartItems={cartItems}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about furniture..."
              className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#635465]/10 transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-[#635465] text-white p-3 rounded-xl hover:bg-[#524554] disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Docs Floating Button */}
      {location.pathname !== '/docs' && (
        <Link
          to="/docs"
          className="w-16 h-16 bg-[#635465] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 group relative border border-white/10"
          title="Project Docs"
        >
          <BookOpen size={32} className="group-hover:rotate-6 transition-transform" />
          <span className="absolute right-20 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
            Project Docs & Report
          </span>
        </Link>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 flex items-center justify-center text-3xl transition-transform hover:scale-110 active:scale-95 ${
          isOpen ? 'text-slate-400 bg-white shadow-2xl rounded-full' : ''
        }`}
      >
        {isOpen ? <Minus size={28} /> : <ChatbotIcon width={64} height={64} className="scale-125" />}
      </button>
    </div>
  );
};

const ChatProductCard = ({ product, addToCartMutation, cartItems }) => {
  const pid = product.product_id || product.id;
  
  // Fetch full product details if image is missing
  const { data: fullProduct } = useQuery({
    queryKey: ['product-chat', pid],
    queryFn: () => fetchProductById(pid),
    enabled: !!pid && !product.image_url && !product.photo_1 && !product.product_image,
  });

  const displayProduct = fullProduct || product;
  const imageUrl = displayProduct.product_image?.[0]?.image_url || 
                  displayProduct.image_url || 
                  displayProduct.photo_1 || 
                  displayProduct.image;
  
  const isInCart = cartItems?.some(item => (item.product?.id || item.product_id) === Number(pid));
  const isAdding = addToCartMutation.isPending && addToCartMutation.variables?.productId === pid;

  return (
    <div className="flex-shrink-0 w-36 bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 group flex flex-col">
      <Link to={`/products/${pid}`} className="h-20 bg-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={displayProduct.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <Sofa size={24} className="text-slate-300 group-hover:scale-110 transition-transform" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink size={10} className="text-white drop-shadow-md" />
        </div>
      </Link>
      <div className="p-2.5 flex flex-col flex-1">
        <Link to={`/products/${pid}`} className="hover:text-[#635465] transition-colors">
          <h4 className="text-[10px] font-bold text-slate-800 truncate mb-1 capitalize">
            {displayProduct.title}
          </h4>
        </Link>
        
        <p className="text-[9px] text-[#635465] font-bold mb-2">
          ₹{displayProduct.price_per_day}<span className="font-normal opacity-70">/d</span>
        </p>

        <div className="mt-auto pt-2 border-t border-slate-50 flex justify-between items-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (isInCart || isAdding) return;
              addToCartMutation.mutate({ productId: pid });
            }}
            className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all flex items-center gap-1 w-full justify-center ${
              isInCart 
                ? 'bg-green-50 text-green-600' 
                : 'bg-[#635465] text-white hover:bg-[#524554]'
            }`}
          >
            {isAdding ? (
              <Loader2 size={10} className="animate-spin" />
            ) : isInCart ? (
              <>
                <CheckCircle2 size={10} />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart size={10} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
