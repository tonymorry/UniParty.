import React from 'react';
import { FileText, Link as LinkIcon } from 'lucide-react';
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
                <p className="text-sm text-yellow-800 font-semibold m-0">
                    Nota Bene: UniParty agisce esclusivamente come fornitore tecnologico. Il contratto di vendita dell'ingresso si perfeziona tra l'Utente e l'Organizzatore dell'evento.
                </p>
            </div>

            <p className="font-semibold text-gray-900">
                Ultimo aggiornamento: 27 Novembre 2025
            </p>
            
            <p>
                Benvenuto su <strong>UniParty</strong>. L'utilizzo della piattaforma e dei servizi offerti implica l'accettazione integrale dei presenti Termini e Condizioni. Ti invitiamo a leggerli attentamente.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">1. Definizioni</h2>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Piattaforma:</strong> Il sito web e l'applicazione UniParty.</li>
                <li><strong>Organizzatore:</strong> L'Associazione studentesca o ente terzo che promuove l'evento.</li>
                <li><strong>Utente:</strong> Lo studente o persona che prenota l'accesso all'evento.</li>
                <li><strong>Voucher:</strong> Il codice QR generato dalla Piattaforma a seguito del pagamento.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">2. Ruolo di UniParty (Mandato all'incasso)</h2>
            <p>
                UniParty fornisce all'Organizzatore una piattaforma tecnologica per la gestione delle prenotazioni e la riscossione dei pagamenti.
                UniParty agisce in qualità di <strong>mandatario all'incasso</strong> in nome e per conto dell'Organizzatore.
                Ciò significa che:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>UniParty <strong>NON è il venditore</strong> del servizio di intrattenimento/spettacolo.</li>
                <li>UniParty <strong>NON è responsabile</strong> dell'organizzazione, della sicurezza o dello svolgimento dell'evento.</li>
                <li>Il pagamento effettuato dall'Utente sulla Piattaforma estingue il debito nei confronti dell'Organizzatore per l'importo versato.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">3. Natura del Voucher e Titolo Fiscale (SIAE)</h2>
            <p>
                Il <strong>Voucher (QR Code)</strong> emesso da UniParty costituisce esclusivamente una <strong>ricevuta di prenotazione</strong> e di avvenuto pagamento.
            </p>
            <p className="font-bold">
                Il Voucher NON costituisce Titolo di Accesso valido ai fini fiscali (Biglietto SIAE).
            </p>
            <p>
                È responsabilità esclusiva dell'Organizzatore (e del gestore del locale ove si svolge l'evento) emettere il regolare titolo fiscale (scontrino, biglietto SIAE o equivalente) al momento della presentazione del Voucher all'ingresso, conformemente alla normativa vigente sugli spettacoli e intrattenimenti.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">4. Prezzi e Commissioni</h2>
            <p>
                Il prezzo totale pagato dall'Utente comprende:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>La quota di partecipazione stabilita dall'Organizzatore.</li>
                <li>La commissione di servizio (Fee) di UniParty (€0,40 IVA inclusa, ove applicabile) per l'utilizzo della piattaforma.</li>
            </ul>
            <p>
                La commissione di servizio non è rimborsabile, salvo in caso di annullamento dell'evento per colpa imputabile direttamente alla Piattaforma.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">5. Rimborsi e Annullamento Eventi</h2>
            <p>
                In caso di annullamento, rinvio o modifica sostanziale dell'evento, la responsabilità del rimborso ricade esclusivamente sull'<strong>Organizzatore</strong>.
                UniParty, in qualità di intermediario tecnico, potrà processare i rimborsi solo su esplicita autorizzazione e disponibilità fondi dell'Organizzatore.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8">6. Limitazione di Responsabilità</h2>
            <p>
                UniParty non potrà essere ritenuta responsabile per:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Cancellazione o modifica degli eventi da parte degli Organizzatori.</li>
                <li>Mancato ingresso dovuto al rifiuto da parte del locale (es. selezione all'ingresso, stato di ebbrezza, capienza raggiunta se non gestita correttamente dall'Organizzatore).</li>
                <li>Mancata emissione del titolo fiscale da parte dell'Organizzatore/Locale.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8">7. Contatti e Reclami</h2>
            <p>
                Per problemi tecnici relativi all'App o ai pagamenti, contatta il nostro supporto. Per questioni relative all'evento (orari, rimborsi, info), contatta direttamente l'Associazione organizzatrice tramite i link presenti nel loro profilo.
            </p>

            <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
                <p><strong>Dati Societari:</strong></p>
                <p>UniParty (Associazione / Startup in costituzione)</p>
                <p>Indirizzo: Via Università, Roma (RM) - [INSERIRE INDIRIZZO REALE]</p>
                <p>Email: uniparty.team@gmail.com</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;