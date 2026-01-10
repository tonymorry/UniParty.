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
  const finalPrice = (priceInCents + feeInCents) / 100;

  const soldRatio = event.ticketsSold / event.maxCapacity;
  const isSoldOut = soldRatio >= 1;
  const isAlmostSoldOut = soldRatio >= 0.6 && !isSoldOut;
  
  const organizationId = typeof event.organization === 'string' 
    ? event.organization 
    : event.organization?._id;

  const isOwner = user && organizationId && user._id === organizationId;
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

  return (
    <Link to={`/events/${event._id}`} className="group block h-full">
      <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] hover:border-white/10 hover:shadow-indigo-500/10 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            onError={(e) => { e.currentTarget.src = "https://picsum.photos/800/400?random=" + event._id; }}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          
          <div className="absolute top-3 right-3 flex gap-2">
               {(!user || user.role === UserRole.STUDENTE) && (
                   <button 
                        onClick={handleFavoriteClick}
                        className="glass-panel p-2 rounded-xl hover:scale-110 transition z-10"
                   >
                       <Heart 
                          className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-white'}`} 
                        />
                   </button>
               )}
               {isOwner && (
                   <div className="glass-panel px-3 py-1 rounded-xl text-pink-400 font-bold text-xs flex items-center">
                       <Heart className="w-3 h-3 mr-1 fill-pink-400" />
                       {event.favoritesCount || 0}
                   </div>
               )}
               <div className="bg-indigo-600 px-3 py-1 rounded-xl text-white font-bold text-xs shadow-lg shadow-indigo-600/20">
                    {isFree ? 'Free' : `€${finalPrice.toFixed(2)}`}
               </div>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-widest opacity-80">
            {typeof event.organization === 'string' ? 'Association' : (event.organization?.name || 'Association')}
          </div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
          
          <div className="space-y-2 mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center text-xs text-slate-300">
              <Calendar className="h-3.5 w-3.5 mr-2 text-indigo-400" />
              <span>{eventDate} • {event.time}</span>
            </div>
            <div className="flex items-center text-xs text-slate-300">
              <MapPin className="h-3.5 w-3.5 mr-2 text-indigo-400" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center text-xs text-slate-300">
              <Users className="h-3.5 w-3.5 mr-2 text-indigo-400" />
              <span className={isSoldOut ? 'text-red-400 font-bold' : ''}>
                {isSoldOut ? 'Sold Out' : isAlmostSoldOut ? 'Ultimi posti!' : 'Voucher disponibili'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;