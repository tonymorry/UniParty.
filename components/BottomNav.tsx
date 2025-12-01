import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Home, Heart, Ticket, User, Plus, ScanLine, BarChart2, HelpCircle, LogIn } from 'lucide-react';

const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Stili comuni
  const navItemClass = "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group transition-colors w-full h-full";
  const iconClass = (path: string) => `w-6 h-6 mb-1 ${isActive(path) ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'}`;
  const textClass = (path: string) => `text-xs ${isActive(path) ? 'text-indigo-600 font-bold' : 'text-gray-500 group-hover:text-indigo-600'}`;

  // Pulsante Centrale in evidenza (FAB)
  const FabButton = ({ to, icon: Icon, label }: { to: string, icon: any, label?: string }) => (
    <div className="relative flex items-center justify-center w-full h-full">
        <Link 
            to={to} 
            className="absolute -top-8 flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-full shadow-lg border-4 border-gray-50 transition-transform active:scale-95"
        >
            <Icon className="w-7 h-7 text-white" />
        </Link>
        {label && <span className="text-xs text-indigo-600 font-bold mt-8">{label}</span>}
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        
        {/* --- SCENARIO 1: OSPITE (Non loggato) --- */}
        {!user && (
            <>
                <Link to="/" className={navItemClass}>
                    <Home className={iconClass('/')} />
                    <span className={textClass('/')}>Home</span>
                </Link>
                
                {/* Spacer */}
                <div className={navItemClass}></div>

                <FabButton to="/auth" icon={LogIn} />

                {/* Spacer */}
                <div className={navItemClass}></div>

                <Link to="/support" className={navItemClass}>
                    <HelpCircle className={iconClass('/support')} />
                    <span className={textClass('/support')}>Support</span>
                </Link>
            </>
        )}

        {/* --- SCENARIO 2: STUDENTE --- */}
        {user?.role === UserRole.STUDENTE && (
            <>
                <Link to="/wallet" className={navItemClass}>
                    <Ticket className={iconClass('/wallet')} />
                    <span className={textClass('/wallet')}>Wallet</span>
                </Link>
                
                <Link to="/favorites" className={navItemClass}>
                    <Heart className={iconClass('/favorites')} />
                    <span className={textClass('/favorites')}>Preferiti</span>
                </Link>

                <FabButton to="/" icon={Home} />

                <Link to="/support" className={navItemClass}>
                    <HelpCircle className={iconClass('/support')} />
                    <span className={textClass('/support')}>Support</span>
                </Link>

                <Link to="/profile" className={navItemClass}>
                    <User className={iconClass('/profile')} />
                    <span className={textClass('/profile')}>Profilo</span>
                </Link>
            </>
        )}

        {/* --- SCENARIO 3: ASSOCIAZIONE --- */}
        {user?.role === UserRole.ASSOCIAZIONE && (
            <>
                <Link to="/" className={navItemClass}>
                    <Home className={iconClass('/')} />
                    <span className={textClass('/')}>Home</span>
                </Link>
                
                <Link to="/scanner" className={navItemClass}>
                    <ScanLine className={iconClass('/scanner')} />
                    <span className={textClass('/scanner')}>Scanner</span>
                </Link>

                <FabButton to="/dashboard" icon={Plus} />

                <Link to="/dashboard" className={navItemClass}>
                    <BarChart2 className={iconClass('/dashboard')} />
                    <span className={textClass('/dashboard')}>Dash</span>
                </Link>

                <Link to="/profile" className={navItemClass}>
                    <User className={iconClass('/profile')} />
                    <span className={textClass('/profile')}>Profilo</span>
                </Link>
            </>
        )}
      </div>
    </div>
  );
};

export default BottomNav;