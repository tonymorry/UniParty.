import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory } from '../types';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock } from 'lucide-react';

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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // FIX: ABSOLUTE PRECISION PRICE PARSING
    // 1. Normalize separator (comma to dot)
    const cleanPriceStr = price.toString().replace(',', '.');
    const rawPrice = parseFloat(cleanPriceStr);

    if (isNaN(rawPrice) || rawPrice < 0) {
        alert("Prezzo non valido.");
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
           
           <div className="flex items-center justify-between">
               <h1 className="text-3xl font-bold text-gray-900">Dashboard Associazione</h1>
               <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                   {user.name}
               </span>
           </div>

           <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${user.stripeOnboardingComplete ? 'border-green-500' : 'border-orange-500'}`}>
               <div className="flex items-center justify-between">
                   <div className="flex items-center">
                       {user.stripeOnboardingComplete ? (
                           <div className="bg-green-100 p-3 rounded-full mr-4">
                               <CheckCircle className="w-6 h-6 text-green-600" />
                           </div>
                       ) : (
                           <div className="bg-orange-100 p-3 rounded-full mr-4">
                               <AlertTriangle className="w-6 h-6 text-orange-600" />
                           </div>
                       )}
                       <div>
                           <h2 className="text-xl font-bold text-gray-900">Stato Pagamenti</h2>
                           <p className="text-gray-600">
                               {user.stripeOnboardingComplete 
                                   ? "Il tuo account è connesso e pronto a ricevere pagamenti." 
                                   : "Connetti il tuo account Stripe per vendere biglietti."}
                           </p>
                       </div>
                   </div>
                   {!user.stripeOnboardingComplete && (
                       <button 
                           onClick={handleStripeConnect}
                           disabled={isConnecting}
                           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-md disabled:opacity-50"
                       >
                           {isConnecting ? 'Connessione...' : 'Connetti Stripe'}
                       </button>
                   )}
               </div>
           </div>

           {user.stripeOnboardingComplete ? (
               <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
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
                           <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><ImageIcon className="w-4 h-4 mr-1"/> Immagine (URL)</label>
                           <div className="flex gap-4">
                               <input 
                                   type="url" 
                                   value={image} 
                                   onChange={e => setImage(e.target.value)} 
                                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                   required
                                   placeholder="https://example.com/image.jpg"
                               />
                               {image && (
                                   <div className="w-16 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                       <img src={image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                   </div>
                               )}
                           </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                           <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><DollarSign className="w-4 h-4 mr-1"/> Prezzo Biglietto (€)</label>
                               <input 
                                   type="number" 
                                   value={price} 
                                   onChange={e => setPrice(e.target.value)} 
                                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                   required
                                   min="0"
                                   step="0.01"
                                   placeholder="0.00"
                               />
                               <p className="text-xs text-gray-500 mt-1">Imposta 0 per eventi gratuiti.</p>
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
           ) : (
               <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
                   <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                   <p className="text-lg font-medium">Completa la configurazione Stripe per creare eventi.</p>
               </div>
           )}
       </div>
    </div>
  );
};

export default Dashboard;