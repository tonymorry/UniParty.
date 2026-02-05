
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { BarChart, Ticket, Calendar, TrendingUp, UserCheck, ArrowLeft } from 'lucide-react';

interface PRStats {
  title: string;
  count: number;
  date: string;
}

const PRDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PRStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== UserRole.PR) {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await api.pr.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== UserRole.PR) return null;

  const totalSales = stats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <UserCheck className="w-8 h-8 mr-3 text-indigo-400" />
            PR Dashboard
          </h1>
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center">
            <div className="p-4 bg-indigo-900/30 rounded-xl mr-4">
              <Ticket className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Totale Voucher Venduti</p>
              <p className="text-3xl font-black text-white">{totalSales}</p>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center">
            <div className="p-4 bg-green-900/30 rounded-xl mr-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Eventi Attivi</p>
              <p className="text-3xl font-black text-white">{stats.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 bg-gray-900/30">
            <h2 className="text-lg font-bold flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-indigo-400" />
              Statistiche per Evento
            </h2>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-500">Caricamento statistiche...</div>
          ) : stats.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {stats.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, idx) => (
                <div key={idx} className="p-6 flex justify-between items-center hover:bg-gray-750 transition">
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-indigo-400">{item.count}</p>
                    <p className="text-[10px] text-gray-600 uppercase font-bold">Voucher</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 italic">
              Nessuna vendita registrata a tuo nome ancora.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PRDashboard;
