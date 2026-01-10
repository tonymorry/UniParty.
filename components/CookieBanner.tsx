
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('uniparty_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('uniparty_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 p-4 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-start md:items-center text-sm text-gray-300 flex-1">
          <div className="p-2 bg-indigo-600/20 rounded-full mr-3 flex-shrink-0 text-indigo-400 border border-indigo-500/20">
             <Cookie className="w-5 h-5" />
          </div>
          <p>
            Questo sito utilizza <strong>cookie tecnici</strong> essenziali per il funzionamento e cookie di terze parti per i pagamenti (Stripe). 
            Non usiamo cookie di profilazione. Dettagli nella <Link to="/privacy" className="text-indigo-400 font-bold hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition shadow-[0_0_20px_rgba(79,70,229,0.2)]"
          >
            Accetta
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-gray-500 hover:text-white transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookieBanner;
