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
      
      // If we are in real mode, we MUST have a session_id from Stripe
      if (sessionId && user) {
        try {
           await api.payments.verifyPayment(sessionId);
           setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
      } else {
         // Fallback for Mock Mode testing if url params present
         const eventId = searchParams.get('eventId');
         if(eventId) {
             // Mock mode logic
             setStatus('success');
         } else {
             navigate('/');
         }
      }
    };

    if(user) finalize();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            {status === 'processing' && (
                <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                    <h2 className="text-xl font-bold text-gray-900">Finalizing your order...</h2>
                    <p className="text-gray-500">Please do not close this window.</p>
                </div>
            )}
            
            {status === 'success' && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
                        <p className="text-gray-600">Your tickets have been issued and sent to your email.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/wallet')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition"
                    >
                        Go to My Wallet
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-600">We couldn't verify your payment instantly. Please check your email or contact support.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-lg transition"
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