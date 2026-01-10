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
    // At least 6 chars
    if (password.length < 6) return false;
    // At least 1 uppercase
    if (!/[A-Z]/.test(password)) return false;
    // At least 1 number
    if (!/[0-9]/.test(password)) return false;
    // At least 1 special character
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#020617] px-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-8 border border-white/5">
        <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Lock className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Reimposta Password</h2>
            <p className="text-gray-400 mt-2 text-sm">Inserisci la tua nuova password.</p>
        </div>

        {error && (
            <div className="bg-red-900/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/20">
                {error}
            </div>
        )}

        {success ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Password Aggiornata!</h3>
                <p className="text-gray-400 mb-4 text-sm">Verrai reindirizzato al login a breve...</p>
                <button 
                    onClick={() => navigate('/auth')}
                    className="text-indigo-400 font-semibold hover:text-indigo-300 underline"
                >
                    Vai al Login subito
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nuova Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Inserisci nuova password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                        Min. 6 caratteri, 1 maiuscola, 1 numero, 1 speciale.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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