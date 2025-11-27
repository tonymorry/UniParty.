import React from 'react';
import { Shield, Lock, FileText } from 'lucide-react';
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
                Ultimo aggiornamento: 27 Novembre 2025
            </p>
            
            <p>
                In questa informativa spieghiamo come <strong>UniParty</strong> ("noi", "Titolare") raccoglie, utilizza e protegge i tuoi dati personali. 
                Utilizzando la nostra piattaforma di prenotazione eventi ("Servizio"), accetti le pratiche descritte in questo documento.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Titolare del Trattamento</h2>
            <p>
                Il Titolare del trattamento è <strong>UniParty</strong> (Associazione/Ente in via di costituzione).
                <br />Email di contatto per questioni privacy: <a href="mailto:uniparty.team@gmail.com" className="text-indigo-600 hover:underline">uniparty.team@gmail.com</a>
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Dati che raccogliamo</h2>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Dati Account:</strong> Nome, Cognome, Email, Password (crittografata).</li>
                <li><strong>Dati Transazionali:</strong> Storico delle prenotazioni, Voucher generati, importi versati, data e ora delle transazioni.</li>
                <li><strong>Dati di Utilizzo:</strong> Scansione dei QR Code (data e ora di ingresso all'evento).</li>
                <li><strong>Per le Associazioni:</strong> Dati aziendali/associativi e ID dell'account Stripe collegato per ricevere i fondi.</li>
            </ul>
            <div className="bg-gray-50 p-4 rounded-lg text-sm mt-2 border border-gray-200">
                <Lock className="w-4 h-4 inline mr-2 text-gray-500"/>
                <strong>Nota sui Pagamenti:</strong> Non memorizziamo né processiamo direttamente i numeri completi delle carte di credito. I pagamenti sono gestiti in sicurezza da <strong>Stripe Inc.</strong>, che agisce come titolare autonomo per i dati finanziari.
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Perché trattiamo i tuoi dati (Finalità)</h2>
            <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Erogazione del Servizio:</strong> Per gestire il tuo account, generare i Voucher di prenotazione e permetterti l'accesso agli eventi (Base giuridica: Contratto).</li>
                <li><strong>Obblighi Fiscali e Legali (IMPORTANTE):</strong> Per conservare traccia delle transazioni economiche come richiesto dalle leggi fiscali italiane e normative antiriciclaggio (Base giuridica: Obbligo Legale).</li>
                <li><strong>Sicurezza:</strong> Per prevenire frodi o abusi della piattaforma (Base giuridica: Legittimo Interesse).</li>
            </ol>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Conservazione dei Dati (Data Retention)</h2>
            <p>
                I tuoi dati sono conservati per tutto il tempo in cui il tuo account è attivo.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-4">Cancellazione Account e "Soft Delete"</h3>
            <p>
                Se richiedi la cancellazione del tuo account, i tuoi dati personali visibili verranno rimossi dal front-end della piattaforma ("Soft Delete").
                Tuttavia, <strong>i dati relativi alle transazioni economiche e ai Voucher emessi NON saranno cancellati definitivamente</strong> ma verranno archiviati in modalità sicura e conservati per <strong>10 anni</strong>, come obbligatoriamente richiesto dall'art. 2220 del Codice Civile italiano per fini fiscali e di accertamento.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Condivisione dei dati</h2>
            <p>Condividiamo i tuoi dati strettamente necessari con:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Organizzatori (Associazioni):</strong> Ricevono il tuo Nome, Cognome e dettagli del Voucher per verificare la tua identità all'ingresso dell'evento.</li>
                <li><strong>Stripe:</strong> Per processare i pagamenti e gestire i trasferimenti di denaro alle associazioni.</li>
                <li><strong>Autorità Pubbliche:</strong> Solo se richiesto per legge o per ordine dell'autorità giudiziaria.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. I tuoi diritti</h2>
            <p>Ai sensi del GDPR, hai diritto di:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Accedere ai tuoi dati.</li>
                <li>Chiedere la rettifica di dati inesatti.</li>
                <li>Chiedere la cancellazione (Diritto all'oblio), fatti salvi gli obblighi di conservazione fiscale descritti al punto 4.</li>
                <li>Scaricare i tuoi dati (Portabilità).</li>
            </ul>
            <p className="mt-4">
                Per esercitare questi diritti, accedi alla sezione <Link to="/support" className="text-indigo-600 hover:underline">Supporto</Link> o scrivici.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">7. Modifiche</h2>
            <p>
                Potremmo aggiornare questa informativa. Ti avviseremo di modifiche significative tramite l'email associata al tuo account o un avviso sulla piattaforma.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;