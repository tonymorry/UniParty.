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
      {/* Glow Effect Background */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-indigo-500/20 group-hover:via-purple-500/20 group-hover:to-blue-500/20 rounded-[22px] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <div className="relative bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden group-hover:translate-y-[-4px] transition-all duration-300 border border-white/10 h-full flex flex-col">
        <div className="relative h-52 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            onError={handleImageError}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          {/* Image Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute top-4 right-4 flex gap-2 z-10">
               {(!user || user.role === UserRole.STUDENTE) && (
                   <button 
                        onClick={handleFavoriteClick}
                        className="bg-black/40 backdrop-blur-xl p-2.5 rounded-xl shadow-lg hover:scale-110 transition border border-white/10 group/heart"
                   >
                       <Heart 
                          className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-white/70 group-hover/heart:text-pink-400'}`} 
                        />
                   </button>
               )}
               {isOwner && (
                   <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-xl text-pink-400 font-bold text-xs shadow-lg flex items-center border border-white/10">
                       <Heart className="w-3.5 h-3.5 mr-1.5 fill-pink-500" />
                       {event.favoritesCount || 0}
                   </div>
               )}
               <div className="bg-indigo-600 px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center">
                    {isFree ? 'FREE' : `€${finalPrice.toFixed(2)}`}
               </div>
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-[0.2em]">
            {typeof event.organization === 'string' ? 'Association' : (event.organization?.name || 'Association')}
          </div>
          <h3 className="text-xl font-bold font-outfit text-white mb-3 group-hover:text-indigo-400 transition-colors leading-tight">
            {event.title}
          </h3>
          <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed font-medium">
            {event.description}
          </p>
          
          <div className="space-y-3 text-sm text-slate-500 mt-auto pt-5 border-t border-white/5">
            <div className="flex items-center group/item">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center mr-3 group-hover/item:bg-indigo-500/20 transition-colors">
                <Calendar className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-slate-300 font-medium">{eventDate} • {event.time}</span>
            </div>
            <div className="flex items-center group/item">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center mr-3 group-hover/item:bg-indigo-500/20 transition-colors">
                <MapPin className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="truncate text-slate-300 font-medium">{event.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center group/item">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center mr-3 group-hover/item:bg-indigo-500/20 transition-colors">
                  <Users className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {showExactNumbers 
                    ? `${event.ticketsSold}/${event.maxCapacity} Prenotati`
                    : isSoldOut 
                      ? 'Sold Out' 
                      : isAlmostSoldOut 
                        ? 'Ultimi posti!' 
                        : 'Disponibili'}
                </span>
              </div>
              {isAlmostSoldOut && !isSoldOut && (
                 <div className="flex items-center text-pink-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                   <Flame className="h-3.5 w-3.5 mr-1" />
                   Hot
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;