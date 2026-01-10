
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory, Event, User } from '../types';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
    AlertTriangle, CheckCircle, Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock, 
    ShieldCheck, Lock, Info, Upload, FileText, TrendingUp, Briefcase, Ticket, LayoutDashboard, Calendar, Settings, GraduationCap, UserPlus, Key, Trash2, MapPin
} from 'lucide-react';
import { CITIES } from '../context/LocationContext';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab State: 'overview', 'create', or 'staff'
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'staff'>('overview');

  const [isConnecting, setIsConnecting] = useState(false);
  
  // Overview Data State
  const [assocEvents, setAssocEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('22:00');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [image, setImage] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [category, setCategory] = useState<EventCategory>(EventCategory.PARTY);
  
  // Advanced Options
  const [requiresAcademicData, setRequiresAcademicData] = useState(false); 
  const [scanType, setScanType] = useState<'entry_only' | 'entry_exit'>('entry_only');

  // PR Lists State
  const [prLists, setPrLists] = useState<string[]>([]);
  const [currentPrInput, setCurrentPrInput] = useState('');

  const [creatingEvent, setCreatingEvent] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'active' | 'draft'>('active');

  // Staff Management State
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isManagingStaff, setIsManagingStaff] = useState(false);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Handle Query Param for Tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'create') {
        setActiveTab('create');
    } else if (tabParam === 'staff') {
        setActiveTab('staff');
    } else {
        setActiveTab('overview');
    }
  }, [searchParams]);

  // Fetch Events for Overview
  useEffect(() => {
    if (user && user.role === UserRole.ASSOCIAZIONE) {
      setLoadingEvents(true);
      api.events.getByOrgId(user._id)
        .then(setAssocEvents)
        .catch(console.error)
        .finally(() => setLoadingEvents(false));
    }
  }, [user]);

  // Fetch Staff Accounts
  useEffect(() => {
    if (activeTab === 'staff' && user && user.role === UserRole.ASSOCIAZIONE) {
        fetchStaff();
    }
  }, [activeTab, user]);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
        const data = await api.auth.getStaffAccounts();
        setStaffList(data);
    } catch (e) {
        console.error("Fetch staff error", e);
    } finally {
        setLoadingStaff(false);
    }
  };

  if (!user || user.role !== UserRole.ASSOCIAZIONE) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen">Access Denied</div>;
  }

  // Calculate Stats
  const totalEvents = assocEvents.length;
  const totalTicketsSold = assocEvents.reduce((acc, curr) => acc + curr.ticketsSold, 0);
  const totalRevenue = assocEvents.reduce((acc, curr) => acc + (curr.ticketsSold * curr.price), 0);

  const handleTabChange = (tab: 'overview' | 'create' | 'staff') => {
      setActiveTab(tab);
      setSearchParams(tab !== 'overview' ? { tab } : {});
  };

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    try {
      const link = await api.stripe.createConnectAccount(user._id);
      if (link) {
          window.location.href = link;
      } else {
           const confirmed = window.confirm("Simulating Stripe Onboarding. Click OK to finish.");
           if(confirmed) {
               await api.stripe.finalizeOnboarding(user._id);
               refreshUser();
           }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect Stripe");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAddPrList = () => {
      if (currentPrInput.trim() && !prLists.includes(currentPrInput.trim())) {
          setPrLists([...prLists, currentPrInput.trim()]);
          setCurrentPrInput('');
      }
  };

  const handleRemovePrList = (listToRemove: string) => {
      setPrLists(prLists.filter(list => list !== listToRemove));
  };

  const handleImageUpload = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'db3bj2bgg',
        uploadPreset: 'wii81qid',
        sources: ['local', 'url', 'camera', 'instagram'],
        multiple: false,
        maxFiles: 1,
        clientAllowedFormats: ["image"],
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setImage(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPriceStr = (user.stripeOnboardingComplete ? price : '0').toString().replace(',', '.');
    const tempPrice = parseFloat(cleanPriceStr);
    const numericPrice = isNaN(tempPrice) ? 0 : Number(tempPrice.toFixed(2));

    if (isNaN(numericPrice) || numericPrice < 0) {
        alert("Prezzo non valido.");
        return;
    }

    if (!image) {
        alert("Per favore carica un'immagine per l'evento.");
        return;
    }

    if (!city) {
        alert("Per favore seleziona una città universitaria.");
        return;
    }

    setCreatingEvent(true);
    try {
        const newEvent = await api.events.create({
            title,
            description,
            longDescription: description,
            date,
            time,
            location,
            city,
            image,
            maxCapacity: parseInt(maxCapacity),
            price: numericPrice,
            category,
            prLists,
            status: targetStatus,
            requiresMatricola: requiresAcademicData, 
            requiresCorsoStudi: requiresAcademicData, 
            scanType
        }, user);

        if (targetStatus === 'draft') {
            alert("Bozza salvata con successo!");
            navigate(`/events/${newEvent._id}`);
        } else {
            alert("Evento pubblicato con successo!");
            navigate('/');
        }
    } catch (e: any) {
        console.error(e);
        alert("Errore creazione evento: " + (e.message || "Unknown"));
    } finally {
        setCreatingEvent(false);
    }
  };

  const handleManageStaff = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!staffEmail || !staffPassword) return;

      setIsManagingStaff(true);
      try {
          await api.auth.createStaffAccount({ email: staffEmail, password: staffPassword });
          alert("Account Staff gestito con successo! Fornisci queste credenziali al tuo personale per lo scanner.");
          setStaffEmail('');
          setStaffPassword('');
          fetchStaff();
      } catch (e: any) {
          alert("Errore: " + e.message);
      } finally {
          setIsManagingStaff(false);
      }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo account staff?")) return;
    try {
        await api.auth.deleteStaffAccount(id);
        setStaffList(staffList.filter(s => s._id !== id));
    } catch (e: any) {
        alert("Errore: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
       <div className="max-w-5xl mx-auto space-y-6">
           
           {/* Header & Tab Switcher */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                   <h1 className="text-3xl font-bold text-white">Dashboard Associazione</h1>
                   <p className="text-gray-400 text-sm mt-1">Benvenuto, {user.name}.</p>
               </div>
               
               {/* Tab Switcher */}
               <div className="bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-700 flex">
                   <button
                       onClick={() => handleTabChange('overview')}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center ${activeTab === 'overview' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-400 hover:bg-gray-700'}`}
                   >
                       <LayoutDashboard className="w-4 h-4 mr-2" />
                       Panoramica
                   </button>
                   <button
                       onClick={() => handleTabChange('create')}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center ${activeTab === 'create' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-400 hover:bg-gray-700'}`}
                   >
                       <Plus className="w-4 h-4 mr-2" />
                       Crea Evento
                   </button>
                   <button
                       onClick={() => handleTabChange('staff')}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center ${activeTab === 'staff' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-400 hover:bg-gray-700'}`}
                   >
                       <Users className="w-4 h-4 mr-2" />
                       Staff
                   </button>
               </div>
           </div>

           {/* ==================================================================================
               TAB 1: PANORAMICA
               ================================================================================== */}
           {activeTab === 'overview' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className={`bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 ${user.stripeOnboardingComplete ? 'border-green-500' : 'border-blue-500'}`}>
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-start md:items-center">
                               {user.stripeOnboardingComplete ? (
                                   <div className="bg-green-900/30 p-3 rounded-full mr-4 shrink-0">
                                       <CheckCircle className="w-6 h-6 text-green-400" />
                                   </div>
                               ) : (
                                   <div className="bg-blue-900/30 p-3 rounded-full mr-4 shrink-0">
                                       <DollarSign className="w-6 h-6 text-blue-400" />
                                   </div>
                               )}
                               <div>
                                   <h2 className="text-xl font-bold text-white">Stato Pagamenti</h2>
                                   <p className="text-gray-400 text-sm">
                                       {user.stripeOnboardingComplete 
                                           ? "Il tuo account Stripe è attivo. Puoi ricevere pagamenti." 
                                           : "Connetti Stripe per poter vendere Voucher a pagamento."}
                                   </p>
                               </div>
                           </div>
                           {!user.stripeOnboardingComplete && (
                               <button 
                                   onClick={handleStripeConnect}
                                   disabled={isConnecting}
                                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-md disabled:opacity-50 whitespace-nowrap"
                               >
                                   {isConnecting ? 'Connessione...' : 'Connetti Stripe'}
                               </button>
                           )}
                       </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl shadow-sm p-6 flex items-center border border-gray-700">
                            <div className="p-3 rounded-full bg-indigo-900/30 text-indigo-400 mr-4">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Totale Ricavi</p>
                                <p className="text-2xl font-bold text-white">€{totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-gray-800 rounded-xl shadow-sm p-6 flex items-center border border-gray-700">
                            <div className="p-3 rounded-full bg-green-900/30 text-green-400 mr-4">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Biglietti Venduti</p>
                                <p className="text-2xl font-bold text-white">{totalTicketsSold}</p>
                            </div>
                        </div>
                        <div className="bg-gray-800 rounded-xl shadow-sm p-6 flex items-center border border-gray-700">
                            <div className="p-3 rounded-full bg-orange-900/30 text-orange-400 mr-4">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Eventi Creati</p>
                                <p className="text-2xl font-bold text-white">{totalEvents}</p>
                            </div>
                        </div>
                   </div>

                   <div className="bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 border border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                             <h2 className="text-xl font-bold text-white flex items-center">
                                <Briefcase className="w-6 h-6 mr-2 text-indigo-400" />
                                I Tuoi Eventi
                            </h2>
                        </div>
                        
                        {loadingEvents ? (
                            <div className="text-center py-8 text-gray-400">Caricamento eventi...</div>
                        ) : assocEvents.length > 0 ? (
                            <div className="divide-y divide-gray-700">
                                {assocEvents.map(event => (
                                    <div key={event._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between group gap-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gray-700 rounded-lg mr-4 overflow-hidden flex-shrink-0 border border-gray-600">
                                                <img src={event.image} className="w-full h-full object-cover" alt="" onError={(e) => (e.currentTarget.style.display = 'none')}/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white group-hover:text-indigo-400 transition line-clamp-1">{event.title}</h3>
                                                    {event.status === 'draft' && (
                                                        <span className="bg-yellow-900/30 text-yellow-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                                            BOZZA
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(event.date).toLocaleDateString()} • {event.city}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                            <div className="text-right">
                                                <div className="font-mono font-medium text-white text-sm">
                                                    {event.ticketsSold}/{event.maxCapacity}
                                                </div>
                                                <div className="text-xs text-green-400 font-semibold mt-1">
                                                    +€{(event.ticketsSold * event.price).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link 
                                                    to={`/events/${event._id}/attendees`}
                                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs font-bold transition flex items-center border border-gray-600"
                                                >
                                                    <Users className="w-3 h-3 mr-1" />
                                                    Lista
                                                </Link>
                                                <Link 
                                                    to={`/events/${event._id}`} 
                                                    className="px-3 py-1.5 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-400 rounded-lg text-xs font-bold transition border border-indigo-900/50"
                                                >
                                                    Gestisci
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-900 rounded-xl border border-dashed border-gray-700">
                                <p className="text-gray-400 mb-4">Non hai ancora creato nessun evento.</p>
                                <button onClick={() => handleTabChange('create')} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 text-white">
                                    Inizia ora
                                </button>
                            </div>
                        )}
                   </div>
               </div>
           )}

           {/* ==================================================================================
               TAB 2: CREA EVENTO
               ================================================================================== */}
           {activeTab === 'create' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                   {!user.isVerified ? (
                        <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-xl p-8 text-center shadow-sm">
                            <div className="w-16 h-16 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-yellow-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Account in attesa di approvazione</h2>
                            <p className="text-gray-400 max-w-lg mx-auto mb-6">
                                Il nostro team sta verificando i dati della tua associazione. 
                            </p>
                        </div>
                   ) : (
                       <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                           <div className="bg-indigo-900/30 p-6 text-white border-b border-gray-700">
                               <h2 className="text-xl font-bold flex items-center text-indigo-400">
                                   <Plus className="w-6 h-6 mr-2" />
                                   Crea Nuovo Evento
                               </h2>
                           </div>
                           
                           <form onSubmit={handleCreateEvent} className="p-6 md:p-8 space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div className="md:col-span-2">
                                       <label className="block text-sm font-medium text-gray-300 mb-1">Titolo Evento</label>
                                       <input 
                                           type="text" 
                                           value={title} 
                                           onChange={e => setTitle(e.target.value)} 
                                           className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
                                           required
                                           placeholder="Es. Halloween Party 2025"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center"><Tag className="w-4 h-4 mr-1 text-indigo-400"/> Categoria</label>
                                       <select 
                                           value={category}
                                           onChange={e => setCategory(e.target.value as EventCategory)}
                                           className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                       >
                                           {Object.values(EventCategory).map(c => (
                                               <option key={c} value={c}>{c}</option>
                                           ))}
                                       </select>
                                   </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div>
                                       <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center"><Clock className="w-4 h-4 mr-1 text-indigo-400"/> Data</label>
                                       <input 
                                           type="date" 
                                           value={date} 
                                           onChange={e => setDate(e.target.value)} 
                                           className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                           required
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-gray-300 mb-1">Ora</label>
                                       <input 
                                           type="time" 
                                           value={time} 
                                           onChange={e => setTime(e.target.value)} 
                                           className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                           required
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1 text-indigo-400"/> Città Universitaria</label>
                                       <select 
                                           value={city}
                                           onChange={e => setCity(e.target.value)}
                                           className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                           required
                                       >
                                           <option value="">Seleziona Città...</option>
                                           {CITIES.map(c => (
                                               <option key={c} value={c}>{c}</option>
                                           ))}
                                       </select>
                                   </div>
                               </div>

                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-1">Indirizzo Specifico (Location)</label>
                                   <input 
                                       type="text" 
                                       value={location} 
                                       onChange={e => setLocation(e.target.value)} 
                                       className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
                                       required
                                       placeholder="Es. Via Roma 123, locale X"
                                   />
                               </div>

                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center"><ImageIcon className="w-4 h-4 mr-1 text-indigo-400"/> Immagine Evento</label>
                                   <div className="flex gap-4 items-center">
                                       <button
                                           type="button"
                                           onClick={handleImageUpload}
                                           className="flex items-center px-4 py-2.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition font-medium border border-gray-600"
                                       >
                                           <Upload className="w-4 h-4 mr-2" />
                                           Carica Immagine
                                       </button>
                                       {image && (
                                           <div className="w-16 h-10 rounded-lg overflow-hidden border border-gray-600 flex-shrink-0 relative group">
                                               <img src={image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                           </div>
                                       )}
                                   </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                   <div className="relative">
                                       <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                           <DollarSign className="w-4 h-4 mr-1 text-indigo-400"/> Prezzo Biglietto (€)
                                       </label>
                                       <div className="relative">
                                            <input 
                                                type="number" 
                                                value={user.stripeOnboardingComplete ? price : '0'} 
                                                onChange={e => {
                                                    if (user.stripeOnboardingComplete) setPrice(e.target.value);
                                                }} 
                                                disabled={!user.stripeOnboardingComplete}
                                                className={`w-full px-4 py-2 border rounded-lg outline-none transition
                                                    ${!user.stripeOnboardingComplete 
                                                        ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
                                                        : 'bg-gray-700 border-gray-600 focus:ring-2 focus:ring-indigo-500 text-white'
                                                    }
                                                `}
                                                required
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                            {!user.stripeOnboardingComplete && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <Lock className="h-4 w-4 text-gray-500" />
                                                </div>
                                            )}
                                       </div>
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center"><Users className="w-4 h-4 mr-1 text-indigo-400"/> Capacità Massima</label>
                                       <input 
                                           type="number" 
                                           value={maxCapacity} 
                                           onChange={e => setMaxCapacity(e.target.value)} 
                                           className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                           required
                                           min="1"
                                       />
                                   </div>
                               </div>
                               
                               <div className="pt-4 flex gap-4">
                                   <button 
                                       type="submit" 
                                       onClick={() => setTargetStatus('draft')}
                                       disabled={creatingEvent}
                                       className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-4 rounded-xl shadow-md transition border border-gray-600"
                                   >
                                       Salva come Bozza
                                   </button>
                                   <button 
                                       type="submit" 
                                       onClick={() => setTargetStatus('active')}
                                       disabled={creatingEvent}
                                       className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition"
                                   >
                                       Pubblica Evento
                                   </button>
                               </div>
                           </form>
                       </div>
                   )}
               </div>
           )}

           {/* ==================================================================================
               TAB 3: GESTIONE STAFF (NEW)
               ================================================================================== */}
           {activeTab === 'staff' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                   <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                       <div className="bg-indigo-900/30 p-6 text-white border-b border-gray-700">
                           <h2 className="text-xl font-bold flex items-center text-indigo-400">
                               <Users className="w-6 h-6 mr-2" />
                               Gestione Account Staff Temporaneo
                           </h2>
                           <p className="text-gray-400 text-sm mt-1">
                               Crea o aggiorna un account delegato per scansionare i voucher all'ingresso.
                           </p>
                       </div>
                       
                       <form onSubmit={handleManageStaff} className="p-6 md:p-8 space-y-4">
                           <div className="bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
                               <div className="flex">
                                   <Info className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                                   <p className="text-sm text-amber-200">
                                       Questi account hanno accesso <strong>solo allo scanner</strong>. Possono validare voucher esclusivamente per i tuoi eventi.
                                   </p>
                               </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                       <UserPlus className="w-4 h-4 mr-1 text-indigo-400" />
                                       Email Staff
                                   </label>
                                   <input 
                                       type="email" 
                                       value={staffEmail}
                                       onChange={e => setStaffEmail(e.target.value)}
                                       placeholder="staff-nome@uniparty.it"
                                       className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
                                       required
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                       <Key className="w-4 h-4 mr-1 text-indigo-400" />
                                       Nuova Password
                                   </label>
                                   <input 
                                       type="password" 
                                       value={staffPassword}
                                       onChange={e => setStaffPassword(e.target.value)}
                                       placeholder="Password sicura"
                                       className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
                                       required
                                   />
                               </div>
                           </div>
                           
                           <div className="pt-4">
                               <button 
                                   type="submit" 
                                   disabled={isManagingStaff}
                                   className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-xl shadow-md transition disabled:opacity-50"
                               >
                                   {isManagingStaff ? "Salvataggio..." : "Crea / Aggiorna Staff"}
                               </button>
                           </div>
                       </form>

                       {/* Staff List Section */}
                       <div className="p-6 md:p-8 border-t border-gray-700">
                           <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                               <List className="w-5 h-5 mr-2 text-indigo-400" />
                               Membri Staff Attivi
                           </h3>
                           {loadingStaff ? (
                               <div className="text-center py-4 text-gray-400">Caricamento staff...</div>
                           ) : staffList.length > 0 ? (
                               <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
                                   <div className="divide-y divide-gray-700">
                                       {staffList.map(staff => (
                                           <div key={staff._id} className="p-4 flex items-center justify-between hover:bg-gray-700 transition">
                                               <div className="flex items-center">
                                                   <div className="w-10 h-10 rounded-full bg-indigo-900/40 flex items-center justify-center text-indigo-400 mr-4">
                                                       <Users className="w-5 h-5" />
                                                   </div>
                                                   <div>
                                                       <p className="font-bold text-white">{staff.email}</p>
                                                       <p className="text-xs text-gray-500">Creato il {new Date(staff.createdAt!).toLocaleDateString()}</p>
                                                   </div>
                                               </div>
                                               <button 
                                                   onClick={() => handleDeleteStaff(staff._id)}
                                                   className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                                                   title="Elimina Staff"
                                               >
                                                   <Trash2 className="w-5 h-5" />
                                               </button>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           ) : (
                               <div className="text-center py-8 bg-gray-900 rounded-xl border border-dashed border-gray-700 text-gray-500 text-sm">
                                   Nessun account staff creato.
                               </div>
                           )}
                       </div>
                   </div>
               </div>
           )}

       </div>
    </div>
  );
};

export default Dashboard;
