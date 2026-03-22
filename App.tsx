
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import { XCircle, ShieldCheck } from 'lucide-react';
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

// Internal component to handle automatic notification subscription
const NotificationManager: React.FC = () => {
    const { user } = useAuth();
    
    useEffect(() => {
        const initNotifications = async () => {
            if (user && 'serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    // Check if permission is already granted or ask for it
                    if (Notification.permission !== 'granted') {
                         const permission = await Notification.requestPermission();
                         if (permission !== 'granted') return;
                    }
                    
                    const { key } = await api.notifications.getVapidKey();
                    const registration = await navigator.serviceWorker.ready;
                    
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(key)
                    });

                    await api.notifications.subscribe(subscription);
                } catch (e) {
                    console.error("Auto-notification setup failed", e);
                }
            }
        };

        initNotifications();
    }, [user]);

    return null;
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (showSplash) return;

    const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/reset-password');
    const hasDismissed = sessionStorage.getItem('welcomeModalDismissed');

    if (!user && !hasDismissed && !isAuthPage) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (user || isAuthPage) {
      setShowWelcomeModal(false);
    }
  }, [user, location.pathname, showSplash]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('welcomeModalDismissed', 'true');
  };

  const handleAuthRedirect = () => {
    handleCloseWelcomeModal();
    navigate('/auth');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-white flex flex-col">
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

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 text-white max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <button 
              onClick={handleCloseWelcomeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="w-8 h-8" />
            </button>
            
            <div className="text-center space-y-6">
              <div className="bg-indigo-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-indigo-500" />
              </div>
              
              <h2 className="text-2xl font-bold">Benvenuto su UniParty!</h2>
              <p className="text-gray-300">
                Accedi o registrati per vivere al meglio l'esperienza UniParty e prenotare i tuoi voucher senza interruzioni.
              </p>
              
              <div className="space-y-3 pt-4">
                <button 
                  onClick={handleAuthRedirect}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-900/20"
                >
                  Crea Account / Accedi
                </button>
                <button 
                  onClick={handleCloseWelcomeModal}
                  className="w-full bg-transparent hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition"
                >
                  Continua come ospite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
          <AppContent />
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
