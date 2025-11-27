import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già accettato i cookie
    const consent = localStorage.getItem('uniparty_cookie_consent');
    if (!consent) {
      // Mostra il banner dopo un breve ritardo per un effetto più fluido
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-start md:items-center text-sm text-gray-600 flex-1">
          <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0 text-indigo-600">
             <Cookie className="w-5 h-5" />
          </div>
          <p>
            Questo sito utilizza <strong>cookie tecnici</strong> essenziali per il funzionamento (autenticazione) e cookie di terze parti per gestire i pagamenti in sicurezza (Stripe). 
            Non utilizziamo cookie di profilazione pubblicitaria. Per maggiori dettagli, consulta la nostra <Link to="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-indigo-900 hover:bg-indigo-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            Ho capito e Accetto
          </button>
          <button 
            onClick={() => setIsVisible(false)} // Chiude solo temporaneamente
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookieBanner;