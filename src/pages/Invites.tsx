import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  Copy,
  Check,
  Trash2,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { invitesApi } from '../api/client';
import { Invite, Provider } from '../types';

export const Invites: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [provider, setProvider] = useState<Provider>('xero');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const data = await invitesApi.listInvites();
      setInvites(data);
    } catch (err) {
      console.error('Failed to fetch invites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await invitesApi.createInvite(provider, inviteeEmail.trim() || undefined);
      setInviteeEmail('');
      fetchInvites();
    } catch (err: any) {
      alert(`Invite Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this invite link?')) return;
    try {
      await invitesApi.revokeInvite(id);
      fetchInvites();
    } catch (err: any) {
      alert(`Revoke Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/redeem/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Client & Bookkeeper Invites</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Generate secure single-use links for external clients to connect accounting ledgers
          </p>
        </div>
        <button
          onClick={fetchInvites}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Invites</span>
        </button>
      </div>

      {/* Invite Generation Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-dark-border">
        <h2 className="text-sm sm:text-base font-bold text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-cyan-400" />
          Generate External Integration Link
        </h2>

        <form onSubmit={handleCreateInvite} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500 capitalize"
            >
              <option value="xero">Xero OAuth</option>
              <option value="myob">MYOB OAuth</option>
              <option value="quickbooks">QuickBooks OAuth</option>
              <option value="csv">CSV Upload</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Invitee Email (Optional)
            </label>
            <input
              type="email"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
              placeholder="bookkeeper@client.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-semibold text-xs hover:opacity-90 transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50 sm:col-span-2 lg:col-span-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isCreating ? 'Generating...' : 'Create Invite Link'}</span>
          </button>
        </form>
      </div>

      {/* Invites Data Table */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-dark-border space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          Active Invite Tokens ({invites.length})
        </h2>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading invites...</div>
        ) : invites.length === 0 ? (
          <div className="py-8 sm:py-10 px-4 text-center text-xs text-slate-400 font-mono border border-dashed border-dark-border rounded-xl">
            No invite tokens generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-dark-border text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Provider</th>
                    <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Invitee Email</th>
                    <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Token</th>
                    <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Status</th>
                    <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Expires</th>
                    <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/60 text-slate-200 font-sans">
                  {invites.map((inv) => (
                    <tr key={inv._id} className="hover:bg-dark-hover/50 transition-colors">
                      <td className="py-3.5 sm:py-4 px-3 sm:px-4 font-semibold capitalize whitespace-nowrap">{inv.provider}</td>
                      <td className="py-3.5 sm:py-4 px-3 sm:px-4 font-mono text-slate-400 whitespace-nowrap">
                        {inv.inviteeEmail || <span className="italic text-slate-600">Any recipient</span>}
                      </td>
                      <td className="py-3.5 sm:py-4 px-3 sm:px-4 font-mono text-cyan-300 whitespace-nowrap">
                        {inv.token.slice(0, 16)}...
                      </td>
                      <td className="py-3.5 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                            inv.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : inv.status === 'consumed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 sm:py-4 px-3 sm:px-4 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 sm:py-4 px-3 sm:px-4 text-right space-x-1.5 sm:space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => copyInviteLink(inv.token)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border text-slate-200 hover:text-cyan-400 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                        >
                          {copiedToken === inv.token ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-cyan-400" /> <span>Share Link</span>
                            </>
                          )}
                        </button>

                        {inv.status === 'pending' && (
                          <button
                            onClick={() => handleRevokeInvite(inv._id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all inline-flex items-center justify-center"
                            title="Revoke Token"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
