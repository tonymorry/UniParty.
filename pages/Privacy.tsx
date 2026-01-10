import React from 'react';
import { Shield, ShieldCheck } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-deep py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12 border border-white/10">
        <div className="flex items-center mb-10 border-b border-white/5 pb-8">
            <div className="bg-indigo-600/20 p-4 rounded-2xl mr-5 border border-indigo-500/20">
                <Shield className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert max-w-none text-gray-400 space-y-8 text-sm md:text-base leading-relaxed">
            <p className="font-black text-indigo-400 uppercase tracking-widest text-xs">
                Informativa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR)
                <br />
                Ultimo aggiornamento: 05 Dicembre 2025
            </p>
            
            <p className="text-lg font-medium text-gray-300">
                La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che consultano e utilizzano la piattaforma web <span className="text-white font-bold">UniParty</span>.
            </p>

            <section>
                <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tight">1. Titolari del Trattamento</h2>
                <p>Per la natura di "Marketplace" della Piattaforma, è necessario distinguere due figure:</p>
                <ul className="space-y-4 mt-4">
                    <li className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <strong className="text-indigo-400 block mb-1">UniParty (Gestore della Piattaforma):</strong> Agisce come <strong>Titolare del Trattamento</strong> per i dati relativi alla registrazione dell'account, alla sicurezza della piattaforma, all'assistenza tecnica e alla gestione delle transazioni.
                    </li>
                    <li className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <strong className="text-indigo-400 block mb-1">Associazione/Organizzatore:</strong> Agisce come <strong>Titolare Autonomo del Trattamento</strong> per i dati relativi alla partecipazione allo specifico evento (es. liste ingressi, nominativi, dati accademici).
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tight">2. Tipologia di Dati Trattati</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: "Account", desc: "Nome, Cognome, Email, Password (Hash)" },
                        { label: "Navigazione", desc: "Indirizzi IP, Log di sistema tecnici" },
                        { label: "Accademici", desc: "Numero di Matricola e Corso di Studi" },
                        { label: "Pagamenti", desc: "Gestiti interamente da Stripe Inc." }
                    ].map((item, i) => (
                        <div key={i} className="border border-white/5 p-4 rounded-xl bg-white/5 shadow-inner">
                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">{item.label}</h4>
                            <p className="text-gray-300">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <hr className="border-white/5 my-10" />

            <section className="bg-red-500/10 border-l-4 border-red-500 p-8 rounded-r-2xl shadow-2xl mb-8">
                <h3 className="text-lg font-black text-red-400 mb-4 flex items-center uppercase tracking-wider">
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Sicurezza e Moderazione (UGC)
                </h3>
                <div className="space-y-4 text-sm text-red-200/80 leading-relaxed">
                    <p>
                        UniParty adotta una <strong>politica di tolleranza zero</strong> nei confronti di contenuti illegali, offensivi, abusivi o discutibili pubblicati sulla piattaforma.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Segnalazione:</strong> Ogni utente può segnalare in tempo reale contenuti inappropriati.</li>
                        <li><strong>Moderazione:</strong> Revisione garantita entro 24 ore.</li>
                        <li><strong>Espulsione:</strong> Ban permanente per violazioni sistematiche.</li>
                    </ul>
                </div>
            </section>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-sm shadow-inner">
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tight">Contatti Privacy</h3>
                <p className="mb-2 text-gray-300"><strong>Email DPO:</strong> <span className="text-indigo-400">uniparty.team@gmail.com</span></p>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">© UniParty Legal Dept.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;