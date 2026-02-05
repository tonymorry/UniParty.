
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory, Event, User, UNIVERSITY_LOCATIONS, PRRequest } from '../types';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
    Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock, 
    ShieldCheck, Lock, Info, Upload, FileText, TrendingUp, Briefcase, Ticket, LayoutDashboard, Calendar, GraduationCap, UserPlus, Key, Trash2, MapPin, CheckCircle, XCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'staff' | 'pr'>('overview');
  const [isConnecting, setIsConnecting] = useState(false);
  const [assocEvents, setAssocEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('22:00');
  const [location, setLocation] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [city, setCity] = useState('');
  const [image, setImage] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [category, setCategory] = useState<EventCategory>(EventCategory.PARTY);
  const [requiresAcademicData, setRequiresAcademicData] = useState(false); 
  const [prLists, setPrLists] = useState<string[]>([]);
  const [currentPrInput, setCurrentPrInput] = useState('');

  // PR Management State
  const [prRequests, setPrRequests] = useState<PRRequest[]>([]);
  const [accreditedPRs, setAccreditedPRs] = useState<User[]>([]);
  const [loadingPR, setLoadingPR] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'create') setActiveTab('create');
    else if (tabParam === 'staff') setActiveTab('staff');
    else if (tabParam === 'pr') setActiveTab('pr');
    else setActiveTab('overview');
  }, [searchParams]);

  useEffect(() => {
    if (user && user.role === UserRole.ASSOCIAZIONE) {
      setLoadingEvents(true);
      api.events.getByOrgId(user._id).then(setAssocEvents).finally(() => setLoadingEvents(false));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'pr' && user && user.role === UserRole.ASSOCIAZIONE) {
      fetchPRData();
    }
  }, [activeTab, user]);

  const fetchPRData = async () => {
    setLoadingPR(true);
    try {
      const requests = await api.pr.getRequests();
      const list = await api.pr.getAccreditedList();
      setPrRequests(requests);
      setAccreditedPRs(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPR(false);
    }
  };

  const handleTabChange = (tab: 'overview' | 'create' | 'staff' | 'pr') => {
      setActiveTab(tab);
      setSearchParams(tab !== 'overview' ? { tab } : {});
  };

  const handlePrResponse = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      await api.pr.respondToRequest(id, status);
      fetchPRData();
      alert(`Richiesta ${status === 'accepted' ? 'accettata' : 'rifiutata'}.`);
    } catch (e) {
      alert("Errore nella risposta alla richiesta.");
    }
  };

  const handleRemovePR = async (id: string) => {
    if (!window.confirm("Rimuovere questo PR dalla tua lista?")) return;
    try {
      await api.pr.removePR(id);
      fetchPRData();
    } catch (e) {
      alert("Errore nella rimozione del PR.");
    }
  };

  const handleAddPrList = () => {
      if (currentPrInput.trim() && !prLists.includes(currentPrInput.trim())) {
          setPrLists([...prLists, currentPrInput.trim()]);
          setCurrentPrInput('');
      }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.events.create({
        title, description, longDescription: description, date, time, location, city, image, maxCapacity: parseInt(maxCapacity),
        price: parseFloat(price), category, prLists, requiresMatricola: requiresAcademicData, requiresCorsoStudi: requiresAcademicData
      });
      alert("Evento creato con successo!");
      navigate('/');
    } catch (e) {
      alert("Errore creazione evento.");
    }
  };

  if (!user || user.role !== UserRole.ASSOCIAZIONE) return <div className="p-8">Access Denied</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
       <div className="max-w-5xl mx-auto space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <h1 className="text-3xl font-bold">Dashboard Associazione</h1>
               <div className="bg-gray-800 p-1 rounded-xl border border-gray-700 flex overflow-x-auto max-w-full">
                   {(['overview', 'create', 'staff', 'pr'] as const).map(tab => (
                     <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab ? 'bg-indigo-900 text-indigo-100' : 'text-gray-400 hover:bg-gray-700'}`}
                     >
                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
                     </button>
                   ))}
               </div>
           </div>

           {activeTab === 'pr' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                 <h2 className="text-xl font-bold mb-6 flex items-center">
                   <UserPlus className="w-6 h-6 mr-2 text-indigo-400" /> Richieste Accreditamento PR
                 </h2>
                 {prRequests.length > 0 ? (
                   <div className="divide-y divide-gray-700">
                     {prRequests.map(req => (
                       <div key={req._id} className="py-4 flex items-center justify-between">
                         <div className="flex items-center">
                           <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 overflow-hidden">
                             {typeof req.userId !== 'string' && req.userId.profileImage && <img src={req.userId.profileImage} className="w-full h-full object-cover" />}
                           </div>
                           <div>
                             <p className="font-bold text-white">{typeof req.userId !== 'string' ? req.userId.name : 'Utente'}</p>
                             <p className="text-xs text-gray-500">{typeof req.userId !== 'string' ? req.userId.email : ''}</p>
                           </div>
                         </div>
                         <div className="flex gap-2">
                           <button onClick={() => handlePrResponse(req._id, 'accepted')} className="p-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50"><CheckCircle className="w-5 h-5" /></button>
                           <button onClick={() => handlePrResponse(req._id, 'rejected')} className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50"><XCircle className="w-5 h-5" /></button>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : <p className="text-gray-500 text-center">Nessuna richiesta in attesa.</p>}
               </div>

               <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                 <h2 className="text-xl font-bold mb-6 flex items-center">
                   <Users className="w-6 h-6 mr-2 text-indigo-400" /> I Tuoi PR Accreditati
                 </h2>
                 {accreditedPRs.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {accreditedPRs.map(pr => (
                       <div key={pr._id} className="p-4 bg-gray-900/50 rounded-xl flex items-center justify-between border border-gray-700">
                         <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 overflow-hidden">
                              {pr.profileImage && <img src={pr.profileImage} className="w-full h-full object-cover" />}
                            </div>
                            <span className="font-bold">{pr.name}</span>
                         </div>
                         <button onClick={() => handleRemovePR(pr._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-5 h-5" /></button>
                       </div>
                     ))}
                   </div>
                 ) : <p className="text-gray-500 text-center">Nessun PR accreditato.</p>}
               </div>
             </div>
           )}

           {activeTab === 'create' && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <form onSubmit={handleCreateEvent} className="space-y-6">
                  <h2 className="text-xl font-bold text-indigo-400">Crea Evento</h2>
                  <input type="text" placeholder="Titolo" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-gray-700 rounded" required />
                  <textarea placeholder="Descrizione" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-gray-700 rounded" required />
                  
                  <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gestione Liste PR</label>
                    
                    {accreditedPRs.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Seleziona dai tuoi PR accreditati:</p>
                        <div className="flex flex-wrap gap-2">
                          {accreditedPRs.map(pr => (
                            <button
                              key={pr._id}
                              type="button"
                              onClick={() => { if(!prLists.includes(pr.name)) setPrLists([...prLists, pr.name]) }}
                              className="px-3 py-1 bg-indigo-900/30 text-indigo-300 text-xs rounded-full border border-indigo-900/50 hover:bg-indigo-900/50"
                            >
                              + {pr.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mb-3">
                      <input type="text" value={currentPrInput} onChange={e => setCurrentPrInput(e.target.value)} placeholder="Aggiungi nome manuale..." className="flex-1 p-2 bg-gray-700 rounded" />
                      <button type="button" onClick={handleAddPrList} className="bg-indigo-600 px-4 py-2 rounded">Aggiungi</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prLists.map(list => (
                        <span key={list} className="bg-gray-800 text-indigo-300 px-3 py-1 rounded-full text-xs flex items-center">
                          {list} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setPrLists(prLists.filter(l => l !== list))} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-indigo-600 rounded-xl font-bold">Pubblica Evento</button>
                </form>
              </div>
           )}

           {activeTab === 'overview' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center">
                    <TrendingUp className="w-8 h-8 mr-4 text-indigo-400" />
                    <div><p className="text-xs text-gray-500">Ricavi</p><p className="text-xl font-bold">€{assocEvents.reduce((acc, e) => acc + (e.ticketsSold * e.price), 0).toFixed(2)}</p></div>
                  </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h2 className="text-lg font-bold mb-4">Eventi Recenti</h2>
                  {assocEvents.map(e => (
                    <div key={e._id} className="py-2 flex justify-between items-center border-b border-gray-700 last:border-0">
                      <span>{e.title}</span>
                      <span className="text-gray-500 text-sm">{e.ticketsSold}/{e.maxCapacity}</span>
                    </div>
                  ))}
                </div>
             </div>
           )}
       </div>
    </div>
  );
};

export default Dashboard;
