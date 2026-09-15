import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Link2,
  FileSpreadsheet,
  UserPlus,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Database,
  Layers,
  BookUser,
  FileText,
} from "lucide-react";
import { integrationsApi, invitesApi } from "../api/client";
import { AccountingConnection, SyncLog, Invite, Contact, Invoice } from "../types";

export const Dashboard: React.FC = () => {
  const [connections, setConnections] = useState<AccountingConnection[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [contactsCount, setContactsCount] = useState<number>(0);
  const [invoicesCount, setInvoicesCount] = useState<number>(0);
  const [recentLogs, setRecentLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [connsRes, invsRes, contactsRes, invoicesRes] =
        await Promise.allSettled([
          integrationsApi.getConnections(),
          invitesApi.listInvites(),
          integrationsApi.getContacts({ page: 1, limit: 1 }),
          integrationsApi.getInvoices({ page: 1, limit: 1 }),
        ]);

      const connList =
        connsRes.status === "fulfilled" && Array.isArray(connsRes.value)
          ? connsRes.value
          : [];
      setConnections(connList);

      const invList =
        invsRes.status === "fulfilled" && Array.isArray(invsRes.value)
          ? invsRes.value
          : [];
      setInvites(invList);

      if (contactsRes.status === "fulfilled") {
        const cVal = contactsRes.value;
        const total =
          cVal?.pagination?.total ??
          (Array.isArray(cVal?.data)
            ? cVal.data.length
            : Array.isArray(cVal)
              ? (cVal as any).length
              : 0);
        setContactsCount(total);
      }

      if (invoicesRes.status === "fulfilled") {
        const iVal = invoicesRes.value;
        const total =
          iVal?.pagination?.total ??
          (Array.isArray(iVal?.data)
            ? iVal.data.length
            : Array.isArray(iVal)
              ? (iVal as any).length
              : 0);
        setInvoicesCount(total);
      }

      if (connList.length > 0) {
        try {
          const logsPromises = connList.map((c) =>
            integrationsApi
              .getSyncLogs(c._id, 1, 5)
              .catch(() => ({ logs: [] })),
          );
          const allLogsRes = await Promise.all(logsPromises);
          const aggregatedLogs: SyncLog[] = [];
          for (const res of allLogsRes) {
            const list = Array.isArray(res) ? res : res?.logs || [];
            aggregatedLogs.push(...list);
          }
          aggregatedLogs.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setRecentLogs(aggregatedLogs.slice(0, 5));
        } catch {
          setRecentLogs([]);
        }
      } else {
        setRecentLogs([]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Integration Control Center
          </h1>
          <p className="text-sm text-slate-400">
            Real-time accounting synchronization & ledger management engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-cyan-500/40 text-xs font-semibold transition-all"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh State
          </button>
          <Link
            to="/connections"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 shadow-glow-cyan"
          >
            <Link2 className="w-3.5 h-3.5" />
            Add Connection
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-dark-border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-brand-500/10 rounded-full blur-xl group-hover:bg-brand-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Number of Contacts
            </span>
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <BookUser className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {contactsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Total ledger contacts
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-dark-border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Number of Invoices
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {invoicesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Total ledger invoices
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-dark-border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Sync Pipeline
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">Online</div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            BullMQ Redis Worker
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-dark-border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              CSV Engine
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">Ready</div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Xero, MYOB, QB Specs
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Connections Grid & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-border">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Quick Operations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/connections"
                className="p-4 rounded-xl glass-panel-hover border border-dark-border text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                  Connect Provider{" "}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate Xero, MYOB or QuickBooks
                </p>
              </Link>

              <Link
                to="/csv-ingest"
                className="p-4 rounded-xl glass-panel-hover border border-dark-border text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                  Upload CSV File{" "}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Map & ingest manual AR data
                </p>
              </Link>
              
              <Link
                to="/invites"
                className="p-4 rounded-xl glass-panel-hover border border-dark-border text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                  Invite Client{" "}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Generate guest authorization link
                </p>
              </Link>
            </div>
          </div>

          {/* Connected Integrations List */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-400" />
                Active Integrations
              </h2>
              <Link
                to="/connections"
                className="text-xs font-semibold text-cyan-400 hover:underline"
              >
                Manage All ({connections.length})
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading integrations...
              </div>
            ) : connections.length === 0 ? (
              <div className="py-10 text-center glass-panel rounded-xl border border-dashed border-dark-border">
                <Link2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  No active connections
                </p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Connect Xero, MYOB, or QuickBooks to begin syncing
                </p>
                <Link
                  to="/connections"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500"
                >
                  Configure Integration
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.slice(0, 4).map((conn) => (
                  <div
                    key={conn._id}
                    className="p-4 rounded-xl bg-dark-card/60 border border-dark-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-dark-hover border border-dark-border flex items-center justify-center font-bold text-sm text-cyan-400 uppercase font-mono">
                        {conn.provider.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-200 capitalize">
                          {conn.provider} Integration
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          Method: {conn.authMethod}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                            conn.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {conn.status === "active" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {conn.status}
                        </span>
                        {conn.lastSyncedAt && (
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            Synced{" "}
                            {new Date(conn.lastSyncedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Sync Activity Timeline */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-dark-border h-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Recent Sync Logs
              </h2>
              <Link
                to="/sync-logs"
                className="text-xs font-semibold text-cyan-400 hover:underline"
              >
                View Log History
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">
                No sync logs recorded yet.
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-border">
                {recentLogs.map((log) => (
                  <div key={log._id} className="relative pl-7">
                    <div
                      className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-dark-bg ${
                        log.status === "completed"
                          ? "bg-emerald-400"
                          : log.status === "failed"
                            ? "bg-rose-400"
                            : "bg-amber-400"
                      }`}
                    ></div>
                    <div className="p-3 rounded-xl bg-dark-card/50 border border-dark-border/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 uppercase font-mono">
                          {log.provider}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 capitalize font-mono">
                        Status:{" "}
                        <span className="text-slate-200">{log.status}</span>
                      </p>
                      {log.syncedRecords !== undefined && (
                        <p className="text-[11px] text-cyan-400 mt-1 font-mono">
                          {log.syncedRecords} records processed
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
