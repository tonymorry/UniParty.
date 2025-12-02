import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory, Event } from '../types';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
    AlertTriangle, CheckCircle, Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock, 
    ShieldCheck, Lock, Info, Upload, FileText, TrendingUp, Briefcase, Ticket, LayoutDashboard, Calendar, Settings
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
  const [longDescription, setLongDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('22:00');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [category, setCategory] = useState<EventCategory>(EventCategory.PARTY);
  
  // Advanced Options
  const [requiresMatricola, setRequiresMatricola] = useState(false);
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
      return (
          <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                  <h2 className="text-xl font-bold">Accesso Riservato</h2>
                  <p className="text-gray-500">Solo le associazioni possono accedere a questa dashboard.</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-semibold">Torna alla Home</button>
              </div>
          </div>
      );
  }

  const handleConnectStripe = async () => {
      setIsConnecting(true);
      try {
          const url = await api.stripe.createConnectAccount(user._id);
          window.location.href = url;
      } catch (e) {
          console.error("Stripe Connect Failed", e);
          alert("Errore connessione Stripe. Riprova.");
          setIsConnecting(false);
      }
  };

  const handleImageUpload = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'db3bj2bgg',
        uploadPreset: 'wii81qid',
        sources: ['local', 'url', 'camera'],
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

  const handleAddPrList = () => {
      if (currentPrInput.trim() && !prLists.includes(currentPrInput.trim())) {
          setPrLists([...prLists, currentPrInput.trim()]);
          setCurrentPrInput('');
      }
  };

  const handleRemovePrList = (list: string) => {
      setPrLists(prLists.filter(l => l !== list));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!user.stripeAccountId || !user.stripeOnboardingComplete) {
           if(parseFloat(price) > 0) {
               alert("Devi connettere Stripe per creare eventi a pagamento.");
               return;
           }
      }

      setCreatingEvent(true);
      try {
          const isoDate = new Date(date).toISOString();
          
          await api.events.create({
              title,
              description,
              longDescription,
              image,
              date: isoDate,
              time,
              location,
              price: parseFloat(price),
              maxCapacity: parseInt(maxCapacity),
              category,
              prLists,
              status: targetStatus,
              requiresMatricola,
              scanType
          }, user);

          alert("Evento creato con successo!");
          
          // Reset
          setTitle('');
          setDescription('');
          setLongDescription('');
          setPrice('0');
          setDate('');
          setLocation('');
          setImage('');
          setPrLists([]);
          setCreatingEvent(false);
          setActiveTab('overview');
          
          // Refresh
          setLoadingEvents(true);
          api.events.getByOrgId(user._id).then(setAssocEvents).finally(() => setLoadingEvents(false));

      } catch (err: any) {
          console.error(err);
          alert("Failed to create event: " + err.message);
          setCreatingEvent(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <LayoutDashboard className="w-8 h-8 text-indigo-600 mr-2" />
                  Dashboard
              </h1>
              <div className="flex space-x-2">
                   <button 
                      onClick={() => { setActiveTab('overview'); setSearchParams({}); }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                   >
                      Panoramica
                   </button>
                   <button 
                      onClick={() => { setActiveTab('create'); setSearchParams({tab: 'create'}); }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'create' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                   >
                      Crea Evento
                   </button>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* STRIPE STATUS BANNER */}
          {(!user.stripeAccountId || !user.stripeOnboardingComplete) && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
                  <div className="flex items-start mb-4 md:mb-0">
                      <div className="bg-orange-100 p-3 rounded-full mr-4">
                          <AlertTriangle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-orange-900">Configura Pagamenti</h3>
                          <p className="text-orange-700">Per vendere biglietti a pagamento, devi connettere il tuo account Stripe.</p>
                      </div>
                  </div>
                  <button 
                      onClick={handleConnectStripe}
                      disabled={isConnecting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition disabled:opacity-70 flex items-center"
                  >
                      {isConnecting ? 'Connessione...' : 'Connetti Stripe'}
                  </button>
              </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">I Tuoi Eventi</h2>
                      <Link to="/scanner" className="bg-indigo-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-800 transition">
                          <CheckCircle className="w-4 h-4 mr-2" /> Scanner
                      </Link>
                  </div>

                  {loadingEvents ? (
                      <div className="text-center py-12">Caricamento eventi...</div>
                  ) : assocEvents.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-gray-900">Nessun evento creato</h3>
                          <p className="text-gray-500 mb-6">Inizia a creare il tuo primo evento per vendere biglietti.</p>
                          <button onClick={() => { setActiveTab('create'); setSearchParams({tab: 'create'}); }} className="text-indigo-600 font-bold hover:underline">
                              Crea ora
                          </button>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {assocEvents.map(event => (
                              <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                  <div className="h-40 bg-gray-200 relative">
                                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                      <div className="absolute top-2 right-2">
                                          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${event.status === 'active' ? 'bg-green-100 text-green-800' : event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                              {event.status || 'Active'}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="p-5">
                                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{event.title}</h3>
                                      <p className="text-gray-500 text-sm mb-4">{new Date(event.date).toLocaleDateString()}</p>
                                      
                                      <div className="flex justify-between items-center text-sm mb-4">
                                          <div className="flex items-center text-gray-600">
                                              <Users className="w-4 h-4 mr-1" />
                                              {event.ticketsSold}/{event.maxCapacity}
                                          </div>
                                          <div className="font-bold text-indigo-600">
                                              €{(event.ticketsSold * event.price).toFixed(2)}
                                          </div>
                                      </div>

                                      <div className="flex gap-2">
                                          <Link to={`/events/${event._id}`} className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                              Dettagli
                                          </Link>
                                          <Link to={`/events/${event._id}/attendees`} className="flex-1 text-center py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100">
                                              Lista
                                          </Link>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* CREATE TAB */}
          {activeTab === 'create' && (
              <div className="max-w-3xl mx-auto">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="p-6 border-b border-gray-100 bg-gray-50">
                          <h2 className="text-xl font-bold text-gray-900">Nuovo Evento</h2>
                          <p className="text-gray-500 text-sm">Compila i dettagli per pubblicare un nuovo evento.</p>
                      </div>
                      
                      <form onSubmit={handleCreateEvent} className="p-6 space-y-6">
                          
                          {/* Basic Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Evento</label>
                                  <input 
                                      type="text" 
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                      value={title}
                                      onChange={e => setTitle(e.target.value)}
                                      required
                                  />
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                  <select 
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                      value={category}
                                      onChange={e => setCategory(e.target.value as EventCategory)}
                                  >
                                      {Object.values(EventCategory).map(c => (
                                          <option key={c} value={c}>{c}</option>
                                      ))}
                                  </select>
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
                                  <input 
                                      type="text" 
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                      value={location}
                                      onChange={e => setLocation(e.target.value)}
                                      required
                                  />
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                  <input 
                                      type="date" 
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                      value={date}
                                      onChange={e => setDate(e.target.value)}
                                      required
                                  />
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Orario Inizio</label>
                                  <input 
                                      type="time" 
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                      value={time}
                                      onChange={e => setTime(e.target.value)}
                                      required
                                  />
                              </div>
                          </div>

                          {/* Image */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Immagine Copertina</label>
                              <div className="flex items-center space-x-4">
                                  <button 
                                      type="button"
                                      onClick={handleImageUpload}
                                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition flex items-center"
                                  >
                                      <Upload className="w-4 h-4 mr-2" /> Carica
                                  </button>
                                  {image && (
                                      <div className="h-16 w-32 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                          <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Description */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Breve</label>
                              <textarea 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                  rows={2}
                                  value={description}
                                  onChange={e => setDescription(e.target.value)}
                                  required
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Completa (Opzionale)</label>
                              <textarea 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                  rows={4}
                                  value={longDescription}
                                  onChange={e => setLongDescription(e.target.value)}
                              />
                          </div>

                          {/* Ticket Info */}
                          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                              <h3 className="font-bold text-indigo-900 mb-4 flex items-center">
                                  <Ticket className="w-5 h-5 mr-2" /> Configurazione Biglietti
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€)</label>
                                      <div className="relative">
                                          <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                          <input 
                                              type="number" 
                                              min="0"
                                              step="0.01"
                                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                              value={price}
                                              onChange={e => setPrice(e.target.value)}
                                              required
                                          />
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">Imposta 0 per eventi gratuiti.</p>
                                  </div>

                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Capienza Massima</label>
                                      <input 
                                          type="number" 
                                          min="1"
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                          value={maxCapacity}
                                          onChange={e => setMaxCapacity(e.target.value)}
                                          required
                                      />
                                  </div>
                              </div>
                          </div>

                          {/* Advanced Options */}
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                  <Settings className="w-5 h-5 mr-2" /> Opzioni Avanzate
                              </h3>
                              
                              {/* PR Lists */}
                              <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Liste PR (Opzionale)</label>
                                  <div className="flex gap-2 mb-2">
                                      <input 
                                          type="text" 
                                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                          placeholder="Nome lista"
                                          value={currentPrInput}
                                          onChange={e => setCurrentPrInput(e.target.value)}
                                          onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddPrList(); }}}
                                      />
                                      <button 
                                          type="button" 
                                          onClick={handleAddPrList}
                                          className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                                      >
                                          Aggiungi
                                      </button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      {prLists.map((list, idx) => (
                                          <span key={idx} className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center shadow-sm">
                                              {list}
                                              <button type="button" onClick={() => handleRemovePrList(list)} className="ml-2 hover:text-red-600">
                                                  <X className="w-3 h-3" />
                                              </button>
                                          </span>
                                      ))}
                                  </div>
                              </div>
                              
                              {/* Academic/Scan Options */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                                      <input 
                                          type="checkbox" 
                                          id="reqMatricola"
                                          checked={requiresMatricola}
                                          onChange={e => setRequiresMatricola(e.target.checked)}
                                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor="reqMatricola" className="ml-2 block text-sm text-gray-900">
                                          Richiedi Matricola
                                          <p className="text-xs text-gray-500">Utile per seminari/CFU</p>
                                      </label>
                                  </div>
                                  
                                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modalità Scansione</label>
                                      <div className="flex items-center space-x-4">
                                          <label className="flex items-center">
                                              <input 
                                                  type="radio" 
                                                  name="scanType"
                                                  value="entry_only"
                                                  checked={scanType === 'entry_only'}
                                                  onChange={() => setScanType('entry_only')}
                                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                              />
                                              <span className="ml-2 text-sm text-gray-700">Solo Ingresso</span>
                                          </label>
                                          <label className="flex items-center">
                                              <input 
                                                  type="radio" 
                                                  name="scanType"
                                                  value="entry_exit"
                                                  checked={scanType === 'entry_exit'}
                                                  onChange={() => setScanType('entry_exit')}
                                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                              />
                                              <span className="ml-2 text-sm text-gray-700">Ingresso & Uscita</span>
                                          </label>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                  <label className="text-sm font-medium text-gray-700">Salva come:</label>
                                  <select 
                                      value={targetStatus}
                                      onChange={e => setTargetStatus(e.target.value as any)}
                                      className="border border-gray-300 rounded-md text-sm p-1"
                                  >
                                      <option value="active">Pubblico (Attivo)</option>
                                      <option value="draft">Bozza (Nascosto)</option>
                                  </select>
                              </div>
                              <button 
                                  type="submit" 
                                  disabled={creatingEvent}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition transform active:scale-95 disabled:opacity-70 flex items-center"
                              >
                                  {creatingEvent ? 'Creazione...' : 'Pubblica Evento'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Dashboard;