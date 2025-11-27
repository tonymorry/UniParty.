import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Event, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, Info, CreditCard, Minus, Plus, AlertCircle, User as UserIcon, Ban, Trash2, Pencil, X, Save, Image as ImageIcon, BarChart, List, Flame, Heart } from 'lucide-react';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [ticketNames, setTicketNames] = useState<string[]>(['']);
  const [selectedPrList, setSelectedPrList] = useState<string>(""); 

  // Owner Stats
  const [prStats, setPrStats] = useState<{ [key: string]: number } | null>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const [currentEditPrInput, setCurrentEditPrInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);

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
                  prLists: data.prLists || []
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
  }, [quantity]);

  const handleNameChange = (index: number, value: string) => {
      const newNames = [...ticketNames];
      newNames[index] = value;
      setTicketNames(newNames);
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

    if (event && event.prLists && event.prLists.length > 0 && selectedPrList === "") {
        alert("Seleziona una Lista PR (o 'Nessuna lista').");
        return;
    }

    if (event) {
      setPurchasing(true);
      try {
        const redirectUrl = await api.payments.createCheckoutSession(event._id, quantity, user._id, ticketNames, selectedPrList || "Nessuna lista");
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
              date: isoDate
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://picsum.photos/800/400?random=999"; 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found or expired</div>;

  const isFree = event.price === 0;
  
  // FIX: Use Integer Math (Cents) to guarantee precision
  const priceInCents = Math.round(Number(event.price) * 100);
  const feeInCents = isFree ? 0 : 40; // 40 cents fee
  const totalPerTicketCents = priceInCents + feeInCents;
  
  const totalPricePerTicket = totalPerTicketCents / 100;
  const totalAmount = (totalPerTicketCents * quantity) / 100;

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

      <div className="h-[40vh] relative w-full">
        <img 
            src={event.image} 
            alt={event.title} 
            onError={handleImageError}
            className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        
        {isOwner && (
            <div className="absolute top-24 right-4 sm:right-8 flex space-x-2 z-20">
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
                    className="bg-red-600/90 backdrop-blur hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting ? (
                        <span className="flex items-center">Deleting...</span>
                    ) : (
                        <span className="flex items-center"><Trash2 className="w-4 h-4 mr-2" /> Delete</span>
                    )}
                </button>
            </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-8">
            <div className="max-w-7xl mx-auto">
                 <span className="inline-block bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
                    {(typeof event.organization === 'object' && 'name' in event.organization) ? event.organization.name : 'Association Event'}
                 </span>
                 <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
                 <div className="flex items-center text-gray-200 space-x-6">
                    <span className="flex items-center"><Calendar className="w-5 h-5 mr-2"/> {new Date(event.date).toLocaleDateString()}</span>
                    <span className="flex items-center"><MapPin className="w-5 h-5 mr-2"/> {event.location}</span>
                 </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {event.longDescription || event.description}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Location & Time</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <MapPin className="w-6 h-6 text-indigo-600 mt-1 mr-3" />
                            <div>
                                <p className="font-semibold text-gray-900">{event.location}</p>
                                <p className="text-gray-500 text-sm">View on Map</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Clock className="w-6 h-6 text-indigo-600 mt-1 mr-3" />
                            <div>
                                <p className="font-semibold text-gray-900">{event.time}</p>
                                <p className="text-gray-500 text-sm">Doors open 30 mins prior</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                {/* CHECKOUT CARD */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">{isFree ? 'Prenota Ingresso' : 'Prenota Ingresso'}</h3>
                    
                    {isSoldOut && (
                         <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center justify-center mb-6 font-bold">
                            <Ban className="w-5 h-5 mr-2"/>
                            Sold Out
                         </div>
                    )}

                    <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">{isFree ? 'Ingresso Libero' : 'Ingresso Generale'}</p>
                            {!isFree && (
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                    <Info className="w-3 h-3 mr-1"/> Include €0.40 fee
                                </p>
                            )}
                             <p className="text-xs text-indigo-600 mt-1 font-semibold">
                                {isOwner 
                                    ? `${event.ticketsSold}/${event.maxCapacity} sold` 
                                    : isSoldOut 
                                        ? 'Sold Out' 
                                        : isAlmostSoldOut 
                                            ? 'Ultimi posti!' 
                                            : 'Voucher disponibili'
                                }
                             </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-indigo-600">
                                {isFree ? 'Free' : `€${totalPricePerTicket.toFixed(2)}`}
                            </p>
                        </div>
                    </div>

                    <div className={`flex items-center justify-between mb-6 ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}>
                        <span className="text-gray-600 font-medium">Quantità</span>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={isSoldOut}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition disabled:cursor-not-allowed"
                            >
                                <Minus className="w-4 h-4 text-gray-600"/>
                            </button>
                            <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(Math.min(maxPurchaseLimit, quantity + 1))}
                                disabled={isSoldOut || quantity >= maxPurchaseLimit}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4 text-gray-600"/>
                            </button>
                        </div>
                    </div>

                    {!isSoldOut && event.prLists && event.prLists.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Seleziona Lista PR <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select 
                                    value={selectedPrList}
                                    onChange={(e) => setSelectedPrList(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    required
                                >
                                    <option value="" disabled>Seleziona una lista</option>
                                    {event.prLists.map((list, idx) => (
                                        <option key={idx} value={list}>{list}</option>
                                    ))}
                                    <option value="Nessuna lista">Nessuna lista</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Ticket Names Inputs - INSIDE Card */}
                    {!isSoldOut && user && user.role === UserRole.STUDENTE && (
                        <div className="mb-6 space-y-3 border-t border-gray-100 pt-4">
                            <p className="text-sm font-semibold text-gray-700">Intestatari Voucher</p>
                            {Array.from({ length: quantity }).map((_, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder={`Nome sul Voucher #${idx + 1}`}
                                        value={ticketNames[idx] || ''}
                                        onChange={(e) => handleNameChange(idx, e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                            ))}
                            <p className="text-xs text-gray-400 mt-1">
                                Inserisci nome e cognome per ogni ingresso.
                            </p>
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-4 mb-6">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                            <span>Totale</span>
                            <span>€{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {user?.role === UserRole.ASSOCIAZIONE ? (
                         <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"/>
                            <span className="text-sm">Le associazioni non possono acquistare. Accedi come studente.</span>
                         </div>
                    ) : (
                        <button
                            onClick={() => {
                                if((!event.prLists || event.prLists.length === 0) && selectedPrList === "") {
                                    setSelectedPrList("Nessuna lista");
                                }
                                handlePurchase();
                            }}
                            disabled={purchasing || isSoldOut || (event.prLists && event.prLists.length > 0 && selectedPrList === "")}
                            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                                isSoldOut ? 'bg-gray-300 text-gray-500' : ''
                            }`}
                        >
                            {purchasing ? (
                                <span className="flex items-center">
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                    Elaborazione...
                                </span>
                            ) : isSoldOut ? (
                                'Sold Out'
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5 mr-2"/>
                                    {isFree ? 'Prenota Ingresso' : `Paga €${totalAmount.toFixed(2)}`}
                                </>
                            )}
                        </button>
                    )}
                    
                    {/* DISCLAIMER LEGALE */}
                    <p className="text-xs text-gray-500 mt-3 italic border-t border-gray-100 pt-2">
                      Nota: Il QR Code generato vale come voucher di prenotazione. Il titolo di accesso fiscale (SIAE) verrà emesso dall'organizzatore all'ingresso dell'evento.
                    </p>

                    {!isFree && !isSoldOut && (
                        <p className="text-center text-xs text-gray-400 mt-2">
                            Pagamento sicuro via Stripe. 
                        </p>
                    )}
                    {!user && (
                        <p className="text-center text-xs text-gray-500 mt-4">
                            Devi essere loggato per prenotare.
                        </p>
                    )}
                    
                    {user && user.role !== UserRole.STUDENTE && (
                        <p className="text-center text-xs text-red-500 mt-4">
                            Solo gli account Studente possono prenotare.
                        </p>
                    )}
                </div>

                {/* Owner Stats Section */}
                {isOwner && prStats && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <BarChart className="w-5 h-5 mr-2 text-indigo-600" />
                            Statistiche Liste PR
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(prStats).map(([name, count]) => (
                                <div key={name} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                    <span className="font-medium text-gray-700">{name === 'favorites' ? 'Preferiti' : name}</span>
                                    <span className={`px-2 py-1 rounded-md text-sm font-bold ${name === 'favorites' ? 'bg-pink-100 text-pink-800' : 'bg-indigo-100 text-indigo-800'}`}>{count}</span>
                                </div>
                            ))}
                            {Object.keys(prStats).length === 0 && (
                                <p className="text-gray-500 text-sm">Nessuna vendita.</p>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;