import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-6">
            <FileText className="w-10 h-10 text-indigo-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Termini e Condizioni del Servizio</h1>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-yellow-800 font-semibold m-0 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>Nota Bene: UniParty agisce esclusivamente come fornitore tecnologico. Il contratto di vendita o partecipazione si perfeziona tra l'Utente e l'Organizzatore dell'evento.</span>
                </p>
            </div>

            <p className="font-semibold text-gray-900">
                Ultimo aggiornamento: 02 Dicembre 2025
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Oggetto del Servizio</h2>
            <p>
                UniParty fornisce una piattaforma per la prenotazione di eventi universitari (party, seminari, conferenze) e la gestione dei relativi accessi tramite tecnologia QR Code.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Ruolo di UniParty e dell'Organizzatore</h2>
            <p>
                UniParty agisce come <strong>mandatario all'incasso</strong> per conto dell'Organizzatore (Associazione). 
                UniParty incassa le somme versate dall'Utente e le trasferisce all'Organizzatore (al netto delle commissioni), il quale rimane l'unico responsabile dell'evento, della sua sicurezza e della conformità fiscale (emissione biglietti SIAE/Titoli fiscali).
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Seminari e Rilevazione Presenze</h2>
            <p>
                Per eventi di tipo accademico o seminariale, la piattaforma può richiedere:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Numero di Matricola:</strong> L'Utente è responsabile della correttezza del numero inserito. UniParty non verifica la veridicità della matricola.</li>
                <li><strong>Scansione Ingresso e Uscita:</strong> Per ottenere la validazione della presenza, l'Utente è tenuto a far scansionare il proprio QR Code sia all'arrivo ("Check-in") che all'abbandono della sala ("Check-out"). La mancata scansione dell'uscita potrebbe invalidare la presenza ai fini dell'attribuzione di crediti o attestati.</li>
            </ul>
            <p className="text-sm italic">
                Nota: L'attribuzione effettiva di CFU o vantaggi accademici è a discrezione esclusiva dell'Ente Organizzatore/Ateneo e non dipende da UniParty.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Prezzi e Commissioni</h2>
            <p>
                Il prezzo finale comprende il costo del biglietto (deciso dall'Organizzatore) e la commissione di servizio (Fee) di UniParty pari a <strong>€0,40</strong> (IVA inclusa).
                <br />
                Per gli <strong>eventi gratuiti</strong>, non viene applicata alcuna commissione.
                <br />
                La commissione di servizio non è rimborsabile.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Annullamenti e Rimborsi</h2>
            <p>
                In caso di annullamento dell'evento, la responsabilità del rimborso del prezzo del biglietto ricade sull'Organizzatore. UniParty potrà facilitare tecnicamente il rimborso solo su autorizzazione dell'Organizzatore e disponibilità dei fondi sul conto connesso Stripe.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. Limitazione di Responsabilità</h2>
            <p>
                UniParty non è responsabile per:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Qualità o svolgimento dell'evento.</li>
                <li>Mancato riconoscimento di crediti formativi dovuto a errori nell'inserimento della matricola o mancate scansioni.</li>
                <li>Rifiuto dell'ingresso da parte del locale/organizzazione (es. capienza raggiunta, selezione all'ingresso).</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">7. Contatti</h2>
            <p>
                Per assistenza tecnica: <a href="mailto:uniparty.team@gmail.com" className="text-indigo-600 hover:underline">uniparty.team@gmail.com</a>.
                Per informazioni sugli eventi, contattare direttamente l'Associazione organizzatrice.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;