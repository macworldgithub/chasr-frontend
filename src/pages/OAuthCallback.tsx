import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const HOME_URL = 'http://localhost:5173/';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your connection...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error || errorDescription) {
      setStatus('error');
      setMessage(errorDescription || 'Xero authorization failed or was cancelled.');
      return;
    }

    if (code && state) {
      setStatus('success');
      setMessage('✅ Xero connected successfully!');
      return;
    }

    setStatus('error');
    setMessage('No valid OAuth callback data was received.');
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    const timer = window.setTimeout(() => {
      window.location.href = HOME_URL;
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [status]);

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] px-6">
      <div className="w-full max-w-lg rounded-3xl border border-dark-border bg-[#111827]/80 p-8 shadow-2xl text-center">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
            isSuccess ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
          }`}
        >
          {isSuccess ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </div>

        <h1 className="text-2xl font-extrabold text-white">
          {isSuccess ? 'Connection complete' : 'Connection error'}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = HOME_URL;
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white shadow-glow-cyan transition hover:opacity-90"
          >
            Go to Home
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          Redirecting to the home page in a few seconds...
        </p>
      </div>
    </div>
  );
};
