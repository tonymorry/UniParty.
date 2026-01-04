import React, { useEffect, useState } from 'react';
import { Event, EventCategory } from '../types';
import { api } from '../services/api';
import EventCard from '../components/EventCard';
import { Search, Filter, X, Calendar, Tag, DollarSign, Check } from 'lucide-react';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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
    // 1. Text Search (Title, Location, Organization Name)
    const lowerSearch = searchTerm.toLowerCase();
    
    // Safely extract organization name if it's populated
    const orgName = typeof e.organization === 'object' && e.organization !== null && 'name' in e.organization
      ? e.organization.name.toLowerCase() 
      : '';

    const matchesSearch = 
      e.title.toLowerCase().includes(lowerSearch) ||
      e.location.toLowerCase().includes(lowerSearch) ||
      orgName.includes(lowerSearch);
    
    if (!matchesSearch) return false;

    // 2. Category Filter
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;

    // 3. Price Filter
    if (selectedPrice === 'free' && e.price > 0) return false;
    if (selectedPrice === 'paid' && e.price === 0) return false;

    // 4. Time Filter
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
            // Next 7 days
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            if (eventDateNoTime < today || eventDateNoTime > nextWeek) return false;
        }
        else if (selectedTime === 'weekend') {
            // Simple logic: If it's Fri/Sat/Sun and within next 7 days
            const day = eventDate.getDay(); // 0=Sun, 6=Sat, 5=Fri
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-slate-950 text-white py-12 md:py-16 relative overflow-hidden border-b border-white/5">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Find Your Next UniParty</h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            The official platform for university events. Exclusive parties, networking, and fun.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative flex items-center">
            <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search events by name, location or association..."
                  className="w-full pl-6 pr-12 py-4 rounded-l-full bg-gray-800 text-white focus:outline-none shadow-lg border-r border-gray-700 placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Search className="h-5 w-5 text-gray-500" />
                </div>
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-r-full font-semibold flex items-center transition shadow-lg ${showFilters || hasActiveFilters ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
                <Filter className="h-5 w-5 mr-2" />
                Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
          <div className="bg-gray-800 border-b border-gray-700 shadow-xl animate-in slide-in-from-top-2 duration-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Filter Events</h3>
                      <button onClick={clearFilters} className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition">
                          Reset All
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Time Filter */}
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-indigo-400" /> Time
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {['all', 'today', 'tomorrow', 'week', 'weekend'].map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => setSelectedTime(t as any)}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedTime === t ? 'bg-indigo-900 border-indigo-700 text-indigo-100 font-medium' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                                  >
                                      {t === 'all' ? 'Any Date' : t.charAt(0).toUpperCase() + t.slice(1)}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Category Filter */}
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                              <Tag className="w-4 h-4 mr-2 text-indigo-400" /> Category
                          </label>
                          <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedCategory === 'all' ? 'bg-indigo-900 border-indigo-700 text-indigo-100 font-medium' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                              >
                                  All
                              </button>
                              {Object.values(EventCategory).map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedCategory === cat ? 'bg-indigo-900 border-indigo-700 text-indigo-100 font-medium' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Price Filter */}
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
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
                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedPrice === p.id ? 'bg-indigo-900 border-indigo-700 text-indigo-100 font-medium' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
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
      {!showFilters && hasActiveFilters && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-2 overflow-x-auto">
              <span className="text-xs font-semibold text-gray-500 uppercase mr-2">Active:</span>
              {selectedTime !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-900 text-indigo-100 border border-indigo-700">
                      {selectedTime}
                      <button onClick={() => setSelectedTime('all')} className="ml-2 hover:text-white transition"><X className="w-3 h-3"/></button>
                  </span>
              )}
              {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-900 text-indigo-100 border border-indigo-700">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('all')} className="ml-2 hover:text-white transition"><X className="w-3 h-3"/></button>
                  </span>
              )}
              {selectedPrice !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-900 text-indigo-100 border border-indigo-700">
                      {selectedPrice}
                      <button onClick={() => setSelectedPrice('all')} className="ml-2 hover:text-white transition"><X className="w-3 h-3"/></button>
                  </span>
              )}
              <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-400 underline ml-auto transition">Clear All</button>
          </div>
      )}

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
              {searchTerm ? 'Search Results' : 'Upcoming Events'}
              <span className="ml-2 text-sm font-normal text-gray-500">({filteredEvents.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1, 2, 3].map(i => (
               <div key={i} className="bg-gray-800 rounded-xl h-96 animate-pulse border border-gray-700"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-gray-700 shadow-xl">
                    <Search className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No events found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="mt-4 text-indigo-400 font-semibold hover:underline transition">Clear all filters</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;