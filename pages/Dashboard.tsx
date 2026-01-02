

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory, Event } from '../types';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
    AlertTriangle, CheckCircle, Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock, 
    ShieldCheck, Lock, Info, Upload, FileText, TrendingUp, Briefcase, Ticket, LayoutDashboard, Calendar, Settings, GraduationCap
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab State: 'overview' or 'create'
  const [activeTab, setActiveTab] = useState<'overview' | 'create'>('overview');

  const [isConnecting, setIsConnecting] = useState(false);
  
  // Overview Data State (Moved from Profile)
  const [assocEvents, setAssocEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('22:00');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [category, setCategory] = useState<EventCategory>(EventCategory.PARTY);
  
  // Advanced Options
  const [requiresAcademicData, setRequiresAcademicData] = useState(false); // Controls both Matricola & Corso Studi
  const [scanType, setScanType] = useState<'entry_only' | 'entry_exit'>('entry_only');

  // PR Lists State
  const [prLists, setPrLists] = useState<string[]>([]);
  const [currentPrInput, setCurrentPrInput] = useState('');

  const [creatingEvent, setCreatingEvent] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'active' | 'draft'>('active');

  // Handle Query Param for Tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'create') {
        setActiveTab('create');
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

  if (!user || user.role !== UserRole.ASSOCIAZIONE) {
    return <div className="p-8">Access Denied</div>;
  }

  // Calculate Stats
  const totalEvents = assocEvents.length;
  const totalTicketsSold = assocEvents.reduce((acc, curr) => acc + curr.ticketsSold, 0);
  const totalRevenue = assocEvents.reduce((acc, curr) => acc + (curr.ticketsSold * curr.price), 0);

  const handleTabChange = (tab: 'overview' | 'create') => {
      setActiveTab(tab);
      setSearchParams(tab === 'create' ? { tab: 'create' } : {});
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
    
    // 1. Pulisci la stringa (gestione virgola/punto)
    const cleanPriceStr = (user.stripeOnboardingComplete ? price : '0').toString().replace(',', '.');
    const tempPrice = parseFloat(cleanPriceStr);

    // 2. FIX DEFINITIVO: Arrotondamento "Fixed"
    // Converte 14.9999 -> "15.00" -> 15
    // Questo assicura che al server arrivi un numero pulito a 2 decimali.
    const numericPrice = isNaN(tempPrice) ? 0 : Number(tempPrice.toFixed(2));

    if (isNaN(numericPrice) || numericPrice < 0) {
        alert("Prezzo non valido.");
        return;
    }

    if (!image) {
        alert("Per favore carica un'immagine per l'evento.");
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
            image,
            maxCapacity: parseInt(maxCapacity),
            price: numericPrice,
            category,
            prLists,
            status: targetStatus,
            requiresMatricola: requiresAcademicData, // Unified Flag
            requiresCorsoStudi: requiresAcademicData, // Unified Flag
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
       <div className="max-w-5xl mx-auto space-y-6">
           
           {/* Header & Tab Switcher */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                   <h1 className="text-3xl font-bold text-gray-900">Dashboard Associazione</h1>
                   <p className="text-gray-500 text-sm mt-1">Benvenuto, {user.name}.</p>
               </div>
               
               {/* Tab Switcher */}
               <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
                   <button
                       onClick={() => handleTabChange('overview')}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-50'}`}
                   >
                       <LayoutDashboard className="w-4 h-4 mr-2" />
                       Panoramica
                   </button>
                   <button
                       onClick={() => handleTabChange('create')}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center ${activeTab === 'create' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-50'}`}
                   >
                       <Plus className="w-4 h-4 mr-2" />
                       Crea Evento
                   </button>
               </div>
           </div>

           {/* ==================================================================================
               TAB 1: PANORAMICA (STATS & LISTA EVENTI)
               ================================================================================== */}
           {activeTab === 'overview' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   
                   {/* Stripe Status Section */}
                   <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${user.stripeOnboardingComplete ? 'border-green-500' : 'border-blue-500'}`}>
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-start md:items-center">
                               {user.stripeOnboardingComplete ? (
                                   <div className="bg-green-100 p-3 rounded-full mr-4 shrink-0">
                                       <CheckCircle className="w-6 h-6 text-green-600" />
                                   </div>
                               ) : (
                                   <div className="bg-blue-100 p-3 rounded-full mr-4 shrink-0">
                                       <DollarSign className="w-6 h-6 text-blue-600" />
                                   </div>
                               )}
                               <div>
                                   <h2 className="text-xl font-bold text-gray-900">Stato Pagamenti</h2>
                                   <p className="text-gray-600 text-sm">
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

                   {/* Dashboard Stats */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Totale Ricavi</p>
                                <p className="text-2xl font-bold text-gray-900">€{totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Biglietti Venduti</p>
                                <p className="text-2xl font-bold text-gray-900">{totalTicketsSold}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-orange-50 text-orange-600 mr-4">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Eventi Creati</p>
                                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                            </div>
                        </div>
                   </div>

                   {/* Events List */}
                   <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                             <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Briefcase className="w-6 h-6 mr-2 text-indigo-600" />
                                I Tuoi Eventi
                            </h2>
                            <button onClick={() => handleTabChange('create')} className="text-sm text-indigo-600 hover:underline">
                                + Nuovo Evento
                            </button>
                        </div>
                        
                        {loadingEvents ? (
                            <div className="text-center py-8">Caricamento eventi...</div>
                        ) : assocEvents.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {assocEvents.map(event => (
                                    <div key={event._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between group gap-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg mr-4 overflow-hidden flex-shrink-0">
                                                <img src={event.image} className="w-full h-full object-cover" alt="" onError={(e) => (e.currentTarget.style.display = 'none')}/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition line-clamp-1">{event.title}</h3>
                                                    {event.status === 'draft' && (
                                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                                            BOZZA
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                            <div className="text-right">
                                                <div className="font-mono font-medium text-gray-900 text-sm">
                                                    {event.ticketsSold}/{event.maxCapacity}
                                                </div>
                                                <div className="text-xs text-green-600 font-semibold mt-1">
                                                    +€{(event.ticketsSold * event.price).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link 
                                                    to={`/events/${event._id}/attendees`}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition flex items-center"
                                                >
                                                    <Users className="w-3 h-3 mr-1" />
                                                    Lista
                                                </Link>
                                                <Link 
                                                    to={`/events/${event._id}`} 
                                                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition"
                                                >
                                                    Gestisci
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500 mb-4">Non hai ancora creato nessun evento.</p>
                                <button onClick={() => handleTabChange('create')} className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    Inizia ora
                                </button>
                            </div>
                        )}
                   </div>
               </div>
           )}

           {/* ==================================================================================
               TAB 2: CREA EVENTO (FORM)
               ================================================================================== */}
           {activeTab === 'create' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                   {!user.isVerified ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center shadow-sm">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Account in attesa di approvazione</h2>
                            <p className="text-gray-600 max-w-lg mx-auto mb-6">
                                Il nostro team sta verificando i dati della tua associazione. 
                                Una volta approvato, potrai iniziare a pubblicare eventi.
                            </p>
                        </div>
                   ) : (
                       <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                           <div className="bg-indigo-900 p-6 text-white">
                               <h2 className="text-xl font-bold flex items-center">
                                   <Plus className="w-6 h-6 mr-2" />
                                   Crea Nuovo Evento
                               </h2>
                               <p className="text-indigo-200 text-sm mt-1">Compila i dettagli del tuo prossimo evento.</p>
                           </div>
                           
                           <form onSubmit={handleCreateEvent} className="p-6 md:p-8 space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div className="md:col-span-2">
                                       <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Evento</label>
                                       <input 
                                           type="text" 
                                           value={title} 
                                           onChange={e => setTitle(e.target.value)} 
                                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                           required
                                           placeholder="Es. Halloween Party 2025"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Tag className="w-4 h-4 mr-1"/> Categoria</label>
                                       <select 
                                           value={category}
                                           onChange={e => setCategory(e.target.value as EventCategory)}
                                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                       >
                                           {Object.values(EventCategory).map(c => (
                                               <option key={c} value={c}>{c}</option>
                                           ))}
                                       </select>
                                   </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Clock className="w-4 h-4 mr-1"/> Data</label>
                                       <input 
                                           type="date" 
                                           value={date} 
                                           onChange={e => setDate(e.target.value)} 
                                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                           required
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
                                       <input 
                                           type="time" 
                                           value={time} 
                                           onChange={e => setTime(e.target.value)} 
                                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                           required
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
                                       <input 
                                           type="text" 
                                           value={location} 
                                           onChange={e => setLocation(e.target.value)} 
                                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                           required
                                           placeholder="Nome del locale o indirizzo"
                                       />
                                   </div>
                               </div>

                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><ImageIcon className="w-4 h-4 mr-1"/> Immagine Evento</label>
                                   <div className="flex gap-4 items-center">
                                       <button
                                           type="button"
                                           onClick={handleImageUpload}
                                           className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
                                       >
                                           <Upload className="w-4 h-4 mr-2" />
                                           Carica Immagine
                                       </button>
                                       {image ? (
                                           <div className="w-16 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative group">
                                               <img src={image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                           </div>
                                       ) : (
                                           <span className="text-sm text-gray-400">Nessuna immagine selezionata</span>
                                       )}
                                   </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                   
                                   <div className="relative">
                                       <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                           <DollarSign className="w-4 h-4 mr-1"/> Prezzo Biglietto (€)
                                       </label>
                                       
                                       <div className="relative">
                                            <input 
                                                type="number" 
                                                value={user.stripeOnboardingComplete ? price : '0'} 
                                                onChange={e => {
                                                    if (user.stripeOnboardingComplete) setPrice(e.target.value);
                                                }} 
                                                onBlur={() => {
                                                    // Strict formatting on blur to prevent floating point confusion
                                                    if(price) {
                                                        const p = parseFloat(price.replace(',', '.'));
                                                        if(!isNaN(p)) {
                                                            setPrice(p.toFixed(2));
                                                        }
                                                    }
                                                }}
                                                disabled={!user.stripeOnboardingComplete}
                                                className={`w-full px-4 py-2 border rounded-lg outline-none transition
                                                    ${!user.stripeOnboardingComplete 
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                                        : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white'
                                                    }
                                                `}
                                                required
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                            {!user.stripeOnboardingComplete && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <Lock className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                       </div>

                                       {!user.stripeOnboardingComplete ? (
                                           <p className="text-xs text-orange-600 mt-1 flex items-center">
                                               <Info className="w-3 h-3 mr-1"/>
                                               Abilita i pagamenti per vendere Voucher.
                                           </p>
                                       ) : (
                                           <p className="text-xs text-gray-500 mt-1">Imposta 0 per eventi gratuiti.</p>
                                       )}
                                   </div>

                                   <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Users className="w-4 h-4 mr-1"/> Capacità Massima</label>
                                       <input 
                                           type="number" 
                                           value={maxCapacity} 
                                           onChange={e => setMaxCapacity(e.target.value)} 
                                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                           required
                                           min="1"
                                       />
                                   </div>
                               </div>
                               
                               {/* ADVANCED OPTIONS */}
                               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                   <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                                       <Settings className="w-4 h-4 mr-2" /> Opzioni Avanzate (Seminari / Accademico)
                                   </h3>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div>
                                           <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200">
                                               <input 
                                                   type="checkbox" 
                                                   id="reqAcademicData"
                                                   checked={requiresAcademicData}
                                                   onChange={e => setRequiresAcademicData(e.target.checked)}
                                                   className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                               />
                                               <label htmlFor="reqAcademicData" className="text-sm text-gray-700 font-medium cursor-pointer flex items-center">
                                                    <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" />
                                                    Richiedi Dati Accademici (Matricola e Corso di Studi)
                                                </label>
                                           </div>
                                       </div>
                                       
                                       <div className="bg-white p-3 rounded-lg border border-gray-200">
                                           <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo Scansione</label>
                                           <select 
                                               value={scanType}
                                               onChange={e => setScanType(e.target.value as any)}
                                               className="w-full text-sm bg-transparent outline-none font-medium text-gray-700"
                                           >
                                               <option value="entry_only">Solo Ingresso (Standard)</option>
                                               <option value="entry_exit">Ingresso & Uscita (Tracciamento ore)</option>
                                           </select>
                                       </div>
                                   </div>
                               </div>

                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><List className="w-4 h-4 mr-1"/> Liste PR (Opzionale)</label>
                                   <div className="flex gap-2 mb-2">
                                       <input 
                                           type="text" 
                                           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                           placeholder="Nome lista (es. Lista Marco)"
                                           value={currentPrInput}
                                           onChange={e => setCurrentPrInput(e.target.value)}
                                           onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddPrList(); }}}
                                       />
                                       <button 
                                           type="button" 
                                           onClick={handleAddPrList}
                                           className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                                       >
                                           Aggiungi
                                       </button>
                                   </div>
                                   {prLists.length > 0 && (
                                       <div className="flex flex-wrap gap-2 mt-2">
                                           {prLists.map((list, idx) => (
                                               <span key={idx} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
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
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Completa</label>
                                   <textarea 
                                       value={description} 
                                       onChange={e => setDescription(e.target.value)} 
                                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                                       required
                                       placeholder="Dettagli dell'evento, lineup, dress code..."
                                   ></textarea>
                               </div>

                               <div className="pt-4 flex gap-4">
                                   <button 
                                       type="submit" 
                                       onClick={() => setTargetStatus('draft')}
                                       disabled={creatingEvent}
                                       className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl shadow-md transition transform active:scale-99 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center border border-gray-300"
                                   >
                                       {creatingEvent && targetStatus === 'draft' ? 'Salvataggio...' : (
                                           <>
                                             <FileText className="w-5 h-5 mr-2" />
                                             Salva come Bozza
                                           </>
                                       )}
                                   </button>

                                   <button 
                                       type="submit" 
                                       onClick={() => setTargetStatus('active')}
                                       disabled={creatingEvent}
                                       className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-99 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                   >
                                       {creatingEvent && targetStatus === 'active' ? (
                                           <span className="flex items-center">
                                               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                               Pubblicazione...
                                           </span>
                                       ) : (
                                           "Pubblica Evento"
                                       )}
                                   </button>
                               </div>

                           </form>
                       </div>
                   )}
               </div>
           )}

       </div>
    </div>
  );
};

export default Dashboard;