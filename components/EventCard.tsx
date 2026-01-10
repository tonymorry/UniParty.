
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

  // FIX: Strict Integer Math for Price Display
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
      <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl overflow-hidden hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:border-indigo-500/30 transition-all duration-500 border border-white/10 h-full flex flex-col">
        <div className="relative h-32 md:h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            onError={handleImageError}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-1.5 md:gap-2">
               {/* Favorite Button (Students Only) */}
               {(!user || user.role === UserRole.STUDENTE) && (
                   <button 
                        onClick={handleFavoriteClick}
                        className="bg-black/40 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-10 border border-white/10"
                   >
                       <Heart 
                          className={`w-3.5 h-3.5 md:w-5 md:h-5 transition-colors ${isFavorite ? 'fill-neon-pink text-neon-pink' : 'text-white/70 hover:text-neon-pink'}`} 
                        />
                   </button>
               )}
               {/* Owner sees favorite count */}
               {isOwner && (
                   <div className="bg-black/60 backdrop-blur-md px-2 md:px-3 py-0.5 md:py-1 rounded-full text-neon-pink font-bold text-[9px] md:text-sm shadow-sm flex items-center border border-white/10">
                       <Heart className="w-2.5 h-2.5 md:w-3 h-3 mr-1 fill-neon-pink" />
                       {event.favoritesCount || 0}
                   </div>
               )}
               <div className="bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-white font-black text-[9px] md:text-sm shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center border border-white/20">
                    {isFree ? 'FREE' : `€${finalPrice.toFixed(2)}`}
               </div>
          </div>
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></div>
        </div>
        
        <div className="p-3 md:p-6 flex-1 flex flex-col">
          <div className="text-[8px] md:text-[10px] font-black text-indigo-400 mb-1 md:mb-2 uppercase tracking-[0.2em] truncate">
            {typeof event.organization === 'string' ? 'Association' : (event.organization?.name || 'Association')}
          </div>
          <h3 className="text-sm md:text-xl font-extrabold text-white mb-1.5 md:mb-3 group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
            {event.title}
          </h3>
          <p className="text-gray-400 text-[10px] md:text-sm mb-3 md:mb-6 line-clamp-1 md:line-clamp-2 flex-1 leading-relaxed font-medium hidden xs:block">
            {event.description}
          </p>
          
          <div className="space-y-1.5 md:space-y-3 text-[9px] md:text-sm text-gray-400 mt-auto pt-2 md:pt-5 border-t border-white/5">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 md:mr-3 text-indigo-400/80 shrink-0" />
              <span className="font-semibold truncate">{eventDate} • {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 md:mr-3 text-indigo-400/80 shrink-0" />
              <span className="truncate font-medium">{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 md:h-4 md:w-4 mr-2 md:mr-3 text-indigo-400/80 shrink-0" />
              <span className={`font-bold ${isSoldOut ? 'text-red-400' : 'text-gray-300'} truncate`}>
                {showExactNumbers 
                  ? `${event.ticketsSold}/${event.maxCapacity}`
                  : isSoldOut 
                    ? 'SOLD OUT' 
                    : isAlmostSoldOut 
                      ? 'Ultimi posti!' 
                      : 'Disponibile'}
              </span>
            </div>
            {isAlmostSoldOut && !isSoldOut && (
               <div className="flex items-center text-orange-400 text-[8px] md:text-[10px] font-black mt-1 uppercase tracking-widest animate-pulse">
                 <Flame className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1.5" />
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
