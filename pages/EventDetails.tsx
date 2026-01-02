
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Event, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
// Fix: Added ArrowLeft to the imported icons list from lucide-react
import { MapPin, Calendar, Clock, Info, Minus, Plus, Trash2, Pencil, X, Save, BarChart, List, CheckCircle, GraduationCap, BookOpen, ChevronRight, AlertTriangle, Flag, ArrowLeft } from 'lucide-react';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  
  // Ticket Data States
  const [ticketNames, setTicketNames] = useState<string[]>(['']);
  const [ticketMatricolas, setTicketMatricolas] = useState<string[]>(['']);
  const [ticketCorsoStudi, setTicketCorsoStudi] = useState<string[]>(['']);
  const [selectedPrList, setSelectedPrList] = useState<string>(""); 

  // Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  // Consent State
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const [saving, setSaving] = useState(false);

  const isOwner = user && event && (
      (typeof event.organization === 'string' && event.organization === user._id) ||
      (typeof event.organization !== 'string' && event.organization._id === user._id)
  );

  useEffect(() => {
    if (id) {
      api.events.getById(id).then(data => {
          setEvent(data || null);
          if(data) {
              setEditForm({
                  title: data.title,
                  description: data.description,
                  longDescription: data.longDescription,
                  date: data.date.split('T')[0], 
                  time: data.time,
                  location: data.location,
                  image: data.image,
                  maxCapacity: data.maxCapacity,
                  prLists: data.prLists || [],
                  requiresMatricola: data.requiresMatricola || false,
                  requiresCorsoStudi: data.requiresCorsoStudi || false,
              });
          }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    setTicketNames(prev => prev.length === quantity ? prev : Array.from({ length: quantity }, (_, i) => prev[i] || ''));
    setTicketMatricolas(prev => prev.length === quantity ? prev : Array.from({ length: quantity }, (_, i) => prev[i] || ''));
    setTicketCorsoStudi(prev => prev.length === quantity ? prev : Array.from({ length: quantity }, (_, i) => prev[i] || ''));
  }, [quantity]);

  const handlePurchase = async () => {
    if (!user) { navigate('/auth'); return; }
    if (user.role !== UserRole.STUDENTE) { alert("Solo gli studenti possono prenotare voucher."); return; }
    if (ticketNames.some(name => !name.trim())) { alert("Inserisci il nome per ogni voucher."); return; }
    if (!acceptedTerms) { alert("Devi accettare i Termini del Servizio."); return; }

    setPurchasing(true);
    try {
      await api.payments.createCheckoutSession(event!._id, quantity, user._id, ticketNames, selectedPrList || "Nessuna lista", ticketMatricolas, ticketCorsoStudi);
    } catch (error) {
      alert("Prenotazione fallita. Riprova.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reportReason.trim()) return;
      setIsReporting(true);
      try {
          await api.reports.create({ eventId: event!._id, reason: reportReason });
          alert("Segnalazione inviata. Verrà esaminata entro 24 ore.");
          setIsReportModalOpen(false);
          setReportReason('');
      } catch (err) {
          alert("Errore nell'invio della segnalazione.");
      } finally {
          setIsReporting(false);
      }
  };

  const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          const updatedEvent = await api.events.update(event!._id, editForm);
          setEvent(updatedEvent);
          setIsEditing(false);
      } catch (e) {
          alert("Errore durante il salvataggio.");
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  const finalPrice = Number(event.price);
  const totalAmount = (finalPrice + (finalPrice === 0 ? 0 : 0.40)) * quantity;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 relative">
      
      {/* REPORT MODAL */}
      {isReportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Flag className="w-5 h-5 mr-2 text-red-500" /> Segnala Evento
                      </h3>
                      <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <form onSubmit={handleReport} className="p-6 space-y-4">
                      <p className="text-sm text-gray-600">
                          Segnala questo evento se viola le nostre linee guida (es. contenuto offensivo, spam, truffa).
                      </p>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Motivazione</label>
                          <select 
                            value={reportReason} 
                            onChange={e => setReportReason(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                            required
                          >
                              <option value="">Seleziona...</option>
                              <option value="Contenuto inappropriato/offensivo">Contenuto inappropriato/offensivo</option>
                              <option value="Informazioni false o ingannevoli">Informazioni false o ingannevoli</option>
                              <option value="Spam o attività illecita">Spam o attività illecita</option>
                              <option value="Violenza o discriminazione">Violenza o discriminazione</option>
                              <option value="Altro">Altro</option>
                          </select>
                      </div>
                      <button 
                        type="submit" 
                        disabled={isReporting || !reportReason}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                      >
                          {isReporting ? 'Invio...' : 'Invia Segnalazione'}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Hero Section */}
      <div className="h-[40vh] relative w-full">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        
        <div className="absolute top-24 right-4 sm:right-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 z-20">
            {isOwner ? (
                <button onClick={() => setIsEditing(true)} className="bg-white/90 backdrop-blur hover:bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition">
                    <Pencil className="w-4 h-4 mr-2" /> Edit Event
                </button>
            ) : user && user.role === UserRole.STUDENTE && (
                <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="bg-white/20 backdrop-blur hover:bg-white/40 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition border border-white/30"
                >
                    <Flag className="w-4 h-4 mr-2" /> Segnala
                </button>
            )}
        </div>

        <button onClick={() => navigate('/')} className="absolute top-24 left-4 sm:left-8 bg-white/20 backdrop-blur hover:bg-white/30 text-white p-2 rounded-full transition z-20">
             <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 inline-block">
                    {event.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap items-center text-gray-200 text-sm gap-4 md:gap-8">
                    <div className="flex items-center"><Calendar className="w-5 h-5 mr-2" /> {new Date(event.date).toLocaleDateString()}</div>
                    <div className="flex items-center"><Clock className="w-5 h-5 mr-2" /> {event.time}</div>
                    <div className="flex items-center"><MapPin className="w-5 h-5 mr-2" /> {event.location}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About the Event</h2>
                    <div className="prose prose-indigo text-gray-600 whitespace-pre-line leading-relaxed">
                        {event.longDescription}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 sticky top-24">
                     <div className="flex justify-between items-center mb-6">
                         <div>
                             <p className="text-sm text-gray-500 font-medium">Price per person</p>
                             <h3 className="text-3xl font-bold text-gray-900">{finalPrice === 0 ? 'Free' : `€${finalPrice.toFixed(2)}`}</h3>
                         </div>
                     </div>

                     <div className="space-y-4">
                         <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                             <span className="text-sm font-medium text-gray-700 ml-2">Quantity</span>
                             <div className="flex items-center">
                                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-100"><Minus className="w-4 h-4"/></button>
                                 <span className="w-12 text-center font-bold">{quantity}</span>
                                 <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-100"><Plus className="w-4 h-4"/></button>
                             </div>
                         </div>
                         
                         {Array.from({ length: quantity }).map((_, i) => (
                             <input key={i} type="text" placeholder={`Holder Name #${i+1}`} value={ticketNames[i]} onChange={e => {
                                 const n = [...ticketNames]; n[i] = e.target.value; setTicketNames(n);
                             }} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                         ))}

                         <div className="pt-4 border-t border-gray-100 flex justify-between text-lg font-bold text-gray-900">
                             <span>Total</span>
                             <span>€{totalAmount.toFixed(2)}</span>
                         </div>

                         <div className="flex items-start mt-2">
                             <input id="terms" type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 mr-2" />
                             <label htmlFor="terms" className="text-xs text-gray-500">I accept terms and conditions.</label>
                         </div>

                         <button onClick={handlePurchase} disabled={purchasing} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50">
                             {purchasing ? 'Processing...' : 'Book Now'}
                         </button>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
