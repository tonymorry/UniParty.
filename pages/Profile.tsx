import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Event } from '../types';
import { api } from '../services/api';
import { User, Mail, Briefcase, CheckCircle, AlertTriangle, Calendar, Globe, Camera, X, Save, TrendingUp, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [assocEvents, setAssocEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
      name: '',
      email: '',
      surname: '',
      description: '',
      socialLinks: '',
      profileImage: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
        setEditForm({
            name: user.name,
            email: user.email,
            surname: user.surname || '',
            description: user.description || '',
            socialLinks: user.socialLinks || '',
            profileImage: user.profileImage || ''
        });
    }
    if (user?.role === UserRole.ASSOCIAZIONE) {
      setLoadingEvents(true);
      api.events.getByOrgId(user._id)
        .then(setAssocEvents)
        .finally(() => setLoadingEvents(false));
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          await updateUserProfile({
              name: editForm.name,
              email: editForm.email,
              surname: user?.role === UserRole.STUDENTE ? editForm.surname : undefined,
              description: user?.role === UserRole.ASSOCIAZIONE ? editForm.description : undefined,
              socialLinks: user?.role === UserRole.ASSOCIAZIONE ? editForm.socialLinks : undefined,
              profileImage: editForm.profileImage
          });
          setIsEditing(false);
      } catch(e: any) {
          alert("Failed to update profile: " + (e.message || "Unknown error"));
      } finally {
          setSaving(false);
      }
  };

  // Calculate Dashboard Stats
  const totalEvents = assocEvents.length;
  const totalTicketsSold = assocEvents.reduce((acc, curr) => acc + curr.ticketsSold, 0);
  const totalRevenue = assocEvents.reduce((acc, curr) => acc + (curr.ticketsSold * curr.price), 0);

  if (!user) return <div className="p-8 text-center">Please login to view profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      
      {/* EDIT PROFILE MODAL */}
      {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                      <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="url" 
                                    value={editForm.profileImage}
                                    onChange={e => setEditForm({...editForm, profileImage: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="https://example.com/me.jpg"
                                />
                                {editForm.profileImage && (
                                    <img src={editForm.profileImage} alt="Preview" className="w-10 h-10 rounded-full object-cover border" />
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input 
                                type="text" 
                                value={editForm.name}
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                value={editForm.email}
                                onChange={e => setEditForm({...editForm, email: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>

                        {user.role === UserRole.STUDENTE && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                                <input 
                                    type="text" 
                                    value={editForm.surname}
                                    onChange={e => setEditForm({...editForm, surname: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        )}

                        {user.role === UserRole.ASSOCIAZIONE && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        value={editForm.description}
                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Social Links</label>
                                    <textarea 
                                        value={editForm.socialLinks}
                                        onChange={e => setEditForm({...editForm, socialLinks: e.target.value})}
                                        rows={2}
                                        placeholder="Instagram: @handle, Website: www.example.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate multiple links with commas or new lines.</p>
                                </div>
                            </>
                        )}

                        <button 
                            type="submit"
                            disabled={saving}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition mt-4 flex justify-center items-center"
                        >
                            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
                        </button>
                  </form>
              </div>
          </div>
      )}


      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="bg-indigo-900 h-32 relative">
                <div className="absolute -bottom-12 left-8">
                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg overflow-hidden">
                        {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                <User className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="absolute top-4 right-4">
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-white/20 backdrop-blur hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition flex items-center"
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Edit Profile
                    </button>
                </div>
            </div>
            <div className="pt-16 pb-8 px-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name} {user.surname}</h1>
                        <p className="text-indigo-600 font-medium">{user.email}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider">
                        {user.role}
                    </span>
                </div>

                {/* Main Profile Grid */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN: Description / About */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                            {user.role === UserRole.ASSOCIAZIONE ? 'Organization Details' : 'About'}
                        </h2>
                        
                        {user.role === UserRole.ASSOCIAZIONE ? (
                            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                                {user.description || 'No description provided.'}
                            </p>
                        ) : (
                            <p className="text-gray-500 italic">Student Account</p>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Contact Info & Links */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Contact Info</h2>
                        
                        <div className="space-y-4">
                             {/* Email */}
                            <div className="flex items-center text-gray-700 text-base font-medium">
                                <Mail className="w-5 h-5 mr-3 text-indigo-600" />
                                {user.email}
                            </div>
                            
                            {/* Social Links (Now in Contact Section) */}
                            {user.role === UserRole.ASSOCIAZIONE && user.socialLinks && (
                                <div className="flex items-start text-gray-700 text-base font-medium">
                                    <Globe className="w-5 h-5 mr-3 text-indigo-600 flex-shrink-0 mt-1" />
                                    <div className="whitespace-pre-line">
                                        {user.socialLinks}
                                    </div>
                                </div>
                            )}

                            {/* Stripe Status */}
                            {user.role === UserRole.ASSOCIAZIONE && (
                                <div className={`flex items-center p-3 rounded-lg mt-2 border ${user.stripeOnboardingComplete ? 'bg-green-50 text-green-800 border-green-100' : 'bg-orange-50 text-orange-800 border-orange-100'}`}>
                                    {user.stripeOnboardingComplete ? (
                                        <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    )}
                                    <span className="text-sm font-semibold">
                                        {user.stripeOnboardingComplete ? 'Stripe Connected' : 'Stripe Not Connected'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Association Events List & Dashboard */}
        {user.role === UserRole.ASSOCIAZIONE && (
            <>
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
                        <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">€{totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
                        <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Vouchers Sold</p>
                            <p className="text-2xl font-bold text-gray-900">{totalTicketsSold}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
                        <div className="p-3 rounded-full bg-orange-50 text-orange-600 mr-4">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Events Created</p>
                            <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Briefcase className="w-6 h-6 mr-2 text-indigo-600" />
                        Your Events
                    </h2>
                    {loadingEvents ? (
                        <div>Loading events...</div>
                    ) : assocEvents.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {assocEvents.map(event => (
                                <div key={event._id} className="py-4 flex items-center justify-between group">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg mr-4 overflow-hidden">
                                            <img src={event.image} className="w-full h-full object-cover" alt=""/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">{event.title}</h3>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(event.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-medium text-gray-900">
                                            {/* Association ALWAYS sees their own stats here because it's their profile */}
                                            {event.ticketsSold} / {event.maxCapacity} sold
                                        </div>
                                        <div className="text-xs text-green-600 font-semibold mt-1">
                                            +€{(event.ticketsSold * event.price).toFixed(2)}
                                        </div>
                                        <Link to={`/events/${event._id}`} className="text-xs text-indigo-600 hover:underline block mt-1">
                                            Manage Event
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">You haven't created any events yet.</p>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Profile;