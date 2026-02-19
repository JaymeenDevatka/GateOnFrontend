import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  cancelBookingApi,
  checkInBookingApi,
  createBookingApi,
  createPromoApi,
  fetchBookings,
  fetchPromos,
  updatePromoApi,
} from "../services/api.js";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapPromoFromApi = (p) => ({
    id: p.id,
    code: p.code,
    type: p.type === "flat" ? "AMOUNT" : "PERCENT",
    value: Number(p.value) || 0,
    active: Boolean(p.active),
    createdBy: "server",
    createdAt: p.createdAt,
  });

  const mapBookingFromApi = (b) => {
    const name = b.attendee?.name || "";
    const [firstName, ...rest] = String(name).split(" ").filter(Boolean);
    const lastName = rest.join(" ");

    return {
      id: b.id,
      ticketCode: b.ticketCode || b.id,
      userId: b.userId,
      eventId: String(b.eventId),
      ticketId: String(b.ticketId),
      quantity: b.quantity,
      attendee: {
        firstName: firstName || "",
        lastName: lastName || "",
        email: b.attendee?.email || "",
        phone: b.attendee?.phone || "",
      },
      pricing: {
        unitPrice: Number(b.unitPrice) || 0,
        baseTotal: Number(b.subtotal) || 0,
        discount: Number(b.discount) || 0,
        total: Number(b.total) || 0,
        promoCode: b.promoCode || null,
        groupDiscount: Number(b.groupDiscount) || 0,
      },
      delivery: {
        email: b.delivery === "email",
        whatsapp: b.delivery === "whatsapp",
      },
      status: b.status,
      checkedInAt: b.checkedInAt,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      _raw: b,
    };
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [b, p] = await Promise.all([fetchBookings(), fetchPromos()]);
        if (cancelled) return;
        setBookings((b || []).map(mapBookingFromApi));
        setPromoCodes((p || []).map(mapPromoFromApi));
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Unable to load bookings.");
        setBookings([]);
        setPromoCodes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const addPromoCode = async ({ code, type, value }) => {
    const normalized = String(code || "")
      .trim()
      .toUpperCase();
    if (!normalized) return { ok: false, error: "Enter a code." };

    const numericValue = Number(value);
    if (!type || Number.isNaN(numericValue)) {
      return { ok: false, error: "Invalid promo configuration." };
    }
    if (promoCodes.some((p) => p.code === normalized)) {
      return { ok: false, error: "Code already exists." };
    }

    const payload = {
      code: normalized,
      type: type === "AMOUNT" ? "flat" : "percent",
      value: numericValue,
      active: true,
    };

    try {
      const created = await createPromoApi(payload);
      setPromoCodes((prev) => [mapPromoFromApi(created), ...prev]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.message || "Unable to add promo code." };
    }
  };

  const removePromoCode = async (code) => {
    const normalized = String(code || "")
      .trim()
      .toUpperCase();
    const promo = promoCodes.find((p) => p.code === normalized);
    if (!promo?.id) {
      setPromoCodes((prev) => prev.filter((p) => p.code !== normalized));
      return;
    }

    try {
      await updatePromoApi(promo.id, { active: false });
      setPromoCodes((prev) => prev.filter((p) => p.code !== normalized));
    } catch {
      // best-effort; keep UI consistent
      setPromoCodes((prev) => prev.filter((p) => p.code !== normalized));
    }
  };

  const findPromo = (code) => {
    const normalized = String(code || "")
      .trim()
      .toUpperCase();
    if (!normalized) return null;
    return (
      promoCodes.find((p) => p.code === normalized && p.active !== false) ||
      null
    );
  };

  const computeDiscount = ({ unitPrice, quantity, promoCode }) => {
    const baseTotal = unitPrice * quantity;

    const promo = promoCode ? findPromo(promoCode) : null;
    let promoDiscount = 0;
    if (promo) {
      if (promo.type === "PERCENT") {
        promoDiscount = Math.round((baseTotal * promo.value) / 100);
      } else if (promo.type === "AMOUNT") {
        promoDiscount = Math.min(baseTotal, Math.round(promo.value));
      }
    }

    const groupSets = quantity >= 6 ? Math.floor(quantity / 6) : 0;
    const groupDiscount = groupSets > 0 ? unitPrice * groupSets : 0;

    const discount = Math.min(baseTotal, promoDiscount + groupDiscount);
    return { discount, promo, groupDiscount };
  };

  const createBooking = ({
    event,
    ticket,
    quantity,
    attendee,
    promoCode,
    delivery,
  }) => {
    // Get current user value (not from closure)
    const currentUser = user;
    const currentIsAuthenticated = isAuthenticated();
    
    console.log("createBooking called - User check:", { 
      currentUser, 
      currentIsAuthenticated,
      hasUserId: !!currentUser?.id 
    });
    
    if (!currentIsAuthenticated || !currentUser || !currentUser.id) {
      return Promise.resolve({ 
        ok: false, 
        error: "You must be logged in to create a booking. Please log in and try again." 
      });
    }
    if (!event || !ticket) {
      return Promise.resolve({ ok: false, error: "Missing event/ticket." });
    }

    const qty = Math.max(1, Math.min(5, Number(quantity) || 1));
    const fullName =
      `${attendee?.firstName || ""} ${attendee?.lastName || ""}`.trim();
    const deliveryMode = delivery?.whatsapp ? "whatsapp" : "email";

    return (async () => {
      try {
        console.log("Calling createBookingApi with userId:", currentUser.id);
        const created = await createBookingApi({
          eventId: String(event.id),
          ticketId: String(ticket.id),
          quantity: qty,
          userId: currentUser.id,
          attendee: {
            name: fullName || currentUser.name || "Attendee",
            email: attendee?.email || currentUser.email || "",
            phone: attendee?.phone || "",
            location: "",
          },
          promoCode: promoCode || undefined,
          delivery: deliveryMode,
        });

        const mapped = mapBookingFromApi(created);
        setBookings((prev) => [mapped, ...prev]);
        return { ok: true, booking: mapped };
      } catch (e) {
        console.error("Booking creation error:", e);
        const errorMsg = e?.data?.message || e?.message || "Unable to create booking.";
        return { ok: false, error: errorMsg };
      }
    })();
  };

  const cancelBooking = async (bookingId) => {
    try {
      const updated = await cancelBookingApi(bookingId);
      const mapped = mapBookingFromApi(updated);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? mapped : b)));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.message || "Unable to cancel booking." };
    }
  };

  const checkInBooking = async (bookingId) => {
    try {
      const updated = await checkInBookingApi(bookingId);
      const mapped = mapBookingFromApi(updated);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? mapped : b)));
      return { ok: true, booking: mapped };
    } catch (e) {
      return { ok: false, error: e?.message || "Unable to check in." };
    }
  };

  const getBookingsByUser = (userId) =>
    bookings.filter((b) => b.userId === userId);

  const getBookingsByEvent = (eventId) =>
    bookings.filter((b) => b.eventId === String(eventId));

  const getConfirmedBookingsByEvent = (eventId) =>
    bookings.filter(
      (b) => b.eventId === String(eventId) && b.status === "confirmed",
    );

  const getTicketSoldCount = (eventId, ticketId) => {
    return getConfirmedBookingsByEvent(eventId)
      .filter((b) => b.ticketId === String(ticketId))
      .reduce((sum, b) => sum + (b.quantity || 0), 0);
  };

  const value = useMemo(
    () => ({
      bookings,
      promoCodes,
      loading,
      error,
      addPromoCode,
      removePromoCode,
      findPromo,
      createBooking,
      cancelBooking,
      checkInBooking,
      getBookingsByUser,
      getBookingsByEvent,
      getConfirmedBookingsByEvent,
      getTicketSoldCount,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookings, promoCodes, loading, error, user],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBookingContext() {
  const ctx = useContext(BookingContext);
  if (!ctx)
    throw new Error("useBookingContext must be used within BookingProvider");
  return ctx;
}
