
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Home, 
  Ticket, 
  Heart, 
  User, 
  HelpCircle, 
  Plus, 
  ScanLine, 
  LayoutDashboard, 
  Users, 
  Shield, 
  Calendar,
  LogIn,
  Search,
  LogOut,
  Bell
} from 'lucide-react';

const BottomNav: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
      const [pathPart, queryPart] = path.split('?');
      const matchesPath = location.pathname === pathPart;
      if (!queryPart) return matchesPath;
      return matchesPath && location.search.includes(queryPart);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 h-16 z-50 md:hidden flex justify-around items-center px-2 pb-safe shadow-2xl">
      
      {/* ==========================================
          RUOLO: STAFF
         ========================================== */}
      {user && user.role === UserRole.STAFF && (
        <>
          <Link to="/" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Home</span>
          </Link>

          {/* CENTRALE - SCANNER */}
          <Link to="/scanner" className="relative -top-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[#020617] transition-transform active:scale-95 ${isActive('/scanner') ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
              <ScanLine className="w-7 h-7 text-white" />
            </div>
          </Link>

          <button 
            onClick={() => logout()}
            className="flex flex-col items-center justify-center w-12 h-full text-gray-500 hover:text-red-400 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Esci</span>
          </button>
        </>
      )}

      {/* ==========================================
          GUEST
         ========================================== */}
      {!user && (
        <>
          <Link to="/" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Home</span>
          </Link>

          <Link to="/auth" className="relative -top-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[#020617] transition-transform active:scale-95 ${isActive('/auth') ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
              <LogIn className="w-7 h-7 text-white" />
            </div>
          </Link>

          <Link to="/support" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/support') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <HelpCircle className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Support</span>
          </Link>
        </>
      )}

      {/* ==========================================
          STUDENTE
         ========================================== */}
      {user && user.role === UserRole.STUDENTE && (
        <>
          <Link to="/" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Home</span>
          </Link>

          <Link to="/search" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/search') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Search className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Search</span>
          </Link>

          <Link to="/wallet" className="relative -top-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[#020617] transition-transform active:scale-95 ${isActive('/wallet') ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
              <Ticket className="w-7 h-7 text-white" />
            </div>
          </Link>

          <Link to="/favorites" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/favorites') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Heart className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Favorites</span>
          </Link>

          <Link to="/profile" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/profile') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Profile</span>
          </Link>
        </>
      )}

      {/* ==========================================
          ASSOCIAZIONE
         ========================================== */}
      {user && user.role === UserRole.ASSOCIAZIONE && (
        <>
          <Link to="/dashboard" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/dashboard') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Dash</span>
          </Link>

          <Link to="/scanner" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/scanner') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <ScanLine className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Scan</span>
          </Link>

          <Link to="/dashboard?tab=create" className="relative -top-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[#020617] transition-transform active:scale-95 ${isActive('/dashboard?tab=create') ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
              <Plus className="w-7 h-7 text-white" />
            </div>
          </Link>

          <Link to="/notifications" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/notifications') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Bell className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Notifs</span>
          </Link>

          <Link to="/profile" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/profile') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Profile</span>
          </Link>
        </>
      )}

      {/* ==========================================
          ADMIN
         ========================================== */}
      {user && user.role === UserRole.ADMIN && (
        <>
          <Link to="/" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Home</span>
          </Link>

          <Link to="/admin" className="relative -top-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[#020617] transition-transform active:scale-95 ${isActive('/admin') ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
              <Shield className="w-7 h-7 text-white" />
            </div>
          </Link>

          <Link to="/profile" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/profile') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">Profile</span>
          </Link>
        </>
      )}

    </div>
  );
};

export default BottomNav;
