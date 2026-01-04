import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
      <NotificationManager />
      <Router>
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;