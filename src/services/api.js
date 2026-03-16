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
