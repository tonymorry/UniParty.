import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Event, Ticket, UserRole, Report } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User as UserIcon, Calendar, CheckCircle, XCircle, Trash2, RefreshCw, Ticket as TicketIcon, Search, Eye, Filter, BarChart, X, TrendingUp, DollarSign, Heart, GraduationCap, Clock, Users, Flag, AlertTriangle } from 'lucide-react';

type UserFilter = 'all' | 'studente' | 'associazione';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab State derived from URL
  const activeTab = (searchParams.get('tab') as 'users' | 'events' | 'reports') || 'users';
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');

  // Modal Ticket State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedUserTickets, setSelectedUserTickets] = useState<Ticket[]>([]);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Modal Stats State
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedEventStats, setSelectedEventStats] = useState<{ [key: string]: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Moderation Modal State
  const [isModModalOpen, setIsModModalOpen] = useState(false);
  const [modTargetEvent, setModTargetEvent] = useState<Event | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isModLoading, setIsModLoading] = useState(false);

  useEffect(() => {
    // Access Control
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
          } else if (activeTab === 'reports') {
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

  const handleVerifyUser = async (userId: string) => {
      if(!window.confirm("Cambiare stato di verifica utente?")) return;
      try {
          await api.admin.verifyUser(userId);
          fetchData(); // Refresh list
      } catch(e) {
          alert("Errore verifica utente");
      }
  };

  const handleRestoreUser = async (userId: string) => {
      if(!window.confirm("Ripristinare questo utente cancellato?")) return;
      try {
          await api.admin.restoreUser(userId);
          fetchData();
      } catch(e) {
          alert("Errore ripristino utente");
      }
  };

  const handleViewTickets = async (userId: string, userName: string) => {
      setIsTicketModalOpen(true);
      setSelectedUserName(userName);
      setModalLoading(true);
      try {
          const tickets = await api.admin.getUserTickets(userId);
          setSelectedUserTickets(tickets);
      } catch(e) {
          console.error("Failed to fetch tickets", e);
          setSelectedUserTickets([]);
      } finally {
          setModalLoading(false);
      }
  };

  const handleViewStats = async (event: Event) => {
      setIsStatsModalOpen(true);
      setSelectedEvent(event);
      setStatsLoading(true);
      try {
          const stats = await api.events.getEventStats(event._id);
          setSelectedEventStats(stats);
      } catch (e) {
          console.error("Failed to fetch stats", e);
          setSelectedEventStats(null);
      } finally {
          setStatsLoading(false);
      }
  };

  const handleOpenModeration = (event: Event) => {
      setModTargetEvent(event);
      setIsModModalOpen(true);
      setDeleteReason('');
  };

  const handleModDelete = async () => {
      if (!modTargetEvent || !deleteReason.trim()) return;
      setIsModLoading(true);
      try {
          await api.admin.deleteEventWithReason(modTargetEvent._id, deleteReason);
          alert("Evento rimosso e organizzatore notificato.");
          setIsModModalOpen(false);
          fetchData();
      } catch (err) {
          alert("Errore durante la rimozione.");
      } finally {
          setIsModLoading(false);
      }
  };

  const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = userFilter === 'all' || u.role === userFilter;
      return matchesSearch && matchesRole;
  });

  const filteredEvents = events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (typeof e.organization === 'object' && e.organization.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTicketStatusBadge = (ticket: Ticket) => {
      if (ticket.status === 'entered') {
          return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/30 text-yellow-500 border border-yellow-900/50">IN SALA</span>;
      }
      if (ticket.status === 'completed') {
          return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-900/30 text-blue-400 border border-blue-900/50">COMPLETATO</span>;
      }
      if (ticket.status === 'valid' || ticket.status === 'active' || (!ticket.used && !ticket.status)) {
          return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400 border border-green-900/50">VALIDO</span>;
      }
      // Fallback legacy used
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-gray-400 border border-gray-600">USATO</span>;
  };

  if (!user || user.role !== UserRole.ADMIN) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center">
                <Shield className="w-10 h-10 text-indigo-400 mr-3" />
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-2 border border-gray-700">
                <button 
                    onClick={() => handleTabChange('users')}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Utenti
                    </div>
                </button>
                <button 
                    onClick={() => handleTabChange('events')}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Eventi
                    </div>
                </button>
                <button 
                    onClick={() => handleTabChange('reports')}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    <div className="flex items-center">
                        <Flag className="w-4 h-4 mr-2" />
                        Segnalazioni
                    </div>
                </button>
            </div>
        </div>

        {/* Filter Bar */}
        {activeTab !== 'reports' && (
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <input 
                        type="text"
                        placeholder={activeTab === 'users' ? "Cerca utente per nome o email..." : "Cerca evento per titolo o organizzatore..."}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-white placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
                </div>

                {activeTab === 'users' && (
                    <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                        <Filter className="w-5 h-5 text-gray-500 mr-2" />
                        <select 
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value as UserFilter)}
                            className="bg-transparent outline-none text-gray-300 font-medium cursor-pointer"
                        >
                            <option value="all">Tutti i Ruoli</option>
                            <option value="studente">Studenti</option>
                            <option value="associazione">Associazioni</option>
                        </select>
                    </div>
                )}
            </div>
        )}

        {/* Content */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
            {loading ? (
                <div className="p-12 text-center text-gray-500">Caricamento dati...</div>
            ) : (
                <>
                   {activeTab === 'users' && (
                       <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-700">
                               <thead className="bg-gray-900/50">
                                   <tr>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utente</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruolo</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                   </tr>
                               </thead>
                               <tbody className="bg-gray-800 divide-y divide-gray-700">
                                   {filteredUsers.map(u => (
                                       <tr key={u._id} className={u.isDeleted ? 'bg-red-900/10' : ''}>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <div className="flex items-center">
                                                   <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/30 flex items-center justify-center text-indigo-400 font-bold border border-indigo-900/50">
                                                       {u.name.charAt(0)}
                                                   </div>
                                                   <div className="ml-4">
                                                       <div className="text-sm font-medium text-white">{u.name} {u.surname}</div>
                                                       <div className="text-sm text-gray-500">{u.email}</div>
                                                   </div>
                                               </div>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === UserRole.ASSOCIAZIONE ? 'bg-purple-900/30 text-purple-400' : 'bg-green-900/30 text-green-400'}`}>
                                                    {u.role}
                                                </span>
                                                {u.isVerified && (
                                                    <span className="ml-2 text-indigo-400" title="Verificato">
                                                        <CheckCircle className="w-4 h-4 inline" />
                                                    </span>
                                                )}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               {u.isDeleted ? (
                                                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900/30 text-red-400">
                                                       Deleted
                                                   </span>
                                               ) : (
                                                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-400">
                                                       Active
                                                   </span>
                                               )}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                               <button 
                                                    onClick={() => handleViewTickets(u._id, u.name)}
                                                    className="text-indigo-400 hover:text-indigo-300 bg-indigo-950 p-2 rounded-full transition"
                                                    title="Vedi Voucher"
                                                >
                                                    <TicketIcon className="w-4 h-4" />
                                               </button>
                                               
                                               {u.role === UserRole.ASSOCIAZIONE && (
                                                   <button 
                                                       onClick={() => handleVerifyUser(u._id)}
                                                       className={`${u.isVerified ? 'text-orange-400 bg-orange-900/20' : 'text-green-400 bg-green-900/20'} p-2 rounded-full hover:opacity-80 transition`}
                                                       title={u.isVerified ? "Revoca Verifica" : "Verifica"}
                                                   >
                                                       {u.isVerified ? <XCircle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                                                   </button>
                                               )}

                                               {u.isDeleted && (
                                                   <button 
                                                       onClick={() => handleRestoreUser(u._id)}
                                                       className="text-green-400 bg-green-900/20 p-2 rounded-full hover:bg-green-900/40 transition"
                                                       title="Ripristina Account"
                                                   >
                                                       <RefreshCw className="w-4 h-4" />
                                                   </button>
                                               )}
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   )}

                   {activeTab === 'events' && (
                       <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-700">
                               <thead className="bg-gray-900/50">
                                   <tr>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizzatore</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                   </tr>
                               </thead>
                               <tbody className="bg-gray-800 divide-y divide-gray-700">
                                   {filteredEvents.map(e => (
                                       <tr key={e._id} className={e.status === 'deleted' ? 'bg-red-900/10 opacity-70' : ''}>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-900 rounded-md overflow-hidden border border-gray-700">
                                                        <img className="h-full w-full object-cover" src={e.image} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">{e.title}</div>
                                                        <div className="text-sm text-gray-500">{e.location}</div>
                                                    </div>
                                               </div>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                               {typeof e.organization === 'object' ? e.organization.name : 'Unknown'}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                               {new Date(e.date).toLocaleDateString()}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${e.status === 'active' || !e.status ? 'bg-green-900/30 text-green-400' : ''}
                                                    ${e.status === 'archived' ? 'bg-gray-900 text-gray-400' : ''}
                                                    ${e.status === 'deleted' ? 'bg-red-900/30 text-red-400' : ''}
                                                `}>
                                                    {e.status || 'active'}
                                                </span>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-2 text-sm">
                                               <button 
                                                   onClick={() => handleViewStats(e)}
                                                   className="text-indigo-400 hover:text-white hover:bg-indigo-600 border border-indigo-900/50 hover:border-indigo-600 px-3 py-1 rounded-md transition flex items-center font-medium"
                                               >
                                                   <BarChart className="w-4 h-4 mr-2" />
                                                   Stats
                                               </button>
                                               <button 
                                                    onClick={() => navigate(`/events/${e._id}/attendees`)}
                                                    className="text-teal-400 hover:text-white hover:bg-teal-600 border border-teal-900/50 hover:border-teal-600 px-3 py-1 rounded-md transition flex items-center font-medium"
                                                >
                                                    <Users className="w-4 h-4 mr-2" />
                                                    Lista
                                                </button>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   )}

                   {activeTab === 'reports' && (
                       <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-700">
                               <thead className="bg-gray-900/50">
                                   <tr>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento Segnalato</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                   </tr>
                               </thead>
                               <tbody className="bg-gray-800 divide-y divide-gray-700">
                                   {reports.length > 0 ? reports.map(r => (
                                       <tr key={r._id}>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img src={r.eventId.image} className="w-8 h-8 rounded object-cover mr-3 border border-gray-700" />
                                                    <span className="text-sm font-bold text-white">{r.eventId.title}</span>
                                                </div>
                                           </td>
                                           <td className="px-6 py-4">
                                               <span className="bg-red-900/20 text-red-400 px-2 py-1 rounded-md text-xs font-bold border border-red-900/30">
                                                   {r.reason}
                                               </span>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                               {new Date(r.createdAt).toLocaleDateString()}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                               {r.reporterId.name} ({r.reporterId.email})
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                               <button 
                                                   onClick={() => handleOpenModeration(r.eventId)}
                                                   className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition shadow-lg"
                                               >
                                                   Gestisci
                                               </button>
                                           </td>
                                       </tr>
                                   )) : (
                                       <tr>
                                           <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                               Nessuna segnalazione in sospeso.
                                           </td>
                                       </tr>
                                   )}
                               </tbody>
                           </table>
                       </div>
                   )}
                </>
            )}
        </div>
      </div>

      {/* TICKETS MODAL */}
      {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-700">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                      <h3 className="text-xl font-bold text-white">Voucher di {selectedUserName}</h3>
                      <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-400 hover:text-white transition">
                          <XCircle className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1 bg-gray-800">
                      {modalLoading ? (
                          <div className="text-center py-8 text-gray-500">Caricamento voucher...</div>
                      ) : selectedUserTickets.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 italic">Nessun voucher trovato per questo utente.</div>
                      ) : (
                          <div className="space-y-4">
                              {selectedUserTickets.map(ticket => (
                                  <div key={ticket._id} className="border border-gray-700 rounded-lg p-4 flex justify-between items-start bg-gray-900/40 hover:bg-gray-750 transition shadow-sm">
                                      <div>
                                          <p className="font-bold text-white">{ticket.event.title}</p>
                                          <p className="text-sm text-gray-500">{new Date(ticket.event.date).toLocaleDateString()}</p>
                                          <p className="text-[10px] text-indigo-400 mt-1 font-mono uppercase tracking-wider">{ticket.qrCodeId}</p>
                                          
                                          {ticket.matricola && (
                                              <p className="text-xs text-gray-300 mt-2 font-semibold flex items-center bg-gray-900 border border-gray-700 rounded px-2 py-1 w-fit shadow-inner">
                                                  <GraduationCap className="w-3 h-3 mr-1 text-indigo-400" />
                                                  Mat: {ticket.matricola}
                                              </p>
                                          )}
                                      </div>
                                      <div className="text-right flex flex-col items-end">
                                          {getTicketStatusBadge(ticket)}
                                          
                                          <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-wide">
                                              Acquistato: {new Date(ticket.purchaseDate).toLocaleDateString()}
                                          </p>

                                          {(ticket.entryTime || ticket.exitTime) && (
                                              <div className="mt-2 text-[10px] text-gray-400 bg-gray-950 p-2 rounded border border-gray-700 shadow-sm w-fit">
                                                  {ticket.entryTime && (
                                                      <div className="flex items-center justify-end whitespace-nowrap">
                                                          <Clock className="w-3 h-3 mr-1 text-green-500" /> 
                                                          In: {new Date(ticket.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                      </div>
                                                  )}
                                                  {ticket.exitTime && (
                                                      <div className="flex items-center justify-end mt-1 whitespace-nowrap">
                                                          <Clock className="w-3 h-3 mr-1 text-blue-500" />
                                                          Out: {new Date(ticket.exitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                      </div>
                                                  )}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-xl text-right">
                      <button onClick={() => setIsTicketModalOpen(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition border border-gray-600">
                          Chiudi
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODERATION MODAL */}
      {isModModalOpen && modTargetEvent && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-700">
                  <div className="bg-red-600/90 p-6 text-white flex justify-between items-center shadow-lg">
                      <h3 className="text-xl font-bold flex items-center">
                          <AlertTriangle className="w-6 h-6 mr-2" />
                          Rimuovi Evento Segnalato
                      </h3>
                      <button onClick={() => setIsModModalOpen(false)}>
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-gray-300">
                          Stai per rimuovere definitivamente l'evento: <strong className="text-red-400 underline">{modTargetEvent.title}</strong>.
                      </p>
                      <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Motivazione rimozione (inviata all'associazione)</label>
                          <textarea 
                              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none h-32 text-white placeholder-gray-500 shadow-inner"
                              placeholder="Es. Il contenuto viola le linee guida UniParty relative a..."
                              value={deleteReason}
                              onChange={e => setDeleteReason(e.target.value)}
                          ></textarea>
                      </div>
                      <div className="flex gap-4">
                          <button 
                            onClick={() => setIsModModalOpen(false)}
                            className="flex-1 py-3 bg-gray-700 font-bold rounded-xl text-gray-300 hover:bg-gray-600 transition"
                          >Annulla</button>
                          <button 
                            onClick={handleModDelete}
                            disabled={isModLoading || !deleteReason.trim()}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 disabled:opacity-50 transition"
                          >
                              {isModLoading ? "Rimozione..." : "Rimuovi Evento"}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* STATS MODAL */}
      {isStatsModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-700">
                  
                  {/* Modal Header */}
                  <div className="bg-indigo-950 p-6 flex justify-between items-center text-white border-b border-gray-700">
                      <h3 className="text-xl font-bold flex items-center text-indigo-400">
                          <BarChart className="w-6 h-6 mr-2" />
                          Statistiche Evento
                      </h3>
                      <button onClick={() => setIsStatsModalOpen(false)} className="text-gray-500 hover:text-white transition">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto flex-1 bg-gray-800">
                      <div className="mb-6">
                           <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                           <p className="text-gray-500 font-medium">{new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.location}</p>
                      </div>

                      {statsLoading ? (
                           <div className="text-center py-12 text-gray-500">Caricamento statistiche...</div>
                      ) : (
                           <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gray-900 rounded-xl p-4 border border-indigo-900/30 shadow-inner">
                                        <div className="flex items-center text-indigo-400 mb-2">
                                            <TrendingUp className="w-5 h-5 mr-2" />
                                            <span className="font-bold text-[10px] uppercase tracking-widest">Ricavo Totale (Stima)</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            €{(selectedEvent.ticketsSold * selectedEvent.price).toFixed(2)}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-900 rounded-xl p-4 border border-green-900/30 shadow-inner">
                                        <div className="flex items-center text-green-400 mb-2">
                                            <TicketIcon className="w-5 h-5 mr-2" />
                                            <span className="font-bold text-[10px] uppercase tracking-widest">Biglietti Venduti</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {selectedEvent.ticketsSold} / {selectedEvent.maxCapacity}
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 rounded-xl p-4 border border-pink-900/30 shadow-inner">
                                        <div className="flex items-center text-pink-400 mb-2">
                                            <Heart className="w-5 h-5 mr-2" />
                                            <span className="font-bold text-[10px] uppercase tracking-widest">Preferiti</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {selectedEventStats?.favorites || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-700 pt-6">
                                     <h4 className="text-lg font-bold text-white mb-4">Vendite per Lista PR</h4>
                                     <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-inner">
                                        <div className="grid grid-cols-2 bg-gray-950 p-3 font-bold text-gray-500 text-xs uppercase tracking-wider">
                                            <div>Nome Lista</div>
                                            <div className="text-right">Voucher Venduti</div>
                                        </div>
                                        {selectedEventStats && Object.entries(selectedEventStats).filter(([k]) => k !== 'favorites').length > 0 ? (
                                             Object.entries(selectedEventStats)
                                                .filter(([key]) => key !== 'favorites')
                                                .map(([name, count]) => (
                                                    <div key={name} className="grid grid-cols-2 p-3 border-b border-gray-800 last:border-0 hover:bg-gray-800 transition">
                                                        <div className="font-medium text-gray-300">{name}</div>
                                                        <div className="text-right text-indigo-400 font-bold">{count}</div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="p-6 text-center text-gray-600 italic">Nessuna vendita registrata per liste PR.</div>
                                        )}
                                     </div>
                                </div>
                           </>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;