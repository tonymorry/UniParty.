
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
  
  // Ticket Data States
  const [ticketNames, setTicketNames] = useState<string[]>(['']);
  const [ticketMatricolas, setTicketMatricolas] = useState<string[]>(['']);
  const [ticketCorsoStudi, setTicketCorsoStudi] = useState<string[]>(['']);
  const [selectedPrList, setSelectedPrList] = useState<string>(""); 

  // Consent State
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Owner Stats
  const [prStats, setPrStats] = useState<{ [key: string]: number } | null>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const [editPriceString, setEditPriceString] = useState('0');
  const [currentEditPrInput, setCurrentEditPrInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);

  // Report State
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
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.role !== UserRole.STUDENTE) {
        alert("Solo gli studenti possono prenotare voucher.");
        return;
    }

    if (ticketNames.some(name => name.trim() === '')) {
        alert("Inserisci il nome per ogni voucher.");
        return;
    }

    if (event?.requiresMatricola && ticketMatricolas.some(m => m.trim() === '')) {
        alert("Inserisci la matricola per ogni voucher.");
        return;
    }

    if (event?.requiresCorsoStudi && ticketCorsoStudi.some(c => c.trim() === '')) {
        alert("Inserisci il corso di studi per ogni voucher.");
        return;
    }

    if (event && event.prLists && event.prLists.length > 0 && selectedPrList === "") {
        alert("Seleziona una Lista PR (o 'Nessuna lista').");
        return;
    }

    if (!acceptedTerms) {
        alert("Devi accettare i Termini del Servizio e le condizioni di rimborso per procedere.");
        return;
    }

    if (event) {
      setPurchasing(true);
      try {
        const redirectUrl = await api.payments.createCheckoutSession(
            event._id, 
            quantity, 
            user._id, 
            ticketNames, 
            selectedPrList || "Nessuna lista",
            event.requiresMatricola ? ticketMatricolas : undefined,
            event.requiresCorsoStudi ? ticketCorsoStudi : undefined
        );
        if (redirectUrl) {
            window.location.hash = redirectUrl;
        }
      } catch (error) {
        console.error("Checkout failed", error);
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
          alert("Segnalazione inviata con successo. Verrà esaminata entro 24 ore.");
          setIsReportModalOpen(false);
          setReportReason('');
      } catch (err) {
          alert("Errore durante l'invio della segnalazione.");
      } finally {
          setIsSubmittingReport(false);
      }
  };

  // --- EDIT FUNCTIONS ---
  const handleAddPrList = () => {
      if (currentEditPrInput.trim() && editForm.prLists && !editForm.prLists.includes(currentEditPrInput.trim())) {
          setEditForm({...editForm, prLists: [...editForm.prLists, currentEditPrInput.trim()]});
          setCurrentEditPrInput('');
      } else if (currentEditPrInput.trim() && !editForm.prLists) {
          setEditForm({...editForm, prLists: [currentEditPrInput.trim()]});
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
      
      const confirmed = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
      if (!confirmed) return;
      
      setIsDeleting(true);
      try {
          await api.events.delete(event._id);
          navigate('/', { replace: true });
      } catch (e: any) {
          console.error("Delete error:", e);
          alert("Failed to delete event: " + (e.message || "Unknown error"));
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
          
          const updatedData = {
              ...editForm,
              price: finalPrice,
              date: isoDate,
              requiresCorsoStudi: editForm.requiresMatricola 
          };

          const updatedEvent = await api.events.update(event!._id, updatedData);
          setEvent(updatedEvent);
          setIsEditing(false);
          alert("Event updated successfully");
      } catch (e: any) {
          console.error(e);
          alert("Failed to update event: " + e.message);
      } finally {
          setSaving(false);
      }
  };
  
  const handlePublish = async () => {
      if (!event) return;
      if (!window.confirm("Sei sicuro di voler pubblicare questo evento? Sarà visibile a tutti.")) return;
      
      setIsPublishing(true);
      try {
          const updatedEvent = await api.events.update(event._id, { status: 'active' });
          setEvent(updatedEvent);
          alert("Evento pubblicato con successo!");
      } catch (e: any) {
          console.error(e);
          alert("Errore pubblicazione evento: " + e.message);
      } finally {
          setIsPublishing(false);
      }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://picsum.photos/800/400?random=999"; 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Event not found or expired</div>;

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
    <div className="min-h-screen bg-gray-900 text-white pb-12 relative">
      
      {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                      <h2 className="text-xl font-bold text-white">Edit Event</h2>
                      <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-700 rounded-full transition">
                          <X className="w-6 h-6 text-gray-400" />
                      </button>
                  </div>
                  <form onSubmit={handleUpdate} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                          <input 
                              type="text" value={editForm.title} 
                              onChange={e => setEditForm({...editForm, title: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                              required
                          />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                              <input 
                                  type="date" value={editForm.date} 
                                  onChange={e => setEditForm({...editForm, date: e.target.value})}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                  required
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                              <input 
                                  type="text" value={editForm.time} 
                                  onChange={e => setEditForm({...editForm, time: e.target.value})}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                  required
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                          <input 
                              type="text" value={editForm.location} 
                              onChange={e => setEditForm({...editForm, location: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                              required
                          />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="flex items-center space-x-3 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                               <input 
                                   type="checkbox" 
                                   id="editReqAcademicData"
                                   checked={editForm.requiresMatricola || false}
                                   onChange={e => {
                                       setEditForm({
                                           ...editForm, 
                                           requiresMatricola: e.target.checked,
                                           requiresCorsoStudi: e.target.checked
                                       })
                                   }}
                                   className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600 rounded"
                               />
                               <label htmlFor="editReqAcademicData" className="text-sm text-gray-300 font-medium cursor-pointer flex items-center">
                                   <GraduationCap className="w-4 h-4 mr-2 text-indigo-400" />
                                   Richiedi Dati Accademici
                               </label>
                           </div>
                      </div>
                      
                      <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">PR Lists</label>
                         <div className="flex gap-2 mb-2">
                             <input 
                                 type="text" 
                                 className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
                                 placeholder="Add list name"
                                 value={currentEditPrInput}
                                 onChange={e => setCurrentEditPrInput(e.target.value)}
                                 onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddPrList(); }}}
                             />
                             <button 
                                 type="button" 
                                 onClick={handleAddPrList}
                                 className="px-4 py-2 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition border border-gray-600"
                             >
                                 Add
                             </button>
                         </div>
                         {editForm.prLists && editForm.prLists.length > 0 && (
                             <div className="flex flex-wrap gap-2 mt-2">
                                 {editForm.prLists.map((list, idx) => (
                                     <span key={idx} className="bg-indigo-900/40 text-indigo-300 px-3 py-1 rounded-full text-sm flex items-center border border-indigo-900/50">
                                         <List className="w-3 h-3 mr-1" />
                                         {list}
                                         <button type="button" onClick={() => handleRemovePrList(list)} className="ml-2 hover:text-red-400 transition">
                                             <X className="w-3 h-3" />
                                         </button>
                                     </span>
                                 ))}
                             </div>
                         )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="url" value={editForm.image} 
                                onChange={e => setEditForm({...editForm, image: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                            />
                            {editForm.image && (
                                <img 
                                    src={editForm.image} 
                                    onError={(e) => e.currentTarget.style.display = 'none'} 
                                    alt="Preview" 
                                    className="w-10 h-10 rounded object-cover border border-gray-600" 
                                />
                            )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1 text-indigo-400"/> Price (€)
                              </label>
                              <div className="relative">
                                  <input 
                                      type="number" 
                                      value={user?.stripeOnboardingComplete ? editPriceString : '0'} 
                                      onChange={e => {
                                          if (user?.stripeOnboardingComplete) setEditPriceString(e.target.value);
                                      }} 
                                      className={`w-full px-4 py-2 border rounded-lg outline-none transition
                                          ${!user?.stripeOnboardingComplete 
                                              ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
                                              : 'bg-gray-700 border-gray-600 focus:ring-2 focus:ring-indigo-500 text-white'
                                          }
                                      `}
                                      required
                                      min="0"
                                      step="0.01"
                                  />
                                  {!user?.stripeOnboardingComplete && (
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                          <Lock className="h-4 w-4 text-gray-500" />
                                      </div>
                                  )}
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Total Capacity</label>
                              <input 
                                  type="number" value={editForm.maxCapacity} 
                                  onChange={e => setEditForm({...editForm, maxCapacity: parseInt(e.target.value)})}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                  required
                                  min={event.ticketsSold}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <textarea 
                              value={editForm.description} 
                              onChange={e => setEditForm({...editForm, description: e.target.value})}
                              rows={3}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                              required
                          />
                      </div>
                      <div className="pt-4 flex space-x-3">
                          <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 border border-gray-600 rounded-lg font-bold text-gray-300 hover:bg-gray-700 transition">Cancel</button>
                          <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 rounded-lg font-bold text-white hover:bg-indigo-700 flex items-center justify-center transition shadow-lg">
                              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2"/> Save Changes</>}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* REPORT MODAL */}
      {isReportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                      <h2 className="text-xl font-bold text-white flex items-center">
                          <Flag className="w-5 h-5 mr-2 text-red-500" />
                          Segnala Evento
                      </h2>
                      <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-gray-700 rounded-full transition">
                          <X className="w-6 h-6 text-gray-400" />
                      </button>
                  </div>
                  <form onSubmit={handleReport} className="p-6 space-y-4">
                      <p className="text-sm text-gray-400 mb-4">
                          Aiutaci a mantenere la community sicura. Perché stai segnalando questo evento?
                      </p>
                      <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Motivazione</label>
                          <div className="space-y-2">
                              {["Contenuto offensivo o inappropriato", "Spam o Truffa", "Informazioni false", "Illegale", "Altro"].map(r => (
                                  <label key={r} className="flex items-center p-3 border border-gray-700 rounded-xl hover:bg-gray-700 cursor-pointer transition">
                                      <input 
                                          type="radio" 
                                          name="report_reason" 
                                          value={r} 
                                          checked={reportReason === r}
                                          onChange={e => setReportReason(e.target.value)}
                                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                                      />
                                      <span className="ml-3 text-sm font-medium text-gray-200">{r}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={isSubmittingReport || !reportReason}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isSubmittingReport ? "Invio in corso..." : "Invia Segnalazione"}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* DRAFT BANNER */}
      {isOwner && event.status === 'draft' && (
          <div className="bg-yellow-900/20 text-yellow-500 text-center py-3 font-bold sticky top-16 z-30 flex justify-center items-center shadow-md border-b border-yellow-900/30">
              <FileText className="w-5 h-5 mr-2" />
              Questo evento è una BOZZA e non è visibile al pubblico.
          </div>
      )}

      <div className="h-[40vh] relative w-full">
        <img 
            src={event.image} 
            alt={event.title} 
            onError={handleImageError}
            className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        
        <div className="absolute top-24 right-4 sm:right-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 z-20">
            {isOwner ? (
                <>
                    {event.status === 'draft' && (
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="bg-green-600/90 backdrop-blur hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition cursor-pointer"
                        >
                            {isPublishing ? (
                                <>Pubblicazione...</>
                            ) : (
                                <><CheckCircle className="w-4 h-4 mr-2" /> PUBBLICA ORA</>
                            )}
                        </button>
                    )}
                    
                    <button 
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-gray-800/90 backdrop-blur hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition cursor-pointer border border-white/10"
                    >
                        <Pencil className="w-4 h-4 mr-2 text-indigo-400" />
                        Edit Event
                    </button>
                    <button 
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600/90 backdrop-blur hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </>
            ) : user && (
                <button 
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="bg-white/10 backdrop-blur hover:bg-white/20 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition border border-white/20 cursor-pointer"
                >
                    <Flag className="w-4 h-4 mr-2 text-red-400" />
                    Segnala
                </button>
            )}
        </div>

        <button 
            onClick={() => navigate('/')} 
            className="absolute top-24 left-4 sm:left-8 bg-gray-900/40 backdrop-blur hover:bg-gray-900/60 text-white p-2 rounded-full transition z-20 border border-white/10"
        >
             <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block shadow-lg">
                    {event.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">{event.title}</h1>
                <div className="flex flex-wrap items-center text-gray-300 text-sm md:text-base gap-4 md:gap-8">
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-indigo-400" />
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-indigo-400" />
                        {event.time}
                    </div>
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-white hover:underline transition-colors cursor-pointer group"
                    >
                        <MapPin className="w-5 h-5 mr-2 text-indigo-400 group-hover:text-red-400 transition-colors" />
                        <span className="mr-2">{event.location}</span>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full hidden sm:inline-block border border-white/10">View on Map</span>
                    </a>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            
            {/* Left Column: Description */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">About the Event</h2>
                    <div className="prose prose-invert prose-indigo text-gray-300 whitespace-pre-line leading-relaxed max-w-none">
                        {event.longDescription}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-700">
                         <h3 className="text-lg font-bold text-white mb-4">Organized by</h3>
                         <div className="flex items-center">
                             <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-indigo-400 font-bold text-lg mr-4 overflow-hidden border border-gray-600">
                                {typeof event.organization === 'object' && 'profileImage' in event.organization && event.organization.profileImage ? (
                                    <img src={event.organization.profileImage} alt="Org" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{typeof event.organization === 'object' ? (event.organization as any).name?.charAt(0) : 'A'}</span>
                                )}
                             </div>
                             <div>
                                 <Link to={`/association/${typeof event.organization === 'object' ? event.organization._id : event.organization}`} className="font-bold text-white text-lg hover:text-indigo-400 transition">
                                    {typeof event.organization === 'object' ? (event.organization as any).name : 'Association'}
                                 </Link>
                                 <p className="text-sm text-gray-500 font-medium">Event Organizer</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Ticket Selection (FIX: Removed sticky) */}
            <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
                     <div className="flex justify-between items-center mb-6">
                         <div>
                             <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Prezzo per persona</p>
                             <h3 className="text-3xl font-bold text-white">
                                 {isFree ? 'Gratis' : `€${finalPrice.toFixed(2)}`}
                             </h3>
                         </div>
                         {isAlmostSoldOut && (
                             <span className="bg-orange-900/30 text-orange-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse border border-orange-900/50">
                                 Ultimi posti!
                             </span>
                         )}
                     </div>

                     {isSoldOut ? (
                         <div className="bg-gray-900/50 rounded-lg p-4 text-center font-bold text-gray-500 mb-4 border border-gray-700">
                             SOLD OUT
                         </div>
                     ) : (
                         <div className="space-y-4">
                             <div className="flex items-center justify-between bg-gray-900 p-2 rounded-lg border border-gray-700">
                                 <span className="text-sm font-medium text-gray-300 ml-2">Quantità</span>
                                 <div className="flex items-center">
                                     <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 bg-gray-800 rounded-md shadow-sm hover:bg-gray-700 text-indigo-400 disabled:opacity-50 border border-gray-700 transition"
                                        disabled={quantity <= 1}
                                     >
                                         <Minus className="w-4 h-4" />
                                     </button>
                                     <span className="w-12 text-center font-bold text-white">{quantity}</span>
                                     <button 
                                        onClick={() => setQuantity(Math.min(maxPurchaseLimit, quantity + 1))}
                                        className="p-2 bg-gray-800 rounded-md shadow-sm hover:bg-gray-700 text-indigo-400 disabled:opacity-50 border border-gray-700 transition"
                                        disabled={quantity >= maxPurchaseLimit}
                                     >
                                         <Plus className="w-4 h-4" />
                                     </button>
                                 </div>
                             </div>

                             <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                 {Array.from({ length: quantity }).map((_, i) => (
                                     <div key={i} className="space-y-2 p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voucher #{i + 1}</p>
                                         <input
                                             type="text"
                                             placeholder="Nome e Cognome"
                                             value={ticketNames[i]}
                                             onChange={e => handleNameChange(i, e.target.value)}
                                             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none placeholder-gray-400"
                                         />
                                         {event.requiresMatricola && (
                                              <div className="flex items-center">
                                                  <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
                                                  <input
                                                      type="text"
                                                      placeholder="Matricola"
                                                      value={ticketMatricolas[i]}
                                                      onChange={e => handleMatricolaChange(i, e.target.value)}
                                                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none placeholder-gray-400"
                                                  />
                                              </div>
                                         )}
                                         {event.requiresCorsoStudi && (
                                              <div className="flex items-center">
                                                  <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                                                  <input
                                                      type="text"
                                                      placeholder="Corso di Studi"
                                                      value={ticketCorsoStudi[i]}
                                                      onChange={e => handleCorsoStudiChange(i, e.target.value)}
                                                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none placeholder-gray-400"
                                                  />
                                              </div>
                                         )}
                                     </div>
                                 ))}
                             </div>

                             {event.prLists && event.prLists.length > 0 && (
                                 <div>
                                     <label className="block text-sm font-medium text-gray-300 mb-1">Lista PR</label>
                                     <select
                                         value={selectedPrList}
                                         onChange={e => setSelectedPrList(e.target.value)}
                                         className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                     >
                                         <option value="">Seleziona una lista...</option>
                                         <option value="Nessuna lista">Nessuna lista</option>
                                         {event.prLists.map(list => (
                                             <option key={list} value={list}>{list}</option>
                                         ))}
                                     </select>
                                 </div>
                             )}
                         </div>
                     )}

                     <div className="border-t border-gray-700 my-4 pt-4 space-y-2">
                         <div className="flex justify-between text-sm text-gray-400">
                             <span>Biglietti x {quantity}</span>
                             <span className="text-gray-200">€{(priceInCents * quantity / 100).toFixed(2)}</span>
                         </div>
                         {!isFree && (
                             <div className="flex justify-between text-sm text-gray-400">
                                 <span className="flex items-center">Fee Servizio <Info className="w-3 h-3 ml-1 text-gray-500"/></span>
                                 <span className="text-gray-200">€{(feeInCents * quantity / 100).toFixed(2)}</span>
                             </div>
                         )}
                         <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-700/50 mt-2">
                             <span>Totale</span>
                             <span className="text-indigo-400">€{totalAmount.toFixed(2)}</span>
                         </div>
                     </div>

                     {!isSoldOut && (
                         <div className="mb-4 flex items-start">
                             <input 
                                 id="terms" 
                                 type="checkbox" 
                                 checked={acceptedTerms}
                                 onChange={e => setAcceptedTerms(e.target.checked)}
                                 className="mt-1 h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                             />
                             <label htmlFor="terms" className="ml-2 text-[10px] text-gray-500 leading-tight">
                                 Accetto i <Link to="/terms" className="text-indigo-400 hover:underline">Termini e Condizioni</Link>. 
                                 Comprendo che la fee di servizio non è rimborsabile.
                             </label>
                         </div>
                     )}

                     <button
                         onClick={handlePurchase}
                         disabled={isSoldOut || purchasing || (!isFree && !user)}
                         className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 flex items-center justify-center ${
                             isSoldOut 
                             ? 'bg-gray-700 cursor-not-allowed text-gray-500 border border-gray-600' 
                             : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10'
                         }`}
                     >
                         {purchasing ? (
                             'Elaborazione...'
                         ) : isSoldOut ? (
                             'Sold Out'
                         ) : (
                             <>
                                Prenota Ora <ChevronRight className="w-4 h-4 ml-1" />
                             </>
                         )}
                     </button>
                     
                     {!user && !isSoldOut && (
                         <p className="text-[10px] text-center text-indigo-400 mt-3 font-medium uppercase tracking-wider">
                             Devi effettuare il login per prenotare.
                         </p>
                     )}
                </div>

                <div className="mt-6 bg-indigo-900/20 rounded-xl p-4 border border-indigo-900/30">
                    <h4 className="font-bold text-indigo-300 mb-2 flex items-center text-sm uppercase tracking-wide"><Info className="w-4 h-4 mr-2 text-indigo-400"/> Info Utili</h4>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                        Mostra il QR Code all'ingresso direttamente dal tuo smartphone. Non serve stampare il biglietto.
                    </p>
                     <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center transition"
                     >
                         <MapPin className="w-3 h-3 mr-1" /> Apri su Google Maps
                     </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
