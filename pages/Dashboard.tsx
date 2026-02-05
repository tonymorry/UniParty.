
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory, Event, User, UNIVERSITY_LOCATIONS, PRRequest } from '../types';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
    AlertTriangle, CheckCircle, Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock, 
    ShieldCheck, Lock, Info, Upload, FileText, TrendingUp, Briefcase, Ticket, LayoutDashboard, Calendar, Settings, GraduationCap, UserPlus, Key, Trash2, MapPin, Sparkles, BookOpen, Check
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'staff' | 'pr'>('overview');
  const [isConnecting, setIsConnecting] = useState(false);
  const [assocEvents, setAssocEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Accredited PR States
  const [accreditedPRs, setAccreditedPRs] = useState<User[]>([]);
  const [prRequests, setPrRequests] = useState<PRRequest[]>([]);
  const [loadingPR, setLoadingPR] = useState(false);

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
  const [scanType, setScanType] = useState<'entry_only' | 'entry_exit'>('entry_only');
  const [prLists, setPrLists] = useState<string[]>([]);

  const [creatingEvent, setCreatingEvent] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'active' | 'draft'>('active');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (['overview', 'create', 'staff', 'pr'].includes(tabParam as string)) {
        setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && user.role === UserRole.ASSOCIAZIONE) {
      setLoadingEvents(true);
      api.events.getByOrgId(user._id).then(setAssocEvents).finally(() => setLoadingEvents(false));
      fetchPRData();
    }
  }, [user]);

  const fetchPRData = async () => {
      setLoadingPR(true);
      try {
          const [requests, list] = await Promise.all([
              api.auth.getPRRequests(),
              api.auth.getAccreditedPRs()
          ]);
          setPrRequests(requests);
          setAccreditedPRs(list);
      } catch (e) { console.error(e); }
      finally { setLoadingPR(false); }
  };

  const handleTabChange = (tab: any) => {
      setActiveTab(tab);
      setSearchParams(tab !== 'overview' ? { tab } : {});
  };

  const handlePRAction = async (requestId: string, status: 'accepted' | 'rejected') => {
      try {
          await api.auth.updatePRRequest(requestId, status);
          fetchPRData();
      } catch (e) { alert("Errore"); }
  };

  const togglePRList = (name: string) => {
      setPrLists(prev => prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]);
  };

  const handleImageUpload = () => {
    window.cloudinary.createUploadWidget({ cloudName: 'db3bj2bgg', uploadPreset: 'wii81qid' }, (err: any, res: any) => {
        if (!err && res.event === "success") setImage(res.info.secure_url);
    }).open();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !city) return alert("Completa tutti i campi obbligatori");
    setCreatingEvent(true);
    try {
        const newEvent = await api.events.create({
            title, description, longDescription: description, date, time, location, city, image,
            maxCapacity: parseInt(maxCapacity), price: parseFloat(price), category,
            prLists, status: targetStatus, requiresMatricola: requiresAcademicData, 
            requiresCorsoStudi: requiresAcademicData, scanType
        });
        navigate(targetStatus === 'draft' ? `/events/${newEvent._id}` : '/');
    } catch (e: any) { alert(e.message); }
    finally { setCreatingEvent(false); }
  };

  if (!user || user.role !== UserRole.ASSOCIAZIONE) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
       <div className="max-w-5xl mx-auto space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <h1 className="text-3xl font-bold">Dashboard</h1>
               <div className="bg-gray-800 p-1 rounded-xl border border-gray-700 flex overflow-x-auto">
                   {['overview', 'create', 'pr', 'staff'].map(tab => (
                       <button 
                        key={tab} 
                        onClick={() => handleTabChange(tab)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${activeTab === tab ? 'bg-indigo-900 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                       >
                           {tab === 'pr' && prRequests.length > 0 && (
                               <span className="mr-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{prRequests.length}</span>
                           )}
                           {tab}
                       </button>
                   ))}
               </div>
           </div>

           {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <TrendingUp className="text-indigo-400 mb-2" />
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Eventi</p>
                        <p className="text-3xl font-black">{assocEvents.length}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <Users className="text-green-400 mb-2" />
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">PR Accreditati</p>
                        <p className="text-3xl font-black">{accreditedPRs.length}</p>
                    </div>
                </div>
           )}

           {activeTab === 'pr' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                   <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                       <h2 className="text-xl font-bold mb-4 flex items-center"><UserPlus className="mr-2 text-indigo-400" /> Richieste Pendenti</h2>
                       {prRequests.length === 0 ? <p className="text-gray-500 italic">Nessuna richiesta.</p> : (
                           <div className="space-y-3">
                               {prRequests.map(r => (
                                   <div key={r._id} className="bg-gray-900 p-4 rounded-xl flex items-center justify-between border border-gray-700">
                                       <div className="flex items-center gap-3">
                                           <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                               {(r.userId as User).profileImage && <img src={(r.userId as User).profileImage} className="w-full h-full object-cover" />}
                                           </div>
                                           <div>
                                               <p className="font-bold">{(r.userId as User).name} {(r.userId as User).surname}</p>
                                               <p className="text-xs text-gray-500">{(r.userId as User).email}</p>
                                           </div>
                                       </div>
                                       <div className="flex gap-2">
                                           <button onClick={() => handlePRAction(r._id, 'accepted')} className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition"><Check className="w-4 h-4" /></button>
                                           <button onClick={() => handlePRAction(r._id, 'rejected')} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"><X className="w-4 h-4" /></button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>

                   <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                       <h2 className="text-xl font-bold mb-4">I Tuoi PR ({accreditedPRs.length})</h2>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                           {accreditedPRs.map(pr => (
                               <div key={pr._id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-indigo-900/30 flex items-center justify-center text-indigo-400 font-bold">
                                       {pr.name.charAt(0)}
                                   </div>
                                   <div>
                                       <p className="font-bold">{pr.name}</p>
                                       <p className="text-[10px] text-gray-500 uppercase tracking-widest">PR Accreditato</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           )}

           {activeTab === 'create' && (
               <form onSubmit={handleCreateEvent} className="bg-gray-800 p-8 rounded-xl border border-gray-700 space-y-6">
                    <h2 className="text-2xl font-bold text-indigo-400">Nuovo Evento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" placeholder="Titolo" className="bg-gray-700 p-3 rounded-lg outline-none border border-gray-600" value={title} onChange={e => setTitle(e.target.value)} required />
                        <select className="bg-gray-700 p-3 rounded-lg outline-none border border-gray-600" value={category} onChange={e => setCategory(e.target.value as any)}>
                            {Object.values(EventCategory).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">Seleziona Liste PR Accreditate</label>
                        {accreditedPRs.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">Non hai ancora PR accreditati. Candidali dal profilo pubblico della tua associazione.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {accreditedPRs.map(pr => (
                                    <button 
                                        key={pr._id} 
                                        type="button" 
                                        onClick={() => togglePRList(pr.name)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold border transition ${prLists.includes(pr.name) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                                    >
                                        {pr.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* [Resto del form come Dashboard originale] */}
                    <button type="submit" disabled={creatingEvent} className="w-full bg-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">
                        {creatingEvent ? 'Pubblicazione...' : 'Pubblica Evento'}
                    </button>
               </form>
           )}
       </div>
    </div>
  );
};

export default Dashboard;
