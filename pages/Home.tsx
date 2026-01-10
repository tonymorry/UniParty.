
import React, { useEffect, useState } from 'react';
import { Event, EventCategory } from '../types';
import { api } from '../services/api';
import EventCard from '../components/EventCard';
import { useLocationContext } from '../context/LocationContext';
import { Search, Filter, X, Calendar, Tag, DollarSign, Check, MapPin, Sparkles } from 'lucide-react';

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
        if (selectedTime === 'today') {
            if (eventDateNoTime.getTime() !== today.getTime()) return false;
        }
        else if (selectedTime === 'tomorrow') {
            if (eventDateNoTime.getTime() !== tomorrow.getTime()) return false;
        }
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
    <div className="min-h-screen bg-[#020617] text-white pb-24 md:pb-0">
      {/* Hero Section */}
      <div className="bg-transparent py-10 md:py-24 relative overflow-hidden">
        {/* Background neon glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full filter blur-[100px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 md:mb-6 animate-bounce">
            <Sparkles className="w-3 h-3 mr-2" />
            University Life Reimagined
          </div>
          <h1 className="text-3xl md:text-7xl font-black mb-3 md:mb-4 tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-indigo-300">
            {selectedCity === 'Tutte' ? 'Find Your Next Party' : `Eventi a ${selectedCity}`}
          </h1>
          <p className="text-sm md:text-xl text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto font-medium">
            {selectedCity === 'Tutte' 
              ? 'The official platform for university events. Exclusive parties, networking, and fun.'
              : `I migliori eventi universitari a ${selectedCity}. Feste, seminari e networking.`}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-grow w-full">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-6 pr-12 py-3 md:py-5 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md text-white border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-500 font-medium text-sm md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Search className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
                </div>
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full md:w-auto px-6 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center ${showFilters || hasActiveFilters ? 'bg-indigo-600 text-white shadow-indigo-500/40 border border-indigo-400/50' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
                <Filter className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
          <div className="bg-slate-900/80 backdrop-blur-xl border-y border-white/10 shadow-2xl animate-in slide-in-from-top-2 duration-300 sticky top-16 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Precision Search</h3>
                      <button onClick={clearFilters} className="text-sm font-bold text-gray-400 hover:text-white transition">
                          Reset All
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Time Filter */}
                      <div>
                          <label className="block text-xs font-black text-gray-500 mb-4 uppercase tracking-widest flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Date
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {['all', 'today', 'tomorrow', 'week', 'weekend'].map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => setSelectedTime(t as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedTime === t ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:border-indigo-500/30 hover:text-white'}`}
                                  >
                                      {t === 'all' ? 'Anytime' : t.charAt(0).toUpperCase() + t.slice(1)}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Category Filter */}
                      <div>
                          <label className="block text-xs font-black text-gray-500 mb-4 uppercase tracking-widest flex items-center">
                              <Tag className="w-4 h-4 mr-2 text-indigo-500" /> Genre
                          </label>
                          <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === 'all' ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:border-indigo-500/30 hover:text-white'}`}
                              >
                                  All
                              </button>
                              {Object.values(EventCategory).map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:border-indigo-500/30 hover:text-white'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Price Filter */}
                      <div>
                          <label className="block text-xs font-black text-gray-500 mb-4 uppercase tracking-widest flex items-center">
                              <DollarSign className="w-4 h-4 mr-2 text-indigo-500" /> Pricing
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {[
                                  { id: 'all', label: 'Any' }, 
                                  { id: 'free', label: 'Free Only' }, 
                                  { id: 'paid', label: 'Paid Only' }
                              ].map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={() => setSelectedPrice(p.id as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedPrice === p.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:border-indigo-500/30 hover:text-white'}`}
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

      {/* Active Filters Chips */}
      {(hasActiveFilters || selectedCity !== 'Tutte') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              <span className="text-[8px] md:text-[10px] font-black text-gray-600 uppercase tracking-widest mr-1 shrink-0">Active:</span>
              {selectedCity !== 'Tutte' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] md:text-[11px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider shrink-0">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedCity}
                  </span>
              )}
              {selectedTime !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] md:text-[11px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider shrink-0">
                      {selectedTime}
                      <button onClick={() => setSelectedTime('all')} className="ml-1.5 hover:text-white transition"><X className="w-3 h-3"/></button>
                  </span>
              )}
              {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] md:text-[11px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider shrink-0">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('all')} className="ml-1.5 hover:text-white transition"><X className="w-3 h-3"/></button>
                  </span>
              )}
              {selectedPrice !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] md:text-[11px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider shrink-0">
                      {selectedPrice}
                      <button onClick={() => setSelectedPrice('all')} className="ml-1.5 hover:text-white transition"><X className="w-3 h-3"/></button>
                  </span>
              )}
              <button onClick={clearFilters} className="text-[8px] md:text-[10px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest ml-auto transition shrink-0">Clear All</button>
          </div>
      )}

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">
              {searchTerm ? 'Search Results' : 'Trending Events'}
              <span className="ml-2 md:ml-4 text-[10px] md:text-sm font-bold text-gray-600">({filteredEvents.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl h-[250px] md:h-[450px] animate-pulse"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))
            ) : (
              <div className="col-span-full py-20 md:py-32 text-center glass-card rounded-2xl md:rounded-3xl border-dashed">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-full w-14 h-14 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                    <Search className="w-6 h-6 md:w-10 md:h-10 text-indigo-400" />
                </div>
                <h3 className="text-lg md:text-2xl font-black text-white mb-2">No matching events</h3>
                <p className="text-xs md:text-gray-500 font-medium">
                  {selectedCity !== 'Tutte' 
                    ? `Non ci sono eventi al momento a ${selectedCity}.`
                    : 'Try adjusting your filters or search terms.'}
                </p>
                <button onClick={clearFilters} className="mt-6 md:mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-lg md:rounded-xl font-bold transition shadow-lg text-xs md:text-base">Clear all filters</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
