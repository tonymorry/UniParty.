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

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="glass-panel backdrop-blur-2xl bg-slate-900/70 rounded-2xl border border-white/10 px-4 h-16 flex items-center justify-between shadow-2xl neon-glow-indigo">
          
          {/* Logo & City Selector */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Link to="/" className="flex items-center space-x-2 group" onClick={() => setIsOpen(false)}>
              <UniPartyLogo />
              <span className="text-xl font-display font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors hidden sm:inline">UniParty</span>
            </Link>

            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

            {/* City Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-semibold text-slate-200"
              >
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{selectedCity}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-300 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCityDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCityDropdownOpen(false)}></div>
                  <div className="absolute top-12 left-0 w-64 z-20 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="max-h-[70vh] overflow-y-auto py-2 no-scrollbar">
                      <button
                        onClick={() => {
                          setSelectedCity('Tutte');
                          setIsCityDropdownOpen(false);
                          if (location.pathname !== '/') navigate('/');
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm font-bold border-b border-white/5 transition ${selectedCity === 'Tutte' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
                      >
                        Tutte le città
                      </button>
                      
                      {Object.entries(UNIVERSITY_LOCATIONS).map(([region, cities]) => (
                        <div key={region} className="mt-2">
                          <div className="px-5 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
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
                              className={`w-full text-left px-6 py-2 text-sm transition ${selectedCity === city ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
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

          {/* Actions */}
          <div className="flex items-center space-x-2">
              {user && (
                  <Link to="/notifications" className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                          <span className="absolute top-2 right-2 flex h-4 w-4 rounded-full bg-indigo-500 border-2 border-slate-950 text-[10px] font-bold text-center items-center justify-center">
                              {unreadCount}
                          </span>
                      )}
                  </Link>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none transition-all duration-300"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
          </div>
        </div>

        {/* Dropdown Menu Container */}
        {isOpen && (
          <div className="mt-2 glass-panel backdrop-blur-3xl bg-slate-900/90 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
            <div className="p-2 space-y-1">
              <Link 
                  to="/" 
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive('/') ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'text-slate-300 hover:bg-white/5'}`}
                  onClick={() => setIsOpen(false)}
              >
                  Events
              </Link>

              {!user && (
                <Link 
                  to="/auth" 
                  className="block px-4 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 mt-2 text-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Login / Register
                </Link>
              )}

              {user && (
                 <>
                   <div className="h-px bg-white/5 my-2 mx-4"></div>
                   {user.role === UserRole.STUDENTE && (
                     <>
                       <Link to="/wallet" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition" onClick={() => setIsOpen(false)}>
                          <Ticket className="h-5 w-5 mr-3 text-indigo-400" /> My Wallet
                       </Link>
                       <Link to="/favorites" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition" onClick={() => setIsOpen(false)}>
                          <Heart className="h-5 w-5 mr-3 text-pink-500" /> Favorites
                       </Link>
                     </>
                   )}
                   {user.role === UserRole.ASSOCIAZIONE && (
                     <>
                       <Link to="/dashboard" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition" onClick={() => setIsOpen(false)}>
                          <LayoutDashboard className="h-5 w-5 mr-3 text-indigo-400" /> Dashboard
                       </Link>
                       <Link to="/scanner" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition" onClick={() => setIsOpen(false)}>
                          <ScanLine className="h-5 w-5 mr-3 text-cyan-400" /> Scanner
                       </Link>
                     </>
                   )}
                   {user.role === UserRole.ADMIN && (
                     <Link to="/admin" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition" onClick={() => setIsOpen(false)}>
                        <Shield className="h-5 w-5 mr-3" /> Admin Dashboard
                     </Link>
                   )}
                   
                   <div className="h-px bg-white/5 my-2 mx-4"></div>
                   
                   <div className="flex items-center px-4 py-3 space-x-3">
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover rounded-full" /> : <UserIcon className="h-5 w-5 text-indigo-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                      </div>
                      <Link to="/profile" className="text-xs font-bold text-indigo-400 hover:underline" onClick={() => setIsOpen(false)}>Edit</Link>
                   </div>

                   <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition">
                      <LogOut className="h-5 w-5 mr-3" /> Logout
                   </button>
                 </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  function isActive(path: string) {
    return location.pathname === path;
  }
};

export default Navbar;