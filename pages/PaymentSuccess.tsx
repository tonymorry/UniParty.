import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const finalize = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (sessionId && user) {
        try {
           await api.payments.verifyPayment(sessionId);
           setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
      } else {
         const eventId = searchParams.get('eventId') || searchParams.get('free_order_id');
         if(eventId) {
             setStatus('success');
         } else {
             navigate('/');
         }
      }
    };

    if(user) finalize();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-deep p-4">
        <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/10 animate-in fade-in zoom-in duration-500">
            {status === 'processing' && (
                <div className="space-y-6">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Finalizing order...</h2>
                    <p className="text-gray-500 font-medium">Please do not close this window.</p>
                </div>
            )}
            
            {status === 'success' && (
                <div className="space-y-8">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white mb-3 tracking-tighter">Success!</h2>
                        <p className="text-gray-400 font-medium">Your vouchers have been issued and sent to your email.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/wallet')}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95"
                    >
                        Go to My Wallet
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-8">
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Something went wrong</h2>
                        <p className="text-gray-400 font-medium">We couldn't verify your payment instantly. Please check your email or contact support.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl transition-all border border-white/10"
                    >
                        Return Home
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default PaymentSuccess;