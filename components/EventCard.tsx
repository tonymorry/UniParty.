import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Flame, Heart } from 'lucide-react';
import { Event, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { user, toggleFavorite } = useAuth();
  
  const eventDate = new Date(event.date).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const finalPrice = event.price + 0.40;

  // Logic for ticket display
  const soldRatio = event.ticketsSold / event.maxCapacity;
  const isSoldOut = soldRatio >= 1;
  const isAlmostSoldOut = soldRatio >= 0.6 && !isSoldOut;
  
  // Determine if the current user is the OWNER of this event
  const organizationId = typeof event.organization === 'string' 
    ? event.organization 
    : event.organization._id;

  const isOwner = user && user._id === organizationId;
  const showExactNumbers = isOwner;

  // Favorite Logic
  const isFavorite = user?.favorites?.includes(event._id) || false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent navigating to event details
      e.stopPropagation();
      if (user && user.role === UserRole.STUDENTE) {
          toggleFavorite(event._id);
      } else if (!user) {
          alert("Please login as a student to save favorites.");
      }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://picsum.photos/800/400?random=999"; 
  };

  return (
    <Link to={`/events/${event._id}`} className="group relative block h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            onError={handleImageError}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 flex gap-2">
               {/* Favorite Button (Students Only) */}
               {(!user || user.role === UserRole.STUDENTE) && (
                   <button 
                        onClick={handleFavoriteClick}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition z-10"
                   >
                       <Heart 
                          className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`} 
                        />
                   </button>
               )}
               {/* Owner sees favorite count */}
               {isOwner && (
                   <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-pink-600 font-bold text-sm shadow-sm flex items-center">
                       <Heart className="w-3 h-3 mr-1 fill-pink-600" />
                       {event.favoritesCount || 0}
                   </div>
               )}
               <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-indigo-700 font-bold text-sm shadow-sm flex items-center">
                    {event.price === 0 ? 'Free' : `€${finalPrice.toFixed(2)}`}
               </div>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">
            {typeof event.organization === 'string' ? 'Association' : event.organization.name}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
            {event.title}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
            {event.description}
          </p>
          
          <div className="space-y-2 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
              <span>{eventDate} • {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-indigo-400" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-indigo-400" />
              <span>
                {showExactNumbers 
                  ? `${event.ticketsSold}/${event.maxCapacity} Sold`
                  : isSoldOut 
                    ? 'Sold Out' 
                    : isAlmostSoldOut 
                      ? 'Few tickets left!' 
                      : 'Tickets available'}
              </span>
            </div>
            {isAlmostSoldOut && !isSoldOut && (
               <div className="flex items-center text-orange-500 text-xs font-bold mt-1">
                 <Flame className="h-3 w-3 mr-1" />
                 Selling fast!
               </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;