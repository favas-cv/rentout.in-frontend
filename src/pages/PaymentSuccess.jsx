import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl text-center border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Payment Successful!</h1>
        <p className="text-slate-500 mb-8">
          Your order has been placed and payment was successfully processed. Thank you for choosing Rentout!
        </p>
        <Link 
          to="/profile" 
          className="block w-full bg-[#635465] text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#635465]/30"
        >
          View My Orders
        </Link>
        <Link 
          to="/" 
          className="block w-full mt-4 text-[#635465] font-bold py-4 hover:bg-slate-50 rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
