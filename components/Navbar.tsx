import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { UserRole, UNIVERSITY_LOCATIONS } from '../types';
import { api } from '../services/api';
import { Ticket, PlusCircle, User as UserIcon, ScanLine, Menu, X, Shield, HelpCircle, Heart, Trash2, FileText, LayoutDashboard, Search, Bell, LogOut, MapPin, ChevronDown } from 'lucide-react';

const UniPartyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
    <defs>
      <linearGradient id="logo_gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <g transform="translate(50, 50) rotate(-15) translate(-50, -50)">
      <path 
        d="M25 20 H75 A10 10 0 0 1 85 30 V42 A8 8 0 0 0 85 58 V70 A10 10 0 0 1 75 80 H25 A10 10 0 0 1 15 70 V58 A8 8 0 0 0 15 42 V30 A10 10 0 0 1 25 20 Z" 
        fill="url(#logo_gradient)" 
      />
      <path 
        d="M50 35 L54 45 H65 L56 52 L60 63 L50 56 L40 63 L44 52 L35 45 H46 L50 35 Z" 
        fill="white" 
      />
    </g>
  </svg>
);

const Navbar: React.FC = () => {
  const { user, logout, deleteAccount } = useAuth();
  const { selectedCity, setSelectedCity } = useLocationContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
      if (user) {
          try {
              const notifs = await api.notifications.getAll();
              const unread = notifs.filter((n: any) => !n.isRead).length;
              setUnreadCount(unread);
          } catch(e) {
              console.error(e);
          }
      }
  };

  useEffect(() => {
      fetchUnreadCount();
  }, [user, location]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleDeleteAccount = async () => {
      const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
      if (confirm) {
          try {
              await deleteAccount();
              setIsOpen(false);
              navigate('/');
              alert("Account deleted successfully.");
          } catch (e) {
              alert("Failed to delete account. Please try again.");
          }
      }
  };

  if (user?.role === UserRole.STAFF) {
      return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-[100] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <UniPartyLogo />
                <span className="text-xl font-bold tracking-wider font-outfit bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">Staff Scanner</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/scanner" className="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
                    <ScanLine className="h-4 w-4 mr-2" /> Scanner
                </Link>
                <button onClick={handleLogout} className="p-2 text-indigo-300 hover:text-white transition">
                    <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      );
  }

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-[100] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <UniPartyLogo />
              <span className="text-xl font-bold tracking-wider font-outfit hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">UniParty</span>
            </Link>

            <div className="relative">
              <button 
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition shadow-sm text-sm font-semibold text-indigo-100"
              >
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{selectedCity}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCityDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCityDropdownOpen(false)}></div>
                  <div className="absolute top-12 left-0 w-64 z-20 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[70vh] overflow-y-auto py-2">
                      <button
                        onClick={() => {
                          setSelectedCity('Tutte');
                          setIsCityDropdownOpen(false);
                          if (location.pathname !== '/') navigate('/');
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-bold transition ${selectedCity === 'Tutte' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
                      >
                        Tutte le città
                      </button>
                      {Object.entries(UNIVERSITY_LOCATIONS).map(([region, cities]) => (
                        <div key={region} className="mt-2">
                          <div className="px-4 py-1 text-[10px] uppercase font-black text-slate-500 tracking-widest bg-white/5">
                            {region}
                          </div>
                          {cities.map(city => (
                            <button
                              key={city}
                              onClick={() => {
                                setSelectedCity(city);
                                setIsCityDropdownOpen(false);
                                if (location.pathname !== '/') navigate('/');
                              }}
                              className={`w-full text-left px-5 py-1.5 text-sm transition ${selectedCity === city ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
              {user && (
                  <Link to="/notifications" className="relative p-2 text-indigo-200 hover:text-white transition">
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-pink-500 ring-2 ring-slate-900 text-[10px] font-bold text-center flex items-center justify-center animate-pulse">
                              {unreadCount}
                          </span>
                      )}
                  </Link>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/5 transition-colors"
              >
                {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-20 right-0 w-full sm:w-80 z-50 bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in slide-in-from-top-2 duration-200 sm:rounded-2xl max-h-[calc(100vh-6rem)] overflow-y-auto m-0 sm:m-2">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-4 py-3 rounded-xl text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}>Events</Link>
            {!user && (
              <Link to="/auth" className="block px-4 py-3 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-500 text-center shadow-lg shadow-indigo-600/20 transition" onClick={() => setIsOpen(false)}>Login / Register</Link>
            )}
            {user && user.role === UserRole.STUDENTE && (
               <>
                 <Link to="/search" className="flex items-center px-4 py-3 rounded-xl text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}><Search className="h-5 w-5 mr-3 text-indigo-400" /> Search Associations</Link>
                 <Link to="/wallet" className="flex items-center px-4 py-3 rounded-xl text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}><Ticket className="h-5 w-5 mr-3 text-yellow-500" /> My Wallet</Link>
                 <Link to="/favorites" className="flex items-center px-4 py-3 rounded-xl text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}><Heart className="h-5 w-5 mr-3 text-red-500" /> Favorite Events</Link>
               </>
            )}
            {user && user.role === UserRole.ASSOCIAZIONE && (
               <>
                 <Link to="/dashboard" className="flex items-center px-4 py-3 rounded-xl text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}><LayoutDashboard className="h-5 w-5 mr-3 text-indigo-400" /> Dashboard</Link>
                 <Link to="/dashboard?tab=create" className="flex items-center px-4 py-3 rounded-xl text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}><PlusCircle className="h-5 w-5 mr-3 text-green-500" /> Add Event</Link>
                 <Link to="/scanner" className="flex items-center px-4 py-3 rounded-xl text-base font-medium bg-white/5 hover:bg-white/10 transition" onClick={() => setIsOpen(false)}><ScanLine className="h-5 w-5 mr-3 text-cyan-400" /> Scan Voucher</Link>
               </>
             )}
             {user && user.role === UserRole.ADMIN && (
                 <Link to="/admin" className="flex items-center px-4 py-3 rounded-xl text-base font-medium bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 transition" onClick={() => setIsOpen(false)}><Shield className="h-5 w-5 mr-3 text-red-500" /> Admin Dashboard</Link>
             )}
             {user && (
               <div className="border-t border-white/5 mt-2 pt-2 pb-1">
                 <div className="flex items-center px-4 mb-2 pt-2">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-sm overflow-hidden">
                       {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <UserIcon className="h-6 w-6 text-indigo-400" />}
                    </div>
                    <div className="ml-3 overflow-hidden">
                      <div className="text-base font-bold leading-none text-white truncate">{user.name}</div>
                      <div className="text-xs font-medium leading-none text-slate-400 mt-1 capitalize">{user.role}</div>
                    </div>
                 </div>
                 <Link to="/profile" className="block px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition text-slate-300" onClick={() => setIsOpen(false)}>My Profile</Link>
                 <button onClick={handleLogout} className="w-full text-left block px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition">Logout</button>
                 <button onClick={handleDeleteAccount} className="w-full text-left flex items-center px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 transition mt-1"><Trash2 className="h-4 w-4 mr-2" /> Delete Account</button>
               </div>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;