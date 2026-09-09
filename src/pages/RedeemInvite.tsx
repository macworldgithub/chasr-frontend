import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, ExternalLink, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { invitesApi } from '../api/client';
import { Provider } from '../types';

export const RedeemInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [inviteInfo, setInviteInfo] = useState<{
    provider: Provider;
    inviterEmail: string;
    inviteeEmail?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!token) return;
    invitesApi
      .getRedeemDetails(token)
      .then(setInviteInfo)
      .catch((err) => setError(err.response?.data?.message || 'Invalid or expired invite token'))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleRedeemConnect = async () => {
    if (!token || !inviteInfo) return;
    setIsConnecting(true);
    try {
      let res: { url: string };
      if (inviteInfo.provider === 'xero') {
        res = await invitesApi.getRedeemXeroAuthUrl(token);
      } else if (inviteInfo.provider === 'myob') {
        res = await invitesApi.getRedeemMyobAuthUrl(token);
      } else {
        res = await invitesApi.getRedeemQuickBooksAuthUrl(token);
      }

      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(`Redemption Error: ${err.response?.data?.message || err.message}`);
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-glow-indigo">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Chasr Guest Connect</h1>
          <p className="text-xs text-slate-400 mt-1">Authorize accounting ledger sync</p>
        </div>

        <div className="glass-panel border border-dark-border/90 rounded-3xl p-8 shadow-glass">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Verifying invite token...</div>
          ) : error ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-200 text-sm">Token Invalid or Expired</h3>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-dark-card/80 border border-dark-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Provider</span>
                  <span className="font-bold text-cyan-300 uppercase font-mono">{inviteInfo?.provider}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Invited By</span>
                  <span className="font-mono text-slate-200">{inviteInfo?.inviterEmail}</span>
                </div>
                {inviteInfo?.inviteeEmail && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Invitee</span>
                    <span className="font-mono text-slate-200">{inviteInfo.inviteeEmail}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  By clicking connect, you authorise Chasr to perform read/write sync operations with your {inviteInfo?.provider} organization.
                </span>
              </div>

              <button
                onClick={handleRedeemConnect}
                disabled={isConnecting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-bold text-xs hover:opacity-90 transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {isConnecting ? 'Redirecting to OAuth...' : `Authorize ${inviteInfo?.provider?.toUpperCase()} Connection`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
