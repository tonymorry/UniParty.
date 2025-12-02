import React from 'react';
import { Shield, Lock, FileText, Clock, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-6">
            <Shield className="w-10 h-10 text-indigo-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
            <p className="font-semibold text-gray-900">
                Ultimo aggiornamento: 02 Dicembre 2025
            </p>
            
            <p>
                In questa informativa spieghiamo come <strong>UniParty</strong> ("noi", "Piattaforma") raccoglie, utilizza e protegge i tuoi dati personali. 
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Titolare del Trattamento</h2>
            <p>
                Il Titolare del trattamento dei dati relativi all'account e alla navigazione è <strong>UniParty</strong>.
                <br />
                Per i dati relativi alla partecipazione agli eventi (es. liste ingressi), l'<strong>Organizzatore dell'evento</strong> agisce come Titolare autonomo o Responsabile, a seconda dei casi.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Dati che raccogliamo</h2>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Dati Account:</strong> Nome, Cognome, Email, Password (crittografata).</li>
                <li><strong>Dati Accademici (Se richiesti):</strong> Numero di Matricola, raccolto solo per specifici eventi (es. seminari) per finalità di accreditamento.</li>
                <li><strong>Dati di Presenza:</strong> Orari di scansione del QR Code (Ingresso ed eventuale Uscita) per calcolare la permanenza all'evento.</li>
                <li><strong>Dati Transazionali:</strong> Storico degli ordini. Non trattiamo i dati completi della carta di credito, che sono gestiti interamente da Stripe.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Finalità del Trattamento</h2>
            <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Erogazione del Servizio:</strong> Gestione account, generazione Voucher e controllo accessi (Base giuridica: Contratto).</li>
                <li><strong>Certificazione Presenze:</strong> Per consentire agli Organizzatori di certificare la presenza ai fini di Crediti Formativi (Base giuridica: Esecuzione del contratto).</li>
                <li><strong>Sicurezza e Prevenzione Frodi:</strong> (Base giuridica: Legittimo Interesse).</li>
            </ol>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Conservazione dei Dati</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                    <strong>Dati Fiscali:</strong> I dati relativi a transazioni a pagamento vengono conservati per <strong>10 anni</strong> per obblighi di legge (art. 2220 C.C.), anche in caso di cancellazione account ("Soft Delete").
                </li>
                <li>
                    <strong>Dati Generali:</strong> Se l'account non ha generato transazioni fiscali rilevanti, i dati vengono cancellati definitivamente su richiesta ("Hard Delete").
                </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Condivisione dei dati</h2>
            <p>Condividiamo i tuoi dati con:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>
                    <strong>Organizzatori:</strong> Ricevono l'elenco partecipanti (Nome, Cognome, Matricola, Orari) per gestire l'evento.
                </li>
                <li><strong>Stripe:</strong> Per l'elaborazione sicura dei pagamenti.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. I tuoi diritti</h2>
            <p>
                Per esercitare i tuoi diritti (accesso, rettifica, cancellazione), scrivi a <a href="mailto:uniparty.team@gmail.com" className="text-indigo-600 hover:underline">uniparty.team@gmail.com</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;