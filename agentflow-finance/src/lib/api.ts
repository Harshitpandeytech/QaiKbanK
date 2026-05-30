/**
 * API Service Layer
 *
 * Centralized API client for communicating with the QaiKbanK backend.
 * Base URL: http://localhost:5000/api
 *
 * All requests attach JWT token from localStorage when available.
 */

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

/**
 * Generic fetch wrapper with auth header injection.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("qaikbank_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.message || body.error || `API Error: ${res.status}`);
  }

  return res.json();
}

// ─── Chat API ───

interface DecisionDetails {
  decision: "APPROVED" | "REJECTED" | "SALARY_REQUIRED" | null;
  creditScore: number | null;
  preApprovedLimit: number | null;
  requestedAmount: number | null;
  emi: number | null;
  reason: string | null;
}

export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    apiRequest<{
      success: boolean;
      reply: string;
      agentName: string;
      stage: string;
      sessionId: string;
      collectedData: Record<string, any>;
      decisionDetails?: DecisionDetails | null;
    }>("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message, sessionId }),
    }),

  getSession: (sessionId: string) =>
    apiRequest<{
      success: boolean;
      sessionId: string;
      currentStage: string;
      collectedData: Record<string, any>;
      decisionDetails?: DecisionDetails | null;
      messages: unknown[];
    }>(`/chat/session/${sessionId}`),

  getSessions: () =>
    apiRequest<{
      success: boolean;
      sessions: unknown[];
    }>("/chat/sessions"),
};

// ─── Auth API ───

export const authApi = {
  signup: (payload: { name: string; email: string; password: string; phone?: string }) =>
    apiRequest<{ success: boolean; user: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<{ success: boolean; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  googleLogin: (credential: string) =>
    apiRequest<{ success: boolean; user: any }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  me: () => apiRequest<{ success: boolean; user: any }>("/auth/me"),

  logout: () =>
    apiRequest<{ success: boolean }>("/auth/logout", {
      method: "POST",
    }),
};

// ─── Customer API (CRM) ───

export const customerApi = {
  getById: (customerId: string) =>
    apiRequest<Record<string, unknown>>(`/customer/${customerId}`),

  getByPhone: (phone: string) =>
    apiRequest<Record<string, unknown>>(`/customer/phone/${phone}`),
};

// ─── Credit Bureau API ───

export const creditApi = {
  getScore: (customerId: string) =>
    apiRequest<{ customerId: string; creditScore: number }>(
      `/credit/${customerId}`
    ),
};

// ─── Offer Mart API ───

export const offerApi = {
  getOffers: (customerId: string) =>
    apiRequest<{
      customerId: string;
      preApprovedLimit: number;
      interestRate: number;
    }>(`/offer/${customerId}`),
};

// ─── Upload API ───

export const uploadApi = {
  uploadSalarySlip: async (file: File) => {
    const formData = new FormData();
    formData.append("salarySlip", file);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("qaikbank_token")
        : null;

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData, // Don't set Content-Type — browser sets multipart boundary
      credentials: "include",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || `Upload failed: ${res.status}`);
    }

    return res.json() as Promise<{
      message: string;
      filePath: string;
      extractedSalary: number | null;
    }>;
  },
};

// ─── Loan Application API ───

export const applicationApi = {
  getApplications: () =>
    apiRequest<{
      success: boolean;
      count: number;
      data: any[];
    }>("/application"),

  getApplication: (id: string) =>
    apiRequest<{
      success: boolean;
      data: any;
    }>(`/application/${id}`),

  getSanctionDetails: (id: string) =>
    apiRequest<{
      success: boolean;
      sanctionReference: string;
      customerName: string;
      approvedAmount: number;
      interestRate: number;
      tenure: number;
      emi: number;
      approvalDate: string;
      explanation: { positives: string[]; riskFactors: string[] };
    }>(`/application/${id}/sanction`),
};

// ─── Document Uploads API ───

export const documentApi = {
  getDocuments: () =>
    apiRequest<{
      success: boolean;
      count: number;
      data: any[];
    }>("/upload"),
};

// ─── Health Check ───

export const healthApi = {
  check: () =>
    apiRequest<{ status: string; service: string; timestamp: string }>(
      "/health"
    ),
};
