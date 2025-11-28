import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Event, Ticket, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Calendar, CheckCircle, XCircle, Trash2, RefreshCw, Ticket as TicketIcon, Search, Eye, Filter, BarChart, X, TrendingUp, DollarSign, Heart } from 'lucide-react';

type UserFilter = 'all' | 'studente' | 'associazione';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('users');
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
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
          } else {
              const data = await api.admin.getAllEvents();
              setEvents(data);
          }
      } catch (e) {
          console.error("Admin fetch error", e);
      } finally {
          setLoading(false);
      }
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
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Utenti
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('events')}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Eventi
                    </div>
                </button>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
             <div className="relative flex-grow">
                <input 
                    type="text"
                    placeholder={activeTab === 'users' ? "Cerca utente per nome o email..." : "Cerca evento per titolo o organizzatore..."}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
             </div>

             {activeTab === 'users' && (
                 <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2 shadow-sm">
                     <Filter className="w-5 h-5 text-gray-500 mr-2" />
                     <select 
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value as UserFilter)}
                        className="bg-transparent outline-none text-gray-700 font-medium cursor-pointer"
                     >
                         <option value="all">Tutti i Ruoli</option>
                         <option value="studente">Studenti</option>
                         <option value="associazione">Associazioni</option>
                     </select>
                 </div>
             )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {loading ? (
                <div className="p-12 text-center text-gray-500">Caricamento dati...</div>
            ) : (
                <>
                   {activeTab === 'users' && (
                       <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                               <thead className="bg-gray-50">
                                   <tr>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utente</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruolo</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                   </tr>
                               </thead>
                               <tbody className="bg-white divide-y divide-gray-200">
                                   {filteredUsers.map(u => (
                                       <tr key={u._id} className={u.isDeleted ? 'bg-red-50' : ''}>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <div className="flex items-center">
                                                   <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                       {u.name.charAt(0)}
                                                   </div>
                                                   <div className="ml-4">
                                                       <div className="text-sm font-medium text-gray-900">{u.name} {u.surname}</div>
                                                       <div className="text-sm text-gray-500">{u.email}</div>
                                                   </div>
                                               </div>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === UserRole.ASSOCIAZIONE ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                    {u.role}
                                                </span>
                                                {u.isVerified && (
                                                    <span className="ml-2 text-indigo-600" title="Verificato">
                                                        <CheckCircle className="w-4 h-4 inline" />
                                                    </span>
                                                )}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               {u.isDeleted ? (
                                                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                       Deleted
                                                   </span>
                                               ) : (
                                                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                       Active
                                                   </span>
                                               )}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                               <button 
                                                    onClick={() => handleViewTickets(u._id, u.name)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full"
                                                    title="Vedi Biglietti"
                                                >
                                                    <TicketIcon className="w-4 h-4" />
                                               </button>
                                               
                                               {u.role === UserRole.ASSOCIAZIONE && (
                                                   <button 
                                                       onClick={() => handleVerifyUser(u._id)}
                                                       className={`${u.isVerified ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'} p-2 rounded-full hover:opacity-80`}
                                                       title={u.isVerified ? "Revoca Verifica" : "Verifica"}
                                                   >
                                                       {u.isVerified ? <XCircle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                                                   </button>
                                               )}

                                               {u.isDeleted && (
                                                   <button 
                                                       onClick={() => handleRestoreUser(u._id)}
                                                       className="text-green-600 bg-green-50 p-2 rounded-full hover:bg-green-100"
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
                           <table className="min-w-full divide-y divide-gray-200">
                               <thead className="bg-gray-50">
                                   <tr>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizzatore</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistiche</th>
                                   </tr>
                               </thead>
                               <tbody className="bg-white divide-y divide-gray-200">
                                   {filteredEvents.map(e => (
                                       <tr key={e._id} className={e.status === 'deleted' ? 'bg-red-50 opacity-70' : ''}>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                                                        <img className="h-full w-full object-cover" src={e.image} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{e.title}</div>
                                                        <div className="text-sm text-gray-500">{e.location}</div>
                                                    </div>
                                               </div>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                               {typeof e.organization === 'object' ? e.organization.name : 'Unknown'}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                               {new Date(e.date).toLocaleDateString()}
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${e.status === 'active' || !e.status ? 'bg-green-100 text-green-800' : ''}
                                                    ${e.status === 'archived' ? 'bg-gray-100 text-gray-800' : ''}
                                                    ${e.status === 'deleted' ? 'bg-red-100 text-red-800' : ''}
                                                `}>
                                                    {e.status || 'active'}
                                                </span>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <button 
                                                   onClick={() => handleViewStats(e)}
                                                   className="text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 px-3 py-1 rounded-md transition flex items-center text-sm font-medium"
                                               >
                                                   <BarChart className="w-4 h-4 mr-2" />
                                                   Dettagli
                                               </button>
                                           </td>
                                       </tr>
                                   ))}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">Biglietti di {selectedUserName}</h3>
                      <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <XCircle className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                      {modalLoading ? (
                          <div className="text-center py-8">Caricamento biglietti...</div>
                      ) : selectedUserTickets.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">Nessun biglietto trovato per questo utente.</div>
                      ) : (
                          <div className="space-y-4">
                              {selectedUserTickets.map(ticket => (
                                  <div key={ticket._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50 hover:bg-white transition shadow-sm">
                                      <div>
                                          <p className="font-bold text-gray-900">{ticket.event.title}</p>
                                          <p className="text-sm text-gray-500">{new Date(ticket.event.date).toLocaleDateString()}</p>
                                          <p className="text-xs text-indigo-600 mt-1 font-mono">{ticket.qrCodeId}</p>
                                      </div>
                                      <div className="text-right">
                                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.used ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                              {ticket.used ? 'USATO' : 'VALIDO'}
                                          </span>
                                          <p className="text-xs text-gray-400 mt-2">
                                              Acquistato: {new Date(ticket.purchaseDate).toLocaleDateString()}
                                          </p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl text-right">
                      <button onClick={() => setIsTicketModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
                          Chiudi
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* STATS MODAL */}
      {isStatsModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="bg-indigo-900 p-6 flex justify-between items-start text-white">
                      <div>
                          <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                          <div className="flex items-center text-indigo-200 mt-1">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.location}</span>
                          </div>
                      </div>
                      <button onClick={() => setIsStatsModalOpen(false)} className="text-indigo-200 hover:text-white bg-indigo-800 p-2 rounded-full hover:bg-indigo-700 transition">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto flex-1">
                      {statsLoading ? (
                          <div className="flex flex-col items-center justify-center py-12">
                              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                              <p className="text-gray-500">Calcolo statistiche in corso...</p>
                          </div>
                      ) : (
                          <div className="space-y-8">
                              
                              {/* Summary Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Revenue */}
                                  <div className="bg-green-50 rounded-xl p-6 border border-green-100 flex items-center">
                                      <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                                          <DollarSign className="w-8 h-8" />
                                      </div>
                                      <div>
                                          <p className="text-sm text-green-800 font-medium uppercase tracking-wide">Incasso Totale</p>
                                          <p className="text-2xl font-bold text-gray-900">
                                              €{(selectedEvent.ticketsSold * selectedEvent.price).toFixed(2)}
                                          </p>
                                      </div>
                                  </div>

                                  {/* Sold/Capacity */}
                                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex items-center">
                                      <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                                          <TicketIcon className="w-8 h-8" />
                                      </div>
                                      <div>
                                          <p className="text-sm text-blue-800 font-medium uppercase tracking-wide">Biglietti Venduti</p>
                                          <p className="text-2xl font-bold text-gray-900">
                                              {selectedEvent.ticketsSold} <span className="text-sm text-gray-400 font-normal">/ {selectedEvent.maxCapacity}</span>
                                          </p>
                                          <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                                              <div 
                                                  className="bg-blue-600 h-1.5 rounded-full" 
                                                  style={{ width: `${Math.min(100, (selectedEvent.ticketsSold / selectedEvent.maxCapacity) * 100)}%` }}
                                              ></div>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Favorites */}
                                  <div className="bg-pink-50 rounded-xl p-6 border border-pink-100 flex items-center">
                                      <div className="p-3 bg-pink-100 rounded-full text-pink-600 mr-4">
                                          <Heart className="w-8 h-8" />
                                      </div>
                                      <div>
                                          <p className="text-sm text-pink-800 font-medium uppercase tracking-wide">Preferiti</p>
                                          <p className="text-2xl font-bold text-gray-900">
                                              {selectedEventStats?.favorites || 0}
                                          </p>
                                      </div>
                                  </div>
                              </div>

                              {/* PR List Breakdown */}
                              <div>
                                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                      <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                                      Dettaglio Liste PR
                                  </h3>
                                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                      {selectedEventStats && Object.keys(selectedEventStats).filter(k => k !== 'favorites').length > 0 ? (
                                          <table className="min-w-full divide-y divide-gray-200">
                                              <thead className="bg-gray-50">
                                                  <tr>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Lista</th>
                                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Vendite</th>
                                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valore Stimato</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-200">
                                                  {Object.entries(selectedEventStats)
                                                      .filter(([key]) => key !== 'favorites')
                                                      .sort(([,a], [,b]) => (b as number) - (a as number))
                                                      .map(([listName, count]) => (
                                                          <tr key={listName}>
                                                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{listName}</td>
                                                              <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-indigo-600">{count}</td>
                                                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">€{((count as number) * selectedEvent.price).toFixed(2)}</td>
                                                          </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                      ) : (
                                          <div className="p-8 text-center text-gray-500">
                                              Nessuna vendita associata a liste PR o nessuna lista configurata.
                                          </div>
                                      )}
                                  </div>
                              </div>

                          </div>
                      )}
                  </div>
                  <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
                      <button onClick={() => setIsStatsModalOpen(false)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition">
                          Chiudi Statistiche
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;