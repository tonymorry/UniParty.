import React from 'react';
import { FileText, AlertTriangle, Scale, Info, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center mb-10 border-b border-gray-100 pb-8">
            <div className="bg-indigo-50 p-3 rounded-xl mr-5">
                <Scale className="w-10 h-10 text-indigo-900" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Condizioni Generali di Utilizzo</h1>
                <p className="text-gray-500 text-sm mt-1">Accordo vincolante tra l'Utente e la Piattaforma UniParty</p>
            </div>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-700 space-y-8 text-sm md:text-base leading-relaxed text-justify">
            
            {/* Disclaimer Box */}
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-r-lg shadow-sm">
                <h4 className="text-indigo-900 font-bold text-sm uppercase mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" /> Nota di Sintesi
                </h4>
                <p className="text-sm text-indigo-800 m-0">
                    UniParty agisce esclusivamente come <strong>fornitore di servizi tecnologici</strong>. 
                    Non siamo gli organizzatori degli eventi. Quando acquisti un Voucher, il contratto si perfeziona direttamente tra te (Studente) e l'Associazione organizzatrice.
                </p>
            </div>

            <p className="text-xs text-gray-400 text-right uppercase tracking-wider font-semibold border-b border-gray-100 pb-2">
                Ultimo aggiornamento: 02 Dicembre 2025
            </p>

            {/* Articolo 1 */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">1. Oggetto del Servizio e Definizioni</h3>
                <p>
                    <strong>1.1.</strong> I presenti Termini e Condizioni (i "Termini") disciplinano l'accesso e l'utilizzo della piattaforma digitale "UniParty" (la "Piattaforma"), accessibile via web e applicazione mobile.
                </p>
                <p>
                    <strong>1.2.</strong> Il Servizio consiste nella fornitura di un marketplace online che consente a enti terzi ("Organizzatori" o "Associazioni") di pubblicare eventi e agli utenti registrati ("Utenti" o "Studenti") di prenotare i relativi titoli di accesso ("Voucher").
                </p>
            </section>

            {/* Articolo 2 */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">2. Ruolo della Piattaforma e Rapporti Contrattuali</h3>
                <p>
                    <strong>2.1. Intermediario Tecnico:</strong> UniParty opera esclusivamente quale intermediario tecnico. UniParty non organizza, non supervisiona e non garantisce gli eventi pubblicati sulla Piattaforma.
                </p>
                <p>
                    <strong>2.2. Contratto di Partecipazione:</strong> Qualsiasi contratto relativo alla partecipazione a un evento si conclude esclusivamente e direttamente tra l'Utente e l'Organizzatore. UniParty rimane estranea a tale rapporto contrattuale.
                </p>
            </section>

            {/* Articolo 3 */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">3. Pagamenti, Prezzi e Commissioni</h3>
                <p>
                    <strong>3.1. Elaborazione dei Pagamenti (Direct Charge):</strong> I pagamenti vengono elaborati tramite il provider di servizi di pagamento <em>Stripe Inc</em>. Al momento della transazione, l'importo corrispondente al prezzo del biglietto viene trasferito <strong>direttamente</strong> all'account Stripe dell'Organizzatore. UniParty non entra in possesso dei fondi spettanti all'Organizzatore.
                </p>
                <p>
                    <strong>3.2. Commissione di Servizio (Service Fee):</strong> Per l'utilizzo della tecnologia e del servizio di prenotazione, l'Utente accetta di corrispondere a UniParty una commissione fissa di <strong>€0,40 (Tasse incluse)</strong> per ogni biglietto a pagamento emesso. Tale importo viene prelevato automaticamente al momento del pagamento.
                </p>
                <p>
                    <strong>3.3. Non Rimborsabilità della Fee:</strong> La Commissione di Servizio remunera l'attività tecnica di gestione della prenotazione ed emissione del Voucher digitale. Pertanto, essa non è soggetta a rimborso, nemmeno nel caso in cui l'evento venga successivamente annullato dall'Organizzatore o l'Utente rinunci alla partecipazione.
                </p>
            </section>

            {/* Articolo 4 - Seminari */}
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 uppercase mb-3 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" />
                    4. Disposizioni Specifiche per Seminari ed Eventi Accademici
                </h3>
                <p className="mb-2">
                    Per gli eventi che prevedono il rilascio di Crediti Formativi Universitari (CFU) o attestati, valgono le seguenti regole speciali:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong>Dati Matricola:</strong> L'Utente è l'unico responsabile della correttezza del Numero di Matricola fornito in fase di acquisto. UniParty non effettua controlli di veridicità sui dati accademici inseriti.
                    </li>
                    <li>
                        <strong>Tracciamento Presenze (Entry/Exit):</strong> La validazione della presenza avviene esclusivamente tramite la scansione del QR Code. Per gli eventi che lo richiedono, l'Utente ha l'onere di far scansionare il proprio Voucher sia all'<strong>Ingresso</strong> che all'<strong>Uscita</strong>.
                    </li>
                    <li>
                        <strong>Mancata Validazione:</strong> La mancata scansione dell'uscita ("Check-out") comporterà l'impossibilità tecnica di calcolare la durata della permanenza. UniParty non potrà fornire i dati di presenza agli Organizzatori in caso di negligenza dell'Utente.
                    </li>
                    <li>
                        <strong>Riconoscimento Crediti:</strong> UniParty fornisce esclusivamente il report tecnico degli orari. La decisione finale sull'attribuzione dei crediti spetta insindacabilmente all'Ente Organizzatore o all'Ateneo. UniParty declina ogni responsabilità per il mancato riconoscimento dei crediti.
                    </li>
                </ul>
            </section>

            {/* Articolo 5 */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">5. Titoli di Accesso e Aspetti Fiscali</h3>
                <p>
                    <strong>5.1. Natura del Voucher:</strong> Il QR Code generato dalla Piattaforma costituisce un titolo di legittimazione alla prenotazione (Voucher). Esso <strong>non costituisce Titolo Fiscale</strong> (es. Biglietto SIAE), salvo diversa indicazione specifica.
                </p>
                <p>
                    <strong>5.2. Obblighi dell'Organizzatore:</strong> È responsabilità esclusiva dell'Organizzatore emettere e rilasciare all'Utente il regolare titolo fiscale di accesso al momento dell'ingresso all'evento, in conformità alle normative vigenti sugli spettacoli e intrattenimenti.
                </p>
            </section>

            {/* Articolo 6 */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">6. Politica di Rimborso (Refund Policy)</h3>
                <p>
                    Poiché i fondi relativi al prezzo del biglietto sono incassati direttamente dall'Organizzatore, qualsiasi richiesta di rimborso deve essere inoltrata a quest'ultimo. UniParty non ha la disponibilità delle somme e non può effettuare rimborsi diretti per conto terzi.
                </p>
            </section>

            {/* Articolo 7 */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">7. Limitazione di Responsabilità</h3>
                <p>
                    Nei limiti di legge, UniParty non sarà responsabile per:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Cancellazione, rinvio o variazione del programma degli eventi;</li>
                    <li>Diniego di accesso da parte dell'Organizzatore (es. selezione all'ingresso, stato di ebbrezza, capienza raggiunta);</li>
                    <li>Danni diretti o indiretti derivanti dalla partecipazione all'evento.</li>
                </ul>
            </section>

            <hr className="my-8 border-gray-200" />
            
            <div className="flex items-center justify-between text-sm text-gray-500">
                <p>Hai dubbi sui Termini?</p>
                <Link to="/support" className="text-indigo-600 font-bold hover:underline">
                    Contatta il Supporto Legale
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;