import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, UserRole } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== UserRole.STUDENTE) {
      navigate('/');
      return;
    }

    const fetchTickets = async () => {
      try {
        const data = await api.wallet.getMyTickets(user._id);
        setTickets(data);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-8">My Wallet</h1>
        
        {loading ? (
            <div className="text-center py-12">Loading tickets...</div>
        ) : tickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">You haven't purchased any tickets yet.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="text-indigo-600 font-semibold hover:underline"
                >
                    Browse Events
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                {tickets.map(ticket => (
                    <div key={ticket._id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-gray-100">
                        {/* Event Info Left */}
                        <div className="p-6 flex-1 relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.event.title}</h3>
                                <div className="flex items-center text-gray-600 text-sm mb-2">
                                    <Calendar className="w-4 h-4 mr-2 text-indigo-500"/>
                                    {new Date(ticket.event.date).toLocaleDateString()} at {ticket.event.time}
                                </div>
                                <div className="flex items-center text-gray-600 text-sm mb-4">
                                    <MapPin className="w-4 h-4 mr-2 text-indigo-500"/>
                                    {ticket.event.location}
                                </div>
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md font-semibold">
                                    PAID • {ticket.ticketHolderName}
                                </span>
                            </div>
                        </div>

                        {/* QR Code Right (or Bottom) */}
                        <div className="bg-gray-900 p-6 flex flex-col items-center justify-center md:border-l border-gray-200 min-w-[200px]">
                            <div className="bg-white p-3 rounded-lg">
                                <QRCodeSVG value={ticket.qrCodeId} size={100} />
                            </div>
                            <p className="text-gray-400 text-xs mt-3 text-center font-mono">{ticket.qrCodeId}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;