import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCheckoutSummary, checkAvailability, createReservation, createRazorpayOrder, verifyPayment } from '../services/bookingService';
import { selectCurrentUser } from '../store/authSlice';
import AddressSelection from '../components/AddressSelection';
import { ShieldCheck, Calendar, AlertCircle, CheckCircle2, CreditCard, Clock, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  // Blocked users cannot access checkout
  if (currentUser?.is_live === false) {
    return <Navigate to="/profile" replace />;
  }

  const [step, setStep] = useState('details'); // 'details' | 'payment'
  const [dates, setDates] = useState({}); // { cart_id: { start_date: '', end_date: '', available: null, loading: false, error: null } }
  const [reservationData, setReservationData] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['checkout-summary'],
    queryFn: getCheckoutSummary,
  });

  // Countdown timer for reservation
  useEffect(() => {
    if (step === 'payment' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      toast.error('Reservation expired. Please try again.');
      setStep('details');
      setTimeLeft(600);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkMutation = useMutation({
    mutationFn: checkAvailability,
    onSuccess: (data, variables) => {
      setDates(prev => ({
        ...prev,
        [variables.cart_id]: { 
          ...prev[variables.cart_id],
          available: data.available,
          loading: false,
          error: data.available ? null : (data.error || 'Not available for selected dates'),
          pricingDetails: data.available ? data : null
        }
      }));
    },
    onError: (err, variables) => {
      setDates(prev => ({
        ...prev,
        [variables.cart_id]: {
          ...prev[variables.cart_id],
          available: false,
          loading: false,
          error: 'Error checking availability'
        }
      }));
    }
  });

  const reserveMutation = useMutation({
    mutationFn: (variables) => createReservation(variables.items, variables.address_id),
    onSuccess: (data) => {
      // API may return 200 with an error field in the body
      if (data?.error) {
        const errorMsg = data.error;
        setReservationError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      setReservationError(null);
      setReservationData(data);
      setStep('payment');
      setTimeLeft(600);
      toast.success('Items reserved for 10 minutes!');
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to create reservation';
      setReservationError(errorMsg);
      toast.error(errorMsg);
    }
  });

  const handleDateChange = (cart_id, field, value) => {
    const updatedDates = {
      ...dates,
      [cart_id]: {
        ...dates[cart_id],
        [field]: value,
        available: null,
        error: null
      }
    };
    setDates(updatedDates);

    const itemDates = updatedDates[cart_id];
    if (itemDates.start_date && itemDates.end_date) {
      setDates(prev => ({
        ...prev,
        [cart_id]: { ...prev[cart_id], loading: true }
      }));
      checkMutation.mutate({
        cart_id,
        start_date: itemDates.start_date,
        end_date: itemDates.end_date
      });
    }
  };

  const handleConfirmBooking = () => {
    setReservationError(null); // Clear previous error on retry
    const reservationItems = items.map(item => ({
      cart_id: item.cart_id,
      start_date: dates[item.cart_id].start_date,
      end_date: dates[item.cart_id].end_date
    }));
    reserveMutation.mutate({ items: reservationItems, address_id: selectedAddressId });
  };

  const verifyPaymentMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: (data) => {
      if (data?.error) {
        console.log("verifyPayment returned error in data:", data.error);
        toast.error(data.error, { duration: 10000 });
        setStep('details');
        return;
      }
      toast.success('Payment verified successfully!');
      navigate('/payment-success');
    },
    onError: (err) => {
      console.error("verifyPayment returned error in onError:", err);
      let errorMsg = 'Payment verification failed. Please contact support.';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (typeof err.response?.data === 'string') {
        errorMsg = err.response.data;
      }
      toast.error(errorMsg, {
        duration: 10000,
        position: 'top-center'
      });
      setStep('details');
    }
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!reservationData?.reservation_ids) return;

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // 1. Create order on backend
      const orderData = await createRazorpayOrder(reservationData.reservation_ids);

      // 2. Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SEkDvvj5ubBTPS', 
        amount: orderData.amount, // amount from backend
        currency: orderData.currency || "INR",
        name: "Rentout.in",
        description: "Rental Payment",
        order_id: orderData.order_id || orderData.id, 
        handler: async function (response) {
          // 3. Verify payment on backend
          try {
            await verifyPaymentMutation.mutateAsync({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              reservation_ids: reservationData.reservation_ids
            });
          } catch (err) {
            console.error('Payment verification failed:', err);
          }
        },
        theme: {
          color: "#635465"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
      });
      paymentObject.open();
    } catch (error) {
      toast.error('Could not initiate payment. Please try again.');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#635465]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10 text-red-500 font-medium">
        Failed to load checkout summary. Please try again.
      </div>
    );
  }

  const allAvailable = items?.length > 0 && items?.every(item => dates[item.cart_id]?.available === true);

  const totals = items?.reduce((acc, item) => {
    const pricing = dates[item.cart_id]?.pricingDetails;
    if (pricing && dates[item.cart_id]?.available) {
      acc.rent += pricing.rent || 0;
      acc.deposit += pricing.deposit || 0;
      acc.tax += pricing.tax || 0;
      acc.convenience += pricing.convenience || 0;
      acc.delivery += pricing.delivery || 0;
      acc.grand_total += pricing.grand_total || 0;
    }
    return acc;
  }, { rent: 0, deposit: 0, tax: 0, convenience: 0, delivery: 0, grand_total: 0 });

  // ── Step 1: Details View ──
  if (step === 'details') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 bg-[#F8FAFC]">
        {/* Progress Bar */}
        <div className="flex justify-center items-center gap-8 mb-12">
          <div className="flex items-center gap-2 border-b-2 border-slate-800 pb-1">
            <span className="bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
            <span className="font-bold text-slate-800">Reservation</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="border border-slate-300 rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
            <span>Payment</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-8 text-center italic">Finalize Your Rental</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {items?.map((item) => (
              <div key={item.cart_id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 flex flex-col md:flex-row gap-6">
                {/* Product Image */}
                <div className="w-full md:w-32 h-40 md:h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50">
                  <img
                    src={item.image || '/placeholder.jpg'}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-black text-xl text-slate-900 tracking-tight leading-tight">
                        {item.product_name}
                      </h3>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Qty</span>
                          <span className="text-xs font-black text-slate-700">{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Min</span>
                          <span className="text-xs font-black text-slate-700">{item.min_days} Days</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-2xl font-black text-[#635465]">₹{item.price_per_day}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/day</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Deposit: ₹{item.deposit.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Start Date</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-[#635465]/10 focus:border-[#635465] outline-none transition-all"
                          onChange={(e) => handleDateChange(item.cart_id, 'start_date', e.target.value)}
                          value={dates[item.cart_id]?.start_date || ''}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">End Date</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-[#635465]/10 focus:border-[#635465] outline-none transition-all"
                          onChange={(e) => handleDateChange(item.cart_id, 'end_date', e.target.value)}
                          value={dates[item.cart_id]?.end_date || ''}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {dates[item.cart_id]?.loading && (
                        <div className="flex items-center gap-2 text-xs text-blue-500 font-bold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          Checking availability...
                        </div>
                      )}
                      {dates[item.cart_id]?.available === true && (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-black bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                          <CheckCircle2 size={14} /> Available
                        </div>
                      )}
                      {dates[item.cart_id]?.error && (
                        <div className="flex items-center gap-2 text-xs text-red-500 font-black bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse">
                          <AlertCircle size={14} /> {dates[item.cart_id].error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <AddressSelection 
              selectedAddressId={selectedAddressId} 
              setSelectedAddressId={setSelectedAddressId} 
              allAvailable={allAvailable} 
            />
          </div>

          <div className="space-y-6">
            <div className="bg-[#635465] text-white rounded-2xl p-8 shadow-xl sticky top-24">
              <h3 className="text-xl font-bold mb-6">Booking Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm opacity-80">
                  <span>Items</span>
                  <span>{items?.length}</span>
                </div>
                {allAvailable ? (
                  <>
                    <div className="flex justify-between text-sm opacity-80">
                      <span>Total Rent</span>
                      <span>₹{totals.rent?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm opacity-80">
                      <span>Total Security Deposit</span>
                      <span>₹{totals.deposit?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm opacity-80">
                      <span>Tax</span>
                      <span>₹{totals.tax?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm opacity-80">
                      <span>Convenience Fee</span>
                      <span>₹{totals.convenience?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-white/20">
                      <span>Grand Total</span>
                      <span>₹{totals.grand_total?.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Total Security Deposit</span>
                    <span>₹{items?.reduce((acc, curr) => acc + curr.deposit, 0)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6 mb-8">
                <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Proceed to lock items</p>
                <h2 className="text-4xl font-black text-white italic">Confirm Booking</h2>
              </div>

              {allAvailable && selectedAddressId ? (
  <button
    onClick={handleConfirmBooking}
    disabled={reserveMutation.isPending}
    className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-white text-[#635465] hover:scale-[1.02]"
  >
    {reserveMutation.isPending ? (
      <div className="w-5 h-5 border-2 border-[#635465] border-t-transparent rounded-full animate-spin" />
    ) : (
      <ShieldCheck size={20} />
    )}
    Confirm & Reserve
  </button>
) : (
  <div className="text-center text-sm text-red-600 font-medium">
    Please remove unavailable items before proceeding to checkout.
  </div>
)}

{reservationError && (
  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-bold text-red-700">Reservation Failed</p>
      <p className="text-sm text-red-600 mt-1">{reservationError}</p>
    </div>
  </div>
)}

              {(!allAvailable || (allAvailable && !selectedAddressId)) && (
                <p className="text-[10px] text-center mt-4 text-white/60">
                  {allAvailable ? 'Select an address to proceed.' : 'Select valid dates for all items to proceed.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Payment View ──
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 min-h-screen bg-[#F8FAFC]">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setStep('details')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-black text-slate-900">Payment</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Details & Timer */}
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-amber-800">Reservation Expires Soon</h3>
              <p className="text-sm text-amber-700 mb-3">Your items are locked. Please complete the payment within the time limit.</p>
              <div className="text-3xl font-black text-amber-600 tabular-nums">{formatTime(timeLeft)}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Payment Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-500">
                <span>Total Rent</span>
                <span className="font-bold text-slate-800">₹{reservationData?.rent?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Security Deposit (Refundable)</span>
                <span className="font-bold text-slate-800">₹{reservationData?.deposit?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span className="font-bold text-slate-800">₹{reservationData?.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Convenience Fee</span>
                <span className="font-bold text-slate-800">₹{reservationData?.convenience?.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-50 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800">Total Payable</span>
                <span className="text-3xl font-black text-[#635465]">₹{reservationData?.grand_total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Method */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col justify-center">

            <button
              onClick={handlePayment}
              disabled={verifyPaymentMutation.isPending}
              className="w-full bg-[#635465] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#635465]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {verifyPaymentMutation.isPending ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                `PAY ₹${reservationData?.grand_total?.toFixed(2)} NOW`
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
              Secure 256-bit SSL Encrypted Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
