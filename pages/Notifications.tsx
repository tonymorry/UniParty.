import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, ArrowRight, Settings, MapPin, ChevronDown } from 'lucide-react';
import { getToken, onMessage } from 'firebase/messaging';
import { UNIVERSITY_LOCATIONS } from '../types';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { messaging, firebaseConfig } from '../services/firebase';

interface Notification {
  _id: string;
  title: string;
  message: string;
  url: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchNotifications();
    
    // Initialize state from user data updated via Context
    if ((user as any).fcmToken) {
        setPushEnabled(true);
        setSelectedCity((user as any).notificationCity || '');
    } else {
        setPushEnabled(false);
        setSelectedCity('');
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePushToggle = async () => {
      const newStatus = !pushEnabled;
      setPushEnabled(newStatus);
      
      if (newStatus) {
          if (!selectedCity) {
              alert("Per favore seleziona una città per attivare le notifiche.");
              setPushEnabled(false);
              return;
          }
          setupFCM(selectedCity);
      } else {
          // Disable notifications
          try {
              await api.notifications.saveFcmToken({
                  fcmToken: null,
                  notificationCity: null,
                  enabled: false
              });
              await refreshUser();
          } catch (error) {
              console.error("Error disabling FCM:", error);
          }
      }
  };

  const setupFCM = async (city: string) => {
      setIsSettingUp(true);
      try {
          if (Capacitor.isNativePlatform()) {
              // --- NATIVE ENGINE (Capacitor) ---
              const permission = await PushNotifications.requestPermissions();
              if (permission.receive !== 'granted') {
                  alert("Permesso notifiche negato.");
                  setPushEnabled(false);
                  return;
              }

              await PushNotifications.register();

              // Remove previous listeners to avoid duplicates
              await PushNotifications.removeAllListeners();

              await PushNotifications.addListener('registration', async (token) => {
                  try {
                      await api.notifications.saveFcmToken({
                          fcmToken: token.value,
                          notificationCity: city,
                          enabled: true
                      });
                      await refreshUser();
                      console.log("Native FCM Token saved:", token.value);
                  } catch (error) {
                      console.error("Error saving native FCM token:", error);
                  }
              });

              await PushNotifications.addListener('registrationError', (err) => {
                  console.error('Registration error: ', err.error);
                  setPushEnabled(false);
              });

          } else {
              // --- WEB ENGINE (Firebase JS SDK) ---
              const permission = await Notification.requestPermission();
              if (permission !== 'granted') {
                  alert("Permesso notifiche negato.");
                  setPushEnabled(false);
                  return;
              }

              const token = await getToken(messaging, {
                  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
              });

              if (token) {
                  await api.notifications.saveFcmToken({
                      fcmToken: token,
                      notificationCity: city,
                      enabled: true
                  });
                  await refreshUser();
                  console.log("FCM Token saved:", token);
              } else {
                  console.warn("No FCM token received");
                  setPushEnabled(false);
              }
          }
      } catch (error) {
          console.error("FCM Setup Error:", error);
          setPushEnabled(false);
      } finally {
          setIsSettingUp(false);
      }
  };

  const handleCitySelect = (city: string) => {
      setSelectedCity(city);
      setIsCityDropdownOpen(false);
      if (pushEnabled) {
          setupFCM(city);
      }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await api.notifications.markAsRead(notification._id);
    }
    navigate(notification.url);
  };

  const markAllAsRead = async () => {
      // Optimistic update
      const updated = notifications.map(n => ({...n, isRead: true}));
      setNotifications(updated);
      
      // Async requests
      for(const n of notifications) {
          if(!n.isRead) api.notifications.markAsRead(n._id);
      }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto">
        {/* FCM Settings Section */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 shadow-xl">
            <div className="flex items-center mb-4">
                <Settings className="w-5 h-5 text-indigo-400 mr-2" />
                <h2 className="text-lg font-bold">Impostazioni Notifiche Push</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={pushEnabled}
                            onChange={handlePushToggle}
                            disabled={isSettingUp}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-300">
                            {pushEnabled ? 'Attive' : 'Disattivate'}
                        </span>
                    </label>
                </div>

                {/* Custom City Selector Dropdown */}
                <div className="relative w-full sm:w-auto">
                    <button 
                        onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                        className="flex items-center justify-between space-x-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 hover:border-indigo-500/50 transition shadow-sm text-sm font-semibold text-indigo-100 w-full sm:w-64"
                    >
                        <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-indigo-400 mr-2" />
                            <span className="truncate">{selectedCity || 'Seleziona città...'}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCityDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCityDropdownOpen(false)}></div>
                            <div className="absolute top-12 left-0 w-full sm:w-64 z-20 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="max-h-[60vh] overflow-y-auto py-2">
                                    {Object.entries(UNIVERSITY_LOCATIONS).map(([region, cities]) => (
                                        <div key={region} className="mt-2 first:mt-0">
                                            <div className="px-4 py-1 text-[10px] uppercase font-black text-indigo-500/50 tracking-widest bg-white/5">
                                                {region}
                                            </div>
                                            {cities.map(city => (
                                                <button
                                                    key={city}
                                                    onClick={() => handleCitySelect(city)}
                                                    className={`w-full text-left px-5 py-2 text-sm transition ${selectedCity === city ? 'bg-indigo-600/30 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
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
            <p className="text-xs text-gray-500 mt-4">
                Ricevi notifiche push istantanee per i nuovi eventi pubblicati nella tua città preferita.
            </p>
        </div>

        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <Bell className="w-8 h-8 text-indigo-400 mr-3" />
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
            </div>
            {notifications.some(n => !n.isRead) && (
                <button 
                    onClick={markAllAsRead}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
                >
                    Mark all as read
                </button>
            )}
        </div>

        {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-800 rounded-xl h-24 shadow-sm animate-pulse border border-gray-700"></div>
                ))}
             </div>
        ) : notifications.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 rounded-2xl shadow-sm border border-gray-700">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600">
                    <Bell className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
            </div>
        ) : (
            <div className="space-y-4">
                {notifications.map(notif => (
                    <div 
                        key={notif._id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 rounded-xl shadow-sm border cursor-pointer transition flex items-start gap-4 ${
                            notif.isRead ? 'bg-gray-800 border-gray-700 opacity-60' : 'bg-indigo-900/20 border-indigo-900/50 border-l-4 border-l-indigo-500'
                        }`}
                    >
                        <div className={`mt-1 p-2 rounded-full ${notif.isRead ? 'bg-gray-700 text-gray-500' : 'bg-indigo-950 text-indigo-400 shadow-inner'}`}>
                            {notif.isRead ? <CheckCircle className="w-5 h-5"/> : <Bell className="w-5 h-5"/>}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h4>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-gray-600 mt-2 font-medium uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 self-center" />
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;