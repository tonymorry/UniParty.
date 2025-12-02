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
                <li><strong>Dati Accademici (Opzionale):</strong> Numero di Matricola, richiesto solo per specifici eventi (es. seminari) su indicazione dell'Organizzatore.</li>
                <li><strong>Dati Transazionali:</strong> Storico delle prenotazioni, Voucher generati, importi versati.</li>
                <li><strong>Dati di Utilizzo e Presenza:</strong> Scansione dei QR Code. Per alcuni eventi, registriamo sia l'orario di <strong>Ingresso</strong> che di <strong>Uscita</strong> per calcolare la permanenza.</li>
                <li><strong>Per le Associazioni:</strong> Dati aziendali/associativi e ID dell'account Stripe collegato.</li>
            </ul>
            <div className="bg-gray-50 p-4 rounded-lg text-sm mt-2 border border-gray-200">
                <Lock className="w-4 h-4 inline mr-2 text-gray-500"/>
                <strong>Nota sui Pagamenti:</strong> Non memorizziamo né processiamo direttamente i numeri completi delle carte di credito. I pagamenti sono gestiti in sicurezza da <strong>Stripe Inc.</strong>.
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Finalità del Trattamento</h2>
            <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Erogazione del Servizio:</strong> Gestione account, emissione Voucher e accessi (Base giuridica: Contratto).</li>
                <li><strong>Certificazione Presenze (Novità):</strong> Per i seminari o eventi formativi, trattiamo Matricola e Orari di Entrata/Uscita per permettere all'Organizzatore di certificare la presenza ai fini di Crediti Formativi o attestati (Base giuridica: Esecuzione del contratto/Interesse legittimo dell'ente formatore).</li>
                <li><strong>Obblighi Fiscali:</strong> Conservazione traccia delle transazioni economiche (Base giuridica: Obbligo Legale).</li>
                <li><strong>Sicurezza:</strong> Prevenzione frodi (Base giuridica: Legittimo Interesse).</li>
            </ol>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Conservazione dei Dati (Data Retention)</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                    <strong>Transazioni a Pagamento:</strong> I dati relativi a transazioni economiche vengono conservati ("Soft Delete") per <strong>10 anni</strong>, come richiesto dall'art. 2220 del Codice Civile per finalità fiscali.
                </li>
                <li>
                    <strong>Transazioni Gratuite:</strong> Se l'account ha effettuato solo prenotazioni gratuite, i dati vengono <strong>cancellati definitivamente</strong> ("Hard Delete") dai nostri sistemi su richiesta di cancellazione o dopo un periodo di inattività prolungato.
                </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Condivisione dei dati</h2>
            <p>Condividiamo i tuoi dati strettamente necessari con:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>
                    <strong>Organizzatori (Associazioni):</strong> Ricevono Nome, Cognome e, ove richiesto, <strong>Numero di Matricola</strong> e orari di presenza. L'Associazione agisce come Titolare autonomo o Responsabile del trattamento per le finalità legate all'evento specifico.
                </li>
                <li><strong>Stripe:</strong> Per processare i pagamenti.</li>
                <li><strong>Autorità Pubbliche:</strong> Solo se richiesto per legge.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. I tuoi diritti</h2>
            <p>
                Hai diritto di accedere, rettificare, cancellare i tuoi dati o opporti al trattamento. 
                Per esercitare questi diritti, scrivi a <a href="mailto:uniparty.team@gmail.com" className="text-indigo-600 hover:underline">uniparty.team@gmail.com</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;