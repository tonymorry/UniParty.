
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Ticket, Calendar, UserCheck, ArrowRight, BarChart3, Briefcase } from 'lucide-react';

const PRDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== UserRole.PR) {
            navigate('/');
            return;
        }
        api.auth.getPRStats().then(setStats).finally(() => setLoading(false));
    }, [user, navigate]);

    if (!user) return null;

    const totalSales = stats.reduce((acc, curr) => acc + curr.ticketsSold, 0);

    return (
        <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-500/50">
                        <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard PR</h1>
                        <p className="text-gray-400 font-medium">{user.name}, stai vendendo per <span className="text-indigo-400">Associazione</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                        <BarChart3 className="text-indigo-400 mb-3" />
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Totale Voucher Venduti</p>
                        <p className="text-4xl font-black mt-1">{totalSales}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                        <Briefcase className="text-green-400 mb-3" />
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Eventi Attivi</p>
                        <p className="text-4xl font-black mt-1">{stats.length}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        Performance per Evento
                    </h2>
                    
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>)}
                        </div>
                    ) : stats.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800 rounded-2xl border border-dashed border-gray-700 text-gray-500">
                            Nessun evento attivo al momento.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.map(ev => (
                                <Link 
                                    to={`/events/${ev.eventId}`} 
                                    key={ev.eventId} 
                                    className="block bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-indigo-500/50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold group-hover:text-indigo-400 transition">{ev.title}</p>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                                {new Date(ev.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <Ticket className="w-4 h-4" />
                                                <span className="text-2xl font-black">{ev.ticketsSold}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Voucher Venduti</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PRDashboard;
