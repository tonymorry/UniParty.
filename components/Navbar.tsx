
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

  useEffect(() => {
    if (user) {
      api.notifications.getAll().then(n => setUnreadCount(n.filter((x: any) => !x.isRead).length));
    }
  }, [user, location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md text-white shadow-xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <UniPartyLogo />
              <span className="text-xl font-bold tracking-wider hidden sm:inline">UniParty</span>
            </Link>
            <div className="relative">
              <button onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)} className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span className="max-w-[80px] truncate">{selectedCity}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
              {user && <Link to="/notifications" className="relative p-2"><Bell /><span className="absolute top-1 right-1 h-4 w-4 bg-pink-500 rounded-full text-[10px] flex items-center justify-center">{unreadCount}</span></Link>}
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-indigo-200"><Menu className="h-8 w-8" /></button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute top-16 right-0 w-80 bg-slate-900 border-b border-l border-white/10 shadow-2xl rounded-bl-2xl">
          <div className="p-4 space-y-1">
            <Link to="/" className="block p-3 hover:bg-white/5 rounded-md" onClick={() => setIsOpen(false)}>Events</Link>
            {user?.role === UserRole.STUDENTE && (
               <>
                 <Link to="/wallet" className="flex items-center p-3 hover:bg-white/5 rounded-md" onClick={() => setIsOpen(false)}><Ticket className="mr-3 text-yellow-500" /> My Wallet</Link>
                 <Link to="/favorites" className="flex items-center p-3 hover:bg-white/5 rounded-md" onClick={() => setIsOpen(false)}><Heart className="mr-3 text-pink-500" /> Favorites</Link>
               </>
            )}
            {user?.role === UserRole.PR && (
               <Link to="/pr-dashboard" className="flex items-center p-3 hover:bg-indigo-600/20 bg-indigo-600/10 rounded-md" onClick={() => setIsOpen(false)}><UserCheck className="mr-3 text-indigo-400" /> PR Dashboard</Link>
            )}
            {user?.role === UserRole.ASSOCIAZIONE && (
               <>
                 <Link to="/dashboard" className="flex items-center p-3 hover:bg-white/5 rounded-md" onClick={() => setIsOpen(false)}><LayoutDashboard className="mr-3 text-indigo-400" /> Dashboard</Link>
                 <Link to="/scanner" className="flex items-center p-3 hover:bg-white/5 rounded-md" onClick={() => setIsOpen(false)}><ScanLine className="mr-3 text-cyan-400" /> Scan Voucher</Link>
               </>
            )}
            {user && (
               <div className="border-t border-white/10 pt-2">
                 <Link to="/profile" className="block p-3 hover:bg-white/5 rounded-md" onClick={() => setIsOpen(false)}>My Profile</Link>
                 <button onClick={handleLogout} className="w-full text-left p-3 hover:bg-white/5 rounded-md text-red-400">Logout</button>
               </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
