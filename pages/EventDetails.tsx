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

  const handlePurchase = async () => {
    if (!user) { navigate('/auth'); return; }
    if (user.role !== UserRole.STUDENTE) { alert("Solo gli studenti possono prenotare voucher."); return; }
    if (ticketNames.some(name => name.trim() === '')) { alert("Inserisci il nome per ogni voucher."); return; }
    if (!acceptedTerms) { alert("Devi accettare i Termini del Servizio per procedere."); return; }

    if (event) {
      setPurchasing(true);
      try {
        const redirectUrl = await api.payments.createCheckoutSession(
            event._id, quantity, user._id, ticketNames, selectedPrList || "Nessuna lista",
            event.requiresMatricola ? ticketMatricolas : undefined,
            event.requiresCorsoStudi ? ticketCorsoStudi : undefined
        );
        if (redirectUrl) window.location.hash = redirectUrl;
      } catch (error) { alert("Prenotazione fallita."); } finally { setPurchasing(false); }
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
  const totalAmount = ((priceInCents + feeInCents) * quantity) / 100;
  const finalPrice = safeBasePrice; 
  const isSoldOut = (event.maxCapacity - event.ticketsSold) <= 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-12 relative">
      {/* Edit Modal (Omitted for brevity, assumed dark in Dashboard logic) */}
      
      <div className="h-[40vh] relative w-full">
        <img src={event.image} alt={event.title} onError={handleImageError} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        <button onClick={() => navigate('/')} className="absolute top-24 left-4 sm:left-8 bg-black/40 backdrop-blur hover:bg-black/60 text-white p-2 rounded-full transition z-20">
             <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    {event.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap items-center text-gray-300 text-sm md:text-base gap-4">
                    <div className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-indigo-400" />{new Date(event.date).toLocaleDateString()}</div>
                    <div className="flex items-center"><Clock className="w-5 h-5 mr-2 text-indigo-400" />{event.time}</div>
                    <div className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-indigo-400" />{event.location}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">About the Event</h2>
                    <p className="text-gray-400 whitespace-pre-line leading-relaxed">{event.longDescription}</p>
                    <div className="mt-8 pt-8 border-t border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4">Organized by</h3>
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-indigo-400 font-bold border border-gray-600">
                                {typeof event.organization === 'object' ? (event.organization as any).name?.charAt(0) : 'A'}
                            </div>
                            <div className="ml-4">
                                <span className="font-bold text-white">{typeof event.organization === 'object' ? (event.organization as any).name : 'Association'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 sticky top-24">
                     <div className="flex justify-between items-center mb-6">
                         <div>
                             <p className="text-sm text-gray-400 font-medium">Prezzo per persona</p>
                             <h3 className="text-3xl font-bold text-white">
                                 {isFree ? 'Gratis' : `€${finalPrice.toFixed(2)}`}
                             </h3>
                         </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-900 p-2 rounded-lg border border-gray-700">
                             <span className="text-sm font-medium text-gray-300 ml-2">Quantità</span>
                             <div className="flex items-center">
                                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-gray-700 rounded-md text-indigo-400 disabled:opacity-50" disabled={quantity <= 1}><Minus className="w-4 h-4" /></button>
                                 <span className="w-12 text-center font-bold text-white">{quantity}</span>
                                 <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-gray-700 rounded-md text-indigo-400"><Plus className="w-4 h-4" /></button>
                             </div>
                        </div>
                        {Array.from({ length: quantity }).map((_, i) => (
                            <div key={i} className="space-y-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                <input type="text" placeholder="Nome e Cognome" value={ticketNames[i]} onChange={e => {
                                    const n = [...ticketNames]; n[i] = e.target.value; setTicketNames(n);
                                }} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                        ))}
                     </div>

                     <div className="border-t border-gray-700 my-4 pt-4">
                         <div className="flex justify-between text-lg font-bold text-white">
                             <span>Totale</span>
                             <span>€{totalAmount.toFixed(2)}</span>
                         </div>
                     </div>

                     <button onClick={handlePurchase} disabled={isSoldOut || purchasing} className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition ${isSoldOut ? 'bg-gray-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                         {purchasing ? 'Elaborazione...' : isSoldOut ? 'Sold Out' : 'Prenota Ora'}
                     </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;