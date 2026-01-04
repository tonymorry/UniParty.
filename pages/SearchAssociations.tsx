import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Search, UserPlus, UserCheck, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchAssociations: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  // Debounce logic could be added here, but simple submit/effect for now
  useEffect(() => {
    if (query.length > 2) {
      const search = async () => {
        setLoading(true);
        try {
          const data = await api.auth.searchAssociations(query);
          setResults(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      const timeoutId = setTimeout(search, 500);
      return () => clearTimeout(timeoutId);
    } else {
        setResults([]);
    }
  }, [query]);

  const handleToggleFollow = async (associationId: string) => {
      setFollowLoading(associationId);
      try {
          await api.auth.toggleFollow(associationId);
          await refreshUser(); // Update context to reflect new following list
      } catch (e) {
          console.error("Follow error", e);
      } finally {
          setFollowLoading(null);
      }
  };

  const isFollowing = (associationId: string) => {
      if (!user?.followedAssociations) return false;
      // Depending on if populate ran, it might be string ID or User object
      return user.followedAssociations.some((f: any) => 
          (typeof f === 'string' ? f : f._id) === associationId
      );
  };

  if (!user || user.role !== UserRole.STUDENTE) {
      return (
          <div className="p-8 text-center bg-gray-900 text-white min-h-screen">
              <p className="text-gray-400">Questa funzione è riservata agli studenti.</p>
              <button onClick={() => navigate('/')} className="text-indigo-400 mt-4 font-bold hover:text-indigo-300 transition">Torna alla Home</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Search className="w-7 h-7 mr-2 text-indigo-400" />
            Cerca Associazioni
        </h1>

        <div className="relative mb-8">
            <input 
                type="text" 
                placeholder="Digita il nome di un'associazione..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-700 rounded-xl shadow-lg bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-lg text-white placeholder-gray-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500" />
        </div>

        {loading ? (
             <div className="text-center py-12">
                 <div className="w-10 h-10 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                 <p className="text-gray-500">Ricerca in corso...</p>
             </div>
        ) : (
            <div className="space-y-4">
                {results.length > 0 ? (
                    results.map(assoc => (
                        <div 
                            key={assoc._id} 
                            onClick={() => navigate(`/association/${assoc._id}`)}
                            className="bg-gray-800 rounded-xl shadow-sm p-4 flex items-center justify-between transition hover:shadow-indigo-500/5 cursor-pointer hover:bg-gray-750 border border-gray-700"
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden mr-4 flex-shrink-0 border border-gray-600 shadow-inner">
                                    {assoc.profileImage ? (
                                        <img src={assoc.profileImage} alt={assoc.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-indigo-400">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{assoc.name}</h3>
                                    <p className="text-sm text-gray-400">{assoc.followersCount || 0} Followers</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent navigation when clicking follow
                                    handleToggleFollow(assoc._id);
                                }}
                                disabled={followLoading === assoc._id}
                                className={`px-4 py-2 rounded-full font-bold text-sm flex items-center transition shadow-sm ${
                                    isFollowing(assoc._id) 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                {followLoading === assoc._id ? (
                                    <span className="opacity-50">...</span>
                                ) : isFollowing(assoc._id) ? (
                                    <>
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Segui già
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Segui
                                    </>
                                )}
                            </button>
                        </div>
                    ))
                ) : (
                    query.length > 2 && (
                        <div className="text-center py-12 text-gray-500">
                            Nessuna associazione trovata.
                        </div>
                    )
                )}
                
                {query.length <= 2 && (
                     <div className="text-center py-12 text-gray-500 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700 p-8">
                         Inizia a digitare per cercare organizzatori da seguire.
                         <br/><span className="text-indigo-400/80">Riceverai una notifica email quando pubblicheranno nuovi eventi!</span>
                     </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchAssociations;