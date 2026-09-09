import React, { useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import { integrationsApi } from '../api/client';
import { Provider, AuthMethod } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
  onSuccess: () => void;
}

export const CredentialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  provider,
  onSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('api_key');
  const [apiKey, setApiKey] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const credentials: Record<string, string> = {};
    if (apiKey) credentials.apiKey = apiKey;
    if (tenantId) credentials.tenantId = tenantId;
    if (clientSecret) credentials.clientSecret = clientSecret;

    try {
      await integrationsApi.createCredentialConnection(provider, authMethod, credentials);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel border border-dark-border rounded-2xl w-full max-w-lg p-6 shadow-glass relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white capitalize">
              Connect {provider} (Manual Credential)
            </h3>
            <p className="text-xs text-slate-400">Store API Key or OAuth Secret securely in Chasr Vault</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Authentication Method
            </label>
            <select
              value={authMethod}
              onChange={(e) => setAuthMethod(e.target.value as AuthMethod)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="api_key">API Key / Token</option>
              <option value="credential">Client ID & Secret</option>
              <option value="oauth2">Pre-generated OAuth2 Token</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              API Key / Access Token
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. sk_live_992x..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tenant ID / Organization ID (Optional)
            </label>
            <input
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="e.g. tenant-8849-ab"
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {authMethod === 'credential' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Client Secret
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Secret key"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !apiKey}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 shadow-glow-cyan"
            >
              {isSubmitting ? 'Saving...' : 'Save & Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
