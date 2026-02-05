import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { UserRole, UNIVERSITY_LOCATIONS } from '../types';
import { api } from '../services/api';
import { Ticket, PlusCircle, User as UserIcon, ScanLine, Menu, X, Shield, HelpCircle, Heart, Trash2, FileText, LayoutDashboard, Search, Bell, LogOut, MapPin, ChevronDown } from 'lucide-react';

const UniPartyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
    <defs>
      <linearGradient id="logo_gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
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

  // --- STAFF SIMPLIFIED NAVBAR ---
  if (user?.role === UserRole.STAFF) {
      return (
        <nav className="bg-slate-950/80 backdrop-blur-md text-white shadow-xl sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <UniPartyLogo />
                <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Staff Scanner</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                    to="/scanner" 
                    className="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                >
                    <ScanLine className="h-4 w-4 mr-2" /> Scanner
                </Link>
                <button 
                    onClick={handleLogout}
                    className="p-2 text-indigo-300 hover:text-white transition"
                    title="Logout"
                >
                    <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      );
  }

  // --- ORIGINAL NAVBAR ---
  return (
    <nav className="bg-slate-950/80 backdrop-blur-md text-white shadow-xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Selector */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <UniPartyLogo />
              <span className="text-xl font-bold tracking-wider hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">UniParty</span>
            </Link>

            {/* City Selector with Groups */}
            <div className="relative">
              <button 
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition shadow-sm text-sm font-semibold text-indigo-100"
              >
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{selectedCity}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCityDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCityDropdownOpen(false)}></div>
                  <div className="absolute top-10 left-0 w-64 z-20 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[70vh] overflow-y-auto py-2">
                      <button
                        onClick={() => {
                          setSelectedCity('Tutte');
                          setIsCityDropdownOpen(false);
                          if (location.pathname !== '/') navigate('/');
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-bold border-b border-white/5 transition ${selectedCity === 'Tutte' ? 'bg-indigo-600/20 text-indigo-400' : 'text-indigo-400 hover:bg-white/5'}`}
                      >
                        Tutte le città
                      </button>
                      
                      {Object.entries(UNIVERSITY_LOCATIONS).map(([region, cities]) => (
                        <div key={region} className="mt-2">
                          <div className="px-4 py-1 text-[10px] uppercase font-black text-indigo-500/50 tracking-widest bg-white/5">
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
                              className={`w-full text-left px-5 py-1.5 text-sm transition ${selectedCity === city ? 'bg-indigo-600/30 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
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

          {/* Desktop Right Actions */}
          <div className="flex items-center space-x-4">
              {/* Notification Bell (User Only) */}
              {user && (
                  <Link to="/notifications" className="relative p-2 text-indigo-200 hover:text-white transition">
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-neon-pink ring-2 ring-slate-950 text-[10px] font-bold text-center flex items-center justify-center animate-pulse">
                              {unreadCount}
                          </span>
                      )}
                  </Link>
              )}

              {/* HAMBURGER MENU TOGGLE BUTTON */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
                >
                  <span className="sr-only">Open main menu</span>
                  {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                </button>
              </div>

              {/* Desktop Menu Button */}
              <div className="hidden md:flex">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
                  >
                     <Menu className="h-8 w-8" />
                  </button>
              </div>
          </div>
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-16 right-0 w-full sm:w-80 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-l border-white/10 shadow-2xl animate-in slide-in-from-top-2 duration-200 sm:rounded-bl-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            
            <Link 
                to="/" 
                className="block px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition"
                onClick={() => setIsOpen(false)}
            >
                Events
            </Link>

            {!user && (
              <Link 
                to="/auth" 
                className="block px-3 py-3 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-500 mt-2 text-center shadow-[0_0_20px_rgba(99,102,241,0.4)] transition"
                onClick={() => setIsOpen(false)}
              >
                Login / Register
              </Link>
            )}

            {user && user.role === UserRole.STUDENTE && (
               <>
                 <Link 
                    to="/search" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <Search className="h-5 w-5 mr-3 text-indigo-400" /> Search Associations
                 </Link>
                 <Link 
                    to="/wallet" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <Ticket className="h-5 w-5 mr-3 text-yellow-500" /> My Wallet
                 </Link>
                 <Link 
                    to="/favorites" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <Heart className="h-5 w-5 mr-3 text-neon-pink" /> Favorite Events
                 </Link>
               </>
            )}

            {/* Association Specific Links */}
            {user && user.role === UserRole.ASSOCIAZIONE && (
               <>
                 <Link 
                    to="/dashboard" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <LayoutDashboard className="h-5 w-5 mr-3 text-indigo-400" /> Dashboard
                 </Link>
                 <Link 
                    to="/dashboard?tab=create" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <PlusCircle className="h-5 w-5 mr-3 text-green-500" /> Add Event
                 </Link>
                 <Link 
                    to="/scanner" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-600/20 bg-indigo-600/10 mt-1 transition shadow-inner border border-indigo-500/20"
                    onClick={() => setIsOpen(false)}
                 >
                    <ScanLine className="h-5 w-5 mr-3 text-cyan-400" /> Scan Voucher
                 </Link>
               </>
             )}

             {/* Admin Link */}
             {user && user.role === UserRole.ADMIN && (
                 <Link 
                    to="/admin" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-red-900/20 bg-red-900/10 mt-1 transition shadow-inner border border-red-900/20"
                    onClick={() => setIsOpen(false)}
                 >
                    <Shield className="h-5 w-5 mr-3 text-red-500" /> Admin Dashboard
                 </Link>
             )}

             {/* User Profile Section */}
             {user && (
               <div className="border-t border-white/10 mt-2 pt-2 pb-1">
                 <div className="flex items-center px-3 mb-2 pt-2">
                    <div className="flex-shrink-0">
                       <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-sm overflow-hidden">
                         {user.profileImage ? (
                           <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <UserIcon className="h-6 w-6 text-indigo-400" />
                         )}
                       </div>
                    </div>
                    <div className="ml-3 overflow-hidden">
                      <div className="text-base font-bold leading-none text-white truncate">{user.name}</div>
                      <div className="text-xs font-medium leading-none text-indigo-400/70 mt-1 capitalize">{user.role}</div>
                    </div>
                 </div>
                 
                 <Link 
                    to="/profile" 
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5 transition text-gray-300 hover:text-white"
                    onClick={() => setIsOpen(false)}
                 >
                    My Profile
                 </Link>
                 
                 <Link 
                    to="/notifications" 
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5 transition text-gray-300 hover:text-white flex items-center justify-between"
                    onClick={() => setIsOpen(false)}
                 >
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="bg-neon-pink text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}
                 </Link>
               </div>
             )}

             {/* Help & Legal Section */}
             <div className="border-t border-white/10 mt-2 pt-2">
                <Link 
                    to="/support" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-white/5 transition text-gray-400 hover:text-white"
                    onClick={() => setIsOpen(false)}
                 >
                    <HelpCircle className="h-4 w-4 mr-3" /> Support
                 </Link>
                 <Link 
                    to="/terms" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-white/5 transition text-gray-400 hover:text-white"
                    onClick={() => setIsOpen(false)}
                 >
                    <FileText className="h-4 w-4 mr-3" /> Termini & Condizioni
                 </Link>
                 <Link 
                    to="/privacy" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-white/5 transition text-gray-400 hover:text-white"
                    onClick={() => setIsOpen(false)}
                 >
                    <Shield className="h-4 w-4 mr-3" /> Privacy Policy
                 </Link>
             </div>

             {user && (
                <div className="border-t border-white/10 mt-2 pt-2 pb-2">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition mb-1"
                    >
                        Logout
                    </button>
                    
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-red-400/70 hover:text-red-400 hover:bg-red-900/20 transition"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </button>
                </div>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;