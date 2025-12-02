import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-6">
            <FileText className="w-10 h-10 text-indigo-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Termini e Condizioni del Servizio</h1>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-yellow-800 font-semibold m-0 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>Nota Bene: UniParty agisce esclusivamente come fornitore tecnologico. Il contratto di vendita si perfeziona direttamente tra l'Utente e l'Organizzatore.</span>
                </p>
            </div>

            <p className="font-semibold text-gray-900">
                Ultimo aggiornamento: 02 Dicembre 2025
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Oggetto del Servizio</h2>
            <p>
                UniParty fornisce una piattaforma software che consente alle Associazioni ("Organizzatori") di pubblicare eventi e agli Studenti ("Utenti") di prenotare l'accesso tramite Voucher digitali.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Ruolo di UniParty e Gestione Pagamenti</h2>
            <p>
                UniParty non è l'organizzatore né il venditore degli eventi. 
                <br />
                I pagamenti effettuati sulla piattaforma vengono processati tramite <strong>Stripe Connect</strong> e inviati <strong>direttamente</strong> all'account dell'Organizzatore. 
                UniParty non entra mai in possesso dell'intero importo del biglietto, ma trattiene esclusivamente la propria Commissione di Servizio automaticamente all'atto della transazione.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Seminari e Rilevazione Presenze</h2>
            <p>
                Per eventi accademici, l'Utente accetta che:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Matricola:</strong> È responsabilità dell'Utente fornire il numero di matricola corretto.</li>
                <li><strong>Validazione Oraria:</strong> La presenza viene calcolata in base alle scansioni del QR Code (Ingresso/Uscita). La mancata scansione dell'uscita (ove richiesta) può comportare il mancato tracciamento delle ore di presenza.</li>
                <li><strong>CFU/Attestati:</strong> UniParty fornisce solo il dato tecnico degli orari. Il riconoscimento formale dei crediti spetta esclusivamente all'Ente Organizzatore.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Prezzi e Commissioni</h2>
            <p>
                Il prezzo pagato dall'Utente è composto da:
                1. Costo del biglietto (Incassato dall'Organizzatore).
                2. Commissione di servizio UniParty (€0,40 IVA incl.) per l'uso della piattaforma.
                <br />
                La commissione di servizio non è rimborsabile.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Rimborsi</h2>
            <p>
                Poiché i fondi vengono trasferiti direttamente all'Organizzatore, qualsiasi richiesta di rimborso deve essere indirizzata a quest'ultimo. UniParty non ha la disponibilità dei fondi per effettuare rimborsi diretti del prezzo del biglietto.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. Limitazione di Responsabilità</h2>
            <p>
                UniParty non è responsabile per la cancellazione degli eventi, la negazione dell'accesso da parte dell'Organizzatore o il mancato riconoscimento di crediti formativi.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">7. Contatti</h2>
            <p>
                Supporto Tecnico: <a href="mailto:uniparty.team@gmail.com" className="text-indigo-600 hover:underline">uniparty.team@gmail.com</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;