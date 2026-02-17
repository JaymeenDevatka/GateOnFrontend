// Dummy API layer – replace with real HTTP calls later.

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
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

export async function fetchEventById(eventId) {
  return request(`/api/events/${encodeURIComponent(eventId)}`);
}

export async function createEventApi(payload) {
  return request("/api/events", { method: "POST", body: payload });
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

export async function checkInBookingApi(bookingId) {
  return request(`/api/bookings/${encodeURIComponent(bookingId)}/checkin`, {
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
