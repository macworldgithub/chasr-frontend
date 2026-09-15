import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Link2,
  RefreshCw,
  Trash2,
  Building,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileSpreadsheet,
  Globe,
  Loader2,
  BookUser,
  Pencil,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { integrationsApi } from "../api/client";
import {
  AccountingConnection,
  Contact,
  Invoice,
  Provider,
  OrganisationInfo,
} from "../types";
import { XeroTenantModal } from "../components/XeroTenantModal";
import { CredentialModal } from "../components/CredentialModal";
import { ContactModal } from "../components/ContactModal";
import { InvoiceModal } from "../components/InvoiceModal";

export const Connections: React.FC = () => {
  const PAGE_SIZE = 10;
  const [connections, setConnections] = useState<AccountingConnection[]>([]);
  const [selectedConnection, setSelectedConnection] =
    useState<AccountingConnection | null>(null);
  const [orgInfoMap, setOrgInfoMap] = useState<
    Record<string, OrganisationInfo>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactLoadingId, setContactLoadingId] = useState<string | null>(null);
  const [activeDataTab, setActiveDataTab] = useState<"contacts" | "invoices">(
    "contacts",
  );
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null);
  const [dataPage, setDataPage] = useState(1);

  // Modals state
  const [xeroTenantModalOpen, setXeroTenantModalOpen] = useState(false);
  const [xeroTenants, setXeroTenants] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [xeroConnIdForTenant, setXeroConnIdForTenant] = useState<string>("");

  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [credentialProvider, setCredentialProvider] =
    useState<Provider>("xero");

  const [searchParams] = useSearchParams();

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const data = await integrationsApi.getConnections();
      setConnections(data);

      // Fetch org info for each connection
      const orgs: Record<string, OrganisationInfo> = {};
      for (const conn of data) {
        try {
          const info = await integrationsApi.getOrganisationInfo(conn._id);
          if (info) orgs[conn._id] = info;
        } catch {
          // ignore if org info is missing
        }
      }
      setOrgInfoMap(orgs);
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      setContacts(await integrationsApi.getContacts());
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setContactsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setInvoicesLoading(true);
    try {
      setInvoices(await integrationsApi.getInvoices());
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchContacts();

    // Check if coming back from OAuth redirect (e.g. state/code in query params)
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (code && state) {
      // In NestJS backend, OAuth callbacks are handled server-side or via API redirect.
      // Refresh list to update connections status.
      fetchConnections();
    }
  }, []);

  useEffect(() => {
    const totalItems =
      activeDataTab === "contacts" ? contacts.length : invoices.length;
    const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    setDataPage((page) => Math.min(page, pageCount));
  }, [activeDataTab, contacts.length, invoices.length]);

  const visibleContacts = contacts.slice(
    (dataPage - 1) * PAGE_SIZE,
    dataPage * PAGE_SIZE,
  );
  const visibleInvoices = invoices.slice(
    (dataPage - 1) * PAGE_SIZE,
    dataPage * PAGE_SIZE,
  );
  const totalDataItems =
    activeDataTab === "contacts" ? contacts.length : invoices.length;
  const dataPageCount = Math.max(1, Math.ceil(totalDataItems / PAGE_SIZE));

  const handleOpenContact = async (contactId: string) => {
    setContactLoadingId(contactId);
    try {
      const contact = await integrationsApi.getContact(contactId);
      setSelectedContact(contact);
      setContactModalOpen(true);
    } catch (err: any) {
      alert(
        `Contact fetch error: ${err.response?.data?.message || err.message}`,
      );
    } finally {
      setContactLoadingId(null);
    }
  };

  const handleNewContact = () => {
    setSelectedContact(null);
    setContactModalOpen(true);
  };

  const handleOpenInvoice = async (invoiceId: string) => {
    setInvoiceLoadingId(invoiceId);
    try {
      const invoice = await integrationsApi.getInvoice(invoiceId);
      setSelectedInvoice(invoice);
      setInvoiceModalOpen(true);
    } catch (err: any) {
      alert(
        `Invoice fetch error: ${err.response?.data?.message || err.message}`,
      );
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setInvoiceModalOpen(true);
  };

  const handleOAuthConnect = async (provider: Provider) => {
    try {
      let res: { authUrl?: string; url?: string };
      if (provider === "xero") {
        res = await integrationsApi.getXeroAuthUrl();
      } else if (provider === "myob") {
        res = await integrationsApi.getMyobAuthUrl();
      } else {
        res = await integrationsApi.getQuickBooksAuthUrl();
      }

      const authUrl = res.authUrl || res.url;
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }

      alert("OAuth URL not received from the server.");
    } catch (err: any) {
      alert(
        `OAuth URL Generation Error: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  const handleOpenCredentialModal = (provider: Provider) => {
    setCredentialProvider(provider);
    setCredentialModalOpen(true);
  };

  const handleTriggerSync = async (connId: string) => {
    setSyncingMap((prev) => ({ ...prev, [connId]: true }));
    try {
      const { jobId } = await integrationsApi.triggerSync(connId);

      // Poll sync status
      const interval = setInterval(async () => {
        try {
          const statusRes = await integrationsApi.getSyncStatus(connId, jobId);
          if (
            statusRes.status === "completed" ||
            statusRes.status === "failed"
          ) {
            clearInterval(interval);
            setSyncingMap((prev) => ({ ...prev, [connId]: false }));
            fetchConnections();
          }
        } catch {
          clearInterval(interval);
          setSyncingMap((prev) => ({ ...prev, [connId]: false }));
        }
      }, 2000);
    } catch (err: any) {
      alert(
        `Sync Trigger Error: ${err.response?.data?.message || err.message}`,
      );
      setSyncingMap((prev) => ({ ...prev, [connId]: false }));
    }
  };

  const handleDeleteConnection = async (connId: string) => {
    if (
      !confirm(
        "Are you sure you want to disconnect this accounting integration?",
      )
    )
      return;
    try {
      await integrationsApi.deleteConnection(connId);
      fetchConnections();
    } catch (err: any) {
      alert(`Disconnect Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenTenantSelector = async (connId: string) => {
    try {
      const tenants = await integrationsApi.getXeroTenants(connId);
      setXeroTenants(tenants);
      setXeroConnIdForTenant(connId);
      setXeroTenantModalOpen(true);
    } catch (err: any) {
      alert(
        `Tenant fetch error: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  const providersConfig: Array<{
    name: string;
    provider: Provider;
    color: string;
    desc: string;
  }> = [
    {
      name: "Xero",
      provider: "xero",
      color: "from-sky-500 to-blue-600",
      desc: "OAuth2 & Multi-Tenant Organization Sync",
    },
    {
      name: "MYOB",
      provider: "myob",
      color: "from-purple-500 to-indigo-600",
      desc: "AccountRight & Essentials API Integration",
    },
    {
      name: "QuickBooks Online",
      provider: "quickbooks",
      color: "from-emerald-500 to-teal-600",
      desc: "Intuit Realm ID & Invoice Data Pipeline",
    },
    {
      name: "CSV Manual Ledger",
      provider: "csv",
      color: "from-amber-500 to-orange-600",
      desc: "Custom AR CSV Column Mapper & File Ingest",
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Accounting Connections
          </h1>
          <p className="text-sm text-slate-400">
            Connect accounting ledgers via OAuth2, API Credentials, or CSV
            Imports
          </p>
        </div>
        <button
          onClick={fetchConnections}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Connections
        </button>
      </div>

      {/* Integration Provider Connect Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {providersConfig.map((item) => {
          const isConnected = connections.some(
            (c) => c.provider === item.provider,
          );
          return (
            <div
              key={item.provider}
              className="glass-panel p-6 rounded-2xl border border-dark-border flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white font-extrabold text-lg mb-4 shadow-lg`}
                >
                  {item.name[0]}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-base text-white">
                    {item.name}
                  </h3>
                  {isConnected && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              {item.provider === "csv" ? (
                <a
                  href="/csv-ingest"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs text-center hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Open CSV Mapper
                </a>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleOAuthConnect(item.provider)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-semibold text-xs hover:opacity-90 transition-all shadow-glow-cyan flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Connect via OAuth2
                  </button>
                  <button
                    onClick={() => handleOpenCredentialModal(item.provider)}
                    className="w-full py-2 rounded-xl glass-panel text-slate-300 hover:text-white font-semibold text-[11px] transition-all flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    API Key / Credentials
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contacts and Invoices */}
      <div className="flex items-center gap-2 border-b border-dark-border">
        <button
          onClick={() => {
            setActiveDataTab("contacts");
            setDataPage(1);
          }}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${activeDataTab === "contacts" ? "text-cyan-300 border-cyan-400" : "text-slate-400 border-transparent hover:text-white"}`}
        >
          <BookUser className="w-3.5 h-3.5 inline mr-1.5" />
          Contacts
        </button>
        <button
          onClick={() => {
            setActiveDataTab("invoices");
            setDataPage(1);
            if (!invoices.length && !invoicesLoading) fetchInvoices();
          }}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${activeDataTab === "invoices" ? "text-amber-300 border-amber-400" : "text-slate-400 border-transparent hover:text-white"}`}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1.5" />
          Invoices
        </button>
      </div>

      <div
        className={`glass-panel p-6 rounded-2xl border border-dark-border space-y-4 ${activeDataTab !== "contacts" ? "hidden" : ""}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookUser className="w-4 h-4 text-cyan-400" />
            Contacts ({contacts.length})
          </h2>
          <button
            onClick={handleNewContact}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Contact
          </button>
        </div>

        {contactsLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono border border-dashed border-dark-border rounded-xl">
            No contacts found. Add your first contact to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-dark-border text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-4">Name</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Phone</th>
                  <th className="pb-3 px-4">Payment Terms</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60 text-slate-200">
                {visibleContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-dark-hover/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenContact(contact._id)}
                        disabled={contactLoadingId === contact._id}
                        className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline disabled:opacity-50"
                      >
                        {contactLoadingId === contact._id
                          ? "Loading..."
                          : contact.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {contact.emails?.join(", ") || "-"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {contact.phones?.join(", ") || "-"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {contact.paymentTermsDays ?? 0} days
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenContact(contact._id)}
                        disabled={contactLoadingId === contact._id}
                        className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
                        title="Update contact"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!contactsLoading && contacts.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-dark-border pt-4">
            <span className="text-xs text-slate-400">
              Page {dataPage} of {dataPageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDataPage((page) => Math.max(1, page - 1))}
                disabled={dataPage === 1}
                className="p-1.5 rounded-lg border border-dark-border text-slate-300 hover:text-white hover:bg-dark-hover disabled:opacity-40"
                title="Previous contacts page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setDataPage((page) => Math.min(dataPageCount, page + 1))
                }
                disabled={dataPage === dataPageCount}
                className="p-1.5 rounded-lg border border-dark-border text-slate-300 hover:text-white hover:bg-dark-hover disabled:opacity-40"
                title="Next contacts page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`glass-panel p-6 rounded-2xl border border-dark-border space-y-4 ${activeDataTab !== "invoices" ? "hidden" : ""}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Invoices ({invoices.length})
          </h2>
          <button
            onClick={handleNewInvoice}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-semibold hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Invoice
          </button>
        </div>
        {invoicesLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono border border-dashed border-dark-border rounded-xl">
            No invoices found. Add your first invoice to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-dark-border text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-4">Invoice</th>
                  <th className="pb-3 px-4">Contact</th>
                  <th className="pb-3 px-4">Due Date</th>
                  <th className="pb-3 px-4">Total</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60 text-slate-200">
                {visibleInvoices.map((invoice) => {
                  const contact = contacts.find(
                    (item) => item._id === invoice.contactId,
                  );
                  return (
                    <tr
                      key={invoice._id}
                      className="hover:bg-dark-hover/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOpenInvoice(invoice._id)}
                          disabled={invoiceLoadingId === invoice._id}
                          className="font-semibold text-amber-300 hover:text-amber-200 hover:underline disabled:opacity-50"
                        >
                          {invoiceLoadingId === invoice._id
                            ? "Loading..."
                            : invoice.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {contact?.name || invoice.contactId || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {invoice.currency} {invoice.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-300 text-[10px] font-semibold">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenInvoice(invoice._id)}
                          disabled={invoiceLoadingId === invoice._id}
                          className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                          title="Update invoice"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!invoicesLoading && invoices.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-dark-border pt-4">
            <span className="text-xs text-slate-400">
              Page {dataPage} of {dataPageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDataPage((page) => Math.max(1, page - 1))}
                disabled={dataPage === 1}
                className="p-1.5 rounded-lg border border-dark-border text-slate-300 hover:text-white hover:bg-dark-hover disabled:opacity-40"
                title="Previous invoices page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setDataPage((page) => Math.min(dataPageCount, page + 1))
                }
                disabled={dataPage === dataPageCount}
                className="p-1.5 rounded-lg border border-dark-border text-slate-300 hover:text-white hover:bg-dark-hover disabled:opacity-40"
                title="Next invoices page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Connections Data Table */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Configured Integration Channels ({connections.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            Loading active connections...
          </div>
        ) : connections.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono border border-dashed border-dark-border rounded-xl">
            No active connections configured. Click an OAuth or Credential
            button above to connect your accounting ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-dark-border text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-4">Provider</th>
                  <th className="pb-3 px-4">Auth Type</th>
                  <th className="pb-3 px-4">Organization / Tenant</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Last Synced</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60 text-slate-200 font-sans">
                {connections.map((conn) => {
                  const org = orgInfoMap[conn._id];
                  const isSyncing = syncingMap[conn._id];
                  return (
                    <tr
                      key={conn._id}
                      className="hover:bg-dark-hover/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-semibold capitalize flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center font-mono text-cyan-400 uppercase text-xs">
                          {conn.provider.slice(0, 2)}
                        </span>
                        {conn.provider}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {conn.authMethod}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {org ? (
                          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                            <Building className="w-3.5 h-3.5" />
                            {org.name}
                            {org.currencyCode && (
                              <span className="text-[10px] text-slate-400">
                                ({org.currencyCode})
                              </span>
                            )}
                          </div>
                        ) : conn.activeTenantId ? (
                          <span className="text-slate-300">
                            Tenant: {conn.activeTenantId}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            No tenant assigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
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
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {conn.lastSyncedAt
                          ? new Date(conn.lastSyncedAt).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {conn.provider === "xero" && (
                          <button
                            onClick={() => handleOpenTenantSelector(conn._id)}
                            className="px-2.5 py-1.5 rounded-lg bg-dark-card border border-dark-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 text-[11px] font-semibold transition-all"
                            title="Select Active Tenant"
                          >
                            Tenants
                          </button>
                        )}
                        <button
                          onClick={() => handleTriggerSync(conn._id)}
                          disabled={isSyncing}
                          className="px-3 py-1.5 rounded-lg bg-brand-600/30 border border-brand-500/40 text-brand-300 hover:text-white hover:bg-brand-600/60 text-[11px] font-semibold transition-all inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                          />
                          {isSyncing ? "Syncing..." : "Sync Now"}
                        </button>
                        <button
                          onClick={() => handleDeleteConnection(conn._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all"
                          title="Disconnect Integration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <XeroTenantModal
        isOpen={xeroTenantModalOpen}
        onClose={() => setXeroTenantModalOpen(false)}
        connectionId={xeroConnIdForTenant}
        tenants={xeroTenants}
        onTenantSelected={fetchConnections}
      />

      <CredentialModal
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
        provider={credentialProvider}
        onSuccess={fetchConnections}
      />

      <ContactModal
        isOpen={contactModalOpen}
        contact={selectedContact}
        onClose={() => setContactModalOpen(false)}
        onSuccess={fetchContacts}
      />

      <InvoiceModal
        isOpen={invoiceModalOpen}
        invoice={selectedInvoice}
        contacts={contacts}
        onClose={() => setInvoiceModalOpen(false)}
        onSuccess={fetchInvoices}
      />
    </div>
  );
};
