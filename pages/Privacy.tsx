import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-6">
            <Shield className="w-10 h-10 text-indigo-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy di UniParty</h1>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
            <p className="font-semibold text-gray-900">
                Ultimo aggiornamento: 24 Novembre 2025
            </p>
            
            <p>
                Benvenuto su <strong>UniParty</strong> ("noi", "ci" o "nostro"). La tua privacy è fondamentale per noi. Questa Privacy Policy descrive come raccogliamo, utilizziamo, divulghiamo e proteggiamo i tuoi dati personali quando utilizzi la nostra piattaforma web e i nostri servizi, in conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR).
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Titolare del Trattamento</h2>
            <p>
                Il Titolare del trattamento dei dati è <strong>UniParty</strong>.
                Per qualsiasi richiesta relativa alla privacy o per esercitare i tuoi diritti, puoi contattare il nostro Responsabile della Protezione dei Dati tramite la nostra <Link to="/support" className="text-indigo-600 font-semibold hover:underline">pagina di supporto</Link>.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Tipologia di Dati Raccolti</h2>
            <p>Raccogliamo diverse categorie di dati per fornire il nostro servizio, distinte in base al tuo ruolo sulla piattaforma:</p>

            <h3 className="text-lg font-bold text-gray-800 mt-4">A. Dati dell'Account (Forniti volontariamente)</h3>
            <p>Al momento della registrazione, raccogliamo:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Per tutti gli utenti:</strong> Indirizzo email, password (che viene crittografata), nome.</li>
                <li><strong>Per gli Studenti:</strong> Cognome.</li>
                <li><strong>Per le Associazioni:</strong> Descrizione dell'organizzazione, link ai profili social, immagine del profilo.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-800 mt-4">B. Dati relativi a Eventi e Biglietti</h3>
            <p>Quando acquisti un biglietto o crei un evento:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Acquisto Biglietti:</strong> Raccogliamo il nome del titolare del biglietto, la data di acquisto e la preferenza della "Lista PR" selezionata.</li>
                <li><strong>Gestione Eventi:</strong> Se sei un'associazione, trattiamo i dati relativi agli eventi pubblicati (titolo, luogo, data, prezzi).</li>
                <li><strong>Scansione e Accesso:</strong> Registriamo l'utilizzo del biglietto (data e ora del check-in) tramite la scansione del QR Code all'ingresso dell'evento.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-800 mt-4">C. Dati di Pagamento e Finanziari</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Per gli Studenti:</strong> Non memorizziamo i dati completi della tua carta di credito sui nostri server. I pagamenti sono elaborati interamente da <strong>Stripe</strong>, il nostro fornitore di servizi di pagamento sicuro.</li>
                <li><strong>Per le Associazioni:</strong> Raccogliamo l'ID del tuo account Stripe (Stripe Connect) per elaborare i pagamenti dei biglietti venduti e trasferire i fondi al tuo account.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Finalità e Base Giuridica del Trattamento</h2>
            <p>Trattiamo i tuoi dati per le seguenti finalità:</p>
            <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Erogazione del Servizio (Contratto):</strong> Per creare il tuo account, generare i biglietti digitali con QR code e permetterti di accedere agli eventi.</li>
                <li><strong>Gestione dei Pagamenti (Contratto e Obbligo Legale):</strong> Per processare le transazioni finanziarie tramite Stripe e adempiere agli obblighi fiscali.</li>
                <li><strong>Sicurezza e Prevenzione Frodi (Legittimo Interesse):</strong> Per verificare la validità dei biglietti tramite scanner e prevenire la duplicazione o la contraffazione.</li>
                <li><strong>Supporto Utente (Contratto):</strong> Per rispondere alle tue richieste di assistenza tecnica.</li>
            </ol>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Condivisione dei Dati con Terze Parti</h2>
            <p>I tuoi dati personali possono essere condivisi con:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Organizzatori dell'Evento (Associazioni):</strong> Quando acquisti un biglietto, l'Associazione organizzatrice ha accesso al tuo nome e al dettaglio del biglietto per gestire l'ingresso e le liste PR.</li>
                <li><strong>Stripe (Processore di Pagamento):</strong> I dati necessari per la transazione e l'onboarding delle associazioni sono trasmessi a Stripe.</li>
                <li><strong>Autorità Legali:</strong> Solo se strettamente necessario per adempiere a un obbligo di legge.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Conservazione dei Dati</h2>
            <p>Conserviamo i tuoi dati personali per il tempo necessario a fornire i servizi richiesti e per rispettare i nostri obblighi legali (es. conservazione delle transazioni per fini fiscali).</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Se desideri eliminare il tuo account, i dati associati verranno rimossi dai nostri sistemi attivi, salvo quelli che siamo tenuti a conservare per legge.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. I Tuoi Diritti (GDPR)</h2>
            <p>In qualità di utente, hai diritto a:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Accedere</strong> ai tuoi dati personali in nostro possesso.</li>
                <li><strong>Rettificare</strong> i dati inesatti (puoi farlo direttamente dal tuo Profilo).</li>
                <li><strong>Cancellare</strong> i tuoi dati ("Diritto all'oblio").</li>
                <li><strong>Limitare</strong> il trattamento dei tuoi dati.</li>
                <li><strong>Opporti</strong> al trattamento per motivi legittimi.</li>
                <li><strong>Portabilità</strong> dei dati.</li>
            </ul>
            <p className="mt-4">
                Per esercitare uno di questi diritti, scrivi alla nostra <Link to="/support" className="text-indigo-600 font-semibold hover:underline">pagina di supporto</Link>.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">7. Sicurezza</h2>
            <p>
                La sicurezza dei tuoi dati è una priorità. Utilizziamo protocolli sicuri (HTTPS) per la trasmissione dei dati e le password degli utenti vengono salvate in formato crittografato (hashing) nei nostri database.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">8. Modifiche</h2>
            <p>
                Ci riserviamo il diritto di modificare questa Privacy Policy. Le modifiche saranno pubblicate su questa pagina con la data di "Ultimo aggiornamento".
            </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;