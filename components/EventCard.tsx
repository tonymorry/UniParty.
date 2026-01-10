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
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:border-indigo-500/30 transition-all duration-500 border border-white/10 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            onError={handleImageError}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 right-4 flex gap-2">
               {/* Favorite Button (Students Only) */}
               {(!user || user.role === UserRole.STUDENTE) && (
                   <button 
                        onClick={handleFavoriteClick}
                        className="bg-black/40 backdrop-blur-md p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-10 border border-white/10"
                   >
                       <Heart 
                          className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-neon-pink text-neon-pink' : 'text-white/70 hover:text-neon-pink'}`} 
                        />
                   </button>
               )}
               {/* Owner sees favorite count */}
               {isOwner && (
                   <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-neon-pink font-bold text-sm shadow-sm flex items-center border border-white/10">
                       <Heart className="w-3 h-3 mr-1 fill-neon-pink" />
                       {event.favoritesCount || 0}
                   </div>
               )}
               <div className="bg-indigo-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-black text-sm shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center border border-white/20">
                    {isFree ? 'FREE' : `€${finalPrice.toFixed(2)}`}
               </div>
          </div>
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-[0.2em]">
            {typeof event.organization === 'string' ? 'Association' : (event.organization?.name || 'Association')}
          </div>
          <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-indigo-400 transition-colors leading-tight">
            {event.title}
          </h3>
          <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed font-medium">
            {event.description}
          </p>
          
          <div className="space-y-3 text-sm text-gray-400 mt-auto pt-5 border-t border-white/5">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-3 text-indigo-400/80" />
              <span className="font-semibold">{eventDate} • {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-3 text-indigo-400/80" />
              <span className="truncate font-medium">{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-3 text-indigo-400/80" />
              <span className={`font-bold ${isSoldOut ? 'text-red-400' : 'text-gray-300'}`}>
                {showExactNumbers 
                  ? `${event.ticketsSold}/${event.maxCapacity} Prenotati`
                  : isSoldOut 
                    ? 'SOLD OUT' 
                    : isAlmostSoldOut 
                      ? 'Ultimi posti!' 
                      : 'Posti disponibili'}
              </span>
            </div>
            {isAlmostSoldOut && !isSoldOut && (
               <div className="flex items-center text-orange-400 text-[10px] font-black mt-2 uppercase tracking-widest animate-pulse">
                 <Flame className="h-3 w-3 mr-1.5" />
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