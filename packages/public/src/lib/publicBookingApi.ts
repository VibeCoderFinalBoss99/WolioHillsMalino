import { getSupabase } from "./supabase";

const CHANNEL_NAME = "wolio-admin-bookings";

function notifyClients() {
  window.dispatchEvent(new CustomEvent("wolio-bookings-updated"));
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: "updated" });
    ch.close();
  } catch {
    /* optional */
  }
}

function bookingsWriteUrl(): string {
  const b = import.meta.env.BASE_URL || "/";
  const base = b.endsWith("/") ? b.slice(0, -1) : b;
  return `${base}/api/wolio/bookings`;
}

async function postBookingRecord(rec: StoredBooking): Promise<void> {
  const res = await fetch(bookingsWriteUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ record: rec }),
  });
  if (!res.ok) {
    const t = await res.text();
    let msg = t || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(t) as { error?: unknown };
      if (j.error) {
        msg = typeof j.error === "string" ? j.error : JSON.stringify(j.error);
      }
    } catch {
      /* keep */
    }
    throw new Error(msg);
  }
}

/** Status tampilan & laporan */
export type PaymentUiStatus = "berhasil" | "pending" | "gagal" | "dibatalkan";

export type StoredBooking = {
  order_id: string;
  transaction_id?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  gross_amount: number;
  checkIn: string;
  checkOut: string;
  propertyName: string;
  property_id?: number | null;
  guests?: number;
  rooms?: number;
  special_requests?: string;
  payment_type?: string;
  transaction_status?: string;
  payment_status: PaymentUiStatus;
  recordedAt: string;
};

export type SuccessBookingPayload = {
  order_id: string;
  transaction_id?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  gross_amount: string;
  checkIn: string;
  checkOut: string;
  propertyName: string;
  property_id?: number | null;
  guests?: number;
  rooms?: number;
  special_requests?: string;
  payment_type?: string;
  transaction_status?: string;
};

export type BookingSnapshot = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  propertyName: string;
  property_id?: number | null;
  guests?: number;
  rooms?: number;
  special_requests?: string;
};

function mapMidtransToUi(transactionStatus?: string): PaymentUiStatus {
  const s = (transactionStatus || "").toLowerCase();
  if (s === "settlement" || s === "capture") return "berhasil";
  if (s === "pending") return "pending";
  if (s === "cancel") return "dibatalkan";
  if (s === "deny" || s === "expire" || s === "failure") return "gagal";
  if (s === "refund" || s === "partial_refund") return "dibatalkan";
  return "gagal";
}

async function upsertRemote(rec: StoredBooking): Promise<void> {
  await postBookingRecord(rec);
  notifyClients();
}

export async function fetchPublicBookedDatesSet(): Promise<Set<string>> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("get_public_booked_dates");
    if (error) throw new Error(error.message);
    const rows = (data as { stay_date: string }[] | null) ?? [];
    return new Set(rows.map((r) => String(r.stay_date).slice(0, 10)));
  } catch {
    return new Set();
  }
}

export async function recordPendingOrder(payload: SuccessBookingPayload): Promise<void> {
  const rec: StoredBooking = {
    order_id: payload.order_id,
    transaction_id: payload.transaction_id,
    guestName: payload.guestName,
    guestEmail: payload.guestEmail,
    guestPhone: payload.guestPhone,
    gross_amount: 0,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    propertyName: payload.propertyName,
    property_id: payload.property_id ?? null,
    guests: payload.guests ?? 1,
    rooms: payload.rooms ?? 1,
    special_requests: payload.special_requests ?? "",
    payment_type: payload.payment_type,
    transaction_status: payload.transaction_status || "pending",
    payment_status: "pending",
    recordedAt: new Date().toISOString(),
  };
  await upsertRemote(rec);
}

export async function recordPaymentOutcome(payload: SuccessBookingPayload): Promise<void> {
  const ui = mapMidtransToUi(payload.transaction_status);
  const grossFull = Math.round(Number(payload.gross_amount));
  const grossForStats = ui === "berhasil" && Number.isFinite(grossFull) ? grossFull : 0;

  const rec: StoredBooking = {
    order_id: payload.order_id,
    transaction_id: payload.transaction_id,
    guestName: payload.guestName,
    guestEmail: payload.guestEmail,
    guestPhone: payload.guestPhone,
    gross_amount: grossForStats,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    propertyName: payload.propertyName,
    property_id: payload.property_id ?? null,
    guests: payload.guests ?? 1,
    rooms: payload.rooms ?? 1,
    special_requests: payload.special_requests ?? "",
    payment_type: payload.payment_type,
    transaction_status: payload.transaction_status,
    payment_status: ui,
    recordedAt: new Date().toISOString(),
  };
  await upsertRemote(rec);
}

export async function recordFailedOrCancelledOrder(payload: {
  order_id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  gross_amount: string;
  checkIn: string;
  checkOut: string;
  propertyName: string;
  property_id?: number | null;
  guests?: number;
  rooms?: number;
  special_requests?: string;
  transaction_status?: string;
  reason?: string;
}): Promise<void> {
  const ui: PaymentUiStatus =
    (payload.transaction_status || "").toLowerCase() === "cancel" ? "dibatalkan" : "gagal";
  const rec: StoredBooking = {
    order_id: payload.order_id,
    guestName: payload.guestName,
    guestEmail: payload.guestEmail,
    guestPhone: payload.guestPhone,
    gross_amount: 0,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    propertyName: payload.propertyName,
    property_id: payload.property_id ?? null,
    guests: payload.guests ?? 1,
    rooms: payload.rooms ?? 1,
    special_requests: payload.special_requests ?? "",
    transaction_status: payload.transaction_status || payload.reason,
    payment_status: ui,
    recordedAt: new Date().toISOString(),
  };
  await upsertRemote(rec);
}

/** Server menggabungkan dengan baris existing (recorded_at & field kosong). */
export async function markOrderCancelledByUser(order_id: string, snapshot: BookingSnapshot): Promise<void> {
  const rec: StoredBooking = {
    order_id,
    guestName: snapshot.guestName,
    guestEmail: snapshot.guestEmail,
    guestPhone: snapshot.guestPhone,
    gross_amount: 0,
    checkIn: snapshot.checkIn,
    checkOut: snapshot.checkOut,
    propertyName: snapshot.propertyName,
    property_id: snapshot.property_id ?? null,
    guests: snapshot.guests ?? 1,
    rooms: snapshot.rooms ?? 1,
    special_requests: snapshot.special_requests ?? "",
    payment_status: "dibatalkan",
    transaction_status: "cancel",
    recordedAt: new Date().toISOString(),
  };
  await upsertRemote(rec);
}
