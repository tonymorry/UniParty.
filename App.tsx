import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Auth from './pages/Auth';
import EventDetails from './pages/EventDetails';
import Wallet from './pages/Wallet';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import Profile from './pages/Profile';
import Scanner from './pages/Scanner';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Favorites from './pages/Favorites';
import EventAttendees from './pages/EventAttendees'; 
import SearchAssociations from './pages/SearchAssociations'; 
import AssociationProfile from './pages/AssociationProfile'; 
import Notifications from './pages/Notifications';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import { BellRing, X } from 'lucide-react';

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

// Custom Modal for Notification Permissions (Soft Prompt)
const NotificationPrompt: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Mostra il prompt solo se le notifiche sono in stato 'default' (mai chiesto)
        // e se il browser supporta le notifiche
        if ('Notification' in window && Notification.permission === 'default') {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000); // Appare dopo 3 secondi dall'avvio
            return () => clearTimeout(timer);
        }
    }, []);

    const handleActivate = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted' && 'serviceWorker' in navigator && 'PushManager' in window) {
                const { key } = await api.notifications.getVapidKey();
                const registration = await navigator.serviceWorker.ready;
                
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(key)
                });

                await api.notifications.subscribe(subscription);
            }
        } catch (e) {
            console.error("Errore durante l'attivazione notifiche:", e);
        } finally {
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                        <BellRing className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 font-sans">Non perderti le serate!</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Attiva le notifiche per sapere subito quando escono nuovi eventi e non perdere mai i biglietti early-bird.
                    </p>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={handleActivate}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
                        >
                            Attiva Notifiche
                        </button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="w-full bg-transparent text-gray-500 hover:text-gray-300 text-sm font-medium py-2 transition"
                        >
                            Più tardi
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// Internal component to handle automatic notification subscription
const NotificationManager: React.FC = () => {
    const { user } = useAuth();
    
    useEffect(() => {
        const initNotifications = async () => {
            if (user && 'serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    // Se il permesso è già garantito, sottoscrivi silenziosamente al login
                    if (Notification.permission === 'granted') {
                        const { key } = await api.notifications.getVapidKey();
                        const registration = await navigator.serviceWorker.ready;
                        
                        const subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(key)
                        });

                        await api.notifications.subscribe(subscription);
                    }
                } catch (e) {
                    console.error("Auto-notification setup failed", e);
                }
            }
        };

        initNotifications();
    }, [user]);

    return null;
};

function App() {

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return (
    <AuthProvider>
      <LocationProvider>
        <NotificationManager />
        <Router>
          <div className="min-h-screen bg-gray-900 font-sans text-white flex flex-col">
            <NotificationPrompt />
            <Navbar />
            <main className="flex-grow pb-20 md:pb-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/events/:id/attendees" element={<EventAttendees />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/search" element={<SearchAssociations />} />
                <Route path="/association/:id" element={<AssociationProfile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/support" element={<Support />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
              </Routes>
            </main>
            <Footer />
            <BottomNav />
            <CookieBanner />
          </div>
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;