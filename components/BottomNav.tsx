
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Home, Ticket, Heart, User, HelpCircle, Plus, ScanLine, LayoutDashboard, Users, Shield, LogIn, Search, LogOut, Bell, UserCheck
} from 'lucide-react';

const BottomNav: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || (path.includes('?') && location.search.includes(path.split('?')[1]));

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 h-16 z-50 md:hidden flex justify-around items-center px-2 shadow-2xl">
      
      {/* PR ROLE */}
      {user?.role === UserRole.PR && (
        <>
          <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}><Home className="w-5 h-5" /><span className="text-[9px] mt-1">Home</span></Link>
          <Link to="/pr-dashboard" className="relative -top-5"><div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[#020617] bg-indigo-600 ${isActive('/pr-dashboard') ? 'bg-indigo-700' : ''}`}><UserCheck className="w-7 h-7 text-white" /></div></Link>
          <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile') ? 'text-indigo-400' : 'text-gray-500'}`}><User className="w-5 h-5" /><span className="text-[9px] mt-1">Profile</span></Link>
        </>
      )}

      {/* STUDENT ROLE */}
      {user?.role === UserRole.STUDENTE && (
        <>
          <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}><Home className="w-5 h-5" /><span className="text-[9px] mt-1">Home</span></Link>
          <Link to="/search" className={`flex flex-col items-center ${isActive('/search') ? 'text-indigo-400' : 'text-gray-500'}`}><Search className="w-5 h-5" /><span className="text-[9px] mt-1">Search</span></Link>
          <Link to="/wallet" className="relative -top-5"><div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-600 border-4 border-[#020617]"><Ticket className="w-7 h-7 text-white" /></div></Link>
          <Link to="/favorites" className={`flex flex-col items-center ${isActive('/favorites') ? 'text-indigo-400' : 'text-gray-500'}`}><Heart className="w-5 h-5" /><span className="text-[9px] mt-1">Favs</span></Link>
          <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile') ? 'text-indigo-400' : 'text-gray-500'}`}><User className="w-5 h-5" /><span className="text-[9px] mt-1">Profile</span></Link>
        </>
      )}

      {/* ASSOCIATION ROLE */}
      {user?.role === UserRole.ASSOCIAZIONE && (
        <>
          <Link to="/dashboard" className={`flex flex-col items-center ${isActive('/dashboard') ? 'text-indigo-400' : 'text-gray-500'}`}><LayoutDashboard className="w-5 h-5" /><span className="text-[9px] mt-1">Dash</span></Link>
          <Link to="/scanner" className={`flex flex-col items-center ${isActive('/scanner') ? 'text-indigo-400' : 'text-gray-500'}`}><ScanLine className="w-5 h-5" /><span className="text-[9px] mt-1">Scan</span></Link>
          <Link to="/dashboard?tab=create" className="relative -top-5"><div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-600 border-4 border-[#020617]"><Plus className="w-7 h-7 text-white" /></div></Link>
          <Link to="/notifications" className={`flex flex-col items-center ${isActive('/notifications') ? 'text-indigo-400' : 'text-gray-500'}`}><Bell className="w-5 h-5" /><span className="text-[9px] mt-1">Notifs</span></Link>
          <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile') ? 'text-indigo-400' : 'text-gray-500'}`}><User className="w-5 h-5" /><span className="text-[9px] mt-1">Profile</span></Link>
        </>
      )}

      {/* STAFF ROLE */}
      {user?.role === UserRole.STAFF && (
        <>
          <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}><Home className="w-5 h-5" /><span className="text-[9px] mt-1">Home</span></Link>
          <Link to="/scanner" className="relative -top-5"><div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-600 border-4 border-[#020617]"><ScanLine className="w-7 h-7 text-white" /></div></Link>
          <button onClick={() => logout()} className="flex flex-col items-center text-gray-500"><LogOut className="w-5 h-5" /><span className="text-[9px] mt-1">Logout</span></button>
        </>
      )}

      {!user && (
        <>
          <Link to="/" className={`flex flex-col items-center text-indigo-400`}><Home className="w-5 h-5" /><span className="text-[9px] mt-1">Home</span></Link>
          <Link to="/auth" className="relative -top-5"><div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-600 border-4 border-[#020617]"><LogIn className="w-7 h-7 text-white" /></div></Link>
          <Link to="/support" className="flex flex-col items-center text-gray-500"><HelpCircle className="w-5 h-5" /><span className="text-[9px] mt-1">Help</span></Link>
        </>
      )}
    </div>
  );
};

export default BottomNav;
