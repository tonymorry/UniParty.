
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole, Event, User } from '../types';
import EventCard from '../components/EventCard';
import { Users, Globe, UserPlus, UserCheck, Briefcase, Calendar, ArrowLeft, Star } from 'lucide-react';

const AssociationProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [association, setAssociation] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [prLoading, setPrLoading] = useState(false);

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
            .catch(err => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }
  }, [id]);

  const handleToggleFollow = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!association) return;
    setFollowLoading(true);
    try {
        await api.auth.toggleFollow(association._id);
        await refreshUser();
    } catch (e) {
        console.error(e);
    } finally {
        setFollowLoading(false);
    }
  };

  const handlePRCandidate = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!association) return;
    setPrLoading(true);
    try {
      await api.pr.requestAccreditation(association._id);
      alert("Richiesta inviata! L'associazione riceverà una notifica.");
    } catch (e: any) {
      alert(e.message || "Errore nell'invio della richiesta.");
    } finally {
      setPrLoading(false);
    }
  };

  const isFollowing = () => {
      if (!user?.followedAssociations || !association) return false;
      return user.followedAssociations.some((f: any) => (typeof f === 'string' ? f : f._id) === association._id);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="w-12 h-12 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div></div>;
  if (!association) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white"><h2>Associazione non trovata</h2></div>;

  return (
    <div className="min-h-screen bg-gray-900 pb-20 text-white">
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-8">
               <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5 mr-2" /> Indietro</button>
               <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-gray-700 overflow-hidden bg-gray-900">
                        {association.profileImage ? <img src={association.profileImage} className="w-full h-full object-cover" /> : <Briefcase className="w-full h-full p-8 text-indigo-400" />}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <h1 className="text-3xl font-bold">{association.name}</h1>
                        <p className="text-gray-400">{association.description}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                            <span className="flex items-center text-gray-300 bg-gray-900 px-3 py-1 rounded-full border border-gray-700"><Users className="w-4 h-4 mr-2" /> {association.followersCount || 0} Followers</span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          {(!user || user.role === UserRole.STUDENTE) && (
                            <>
                              <button onClick={handleToggleFollow} className={`px-6 py-2 rounded-full font-bold ${isFollowing() ? 'bg-gray-700' : 'bg-indigo-600'}`}>{isFollowing() ? 'Segui già' : 'Segui'}</button>
                              <button onClick={handlePRCandidate} disabled={prLoading} className="px-6 py-2 bg-indigo-900/30 text-indigo-300 rounded-full font-bold border border-indigo-900/50 hover:bg-indigo-900/50 transition flex items-center">
                                <Star className="w-4 h-4 mr-2" /> Candidati come PR
                              </button>
                            </>
                          )}
                        </div>
                    </div>
               </div>
          </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12">
           <h2 className="text-2xl font-bold mb-8 flex items-center"><Calendar className="w-6 h-6 mr-3 text-indigo-400" /> Prossimi Eventi</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {events.map(event => <EventCard key={event._id} event={event} />)}
           </div>
      </div>
    </div>
  );
};

export default AssociationProfile;
