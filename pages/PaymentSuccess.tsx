import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const finalize = async () => {
      const eventId = searchParams.get('eventId');
      const quantity = parseInt(searchParams.get('quantity') || '0');
      const namesParam = searchParams.get('names');
      const prListParam = searchParams.get('prList'); // Get the chosen PR List
      
      let ticketNames: string[] = [];
      try {
          if(namesParam) {
              ticketNames = JSON.parse(decodeURIComponent(namesParam));
          }
      } catch(e) {
          console.error("Failed to parse ticket names");
      }

      const prListName = prListParam ? decodeURIComponent(prListParam) : "Nessuna lista";

      if (eventId && quantity > 0 && user) {
        try {
           // Manually triggering the "webhook" logic since this is a frontend-only demo
           await api.payments.mockWebhookSuccess(eventId, quantity, user._id, ticketNames, prListName);
           
           setTimeout(() => {
               setProcessing(false);
           }, 1500); // Fake processing delay
        } catch (e) {
            console.error(e);
            navigate('/');
        }
      } else {
          navigate('/');
      }
    };

    finalize();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            {processing ? (
                <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                    <h2 className="text-xl font-bold text-gray-900">Finalizing your order...</h2>
                    <p className="text-gray-500">Please do not close this window.</p>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
                        <p className="text-gray-600">Your tickets have been issued and are waiting in your wallet.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/wallet')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition"
                    >
                        Go to My Wallet
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default PaymentSuccess;