import {
  User,
  Listing,
  Order,
  ChatMessage,
  ChatConversation,
  VerificationRequest,
  Report,
  AdminStats,
} from "../types";

let currentToken: string = localStorage.getItem("rayshop_token") || "";

export function setAuthToken(token: string) {
  currentToken = token;
  localStorage.setItem("rayshop_token", token);
}

export function clearAuthToken() {
  currentToken = "";
  localStorage.removeItem("rayshop_token");
}

export function getAuthToken(): string {
  return currentToken;
}

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
  };
}

// Auth API
export async function getMe(): Promise<{ user: User }> {
  const res = await fetch("/api/auth/me", { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function loginUser(
  identifier: string,
  password?: string
): Promise<{ user: User; token: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  setAuthToken(data.token);
  return data;
}

export async function registerUser(params: {
  username: string;
  email: string;
  phone?: string;
  freeFireUid?: string;
  password?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  setAuthToken(data.token);
  return data;
}

export async function unlockAdminWithPin(secretPin: string): Promise<{ user: User; token: string }> {
  const res = await fetch("/api/admin/secret-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secretPin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid PIN");
  setAuthToken(data.token);
  return data;
}

export async function getDemoUsers(): Promise<{ users: User[] }> {
  const res = await fetch("/api/auth/demo-users");
  if (!res.ok) throw new Error("Failed to fetch demo users");
  return res.json();
}

export async function updateUserProfile(updates: {
  avatar?: string;
  phone?: string;
  freeFireUid?: string;
  bio?: string;
}): Promise<{ user: User; message: string }> {
  const res = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile");
  return data;
}

// Listings API
export async function getListings(params?: {
  search?: string;
  region?: string;
  rank?: string;
  minPrice?: number;
  maxPrice?: number;
  minLevel?: number;
  sort?: string;
  sellerId?: string;
}): Promise<{ listings: Listing[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.region && params.region !== "all") query.set("region", params.region);
  if (params?.rank && params.rank !== "all") query.set("rank", params.rank);
  if (params?.minPrice) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice) query.set("maxPrice", String(params.maxPrice));
  if (params?.minLevel) query.set("minLevel", String(params.minLevel));
  if (params?.sort) query.set("sort", params.sort);
  if (params?.sellerId) query.set("sellerId", params.sellerId);

  const res = await fetch(`/api/listings?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function getListingById(id: string): Promise<{ listing: Listing }> {
  const res = await fetch(`/api/listings/${id}`);
  if (!res.ok) throw new Error("Listing not found");
  return res.json();
}

export async function createListing(data: Partial<Listing>): Promise<{ listing: Listing }> {
  const res = await fetch("/api/listings", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || "Failed to create listing");
  return json;
}

export async function deleteListing(id: string): Promise<void> {
  const res = await fetch(`/api/listings/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Failed to delete listing");
  }
}

// Verification API
export async function submitVerification(params: {
  phone: string;
  email: string;
  reasonLetter: string;
}): Promise<{ request: VerificationRequest; user: User }> {
  const res = await fetch("/api/verification/request", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to submit verification request");
  return json;
}

export async function getMyVerificationStatus(): Promise<{
  status: string;
  isVerifiedSeller: boolean;
  request: VerificationRequest | null;
}> {
  const res = await fetch("/api/verification/my-status", { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to get verification status");
  return res.json();
}

// Orders API
export async function createOrder(params: {
  listingId: string;
  paymentMethod: "OPay" | "PalmPay";
  accountNumberPaid?: string;
  receiptUrl: string;
  receiptNotes?: string;
}): Promise<{ order: Order; chatId: string }> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create order");
  return json;
}

export async function approveOrderReceipt(orderId: string): Promise<{ order: Order; message: string }> {
  const res = await fetch(`/api/orders/${orderId}/approve-receipt`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to approve payment receipt");
  return json;
}

export async function uploadOrderReceipt(
  orderId: string,
  receiptUrl: string,
  receiptNotes?: string
): Promise<{ order: Order; message: string }> {
  const res = await fetch(`/api/orders/${orderId}/upload-receipt`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ receiptUrl, receiptNotes }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to upload receipt");
  return json;
}

export async function getOrders(): Promise<{ orders: Order[] }> {
  const res = await fetch("/api/orders", { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function updateOrderStatus(
  orderId: string,
  params: {
    status?: string;
    disputeReason?: string;
    credentialsDelivered?: boolean;
  }
): Promise<{ order: Order }> {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to update order");
  return json;
}

// Support Chat Gemini API
export async function askSupportAssistant(
  message: string,
  history?: Array<{ role: "user" | "assistant"; parts: string }>
): Promise<{ reply: string; source?: string }> {
  const res = await fetch("/api/support/gemini-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to get response from AI Support");
  return json;
}

// Chats API
export async function getChats(): Promise<{ chats: ChatConversation[] }> {
  const res = await fetch("/api/chats", { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function getOrCreateChat(targetUserId: string, listingId?: string): Promise<{ chat: ChatConversation }> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ targetUserId, listingId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to open chat");
  return json;
}

export async function getChatMessages(chatId: string): Promise<{ chat: ChatConversation; messages: ChatMessage[] }> {
  const res = await fetch(`/api/chats/${chatId}/messages`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function sendMessage(
  chatId: string,
  text: string,
  attachment?: string
): Promise<{ message: ChatMessage }> {
  const res = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ text, attachment }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to send message");
  return json;
}

// Reports API
export async function submitReport(params: {
  targetType: "user" | "listing" | "message" | "transaction";
  targetId: string;
  targetTitle?: string;
  reason: string;
  details: string;
}): Promise<{ report: Report }> {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to submit report");
  return json;
}

// Admin API
export async function getAdminStats(): Promise<{ stats: AdminStats }> {
  const res = await fetch("/api/admin/stats", { headers: getHeaders() });
  if (!res.ok) throw new Error("Admin access required");
  return res.json();
}

export async function getAdminUsers(): Promise<{ users: User[] }> {
  const res = await fetch("/api/admin/users", { headers: getHeaders() });
  if (!res.ok) throw new Error("Admin access required");
  return res.json();
}

export async function adminVerifyUser(userId: string, action: "approve" | "revoke"): Promise<{ user: User }> {
  const res = await fetch(`/api/admin/users/${userId}/verify`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ action }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to verify user");
  return json;
}

export async function adminSuspendUser(userId: string): Promise<{ user: User }> {
  const res = await fetch(`/api/admin/users/${userId}/suspend`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to suspend user");
  return json;
}

export async function getAdminVerifications(): Promise<{ requests: VerificationRequest[] }> {
  const res = await fetch("/api/admin/verifications", { headers: getHeaders() });
  if (!res.ok) throw new Error("Admin access required");
  return res.json();
}

export async function adminActionVerification(
  requestId: string,
  action: "approve" | "reject",
  adminNotes?: string
): Promise<{ request: VerificationRequest; user?: User }> {
  const res = await fetch(`/api/admin/verifications/${requestId}/action`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ action, adminNotes }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to take action on verification");
  return json;
}

export async function getAdminReports(): Promise<{ reports: Report[] }> {
  const res = await fetch("/api/admin/reports", { headers: getHeaders() });
  if (!res.ok) throw new Error("Admin access required");
  return res.json();
}

export async function updateReportStatus(reportId: string, status: string): Promise<{ report: Report }> {
  const res = await fetch(`/api/admin/reports/${reportId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function getAdminOrders(): Promise<{ orders: Order[] }> {
  const res = await fetch("/api/admin/orders", { headers: getHeaders() });
  if (!res.ok) throw new Error("Admin access required");
  return res.json();
}

// Real-time EventSource listener
export function subscribeToRealtimeEvents(userId: string, onEvent: (eventType: string, data: any) => void): () => void {
  const eventSource = new EventSource(`/api/realtime/stream?userId=${userId}`);

  const eventTypes = [
    "user:new",
    "user:updated",
    "listing:new",
    "listing:updated",
    "listing:deleted",
    "verification:new",
    "verification:updated",
    "order:new",
    "order:updated",
    "chat:new",
    "chat:updated",
    "chat:message",
    "report:new",
  ];

  eventTypes.forEach((type) => {
    eventSource.addEventListener(type, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(type, data);
      } catch (err) {
        console.error("Error parsing SSE data", err);
      }
    });
  });

  return () => {
    eventSource.close();
  };
}
