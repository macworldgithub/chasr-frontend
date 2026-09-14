import React, { useEffect, useState } from "react";
import { Contact, ContactAddress } from "../types";
import { ContactPayload, integrationsApi } from "../api/client";
import { BookUser, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyAddress: ContactAddress = {
  street: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
};

export const ContactModal: React.FC<Props> = ({
  isOpen,
  contact,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [phones, setPhones] = useState("");
  const [address, setAddress] = useState<ContactAddress>(emptyAddress);
  const [paymentTermsDays, setPaymentTermsDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(contact?.name || "");
    setEmails(contact?.emails?.join(", ") || "");
    setPhones(contact?.phones?.join(", ") || "");
    setAddress({ ...emptyAddress, ...contact?.address });
    setPaymentTermsDays(String(contact?.paymentTermsDays ?? 30));
    setError(null);
  }, [isOpen, contact]);

  if (!isOpen) return null;

  const updateAddress = (field: keyof ContactAddress, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const payload: ContactPayload = {
      name: name.trim(),
      emails: emails
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      phones: phones
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      address: {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        postcode: address.postcode || "",
        country: address.country || "",
      },
      paymentTermsDays: Number(paymentTermsDays) || 0,
    };

    try {
      if (contact?._id)
        await integrationsApi.updateContact(contact._id, payload);
      else await integrationsApi.createContact(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Failed to ${contact ? "update" : "create"} contact`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-200 text-sm focus:outline-none focus:border-cyan-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-glass relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookUser className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              {contact ? "Update Contact" : "Create Contact"}
            </h3>
            <p className="text-xs text-slate-400">
              Save contact details for your integrations
            </p>
          </div>
        </div>
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contact name
            </label>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Acme Pty Ltd"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Emails
              </label>
              <input
                value={emails}
                onChange={(event) => setEmails(event.target.value)}
                className={inputClass}
                placeholder="billing@acme.com, sales@acme.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phones
              </label>
              <input
                value={phones}
                onChange={(event) => setPhones(event.target.value)}
                className={inputClass}
                placeholder="+61 400 000 000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Address
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(
                ["street", "city", "state", "postcode", "country"] as const
              ).map((field) => (
                <input
                  key={field}
                  value={address[field] || ""}
                  onChange={(event) => updateAddress(field, event.target.value)}
                  className={inputClass}
                  placeholder={field[0].toUpperCase() + field.slice(1)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment terms (days)
            </label>
            <input
              type="number"
              min="0"
              value={paymentTermsDays}
              onChange={(event) => setPaymentTermsDays(event.target.value)}
              className={inputClass}
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : contact
                  ? "Update Contact"
                  : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
