import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENTE);
  const [error, setError] = useState('');

  // Consent State
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Validation Helpers
  const isValidEmail = (email: string) => {
    // Simple but effective email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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

    // 1. Basic Empty Check
    if (!email || !password) {
        setError("Please fill in all fields");
        return;
    }

    // 2. Email Format Validation
    if (!isValidEmail(email)) {
        setError("Please enter a valid real email address.");
        return;
    }

    // 3. Password Complexity Check (Only on Register)
    if (!isLogin) {
        if (!isValidPassword(password)) {
            setError("Password must be at least 6 characters long and contain at least: 1 uppercase letter, 1 number, and 1 special character.");
            return;
        }

        // 4. Terms Acceptance Check
        if (!acceptedTerms) {
            setError("Devi accettare i Termini e Condizioni e la Privacy Policy per registrarti.");
            return;
        }
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          email,
          password, // Note: In real app, this goes to backend to be hashed
          name,
          role,
          ...(role === UserRole.STUDENTE ? { surname } : { description })
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const toggleMode = () => {
      setIsLogin(!isLogin);
      setError('');
      setAcceptedTerms(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-8">
            <h2 className="text-3xl font-bold text-center text-indigo-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Join UniParty'}
            </h2>
            <p className="text-center text-gray-500 mb-8">
              {isLogin ? 'Login to access your tickets' : 'Create an account to start partying'}
            </p>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === UserRole.STUDENTE ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}
                    onClick={() => setRole(UserRole.STUDENTE)}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === UserRole.ASSOCIAZIONE ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}
                    onClick={() => setRole(UserRole.ASSOCIAZIONE)}
                  >
                    Association
                  </button>
                </div>
              )}

              {!isLogin && (
                  <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name {role === UserRole.ASSOCIAZIONE ? '(Organization)' : ''}</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    {role === UserRole.STUDENTE && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    {role === UserRole.ASSOCIAZIONE && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                required
                            />
                        </div>
                    )}
                  </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {!isLogin && (
                    <p className="text-xs text-gray-400 mt-1">
                        Min. 6 chars, 1 uppercase, 1 number, 1 special char.
                    </p>
                )}
              </div>

              {/* GDPR CONSENT CHECKBOX (Register Only) */}
              {!isLogin && (
                  <div className="flex items-start mt-4">
                      <div className="flex items-center h-5">
                          <input
                              id="terms"
                              name="terms"
                              type="checkbox"
                              checked={acceptedTerms}
                              onChange={(e) => setAcceptedTerms(e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                              required
                          />
                      </div>
                      <div className="ml-3 text-sm">
                          <label htmlFor="terms" className="font-medium text-gray-700">
                              Ho letto e accetto i <Link to="/terms" className="text-indigo-600 hover:underline">Termini e Condizioni</Link> e la <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                          </label>
                      </div>
                  </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (!isLogin && !acceptedTerms)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
              </button>
            </form>
        </div>
        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
            <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                    onClick={toggleMode}
                    className="text-indigo-600 font-semibold hover:underline"
                >
                    {isLogin ? 'Register' : 'Login'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;