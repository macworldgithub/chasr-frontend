export type Provider = "xero" | "myob" | "quickbooks" | "csv" | "generic";
export type AuthMethod = "oauth2" | "api_key" | "credential";
export type ConnectionStatus =
  | "active"
  | "error"
  | "syncing"
  | "disconnected"
  | "pending";

export interface User {
  id: string;
  orgId: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AccountingConnection {
  _id: string;
  id?: string;
  orgId: string;
  provider: Provider;
  authMethod: AuthMethod;
  status: ConnectionStatus;
  lastSyncedAt?: string;
  errorMessage?: string;
  tenants?: Array<{ id: string; name: string }>;
  activeTenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncLog {
  _id: string;
  orgId: string;
  connectionId: string;
  provider: Provider;
  status: "pending" | "in_progress" | "completed" | "failed";
  totalRecords?: number;
  syncedRecords?: number;
  failedRecords?: number;
  errorMessage?: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationInfo {
  _id?: string;
  connectionId: string;
  name: string;
  legalName?: string;
  countryCode?: string;
  currencyCode?: string;
  organisationId?: string;
}

export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface Contact {
  _id: string;
  orgId?: string;
  name: string;
  emails: string[];
  phones: string[];
  address?: ContactAddress;
  paymentTermsDays?: number;
  chaseState?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InvoiceType = "ACCREC" | "ACCPAY";
export type InvoiceStatus =
  | "DRAFT"
  | "AUTHORISED"
  | "PAID"
  | "VOIDED"
  | "OVERDUE";

export interface Invoice {
  _id: string;
  orgId?: string;
  contactId?: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  creditNoteNumber?: string;
  linkedInvoiceIds?: string[];
  issueDate: string;
  dueDate: string;
  total: number;
  balanceDue: number;
  currency: string;
  status: InvoiceStatus;
  pdfUrl?: string;
  chaseState?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CsvUploadResult {
  uploadId: string;
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  suggestedMappings?: Record<string, string>;
}

export interface CsvMapping {
  sourceColumn: string;
  targetField: string;
}

export interface CsvValidationResult {
  totalRows: number;
  validRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  sampleValidRows?: any[];
}

export interface Invite {
  _id: string;
  token: string;
  orgId: string;
  provider: Provider;
  inviteeEmail?: string;
  status: "pending" | "consumed" | "revoked" | "expired";
  createdByUserId: string;
  createdAt: string;
  expiresAt: string;
}

export interface CsvTemplate {
  name: string;
  provider: Provider;
  downloadUrl: string;
}
