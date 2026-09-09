import React, { useState } from 'react';
import { Building, CheckCircle2, X } from 'lucide-react';
import { integrationsApi } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  tenants: Array<{ id: string; name: string }>;
  onTenantSelected: () => void;
}

export const XeroTenantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  connectionId,
  tenants,
  onTenantSelected,
}) => {
  const [selectedId, setSelectedId] = useState<string>(tenants[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await integrationsApi.selectXeroTenant(connectionId, selectedId);
      onTenantSelected();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to select tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-glass relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Select Xero Organisation</h3>
            <p className="text-xs text-slate-400">Choose which tenant to sync with Chasr</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {tenants.map((t) => (
              <label
                key={t.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedId === t.id
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-glow-cyan'
                    : 'bg-dark-card/50 border-dark-border text-slate-300 hover:bg-dark-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="tenant"
                    value={t.id}
                    checked={selectedId === t.id}
                    onChange={() => setSelectedId(t.id)}
                    className="hidden"
                  />
                  <span className="font-medium text-sm">{t.name}</span>
                </div>
                {selectedId === t.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedId}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 shadow-glow-cyan"
            >
              {isSubmitting ? 'Confirming...' : 'Select & Sync'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
