import React from 'react';
import { Shield, Lock, Eye, Database, Server } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-6">
            <Shield className="w-10 h-10 text-indigo-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6 text-sm md:text-base leading-relaxed">
            <p className="font-semibold text-gray-900">Ultimo aggiornamento: 05 Dicembre 2025</p>
            
            <p>La presente informativa descrive come UniParty gestisce i tuoi dati. UniParty agisce come Titolare del Trattamento per la gestione della piattaforma.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Moderazione e Segnalazioni (UGC)</h2>
            <p>
                Al fine di garantire la sicurezza della community, UniParty raccoglie e tratta dati relativi alle <strong>segnalazioni di contenuti inappropriati</strong>. Se invii una segnalazione, i tuoi dati (ID utente) verranno associati alla segnalazione solo per fini di verifica e moderazione interna. L'identità del segnalatore non verrà mai rivelata all'utente segnalato.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Tipologia di Dati Trattati</h2>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account:</strong> Nome, Email, Ruolo, Immagine profilo.</li>
                <li><strong>Moderazione:</strong> Motivazioni delle segnalazioni inviate o ricevute.</li>
                <li><strong>Accademici:</strong> Numero di Matricola (solo per eventi specifici).</li>
                <li><strong>Pagamenti:</strong> Gestiti da Stripe Inc. UniParty non conserva i dati delle carte.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Diritti dell'Interessato</h2>
            <p>Puoi richiedere l'accesso, la rettifica o la cancellazione dei tuoi dati contattandoci a: uniparty.team@gmail.com.</p>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm mt-12">
                <p><strong>Email Privacy:</strong> uniparty.team@gmail.com</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;