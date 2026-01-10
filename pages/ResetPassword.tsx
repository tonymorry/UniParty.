import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isValidPassword = (password: string) => {
    if (password.length < 6) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
        setError("Token mancante.");
        return;
    }

    if (!isValidPassword(password)) {
        setError("La password deve essere di almeno 6 caratteri e contenere: 1 maiuscola, 1 numero e 1 carattere speciale.");
        return;
    }

    setLoading(true);
    try {
        await api.auth.resetPassword(token, password);
        setSuccess(true);
        setTimeout(() => {
            navigate('/auth');
        }, 3000);
    } catch (err: any) {
        setError(err.message || "Errore durante il reset della password.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-dark-deep px-4">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-10 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Lock className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter">New Password</h2>
            <p className="text-gray-500 mt-2 font-medium">Inserisci la tua nuova password.</p>
        </div>

        {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm text-center border border-red-500/20 shadow-inner">
                {error}
            </div>
        )}

        {success ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-5">
                    <CheckCircle className="w-16 h-16 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Password Aggiornata!</h3>
                <p className="text-gray-400 mb-6">Verrai reindirizzato al login a breve...</p>
                <button 
                    onClick={() => navigate('/auth')}
                    className="text-indigo-400 font-black uppercase tracking-widest text-xs hover:text-white transition-all underline"
                >
                    Vai al Login subito
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Nuova Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-white pr-12 shadow-inner transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Min. 6 chars, 1 Up, 1 Num..."
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                    {loading ? 'Salvataggio...' : 'Salva Nuova Password'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;