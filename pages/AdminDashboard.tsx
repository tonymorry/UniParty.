import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Event, Ticket, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Calendar, CheckCircle, XCircle, Trash2, RefreshCw, Ticket as TicketIcon, Search, Eye } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('users');
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserTickets, setSelectedUserTickets] = useState<Ticket[]>([]);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

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
      setIsModalOpen(true);
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

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (typeof e.organization === 'object' && e.organization.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user || user.role !== UserRole.ADMIN) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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

        {/* Search */}
        <div className="mb-6 relative">
             <input 
                type="text"
                placeholder={activeTab === 'users' ? "Cerca utente per nome o email..." : "Cerca evento per titolo o organizzatore..."}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
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
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">Biglietti di {selectedUserName}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
                          Chiudi
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;