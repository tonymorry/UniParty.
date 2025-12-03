import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchNotifications();
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <Bell className="w-8 h-8 text-indigo-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            </div>
            {notifications.some(n => !n.isRead) && (
                <button 
                    onClick={markAllAsRead}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    Mark all as read
                </button>
            )}
        </div>

        {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl h-24 shadow-sm animate-pulse"></div>
                ))}
             </div>
        ) : notifications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
            </div>
        ) : (
            <div className="space-y-4">
                {notifications.map(notif => (
                    <div 
                        key={notif._id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 rounded-xl shadow-sm border cursor-pointer transition flex items-start gap-4 ${
                            notif.isRead ? 'bg-white border-gray-100 opacity-75' : 'bg-indigo-50 border-indigo-100 border-l-4 border-l-indigo-500'
                        }`}
                    >
                        <div className={`mt-1 p-2 rounded-full ${notif.isRead ? 'bg-gray-100 text-gray-400' : 'bg-white text-indigo-600'}`}>
                            {notif.isRead ? <CheckCircle className="w-5 h-5"/> : <Bell className="w-5 h-5"/>}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 self-center" />
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;