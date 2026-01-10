import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory, Event, User, UNIVERSITY_LOCATIONS } from '../types';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
    AlertTriangle, CheckCircle, Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock, 
    ShieldCheck, Lock, Info, Upload, FileText, TrendingUp, Briefcase, Ticket, LayoutDashboard, Calendar, Settings, GraduationCap, UserPlus, Key, Trash2, MapPin
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'staff'>('overview');
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
  const [scanType, setScanType] = useState<'entry_only' | 'entry_exit'>('entry_only');
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

  useEffect(() => { setCity(''); }, [selectedRegion]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'create') setActiveTab('create');
    else if (tabParam === 'staff') setActiveTab('staff');
    else setActiveTab('overview');
  }, [searchParams]);

  useEffect(() => {
    if (user && user.role === UserRole.ASSOCIAZIONE) {
      setLoadingEvents(true);
      api.events.getByOrgId(user._id)
        .then(setAssocEvents)
        .catch(console.error)
        .finally(() => setLoadingEvents(false));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'staff' && user && user.role === UserRole.ASSOCIAZIONE) fetchStaff();
  }, [activeTab, user]);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
        const data = await api.auth.getStaffAccounts();
        setStaffList(data);
    } catch (e) { console.error(e); } finally { setLoadingStaff(false); }
  };

  const handleTabChange = (tab: 'overview' | 'create' | 'staff') => {
      setActiveTab(tab);
      setSearchParams(tab !== 'overview' ? { tab } : {});
  };

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    try {
      const link = await api.stripe.createConnectAccount(user!._id);
      if (link) window.location.href = link;
    } catch (error) { alert("Stripe error"); } finally { setIsConnecting(false); }
  };

  const handleAddPrList = () => {
      if (currentPrInput.trim() && !prLists.includes(currentPrInput.trim())) {
          setPrLists([...prLists, currentPrInput.trim()]);
          setCurrentPrInput('');
      }
  };

  const handleImageUpload = () => {
    const widget = window.cloudinary.createUploadWidget(
      { cloudName: 'db3bj2bgg', uploadPreset: 'wii81qid', multiple: false },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") setImage(result.info.secure_url);
      }
    );
    widget.open();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingEvent(true);
    try {
        const newEvent = await api.events.create({
            title, description, longDescription: description, date, time, location, city, image, 
            maxCapacity: parseInt(maxCapacity), price: parseFloat(price), category, prLists, 
            status: targetStatus, requiresMatricola: requiresAcademicData, requiresCorsoStudi: requiresAcademicData, scanType
        }, user);
        navigate(targetStatus === 'draft' ? `/events/${newEvent._id}` : '/');
    } catch (e) { alert("Error"); } finally { setCreatingEvent(false); }
  };

  const handleManageStaff = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsManagingStaff(true);
      try {
          await api.auth.createStaffAccount({ email: staffEmail, password: staffPassword });
          setStaffEmail(''); setStaffPassword(''); fetchStaff();
      } catch (e) { alert("Error"); } finally { setIsManagingStaff(false); }
  };

  if (!user || user.role !== UserRole.ASSOCIAZIONE) return null;

  const totalRevenue = assocEvents.reduce((acc, curr) => acc + (curr.ticketsSold * curr.price), 0);
  const totalTicketsSold = assocEvents.reduce((acc, curr) => acc + curr.ticketsSold, 0);

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
       <div className="max-w-5xl mx-auto px-4 pt-4">
           
           {/* Header & Tab Switcher - SMART STICKY ADJUSTMENT */}
           <div className="sticky top-24 z-40 mb-8 glass-panel p-4 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-center md:text-left">
                   <h1 className="text-2xl font-black text-white">Dashboard</h1>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{user.name}</p>
               </div>
               
               <div className="bg-white/5 p-1 rounded-2xl flex">
                   <button
                       onClick={() => handleTabChange('overview')}
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                   >
                       <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                       Overview
                   </button>
                   <button
                       onClick={() => handleTabChange('create')}
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                   >
                       <Plus className="w-3.5 h-3.5 mr-2" />
                       Create
                   </button>
                   <button
                       onClick={() => handleTabChange('staff')}
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center ${activeTab === 'staff' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                   >
                       <Users className="w-3.5 h-3.5 mr-2" />
                       Staff
                   </button>
               </div>
           </div>

           {activeTab === 'overview' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   {/* Stats Cards */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-6 rounded-2xl">
                            <TrendingUp className="w-5 h-5 text-indigo-400 mb-3" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Revenue</p>
                            <p className="text-2xl font-black text-white">€{totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl">
                            <Ticket className="w-5 h-5 text-pink-400 mb-3" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Tickets Sold</p>
                            <p className="text-2xl font-black text-white">{totalTicketsSold}</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl">
                            <CheckCircle className={`w-5 h-5 ${user.stripeOnboardingComplete ? 'text-green-400' : 'text-amber-400'} mb-3`} />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Stripe Status</p>
                            <button onClick={handleStripeConnect} className="text-white font-black hover:underline text-left">
                                {user.stripeOnboardingComplete ? 'Active' : 'Setup Required'}
                            </button>
                        </div>
                   </div>

                   {/* Event List */}
                   <div className="glass-card rounded-3xl p-6 md:p-8">
                        <h2 className="text-xl font-black text-white mb-6">Your Events</h2>
                        {loadingEvents ? (
                            <div className="text-center py-12 text-slate-500">Loading events...</div>
                        ) : assocEvents.length > 0 ? (
                            <div className="space-y-4">
                                {assocEvents.map(event => (
                                    <div key={event._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden mr-4 border border-white/10">
                                                <img src={event.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{event.title}</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(event.date).toLocaleDateString()} • {event.city}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-indigo-400">{event.ticketsSold}/{event.maxCapacity}</p>
                                                <p className="text-[10px] text-slate-500 font-bold">SOLD</p>
                                            </div>
                                            <Link to={`/events/${event._id}`} className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition">Manage</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 italic">No events found.</div>
                        )}
                   </div>
               </div>
           )}

           {activeTab === 'create' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="glass-card rounded-3xl overflow-hidden">
                 <form onSubmit={handleCreateEvent} className="p-6 md:p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                       <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Title</label>
                       <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="Event Title" />
                     </div>
                     <div>
                       <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Date</label>
                       <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                     </div>
                     <div>
                       <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Price (€)</label>
                       <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                     </div>
                   </div>
                   <button type="submit" disabled={creatingEvent} className="w-full py-4 bg-indigo-600 rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition">Create Event</button>
                 </form>
               </div>
             </div>
           )}

           {activeTab === 'staff' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card rounded-3xl p-6 md:p-8">
               <h2 className="text-xl font-black mb-6">Staff Management</h2>
               <form onSubmit={handleManageStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                 <input type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="Email" className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none" required />
                 <input type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} placeholder="Password" className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none" required />
                 <button type="submit" className="md:col-span-2 py-3 bg-indigo-600 rounded-2xl font-black">Add Staff</button>
               </form>
               <div className="space-y-3">
                 {staffList.map(s => (
                   <div key={s._id} className="p-4 rounded-2xl bg-white/5 flex justify-between items-center">
                     <span className="font-bold">{s.email}</span>
                     <button onClick={() => api.auth.deleteStaffAccount(s._id).then(fetchStaff)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-xl transition"><Trash2 size={18} /></button>
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