import React, { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import { Invoice, InvoiceStatus, InvoiceType } from "../types";
import { InvoicePayload, integrationsApi } from "../api/client";

interface Props {
  isOpen: boolean;
  invoice: Invoice | null;
  contacts: Array<{ _id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

const statuses: InvoiceStatus[] = [
  "DRAFT",
  "AUTHORISED",
  "PAID",
  "VOIDED",
  "OVERDUE",
];

export const InvoiceModal: React.FC<Props> = ({
  isOpen,
  invoice,
  contacts,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    invoiceNumber: "",
    invoiceType: "ACCREC" as InvoiceType,
    creditNoteNumber: "",
    linkedInvoiceIds: "",
    issueDate: "",
    dueDate: "",
    total: "",
    balanceDue: "",
    currency: "AUD",
    status: "DRAFT" as InvoiceStatus,
    pdfUrl: "",
    contactId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      invoiceNumber: invoice?.invoiceNumber || "",
      invoiceType: invoice?.invoiceType || "ACCREC",
      creditNoteNumber: invoice?.creditNoteNumber || "",
      linkedInvoiceIds: invoice?.linkedInvoiceIds?.join(", ") || "",
      issueDate: invoice?.issueDate?.slice(0, 10) || "",
      dueDate: invoice?.dueDate?.slice(0, 10) || "",
      total: invoice ? String(invoice.total) : "",
      balanceDue: invoice ? String(invoice.balanceDue) : "",
      currency: invoice?.currency || "AUD",
      status: invoice?.status || "DRAFT",
      pdfUrl: invoice?.pdfUrl || "",
      contactId: invoice?.contactId || contacts[0]?._id || "",
    });
    setError(null);
  }, [isOpen, invoice, contacts]);

  if (!isOpen) return null;
  const inputClass =
    "w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500";
  const setField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const payload: InvoicePayload = {
      invoiceNumber: form.invoiceNumber.trim(),
      invoiceType: form.invoiceType,
      creditNoteNumber: form.creditNoteNumber.trim() || undefined,
      linkedInvoiceIds: form.linkedInvoiceIds
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      total: Number(form.total) || 0,
      balanceDue: Number(form.balanceDue) || 0,
      currency: form.currency.trim().toUpperCase(),
      status: form.status,
      pdfUrl: form.pdfUrl.trim() || undefined,
      contactId: form.contactId,
    };
    try {
      if (invoice?._id)
        await integrationsApi.updateInvoice(invoice._id, payload);
      else await integrationsApi.createInvoice(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Failed to ${invoice ? "update" : "create"} invoice`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel border border-dark-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-glass relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              {invoice ? "Update Invoice" : "Create Invoice"}
            </h3>
            <p className="text-xs text-slate-400">
              Save invoice details for your integrations
            </p>
          </div>
        </div>
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Invoice number
              </label>
              <input
                required
                value={form.invoiceNumber}
                onChange={(e) => setField("invoiceNumber", e.target.value)}
                className={inputClass}
                placeholder="INV-1001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact
              </label>
              <select
                required
                value={form.contactId}
                onChange={(e) => setField("contactId", e.target.value)}
                className={inputClass}
              >
                <option value="">Select contact</option>
                {contacts.map((contact) => (
                  <option key={contact._id} value={contact._id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Invoice type
              </label>
              <select
                value={form.invoiceType}
                onChange={(e) => setField("invoiceType", e.target.value)}
                className={inputClass}
              >
                <option value="ACCREC">ACCREC</option>
                <option value="ACCPAY">ACCPAY</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className={inputClass}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Issue date
              </label>
              <input
                required
                type="date"
                value={form.issueDate}
                onChange={(e) => setField("issueDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Due date
              </label>
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.total}
                onChange={(e) => setField("total", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Balance due
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.balanceDue}
                onChange={(e) => setField("balanceDue", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Currency
              </label>
              <input
                required
                maxLength={3}
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value)}
                className={inputClass}
                placeholder="AUD"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Credit note number
              </label>
              <input
                value={form.creditNoteNumber}
                onChange={(e) => setField("creditNoteNumber", e.target.value)}
                className={inputClass}
                placeholder="CN-001"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Linked invoice IDs
            </label>
            <input
              value={form.linkedInvoiceIds}
              onChange={(e) => setField("linkedInvoiceIds", e.target.value)}
              className={inputClass}
              placeholder="INV-0999, INV-0998"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              PDF URL
            </label>
            <input
              type="url"
              value={form.pdfUrl}
              onChange={(e) => setField("pdfUrl", e.target.value)}
              className={inputClass}
              placeholder="https://example.com/invoice.pdf"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.contactId}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : invoice
                  ? "Update Invoice"
                  : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
