import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';

const Support: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-dark-deep flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/10">
        <div className="bg-indigo-600/20 p-8 text-center border-b border-white/5">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-indigo-500/30">
             <MessageCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Technical Support</h1>
          <p className="text-indigo-300/70 font-medium">We are here to help you</p>
        </div>
        
        <div className="p-8">
          <div className="text-center space-y-6">
            <p className="text-gray-400 leading-relaxed">
              If you are experiencing issues with the platform, tickets, or account management, please contact us directly via email.
            </p>

            <a 
              href="mailto:uniparty.team@gmail.com" 
              className="flex items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all group shadow-inner"
            >
              <div className="mr-4 bg-indigo-600/20 p-3 rounded-full shadow-sm group-hover:scale-110 transition border border-indigo-500/30">
                 <Mail className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Email Us</p>
                <p className="text-lg font-bold text-white">uniparty.team@gmail.com</p>
              </div>
            </a>

            <div className="text-[10px] font-black text-gray-600 mt-4 uppercase tracking-widest">
              Average response time: 24-48 hours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;