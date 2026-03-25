// API layer – all requests go through proxy to backend.

async function request(path, { method = "GET", body, headers: customHeaders } = {}) {
  const headers = { ...customHeaders };
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(path, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data?.message
        ? data.message
        : "Request failed";
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function fetchEvents({ status } = {}) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await request(`/api/events${qs}`);
  return data.items ?? [];
}

/** Events created by the current user (requires userId for X-User-Id header) */
export async function fetchMyEvents(userId) {
  if (!userId) return [];
  const data = await request("/api/events/my-events", {
    headers: { "X-User-Id": userId },
  });
  return data.items ?? [];
}

/** Published events to browse (excludes current user's events if userId provided) */
export async function fetchBrowseEvents(userId = null) {
  const opts = userId ? { headers: { "X-User-Id": userId } } : {};
  const data = await request("/api/events/browse", opts);
  return data.items ?? [];
}

export async function signupApi({ name, email, password }) {
  const data = await request("/api/auth/signup", {
    method: "POST",
    body: { name, email, password },
  });
  return data;
}

export async function loginApi({ email, password }) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return data;
}

export async function fetchEventById(eventId) {
  return request(`/api/events/${encodeURIComponent(eventId)}`);
}

export async function createEventApi(payload, userId = null) {
  const headers = userId ? { "X-User-Id": userId } : {};
  return request("/api/events", {
    method: "POST",
    body: payload,
    headers: Object.keys(headers).length ? headers : undefined,
  });
}

export async function updateEventApi(eventId, payload, userId) {
  if (!userId) throw new Error("User ID required");
  return request(`/api/events/${encodeURIComponent(eventId)}`, {
    method: "PUT",
    body: payload,
    headers: { "X-User-Id": userId },
  });
}

export async function fetchBookings({ userId, eventId } = {}) {
  const params = new URLSearchParams();
  if (userId) params.set("userId", userId);
  if (eventId) params.set("eventId", eventId);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const data = await request(`/api/bookings${qs}`);
  return data.items ?? [];
}

export async function createBookingApi(payload) {
  return request("/api/bookings", { method: "POST", body: payload });
}

export async function cancelBookingApi(bookingId) {
  return request(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "POST",
  });
}

export async function checkInBookingApi(bookingIdOrTicketCode) {
  // If it looks like a ticket code (contains EVT-), use checkin endpoint with body
  if (String(bookingIdOrTicketCode).includes("EVT-")) {
    return request("/api/bookings/checkin", {
      method: "POST",
      body: { ticketCode: bookingIdOrTicketCode },
    });
  }
  // Otherwise use booking ID endpoint
  return request(`/api/bookings/${encodeURIComponent(bookingIdOrTicketCode)}/checkin`, {
    method: "POST",
  });
}

export async function fetchPromos() {
  const data = await request("/api/promos");
  return data.items ?? [];
}

export async function createPromoApi(payload) {
  return request("/api/promos", { method: "POST", body: payload });
}

export async function updatePromoApi(promoId, payload) {
  return request(`/api/promos/${encodeURIComponent(promoId)}`, {
    method: "PATCH",
    body: payload,
  });
}

// ─── Admin API ───────────────────────────────────────────

export async function fetchAdminStats(userId) {
  return request("/api/admin/stats", {
    headers: { "X-User-Id": userId },
  });
}

export async function fetchAdminUsers(userId) {
  const data = await request("/api/admin/users", {
    headers: { "X-User-Id": userId },
  });
  return data.items ?? [];
}

export async function updateUserStatusApi(userId, targetUserId, status) {
  return request(`/api/admin/users/${encodeURIComponent(targetUserId)}/status`, {
    method: "PATCH",
    body: { status },
    headers: { "X-User-Id": userId },
  });
}

export async function deleteAdminUser(userId, targetUserId) {
  return request(`/api/admin/users/${encodeURIComponent(targetUserId)}`, {
    method: "DELETE",
    headers: { "X-User-Id": userId },
  });
}

export async function fetchAdminEvents(userId) {
  const data = await request("/api/admin/events", {
    headers: { "X-User-Id": userId },
  });
  return data.items ?? [];
}

export async function deleteAdminEvent(userId, eventId) {
  return request(`/api/admin/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    headers: { "X-User-Id": userId },
  });
}

export async function fetchAdminBookings(userId) {
  const data = await request("/api/admin/bookings", {
    headers: { "X-User-Id": userId },
  });
  return data.items ?? [];
}

export async function fetchAdminAnalytics(userId) {
  return request("/api/admin/analytics", {
    headers: { "X-User-Id": userId },
  });
}

// ─── Payment API ─────────────────────────────────────────────────────────────

/**
 * Step 1: Ask the backend to create a Razorpay order.
 * Returns { free, orderId?, amount, currency, keyId?, paymentDbId?, pricing }
 */
export async function createPaymentOrder({ eventId, ticketId, quantity, promoCode }) {
  return request("/api/payments/create-order", {
    method: "POST",
    body: { eventId, ticketId, quantity, promoCode },
  });
}

/**
 * Step 2 (paid events): Verify Razorpay signature and create booking.
 * Returns the created booking.
 */
export async function verifyPaymentAndBook(payload) {
  return request("/api/payments/verify", {
    method: "POST",
    body: payload,
  });
}

/**
 * Step 2 (free events): Create booking directly, no payment.
 */
export async function freeBookingApi(payload) {
  return request("/api/payments/free-booking", {
    method: "POST",
    body: payload,
  });
}

// ─── Admin Payment API ────────────────────────────────────────────────────────

export async function fetchAdminPayments(userId, status = "") {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await request(`/api/admin/payments${qs}`, {
    headers: { "X-User-Id": userId },
  });
  return data.items ?? [];
}

export async function fetchAdminPaymentSummary(userId) {
  const data = await request("/api/admin/payments/summary", {
    headers: { "X-User-Id": userId },
  });
  return data.summary ?? [];
}

export async function distributePaymentApi(userId, paymentId, { amount, note }) {
  return request(`/api/admin/payments/${encodeURIComponent(paymentId)}/distribute`, {
    method: "POST",
    body: { amount, note },
    headers: { "X-User-Id": userId },
  });
}

export async function refundPaymentApi(userId, paymentId) {
  return request(`/api/admin/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: "POST",
    headers: { "X-User-Id": userId },
  });
}