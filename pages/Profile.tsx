import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { User, Mail, Globe, Camera, X, Save, Upload, Settings, FileText, Shield, HelpCircle, LogOut, CheckCircle, AlertTriangle, Briefcase, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  
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
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          await updateUserProfile(editForm);
          setIsEditing(false);
      } catch(e: any) {
          alert("Failed to update profile");
      } finally {
          setSaving(false);
      }
  };

  if (!user) return <div className="p-8 text-center bg-gray-900 min-h-screen text-white">Please login.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      {/* Edit Modal (Standard Dark Application) */}
      {isEditing && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg border border-gray-700 p-6 space-y-4">
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
                  <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
                  <button onClick={handleUpdateProfile} className="w-full bg-indigo-600 py-3 rounded-lg font-bold">{saving ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => setIsEditing(false)} className="w-full bg-gray-700 py-2 rounded-lg">Cancel</button>
              </div>
          </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-700">
            <div className="bg-indigo-950 h-32 relative">
                <div className="absolute top-4 right-4">
                    <button onClick={() => setIsEditing(true)} className="bg-white/10 backdrop-blur hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold transition flex items-center">
                        <Camera className="w-4 h-4 mr-2" /> Edit Profile
                    </button>
                </div>
            </div>
            <div className="pt-16 pb-8 px-8">
                <h1 className="text-2xl font-bold">{user.name} {user.surname}</h1>
                <p className="text-indigo-400 font-medium">{user.email}</p>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-bold border-b border-gray-700 pb-3">Details</h2>
                        <p className="text-gray-400 mt-4">{user.description || 'No description provided.'}</p>
                    </div>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="mt-12 flex items-center text-red-400 font-bold hover:underline">
                    <LogOut className="w-5 h-5 mr-2" /> Logout
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;