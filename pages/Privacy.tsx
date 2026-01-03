import React from 'react';
import { Shield, ShieldCheck } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12 border border-gray-700">
        <div className="flex items-center mb-8 border-b border-gray-700 pb-6">
            <Shield className="w-10 h-10 text-indigo-500 mr-4" />
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert max-w-none text-gray-400 space-y-6 text-sm md:text-base">
            <p className="font-semibold text-white">
                Informativa ai sensi del GDPR. Ultimo aggiornamento: 05 Dicembre 2025
            </p>
            <p>La presente informativa descrive come UniParty tratta i tuoi dati personali.</p>

            <h2 className="text-xl font-bold text-white mt-8">Conservazione dei Dati</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Transazioni a Pagamento:</strong> Conservazione per 10 anni (obblighi fiscali).</li>
                <li><strong>Eventi Gratuiti:</strong> Cancellazione definitiva su richiesta.</li>
            </ul>

            <section className="bg-red-950/20 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm mt-8">
                <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2" /> Sicurezza e UGC
                </h3>
                <p className="text-sm text-red-200/80">UniParty adotta tolleranza zero per abusi e contenuti inappropriati.</p>
            </section>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 text-sm mt-8">
                <p>Email Privacy: <strong>uniparty.team@gmail.com</strong></p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;