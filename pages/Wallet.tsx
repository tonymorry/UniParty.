import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, UserRole } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { Calendar, MapPin, AlertCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const downloadTicket = (ticket: Ticket) => {
    try {
      const qrId = `qr-${ticket._id}`;
      const qrCanvas = document.getElementById(qrId) as HTMLCanvasElement;
      if (!qrCanvas) {
        alert("Errore: QR Code non pronto per il download.");
        return;
      }

      // Create high-res master canvas
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Draw Slate Dark Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, 0, 700);
      gradient.addColorStop(0, '#0f172a'); // slate-900
      gradient.addColorStop(1, '#1e1b4b'); // indigo-950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 700);

      // Decorative blurred glow circle in top-right
      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)'; // indigo with opacity
      ctx.beginPath();
      ctx.arc(500, 100, 150, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw "UniParty" Logo & Text top left
      // Drawing a neon party glass or geometric star
      ctx.fillStyle = '#818cf8'; // indigo-400
      ctx.beginPath();
      ctx.moveTo(50, 45);
      ctx.lineTo(70, 45);
      ctx.lineTo(60, 65);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(60, 65);
      ctx.lineTo(60, 75);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(53, 75);
      ctx.lineTo(67, 75);
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('UniParty', 85, 68);

      // Decorative divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 110);
      ctx.lineTo(560, 110);
      ctx.stroke();

      // 3. Event Title
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('EVENTO', 40, 150);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      const eventTitle = ticket.event?.title || 'Evento senza titolo';
      const displayTitle = eventTitle.length > 35 ? eventTitle.substring(0, 35) + '...' : eventTitle;
      ctx.fillText(displayTitle, 40, 185);

      // 4. Participant Name
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('PARTECIPANTE', 40, 240);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(ticket.ticketHolderName || 'Ospite', 40, 275);

      // Date & Location Info row
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('DATA', 40, 330);
      
      ctx.fillStyle = '#cbd5e1'; // slate-300
      ctx.font = '16px sans-serif';
      const dateStr = ticket.event?.dates && ticket.event.dates.length > 0
        ? new Date(ticket.event.dates[0]).toLocaleDateString('it-IT')
        : 'N/A';
      ctx.fillText(dateStr, 40, 360);

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('LOCATION', 280, 330);

      ctx.fillStyle = '#cbd5e1'; // slate-300
      ctx.font = '16px sans-serif';
      const locationStr = ticket.event?.location || 'N/A';
      const displayLocation = locationStr.length > 25 ? locationStr.substring(0, 25) + '...' : locationStr;
      ctx.fillText(displayLocation, 280, 360);

      // Decorative Card for QR Code
      const cardX = 180, cardY = 410, cardW = 240, cardH = 240, r = 16;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardW - r, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
      ctx.lineTo(cardX + cardW, cardY + cardH - r);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
      ctx.lineTo(cardX + r, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();

      // Draw standard margin/padding for the QR canvas inside card
      ctx.drawImage(qrCanvas, cardX + 20, cardY + 20, 200, 200);

      // Draw watermark footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`VOUCHER: ${ticket.qrCodeId || 'N/A'}`, 300, 680);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `UniParty_Ticket_${ticket.event?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Voucher'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Failed to generate ticket download", e);
      alert("Errore durante la generazione del biglietto da scaricare.");
    }
  };

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
                                        {ticket.event?.dates && ticket.event.dates.length > 0 ? (
                                            ticket.event.dates.length > 1 ? (
                                                `Dal ${new Date(ticket.event.dates[0]).toLocaleDateString()} al ${new Date(ticket.event.dates[ticket.event.dates.length - 1]).toLocaleDateString()}`
                                            ) : (
                                                new Date(ticket.event.dates[0]).toLocaleDateString()
                                            )
                                        ) : (
                                            'Data non disponibile'
                                        )} {ticket.event?.times ? `alle ${ticket.event.times.join(' / ')}` : ticket.event?.time ? `alle ${ticket.event.time}` : ''}
                                    </div>
                                    <div className="flex flex-col text-gray-400 text-sm mb-4">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2 text-indigo-500"/>
                                            {ticket.event?.location || 'Location non specificata'}
                                        </div>
                                        {ticket.event?.dateSpecificLocations && Object.keys(ticket.event.dateSpecificLocations).length > 0 && (
                                            <div className="mt-1 ml-6 space-y-1">
                                                {Object.entries(ticket.event.dateSpecificLocations).map(([date, loc]) => (
                                                    <div key={date} className="text-xs text-indigo-300/80 italic">
                                                        {new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}: {loc}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="inline-block bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-md font-semibold border border-green-800/30">
                                        PRENOTATO • {ticket.ticketHolderName || 'Ospite'}
                                    </span>
                                </div>
                            </div>

                            {/* QR Code Right (or Bottom) */}
                            <div className="bg-gray-950 p-6 flex flex-col items-center justify-center md:border-l border-gray-700 min-w-[200px] relative">
                                <button 
                                    onClick={() => downloadTicket(ticket)}
                                    className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 text-indigo-400 rounded-full transition shadow-md border border-gray-700 z-10"
                                    title="Scarica Biglietto"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <div className="bg-white p-4 rounded-lg shadow-inner">
                                    <QRCodeCanvas 
                                        id={`qr-${ticket._id}`}
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