import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory } from '../types';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock, ShieldCheck, Lock, Info, Upload } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0'); // Keep as string for input
  const [date, setDate] = useState('');
  const [time, setTime] = useState('22:00');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [category, setCategory] = useState<EventCategory>(EventCategory.PARTY);
  
  // PR Lists State
  const [prLists, setPrLists] = useState<string[]>([]);
  const [currentPrInput, setCurrentPrInput] = useState('');

  const [creatingEvent, setCreatingEvent] = useState(false);

  if (!user || user.role !== UserRole.ASSOCIAZIONE) {
    return <div className="p-8">Access Denied</div>;
  }

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    try {
      const link = await api.stripe.createConnectAccount(user._id);
      if (link) {
          window.location.href = link;
      } else {
           // Mock simulation
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
    
    // Safety check: force price to 0 if stripe not connected
    const finalPriceStr = user.stripeOnboardingComplete ? price : '0';

    // FIX: ABSOLUTE PRECISION PRICE PARSING
    // 1. Normalize separator (comma to dot)
    const cleanPriceStr = finalPriceStr.toString().replace(',', '.');
    const rawPrice = parseFloat(cleanPriceStr);

    if (isNaN(rawPrice) || rawPrice < 0) {
        alert("Prezzo non valido.");
        return;
    }

    if (!image) {
        alert("Per favore carica un'immagine per l'evento.");
        return;
    }

    setCreatingEvent(true);
    try {
        await api.events.create({
            title,
            description,
            longDescription: description,
            date,
            time,
            location,
            image,
            maxCapacity: parseInt(maxCapacity),
            price: rawPrice,
            category,
            prLists
        }, user);

        alert("Evento creato con successo!");
        navigate('/');
    } catch (e: any) {
        console.error(e);
        alert("Errore creazione evento: " + (e.message || "Unknown"));
    } finally {
        setCreatingEvent(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-4xl mx-auto space-y-8">
           
           {/* Header */}
           <div className="flex items-center justify-between">
               <div>
                   <h1 className="text-3xl font-bold text-gray-900">Dashboard Associazione</h1>
                   <p className="text-gray-500 text-sm mt-1">Gestisci i tuoi eventi e le tue vendite.</p>
               </div>
               <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                   <ShieldCheck className="w-4 h-4 mr-2"/>
                   {user.name}
               </span>
           </div>

           {/* 1. SEZIONE STRIPE (Sempre Visibile) */}
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
                           <h2 className="text-xl font-bold text-gray-900">Configurazione Pagamenti</h2>
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

           {/* 2. LOGICA VISIBILITÀ FORM */}
           
           {/* STATO A: NON VERIFICATO */}
           {!user.isVerified ? (
               <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center shadow-sm">
                   <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <ShieldCheck className="w-8 h-8 text-yellow-600" />
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 mb-2">Account in attesa di approvazione</h2>
                   <p className="text-gray-600 max-w-lg mx-auto mb-6">
                       Grazie per esserti registrato. Il nostro team sta verificando i dati della tua associazione. 
                       Una volta approvato, potrai iniziare a pubblicare eventi.
                   </p>
                   <div className="inline-flex items-center text-sm text-yellow-800 bg-yellow-100 px-4 py-2 rounded-lg">
                       <Clock className="w-4 h-4 mr-2" />
                       Tempo stimato: 24-48 ore
                   </div>
               </div>
           ) : (
               /* STATO B & C: VERIFICATO (Mostra Form) */
               <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="bg-indigo-900 p-6 text-white">
                       <h2 className="text-xl font-bold flex items-center">
                           <Plus className="w-6 h-6 mr-2" />
                           Crea Nuovo Evento
                       </h2>
                       <p className="text-indigo-200 text-sm mt-1">Compila i dettagli del tuo prossimo evento.</p>
                   </div>
                   
                   <form onSubmit={handleCreateEvent} className="p-8 space-y-6">
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
                           
                           {/* PRICE INPUT (CONDITIONAL) */}
                           <div className="relative">
                               <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                   <DollarSign className="w-4 h-4 mr-1"/> Prezzo Biglietto (€)
                               </label>
                               
                               <div className="relative">
                                    <input 
                                        type="number" 
                                        // Force 0 if stripe not ready
                                        value={user.stripeOnboardingComplete ? price : '0'} 
                                        onChange={e => {
                                            if (user.stripeOnboardingComplete) setPrice(e.target.value);
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
                                       Abilita i pagamenti con Stripe per creare eventi a pagamento.
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
                           <p className="text-xs text-gray-500 mt-1">Gli studenti dovranno selezionare una di queste liste al momento dell'acquisto.</p>
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

                       <div className="pt-4">
                           <button 
                               type="submit" 
                               disabled={creatingEvent}
                               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-99 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                           >
                               {creatingEvent ? (
                                   <span className="flex items-center">
                                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                       Pubblicazione in corso...
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
    </div>
  );
};

export default Dashboard;