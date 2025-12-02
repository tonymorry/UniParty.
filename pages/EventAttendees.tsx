
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ArrowLeft, Clock, CheckCircle, Circle, User, GraduationCap, Users } from 'lucide-react';

interface Attendee {
    _id: string;
    ticketHolderName: string;
    matricola?: string;
    status: 'valid' | 'entered' | 'completed' | 'active';
    entryTime?: string;
    exitTime?: string;
    prList?: string;
}

const EventAttendees: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (!user || (user.role !== UserRole.ASSOCIAZIONE && user.role !== UserRole.ADMIN)) {
            navigate('/');
            return;
        }

        if (id) {
            api.events.getAttendees(id) // Assume this helper exists in api.ts wrapper or call directly
                .then(setAttendees)
                .catch(err => {
                    console.error("Failed to load attendees", err);
                    alert("Errore caricamento lista.");
                })
                .finally(() => setLoading(false));
        }
    }, [id, user, navigate]);

    const filteredAttendees = attendees.filter(a => 
        a.ticketHolderName.toLowerCase().includes(filter.toLowerCase()) || 
        (a.matricola && a.matricola.includes(filter))
    );

    const formatTime = (isoString?: string) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'completed': return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">Completato</span>;
            case 'entered': return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">Presente</span>;
            case 'valid': 
            case 'active': return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">Valido</span>;
            default: return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">Unknown</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-600 hover:text-indigo-600 transition">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Torna alla Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="w-6 h-6 mr-2 text-indigo-600" /> Lista Presenze
                    </h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="relative w-full md:w-96">
                             <input 
                                type="text" 
                                placeholder="Cerca nome o matricola..." 
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                             />
                             <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                         </div>
                         <div className="text-sm text-gray-500 font-medium">
                             Totale: {attendees.length}
                         </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Caricamento lista...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partecipante</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricola</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uscita</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAttendees.length > 0 ? filteredAttendees.map(a => (
                                        <tr key={a._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{a.ticketHolderName}</div>
                                                <div className="text-xs text-gray-500">{a.prList !== 'Nessuna lista' ? a.prList : ''}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {a.matricola ? (
                                                    <span className="flex items-center text-sm text-indigo-700 font-mono">
                                                        <GraduationCap className="w-3 h-3 mr-1" /> {a.matricola}
                                                    </span>
                                                ) : <span className="text-gray-400 text-xs">-</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(a.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {a.entryTime ? (
                                                    <span className="flex items-center text-green-700">
                                                        <Clock className="w-3 h-3 mr-1" /> {formatTime(a.entryTime)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {a.exitTime ? (
                                                     <span className="flex items-center text-blue-700">
                                                        <Clock className="w-3 h-3 mr-1" /> {formatTime(a.exitTime)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                Nessun partecipante trovato.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventAttendees;
