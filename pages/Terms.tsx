import React from 'react';
import { Scale, ShieldAlert, FileText, CreditCard, AlertCircle, GraduationCap, Gavel, CheckCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-deep py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* HEADER LEGALE */}
        <div className="bg-indigo-600/20 px-8 py-12 text-white border-b border-white/5">
            <div className="flex items-center mb-6">
                <div className="bg-indigo-500/20 p-4 rounded-2xl mr-5 backdrop-blur-sm border border-indigo-500/30 shadow-lg">
                    <Scale className="w-10 h-10 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Termini e Condizioni</h1>
                    <p className="text-indigo-300/60 text-sm font-black uppercase tracking-widest mt-1">Contratto di Servizio UniParty</p>
                </div>
            </div>
            <div className="flex justify-between items-end text-[10px] uppercase tracking-[0.3em] font-black opacity-40 border-t border-white/5 pt-6 mt-6">
                <span>Versione 1.3</span>
                <span>Ultimo aggiornamento: 05 Dicembre 2025</span>
            </div>
        </div>

        <div className="p-8 md:p-12 space-y-12 text-gray-400 leading-relaxed">

            {/* DISCLAIMER */}
            <div className="bg-orange-500/10 border-l-4 border-orange-500 p-8 rounded-r-2xl shadow-inner flex items-start">
                <ShieldAlert className="w-6 h-6 text-orange-400 mr-5 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-orange-400 font-black text-lg mb-2 uppercase tracking-tight">Avvertenza Preliminare</h4>
                    <p className="text-sm text-orange-200/70">
                        UniParty agisce esclusivamente come <strong>fornitore di servizi tecnologici</strong>. 
                        Non siamo gli organizzatori degli eventi. Quando acquisti un Voucher, instauri un rapporto contrattuale diretto con l'Associazione.
                    </p>
                </div>
            </div>

            {/* ARTICOLO 1 */}
            <section>
                <h3 className="text-xl font-black text-white border-b border-white/5 pb-4 mb-6 flex items-center uppercase tracking-tight">
                    <FileText className="w-5 h-5 mr-3 text-indigo-400" />
                    Art. 1 - Definizioni
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                        { t: "Piattaforma", d: "L'applicazione web gestita dal Fornitore Tecnologico." },
                        { t: "Organizzatore", d: "L'ente terzo autonomo che promuove l'Evento." },
                        { t: "Voucher", d: "Il titolo digitale (QR Code) che funge da prenotazione." },
                        { t: "Fee", d: "La commissione per l'utilizzo della tecnologia." }
                    ].map((item, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                            <strong className="text-indigo-400 block mb-1">{item.t}</strong>
                            {item.d}
                        </div>
                    ))}
                </div>
            </section>

            {/* ARTICOLO 4 */}
            <section className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-inner">
                <h3 className="text-xl font-black text-white border-b border-white/5 pb-4 mb-6 flex items-center uppercase tracking-tight">
                    <CreditCard className="w-5 h-5 mr-3 text-indigo-400" />
                    Art. 4 - Pagamenti e "No Refund"
                </h3>
                <div className="space-y-4 text-sm">
                    <p>
                        <strong>4.1. Stripe Connect:</strong> Importo trasferito <strong>direttamente</strong> all'Organizzatore.
                    </p>
                    <p className="bg-red-500/10 p-5 rounded-xl border border-red-500/20 text-red-200">
                        <strong>4.3. Non Rimborsabilità della Fee:</strong> La Fee di Servizio remunera l'attività tecnologica di generazione Voucher. <strong>Non è mai rimborsabile</strong>.
                    </p>
                </div>
            </section>

            {/* UGC SECTION */}
            <section className="bg-red-500/10 border-l-4 border-red-500 p-8 rounded-r-2xl shadow-inner">
                <h3 className="text-xl font-black text-red-400 mb-6 flex items-center uppercase tracking-tight">
                    <ShieldCheck className="w-5 h-5 mr-3" />
                    Sicurezza e UGC
                </h3>
                <p className="text-sm text-red-200/70">
                    UniParty adotta una <strong>politica di tolleranza zero</strong> nei confronti di contenuti illegali o offensivi. Moderazione entro 24 ore.
                </p>
            </section>

            <div className="border-t border-white/5 pt-10 mt-12">
                <div className="flex items-start bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10 shadow-inner">
                    <CheckCircle className="w-6 h-6 text-indigo-400 mr-5 flex-shrink-0 mt-1" />
                    <p className="text-xs text-gray-500 italic font-medium leading-relaxed">
                        Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c., l'Utente dichiara di aver letto e di approvare specificamente le clausole limitative della responsabilità e sulla giurisdizione.
                    </p>
                </div>
            </div>

            <div className="flex justify-center mt-10">
                <Link to="/" className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs hover:text-white transition-all bg-white/5 px-8 py-4 rounded-full border border-white/10 hover:bg-white/10 shadow-lg">
                     Torna alla Home
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;