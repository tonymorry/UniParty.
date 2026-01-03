import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Event, Ticket, UserRole, Report } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User as UserIcon, Calendar, CheckCircle, XCircle, Trash2, RefreshCw, Ticket as TicketIcon, Search, Eye, Filter, BarChart, X, TrendingUp, DollarSign, Heart, GraduationCap, Clock, Users, Flag, AlertTriangle } from 'lucide-react';

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
  const [userFilter, setUserFilter] = useState<string>('all');

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedUserTickets, setSelectedUserTickets] = useState<Ticket[]>([]);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== UserRole.ADMIN) { navigate('/'); return; }
    fetchData();
  }, [user, navigate, activeTab]);

  const fetchData = async () => {
      setLoading(true);
      try {
          if (activeTab === 'users') { setUsers(await api.admin.getAllUsers()); }
          else if (activeTab === 'events') { setEvents(await api.admin.getAllEvents()); }
          else if (activeTab === 'reports') { setReports(await api.reports.getAll()); }
      } catch (e) {} finally { setLoading(false); }
  };

  const handleTabChange = (tab: string) => { setSearchParams({ tab }); };

  const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = userFilter === 'all' || u.role === userFilter;
      return matchesSearch && matchesRole;
  });

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!user || user.role !== UserRole.ADMIN) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center"><Shield className="w-10 h-10 text-indigo-500 mr-3" /><h1 className="text-3xl font-bold">Admin</h1></div>
            <div className="bg-gray-800 rounded-lg p-1 flex border border-gray-700">
                {['users', 'events', 'reports'].map(tab => (
                    <button key={tab} onClick={() => handleTabChange(tab)} className={`px-4 py-2 rounded-md font-medium transition ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {activeTab === 'users' ? filteredUsers.map(u => (
                                <tr key={u._id} className="hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isVerified ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/50 text-gray-500'}`}>{u.isVerified ? 'VERIFICATO' : 'ATTESA'}</span></td>
                                    <td className="px-6 py-4"><button className="text-indigo-400 hover:underline">Edit</button></td>
                                </tr>
                            )) : filteredEvents.map(e => (
                                <tr key={e._id} className="hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4"><div className="font-bold">{e.title}</div></td>
                                    <td className="px-6 py-4"><span className="text-xs text-gray-400 uppercase">{e.status}</span></td>
                                    <td className="px-6 py-4"><button className="text-indigo-400 hover:underline">Stats</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;