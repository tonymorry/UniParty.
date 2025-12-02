import React from 'react';
import { FileText, AlertTriangle, Scale, Info } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-6">
            <Scale className="w-10 h-10 text-indigo-900 mr-4" />
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Condizioni Generali di Utilizzo</h1>
                <p className="text-gray-500 text-sm mt-1">Accordo vincolante tra l'Utente e la Piattaforma</p>
            </div>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-700 space-y-6 text-sm md:text-base leading-relaxed text-justify">
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8 rounded-r-lg">
                <p className="text-sm text-indigo-800 font-medium m-0 flex items-start">
                    <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                        <strong>Sintesi per l'Utente:</strong> UniParty è un fornitore tecnologico. Non organizziamo gli eventi. 
                        Il biglietto lo acquisti direttamente dall'Associazione studentesca. Noi ti addebitiamo solo una commissione di servizio (€0,40) per l'uso dell'app.
                    </span>
                </p>
            </div>

            <p className="text-xs text-gray-400 text-right uppercase tracking-wider font-semibold">
                Ultimo aggiornamento: 02 Dicembre 2025
            </p>

            <h3 className="text-lg font-bold text-gray-900 uppercase mt-8">1. Definizioni e Oggetto del Contratto</h3>
            <p>
                <strong>1.1.</strong> I presenti Termini e Condizioni (di seguito "Termini") disciplinano l'accesso e l'utilizzo della piattaforma web e mobile "UniParty" (di seguito "Piattaforma" o "Fornitore"), gestita da [Tua Ragione Sociale/Nome Ente], con sede in [Tuo Indirizzo].
            </p>
            <p>
                <strong>1.2.</strong> Il Servizio offerto consiste nella messa a disposizione di uno spazio virtuale (Marketplace) che consente a enti terzi ("Organizzatori" o "Associazioni") di pubblicare eventi e agli utenti finali ("Studenti" o "Utenti") di prenotare titoli di accesso ("Voucher").
            </p>

            <h3 className="text-lg font-bold text-gray-900 uppercase mt-8">2. Ruolo della Piattaforma e Limitazione di Responsabilità</h3>
            <p>
                <strong>2.1. Intermediario Tecnico:</strong> UniParty agisce esclusivamente quale fornitore di servizi della società dell'informazione, limitandosi a facilitare l'incontro tra domanda e offerta. <strong>UniParty non è l'organizzatore, né il promotore, né il venditore degli eventi</strong> pubblicati.
            </p>
            <p>
                <strong>2.2. Contratto di Vendita:</strong> Il contratto di compravendita del titolo di accesso si perfeziona esclusivamente e direttamente tra l'Utente e l'Organizzatore. UniParty rimane estranea a tale rapporto contrattuale.
            </p>
            <p>
                <strong>2.3. Esclusione di Responsabilità:</strong> Nei limiti consentiti dall'art. 1229 c.c., la Piattaforma non risponde per:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Cancellazione, rinvio o modifica degli eventi;</li>
                    <li>Mancata conformità dell'evento rispetto alla descrizione;</li>
                    <li>Danni a cose o persone verificatisi durante l'evento;</li>
                    <li>Rifiuto dell'ingresso da parte dell'Organizzatore (es. per raggiunti limiti di capienza, selezione all'ingresso, stato di ebbrezza, mancato rispetto del dress code).</li>
                </ul>
            </p>

            <h3 className="text-lg font-bold text-gray-900 uppercase mt-8">3. Pagamenti, Commissioni e Fatturazione</h3>
            <p>
                <strong>3.1. Metodo di Pagamento:</strong> I pagamenti sono processati tramite la piattaforma sicura <em>Stripe Connect</em>.
            </p>
            <p>
                <strong>3.2. Flusso dei Fondi:</strong> Al momento dell'acquisto, l'importo relativo al costo del biglietto viene trasferito direttamente all'account Stripe dell'Organizzatore.
            </p>
            <p>
                <strong>3.3. Commissione di Servizio (Service Fee):</strong> A fronte dell'utilizzo della Piattaforma, l'Utente corrisponde a UniParty una commissione fissa di <strong>€0,40 (IVA inclusa/Tasse incluse)</strong> per ogni Voucher emesso a pagamento. Tale commissione è separata dal costo del biglietto.
            </p>
            <p>
                <strong>3.4. Irrevocabilità della Fee:</strong> La Commissione di Servizio remunera l'utilizzo dell'infrastruttura tecnologica al momento della prenotazione. Pertanto, essa <strong>non è rimborsabile</strong> in nessun caso, incluse le ipotesi di annullamento dell'evento da parte dell'Organizzatore.
            </p>

            <h3 className="text-lg font-bold text-gray-900 uppercase mt-8">4. Eventi Accademici e Tracciamento Presenze</h3>
            <p>
                <strong>4.1. Dati Accademici:</strong> Per i seminari, l'Utente è tenuto a fornire il proprio numero di matricola corretto. L'inserimento di dati falsi può comportare la sospensione dell'account e la segnalazione alle autorità accademiche competenti.
            </p>
            <p>
                <strong>4.2. Validazione Temporale (Check-in/Check-out):</strong> La Piattaforma registra digitalmente l'orario di ingresso e di uscita tramite scansione del QR Code. È onere esclusivo dell'Utente assicurarsi che il proprio codice venga scansionato dal personale preposto sia all'entrata che all'uscita.
            </p>
            <p>
                <strong>4.3. Riconoscimento Crediti (CFU):</strong> UniParty si limita a fornire il report tecnico delle presenze agli Organizzatori. La Piattaforma <strong>non garantisce</strong> in alcun modo l'effettivo riconoscimento di Crediti Formativi Universitari (CFU) o attestati, la cui erogazione è a totale discrezione dell'Ente o dell'Ateneo di riferimento.
            </p>

            <h3 className="text-lg font-bold text-gray-900 uppercase mt-8">5. Politica di Rimborso (Refund Policy)</h3>
            <p>
                <strong>5.1.</strong> Qualsiasi richiesta di rimborso del prezzo del biglietto deve essere indirizzata direttamente all'Organizzatore dell'evento.
            </p>
            <p>
                <strong>5.2.</strong> UniParty non detiene i fondi relativi ai biglietti e non ha il potere tecnico né l'autorizzazione legale per stornare transazioni in autonomia senza il consenso dell'Organizzatore titolare del conto Stripe connesso.
            </p>

            <h3 className="text-lg font-bold text-gray-900 uppercase mt-8">6. Natura del Voucher e Titoli Fiscali</h3>
            <p>
                Il Voucher digitale emesso da UniParty costituisce una mera prenotazione o ricevuta di pagamento. Esso <strong>non sostituisce</strong> il titolo di accesso fiscale (Biglietto SIAE) qualora richiesto dalla normativa vigente per la tipologia di evento. L'emissione del regolare titolo fiscale compete esclusivamente all'Organizzatore al momento dell'accesso.
            </p>

            <h3 className="text-lg font-bold text-gray-900 uppercase mt-8">7. Legge Applicabile e Foro Competente</h3>
            <p>
                I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia inerente l'interpretazione o esecuzione dei presenti Termini, se l'Utente agisce in qualità di consumatore, sarà competente il giudice del luogo di residenza o domicilio dell'Utente, se ubicati in Italia.
            </p>

            <hr className="my-8 border-gray-200" />
            <p className="text-sm text-gray-500">
                Per comunicazioni legali: <a href="mailto:uniparty.team@gmail.com" className="text-indigo-600 underline">uniparty.team@gmail.com</a>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;