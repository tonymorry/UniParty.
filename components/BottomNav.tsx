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
  LogOut
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
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 h-16 z-50 md:hidden flex justify-around items-center px-2 pb-safe shadow-2xl">
      
      {/* STAFF */}
      {user && user.role === UserRole.STAFF && (
        <>
          <Link to="/" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Home</span>
          </Link>
          <Link to="/scanner" className="relative -top-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-900 transition-transform active:scale-95 ${isActive('/scanner') ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
              <ScanLine className="w-7 h-7 text-white" />
            </div>
          </Link>
          <button onClick={() => logout()} className="flex flex-col items-center justify-center w-12 h-full text-gray-500">
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Esci</span>
          </button>
        </>
      )}

      {/* GUEST */}
      {!user && (
        <>
          <Link to="/" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Home</span>
          </Link>
          <Link to="/auth" className="relative -top-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-900 transition-transform active:scale-95 ${isActive('/auth') ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
              <LogIn className="w-7 h-7 text-white" />
            </div>
          </Link>
          <Link to="/support" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/support') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <HelpCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Supporto</span>
          </Link>
        </>
      )}

      {/* STUDENT */}
      {user && user.role === UserRole.STUDENTE && (
        <>
          <Link to="/wallet" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/wallet') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Ticket className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Wallet</span>
          </Link>
          <Link to="/favorites" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/favorites') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Heart className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Preferiti</span>
          </Link>
          <Link to="/" className="relative -top-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-900 transition-transform active:scale-95 ${isActive('/') ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
              <Home className="w-7 h-7 text-white" />
            </div>
          </Link>
          <Link to="/search" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/search') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Cerca</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/profile') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Profilo</span>
          </Link>
        </>
      )}

      {/* ASSOCIATION */}
      {user && user.role === UserRole.ASSOCIAZIONE && (
        <>
          <Link to="/" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Home</span>
          </Link>
          <Link to="/scanner" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/scanner') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <ScanLine className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Scan</span>
          </Link>
          <Link to="/dashboard?tab=create" className="relative -top-5">
            <div className="w-14 h-14 rounded-full bg-indigo-900 flex items-center justify-center shadow-lg border-4 border-gray-900 transition-transform active:scale-95">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </Link>
          <Link to="/dashboard" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/dashboard') && !location.search.includes('tab=create') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Dash</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center justify-center w-12 h-full ${isActive('/profile') ? 'text-indigo-400' : 'text-gray-500'}`}>
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Profilo</span>
          </Link>
        </>
      )}
    </div>
  );
};

export default BottomNav;