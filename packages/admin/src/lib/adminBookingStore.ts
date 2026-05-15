import { getSupabase } from "./supabase";

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

export type RecordedBooking = StoredBooking;

type BookingDbRow = {
  order_id: string;
  transaction_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  gross_amount: number;
  check_in: string;
  check_out: string;
  property_name: string;
  property_id: number | null;
  guests: number;
  rooms: number;
  special_requests: string;
  payment_type: string | null;
  transaction_status: string | null;
  payment_status: PaymentUiStatus;
  recorded_at: string;
};

function rowToStored(r: BookingDbRow): StoredBooking {
  return {
    order_id: r.order_id,
    transaction_id: r.transaction_id ?? undefined,
    guestName: r.guest_name,
    guestEmail: r.guest_email,
    guestPhone: r.guest_phone,
    gross_amount: r.gross_amount,
    checkIn: r.check_in,
    checkOut: r.check_out,
    propertyName: r.property_name,
    property_id: r.property_id,
    guests: r.guests,
    rooms: r.rooms,
    special_requests: r.special_requests,
    payment_type: r.payment_type ?? undefined,
    transaction_status: r.transaction_status ?? undefined,
    payment_status: r.payment_status,
    recordedAt: r.recorded_at,
  };
}

export async function fetchAllBookingsSorted(): Promise<StoredBooking[]> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sesi habis — silakan login lagi");

  const { data, error } = await supabase.from("bookings").select("*").order("recorded_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as BookingDbRow[]).map(rowToStored);
}

export function getSuccessfulBookingsFromList(list: StoredBooking[]): StoredBooking[] {
  return list.filter((b) => b.payment_status === "berhasil");
}

function parseYmdLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function toLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function expandStayNightDates(checkIn: string, checkOut: string): string[] {
  if (!checkIn || !checkOut || checkIn >= checkOut) return [];
  const out: string[] = [];
  const cur = parseYmdLocal(checkIn);
  const end = parseYmdLocal(checkOut);
  while (cur < end) {
    out.push(toLocalYmd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function deriveBookingStats(list: StoredBooking[]): { count: number; revenue: number } {
  const ok = getSuccessfulBookingsFromList(list);
  const revenue = ok.reduce((sum, b) => {
    const n = Number(b.gross_amount);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  return { count: ok.length, revenue };
}

export function subscribeBookingUpdates(onUpdate: () => void): () => void {
  const supabase = getSupabase();
  const channel = supabase
    .channel("wolio-bookings-db")
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => onUpdate())
    .subscribe();

  const interval = window.setInterval(onUpdate, 8000);

  return () => {
    void supabase.removeChannel(channel);
    window.clearInterval(interval);
  };
}

export async function deleteBooking(orderId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("bookings").delete().eq("order_id", orderId);
  if (error) throw new Error(error.message);
}

export async function updateBooking(orderId: string, updates: Partial<StoredBooking>): Promise<void> {
  const supabase = getSupabase();
  const dbUpdates: Partial<BookingDbRow> = {};
  
  if (updates.guestName !== undefined) dbUpdates.guest_name = updates.guestName;
  if (updates.guestEmail !== undefined) dbUpdates.guest_email = updates.guestEmail;
  if (updates.guestPhone !== undefined) dbUpdates.guest_phone = updates.guestPhone;
  if (updates.gross_amount !== undefined) dbUpdates.gross_amount = updates.gross_amount;
  if (updates.checkIn !== undefined) dbUpdates.check_in = updates.checkIn;
  if (updates.checkOut !== undefined) dbUpdates.check_out = updates.checkOut;
  if (updates.propertyName !== undefined) dbUpdates.property_name = updates.propertyName;
  if (updates.payment_status !== undefined) dbUpdates.payment_status = updates.payment_status;
  if (updates.payment_type !== undefined) dbUpdates.payment_type = updates.payment_type;
  if (updates.transaction_status !== undefined) dbUpdates.transaction_status = updates.transaction_status;

  const { error } = await supabase.from("bookings").update(dbUpdates).eq("order_id", orderId);
  if (error) throw new Error(error.message);
}
