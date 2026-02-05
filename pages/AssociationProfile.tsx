
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole, Event, User } from '../types';
import EventCard from '../components/EventCard';
// Added CheckCircle to imports to fix the error: Cannot find name 'CheckCircle'.
import { Users, Globe, UserPlus, UserCheck, Briefcase, Calendar, ArrowLeft, Send, CheckCircle } from 'lucide-react';

const AssociationProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [association, setAssociation] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [prLoading, setPrLoading] = useState(false);
  const [prApplied, setPrApplied] = useState(false);

  useEffect(() => {
    if (id) {
        setLoading(true);
        const fetchProfile = api.auth.getPublicProfile(id);
        const fetchEvents = api.events.getPublicEventsByOrg(id);

        Promise.all([fetchProfile, fetchEvents])
            .then(([userData, eventsData]) => {
                setAssociation(userData);
                setEvents(eventsData);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }
  }, [id]);

  const handleToggleFollow = async () => {
    if (!user) return navigate('/auth');
    if (!association) return;
    setFollowLoading(true);
    try {
        await api.auth.toggleFollow(association._id);
        await refreshUser();
        setAssociation(prev => prev ? ({
            ...prev,
            followersCount: isFollowing() ? (prev.followersCount || 1) - 1 : (prev.followersCount || 0) + 1
        }) : null);
    } catch (e) { console.error(e); }
    finally { setFollowLoading(false); }
  };

  const handleApplyPR = async () => {
    if (!user) return navigate('/auth');
    if (!association) return;
    setPrLoading(true);
    try {
        await api.auth.applyForPR(association._id);
        setPrApplied(true);
        alert("Candidatura inviata con successo!");
    } catch (e: any) { alert(e.message); }
    finally { setPrLoading(false); }
  };

  const isFollowing = () => {
      if (!user?.followedAssociations || !association) return false;
      return user.followedAssociations.some((f: any) => (typeof f === 'string' ? f : f._id) === association._id);
  };

  const isPR = () => {
      return user?.role === UserRole.PR && (typeof user.parentOrganization === 'string' ? user.parentOrganization : user.parentOrganization?._id) === association?._id;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><div className="w-12 h-12 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div></div>;
  if (!association) return null;

  return (
    <div className="min-h-screen bg-gray-900 pb-20 text-white">
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-8">
               <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-400 hover:text-white transition">
                   <ArrowLeft className="w-5 h-5 mr-2" /> Indietro
               </button>

               <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-700 shadow-lg overflow-hidden bg-gray-900">
                            {association.profileImage ? (
                                <img src={association.profileImage} alt={association.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-900/20 text-indigo-400"><Briefcase className="w-16 h-16" /></div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{association.name}</h1>
                            <p className="text-gray-400 mt-2 whitespace-pre-line leading-relaxed max-w-2xl">{association.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                            <div className="flex items-center text-gray-300 font-medium bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                                <Users className="w-4 h-4 mr-2 text-indigo-400" />
                                {association.followersCount || 0} Followers
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                            {(!user || user.role === UserRole.STUDENTE) && (
                                <button
                                    onClick={handleToggleFollow}
                                    disabled={followLoading}
                                    className={`px-8 py-2.5 rounded-full font-bold transition shadow-lg ${isFollowing() ? 'bg-gray-700 text-gray-300' : 'bg-indigo-600 text-white'}`}
                                >
                                    {isFollowing() ? <><UserCheck className="w-5 h-5 mr-2 inline" /> Seguito</> : <><UserPlus className="w-5 h-5 mr-2 inline" /> Segui</>}
                                </button>
                            )}

                            {user?.role === UserRole.STUDENTE && !prApplied && (
                                <button
                                    onClick={handleApplyPR}
                                    disabled={prLoading}
                                    className="px-8 py-2.5 rounded-full font-bold bg-gray-900 border border-indigo-500 text-indigo-400 hover:bg-indigo-900/20 transition flex items-center"
                                >
                                    <Send className="w-4 h-4 mr-2" /> Diventa PR
                                </button>
                            )}
                            
                            {isPR() && (
                                <span className="px-6 py-2.5 rounded-full font-bold bg-green-900/30 text-green-400 border border-green-900/50 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" /> PR Accreditato
                                </span>
                            )}
                        </div>
                    </div>
               </div>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
           <h2 className="text-2xl font-bold text-white mb-8 flex items-center"><Calendar className="w-6 h-6 mr-3 text-indigo-400" /> Prossimi Eventi</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {events.map(event => <EventCard key={event._id} event={event} />)}
           </div>
      </div>
    </div>
  );
};

export default AssociationProfile;
