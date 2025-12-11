
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Event, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, Info, Minus, Plus, Ban, Trash2, Pencil, X, Save, Image as ImageIcon, BarChart, List, FileText, CheckCircle, GraduationCap, BookOpen, ChevronRight, ShieldCheck } from 'lucide-react';

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
  const [currentEditPrInput, setCurrentEditPrInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);

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

    // Also sync matricolas array length
    setTicketMatricolas(prev => {
        const newMats = [...prev];
        if (quantity > prev.length) {
            for (let i = prev.length; i < quantity; i++) newMats.push('');
        } else {
            return newMats.slice(0, quantity);
        }
        return newMats;
    });

    // Sync Corso Studi array length
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
          // Force navigate back to home and replace history to prevent going back
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
          
          const updatedData = {
              ...editForm,
              date: isoDate,
              // If we are forcing both, make sure backend receives both true if one is true
              requiresCorsoStudi: editForm.requiresMatricola // Since they are coupled in the UI
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found or expired</div>;

  // --- PRICE CALCULATION (SAFE MATH) ---
  // 1. Pulisci il prezzo base dal DB (es. 10.00)
  const safeBasePrice = Number(Number(event.price).toFixed(2));

  // 2. Converti in Centesimi INTERI (es. 1000)
  const priceInCents = Math.round(safeBasePrice * 100);

  const isFree = priceInCents === 0;

  // 3. Aggiungi la Fee (0 o 40 centesimi fissi)
  const feeInCents = isFree ? 0 : 40; 

  // 4. Totale in Centesimi
  const totalPerTicketCents = priceInCents + feeInCents;

  // 5. Totale Ordine
  const totalOrderCents = totalPerTicketCents * quantity;

  // 6. Converti indietro in Euro per la visualizzazione
  const totalPricePerTicket = totalPerTicketCents / 100;
  const totalAmount = totalOrderCents / 100;
  
  // This is the price shown in large text (ticket price without fee)
  const finalPrice = safeBasePrice; 

  const remainingTickets = event.maxCapacity - event.ticketsSold;
  const isSoldOut = remainingTickets <= 0;
  const maxPurchaseLimit = Math.min(10, remainingTickets);
  const soldRatio = event.ticketsSold / event.maxCapacity;
  const isAlmostSoldOut = soldRatio >= 0.6 && !isSoldOut;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 relative">
      
      {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h2 className="text-xl font-bold text-gray-900">Edit Event</h2>
                      <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X className="w-6 h-6 text-gray-500" />
                      </button>
                  </div>
                  <form onSubmit={handleUpdate} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input 
                              type="text" value={editForm.title} 
                              onChange={e => setEditForm({...editForm, title: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                          />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                              <input 
                                  type="date" value={editForm.date} 
                                  onChange={e => setEditForm({...editForm, date: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                  required
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                              <input 
                                  type="text" value={editForm.time} 
                                  onChange={e => setEditForm({...editForm, time: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                  required
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input 
                              type="text" value={editForm.location} 
                              onChange={e => setEditForm({...editForm, location: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                          />
                      </div>

                      {/* Advanced Settings in Edit */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                               <input 
                                   type="checkbox" 
                                   id="editReqAcademicData"
                                   checked={editForm.requiresMatricola || false}
                                   onChange={e => {
                                       // Toggle BOTH
                                       setEditForm({
                                           ...editForm, 
                                           requiresMatricola: e.target.checked,
                                           requiresCorsoStudi: e.target.checked
                                       })
                                   }}
                                   className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                               />
                               <label htmlFor="editReqAcademicData" className="text-sm text-gray-700 font-medium cursor-pointer flex items-center">
                                   <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" />
                                   Richiedi Dati Accademici
                               </label>
                           </div>
                      </div>
                      
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">PR Lists</label>
                         <div className="flex gap-2 mb-2">
                             <input 
                                 type="text" 
                                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                 placeholder="Add list name"
                                 value={currentEditPrInput}
                                 onChange={e => setCurrentEditPrInput(e.target.value)}
                                 onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddPrList(); }}}
                             />
                             <button 
                                 type="button" 
                                 onClick={handleAddPrList}
                                 className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                             >
                                 Add
                             </button>
                         </div>
                         {editForm.prLists && editForm.prLists.length > 0 && (
                             <div className="flex flex-wrap gap-2 mt-2">
                                 {editForm.prLists.map((list, idx) => (
                                     <span key={idx} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                                         <List className="w-3 h-3 mr-1" />
                                         {list}
                                         <button type="button" onClick={() => handleRemovePrList(list)} className="ml-2 hover:text-red-600">
                                             <X className="w-3 h-3" />
                                         </button>
                                     </span>
                                 ))}
                             </div>
                         )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="url" value={editForm.image} 
                                onChange={e => setEditForm({...editForm, image: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {editForm.image && (
                                <img 
                                    src={editForm.image} 
                                    onError={(e) => e.currentTarget.style.display = 'none'} 
                                    alt="Preview" 
                                    className="w-10 h-10 rounded object-cover border" 
                                />
                            )}
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity</label>
                          <input 
                              type="number" value={editForm.maxCapacity} 
                              onChange={e => setEditForm({...editForm, maxCapacity: parseInt(e.target.value)})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                              min={event.ticketsSold}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea 
                              value={editForm.description} 
                              onChange={e => setEditForm({...editForm, description: e.target.value})}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                          />
                      </div>
                      <div className="pt-4 flex space-x-3">
                          <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                          <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 rounded-lg font-bold text-white hover:bg-indigo-700 flex items-center justify-center">
                              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2"/> Save Changes</>}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* DRAFT BANNER (Owner Only) */}
      {isOwner && event.status === 'draft' && (
          <div className="bg-yellow-100 text-yellow-800 text-center py-3 font-bold sticky top-16 z-30 flex justify-center items-center shadow-md">
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
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        
        {isOwner && (
            <div className="absolute top-24 right-4 sm:right-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 z-20">
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
                    className="bg-white/90 backdrop-blur hover:bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition cursor-pointer"
                >
                    <Pencil className="w-4 h-4 mr-2" />
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
            </div>
        )}

        <button 
            onClick={() => navigate('/')} 
            className="absolute top-24 left-4 sm:left-8 bg-white/20 backdrop-blur hover:bg-white/30 text-white p-2 rounded-full transition z-20"
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    {event.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap items-center text-gray-200 text-sm md:text-base gap-4 md:gap-8">
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        {event.time}
                    </div>
                    <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        {event.location}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            
            {/* Left Column: Description */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About the Event</h2>
                    <div className="prose prose-indigo text-gray-600 whitespace-pre-line leading-relaxed">
                        {event.longDescription}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                         <h3 className="text-lg font-bold text-gray-900 mb-4">Organized by</h3>
                         <div className="flex items-center">
                             <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg mr-4">
                                {typeof event.organization === 'object' ? event.organization.name.charAt(0) : 'A'}
                             </div>
                             <div>
                                 <p className="font-bold text-gray-900">{typeof event.organization === 'object' ? event.organization.name : 'Unknown'}</p>
                                 <Link 
                                    to={`/association/${typeof event.organization === 'object' ? event.organization._id : event.organization}`} 
                                    className="text-indigo-600 text-sm hover:underline"
                                 >
                                     View Profile
                                 </Link>
                             </div>
                         </div>
                    </div>
                </div>

                {/* OWNER STATS PANEL */}
                {isOwner && prStats && (
                    <div className="bg-indigo-900 rounded-2xl p-6 md:p-8 shadow-lg text-white">
                        <div className="flex items-center mb-6">
                             <BarChart className="w-6 h-6 mr-2 text-indigo-300" />
                             <h2 className="text-xl font-bold">Live Stats</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                             <div className="bg-indigo-800/50 p-4 rounded-xl border border-indigo-700/50">
                                 <p className="text-indigo-300 text-sm font-medium">Tickets Sold</p>
                                 <p className="text-2xl font-bold mt-1">{event.ticketsSold} / {event.maxCapacity}</p>
                             </div>
                             <div className="bg-indigo-800/50 p-4 rounded-xl border border-indigo-700/50">
                                 <p className="text-indigo-300 text-sm font-medium">Est. Revenue</p>
                                 <p className="text-2xl font-bold mt-1">€{(event.ticketsSold * event.price).toFixed(2)}</p>
                             </div>
                        </div>

                        <div>
                             <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3">Sales by PR List</h3>
                             <div className="space-y-2">
                                 {Object.entries(prStats)
                                    .filter(([key]) => key !== 'favorites')
                                    .map(([name, count]) => (
                                     <div key={name} className="flex justify-between items-center bg-indigo-800 p-2 px-3 rounded-lg">
                                         <span className="font-medium">{name}</span>
                                         <span className="font-bold bg-white text-indigo-900 px-2 rounded">{count}</span>
                                     </div>
                                 ))}
                                 {Object.keys(prStats).filter(k => k !== 'favorites').length === 0 && (
                                     <p className="text-indigo-400 text-sm italic">No sales recorded yet.</p>
                                 )}
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Ticket Purchase */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 font-medium">Price per person</span>
                            {isAlmostSoldOut && (
                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold flex items-center">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></span>
                                    Selling Fast
                                </span>
                            )}
                        </div>
                        <div className="flex items-baseline mb-6">
                            <span className="text-4xl font-extrabold text-gray-900">
                                {isFree ? 'Free' : `€${finalPrice.toFixed(2)}`}
                            </span>
                            {!isFree && <span className="text-gray-500 ml-2 text-sm">+ €0.40 fee</span>}
                        </div>

                        {/* Sold Out Logic */}
                        {isSoldOut ? (
                             <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                                 <h3 className="text-red-700 font-bold text-lg mb-1">Sold Out</h3>
                                 <p className="text-red-500 text-sm">Tickets are no longer available.</p>
                             </div>
                        ) : (
                            <>
                                {/* Quantity Selector */}
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl mb-6 border border-gray-200">
                                    <span className="font-medium text-gray-700">Quantity</span>
                                    <div className="flex items-center space-x-3">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(Math.min(maxPurchaseLimit, quantity + 1))}
                                            className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Ticket Inputs */}
                                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                    {ticketNames.map((name, idx) => (
                                        <div key={idx} className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                Ticket #{idx + 1}
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder={`Nome Cognome (Voucher ${idx + 1})`}
                                                value={name}
                                                onChange={(e) => handleNameChange(idx, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                            
                                            {/* Matricola Field if Required */}
                                            {event.requiresMatricola && (
                                                 <input 
                                                    type="text" 
                                                    placeholder={`Numero Matricola`}
                                                    value={ticketMatricolas[idx] || ''}
                                                    onChange={(e) => handleMatricolaChange(idx, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none mt-2"
                                                />
                                            )}

                                            {/* Corso Studi Field if Required */}
                                            {event.requiresCorsoStudi && (
                                                 <input 
                                                    type="text" 
                                                    placeholder={`Corso di Studi`}
                                                    value={ticketCorsoStudi[idx] || ''}
                                                    onChange={(e) => handleCorsoStudiChange(idx, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none mt-2"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* PR List Selection */}
                                {event.prLists && event.prLists.length > 0 && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona Lista (Opzionale)</label>
                                        <select 
                                            value={selectedPrList}
                                            onChange={(e) => setSelectedPrList(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none"
                                        >
                                            <option value="">-- Seleziona Lista --</option>
                                            <option value="Nessuna lista">Nessuna lista</option>
                                            {event.prLists.map(list => (
                                                <option key={list} value={list}>{list}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Total Summary */}
                                <div className="border-t border-gray-100 pt-4 mb-6">
                                    <div className="flex justify-between mb-1 text-gray-600">
                                        <span>{isFree ? '0' : `€${totalPricePerTicket.toFixed(2)}`} x {quantity}</span>
                                        <span>{isFree ? 'Free' : `€${totalAmount.toFixed(2)}`}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl text-gray-900 mt-2">
                                        <span>Total</span>
                                        <span>{isFree ? 'Free' : `€${totalAmount.toFixed(2)}`}</span>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex items-start mb-6">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-3 text-xs">
                                        <label htmlFor="terms" className="font-medium text-gray-600">
                                            Ho letto e accetto i <Link to="/terms" target="_blank" className="text-indigo-600 underline">Termini e Condizioni</Link>. 
                                            Sono consapevole che la Fee di servizio non è rimborsabile.
                                        </label>
                                    </div>
                                </div>

                                <button 
                                    onClick={handlePurchase}
                                    disabled={purchasing || !acceptedTerms}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition shadow-lg transform active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {purchasing ? (
                                        <span className="flex items-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Processing...
                                        </span>
                                    ) : (
                                        isFree ? 'Get Voucher' : 'Proceed to Payment'
                                    )}
                                </button>
                                
                                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Secure payment via Stripe
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
