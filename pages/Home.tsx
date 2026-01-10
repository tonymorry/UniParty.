import React, { useEffect, useState } from 'react';
import { Event, EventCategory } from '../types';
import { api } from '../services/api';
import EventCard from '../components/EventCard';
import { useLocationContext } from '../context/LocationContext';
import { Search, Filter, X, Calendar, Tag, DollarSign, MapPin } from 'lucide-react';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedCity } = useLocationContext();
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTime, setSelectedTime] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'weekend'>('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | EventCategory>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.events.getAll();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    if (selectedCity !== 'Tutte' && e.city !== selectedCity) return false;

    const lowerSearch = searchTerm.toLowerCase();
    const orgName = typeof e.organization === 'object' && e.organization !== null && 'name' in e.organization
      ? e.organization.name.toLowerCase() 
      : '';

    const matchesSearch = 
      e.title.toLowerCase().includes(lowerSearch) ||
      e.location.toLowerCase().includes(lowerSearch) ||
      orgName.includes(lowerSearch);
    
    if (!matchesSearch) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (selectedPrice === 'free' && e.price > 0) return false;
    if (selectedPrice === 'paid' && e.price === 0) return false;

    if (selectedTime !== 'all') {
        const eventDate = new Date(e.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const eventDateNoTime = new Date(eventDate);
        eventDateNoTime.setHours(0,0,0,0);

        if (selectedTime === 'today') return eventDateNoTime.getTime() === today.getTime();
        if (selectedTime === 'tomorrow') return eventDateNoTime.getTime() === tomorrow.getTime();
        if (selectedTime === 'week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            return eventDateNoTime >= today && eventDateNoTime <= nextWeek;
        }
        if (selectedTime === 'weekend') {
            const day = eventDate.getDay();
            const isWeekendDay = day === 0 || day === 5 || day === 6;
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            return isWeekendDay && eventDateNoTime <= nextWeek && eventDateNoTime >= today;
        }
    }
    return true;
  });

  const clearFilters = () => {
      setSelectedTime('all');
      setSelectedPrice('all');
      setSelectedCategory('all');
  };

  const hasActiveFilters = selectedTime !== 'all' || selectedPrice !== 'all' || selectedCategory !== 'all';

  return (
    <div className="page-container">
      {/* Background Blobs - Fixed and layered behind */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Official University Network</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
          {selectedCity === 'Tutte' ? (
            <>Sblocca la tua <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Vita Universitaria</span></>
          ) : (
            <>Scopri gli Eventi a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{selectedCity}</span></>
          )}
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          {selectedCity === 'Tutte' 
            ? 'La piattaforma definitiva per gli eventi universitari. Feste esclusive, workshop, sport e networking in tutto il campus.'
            : `Unisciti alla community di ${selectedCity}. Trova i migliori party, seminari e concerti scelti per te.`}
        </p>
        
        {/* Search & Filter Bar */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Cerca eventi, associazioni o luoghi..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 rounded-2xl font-bold flex items-center justify-center transition-all duration-300 ${showFilters || hasActiveFilters ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtri
          </button>
        </div>
      </section>

      {/* Filter Panel */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Personalizza la ricerca</h3>
              <button onClick={clearFilters} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Reset</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="text-sm font-bold text-slate-300 mb-3 block flex items-center"><Calendar className="w-4 h-4 mr-2 text-indigo-400" /> Quando</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'today', 'tomorrow', 'week', 'weekend'].map((t) => (
                    <button key={t} onClick={() => setSelectedTime(t as any)} className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${selectedTime === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                      {t === 'all' ? 'Tutte le date' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300 mb-3 block flex items-center"><Tag className="w-4 h-4 mr-2 text-purple-400" /> Categoria</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory('all')} className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${selectedCategory === 'all' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>Tutte</button>
                  {Object.values(EventCategory).map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${selectedCategory === cat ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300 mb-3 block flex items-center"><DollarSign className="w-4 h-4 mr-2 text-pink-400" /> Prezzo</label>
                <div className="flex flex-wrap gap-2">
                  {[{ id: 'all', label: 'Tutti' }, { id: 'free', label: 'Gratis' }, { id: 'paid', label: 'A Pagamento' }].map((p) => (
                    <button key={p.id} onClick={() => setSelectedPrice(p.id as any)} className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${selectedPrice === p.id ? 'bg-pink-600 border-pink-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-white flex items-center">
            {searchTerm ? 'Risultati Ricerca' : 'Eventi in Arrivo'}
            <span className="ml-3 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-500">{filteredEvents.length}</span>
          </h2>
          {selectedCity !== 'Tutte' && (
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
              <MapPin className="w-3 h-3" />
              <span>{selectedCity}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="bg-white/5 rounded-3xl h-[420px] animate-pulse border border-white/10"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div key={event._id} className="animate-in fade-in duration-500 slide-in-from-bottom-2">
                  <EventCard event={event} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-xl">
                    <Search className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Nessun evento trovato</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Prova a cambiare i filtri o cerca un'altra parola chiave.</p>
                <button onClick={clearFilters} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all duration-300">Resetta tutto</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;