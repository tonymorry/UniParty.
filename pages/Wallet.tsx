import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, UserRole } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== UserRole.STUDENTE) {
      navigate('/');
      return;
    }

    const fetchTickets = async () => {
      try {
        const data = await api.wallet.getMyTickets(user._id);
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch tickets", err);
        setError("Errore nel caricamento dei voucher.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user, navigate]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Data non disponibile";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Data non valida";
      return d.toLocaleDateString();
    } catch (e) {
      return "Data non valida";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-8">I Miei Voucher</h1>
        
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-gray-400">Caricamento voucher...</p>
            </div>
        ) : error ? (
            <div className="bg-red-900/20 border border-red-900/30 rounded-xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 font-bold">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-indigo-400 underline font-medium">Riprova</button>
            </div>
        ) : tickets.length === 0 ? (
            <div className="bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-700">
                <p className="text-gray-400 text-lg mb-4">Non hai ancora prenotato nessun evento.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="text-indigo-400 font-semibold hover:underline"
                >
                    Esplora Eventi
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                {tickets.map(ticket => {
                    // Safety check to prevent crash if event data is missing
                    if (!ticket || !ticket.event) return null;

                    return (
                        <div key={ticket._id} className="bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-gray-700">
                            {/* Event Info Left */}
                            <div className="p-6 flex-1 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-900/20 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-white mb-2">{ticket.event?.title || 'Evento senza titolo'}</h3>
                                    <div className="flex items-center text-gray-400 text-sm mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-indigo-500"/>
                                        {formatDate(ticket.event?.date)} {ticket.event?.time ? `alle ${ticket.event.time}` : ''}
                                    </div>
                                    <div className="flex items-center text-gray-400 text-sm mb-4">
                                        <MapPin className="w-4 h-4 mr-2 text-indigo-500"/>
                                        {ticket.event?.location || 'Location non specificata'}
                                    </div>
                                    <span className="inline-block bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-md font-semibold border border-green-800/30">
                                        PRENOTATO • {ticket.ticketHolderName || 'Ospite'}
                                    </span>
                                </div>
                            </div>

                            {/* QR Code Right (or Bottom) */}
                            <div className="bg-gray-950 p-6 flex flex-col items-center justify-center md:border-l border-gray-700 min-w-[200px]">
                                <div className="bg-white p-4 rounded-lg shadow-inner">
                                    <QRCodeSVG 
                                        value={ticket.qrCodeId || 'invalid-code'} 
                                        size={120} 
                                        bgColor="#FFFFFF" 
                                        fgColor="#000000" 
                                        level="L"
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="text-gray-500 text-[10px] mt-4 text-center font-mono tracking-wider break-all max-w-[150px]">
                                    {ticket.qrCodeId || 'N/A'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;