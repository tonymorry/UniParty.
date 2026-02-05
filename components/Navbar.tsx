
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { UserRole, UNIVERSITY_LOCATIONS } from '../types';
import { api } from '../services/api';
import { Ticket, PlusCircle, User as UserIcon, ScanLine, Menu, X, Shield, HelpCircle, Heart, Trash2, FileText, LayoutDashboard, Search, Bell, LogOut, MapPin, ChevronDown, UserCheck } from 'lucide-react';

const UniPartyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
    <defs>
      <linearGradient id="logo_gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <g transform="translate(50, 50) rotate(-15) translate(-50, -50)">
      <path d="M25 20 H75 A10 10 0 0 1 85 30 V42 A8 8 0 0 0 85 58 V70 A10 10 0 0 1 75 80 H25 A10 10 0 0 1 15 70 V58 A8 8 0 0 0 15 42 V30 A10 10 0 0 1 25 20 Z" fill="url(#logo_gradient)" />
      <path d="M50 35 L54 45 H65 L56 52 L60 63 L50 56 L40 63 L44 52 L35 45 H46 L50 35 Z" fill="white" />
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
              setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
          } catch(e) { console.error(e); }
      }
  };

  useEffect(() => { fetchUnreadCount(); }, [user, location]);

  const handleLogout = () => { logout(); setIsOpen(false); navigate('/'); };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md text-white shadow-xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <UniPartyLogo />
              <span className="text-xl font-bold tracking-wider hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">UniParty</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
              {user && (
                  <Link to="/notifications" className="relative p-2 text-indigo-200 hover:text-white transition">
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-neon-pink ring-2 ring-slate-950 text-[10px] font-bold text-center flex items-center justify-center animate-pulse">{unreadCount}</span>}
                  </Link>
              )}
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-indigo-200 hover:text-white hover:bg-white/5 transition-colors">{isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}</button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-16 right-0 w-full sm:w-80 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-l border-white/10 shadow-2xl sm:rounded-bl-2xl overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}>Events</Link>
            {!user && <Link to="/auth" className="block px-3 py-3 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-500 mt-2 text-center shadow-lg transition" onClick={() => setIsOpen(false)}>Login / Register</Link>}
            
            {user?.role === UserRole.STUDENTE && (
               <><Link to="/search" className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}><Search className="h-5 w-5 mr-3 text-indigo-400" /> Search Associations</Link>
               <Link to="/wallet" className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}><Ticket className="h-5 w-5 mr-3 text-yellow-500" /> My Wallet</Link></>
            )}

            {user?.role === UserRole.PR && (
                <Link to="/pr-dashboard" className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-600/20 bg-indigo-600/10 mt-1 transition border border-indigo-500/20" onClick={() => setIsOpen(false)}>
                    <UserCheck className="h-5 w-5 mr-3 text-indigo-400" /> Dashboard PR
                </Link>
            )}

            {user?.role === UserRole.ASSOCIAZIONE && (
               <><Link to="/dashboard" className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/5 transition" onClick={() => setIsOpen(false)}><LayoutDashboard className="h-5 w-5 mr-3 text-indigo-400" /> Dashboard</Link>
               <Link to="/scanner" className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-600/20 mt-1 transition border border-indigo-500/20" onClick={() => setIsOpen(false)}><ScanLine className="h-5 w-5 mr-3 text-cyan-400" /> Scan Voucher</Link></>
            )}

            {user && (
               <div className="border-t border-white/10 mt-2 pt-2">
                 <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5 transition text-gray-300" onClick={() => setIsOpen(false)}>My Profile</Link>
                 <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-900/20 transition">Logout</button>
               </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
