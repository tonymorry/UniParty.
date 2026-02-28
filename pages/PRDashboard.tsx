import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole } from '../types';
import { 
    LayoutDashboard, TrendingUp, DollarSign, Ticket, Calendar, 
    ChevronRight, AlertCircle, Loader2, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PRStat {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    ticketsSold: number;
    revenue: number;
}

const PRDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<PRStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.role === UserRole.PR) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.auth.getPRStats();
            setStats(data);
        } catch (e: any) {
            setError(e.message || "Errore nel caricamento delle statistiche");
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== UserRole.PR) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">Accesso Negato</h1>
                    <p className="text-gray-400 mb-6">Questa pagina è riservata ai PR accreditati.</p>
                    <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                        Torna alla Home
                    </Link>
                </div>
            </div>
        );
    }

    const totalTickets = stats.reduce((acc, curr) => acc + curr.ticketsSold, 0);
    const totalRevenue = stats.reduce((acc, curr) => acc + curr.revenue, 0);

    return (
        <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">PR Accreditato</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Dashboard PR</h1>
                        <p className="text-gray-400 text-sm">Monitora le tue vendite e i tuoi guadagni.</p>
                    </div>
                    
                    <button 
                        onClick={fetchStats}
                        disabled={loading}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-900/30 rounded-xl">
                                <Ticket className="w-6 h-6 text-indigo-400" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Biglietti Venduti</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{totalTickets}</h3>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-900/30 rounded-xl">
                                <DollarSign className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Volume Vendite</p>
                        <h3 className="text-3xl font-bold text-white mt-1">€{totalRevenue.toFixed(2)}</h3>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-900/30 rounded-xl">
                                <Calendar className="w-6 h-6 text-amber-400" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Eventi Attivi</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stats.length}</h3>
                    </div>
                </div>

                {/* Events Breakdown */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold flex items-center">
                            <LayoutDashboard className="w-5 h-5 mr-2 text-indigo-400" />
                            Dettaglio per Evento
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
                                <p className="text-gray-400">Caricamento dati...</p>
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center">
                                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                                <p className="text-gray-400">{error}</p>
                            </div>
                        ) : stats.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Evento</th>
                                        <th className="px-6 py-4 font-bold">Data</th>
                                        <th className="px-6 py-4 font-bold text-center">Biglietti</th>
                                        <th className="px-6 py-4 font-bold text-right">Volume</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {stats.map((stat) => (
                                        <tr key={stat.eventId} className="hover:bg-gray-700/30 transition group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-white group-hover:text-indigo-400 transition">{stat.eventTitle}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(stat.eventDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                                                    {stat.ticketsSold}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-white">
                                                €{stat.revenue.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/events/${stat.eventId}`} className="text-gray-500 hover:text-white transition">
                                                    <ChevronRight className="w-5 h-5 inline" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <p>Nessun dato di vendita disponibile per i tuoi eventi.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6">
                    <div className="flex gap-4">
                        <AlertCircle className="w-6 h-6 text-indigo-400 shrink-0" />
                        <div>
                            <h4 className="font-bold text-indigo-100">Come funziona il tracking?</h4>
                            <p className="text-sm text-indigo-200/70 mt-1">
                                Le vendite vengono attribuite a te quando un utente seleziona il tuo nome dalla lista PR durante l'acquisto di un biglietto. 
                                Assicurati che i tuoi clienti selezionino correttamente il tuo nome per ricevere l'accredito delle vendite.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PRDashboard;
