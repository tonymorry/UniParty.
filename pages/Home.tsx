import React, { useEffect, useState } from 'react';
import { Event, EventCategory } from '../types';
import { api } from '../services/api';
import EventCard from '../components/EventCard';
import { useLocationContext } from '../context/LocationContext';
import { Search, Filter, X, Calendar, Tag, DollarSign, Check, MapPin } from 'lucide-react';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedCity } = useLocationContext();
  
  // Filter States
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

  // FILTER LOGIC
  const filteredEvents = events.filter(e => {
    if (selectedCity !== 'Tutte' && e.city !== selectedCity) return false;
    const lowerSearch = searchTerm.toLowerCase();
    const orgName = typeof e.organization === 'object' && e.organization !== null && 'name' in e.organization
      ? e.organization.name.toLowerCase() 
      : '';
    const matchesSearch = e.title.toLowerCase().includes(lowerSearch) || e.location.toLowerCase().includes(lowerSearch) || orgName.includes(lowerSearch);
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
        if (selectedTime === 'today') { if (eventDateNoTime.getTime() !== today.getTime()) return false; }
        else if (selectedTime === 'tomorrow') { if (eventDateNoTime.getTime() !== tomorrow.getTime()) return false; }
        else if (selectedTime === 'week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            if (eventDateNoTime < today || eventDateNoTime > nextWeek) return false;
        }
        else if (selectedTime === 'weekend') {
            const day = eventDate.getDay(); 
            const isWeekendDay = day === 0 || day === 5 || day === 6;
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            if (!isWeekendDay || eventDateNoTime > nextWeek || eventDateNoTime < today) return false;
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
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="pt-32 pb-16 md:pt-40 md:pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tight font-outfit">
            <span className="text-gradient">
              {selectedCity === 'Tutte' ? 'Find Your Next UniParty' : `Eventi a ${selectedCity}`}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
            {selectedCity === 'Tutte' 
              ? 'The official premium platform for university life. Experience exclusive events and networking.'
              : `I migliori eventi universitari a ${selectedCity}. Feste, seminari e networking di alto livello.`}
          </p>
          
          {/* Search Bar Floating Island */}
          <div className="max-w-3xl mx-auto relative flex items-center p-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl transition-all hover:border-white/20">
            <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Cerca feste, seminari, associazioni..."
                  className="w-full pl-6 pr-12 py-4 bg-transparent text-white focus:outline-none placeholder-slate-500 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-2xl font-bold flex items-center transition-all ${showFilters || hasActiveFilters ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            >
                <Filter className="h-5 w-5 mr-2" />
                Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel (Glassmorphism) */}
      {showFilters && (
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 animate-in slide-in-from-top-4 duration-500">
              <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-8">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Affina la ricerca</h3>
                      <button onClick={clearFilters} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                          Reset All
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      {/* Time Filter */}
                      <div className="space-y-4">
                          <label className="text-sm font-bold text-slate-300 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-indigo-400" /> Time
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {['all', 'today', 'tomorrow', 'week', 'weekend'].map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => setSelectedTime(t as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedTime === t ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                  >
                                      {t === 'all' ? 'Any Date' : t.charAt(0).toUpperCase() + t.slice(1)}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Category Filter */}
                      <div className="space-y-4">
                          <label className="text-sm font-bold text-slate-300 flex items-center">
                              <Tag className="w-4 h-4 mr-2 text-indigo-400" /> Category
                          </label>
                          <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === 'all' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                              >
                                  All
                              </button>
                              {Object.values(EventCategory).map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Price Filter */}
                      <div className="space-y-4">
                          <label className="text-sm font-bold text-slate-300 flex items-center">
                              <DollarSign className="w-4 h-4 mr-2 text-indigo-400" /> Price
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {[
                                  { id: 'all', label: 'Any Price' }, 
                                  { id: 'free', label: 'Free' }, 
                                  { id: 'paid', label: 'Paid' }
                              ].map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={() => setSelectedPrice(p.id as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedPrice === p.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                  >
                                      {p.label}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h2 className="text-3xl font-bold font-outfit text-white">
              {searchTerm ? 'Search Results' : 'Upcoming Events'}
              <span className="ml-3 text-sm font-black text-slate-500 bg-white/5 px-3 py-1 rounded-lg">
                {filteredEvents.length}
              </span>
          </h2>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-widest text-pink-400 hover:text-pink-300 transition-colors bg-pink-500/10 px-4 py-2 rounded-xl border border-pink-500/20">
              Clear all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl h-96 animate-pulse border border-white/5"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))
            ) : (
              <div className="col-span-full py-24 text-center">
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl">
                    <Search className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                  {selectedCity !== 'Tutte' 
                    ? `Non ci sono eventi al momento a ${selectedCity}. Espandi la tua ricerca o cambia città.`
                    : 'Prova ad aggiustare i filtri o i termini di ricerca.'}
                </p>
                <button onClick={clearFilters} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;