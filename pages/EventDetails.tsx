import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Event, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, Info, Minus, Plus, Ban, Trash2, Pencil, X, Save, Image as ImageIcon, BarChart, List, FileText, CheckCircle, GraduationCap, BookOpen, ChevronRight, ShieldCheck, Flag, AlertTriangle, ArrowLeft, DollarSign, Lock } from 'lucide-react';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  
  const [ticketNames, setTicketNames] = useState<string[]>(['']);
  const [ticketMatricolas, setTicketMatricolas] = useState<string[]>(['']);
  const [ticketCorsoStudi, setTicketCorsoStudi] = useState<string[]>(['']);
  const [selectedPrList, setSelectedPrList] = useState<string>(""); 
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [prStats, setPrStats] = useState<{ [key: string]: number } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const [editPriceString, setEditPriceString] = useState('0');
  const [currentEditPrInput, setCurrentEditPrInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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
              setEditPriceString(data.price.toString());
          }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
      if (isOwner && id) {
          api.events.getEventStats(id).then(setPrStats);
      }
  }, [isOwner, id]);

  useEffect(() => {
    setTicketNames(prev => {
        const newNames = [...prev];
        if (quantity > prev.length) {
            for (let i = prev.length; i < quantity; i++) newNames.push('');
        } else {
            return newNames.slice(0, quantity);
        }
        return newNames;
    });
    setTicketMatricolas(prev => {
        const newMats = [...prev];
        if (quantity > prev.length) {
            for (let i = prev.length; i < quantity; i++) newMats.push('');
        } else {
            return newMats.slice(0, quantity);
        }
        return newMats;
    });
    setTicketCorsoStudi(prev => {
        const newCors = [...prev];
        if (quantity > prev.length) {
            for (let i = prev.length; i < quantity; i++) newCors.push('');
        } else {
            return newCors.slice(0, quantity);
        }
        return newCors;
    });
  }, [quantity]);

  const handleNameChange = (index: number, value: string) => {
      const newNames = [...ticketNames];
      newNames[index] = value;
      setTicketNames(newNames);
  };

  const handleMatricolaChange = (index: number, value: string) => {
      const newMats = [...ticketMatricolas];
      newMats[index] = value;
      setTicketMatricolas(newMats);
  };

  const handleCorsoStudiChange = (index: number, value: string) => {
      const newCors = [...ticketCorsoStudi];
      newCors[index] = value;
      setTicketCorsoStudi(newCors);
  };

  const handlePurchase = async () => {
    if (!user) { navigate('/auth'); return; }
    if (user.role !== UserRole.STUDENTE) { alert("Solo gli studenti possono prenotare voucher."); return; }
    if (ticketNames.some(name => name.trim() === '')) { alert("Inserisci il nome per ogni voucher."); return; }
    if (event?.requiresMatricola && ticketMatricolas.some(m => m.trim() === '')) { alert("Inserisci la matricola per ogni voucher."); return; }
    if (event?.requiresCorsoStudi && ticketCorsoStudi.some(c => c.trim() === '')) { alert("Inserisci il corso di studi per ogni voucher."); return; }
    if (event && event.prLists && event.prLists.length > 0 && selectedPrList === "") { alert("Seleziona una Lista PR."); return; }
    if (!acceptedTerms) { alert("Devi accettare i Termini."); return; }

    if (event) {
      setPurchasing(true);
      try {
        const redirectUrl = await api.payments.createCheckoutSession(
            event._id, quantity, user._id, ticketNames, 
            selectedPrList || "Nessuna lista",
            event.requiresMatricola ? ticketMatricolas : undefined,
            event.requiresCorsoStudi ? ticketCorsoStudi : undefined
        );
        if (redirectUrl) window.location.hash = redirectUrl;
      } catch (error) {
        alert("Prenotazione fallita. Riprova.");
      } finally {
        setPurchasing(false);
      }
    }
  };

  const handleReport = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reportReason.trim()) return;
      setIsSubmittingReport(true);
      try {
          await api.reports.create({ eventId: event!._id, reason: reportReason });
          alert("Segnalazione inviata.");
          setIsReportModalOpen(false);
          setReportReason('');
      } catch (err) {
          alert("Errore segnalazione.");
      } finally {
          setIsSubmittingReport(false);
      }
  };

  const handleAddPrList = () => {
      if (currentEditPrInput.trim() && editForm.prLists && !editForm.prLists.includes(currentEditPrInput.trim())) {
          setEditForm({...editForm, prLists: [...editForm.prLists, currentEditPrInput.trim()]});
          setCurrentEditPrInput('');
      }
  };

  const handleRemovePrList = (listToRemove: string) => {
      if(editForm.prLists) {
        setEditForm({...editForm, prLists: editForm.prLists.filter(l => l !== listToRemove)});
      }
  };

  const handleDelete = async () => {
      if (!event) return;
      if (!window.confirm("Are you sure you want to delete this event?")) return;
      setIsDeleting(true);
      try {
          await api.events.delete(event._id);
          navigate('/', { replace: true });
      } catch (e: any) {
          alert("Failed to delete event.");
          setIsDeleting(false);
      }
  };

  const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          const isoDate = new Date(editForm.date!).toISOString();
          const cleanPrice = parseFloat(editPriceString.replace(',', '.'));
          const finalPrice = isNaN(cleanPrice) ? 0 : Number(cleanPrice.toFixed(2));
          const updatedEvent = await api.events.update(event!._id, {
              ...editForm, price: finalPrice, date: isoDate, requiresCorsoStudi: editForm.requiresMatricola
          });
          setEvent(updatedEvent);
          setIsEditing(false);
          alert("Event updated successfully");
      } catch (e: any) {
          alert("Failed to update event.");
      } finally {
          setSaving(false);
      }
  };
  
  const handlePublish = async () => {
      if (!event) return;
      setIsPublishing(true);
      try {
          const updatedEvent = await api.events.update(event._id, { status: 'active' });
          setEvent(updatedEvent);
          alert("Evento pubblicato!");
      } catch (e: any) {
          alert("Errore pubblicazione.");
      } finally {
          setIsPublishing(false);
      }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://picsum.photos/800/400?random=999"; 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Event not found</div>;

  const safeBasePrice = Number(Number(event.price).toFixed(2));
  const priceInCents = Math.round(safeBasePrice * 100);
  const isFree = priceInCents === 0;
  const feeInCents = isFree ? 0 : 40; 
  const totalPerTicketCents = priceInCents + feeInCents;
  const totalOrderCents = totalPerTicketCents * quantity;
  const totalPricePerTicket = totalPerTicketCents / 100;
  const totalAmount = totalOrderCents / 100;
  const finalPrice = safeBasePrice; 

  const remainingTickets = event.maxCapacity - event.ticketsSold;
  const isSoldOut = remainingTickets <= 0;
  const maxPurchaseLimit = Math.min(10, remainingTickets);
  const soldRatio = event.ticketsSold / event.maxCapacity;
  const isAlmostSoldOut = soldRatio >= 0.6 && !isSoldOut;

  return (
    <div className="min-h-screen bg-gray-900 pb-12 relative text-white">
      
      {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                      <h2 className="text-xl font-bold text-white">Edit Event</h2>
                      <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-700 rounded-full">
                          <X className="w-6 h-6 text-gray-400" />
                      </button>
                  </div>
                  <form onSubmit={handleUpdate} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                          <input 
                              type="text" value={editForm.title} 
                              onChange={e => setEditForm({...editForm, title: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                          />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                              <input 
                                  type="date" value={editForm.date} 
                                  onChange={e => setEditForm({...editForm, date: e.target.value})}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                  required
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                              <input 
                                  type="text" value={editForm.time} 
                                  onChange={e => setEditForm({...editForm, time: e.target.value})}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                  required
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                          <input 
                              type="text" value={editForm.location} 
                              onChange={e => setEditForm({...editForm, location: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                              required
                          />
                      </div>
                      <div className="pt-4 flex space-x-3">
                          <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 border border-gray-600 rounded-lg font-bold text-gray-400 hover:bg-gray-700">Cancel</button>
                          <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 rounded-lg font-bold text-white hover:bg-indigo-700 flex items-center justify-center">
                              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2"/> Save Changes</>}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {isReportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                      <h2 className="text-xl font-bold text-white flex items-center">
                          <Flag className="w-5 h-5 mr-2 text-red-500" /> Segnala Evento
                      </h2>
                      <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-gray-700 rounded-full">
                          <X className="w-6 h-6 text-gray-400" />
                      </button>
                  </div>
                  <form onSubmit={handleReport} className="p-6 space-y-4">
                      <p className="text-sm text-gray-400">Perché stai segnalando questo evento?</p>
                      <div className="space-y-2">
                          {["Contenuto inappropriato", "Spam", "Informazioni false", "Illegale", "Altro"].map(r => (
                              <label key={r} className="flex items-center p-3 border border-gray-700 rounded-xl hover:bg-gray-700 cursor-pointer transition">
                                  <input type="radio" name="report_reason" value={r} checked={reportReason === r} onChange={e => setReportReason(e.target.value)} className="h-4 w-4 text-indigo-500" />
                                  <span className="ml-3 text-sm font-medium text-gray-300">{r}</span>
                              </label>
                          ))}
                      </div>
                      <button type="submit" disabled={isSubmittingReport || !reportReason} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50">
                          {isSubmittingReport ? "Invio..." : "Invia Segnalazione"}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {isOwner && event.status === 'draft' && (
          <div className="bg-yellow-900/80 text-yellow-100 text-center py-3 font-bold sticky top-16 z-30 flex justify-center items-center shadow-md backdrop-blur-md">
              <FileText className="w-5 h-5 mr-2" /> BOZZA - Non visibile al pubblico.
          </div>
      )}

      <div className="h-[40vh] relative w-full">
        <img src={event.image} alt={event.title} onError={handleImageError} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute top-24 right-4 sm:right-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 z-20">
            {isOwner ? (
                <>
                    {event.status === 'draft' && (
                        <button onClick={handlePublish} disabled={isPublishing} className="bg-green-600/80 backdrop-blur hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition">
                            {isPublishing ? "Pubblicazione..." : <><CheckCircle className="w-4 h-4 mr-2" /> PUBBLICA ORA</>}
                        </button>
                    )}
                    <button onClick={() => setIsEditing(true)} className="bg-gray-800/80 backdrop-blur hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition border border-gray-700">
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button onClick={handleDelete} disabled={isDeleting} className="bg-red-600/80 backdrop-blur hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition">
                        <Trash2 className="w-4 h-4 mr-2" /> {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </>
            ) : user && (
                <button onClick={() => setIsReportModalOpen(true)} className="bg-white/10 backdrop-blur hover:bg-white/20 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition border border-white/20">
                    <Flag className="w-4 h-4 mr-2" /> Segnala
                </button>
            )}
        </div>
        <button onClick={() => navigate('/')} className="absolute top-24 left-4 sm:left-8 bg-white/10 backdrop-blur hover:bg-white/20 text-white p-2 rounded-full transition z-20">
             <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 inline-block">
                    {event.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap items-center text-gray-300 text-sm md:text-base gap-4 md:gap-8">
                    <div className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-indigo-400" />{new Date(event.date).toLocaleDateString()}</div>
                    <div className="flex items-center"><Clock className="w-5 h-5 mr-2 text-indigo-400" />{event.time}</div>
                    <div className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-indigo-400" />{event.location}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">About the Event</h2>
                    <div className="prose prose-invert text-gray-400 whitespace-pre-line leading-relaxed">
                        {event.longDescription}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 sticky top-24">
                     <div className="flex justify-between items-center mb-6">
                         <div>
                             <p className="text-sm text-gray-400 font-medium">Prezzo per persona</p>
                             <h3 className="text-3xl font-bold text-white">
                                 {isFree ? 'Gratis' : `€${finalPrice.toFixed(2)}`}
                             </h3>
                         </div>
                         {isAlmostSoldOut && <span className="bg-orange-900/50 text-orange-400 text-xs font-bold px-2 py-1 rounded-full">Ultimi posti!</span>}
                     </div>

                     {!isSoldOut ? (
                         <div className="space-y-4">
                             <div className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                                 <span className="text-sm font-medium text-gray-400 ml-2">Quantità</span>
                                 <div className="flex items-center">
                                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-gray-800 rounded-md text-indigo-400 border border-gray-600 disabled:opacity-50" disabled={quantity <= 1}><Minus className="w-4 h-4" /></button>
                                     <span className="w-12 text-center font-bold text-white">{quantity}</span>
                                     <button onClick={() => setQuantity(Math.min(maxPurchaseLimit, quantity + 1))} className="p-2 bg-gray-800 rounded-md text-indigo-400 border border-gray-600 disabled:opacity-50" disabled={quantity >= maxPurchaseLimit}><Plus className="w-4 h-4" /></button>
                                 </div>
                             </div>
                             <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                 {Array.from({ length: quantity }).map((_, i) => (
                                     <div key={i} className="space-y-2 p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                                         <p className="text-xs font-bold text-gray-500 uppercase">Voucher #{i + 1}</p>
                                         <input type="text" placeholder="Nome e Cognome" value={ticketNames[i]} onChange={e => handleNameChange(i, e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ) : <div className="bg-gray-900/50 rounded-lg p-4 text-center font-bold text-gray-500">SOLD OUT</div>}

                     <div className="border-t border-gray-700 my-4 pt-4 space-y-2">
                         <div className="flex justify-between text-sm text-gray-400"><span>Biglietti x {quantity}</span><span>€{(priceInCents * quantity / 100).toFixed(2)}</span></div>
                         <div className="flex justify-between text-lg font-bold text-white pt-2"><span>Totale</span><span>€{totalAmount.toFixed(2)}</span></div>
                     </div>

                     {!isSoldOut && (
                         <div className="mb-4 flex items-start">
                             <input id="terms" type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 h-4 w-4 text-indigo-600 border-gray-600 bg-gray-700 rounded" />
                             <label htmlFor="terms" className="ml-2 text-xs text-gray-500">Accetto i Termini e Condizioni.</label>
                         </div>
                     )}

                     <button onClick={handlePurchase} disabled={isSoldOut || purchasing || (!isFree && !user)} className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center ${isSoldOut ? 'bg-gray-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                         {purchasing ? 'Elaborazione...' : isSoldOut ? 'Sold Out' : <>Prenota Ora <ChevronRight className="w-4 h-4 ml-1" /></>}
                     </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;