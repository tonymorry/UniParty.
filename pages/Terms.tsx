import React from 'react';
import { FileText, AlertTriangle, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-6">
            <Scale className="w-10 h-10 text-indigo-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Termini e Condizioni Generali di Utilizzo</h1>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6 text-sm md:text-base leading-relaxed">
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <p className="text-sm text-yellow-800 font-semibold m-0 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>AVVISO IMPORTANTE: UniParty agisce esclusivamente come fornitore tecnologico (Marketplace). Il contratto di compravendita del titolo di accesso si perfeziona esclusivamente tra l'Utente e l'Organizzatore dell'evento.</span>
                </p>
            </div>

            <p className="font-semibold text-gray-900">Data di ultima revisione: 02 Dicembre 2025</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Premesse e Definizioni</h2>
            <p>I presenti Termini e Condizioni disciplinano l'accesso e l'utilizzo della piattaforma web "UniParty" (di seguito "Piattaforma"). Accedendo alla Piattaforma, l'Utente accetta integralmente le presenti condizioni.</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Gestore/Piattaforma:</strong> Indica UniParty, fornitore del servizio di intermediazione tecnologica.</li>
                <li><strong>Organizzatore:</strong> L'Associazione studentesca o ente terzo che promuove, organizza e gestisce l'evento.</li>
                <li><strong>Utente/Studente:</strong> La persona fisica che acquista o prenota un titolo di accesso tramite la Piattaforma.</li>
                <li><strong>Voucher:</strong> Il codice QR generato dalla Piattaforma che funge da ricevuta di prenotazione e pagamento.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Oggetto del Servizio</h2>
            <p>UniParty concede in licenza d'uso una piattaforma software che permette agli Organizzatori di pubblicare eventi e agli Utenti di prenotare l'accesso. <strong>UniParty NON è l'organizzatore, il promotore o il venditore degli eventi</strong> presenti sulla Piattaforma, salvo ove espressamente indicato.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Natura del Voucher e Titoli Fiscali</h2>
            <p>Il QR Code (Voucher) rilasciato da UniParty al termine della procedura di acquisto costituisce esclusivamente una <strong>prova di prenotazione e di avvenuto pagamento</strong>.</p>
            <p><strong>Titolo Fiscale (SIAE):</strong> L'emissione del titolo di accesso valido ai fini fiscali e normativi (es. Biglietto SIAE) è di esclusiva responsabilità dell'Organizzatore, che provvederà a rilasciarlo all'Utente al momento dell'accesso fisico all'evento o secondo le modalità da esso previste. UniParty non è responsabile per la mancata emissione di titoli fiscali da parte dell'Organizzatore.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Pagamenti, Commissioni e Fatturazione</h2>
            <p>La Piattaforma utilizza il sistema di pagamento "Stripe Connect".</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Flusso dei Fondi:</strong> Al momento dell'acquisto, l'importo relativo al prezzo del biglietto viene trasferito direttamente ed automaticamente all'account Stripe dell'Organizzatore.</li>
                <li><strong>Commissione di Servizio (Fee):</strong> UniParty applica una commissione fissa di €0,40 (quaranta centesimi) per ogni transazione a carico dell'Utente o inglobata nel prezzo, a remunerazione del servizio tecnologico offerto. Tale commissione viene separata automaticamente al momento del pagamento.</li>
                <li><strong>Non Rimborsabilità della Fee:</strong> In caso di annullamento dell'evento o rimborso del biglietto, la Commissione di Servizio di UniParty non sarà in alcun caso rimborsata, avendo la Piattaforma già erogato il servizio di intermediazione.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Politica di Rimborso e Annullamento Eventi</h2>
            <p>Poiché UniParty non entra in possesso dei fondi relativi al prezzo del biglietto (trasferiti direttamente all'Organizzatore), <strong>UniParty non può effettuare rimborsi diretti</strong>.</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Qualsiasi richiesta di rimborso deve essere indirizzata direttamente all'Organizzatore dell'evento.</li>
                <li>In caso di annullamento dell'evento, è esclusiva responsabilità dell'Organizzatore provvedere ai rimborsi secondo le proprie policy e la normativa vigente.</li>
                <li>UniParty si impegna esclusivamente a facilitare la comunicazione tra Utente e Organizzatore qualora necessario.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. Eventi Accademici e Rilevazione Presenze</h2>
            <p>Per eventi di natura accademica (seminari, conferenze) che prevedono il riconoscimento di Crediti Formativi o attestati:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>L'Utente è responsabile dell'inserimento corretto del proprio Numero di Matricola.</li>
                <li>La Piattaforma registra gli orari di scansione del Voucher (Ingresso e, ove previsto, Uscita). La mancata scansione del Voucher in uscita può comportare l'impossibilità di calcolare la durata della presenza.</li>
                <li>UniParty fornisce agli Organizzatori solo il report tecnico dei dati di presenza. L'attribuzione effettiva dei crediti o il rilascio di attestati è di esclusiva competenza dell'Ente o Associazione organizzatrice.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">7. Limitazione di Responsabilità</h2>
            <p>Nella misura massima consentita dalla legge applicabile, UniParty è esonerata da ogni responsabilità per:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Cancellazione, rinvio o modifiche sostanziali degli eventi.</li>
                <li>Danni diretti o indiretti subiti dagli Utenti durante lo svolgimento degli eventi (es. infortuni, furti).</li>
                <li>Mancata conformità dei servizi offerti dall'Organizzatore rispetto a quanto pubblicizzato.</li>
                <li>Malfunzionamenti temporanei della Piattaforma dovuti a cause di forza maggiore o manutenzione.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">8. Obblighi dell'Utente e Divieto di Bagarinaggio</h2>
            <p>È fatto divieto assoluto di utilizzare la Piattaforma per attività di rivendita non autorizzata di biglietti (c.d. "secondary ticketing" o bagarinaggio). UniParty si riserva il diritto di annullare i Voucher e sospendere l'account dell'Utente qualora vi sia il sospetto di attività illecite o fraudolente.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">9. Legge Applicabile e Foro Competente</h2>
            <p>I presenti Termini sono regolati dalla Legge Italiana. Per qualsiasi controversia inerente l'interpretazione o l'esecuzione dei presenti Termini tra UniParty e un Utente Consumatore, sarà competente il Foro di residenza o domicilio del Consumatore, se ubicato in Italia. Per gli Utenti non Consumatori (es. Associazioni), sarà competente in via esclusiva il Foro di [INSERIRE CITTÀ FORO COMPETENTE].</p>

            <hr className="my-8 border-gray-200" />

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dati Aziendali del Gestore</h3>
                <p className="mb-1"><strong>Ragione Sociale:</strong> [INSERIRE RAGIONE SOCIALE]</p>
                <p className="mb-1"><strong>Sede Legale:</strong> [INSERIRE INDIRIZZO COMPLETO]</p>
                <p className="mb-1"><strong>P.IVA / C.F.:</strong> [INSERIRE P.IVA]</p>
                <p className="mb-1"><strong>Email Supporto:</strong> uniparty.team@gmail.com</p>
                <p><strong>PEC:</strong> [INSERIRE INDIRIZZO PEC]</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;