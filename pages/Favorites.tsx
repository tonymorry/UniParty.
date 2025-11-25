import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Event, UserRole } from '../types';
import EventCard from '../components/EventCard';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== UserRole.STUDENTE) {
      navigate('/');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const data = await api.auth.getFavoriteEvents(user._id);
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch favorites", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
            <Heart className="w-8 h-8 text-red-500 mr-3 fill-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Your Favorite Events</h1>
        </div>
        
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
                ))}
             </div>
        ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6">Start exploring events and click the heart icon to save them here!</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                >
                    Explore Events
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                    <EventCard key={event._id} event={event} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;