import React, { useEffect } from 'react';
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
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';

// Manager per la gestione del playerId OneSignal sulle app native
const NativeNotificationManager: React.FC = () => {
    const { user } = useAuth();
    
    useEffect(() => {
        const initOneSignal = async () => {
            // Inizializza OneSignal SOLO se siamo su piattaforma nativa (App iOS/Android)
            if (Capacitor.isNativePlatform()) {
                try {
                    // Sostituisci con il tuo vero OneSignal App ID tramite variabili d'ambiente in fase di build
                    const ONESIGNAL_APP_ID = "00000000-0000-0000-0000-000000000000"; 
                    
                    OneSignal.setAppId(ONESIGNAL_APP_ID);
                    
                    if (user) {
                        // Lega l'ID utente del DB a OneSignal per invio mirato dal backend
                        OneSignal.setExternalUserId(user._id);
                        
                        // Ottieni il playerId (subscriptionId) e registralo nel backend
                        OneSignal.getDeviceState((state) => {
                            if (state && state.userId) {
                                api.notifications.registerDevice(state.userId).catch(console.error);
                            }
                        });
                    }
                } catch (e) {
                    console.error("OneSignal Init Failed", e);
                }
            }
        };

        initOneSignal();
    }, [user]);

    return null;
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <NativeNotificationManager />
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
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;