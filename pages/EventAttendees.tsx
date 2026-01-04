import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ArrowLeft, Clock, CheckCircle, Circle, User, GraduationCap, Users, Download, BookOpen } from 'lucide-react';

interface Attendee {
    _id: string;
    ticketHolderName: string;
    matricola?: string;
    corsoStudi?: string; // New
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
            case 'completed': return <span className="px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-900/50">Completato</span>;
            case 'entered': return <span className="px-2 py-1 rounded-full bg-green-900/30 text-green-400 text-xs font-bold border border-green-900/50">Presente</span>;
            case 'valid': 
            case 'active': return <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-bold border border-gray-600">Valido</span>;
            default: return <span className="px-2 py-1 rounded-full bg-gray-800 text-gray-500 text-xs">Unknown</span>;
        }
    };

    const downloadCSV = () => {
        if (!attendees.length) return;

        // Header CSV - Added Corso Studi
        const headers = ["Nome", "Matricola", "Corso di Studi", "Lista PR", "Stato", "Orario Ingresso", "Orario Uscita"];
        
        // Rows Data
        const rows = attendees.map(a => [
            `"${a.ticketHolderName.replace(/"/g, '""')}"`, // Escape quotes
            `"${a.matricola || ''}"`,
            `"${a.corsoStudi ? a.corsoStudi.replace(/"/g, '""') : ''}"`,
            `"${a.prList || ''}"`,
            `"${a.status}"`,
            `"${a.entryTime ? new Date(a.entryTime).toLocaleString() : ''}"`,
            `"${a.exitTime ? new Date(a.exitTime).toLocaleString() : ''}"`
        ]);

        // Join content
        const csvContent = [
            headers.join(','), 
            ...rows.map(e => e.join(','))
        ].join('\n');

        // Create Blob with BOM for Excel compatibility (UTF-8)
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Trigger Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lista_partecipanti_${id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-indigo-400 transition">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Torna alla Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <Users className="w-6 h-6 mr-2 text-indigo-400" /> Lista Presenze
                    </h1>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="relative w-full md:w-96">
                             <input 
                                type="text" 
                                placeholder="Cerca nome o matricola..." 
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                             />
                             <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                         </div>
                         
                         <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                             <div className="text-sm text-gray-400 font-medium whitespace-nowrap">
                                 Totale: {attendees.length}
                             </div>
                             <button 
                                onClick={downloadCSV}
                                disabled={attendees.length === 0}
                                className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 text-indigo-400 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-700 hover:border-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                <Download className="w-4 h-4 mr-2" />
                                Scarica Lista
                             </button>
                         </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Caricamento lista...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partecipante</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricola</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Corso Studi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uscita</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {filteredAttendees.length > 0 ? filteredAttendees.map(a => (
                                        <tr key={a._id} className="hover:bg-gray-700 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white">{a.ticketHolderName}</div>
                                                <div className="text-xs text-gray-500">{a.prList !== 'Nessuna lista' ? a.prList : ''}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {a.matricola ? (
                                                    <span className="flex items-center text-sm text-indigo-400 font-mono">
                                                        <GraduationCap className="w-3 h-3 mr-1" /> {a.matricola}
                                                    </span>
                                                ) : <span className="text-gray-600 text-xs">-</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {a.corsoStudi ? (
                                                    <span className="flex items-center text-sm text-gray-300">
                                                        <BookOpen className="w-3 h-3 mr-1 text-gray-500" /> {a.corsoStudi}
                                                    </span>
                                                ) : <span className="text-gray-600 text-xs">-</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(a.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {a.entryTime ? (
                                                    <span className="flex items-center text-green-400">
                                                        <Clock className="w-3 h-3 mr-1" /> {formatTime(a.entryTime)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {a.exitTime ? (
                                                     <span className="flex items-center text-blue-400">
                                                        <Clock className="w-3 h-3 mr-1" /> {formatTime(a.exitTime)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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