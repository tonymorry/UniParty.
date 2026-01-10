import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Event, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, Info, Minus, Plus, Trash2, Pencil, X, Save, GraduationCap, BookOpen, ChevronRight, CheckCircle, ArrowLeft, DollarSign, Lock, Flag } from 'lucide-react';

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
      (typeof event.organization !== 'string' && (event.organization as any)._id === user._id)
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
    setTicketNames(prev => {
        const newNames = [...prev];
        if (quantity > prev.length) for (let i = prev.length; i < quantity; i++) newNames.push('');
        else return newNames.slice(0, quantity);
        return newNames;
    });
    setTicketMatricolas(prev => {
        const newMats = [...prev];
        if (quantity > prev.length) for (let i = prev.length; i < quantity; i++) newMats.push('');
        else return newMats.slice(0, quantity);
        return newMats;
    });
    setTicketCorsoStudi(prev => {
        const newCors = [...prev];
        if (quantity > prev.length) for (let i = prev.length; i < quantity; i++) newCors.push('');
        else return newCors.slice(0, quantity);
        return newCors;
    });
  }, [quantity]);

  const handlePurchase = async () => {
    if (!user) { navigate('/auth'); return; }
    if (user.role !== UserRole.STUDENTE) { alert("Solo gli studenti possono prenotare voucher."); return; }
    if (!acceptedTerms) { alert("Accetta i termini per procedere."); return; }

    if (event) {
      setPurchasing(true);
      try {
        await api.payments.createCheckoutSession(
            event._id, quantity, user._id, ticketNames, selectedPrList || "Nessuna lista",
            event.requiresMatricola ? ticketMatricolas : undefined,
            event.requiresCorsoStudi ? ticketCorsoStudi : undefined
        );
      } catch (error) { alert("Prenotazione fallita."); } finally { setPurchasing(false); }
    }
  };

  const handleDelete = async () => {
      if (!event || !window.confirm("Delete this event?")) return;
      setIsDeleting(true);
      try {
          await api.events.delete(event._id);
          navigate('/', { replace: true });
      } catch (e) { alert("Delete failed"); setIsDeleting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-slate-950">Not found</div>;

  const safeBasePrice = Number(Number(event.price).toFixed(2));
  const priceInCents = Math.round(safeBasePrice * 100);
  const isFree = priceInCents === 0;
  const feeInCents = isFree ? 0 : 40; 
  const totalAmount = ((priceInCents + feeInCents) * quantity) / 100;

  const isSoldOut = (event.maxCapacity - event.ticketsSold) <= 0;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 relative">
      
      {/* DRAFT BANNER - SMART ADJUSTMENT */}
      {isOwner && event.status === 'draft' && (
          <div className="fixed top-24 left-4 right-4 z-40 bg-amber-500 text-slate-900 text-center py-2 rounded-xl font-black text-xs uppercase tracking-tighter shadow-xl">
              DRAFT MODE - This event is not visible to public
          </div>
      )}

      <div className="h-[40vh] relative w-full overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3 inline-block shadow-lg">
                    {event.category}
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter">{event.title}</h1>
                <div className="flex flex-wrap items-center text-slate-300 text-sm gap-6">
                    <div className="flex items-center"><Calendar size={18} className="mr-2 text-indigo-400" /> {new Date(event.date).toLocaleDateString()}</div>
                    <div className="flex items-center"><Clock size={18} className="mr-2 text-indigo-400" /> {event.time}</div>
                    <div className="flex items-center"><MapPin size={18} className="mr-2 text-indigo-400" /> {event.location}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
                <div className="glass-card rounded-3xl p-8">
                    <h2 className="text-xl font-black text-white mb-6">Description</h2>
                    <p className="text-slate-400 leading-relaxed whitespace-pre-line">{event.longDescription}</p>
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 mr-4 border border-indigo-500/10">
                            {(event.organization as any).name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Organized by</p>
                            <p className="font-bold text-white">{(event.organization as any).name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                {/* PURCHASE SIDEBAR - SMART ADJUSTMENT */}
                <div className="sticky top-28 glass-card rounded-3xl p-8 space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Price per person</p>
                        <p className="text-4xl font-black text-white">{isFree ? 'FREE' : `€${safeBasePrice.toFixed(2)}`}</p>
                    </div>

                    {!isSoldOut && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/5">
                                <span className="text-sm font-bold ml-2">Quantity</span>
                                <div className="flex items-center">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-indigo-400"><Minus size={18}/></button>
                                    <span className="w-8 text-center font-black">{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="p-2 text-indigo-400"><Plus size={18}/></button>
                                </div>
                            </div>
                            <button onClick={handlePurchase} disabled={purchasing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition flex items-center justify-center">
                                {purchasing ? '...' : <><ChevronRight className="mr-2" /> Book Now</>}
                            </button>
                            <div className="flex items-start">
                                <input type="checkbox" id="terms" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1" />
                                <label htmlFor="terms" className="ml-2 text-[10px] text-slate-500">I accept Terms & Conditions</label>
                            </div>
                        </div>
                    )}
                    
                    {isOwner && (
                        <div className="pt-4 border-t border-white/5 flex gap-2">
                            <button onClick={handleDelete} className="flex-1 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/10 transition">Delete</button>
                            <button onClick={() => setIsEditing(true)} className="flex-1 py-2 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition">Edit</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;