import type { RecordedBooking, PaymentUiStatus } from "./adminBookingStore";

/* ── Time range presets ────────────────────────────────────── */

export type TimeRangePreset = "7d" | "1m" | "3m" | "6m" | "1y" | "all";

export const TIME_RANGE_OPTIONS: { value: TimeRangePreset; label: string }[] = [
  { value: "7d", label: "7 hari" },
  { value: "1m", label: "1 bulan" },
  { value: "3m", label: "3 bulan" },
  { value: "6m", label: "6 bulan" },
  { value: "1y", label: "1 tahun" },
  { value: "all", label: "Semua waktu" },
];

export type PaymentStatusFilter = "all" | PaymentUiStatus;

export const PAYMENT_STATUS_FILTER_OPTIONS: { value: PaymentStatusFilter; label: string }[] = [
  { value: "all", label: "Semua status" },
  { value: "berhasil", label: "Berhasil" },
  { value: "pending", label: "Pending" },
  { value: "dibatalkan", label: "Cancel" },
];

/* ── Granularity logic ─────────────────────────────────────── */

export type Granularity = "daily" | "weekly" | "monthly";

export function getChartGranularity(preset: TimeRangePreset): Granularity {
  switch (preset) {
    case "7d": return "daily";
    case "1m": return "daily";
    case "3m": return "weekly";
    case "6m": return "weekly";
    case "1y": return "monthly";
    case "all": return "monthly";
  }
}

export function getGranularityLabel(g: Granularity): string {
  switch (g) {
    case "daily": return "Harian";
    case "weekly": return "Mingguan";
    case "monthly": return "Bulanan";
  }
}

export function getPeriodColumnLabel(g: Granularity): string {
  switch (g) {
    case "daily": return "TANGGAL";
    case "weekly": return "PERIODE (MINGGU)";
    case "monthly": return "PERIODE (BULAN)";
  }
}

/* ── Date helpers ──────────────────────────────────────────── */

export function toLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function bookingTimeMs(b: RecordedBooking): number {
  const t = new Date(b.recordedAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function getTimeRangeDays(preset: TimeRangePreset): number {
  switch (preset) {
    case "7d": return 7;
    case "1m": return 30;
    case "3m": return 90;
    case "6m": return 180;
    case "1y": return 365;
    case "all": return 0;
  }
}

export function getTimeRangeCutoffMs(preset: TimeRangePreset): number {
  const days = getTimeRangeDays(preset);
  if (days === 0) return 0;
  return Date.now() - days * 86_400_000;
}

export function filterBookingsByTimeRange(bookings: RecordedBooking[], preset: TimeRangePreset): RecordedBooking[] {
  if (preset === "all") return bookings;
  const cutoff = getTimeRangeCutoffMs(preset);
  return bookings.filter((b) => bookingTimeMs(b) >= cutoff);
}

/* ── Data series aggregation ───────────────────────────────── */

export type SeriesPoint = { label: string; dateKey: string; count: number; revenue: number };

function getWeekKey(d: Date): string {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86_400_000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatWeekLabel(weekKey: string): string {
  return `Mgg ${weekKey.split("-W")[1]}`;
}

function formatMonthLabel(monthKey: string): string {
  const parts = monthKey.split("-");
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${MONTH_NAMES_SHORT[monthIdx]} ${parts[0].slice(2)}`;
}

export function buildAggregatedSeries(
  bookings: RecordedBooking[],
  preset: TimeRangePreset,
): SeriesPoint[] {
  const granularity = getChartGranularity(preset);
  const days = getTimeRangeDays(preset);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Build empty buckets
  const buckets = new Map<string, { label: string; count: number; revenue: number }>();

  if (granularity === "daily") {
    const d = days || 30;
    for (let i = d - 1; i >= 0; i--) {
      const dt = new Date(now);
      dt.setDate(dt.getDate() - i);
      const key = toLocalYmd(dt);
      buckets.set(key, { label: key.slice(5), count: 0, revenue: 0 }); // MM-DD
    }
  } else if (granularity === "weekly") {
    const d = days || 365;
    const weeks = Math.ceil(d / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const dt = new Date(now);
      dt.setDate(dt.getDate() - i * 7);
      const key = getWeekKey(dt);
      if (!buckets.has(key)) {
        buckets.set(key, { label: formatWeekLabel(key), count: 0, revenue: 0 });
      }
    }
  } else {
    // monthly
    const d = days || 730;
    const months = Math.ceil(d / 30);
    for (let i = months - 1; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(dt);
      buckets.set(key, { label: formatMonthLabel(key), count: 0, revenue: 0 });
    }
  }

  // Fill buckets
  for (const b of bookings) {
    const dt = new Date(b.recordedAt);
    if (!Number.isFinite(dt.getTime())) continue;
    let key: string;
    if (granularity === "daily") key = toLocalYmd(dt);
    else if (granularity === "weekly") key = getWeekKey(dt);
    else key = getMonthKey(dt);

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count += 1;
      bucket.revenue += Number.isFinite(b.gross_amount) ? b.gross_amount : 0;
    }
  }

  const result: SeriesPoint[] = [];
  for (const [dateKey, val] of buckets) {
    result.push({ dateKey, label: val.label, count: val.count, revenue: val.revenue });
  }
  return result;
}

/* ── KPI helpers ───────────────────────────────────────────── */

export function computeMonthlyComparison(bookings: RecordedBooking[]) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const thisMonth = bookings.filter((b) => {
    const d = new Date(b.recordedAt);
    return d >= thisMonthStart && d <= now;
  });
  const lastMonth = bookings.filter((b) => {
    const d = new Date(b.recordedAt);
    return d >= lastMonthStart && d <= lastMonthEnd;
  });

  const thisCount = thisMonth.length;
  const lastCount = lastMonth.length;
  const thisSuccess = thisMonth.filter((b) => b.payment_status === "berhasil");
  const lastSuccess = lastMonth.filter((b) => b.payment_status === "berhasil");
  const thisRevenue = thisSuccess.reduce((s, b) => s + (Number.isFinite(b.gross_amount) ? b.gross_amount : 0), 0);
  const lastRevenue = lastSuccess.reduce((s, b) => s + (Number.isFinite(b.gross_amount) ? b.gross_amount : 0), 0);

  const thisCancelCount = thisMonth.filter((b) => b.payment_status === "dibatalkan" || b.payment_status === "gagal").length;
  const thisCancelRate = thisCount > 0 ? (thisCancelCount / thisCount) * 100 : 0;
  const lastCancelCount = lastMonth.filter((b) => b.payment_status === "dibatalkan" || b.payment_status === "gagal").length;
  const lastCancelRate = lastCount > 0 ? (lastCancelCount / lastCount) * 100 : 0;

  const thisAvg = thisSuccess.length > 0 ? thisRevenue / thisSuccess.length : 0;
  const lastAvg = lastSuccess.length > 0 ? lastRevenue / lastSuccess.length : 0;

  function pctChange(current: number, previous: number): number | null {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }

  return {
    totalBooking: thisCount,
    totalBookingPrev: lastCount,
    bookingTrend: pctChange(thisCount, lastCount),

    totalRevenue: thisRevenue,
    totalRevenuePrev: lastRevenue,
    revenueTrend: pctChange(thisRevenue, lastRevenue),

    cancelRate: thisCancelRate,
    cancelCount: thisCancelCount,
    cancelRatePrev: lastCancelRate,
    cancelTrend: pctChange(thisCancelRate, lastCancelRate),

    avgBookingValue: thisAvg,
    avgBookingValuePrev: lastAvg,
    avgTrend: pctChange(thisAvg, lastAvg),

    // New: Pendapatan Bulan Ini (for KPI card)
    thisMonthRevenue: thisRevenue,
    thisMonthRevenuePrev: lastRevenue,
    thisMonthRevenueTrend: pctChange(thisRevenue, lastRevenue),
    thisMonthSuccessCount: thisSuccess.length,
  };
}

/* ── Status composition ────────────────────────────────────── */

export function computeStatusComposition(bookings: RecordedBooking[]) {
  let berhasil = 0, cancel = 0, pending = 0;
  for (const b of bookings) {
    if (b.payment_status === "berhasil") berhasil++;
    else if (b.payment_status === "dibatalkan" || b.payment_status === "gagal") cancel++;
    else if (b.payment_status === "pending") pending++;
  }
  return { berhasil, cancel, pending, total: bookings.length };
}

/* ── Booking status derivation ─────────────────────────────── */

export type UnifiedBookingStatus = {
  badge: string;
  colorClass: string;
  desc: string;
};

export function getUnifiedBookingStatus(b: RecordedBooking): UnifiedBookingStatus {
  const isCancel = b.payment_status === "dibatalkan" || b.payment_status === "gagal";
  const isPending = b.payment_status === "pending";

  if (isCancel) {
    return {
      badge: "Dibatalkan",
      colorClass: "bg-red-100 text-red-700",
      desc: "Pembayaran tidak masuk",
    };
  }

  if (isPending) {
    return {
      badge: "Pending",
      colorClass: "bg-amber-100 text-amber-800",
      desc: "Menunggu pembayaran",
    };
  }

  // Payment is "berhasil"
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const ciDate = new Date(b.checkIn + "T00:00:00");
  const coDate = new Date(b.checkOut + "T00:00:00");

  if (todayDate > coDate) {
    return {
      badge: "Selesai",
      colorClass: "bg-gray-100 text-gray-700",
      desc: "Selesai menginap",
    };
  }

  if (todayDate >= ciDate && todayDate <= coDate) {
    const diffDays = Math.ceil((coDate.getTime() - todayDate.getTime()) / 86_400_000);
    return {
      badge: "Berlangsung",
      colorClass: "bg-emerald-100 text-emerald-800",
      desc: `Checkout ${b.checkOut.slice(5)} · ${diffDays} hari lagi`,
    };
  }

  // Upcoming
  const diffDays = Math.ceil((ciDate.getTime() - todayDate.getTime()) / 86_400_000);
  return {
    badge: "Upcoming",
    colorClass: "bg-blue-100 text-blue-800",
    desc: `Check-in ${b.checkIn.slice(5)} · ${diffDays} hari lagi`,
  };
}

/* ── Check-in proximity ────────────────────────────────────── */

export function daysUntilCheckIn(checkIn: string): number | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ci = new Date(checkIn + "T00:00:00");
  if (!Number.isFinite(ci.getTime())) return null;
  const diff = Math.ceil((ci.getTime() - today.getTime()) / 86_400_000);
  return diff;
}

export function getCheckInBadge(checkIn: string): { text: string; color: string } | null {
  const days = daysUntilCheckIn(checkIn);
  if (days === null || days < 0 || days > 7) return null;
  if (days === 0) return { text: "🔔 Hari ini", color: "bg-red-100 text-red-700" };
  if (days === 1) return { text: "🔔 Besok", color: "bg-red-100 text-red-700" };
  return { text: `🔔 ${days} hari lagi`, color: "bg-amber-100 text-amber-800" };
}

/* ── Format helpers ────────────────────────────────────────── */

export function formatIdr(n: number): string {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

export function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  } catch {
    return iso;
  }
}

export function paymentStatusLabel(s: PaymentUiStatus): string {
  switch (s) {
    case "berhasil": return "Berhasil";
    case "pending": return "Pending";
    case "gagal": return "Cancel";
    case "dibatalkan": return "Cancel";
    default: return String(s);
  }
}

export function paymentStatusBadgeClass(s: PaymentUiStatus): string {
  switch (s) {
    case "berhasil": return "bg-emerald-100 text-emerald-900";
    case "pending": return "bg-amber-100 text-amber-950";
    case "gagal": return "bg-red-100 text-red-700";
    case "dibatalkan": return "bg-red-100 text-red-700";
    default: return "bg-surface text-text";
  }
}

/* ── Donut chart insights ────────────────────────────────────── */

export function computeDonutInsights(bookings: RecordedBooking[]) {
  const successful = bookings.filter((b) => b.payment_status === "berhasil");
  const cancelled = bookings.filter((b) => b.payment_status === "dibatalkan" || b.payment_status === "gagal");

  const revenueIn = successful.reduce((s, b) => s + (Number.isFinite(b.gross_amount) ? b.gross_amount : 0), 0);
  const revenueLost = cancelled.reduce((s, b) => s + (Number.isFinite(b.gross_amount) ? b.gross_amount : 0), 0);

  // Most active day
  const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const b of bookings) {
    const d = new Date(b.recordedAt);
    if (Number.isFinite(d.getTime())) {
      dayCount[d.getDay()]++;
    }
  }
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  let maxDay = 0;
  let maxCount = 0;
  for (const [day, count] of Object.entries(dayCount)) {
    if (count > maxCount) {
      maxCount = count;
      maxDay = parseInt(day, 10);
    }
  }

  return {
    revenueIn,
    revenueLost,
    mostActiveDay: maxCount > 0 ? { name: dayNames[maxDay], count: maxCount } : null,
  };
}

/* ── Quick insights for Analytics ──────────────────────────── */

const MONTH_NAMES_INDO = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function computeQuickInsights(bookings: RecordedBooking[]): { text: string; type: "info" | "success" | "warning" }[] {
  const insights: { text: string; type: "info" | "success" | "warning" }[] = [];
  const now = new Date();

  // 1. Best month
  const monthCount: Record<string, number> = {};
  for (const b of bookings) {
    const d = new Date(b.recordedAt);
    if (Number.isFinite(d.getTime())) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthCount[key] = (monthCount[key] || 0) + 1;
    }
  }
  let bestMonthKey = "";
  let bestMonthCount = 0;
  for (const [key, count] of Object.entries(monthCount)) {
    if (count > bestMonthCount) {
      bestMonthCount = count;
      bestMonthKey = key;
    }
  }
  if (bestMonthKey && bestMonthCount > 0) {
    const [y, m] = bestMonthKey.split("-").map(Number);
    insights.push({
      text: `${MONTH_NAMES_INDO[m]} ${y} adalah bulan dengan booking terbanyak (${bestMonthCount} booking)`,
      type: "success",
    });
  }

  // 2. Week-over-week trend
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeekCount = bookings.filter((b) => {
    const d = new Date(b.recordedAt);
    return d >= thisWeekStart && d <= now;
  }).length;
  const lastWeekCount = bookings.filter((b) => {
    const d = new Date(b.recordedAt);
    return d >= lastWeekStart && d < thisWeekStart;
  }).length;

  if (thisWeekCount > 0 || lastWeekCount > 0) {
    if (thisWeekCount > lastWeekCount) {
      insights.push({
        text: `Minggu ini ada ${thisWeekCount} booking baru, naik dari minggu lalu (${lastWeekCount} booking)`,
        type: "success",
      });
    } else if (thisWeekCount < lastWeekCount) {
      insights.push({
        text: `Minggu ini ada ${thisWeekCount} booking baru, turun dari minggu lalu (${lastWeekCount} booking)`,
        type: "warning",
      });
    } else {
      insights.push({
        text: `Minggu ini ada ${thisWeekCount} booking baru, sama dengan minggu lalu`,
        type: "info",
      });
    }
  }

  return insights;
}

/* ── Data Booking insight banners ───────────────────────────── */

export function computePaymentBanners(bookings: RecordedBooking[]): { text: string; type: "warning" | "info" | "danger" }[] {
  const banners: { text: string; type: "warning" | "info" | "danger" }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Pending count
  const pending = bookings.filter((b) => b.payment_status === "pending");
  if (pending.length > 0) {
    banners.push({
      text: `Ada <strong>${pending.length}</strong> booking berstatus Pending — pastikan tamu sudah menyelesaikan pembayaran sebelum tanggal check-in.`,
      type: "warning",
    });
  }

  // Cancelled this month
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const cancelledThisMonth = bookings.filter((b) => {
    const isCancel = b.payment_status === "dibatalkan" || b.payment_status === "gagal";
    if (!isCancel) return false;
    const d = new Date(b.recordedAt);
    return d >= thisMonthStart && d <= today;
  });
  if (cancelledThisMonth.length > 0) {
    banners.push({
      text: `<strong>${cancelledThisMonth.length}</strong> booking dibatalkan bulan ini karena pembayaran tidak diselesaikan. Pertimbangkan untuk menghubungi tamu secara langsung jika diperlukan.`,
      type: "danger",
    });
  }

  return banners.slice(0, 2);
}

export function computeBookingBanners(bookings: RecordedBooking[]): { text: string; type: "warning" | "info" | "danger" }[] {
  const banners: { text: string; type: "warning" | "info" | "danger" }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

  // Upcoming in 30 days
  const upcoming = bookings.filter((b) => {
    if (b.payment_status !== "berhasil") return false;
    const ci = new Date(b.checkIn + "T00:00:00");
    return ci >= today && ci <= in30Days;
  });
  if (upcoming.length > 0) {
    banners.push({
      text: `<strong>${upcoming.length}</strong> booking akan segera check-in dalam 30 hari ke depan. Persiapkan properti sesuai jadwal.`,
      type: "info",
    });
  }

  return banners;
}

/* ── Truncate Order ID ─────────────────────────────────────── */

export function truncateOrderId(orderId: string): string {
  if (orderId.length <= 14) return orderId;
  return `${orderId.slice(0, 6)}...${orderId.slice(-6)}`;
}

/* ── CSV exports ───────────────────────────────────────────── */

const BOOKING_CSV_SPEC: { key: keyof RecordedBooking; header: string }[] = [
  { key: "order_id", header: "Order_ID" },
  { key: "transaction_id", header: "Transaction_ID" },
  { key: "guestName", header: "Nama_Tamu" },
  { key: "guestEmail", header: "Email" },
  { key: "guestPhone", header: "Telepon" },
  { key: "gross_amount", header: "Total_IDR_hanya_jika_berhasil" },
  { key: "checkIn", header: "Check_in" },
  { key: "checkOut", header: "Check_out" },
  { key: "propertyName", header: "Properti" },
  { key: "payment_type", header: "Metode_pembayaran" },
  { key: "payment_status", header: "Keterangan_pembayaran" },
  { key: "transaction_status", header: "Status_Midtrans" },
  { key: "recordedAt", header: "Waktu_dicatat_ISO" },
];

function csvEscapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSeriesCsv(series: SeriesPoint[], granularity: Granularity) {
  const stamp = new Date().toISOString().slice(0, 10);
  const header = "Periode,Jumlah_Booking,Pendapatan_IDR";
  const rows = series.map((s) => `${s.label},${s.count},${s.revenue}`).join("\r\n");
  const BOM = "\uFEFF";
  downloadBlob(`wolio-tren-${granularity}-${stamp}.csv`, new Blob([BOM + header + "\r\n" + rows], { type: "text/csv;charset=utf-8;" }));
}

export function exportBookingsCsv(bookings: RecordedBooking[]) {
  const stamp = new Date().toISOString().slice(0, 10);
  const header = BOOKING_CSV_SPEC.map((c) => c.header).join(",");
  const rows = bookings
    .map((b) =>
      BOOKING_CSV_SPEC.map((c) => {
        const raw = c.key === "payment_status" ? paymentStatusLabel(b.payment_status) : String(b[c.key] ?? "");
        return csvEscapeCell(raw);
      }).join(",")
    )
    .join("\r\n");
  const BOM = "\uFEFF";
  downloadBlob(`wolio-booking-${stamp}.csv`, new Blob([BOM + header + "\r\n" + rows], { type: "text/csv;charset=utf-8;" }));
}

/* ── Pagination helpers ────────────────────────────────────── */

export function slicePage<T>(items: T[], page: number, pageSize: number): T[] {
  const p = Math.max(1, page);
  const start = (p - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPagesFor(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;
