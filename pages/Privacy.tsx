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
            <p className="font-semibold text-gray-900">
                Informativa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR)
                <br />
                Ultimo aggiornamento: 02 Dicembre 2025
            </p>
            
            <p>
                La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che consultano e utilizzano la piattaforma web <strong>UniParty</strong>.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Titolari del Trattamento (Co-Titolarità e Distinzione)</h2>
            <p>Per la natura di "Marketplace" della Piattaforma, è necessario distinguere due figure:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>
                    <strong>UniParty (Gestore della Piattaforma):</strong> Agisce come <strong>Titolare del Trattamento</strong> per i dati relativi alla registrazione dell'account, alla sicurezza della piattaforma, all'assistenza tecnica e alla gestione delle transazioni (limitatamente ai dati tecnici).
                </li>
                <li>
                    <strong>Associazione/Organizzatore:</strong> Agisce come <strong>Titolare Autonomo del Trattamento</strong> per i dati relativi alla partecipazione allo specifico evento (es. liste ingressi, nominativi, dati accademici per crediti, gestione dell'evento in loco). UniParty trasmette tali dati all'Organizzatore per consentire l'erogazione del servizio acquistato.
                </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Tipologia di Dati Trattati</h2>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Dati di Navigazione:</strong> Indirizzi IP, log di sistema (necessari per il funzionamento tecnico).</li>
                <li><strong>Dati di Account:</strong> Nome, Cognome, Email, Password (conservata in forma crittografata/hash).</li>
                <li><strong>Dati Accademici (Opzionali):</strong> Numero di Matricola. Questi dati sono richiesti solo per eventi specifici (seminari) al fine di tracciare le presenze per fini accademici.</li>
                <li><strong>Dati relativi agli Eventi:</strong> Storico acquisti, preferiti, orari di scansione dei voucher (check-in/check-out).</li>
                <li><strong>Dati di Pagamento:</strong> UniParty <strong>NON</strong> tratta né conserva i dati completi delle carte di credito. Tali dati sono gestiti interamente dal provider di pagamenti <strong>Stripe Inc.</strong></li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Finalità e Base Giuridica</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm border border-gray-200 mt-2">
                    <thead className="bg-gray-50 font-bold">
                        <tr>
                            <th className="p-2 border">Finalità</th>
                            <th className="p-2 border">Base Giuridica</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border">Registrazione ed erogazione del servizio (emissione Voucher)</td>
                            <td className="p-2 border">Esecuzione del contratto (Art. 6.1.b GDPR)</td>
                        </tr>
                        <tr>
                            <td className="p-2 border">Gestione Pagamenti e Fatturazione Fee</td>
                            <td className="p-2 border">Obbligo Legale / Esecuzione contratto</td>
                        </tr>
                        <tr>
                            <td className="p-2 border">Certificazione Presenze (Matricola, Orari)</td>
                            <td className="p-2 border">Esecuzione del contratto (su richiesta Utente)</td>
                        </tr>
                        <tr>
                            <td className="p-2 border">Sicurezza Piattaforma e Prevenzione Frodi</td>
                            <td className="p-2 border">Legittimo Interesse (Art. 6.1.f GDPR)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Conservazione dei Dati (Data Retention Policy)</h2>
            <p>Il periodo di conservazione varia in base alla tipologia di interazione dell'utente con la Piattaforma:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li>
                    <strong>Utenti con Transazioni a Pagamento (Soft Delete):</strong>
                    <br/>
                    Se l'utente ha acquistato biglietti a pagamento o se l'Organizzatore ha venduto biglietti a pagamento, i dati anagrafici e transazionali verranno conservati per <strong>10 anni</strong> dalla chiusura dell'account, in ottemperanza agli obblighi di conservazione delle scritture contabili (Art. 2220 Codice Civile) e alle normative antiriciclaggio. In caso di richiesta di cancellazione, l'account verrà disattivato ("Soft Delete") ma i dati non saranno rimossi dai database di backup fino al termine del periodo legale.
                </li>
                <li>
                    <strong>Utenti senza Transazioni (Hard Delete):</strong>
                    <br/>
                    Se l'utente ha utilizzato la piattaforma solo per eventi gratuiti e non sussistono obblighi di legge, in caso di richiesta di cancellazione o dopo un periodo di inattività di 24 mesi, i dati personali verranno <strong>cancellati definitivamente</strong> ("Hard Delete") o anonimizzati in modo irreversibile.
                </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Destinatari dei Dati</h2>
            <p>I dati potranno essere comunicati a:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Associazioni Organizzatrici:</strong> Ricevono i dati dei partecipanti ai propri eventi.</li>
                <li><strong>Stripe Inc.:</strong> Provider di servizi di pagamento (USA/EU).</li>
                <li><strong>Cloudinary:</strong> Servizio di hosting immagini.</li>
                <li><strong>Autorità Giudiziarie:</strong> Solo in caso di formale richiesta o per adempiere ad obblighi di legge.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. Trasferimento Dati Extra-UE</h2>
            <p>La Piattaforma utilizza fornitori (es. Stripe) che potrebbero trasferire dati negli Stati Uniti. Tale trasferimento avviene sulla base delle Clausole Contrattuali Standard (SCC) approvate dalla Commissione Europea e del Data Privacy Framework EU-USA.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">7. Diritti dell'Interessato</h2>
            <p>In qualità di interessato, hai il diritto di chiedere a UniParty:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>L'accesso ai tuoi dati personali;</li>
                <li>La rettifica o la cancellazione degli stessi;</li>
                <li>La limitazione del trattamento;</li>
                <li>La portabilità dei dati.</li>
            </ul>
            <p>Per esercitare tali diritti, puoi contattare il DPO/Responsabile Privacy all'indirizzo email: <a href="mailto:uniparty.team@gmail.com" className="text-indigo-600 font-bold hover:underline">uniparty.team@gmail.com</a>.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">8. Cookie</h2>
            <p>Utilizziamo esclusivamente cookie tecnici necessari al funzionamento del sito (autenticazione) e cookie analitici di terze parti (Stripe) per la sicurezza dei pagamenti e la prevenzione frodi. Non utilizziamo cookie di profilazione pubblicitaria.</p>

            <hr className="my-8 border-gray-200" />

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contatti Privacy</h3>
                <p className="mb-1"><strong>Titolare del Trattamento:</strong> [INSERIRE RAGIONE SOCIALE]</p>
                <p className="mb-1"><strong>Indirizzo:</strong> [INSERIRE INDIRIZZO COMPLETO]</p>
                <p><strong>Email Privacy:</strong> uniparty.team@gmail.com</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;