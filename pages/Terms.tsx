import React from 'react';
import { Scale, ShieldAlert, FileText, CreditCard, AlertCircle, GraduationCap, Gavel, CheckCircle, Info, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
        
        <div className="bg-indigo-950 px-8 py-10 text-white border-b border-indigo-900/50">
            <div className="flex items-center mb-4">
                <div className="bg-white/10 p-3 rounded-xl mr-4 backdrop-blur-sm">
                    <Scale className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Termini e Condizioni</h1>
                    <p className="text-indigo-300 text-sm mt-1">Contratto di Servizio Marketplace</p>
                </div>
            </div>
            <div className="flex justify-between items-end text-xs uppercase tracking-wider font-semibold opacity-70 border-t border-indigo-900/50 pt-4 mt-4">
                <span>Versione 1.3</span>
                <span>Ultimo aggiornamento: 05 Dicembre 2025</span>
            </div>
        </div>

        <div className="p-8 md:p-12 space-y-10 text-gray-300 leading-relaxed text-justify">
            <div className="bg-amber-900/20 border-l-4 border-amber-600 p-6 rounded-r-lg shadow-sm flex items-start">
                <ShieldAlert className="w-6 h-6 text-amber-500 mr-4 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-amber-400 font-bold text-lg mb-2">Avvertenza Importante</h4>
                    <p className="text-sm text-amber-200/80">
                        UniParty agisce come intermediario tecnologico. Non siamo gli organizzatori. Il rapporto contrattuale del biglietto è con l'Associazione.
                    </p>
                </div>
            </div>

            <section>
                <h3 className="text-xl font-bold text-white border-b-2 border-indigo-900/50 pb-2 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                    Art. 1 - Definizioni
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>"Piattaforma"</strong>: l'applicazione web UniParty.</li>
                    <li><strong>"Organizzatore"</strong>: l'associazione terza che promuove l'evento.</li>
                    <li><strong>"Utente"</strong>: chi acquista servizi tramite la piattaforma.</li>
                </ul>
            </section>

            <section className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white border-b-2 border-gray-700 pb-2 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-indigo-500" />
                    Art. 4 - Pagamenti e Fee
                </h3>
                <p className="text-sm">La Fee di Servizio (€0,40) remunera l'attività tecnologica e <strong>non è mai rimborsabile</strong>.</p>
            </section>

            <section className="bg-red-950/20 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm">
                <h3 className="text-xl font-bold text-red-400 border-b border-red-900/50 pb-2 mb-4 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Politica UGC
                </h3>
                <p className="text-sm text-red-200/80">Tolleranza zero per contenuti illegali o offensivi. Segnalazione rapida e rimozione immediata.</p>
            </section>

            <div className="flex justify-center mt-8">
                <Link to="/" className="text-indigo-400 font-bold hover:underline">Torna alla Home</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;