import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Event, Ticket, UserRole, Report } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User as UserIcon, Calendar, CheckCircle, XCircle, Trash2, RefreshCw, Ticket as TicketIcon, Search, Filter, BarChart, Flag, MessageCircle, AlertTriangle } from 'lucide-react';

type UserFilter = 'all' | 'studente' | 'associazione';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = (searchParams.get('tab') as 'users' | 'events' | 'reports') || 'users';
  
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');

  // Moderation State
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isModModalOpen, setIsModModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [modTargetEvent, setModTargetEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!user || user.role !== UserRole.ADMIN) {
        navigate('/');
        return;
    }
    fetchData();
  }, [user, navigate, activeTab]);

  const fetchData = async () => {
      setLoading(true);
      try {
          if (activeTab === 'users') {
              const data = await api.admin.getAllUsers();
              setUsers(data);
          } else if (activeTab === 'events') {
              const data = await api.admin.getAllEvents();
              setEvents(data);
          } else {
              const data = await api.reports.getAll();
              setReports(data);
          }
      } catch (e) {
          console.error("Admin fetch error", e);
      } finally {
          setLoading(false);
      }
  };

  const handleTabChange = (tab: 'users' | 'events' | 'reports') => {
      setSearchParams({ tab });
  };

  const handleDismissReport = async (reportId: string) => {
      if (!window.confirm("Ignorare questa segnalazione?")) return;
      try {
          await api.reports.dismiss(reportId);
          fetchData();
      } catch (err) { alert("Errore"); }
  };

  const openModModal = (event: Event, reportId: string) => {
      setModTargetEvent(event);
      setSelectedReportId(reportId);
      setIsModModalOpen(true);
  };

  const handleDeleteWithReason = async () => {
      if (!modTargetEvent || !deleteReason.trim()) return;
      try {
          await api.admin.deleteEventWithReason(modTargetEvent._id, deleteReason);
          alert("Evento eliminato e associazione notificata.");
          setIsModModalOpen(false);
          setDeleteReason('');
          fetchData();
      } catch (err) { alert("Errore"); }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) && (userFilter === 'all' || u.role === userFilter));
  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!user || user.role !== UserRole.ADMIN) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center">
                <Shield className="w-10 h-10 text-indigo-900 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="bg-white rounded-lg shadow p-2 flex space-x-2">
                <button onClick={() => handleTabChange('users')} className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Utenti</button>
                <button onClick={() => handleTabChange('events')} className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Eventi</button>
                <button onClick={() => handleTabChange('reports')} className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <div className="flex items-center"><Flag className="w-4 h-4 mr-2" /> Segnalazioni</div>
                </button>
            </div>
        </div>

        {activeTab !== 'reports' && (
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <input type="text" placeholder="Cerca..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
            </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {loading ? (
                <div className="p-12 text-center text-gray-500">Caricamento...</div>
            ) : (
                <>
                   {activeTab === 'users' && (
                       <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                               <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold uppercase">Utente</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Ruolo</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Azioni</th></tr></thead>
                               <tbody className="bg-white divide-y divide-gray-200">
                                   {filteredUsers.map(u => (
                                       <tr key={u._id}>
                                           <td className="px-6 py-4">{u.name} ({u.email})</td>
                                           <td className="px-6 py-4 capitalize">{u.role}</td>
                                           <td className="px-6 py-4">
                                               <button onClick={() => api.admin.verifyUser(u._id).then(fetchData)} className="text-indigo-600 hover:underline">{u.isVerified ? 'Revoca' : 'Verifica'}</button>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   )}

                   {activeTab === 'events' && (
                       <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                               <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold uppercase">Evento</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Org</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Azioni</th></tr></thead>
                               <tbody className="bg-white divide-y divide-gray-200">
                                   {filteredEvents.map(e => (
                                       <tr key={e._id}>
                                           <td className="px-6 py-4 font-medium">{e.title}</td>
                                           <td className="px-6 py-4 text-gray-500">{typeof e.organization === 'object' ? e.organization.name : 'Org'}</td>
                                           <td className="px-6 py-4">
                                               <button onClick={() => { setModTargetEvent(e); setIsModModalOpen(true); }} className="text-red-600 hover:underline">Elimina</button>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   )}

                   {activeTab === 'reports' && (
                       <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                               <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold uppercase">Evento Segnalato</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Motivo</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Segnalato da</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Azioni</th></tr></thead>
                               <tbody className="bg-white divide-y divide-gray-200">
                                   {reports.length > 0 ? reports.map(r => (
                                       <tr key={r._id}>
                                           <td className="px-6 py-4 flex items-center">
                                                <img src={r.eventId.image} className="w-8 h-8 rounded mr-3 object-cover" />
                                                <span className="font-medium">{r.eventId.title}</span>
                                           </td>
                                           <td className="px-6 py-4"><span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold">{r.reason}</span></td>
                                           <td className="px-6 py-4 text-sm">{r.reporterId.name}</td>
                                           <td className="px-6 py-4 text-sm font-medium space-x-3">
                                               <button onClick={() => openModModal(r.eventId, r._id)} className="text-red-600 hover:underline">Modera</button>
                                               <button onClick={() => handleDismissReport(r._id)} className="text-gray-500 hover:underline">Ignora</button>
                                           </td>
                                       </tr>
                                   )) : (
                                       <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Nessuna segnalazione in sospeso.</td></tr>
                                   )}
                               </tbody>
                           </table>
                       </div>
                   )}
                </>
            )}
        </div>
      </div>

      {/* MODERATION MODAL */}
      {isModModalOpen && modTargetEvent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="bg-red-600 p-6 text-white flex justify-between items-center">
                      <h3 className="text-xl font-bold flex items-center"><AlertTriangle className="mr-2" /> Moderazione Contenuto</h3>
                      <button onClick={() => setIsModModalOpen(false)}><XCircle /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-gray-700">Stai per rimuovere l'evento: <strong className="text-red-600">{modTargetEvent.title}</strong></p>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Motivazione rimozione (verrà inviata all'associazione)</label>
                          <textarea 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                            rows={4} 
                            placeholder="Es. Il contenuto viola i nostri termini relativi a..."
                            value={deleteReason}
                            onChange={e => setDeleteReason(e.target.value)}
                          />
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setIsModModalOpen(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl">Annulla</button>
                          <button 
                            onClick={handleDeleteWithReason} 
                            disabled={!deleteReason.trim()}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl disabled:opacity-50"
                          >Rimuovi Evento</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;