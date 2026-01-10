import React from 'react';
import { Scale, ShieldAlert, FileText, CreditCard, AlertCircle, GraduationCap, Gavel, CheckCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-white/5">
        
        {/* HEADER LEGALE */}
        <div className="bg-indigo-950 px-8 py-10 text-white border-b border-white/5">
            <div className="flex items-center mb-4">
                <div className="bg-white/10 p-3 rounded-xl mr-4 backdrop-blur-sm">
                    <Scale className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Termini e Condizioni Generali</h1>
                    <p className="text-indigo-300 text-sm mt-1">Contratto di Servizio Marketplace UniParty</p>
                </div>
            </div>
            <div className="flex justify-between items-end text-xs uppercase tracking-wider font-semibold opacity-50 border-t border-white/10 pt-4 mt-4">
                <span>Versione 1.3</span>
                <span>Ultimo aggiornamento: 05 Dicembre 2025</span>
            </div>
        </div>

        <div className="p-8 md:p-12 space-y-10 text-gray-400 leading-relaxed">

            {/* DISCLAIMER */}
            <div className="bg-orange-900/10 border-l-4 border-orange-500 p-6 rounded-r-lg shadow-sm flex items-start">
                <ShieldAlert className="w-6 h-6 text-orange-500 mr-4 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-orange-200 font-bold text-lg mb-2">Avvertenza Preliminare Importante</h4>
                    <p className="text-sm text-orange-200/70">
                        UniParty agisce esclusivamente come <strong>fornitore di servizi tecnologici (Intermediario)</strong>. 
                        Non siamo gli organizzatori degli eventi. Quando acquisti un Voucher, instauri un rapporto contrattuale diretto con l'Associazione organizzatrice.
                    </p>
                </div>
            </div>

            {/* ARTICOLO 1 */}
            <section>
                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-400" />
                    Art. 1 - Definizioni
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>"Piattaforma"</strong>: l'applicazione web gestita dal Fornitore Tecnologico.</li>
                    <li><strong>"Organizzatore"</strong>: l'ente terzo autonomo che promuove l'Evento.</li>
                    <li><strong>"Voucher"</strong>: il titolo digitale (QR Code) che funge da ricevuta di prenotazione.</li>
                    <li><strong>"Fee di Servizio"</strong>: la commissione trattenuta per l'utilizzo della tecnologia.</li>
                </ul>
            </section>

            {/* ARTICOLO 4 */}
            <section className="bg-gray-900/50 p-6 rounded-xl border border-white/5">
                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-indigo-400" />
                    Art. 4 - Pagamenti e Politica "No Refund"
                </h3>
                <div className="space-y-4 text-sm">
                    <p>
                        <strong>4.1. Direct Charge:</strong> I pagamenti sono elaborati tramite <em>Stripe Connect</em> direttamente all'account dell'Organizzatore.
                    </p>
                    <p className="bg-red-900/20 p-3 rounded border-l-4 border-red-600 text-red-200">
                        <strong>4.3. Non Rimborsabilità della Fee:</strong> La Fee di Servizio remunera l'attività tecnologica di generazione del Voucher. <strong>La Fee di Servizio non è mai rimborsabile</strong>.
                    </p>
                </div>
            </section>

            {/* UGC SECTION */}
            <section className="bg-red-900/10 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm">
                <h3 className="text-xl font-bold text-red-400 border-b border-white/10 pb-2 mb-4 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-red-600" />
                    Sicurezza e Contenuti (UGC)
                </h3>
                <p className="text-sm text-red-200/80">
                    UniParty adotta una <strong>politica di tolleranza zero</strong> nei confronti di contenuti illegali o offensivi. Moderazione garantita entro 24 ore.
                </p>
            </section>

            {/* ARTICOLO 8 */}
            <section>
                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-indigo-400" />
                    Art. 8 - Limitazione di Responsabilità
                </h3>
                <p className="text-sm">UniParty non è responsabile per la sicurezza, liceità o svolgimento dell'evento, né per rimborsi del prezzo del biglietto (carico dell'Organizzatore).</p>
            </section>

            <div className="border-t border-white/10 pt-8 mt-12">
                <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-xs text-gray-500 italic">
                            Ai sensi degli artt. 1341 e 1342 c.c., l'Utente approva specificamente le pattuizioni su Ruolo Intermediario, Non Rimborsabilità Fee, Esclusione Recesso e Limitazione Responsabilità.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <Link to="/" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors flex items-center underline">
                     Torna alla Home
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;