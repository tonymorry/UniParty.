

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { api } from '../services/api';
import { Ticket, PlusCircle, User as UserIcon, ScanLine, Menu, X, Shield, HelpCircle, Heart, Trash2, FileText, LayoutDashboard, Search, Bell } from 'lucide-react';

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const UniPartyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
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
      <circle cx="65" cy="35" r="2" fill="white" fillOpacity="0.8" />
      <circle cx="35" cy="65" r="2" fill="white" fillOpacity="0.8" />
      <path d="M50 25 V28" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 72 V75" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 50 H28" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 50 H75" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

const Navbar: React.FC = () => {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleEnableNotifications = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          alert("Push notifications not supported");
          return;
      }

      try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
              alert("Permission denied");
              return;
          }

          const { key } = await api.notifications.getVapidKey();
          const registration = await navigator.serviceWorker.ready;
          
          const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(key)
          });

          await api.notifications.subscribe(subscription);
          alert("Notifications enabled!");
          setIsOpen(false);
      } catch (e) {
          console.error("Setup error", e);
          alert("Failed to setup notifications");
      }
  };

  return (
    <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
            <UniPartyLogo />
            <span className="text-xl font-bold tracking-wider">UniParty</span>
          </Link>

          {/* Desktop Right Actions */}
          <div className="flex items-center space-x-4">
              {/* Notification Bell (User Only) */}
              {user && (
                  <Link to="/notifications" className="relative p-2 text-indigo-200 hover:text-white transition">
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-indigo-900 text-[10px] font-bold text-center flex items-center justify-center">
                              {unreadCount}
                          </span>
                      )}
                  </Link>
              )}

              {/* HAMBURGER MENU TOGGLE BUTTON */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none transition-colors"
                >
                  <span className="sr-only">Open main menu</span>
                  {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                </button>
              </div>

              {/* Desktop Menu Button (Reuse hamburger logic for now on desktop to keep consistent with existing) */}
              <div className="hidden md:flex">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none transition-colors"
                  >
                     <Menu className="h-8 w-8" />
                  </button>
              </div>
          </div>
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-16 right-0 w-full sm:w-80 z-50 bg-indigo-800 border-b-2 border-l-2 border-indigo-700 shadow-2xl animate-in slide-in-from-top-2 duration-200 sm:rounded-bl-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            
            <Link 
                to="/" 
                className="block px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-700 transition"
                onClick={() => setIsOpen(false)}
            >
                Events
            </Link>

            {!user && (
              <Link 
                to="/auth" 
                className="block px-3 py-3 rounded-md text-base font-medium bg-indigo-600 hover:bg-indigo-500 mt-2 text-center shadow-md transition"
                onClick={() => setIsOpen(false)}
              >
                Login / Register
              </Link>
            )}

            {user && user.role === UserRole.STUDENTE && (
               <>
                 <Link 
                    to="/search" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-700 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <Search className="h-5 w-5 mr-3 text-indigo-300" /> Search Associations
                 </Link>
                 <Link 
                    to="/wallet" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-700 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <Ticket className="h-5 w-5 mr-3 text-yellow-400" /> My Wallet
                 </Link>
                 <Link 
                    to="/favorites" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-700 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <Heart className="h-5 w-5 mr-3 text-red-400" /> Favorite Events
                 </Link>
               </>
            )}

            {/* Association Specific Links */}
            {user && user.role === UserRole.ASSOCIAZIONE && (
               <>
                 <Link 
                    to="/dashboard" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-700 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <LayoutDashboard className="h-5 w-5 mr-3 text-indigo-300" /> Dashboard
                 </Link>
                 <Link 
                    to="/dashboard?tab=create" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-700 transition"
                    onClick={() => setIsOpen(false)}
                 >
                    <PlusCircle className="h-5 w-5 mr-3 text-green-400" /> Add Event
                 </Link>
                 <Link 
                    to="/scanner" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-600 bg-indigo-700 mt-1 transition shadow-inner"
                    onClick={() => setIsOpen(false)}
                 >
                    <ScanLine className="h-5 w-5 mr-3 text-cyan-300" /> Scan Voucher
                 </Link>
               </>
             )}

             {/* Admin Link */}
             {user && user.role === UserRole.ADMIN && (
                 <Link 
                    to="/admin" 
                    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-600 bg-indigo-950 mt-1 transition shadow-inner border border-indigo-500"
                    onClick={() => setIsOpen(false)}
                 >
                    <Shield className="h-5 w-5 mr-3 text-red-400" /> Admin Dashboard
                 </Link>
             )}

             {/* User Profile Section */}
             {user && (
               <div className="border-t border-indigo-600 mt-2 pt-2 pb-1">
                 <div className="flex items-center px-3 mb-2 pt-2">
                    <div className="flex-shrink-0">
                       <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-400 shadow-sm">
                         <UserIcon className="h-6 w-6 text-indigo-100" />
                       </div>
                    </div>
                    <div className="ml-3 overflow-hidden">
                      <div className="text-base font-bold leading-none text-white truncate">{user.name}</div>
                      <div className="text-xs font-medium leading-none text-indigo-300 mt-1 capitalize">{user.role}</div>
                    </div>
                 </div>
                 
                 <Link 
                    to="/profile" 
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition text-indigo-100 hover:text-white"
                    onClick={() => setIsOpen(false)}
                 >
                    My Profile
                 </Link>
                 
                 <Link 
                    to="/notifications" 
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition text-indigo-100 hover:text-white flex items-center justify-between"
                    onClick={() => setIsOpen(false)}
                 >
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                 </Link>

                 <button
                    onClick={handleEnableNotifications}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:text-white hover:bg-indigo-700 transition"
                 >
                     Enable Push Notifications
                 </button>
               </div>
             )}

             {/* Help & Legal Section */}
             <div className="border-t border-indigo-600 mt-2 pt-2">
                <Link 
                    to="/support" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition text-indigo-100 hover:text-white"
                    onClick={() => setIsOpen(false)}
                 >
                    <HelpCircle className="h-4 w-4 mr-3" /> Support
                 </Link>
                 <Link 
                    to="/terms" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition text-indigo-100 hover:text-white"
                    onClick={() => setIsOpen(false)}
                 >
                    <FileText className="h-4 w-4 mr-3" /> Termini & Condizioni
                 </Link>
                 <Link 
                    to="/privacy" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition text-indigo-100 hover:text-white"
                    onClick={() => setIsOpen(false)}
                 >
                    <Shield className="h-4 w-4 mr-3" /> Privacy Policy
                 </Link>
             </div>

             {user && (
                <div className="border-t border-indigo-600 mt-2 pt-2 pb-2">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700 transition mb-1"
                    >
                        Logout
                    </button>
                    
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-red-100 hover:bg-red-900/30 transition"
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
