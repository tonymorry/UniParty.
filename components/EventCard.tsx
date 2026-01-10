
import React from 'react';
import { Link } from 'react-router-dom';
// Added User as UserIcon to fix "Cannot find name 'UserIcon'" error
import { Calendar, MapPin, Users, Flame, Heart, ArrowUpRight, User as UserIcon } from 'lucide-react';
import { Event, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { user, toggleFavorite } = useAuth();
  
  const eventDate = new Date(event.date).toLocaleDateString('it-IT', {
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
  const isAlmostSoldOut = soldRatio >= 0.8 && !isSoldOut;
  
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
    <Link to={`/events/${event._id}`} className="group relative block h-full">
      <div className="glass-panel rounded-[2.5rem] overflow-hidden flex flex-col h-full neon-border hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-500">
        
        {/* Image Section */}
        <div className="relative h-60 overflow-hidden m-3 rounded-[2rem]">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          
          {/* Overlays */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className="flex gap-2">
              <div className="backdrop-blur-xl bg-white/10 px-3 py-1.5 rounded-full text-white font-bold text-xs border border-white/20 shadow-2xl">
                {isFree ? 'FREE' : `€${finalPrice.toFixed(2)}`}
              </div>
              {isAlmostSoldOut && (
                 <div className="backdrop-blur-xl bg-orange-500/20 px-3 py-1.5 rounded-full text-orange-400 font-bold text-xs border border-orange-500/30 animate-pulse flex items-center">
                   <Flame className="w-3 h-3 mr-1" /> HOT
                 </div>
              )}
            </div>

            <button 
              onClick={handleFavoriteClick}
              className="pointer-events-auto backdrop-blur-xl bg-white/10 p-2.5 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-white'}`} />
            </button>
          </div>

          <div className="absolute bottom-4 left-4">
             <div className="flex items-center space-x-2 backdrop-blur-xl bg-slate-900/60 px-3 py-1 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{event.category}</span>
             </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="px-6 pb-8 pt-2 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-3">
             <h3 className="text-xl font-display font-bold text-white leading-tight flex-1 line-clamp-2">
               {event.title}
             </h3>
             <div className="ml-4 p-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500">
               <ArrowUpRight className="w-4 h-4 text-indigo-400" />
             </div>
          </div>
          
          <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-1 font-medium leading-relaxed">
            {event.description}
          </p>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date</p>
                <p className="text-xs font-bold text-slate-200">{eventDate} • {event.time}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Where</p>
                <p className="text-xs font-bold text-slate-200 truncate">{event.location}</p>
              </div>
            </div>

            <div className="col-span-2 flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-400">
                {isSoldOut ? (
                  <span className="text-red-400">Sold Out</span>
                ) : (
                  <>
                    <span className="text-indigo-400">{event.ticketsSold}</span> / {event.maxCapacity} spots taken
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
