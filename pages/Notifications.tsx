import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, ArrowRight, BellRing, Info } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';

interface Notification {
  _id: string;
  title: string;
  message: string;
  url: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchNotifications();

    if (Capacitor.isNativePlatform()) {
        OneSignal.getDeviceState((state) => {
            setHasPermission(state?.hasNotificationPermission || false);
        });
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

  const handleActivateAppNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return;

    setIsActivating(true);
    try {
      // Prompt nativo OneSignal
      OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
        if (accepted) {
          setHasPermission(true);
          // Ottieni ID e salva nel backend
          OneSignal.getDeviceState((state) => {
            if (state && state.userId) {
              api.notifications.registerDevice(state.userId).catch(console.error);
            }
          });
        }
        setIsActivating(false);
      });
    } catch (e) {
      console.error("Errore attivazione OneSignal:", e);
      setIsActivating(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await api.notifications.markAsRead(notification._id);
    }
    navigate(notification.url);
  };

  const markAllAsRead = async () => {
      const updated = notifications.map(n => ({...n, isRead: true}));
      setNotifications(updated);
      for(const n of notifications) {
          if(!n.isRead) api.notifications.markAsRead(n._id);
      }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto">
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

        {/* BOX ATTIVAZIONE: SOLO SE SU APP E SENZA PERMESSI */}
        {Capacitor.isNativePlatform() && !hasPermission && (
            <div className="mb-8 p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="p-4 bg-indigo-600/20 rounded-full border border-indigo-500/20">
                        <BellRing className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-1">Resta sempre aggiornato!</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Attiva le notifiche push per sapere subito quando le tue associazioni preferite pubblicano nuovi eventi.
                        </p>
                    </div>
                    <button 
                        onClick={handleActivateAppNotifications}
                        disabled={isActivating}
                        className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 whitespace-nowrap"
                    >
                        {isActivating ? "Attivazione..." : "Attiva Notifiche"}
                    </button>
                </div>
            </div>
        )}

        {/* BOX INFO WEB: SOLO SE SU WEB */}
        {!Capacitor.isNativePlatform() && (
            <div className="mb-8 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-indigo-400" />
                    <p className="text-xs text-gray-400">
                        Scarica l'App di <strong>UniParty</strong> per ricevere notifiche push in tempo reale sul tuo smartphone.
                    </p>
                </div>
            </div>
        )}

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