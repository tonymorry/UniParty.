import React from 'react';
import { Scale, ShieldAlert, FileText, CreditCard, AlertCircle, GraduationCap, Gavel, CheckCircle, Info, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* HEADER LEGALE */}
        <div className="bg-indigo-900 px-8 py-10 text-white">
            <div className="flex items-center mb-4">
                <div className="bg-white/10 p-3 rounded-xl mr-4 backdrop-blur-sm">
                    <Scale className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Termini e Condizioni Generali</h1>
                    <p className="text-indigo-200 text-sm mt-1">Versione 1.3 - Moderazione UGC Inclusa</p>
                </div>
            </div>
        </div>

        <div className="p-8 md:p-12 space-y-10 text-gray-700 leading-relaxed text-justify">

            {/* UGC SECTION - MANDATORY FOR APP STORES */}
            <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-sm">
                <h3 className="text-red-900 font-bold text-xl mb-3 flex items-center">
                    <Lock className="w-6 h-6 mr-2" /> Contenuti Generati dagli Utenti (UGC) e Policy Anti-Abuso
                </h3>
                <div className="space-y-3 text-sm text-red-800">
                    <p>
                        UniParty adotta una <strong>politica di tolleranza zero</strong> verso contenuti discutibili o utenti abusivi.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Segnalazione:</strong> Gli utenti possono segnalare in qualsiasi momento eventi o profili che violano le linee guida tramite il pulsante "Segnala" presente in ogni evento.</li>
                        <li><strong>Moderazione:</strong> UniParty si impegna a revisionare ogni segnalazione entro 24 ore. I contenuti che violano i termini (inclusi contenuti offensivi, illegali, fraudolenti o discriminatori) verranno rimossi immediatamente.</li>
                        <li><strong>Provvedimenti:</strong> Gli utenti (associazioni o studenti) che pubblicano ripetutamente contenuti inappropriati verranno bannati permanentemente dalla piattaforma senza preavviso.</li>
                    </ul>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-900 border-b-2 border-indigo-100 pb-2 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                    Art. 1 - Definizioni
                </h3>
                <p className="text-sm">UniParty è un Marketplace per la vendita di voucher eventi universitari. Agisce come intermediario tecnologico tra Organizzatori e Utenti.</p>
            </section>

            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                    Art. 4 - Pagamenti e Politica "No Refund" sulla Fee
                </h3>
                <p className="text-sm">La Fee di Servizio (€0,40) remunera l'attività tecnologica ed è non rimborsabile una volta emesso il voucher. Il rimborso del biglietto è a esclusivo carico dell'Organizzatore.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-900 border-b-2 border-indigo-100 pb-2 mb-4">
                    Art. 6 - Annullamento Eventi
                </h3>
                <p className="text-sm">In caso di annullamento, la responsabilità del rimborso ricade sull'Organizzatore. UniParty fornisce gli strumenti tecnici per la gestione ma non detiene i fondi dei biglietti.</p>
            </section>

            <div className="flex justify-center mt-8">
                <Link to="/" className="text-indigo-600 font-bold hover:underline">Torna alla Home</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;