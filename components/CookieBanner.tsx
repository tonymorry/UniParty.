import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('uniparty_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('uniparty_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] z-50 p-5 animate-in slide-in-from-bottom-full duration-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-start md:items-center text-sm text-gray-400 flex-1">
          <div className="p-3 bg-indigo-600/20 rounded-2xl mr-4 flex-shrink-0 text-indigo-400 border border-indigo-500/20 shadow-inner">
             <Cookie className="w-6 h-6" />
          </div>
          <p className="leading-relaxed">
            Utilizziamo esclusivamente <span className="text-indigo-400 font-bold">cookie tecnici</span> essenziali per l'autenticazione e cookie di terze parti (Stripe) per la sicurezza dei tuoi pagamenti. 
            Nessuna profilazione pubblicitaria. Consulta la <Link to="/privacy" className="text-white font-bold hover:text-indigo-400 transition underline decoration-indigo-500/30">Privacy Policy</Link>.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] whitespace-nowrap active:scale-95"
          >
            Ho capito
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-3 text-gray-600 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookieBanner;