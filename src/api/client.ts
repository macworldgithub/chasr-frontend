import axios from "axios";
import {
  AuthResponse,
  AccountingConnection,
  SyncLog,
  OrganisationInfo,
  CsvUploadResult,
  CsvMapping,
  CsvValidationResult,
  Invite,
  CsvTemplate,
  Provider,
  AuthMethod,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Bearer token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("chasr_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for global auth expiration handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/redeem")
    ) {
      localStorage.removeItem("chasr_token");
      localStorage.removeItem("chasr_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ── Auth Endpoints ─────────────────────────────────────────────────────────────

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", {
      username,
      password,
    });
    return res.data;
  },
  signup: async (data: {
    email: string;
    username: string;
    password: string;
    orgId?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/signup", data);
    return res.data;
  },
};

// ── Integrations & Connections Endpoints ─────────────────────────────────────

export const integrationsApi = {
  getContacts: async (): Promise<Contact[]> => {
    const res = await apiClient.get<Contact[] | { data: Contact[] }>(
      "/integrations/contacts",
    );
    return Array.isArray(res.data) ? res.data : res.data.data;
  },

  getContact: async (id: string): Promise<Contact> => {
    const res = await apiClient.get<Contact>(`/integrations/contacts/${id}`);
    return res.data;
  },

  createContact: async (contact: ContactPayload): Promise<Contact> => {
    const res = await apiClient.post<Contact>(
      "/integrations/contacts",
      contact,
    );
    return res.data;
  },

  updateContact: async (
    id: string,
    contact: ContactPayload,
  ): Promise<Contact> => {
    const res = await apiClient.patch<Contact>(
      `/integrations/contacts/${id}`,
      contact,
    );
    return res.data;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const res = await apiClient.get<Invoice[] | { data: Invoice[] }>(
      "/integrations/invoices?page=1&limit=25",
    );
    return Array.isArray(res.data) ? res.data : res.data.data;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const res = await apiClient.get<Invoice>(`/integrations/invoices/${id}`);
    return res.data;
  },

  createInvoice: async (invoice: InvoicePayload): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>(
      "/integrations/invoices",
      invoice,
    );
    return res.data;
  },

  updateInvoice: async (
    id: string,
    invoice: InvoicePayload,
  ): Promise<Invoice> => {
    const res = await apiClient.patch<Invoice>(
      `/integrations/invoices/${id}`,
      invoice,
    );
    return res.data;
  },

  getConnections: async (): Promise<AccountingConnection[]> => {
    const res = await apiClient.get<AccountingConnection[]>(
      "/integrations/connections",
    );
    return res.data;
  },

  getConnection: async (
    id: string,
  ): Promise<{ connection: AccountingConnection; logs: SyncLog[] }> => {
    const res = await apiClient.get<{
      connection: AccountingConnection;
      logs: SyncLog[];
    }>(`/integrations/connections/${id}`);
    return res.data;
  },

  deleteConnection: async (id: string): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(
      `/integrations/connections/${id}`,
    );
    return res.data;
  },

  createCredentialConnection: async (
    provider: Provider,
    authMethod: AuthMethod,
    credentials: Record<string, string>,
  ): Promise<AccountingConnection> => {
    const res = await apiClient.post<AccountingConnection>(
      "/integrations/connections",
      {
        provider,
        authMethod,
        credentials,
      },
    );
    return res.data;
  },

  // OAuth Authorization URLs
  getXeroAuthUrl: async (): Promise<{ authUrl?: string; url?: string }> => {
    const res = await apiClient.post<{ authUrl?: string; url?: string }>(
      "/integrations/connections/xero/auth-url",
    );
    return res.data;
  },

  getMyobAuthUrl: async (): Promise<{ authUrl?: string; url?: string }> => {
    const res = await apiClient.post<{ authUrl?: string; url?: string }>(
      "/integrations/connections/myob/auth-url",
    );
    return res.data;
  },

  getQuickBooksAuthUrl: async (): Promise<{
    authUrl?: string;
    url?: string;
  }> => {
    const res = await apiClient.post<{ authUrl?: string; url?: string }>(
      "/integrations/connections/quickbooks/auth-url",
    );
    return res.data;
  },

  // Xero Tenant Selection
  getXeroTenants: async (
    connectionId: string,
  ): Promise<Array<{ id: string; name: string }>> => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      `/integrations/connections/xero/${connectionId}/tenants`,
    );
    return res.data;
  },

  selectXeroTenant: async (
    connectionId: string,
    tenantId: string,
  ): Promise<{ success: boolean }> => {
    const res = await apiClient.post<{ success: boolean }>(
      `/integrations/connections/xero/${connectionId}/select-tenant`,
      {
        tenantId,
      },
    );
    return res.data;
  },

  getOrganisationInfo: async (
    connectionId: string,
  ): Promise<OrganisationInfo> => {
    const res = await apiClient.get<OrganisationInfo>(
      `/integrations/connections/${connectionId}/organisation`,
    );
    return res.data;
  },

  // Sync Operations
  triggerSync: async (connectionId: string): Promise<{ jobId: string }> => {
    const res = await apiClient.post<{ jobId: string }>(
      `/integrations/connections/${connectionId}/sync`,
    );
    return res.data;
  },

  getSyncStatus: async (
    connectionId: string,
    jobId: string,
  ): Promise<{ status: string; progress?: number; message?: string }> => {
    const res = await apiClient.get<{
      status: string;
      progress?: number;
      message?: string;
    }>(`/integrations/connections/${connectionId}/sync-status/${jobId}`);
    return res.data;
  },

  getSyncLogs: async (
    connectionId: string,
    page = 1,
    limit = 50,
  ): Promise<{ logs: SyncLog[]; total: number; page: number }> => {
    const res = await apiClient.get<{
      logs: SyncLog[];
      total: number;
      page: number;
    }>(
      `/integrations/connections/${connectionId}/sync-logs?page=${page}&limit=${limit}`,
    );
    return res.data;
  },

  getSyncLogDetail: async (logId: string): Promise<SyncLog> => {
    const res = await apiClient.get<SyncLog>(
      `/integrations/sync-logs/${logId}`,
    );
    return res.data;
  },

  // CSV Operations
  uploadCsv: async (
    file: File,
    provider?: Provider,
  ): Promise<CsvUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    if (provider) formData.append("provider", provider);

    const res = await apiClient.post<CsvUploadResult>(
      "/integrations/csv/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  validateCsvMappings: async (
    uploadId: string,
    mappings: CsvMapping[],
  ): Promise<CsvValidationResult> => {
    const res = await apiClient.post<CsvValidationResult>(
      "/integrations/csv/mappings",
      {
        uploadId,
        mappings,
      },
    );
    return res.data;
  },

  commitCsv: async (
    uploadId: string,
    mappings: CsvMapping[],
    templateName?: string,
  ): Promise<{ jobId: string }> => {
    const res = await apiClient.post<{ jobId: string }>(
      "/integrations/csv/commit",
      {
        uploadId,
        mappings,
        templateName,
      },
    );
    return res.data;
  },

  getCsvTemplates: async (): Promise<CsvTemplate[]> => {
    const res = await apiClient.get<CsvTemplate[]>(
      "/integrations/csv/templates",
    );
    return res.data;
  },
};

// ── Invites Endpoints ──────────────────────────────────────────────────────────

export const invitesApi = {
  createInvite: async (
    provider: string,
    inviteeEmail?: string,
  ): Promise<Invite> => {
    const res = await apiClient.post<Invite>("/integrations/invites", {
      provider,
      inviteeEmail,
    });
    return res.data;
  },

  listInvites: async (): Promise<Invite[]> => {
    const res = await apiClient.get<Invite[]>("/integrations/invites");
    return res.data;
  },

  revokeInvite: async (id: string): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(
      `/integrations/invites/${id}`,
    );
    return res.data;
  },

  // Public Redeem Endpoints
  getRedeemDetails: async (
    token: string,
  ): Promise<{
    provider: Provider;
    inviterEmail: string;
    inviteeEmail?: string;
  }> => {
    const res = await apiClient.get<{
      provider: Provider;
      inviterEmail: string;
      inviteeEmail?: string;
    }>(`/integrations/invites/redeem/${token}`);
    return res.data;
  },

  getRedeemXeroAuthUrl: async (token: string): Promise<{ url: string }> => {
    const res = await apiClient.post<{ url: string }>(
      `/integrations/invites/redeem/${token}/xero/auth-url`,
    );
    return res.data;
  },

  getRedeemMyobAuthUrl: async (token: string): Promise<{ url: string }> => {
    const res = await apiClient.post<{ url: string }>(
      `/integrations/invites/redeem/${token}/myob/auth-url`,
    );
    return res.data;
  },

  getRedeemQuickBooksAuthUrl: async (
    token: string,
  ): Promise<{ url: string }> => {
    const res = await apiClient.post<{ url: string }>(
      `/integrations/invites/redeem/${token}/quickbooks/auth-url`,
    );
    return res.data;
  },
};
