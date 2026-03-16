import React from 'react';
import { Scale, ShieldAlert, FileText, CreditCard, AlertCircle, GraduationCap, Gavel, CheckCircle, Info, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-6 md:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* HEADER LEGALE */}
        <div className="bg-slate-950 px-6 sm:px-8 py-8 md:py-10 text-white border-b border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                <div className="bg-indigo-600/20 p-3 rounded-xl mr-4 mb-4 sm:mb-0 backdrop-blur-sm border border-indigo-500/20 flex-shrink-0">
                    <Scale className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Termini e Condizioni Generali di Utilizzo</h1>
                    <p className="text-indigo-400/70 text-xs mt-1 uppercase tracking-widest font-black">Contratto di Servizio Marketplace B2B2C</p>
                </div>
            </div>
            <div className="flex justify-between items-end text-[10px] sm:text-xs uppercase tracking-wider font-semibold opacity-50 border-t border-white/10 pt-4 mt-4">
                <span>Versione 1.3</span>
                <span>Ultimo aggiornamento: 05 Dicembre 2025</span>
            </div>
        </div>

        <div className="p-6 sm:p-10 md:p-12 space-y-10 text-gray-300 leading-relaxed text-justify text-sm sm:text-base">

            {/* DISCLAIMER / NOTA DI SINTESI */}
            <div className="bg-amber-950/20 border-l-4 border-amber-600 p-6 rounded-r-lg shadow-sm flex items-start">
                <ShieldAlert className="w-6 h-6 text-amber-500 mr-4 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-amber-500 font-bold text-lg mb-2">Avvertenza Preliminare Importante</h4>
                    <p className="text-sm text-amber-200/80">
                        UniParty agisce esclusivamente come <strong>fornitore di servizi tecnologici (Intermediario)</strong>. 
                        Non siamo gli organizzatori degli eventi. Quando acquisti un Voucher, instauri un rapporto contrattuale diretto con l'Associazione organizzatrice.
                        UniParty non gestisce i fondi del prezzo del biglietto e non è responsabile per la sicurezza o lo svolgimento dell'evento.
                    </p>
                </div>
            </div>

            {/* ARTICOLO 1 - DEFINIZIONI */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-400" />
                    Art. 1 - Definizioni
                </h3>
                <p className="mb-2">Ai fini dei presenti Termini e Condizioni:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                    <li><strong>"Piattaforma"</strong> o <strong>"UniParty"</strong>: l'applicazione web e mobile gestita dal Fornitore Tecnologico.</li>
                    <li><strong>"Organizzatore"</strong> o <strong>"Associazione"</strong>: l'ente terzo autonomo che promuove, gestisce ed eroga l'Evento.</li>
                    <li><strong>"Utente"</strong> o <strong>"Studente"</strong>: la persona fisica che acquista o prenota servizi tramite la Piattaforma.</li>
                    <li><strong>"Voucher"</strong>: il titolo digitale (QR Code) emesso dalla Piattaforma che funge da ricevuta di prenotazione. <strong>NON costituisce titolo fiscale (SIAE)</strong>, salvo diversa indicazione.</li>
                    <li><strong>"Fee di Servizio"</strong>: la commissione trattenuta da UniParty per l'utilizzo della tecnologia.</li>
                </ul>
            </section>

            {/* ARTICOLO 2 - OGGETTO DEL SERVIZIO */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4">
                    Art. 2 - Oggetto del Servizio e Ruolo di UniParty
                </h3>
                <p>
                    <strong>2.1.</strong> UniParty mette a disposizione una Piattaforma Marketplace che consente agli Organizzatori di pubblicare eventi e agli Utenti di acquistare titoli di accesso.
                </p>
                <p>
                    <strong>2.2.</strong> UniParty opera in qualità di mero intermediario tecnico (Hosting Provider ai sensi del D.Lgs. 70/2003). UniParty resta del tutto estranea al rapporto contrattuale di compravendita del biglietto, che intercorre esclusivamente tra l'Utente e l'Organizzatore.
                </p>
                <p>
                    <strong>2.3.</strong> UniParty non effettua alcun controllo preventivo sulla qualità, sicurezza, liceità o veridicità degli eventi pubblicati dagli Organizzatori, declinando ogni responsabilità in merito.
                </p>
            </section>

            {/* ARTICOLO 3 - REGISTRAZIONE */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4">
                    Art. 3 - Registrazione e Veridicità dei Dati
                </h3>
                <p>
                    L'Utente si impegna a fornire dati veritieri, completi e aggiornati, con particolare riferimento allo status di studente universitario e al Numero di Matricola ove richiesto. UniParty si riserva il diritto di sospendere gli account che forniscano dati falsi o incompleti.
                </p>
            </section>

            {/* ARTICOLO 4 - PAGAMENTI E COMMISSIONI */}
            <section className="bg-gray-900/50 p-6 rounded-xl border border-white/5">
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-indigo-400" />
                    Art. 4 - Pagamenti e Politica "No Refund" sulla Fee
                </h3>
                <div className="space-y-4 text-sm sm:text-base">
                    <p>
                        <strong>4.1. Direct Charge (Mandato all'incasso):</strong> I pagamenti sono elaborati tramite il provider <em>Stripe Connect</em>. Al momento dell'acquisto, l'importo corrispondente al prezzo del biglietto viene trasferito <strong>direttamente e immediatamente</strong> all'account Stripe dell'Organizzatore. UniParty non entra in possesso di tali somme.
                    </p>
                    <p>
                        <strong>4.2. Fee di Servizio:</strong> Per l'utilizzo della Piattaforma, UniParty addebita all'Utente una "Fee di Servizio" fissa (es. €0,40 IVA incl.) aggiunta al prezzo del biglietto.
                    </p>
                    <p className="bg-slate-950 p-3 rounded border-l-4 border-red-600 text-gray-200">
                        <strong>4.3. Non Rimborsabilità della Fee:</strong> La Fee di Servizio remunera l'attività tecnologica di elaborazione della prenotazione e generazione del Voucher. Tale prestazione si intende interamente eseguita al momento dell'emissione del Voucher. Pertanto, <strong>la Fee di Servizio non è mai rimborsabile</strong>, neanche in caso di annullamento dell'evento da parte dell'Organizzatore o rinuncia dell'Utente.
                    </p>
                </div>
            </section>

            {/* ARTICOLO 5 - DIRITTO DI RECESSO */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4">
                    Art. 5 - Esclusione del Diritto di Recesso
                </h3>
                <p>
                    Ai sensi dell'<strong>art. 59, comma 1, lettera n) del Codice del Consumo</strong> (D.Lgs. 206/2005), il diritto di recesso è <strong>escluso</strong> per la fornitura di servizi riguardanti le attività del tempo libero qualora il contratto preveda una data o un periodo di esecuzione specifici. Pertanto, l'Utente prende atto di non poter esercitare il diritto di recesso dopo l'acquisto del Voucher.
                </p>
            </section>

            {/* ARTICOLO 6 - RIMBORSI E ANNULLAMENTI */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4">
                    Art. 6 - Annullamento Eventi e Rimborsi
                </h3>
                <p>
                    <strong>6.1.</strong> In caso di annullamento o rinvio dell'Evento, la responsabilità del rimborso del prezzo del biglietto ricade <strong>esclusivamente sull'Organizzatore</strong>, che detiene i fondi incassati.
                </p>
                <p>
                    <strong>6.2.</strong> UniParty non ha tecnicamente la possibilità di stornare transazioni già accreditate sugli account degli Organizzatori. Qualsiasi reclamo relativo ai rimborsi deve essere indirizzato direttamente all'Organizzatore tramite i contatti forniti nella pagina dell'evento.
                </p>
            </section>

             {/* ARTICOLO 7 - SEMINARI E CFU */}
             <section className="bg-indigo-950/20 p-6 rounded-xl border border-indigo-900/30">
                <h3 className="text-xl font-bold text-indigo-300 border-b-2 border-indigo-900/30 pb-2 mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-indigo-400" />
                    Art. 7 - Eventi Accademici e Tracciamento Presenze
                </h3>
                <div className="space-y-3 text-sm sm:text-base text-indigo-100/70">
                    <p>
                        Per gli eventi che prevedono il rilascio di Crediti Formativi Universitari (CFU) o attestati, la Piattaforma fornisce uno strumento tecnico di tracciamento orario (Check-in/Check-out).
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Onere dell'Utente:</strong> È esclusiva responsabilità dell'Utente assicurarsi che il proprio QR Code venga scansionato correttamente sia all'ingresso che all'uscita dal personale preposto.
                        </li>
                        <li>
                            <strong>Esonero Responsabilità:</strong> UniParty non garantisce che i dati raccolti siano accettati dall'Ateneo o dall'Ente formativo per il riconoscimento dei crediti. La decisione finale sull'attribuzione dei CFU spetta esclusivamente all'istituzione accademica.
                        </li>
                        <li>
                            <strong>Malfunzionamenti:</strong> UniParty non risponde di mancati tracciamenti dovuti a guasti dei dispositivi di scansione dell'Organizzatore, assenza di connessione internet in loco o batteria scarica del dispositivo dell'Utente.
                        </li>
                    </ul>
                </div>
            </section>

            {/* UGC SECTION - MANDATORY FOR APP STORES */}
            <section className="bg-red-950/20 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm">
                <h3 className="text-xl font-bold text-red-400 border-b border-red-900/30 pb-2 mb-4 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-red-600" />
                    Sicurezza e Contenuti Generati dagli Utenti (UGC)
                </h3>
                <div className="space-y-4 text-sm sm:text-base text-gray-300">
                    <p>
                        UniParty adotta una <strong>politica di tolleranza zero</strong> nei confronti di contenuti illegali, offensivi, abusivi o discutibili pubblicati sulla piattaforma.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Segnalazione:</strong> Ogni utente può segnalare in tempo reale eventi o profili inappropriati tramite l'apposito pulsante "Segnala" presente in ogni pagina evento.</li>
                        <li><strong>Moderazione:</strong> UniParty si impegna a revisionare ogni segnalazione entro 24 ore. I contenuti che violano i termini verranno rimossi immediatamente.</li>
                        <li><strong>Espulsione:</strong> Gli autori di contenuti che violano sistematicamente queste regole (Organizzatori o Utenti) verranno espulsi permanentemente dalla piattaforma senza preavviso.</li>
                    </ul>
                </div>
            </section>

            {/* ARTICOLO 8 - LIMITAZIONE RESPONSABILITA' */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-indigo-400" />
                    Art. 8 - Limitazione di Responsabilità
                </h3>
                <p className="mb-2">UniParty non sarà in alcun caso responsabile per:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                    <li>Danni diretti o indiretti derivanti dalla mancata esecuzione o inesatta esecuzione della prestazione da parte dell'Organizzatore (es. evento annullato, modifiche al programma).</li>
                    <li>Danni a persone o cose avvenuti durante lo svolgimento dell'evento.</li>
                    <li>Mancato accesso all'evento per cause imputabili all'Utente (es. stato di ebbrezza, ritardo, violazione dress code) o all'Organizzatore (es. overbooking).</li>
                    <li>Mancata emissione del titolo fiscale (SIAE) da parte dell'Organizzatore.</li>
                    <li>Disservizi tecnici della Piattaforma dovuti a cause di forza maggiore o interventi di manutenzione. Il servizio è fornito "così com'è" ("as is").</li>
                </ul>
            </section>

            {/* ARTICOLO 9 - RISOLUZIONE */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4">
                    Art. 9 - Sospensione e Risoluzione
                </h3>
                <p>
                    UniParty si riserva il diritto di sospendere o chiudere l'account dell'Utente o dell'Organizzatore, in qualsiasi momento e senza preavviso, in caso di violazione dei presenti Termini, utilizzo fraudolento della Piattaforma, o segnalazioni di condotte illecite.
                </p>
            </section>

            {/* ARTICOLO 10 - PRIVACY */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4">
                    Art. 10 - Privacy e Dati Personali
                </h3>
                <p>
                    I dati personali sono trattati in conformità alla nostra <Link to="/privacy" className="text-indigo-400 font-bold hover:underline">Privacy Policy</Link>. 
                    Si specifica che i dati relativi alla partecipazione all'evento (Nome, Cognome, Email, Matricola) vengono trasmessi all'Organizzatore per finalità organizzative e di sicurezza, il quale agisce come Titolare autonomo del trattamento per tali dati.
                </p>
            </section>

            {/* ARTICOLO 11 - LEGGE E FORO */}
            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-white/10 pb-2 mb-4 flex items-center">
                    <Gavel className="w-5 h-5 mr-2 text-indigo-400" />
                    Art. 11 - Legge Applicabile e Foro Competente
                </h3>
                <p>
                    <strong>11.1.</strong> Il presente contratto è regolato dalla Legge Italiana.
                </p>
                <p>
                    <strong>11.2.</strong> Per qualsiasi controversia inerente l'interpretazione, esecuzione o risoluzione dei presenti Termini tra UniParty e l'Utente (consumatore), sarà competente il Foro del luogo di residenza o domicilio del consumatore, se ubicato nel territorio dello Stato Italiano.
                </p>
                <p>
                    <strong>11.3.</strong> Per le controversie con utenti professionali (B2B) o qualora non si applichi il Codice del Consumo, sarà competente in via esclusiva il <strong>Foro di Palermo</strong>.
                </p>
            </section>

            <div className="border-t-2 border-white/10 pt-8 mt-12">
                <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-sm sm:text-base text-gray-500 italic">
                            Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c., l'Utente dichiara di aver letto attentamente e di approvare specificamente le pattuizioni contenute negli articoli: 
                            <strong> Art. 2</strong> (Ruolo di Intermediario ed Esonero Responsabilità); 
                            <strong> Art. 4.3</strong> (Non Rimborsabilità Fee); 
                            <strong> Art. 5</strong> (Esclusione Recesso); 
                            <strong> Art. 6</strong> (Rimborsi a carico dell'Organizzatore); 
                            <strong> Art. 8</strong> (Limitazione di Responsabilità); 
                            <strong> Art. 11</strong> (Foro Competente).
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <Link to="/" className="text-indigo-400 font-bold hover:underline flex items-center">
                     Torna alla Home
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;