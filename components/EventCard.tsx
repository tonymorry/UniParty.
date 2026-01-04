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

  const priceInCents = Math.round(Number(event.price) * 100);
  const isFree = priceInCents === 0;
  const feeInCents = isFree ? 0 : 40;
  const totalInCents = priceInCents + feeInCents;
  const finalPrice = totalInCents / 100;

  const soldRatio = event.ticketsSold / event.maxCapacity;
  const isSoldOut = soldRatio >= 1;
  const isAlmostSoldOut = soldRatio >= 0.6 && !isSoldOut;
  
  const organizationId = typeof event.organization === 'string' 
    ? event.organization 
    : event.organization?._id;

  const isOwner = user && organizationId && user._id === organizationId;
  const showExactNumbers = isOwner;

  const isFavorite = user?.favorites?.includes(event._id) || false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.preventDefault(); 
      e.stopPropagation();
      if (user && user.role === UserRole.STUDENTE) {
          toggleFavorite(event._id);
      } else if (!user) {
          alert("Accedi come studente per salvare i preferiti.");
      }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://picsum.photos/800/400?random=999"; 
  };

  return (
    <Link to={`/events/${event._id}`} className="group relative block h-full">
      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:shadow-indigo-900/20 transition-all duration-300 border border-gray-700 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            onError={handleImageError}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 flex gap-2">
               {(!user || user.role === UserRole.STUDENTE) && (
                   <button 
                        onClick={handleFavoriteClick}
                        className="bg-gray-900/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition z-10 border border-white/10"
                   >
                       <Heart 
                          className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} 
                        />
                   </button>
               )}
               {isOwner && (
                   <div className="bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-pink-500 font-bold text-sm shadow-sm flex items-center border border-white/10">
                       <Heart className="w-3 h-3 mr-1 fill-pink-500" />
                       {event.favoritesCount || 0}
                   </div>
               )}
               <div className="bg-indigo-600 px-3 py-1 rounded-full text-white font-bold text-sm shadow-sm flex items-center">
                    {isFree ? 'Free' : `€${finalPrice.toFixed(2)}`}
               </div>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wide">
            {typeof event.organization === 'string' ? 'Association' : (event.organization?.name || 'Association')}
          </div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            {event.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
            {event.description}
          </p>
          
          <div className="space-y-2 text-sm text-gray-300 mt-auto pt-4 border-t border-gray-700">
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
                  ? `${event.ticketsSold}/${event.maxCapacity} Prenotati`
                  : isSoldOut 
                    ? 'Sold Out' 
                    : isAlmostSoldOut 
                      ? 'Ultimi posti!' 
                      : 'Voucher disponibili'}
              </span>
            </div>
            {isAlmostSoldOut && !isSoldOut && (
               <div className="flex items-center text-orange-400 text-xs font-bold mt-1">
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