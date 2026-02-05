import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole, Event, User } from '../types';
import EventCard from '../components/EventCard';
import { Users, Globe, UserPlus, UserCheck, Briefcase, Calendar, ArrowLeft } from 'lucide-react';

const AssociationProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [association, setAssociation] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (id) {
        setLoading(true);
        // 1. Fetch Association Public Details
        const fetchProfile = api.auth.getPublicProfile(id);
        // 2. Fetch Active/Future Events
        const fetchEvents = api.events.getPublicEventsByOrg(id);

        Promise.all([fetchProfile, fetchEvents])
            .then(([userData, eventsData]) => {
                setAssociation(userData);
                setEvents(eventsData);
            })
            .catch(err => {
                console.error("Failed to load profile", err);
            })
            .finally(() => setLoading(false));
    }
  }, [id]);

  const handleToggleFollow = async () => {
    if (!user) {
        navigate('/auth'); // Redirect to login if guest
        return;
    }
    
    if (!association) return;

    setFollowLoading(true);
    try {
        await api.auth.toggleFollow(association._id);
        await refreshUser(); // Update context
        // Manually update local follower count for immediate feedback
        const isFollowing = user?.followedAssociations?.some((f: any) => 
            (typeof f === 'string' ? f : f._id) === association._id
        );
        
        setAssociation(prev => prev ? ({
            ...prev,
            followersCount: isFollowing ? (prev.followersCount || 1) - 1 : (prev.followersCount || 0) + 1
        }) : null);

    } catch (e) {
        console.error("Follow error", e);
    } finally {
        setFollowLoading(false);
    }
  };

  const isFollowing = () => {
      if (!user?.followedAssociations || !association) return false;
      return user.followedAssociations.some((f: any) => 
          (typeof f === 'string' ? f : f._id) === association._id
      );
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
               <div className="w-12 h-12 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
      );
  }

  if (!association) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-white">
              <h2 className="text-xl font-bold text-white mb-2">Associazione non trovata</h2>
              <button onClick={() => navigate('/')} className="text-indigo-400 font-semibold hover:text-indigo-300 transition">Torna alla Home</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20 text-white">
      {/* HEADER / BANNER */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-8">
               <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-400 hover:text-white transition">
                   <ArrowLeft className="w-5 h-5 mr-2" /> Indietro
               </button>

               <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-700 shadow-lg overflow-hidden bg-gray-900">
                            {association.profileImage ? (
                                <img src={association.profileImage} alt={association.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-900/20 text-indigo-400">
                                    <Briefcase className="w-16 h-16" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{association.name}</h1>
                            {association.description && (
                                <p className="text-gray-400 mt-2 whitespace-pre-line leading-relaxed max-w-2xl">
                                    {association.description}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                            <div className="flex items-center text-gray-300 font-medium bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                                <Users className="w-4 h-4 mr-2 text-indigo-400" />
                                {association.followersCount || 0} Followers
                            </div>
                            
                            {association.socialLinks && (
                                <div className="flex items-center text-gray-500">
                                    <Globe className="w-4 h-4 mr-2 text-indigo-900/50" />
                                    <span className="truncate max-w-[200px]">{association.socialLinks}</span>
                                </div>
                            )}
                        </div>

                        {/* Follow Button (Only for Students or Guests) */}
                        {(!user || user.role === UserRole.STUDENTE) && (
                             <div className="pt-2">
                                 <button
                                    onClick={handleToggleFollow}
                                    disabled={followLoading}
                                    className={`px-8 py-2.5 rounded-full font-bold shadow-lg transition transform active:scale-95 flex items-center mx-auto md:mx-0 ${
                                        isFollowing() 
                                        ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-650' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {followLoading ? (
                                        <span className="opacity-70">Updating...</span>
                                    ) : isFollowing() ? (
                                        <>
                                            <UserCheck className="w-5 h-5 mr-2" />
                                            Segui già
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5 mr-2" />
                                            Segui
                                        </>
                                    )}
                                </button>
                             </div>
                        )}
                    </div>
               </div>
          </div>
      </div>

      {/* EVENTS GRID */}
      <div className="max-w-6xl mx-auto px-4 py-12">
           <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
               <Calendar className="w-6 h-6 mr-3 text-indigo-400" />
               Prossimi Eventi
           </h2>
           
           {events.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {events.map(event => (
                       <EventCard key={event._id} event={event} />
                   ))}
               </div>
           ) : (
               <div className="text-center py-20 bg-gray-800 rounded-2xl shadow-sm border border-gray-700">
                   <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                       <Calendar className="w-8 h-8 text-gray-600" />
                   </div>
                   <p className="text-gray-400 font-medium">Nessun evento in programma al momento.</p>
                   <p className="text-sm text-gray-500 mt-1 italic">Segui l'associazione per ricevere notifiche sui nuovi eventi!</p>
               </div>
           )}
      </div>
    </div>
  );
};

export default AssociationProfile;