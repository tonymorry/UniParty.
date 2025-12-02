import React from 'react';
import { Scale, AlertTriangle, FileText } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-6">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Scale className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Termini e Condizioni</h1>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6 text-sm md:text-base leading-relaxed">
            <p className="font-semibold text-gray-900">
                Ultimo aggiornamento: 02 Dicembre 2025
            </p>
            
            <p>
                Benvenuti su <strong>UniParty</strong>. L'utilizzo della piattaforma è regolato dai seguenti termini e condizioni.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Accettazione dei Termini</h2>
            <p>Registrandosi o utilizzando i servizi offerti da UniParty, l'utente accetta integralmente i presenti termini.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Ruolo della Piattaforma</h2>
            <p>UniParty agisce come intermediario tecnico ("Marketplace") tra gli studenti e gli organizzatori di eventi (Associazioni). UniParty non è l'organizzatore degli eventi e non è responsabile per la gestione in loco, la sicurezza o eventuali cancellazioni degli eventi stessi, che rimangono di esclusiva responsabilità dell'Organizzatore.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Acquisto e Rimborsi</h2>
            <ul className="list-disc pl-5 space-y-1">
                <li>I voucher acquistati costituiscono un titolo di prenotazione.</li>
                <li>I rimborsi sono gestiti direttamente dagli Organizzatori secondo le proprie politiche.</li>
                <li>In caso di annullamento evento, UniParty faciliterà il rimborso per la parte di competenza, ma le fee di servizio potrebbero non essere rimborsabili.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Condotta dell'Utente</h2>
            <p>L'utente si impegna a fornire dati veritieri e a utilizzare la piattaforma nel rispetto delle leggi vigenti. È vietata la rivendita non autorizzata dei voucher (bagarinaggio).</p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            L'accesso agli eventi potrebbe essere soggetto a controlli di sicurezza e limiti di età imposti dall'Organizzatore o dal locale ospitante.
                        </p>
                    </div>
                </div>
            </div>

             <h2 className="text-xl font-bold text-gray-900 mt-8">5. Contatti</h2>
            <p>Per questioni legali o amministrative:</p>
            <div className="flex items-center mt-2">
                 <FileText className="w-4 h-4 mr-2 text-gray-500" />
                 <span>Email: uniparty.team@gmail.com</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;