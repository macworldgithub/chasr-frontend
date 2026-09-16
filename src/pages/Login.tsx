import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, User, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-glow-indigo">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Welcome back</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Sign in to your Chasr integration console</p>
        </div>

        {/* Card */}
        <div className="glass-panel border border-dark-border/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-glass">
          {error && (
            <div className="p-3 sm:p-3.5 mb-5 sm:mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-glow-cyan flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              Create Organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
