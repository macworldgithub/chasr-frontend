import React, { useEffect, useState } from 'react';
import {
  History,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  FileCode,
  Layers,
  X,
} from 'lucide-react';
import { integrationsApi } from '../api/client';
import { SyncLog, AccountingConnection } from '../types';

export const SyncLogs: React.FC = () => {
  const [connections, setConnections] = useState<AccountingConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inspector modal
  const [inspectLog, setInspectLog] = useState<SyncLog | null>(null);

  const fetchConnectionsAndLogs = async () => {
    setIsLoading(true);
    try {
      const conns = await integrationsApi.getConnections();
      const connList = Array.isArray(conns) ? conns : [];
      setConnections(connList);

      const targetId = selectedConnectionId || connList[0]?._id;
      if (targetId) {
        if (!selectedConnectionId) {
          setSelectedConnectionId(targetId);
        }
        const res = await integrationsApi.getSyncLogs(targetId);
        const logList = Array.isArray(res) ? res : res?.logs || [];
        setLogs(Array.isArray(logList) ? logList : []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to fetch sync logs:', err);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectionsAndLogs();
  }, [selectedConnectionId]);

  const filteredLogs = (logs || []).filter((log) => {
    if (!log) return false;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesQuery =
      !searchQuery ||
      (log.provider && log.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log._id && log._id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sync Operations & Audit Center</h1>
          <p className="text-sm text-slate-400">
            Real-time ledger sync log audit trail, job execution records, and error traces
          </p>
        </div>
        <button
          onClick={fetchConnectionsAndLogs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filter & Selector Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-dark-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedConnectionId}
            onChange={(e) => setSelectedConnectionId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {connections.map((c) => (
              <option key={c._id} value={c._id}>
                Channel: {c.provider.toUpperCase()} ({c.authMethod})
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Log ID or Provider..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Sync Logs Table */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Job Records ({filteredLogs.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 font-mono border border-dashed border-dark-border rounded-xl">
            No sync logs match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-dark-border text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-4">Log ID</th>
                  <th className="pb-3 px-4">Provider</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Synced Records</th>
                  <th className="pb-3 px-4">Executed At</th>
                  <th className="pb-3 px-4 text-right">Inspector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60 text-slate-200 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-dark-hover/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-cyan-300">{log._id.slice(0, 12)}...</td>
                    <td className="py-4 px-4 font-semibold capitalize">{log.provider}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          log.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {log.status === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-cyan-400">
                      {log.syncedRecords ?? 0} synced
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-dark-card border border-dark-border text-slate-300 hover:text-cyan-400 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Inspector Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel border border-dark-border rounded-2xl w-full max-w-2xl p-6 shadow-glass relative space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white font-mono">
                  Sync Record #{inspectLog._id}
                </h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-dark-bg p-4 rounded-xl border border-dark-border text-xs font-mono text-cyan-300">
              <pre className="whitespace-pre-wrap">{JSON.stringify(inspectLog, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
