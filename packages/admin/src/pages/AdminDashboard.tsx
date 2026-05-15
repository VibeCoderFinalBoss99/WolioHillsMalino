import { useCallback, useEffect, useId, useState } from "react";
import { m, AnimatePresence } from "motion/react";
import {
  BarChart3,
  CreditCard,
  Calendar,
  DollarSign,
  LogOut,
  RefreshCw,
  Users,
  Phone,
  Download,
  AlertTriangle,
  Eye,
  Lightbulb,
  Wallet
} from "lucide-react";
import {
  fetchAllBookingsSorted,
  subscribeBookingUpdates,
  deleteBooking,
  updateBooking,
  type RecordedBooking,
} from "../lib/adminBookingStore";
import {
  type TimeRangePreset,
  type PaymentStatusFilter,
  TIME_RANGE_OPTIONS,
  PAYMENT_STATUS_FILTER_OPTIONS,
  PAGE_SIZE_OPTIONS,
  filterBookingsByTimeRange,
  buildAggregatedSeries,
  getChartGranularity,
  getGranularityLabel,
  computeMonthlyComparison,
  computeStatusComposition,
  computeDonutInsights,
  computeQuickInsights,
  computePaymentBanners,
  computeBookingBanners,
  formatIdr,
  formatWhen,
  paymentStatusLabel,
  paymentStatusBadgeClass,
  truncateOrderId,
  getUnifiedBookingStatus,
  getCheckInBadge,
  exportSeriesCsv,
  exportBookingsCsv,
  slicePage,
  totalPagesFor,
} from "../lib/chartUtils";
import StatusDonutChart from "../components/StatusDonutChart";
import AdaptiveBarChart from "../components/AdaptiveBarChart";
import BookingDetailModal from "../components/BookingDetailModal";
import BookingEditModal from "../components/BookingEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { useAuth } from "../context/AuthContext";

type TabId = "analytics" | "payments" | "bookings";
type TrendMetric = "count" | "revenue";

function segmentBtn(active: boolean) {
  return `rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "bg-primary text-white shadow-sm" : "text-text hover:bg-surface"
    }`;
}

function TimeRangeSelect({ id, value, onChange, className = "" }: { id: string; value: TimeRangePreset; onChange: (v: TimeRangePreset) => void; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <label htmlFor={id} className="whitespace-nowrap text-xs font-semibold text-text">Rentang waktu</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as TimeRangePreset)} className="rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30">
        {TIME_RANGE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </div>
  );
}

function PaymentStatusFilterSelect({ id, value, onChange, className = "" }: { id: string; value: PaymentStatusFilter; onChange: (v: PaymentStatusFilter) => void; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <label htmlFor={id} className="whitespace-nowrap text-xs font-semibold text-text">Status pembayaran</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as PaymentStatusFilter)} className="rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30">
        {PAYMENT_STATUS_FILTER_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </div>
  );
}

function TrendExplorer({ bookings }: { bookings: RecordedBooking[] }) {
  const [timeRange, setTimeRange] = useState<TimeRangePreset>("1m");
  const [metric, setMetric] = useState<TrendMetric>("count");
  const trendTimeSelectId = useId();

  const filteredBookings = filterBookingsByTimeRange(bookings, timeRange);
  const granularity = getChartGranularity(timeRange);
  const series = buildAggregatedSeries(filteredBookings, timeRange);
  const rangeDescription = TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label ?? timeRange;
  const metricLabel = metric === "count" ? `Jumlah booking (${getGranularityLabel(granularity)})` : `Pendapatan IDR (${getGranularityLabel(granularity)})`;

  return (
    <div className="bg-white rounded-xl border border-surface-dark shadow-sm p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-lg text-primary">Tren {getGranularityLabel(granularity)}</h3>
          <p className="mt-1 text-sm text-text-light">
            Agregasi <span className="font-semibold text-primary">{getGranularityLabel(granularity).toLowerCase()}</span> — rentang: <span className="font-semibold text-primary">{rangeDescription}</span>
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <TimeRangeSelect id={trendTimeSelectId} value={timeRange} onChange={setTimeRange} />
          <div className="flex items-center gap-2 rounded-lg border border-surface-dark bg-surface/40 p-1">
            <span className="pl-2 text-[10px] font-bold uppercase tracking-wider text-text-light">Metrik</span>
            <button type="button" className={segmentBtn(metric === "count")} onClick={() => setMetric("count")}>Booking</button>
            <button type="button" className={segmentBtn(metric === "revenue")} onClick={() => setMetric("revenue")}>Pendapatan</button>
          </div>
        </div>
      </div>

      <p className="mb-4 mt-4 text-sm text-text-light">{metricLabel}</p>

      <AdaptiveBarChart series={series} metric={metric} />

      {/* Export buttons */}
      <div className="mt-6 flex flex-col gap-2 border-t border-surface-dark pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-light">Ekspor data</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => exportSeriesCsv(series, granularity)} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-dark bg-white px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-surface">
            <Download className="h-3.5 w-3.5" /> CSV tren
          </button>
          <button type="button" onClick={() => exportBookingsCsv(filteredBookings)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
            <Download className="h-3.5 w-3.5" /> CSV booking
          </button>
        </div>
      </div>
    </div>
  );
}





export default function AdminDashboard() {
  const { signOut, profileDisplayName } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("analytics");
  const [bookings, setBookings] = useState<RecordedBooking[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void fetchAllBookingsSorted()
      .then((list) => {
        setBookings(list);
        setLoadError(null);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Gagal memuat data"));
  }, []);

  useEffect(() => subscribeBookingUpdates(refresh), [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);



  const menuItems: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "payments", label: "Monitoring Pembayaran", icon: CreditCard },
    { id: "bookings", label: "Data Booking", icon: Calendar },
  ];

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-surface">
      <header className="sticky top-0 z-50 w-full shrink-0 border-b border-surface-dark bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-[100vw] min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <img
              src={`${import.meta.env.BASE_URL.replace(/\/?$/, "/")}images/logo.ico`}
              alt=""
              width={36}
              height={36}
              className="h-8 w-8 shrink-0 rounded-lg object-contain ring-1 ring-accent/30 sm:h-9 sm:w-9"
            />
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold text-primary sm:text-xl">Admin Dashboard</h1>
              {profileDisplayName ? (
                <p className="truncate text-xs text-text-light sm:text-sm">
                  Halo, <span className="font-semibold text-primary">{profileDisplayName}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-lg border border-surface-dark px-2.5 py-2 text-primary transition-colors hover:bg-surface sm:px-3"
              aria-label="Refresh data"
            >
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden text-xs font-semibold sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light sm:px-4"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 w-full min-w-0 flex-1">
        <aside
          className="flex w-[3.25rem] shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-surface-dark bg-white py-3 sm:w-14 lg:hidden"
          aria-label="Navigasi menu"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => setActiveTab(item.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors sm:h-12 sm:w-12 ${active ? "bg-primary text-white shadow-md" : "text-text-light hover:bg-surface hover:text-primary"
                  }`}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? "text-accent" : ""}`} />
              </button>
            );
          })}
        </aside>

        <aside
          id="admin-sidebar"
          className="hidden w-64 shrink-0 flex-col border-r border-surface-dark bg-white lg:flex"
          aria-label="Menu lengkap"
        >
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${active ? "bg-primary text-white shadow-md" : "text-text hover:bg-surface"
                    }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? "text-accent" : "text-text-light"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="relative z-10 min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {loadError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <strong className="font-semibold">Gagal memuat data:</strong> {loadError}. Pastikan Anda login sebagai akun
              dengan <code className="rounded bg-white px-1 font-mono text-xs">profiles.role = admin</code>, RLS mengizinkan
              akses, dan Realtime untuk tabel <code className="rounded bg-white px-1 font-mono text-xs">bookings</code> aktif
              (opsional; ada polling cadangan).
            </div>
          )}
          <AnimatePresence mode="wait">
            <m.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "analytics" && <AnalyticsSection bookings={bookings} />}
              {activeTab === "payments" && <PaymentsSection bookings={bookings} />}
              {activeTab === "bookings" && <BookingsDataSection bookings={bookings} />}
            </m.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function ClientPaginationFooter({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  selectId,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectId: string;
}) {
  const pages = totalPagesFor(totalItems, pageSize);
  const safePage = Math.min(Math.max(1, page), pages);
  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(totalItems, safePage * pageSize);

  return (
    <div className="flex flex-col gap-3 border-t border-surface-dark bg-surface/40 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-text-light tabular-nums">
        {totalItems === 0 ? "Tidak ada data untuk ditampilkan." : `Menampilkan ${from}–${to} dari ${totalItems} data`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={selectId} className="text-xs font-semibold text-text">
          Baris per halaman
        </label>
        <select
          id={selectId}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={safePage <= 1 || totalItems === 0}
          onClick={() => onPageChange(safePage - 1)}
          className="rounded-lg border border-surface-dark bg-white px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface disabled:pointer-events-none disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <span className="min-w-[7rem] text-center text-xs font-medium text-text-light tabular-nums">
          Halaman {safePage} / {pages}
        </span>
        <button
          type="button"
          disabled={safePage >= pages || totalItems === 0}
          onClick={() => onPageChange(safePage + 1)}
          className="rounded-lg border border-surface-dark bg-white px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface disabled:pointer-events-none disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

function AnalyticsSection({
  bookings,
}: {
  bookings: RecordedBooking[];
}) {
  const kpis = computeMonthlyComparison(bookings);
  const donutData = computeStatusComposition(bookings);
  const donutInsights = computeDonutInsights(bookings);
  const quickInsights = computeQuickInsights(bookings);

  function TrendBadge({ trend }: { trend: number | null }) {
    if (trend === null) return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">→ Tidak ada pembanding</span>;
    if (trend === 0) return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">→ Sama dgn bln lalu</span>;
    if (trend > 0) return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">↑ {trend.toFixed(1)}%</span>;
    return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">↓ {Math.abs(trend).toFixed(1)}%</span>;
  }

  function TrendBadgeInverted({ trend }: { trend: number | null }) {
    if (trend === null) return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">→ Tidak ada pembanding</span>;
    if (trend === 0) return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">→ Sama dgn bln lalu</span>;
    if (trend > 0) return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">↑ {trend.toFixed(1)}%</span>;
    return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">↓ {Math.abs(trend).toFixed(1)}%</span>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="font-display font-bold text-2xl text-primary mb-1">Analytics Overview</h2>
        <p className="text-text-light text-sm">Ringkasan operasional dan tren Wolio Hills bulan ini</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-5 border border-surface-dark shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <TrendBadge trend={kpis.bookingTrend} />
          </div>
          <p className="text-sm text-text-light mb-1">Total Booking</p>
          <p className="text-2xl font-display font-black text-primary tabular-nums">{kpis.totalBooking}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-5 border border-surface-dark shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-700" />
            </div>
            <TrendBadge trend={kpis.revenueTrend} />
          </div>
          <p className="text-sm text-text-light mb-1">Total Pendapatan</p>
          <p className="text-2xl font-display font-black text-primary tabular-nums truncate" title={formatIdr(kpis.totalRevenue)}>
            {formatIdr(kpis.totalRevenue)}
          </p>
        </div>

        {/* Card 3 */}
        <div className={`rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-colors ${kpis.cancelRate > 50 ? "bg-amber-50 border-amber-200" : "bg-white border-surface-dark"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpis.cancelRate > 50 ? "bg-amber-100" : "bg-red-50"}`}>
              <AlertTriangle className={`w-5 h-5 ${kpis.cancelRate > 50 ? "text-amber-700" : "text-red-500"}`} />
            </div>
            <TrendBadgeInverted trend={kpis.cancelTrend} />
          </div>
          <p className="text-sm text-text-light mb-1">Tingkat Pembatalan</p>
          <p className="text-2xl font-display font-black text-primary tabular-nums">
            {kpis.cancelRate.toFixed(1)}%
          </p>
          <p className="text-xs text-text-light mt-1">({kpis.cancelCount} dari {kpis.totalBooking} dibatalkan)</p>
        </div>

        {/* Card 4 - Pendapatan Bulan Ini */}
        <div className="bg-white rounded-xl p-5 border border-surface-dark shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-700" />
            </div>
            <TrendBadge trend={kpis.thisMonthRevenueTrend} />
          </div>
          <p className="text-sm text-text-light mb-1">Pendapatan Bulan Ini</p>
          {kpis.thisMonthSuccessCount > 0 ? (
            <p className="text-2xl font-display font-black text-primary tabular-nums truncate" title={formatIdr(kpis.thisMonthRevenue)}>
              {formatIdr(kpis.thisMonthRevenue)}
            </p>
          ) : (
            <p className="text-base font-medium text-text-light">Belum ada transaksi bulan ini</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-surface-dark shadow-sm p-6 flex flex-col">
          <h3 className="font-display font-bold text-lg text-primary mb-1">Status Booking</h3>
          <p className="text-xs text-text-light mb-6">Proporsi seluruh status reservasi</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <StatusDonutChart
              {...donutData}
              revenueIn={donutInsights.revenueIn}
              revenueLost={donutInsights.revenueLost}
              mostActiveDay={donutInsights.mostActiveDay}
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <TrendExplorer bookings={bookings} />
        </div>
      </div>

      {/* Quick Insights Block */}
      {quickInsights.length > 0 ? (
        <div className="bg-white rounded-xl border border-surface-dark shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
            <h3 className="font-display font-bold text-lg text-primary">Insight Cepat</h3>
          </div>
          <div className="space-y-3">
            {quickInsights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg p-3 border ${insight.type === "success"
                  ? "bg-emerald-50 border-emerald-200"
                  : insight.type === "warning"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
                  }`}
              >
                <span className="mt-0.5 shrink-0">
                  {insight.type === "success" ? "✅" : insight.type === "warning" ? "⚠️" : "ℹ️"}
                </span>
                <p className={`text-sm ${insight.type === "success"
                  ? "text-emerald-900"
                  : insight.type === "warning"
                    ? "text-amber-900"
                    : "text-blue-900"
                  }`}>
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-dark shadow-sm p-6 flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-text-light shrink-0" />
          <p className="text-sm text-text-light">Belum ada cukup data untuk生成 insight.</p>
        </div>
      )}
    </div>
  );
}

function PaymentsSection({ bookings }: { bookings: RecordedBooking[] }) {
  const pageSizeSelectId = useId();
  const timeSelectId = useId();
  const payStatusFilterId = useId();
  const [timeRange, setTimeRange] = useState<TimeRangePreset>("all");
  const [payStatusFilter, setPayStatusFilter] = useState<PaymentStatusFilter>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const timeFiltered = filterBookingsByTimeRange(bookings, timeRange);

  // Filter by custom date range (based on transaction date)
  const dateFiltered = timeFiltered.filter((b) => {
    if (!dateFrom && !dateTo) return true;
    const rec = new Date(b.recordedAt);
    if (!Number.isFinite(rec.getTime())) return false;
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom + "T00:00:00");
      const to = new Date(dateTo + "T23:59:59");
      return rec >= from && rec <= to;
    }
    if (dateFrom) {
      const from = new Date(dateFrom + "T00:00:00");
      return rec >= from;
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59");
      return rec <= to;
    }
    return true;
  });

  const filtered =
    payStatusFilter === "all" ? dateFiltered : dateFiltered.filter((b) => b.payment_status === payStatusFilter);

  useEffect(() => {
    setPage(1);
  }, [pageSize, timeRange, payStatusFilter, dateFrom, dateTo]);

  useEffect(() => {
    const tp = totalPagesFor(filtered.length, pageSize);
    setPage((p) => Math.min(p, tp));
  }, [filtered.length, pageSize, dateFrom, dateTo]);

  const payTp = totalPagesFor(filtered.length, pageSize);
  const paySafePage = Math.min(Math.max(1, page), payTp);
  const pagedRows = slicePage(filtered, paySafePage, pageSize);

  // Summary Metrics
  const totalTransaksi = filtered.length;
  const countBerhasil = filtered.filter(b => b.payment_status === "berhasil").length;
  const countPending = filtered.filter(b => b.payment_status === "pending").length;
  const countCancel = filtered.filter(b => b.payment_status === "dibatalkan").length;
  const totalNilai = filtered.filter(b => b.payment_status === "berhasil").reduce((sum, b) => sum + b.gross_amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="font-display font-bold text-2xl text-primary mb-1">Monitoring Pembayaran</h2>
        <p className="text-text-light text-sm">Semua transaksi tercatat — status pembayaran mengikuti Midtrans</p>
      </div>

      {/* Payment Insight Banners */}
      {(() => {
        const banners = computePaymentBanners(bookings);
        if (banners.length === 0) return null;
        return (
          <div className="space-y-2">
            {banners.map((banner, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm border ${banner.type === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : banner.type === "danger"
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-blue-50 border-blue-200 text-blue-900"
                  }`}
              >
                <span className="mt-0.5 shrink-0">
                  {banner.type === "warning" ? "🟡" : banner.type === "danger" ? "🔴" : "🔵"}
                </span>
                <span dangerouslySetInnerHTML={{ __html: banner.text }} />
              </div>
            ))}
          </div>
        );
      })()}

      <div className="bg-white rounded-xl border border-surface-dark shadow-sm overflow-hidden p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-6 divide-x divide-surface-dark">
          <div className="pr-6">
            <p className="text-xs text-text-light mb-1">Total Transaksi</p>
            <p className="text-xl font-bold text-primary">{totalTransaksi}</p>
          </div>
          <div className="px-6">
            <p className="text-xs text-text-light mb-1">Berhasil</p>
            <p className="text-xl font-bold text-emerald-600">{countBerhasil}</p>
          </div>
          <div className="px-6">
            <p className="text-xs text-text-light mb-1">Pending</p>
            <p className="text-xl font-bold text-amber-500">{countPending}</p>
          </div>
          <div className="px-6">
            <p className="text-xs text-text-light mb-1">Cancel</p>
            <p className="text-xl font-bold text-red-600">{countCancel}</p>
          </div>
        </div>
        <div className="bg-surface px-4 py-2 rounded-lg border border-surface-dark text-right">
          <p className="text-xs text-text-light mb-0.5">Total Nilai Berhasil</p>
          <p className="text-lg font-bold text-primary">{formatIdr(totalNilai)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-dark shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-surface-dark p-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h3 className="font-bold text-lg text-primary">Daftar Transaksi</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <TimeRangeSelect id={timeSelectId} value={timeRange} onChange={setTimeRange} />
            <PaymentStatusFilterSelect id={payStatusFilterId} value={payStatusFilter} onChange={setPayStatusFilter} />
            <div className="flex items-center gap-1">
              <label htmlFor="date-from-payment" className="text-xs font-semibold text-text whitespace-nowrap">Dari</label>
              <input
                id="date-from-payment"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="flex items-center gap-1">
              <label htmlFor="date-to-payment" className="text-xs font-semibold text-text whitespace-nowrap">Sampai</label>
              <input
                id="date-to-payment"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="inline-flex items-center gap-1 rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-surface transition-colors"
                title="Reset filter tanggal"
              >
                <span>×</span>
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportBookingsCsv(filtered)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-surface-dark bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-surface transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-xs font-medium text-text uppercase tracking-wider">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Nominal</th>
                <th className="px-6 py-3">Keterangan</th>
                <th className="px-6 py-3">Tanggal Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dark">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-text-light">
                    Belum ada transaksi untuk rentang ini.
                  </td>
                </tr>
              ) : (
                pagedRows.map((b) => {
                  const isCancel = b.payment_status === "dibatalkan";
                  const isPending = b.payment_status === "pending";
                  return (
                    <tr key={b.order_id + b.recordedAt} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-medium text-primary">
                        <span title={b.order_id}>{truncateOrderId(b.order_id)}</span>
                      </td>
                      <td className="px-6 py-4 text-text">{b.guestName}</td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        {b.payment_status === "berhasil" ? (
                          formatIdr(b.gross_amount)
                        ) : isPending ? (
                          <span className="text-amber-500 tabular-nums" title="Menunggu pembayaran">
                            {formatIdr(b.gross_amount)} <span className="text-[10px] text-amber-400 font-normal ml-1">Menunggu</span>
                          </span>
                        ) : isCancel ? (
                          <span className="text-red-400 tabular-nums line-through" title="Pembayaran tidak masuk">
                            {formatIdr(b.gross_amount)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 text-xs rounded-full font-semibold ${paymentStatusBadgeClass(b.payment_status)}`}>
                          {paymentStatusLabel(b.payment_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-light text-xs whitespace-nowrap">{formatWhen(b.recordedAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <ClientPaginationFooter
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          selectId={`payments-${pageSizeSelectId}`}
        />
        <div className="bg-surface/30 border-t border-surface-dark px-6 py-3">
          <p className="text-xs text-text-light text-right">Semua waktu ditampilkan dalam zona WIB (UTC+7)</p>
        </div>
      </div>
    </div>
  );
}

function BookingsDataSection({ bookings }: { bookings: RecordedBooking[] }) {
  const pageSizeSelectId = useId();
  const timeSelectId = useId();
  const payStatusFilterId = useId();
  const [timeRange, setTimeRange] = useState<TimeRangePreset>("all");
  const [payStatusFilter, setPayStatusFilter] = useState<PaymentStatusFilter>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<RecordedBooking | null>(null);
  const [bookingToEdit, setBookingToEdit] = useState<RecordedBooking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<RecordedBooking | null>(null);

  const timeFiltered = filterBookingsByTimeRange(bookings, timeRange);

  // Filter by custom date range (based on check-in date)
  const dateFiltered = timeFiltered.filter((b) => {
    if (!dateFrom && !dateTo) return true;
    const ci = new Date(b.checkIn + "T00:00:00");
    if (!Number.isFinite(ci.getTime())) return false;
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom + "T00:00:00");
      const to = new Date(dateTo + "T23:59:59");
      return ci >= from && ci <= to;
    }
    if (dateFrom) {
      const from = new Date(dateFrom + "T00:00:00");
      return ci >= from;
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59");
      return ci <= to;
    }
    return true;
  });

  const filtered =
    payStatusFilter === "all" ? dateFiltered : dateFiltered.filter((b) => b.payment_status === payStatusFilter);

  useEffect(() => {
    setPage(1);
  }, [pageSize, timeRange, payStatusFilter]);

  useEffect(() => {
    const tp = totalPagesFor(filtered.length, pageSize);
    setPage((p) => Math.min(p, tp));
  }, [filtered.length, pageSize, dateFrom, dateTo]);

  const bookTp = totalPagesFor(filtered.length, pageSize);
  const bookSafePage = Math.min(Math.max(1, page), bookTp);
  const pagedRows = slicePage(filtered, bookSafePage, pageSize);

  const formatDateId = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    const day = d.toLocaleDateString("id-ID", { weekday: "long" });
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${day}, ${dd}-${mm}-${yyyy}`;
  };

  // Summary Metrics
  const totalTransaksi = filtered.length;

  let countUpcoming = 0;
  let countBerlangsung = 0;
  let countSelesai = 0;
  let countDibatalkan = 0;
  let countPending = 0;

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const next7Days = new Date(todayDate);
  next7Days.setDate(todayDate.getDate() + 7);

  let countUpcoming7Days = 0;

  filtered.forEach((b) => {
    const st = getUnifiedBookingStatus(b);
    if (st.badge === "Upcoming") countUpcoming++;
    else if (st.badge === "Berlangsung") countBerlangsung++;
    else if (st.badge === "Selesai") countSelesai++;
    else if (st.badge === "Dibatalkan") countDibatalkan++;
    else if (st.badge === "Pending") countPending++;

    if (b.payment_status === "berhasil") {
      const ci = new Date(b.checkIn + "T00:00:00");
      if (ci >= todayDate && ci <= next7Days) {
        countUpcoming7Days++;
      }
    }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-display font-bold text-2xl text-primary mb-1">Data Booking</h2>
        <p className="text-text-light text-sm">Detail reservasi dari pembayaran tercatat</p>
      </div>

      {/* Booking Insight Banners */}
      {(() => {
        const banners = computeBookingBanners(bookings);
        if (banners.length === 0) return null;
        return (
          <div className="space-y-2">
            {banners.map((banner, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm border ${banner.type === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : banner.type === "danger"
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-blue-50 border-blue-200 text-blue-900"
                  }`}
              >
                <span className="mt-0.5 shrink-0">
                  {banner.type === "warning" ? "🟡" : banner.type === "danger" ? "🔴" : "🔵"}
                </span>
                <span dangerouslySetInnerHTML={{ __html: banner.text }} />
              </div>
            ))}
          </div>
        );
      })()}

      <div className="bg-white rounded-xl border border-surface-dark shadow-sm overflow-hidden p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-6 divide-x divide-surface-dark">
          <div className="pr-6">
            <p className="text-xs text-text-light mb-1">Total</p>
            <p className="text-xl font-bold text-primary">{totalTransaksi}</p>
          </div>
          <div className="px-6">
            <p className="text-xs text-text-light mb-1">Akan Check-in</p>
            <p className="text-xl font-bold text-blue-600">{countUpcoming}</p>
          </div>

          <div className="px-6">
            <p className="text-xs text-text-light mb-1">Selesai</p>
            <p className="text-xl font-bold text-gray-600">{countSelesai}</p>
          </div>
          <div className="px-6">
            <p className="text-xs text-text-light mb-1">Dibatalkan</p>
            <p className="text-xl font-bold text-red-600">{countDibatalkan}</p>
          </div>
          <div className="px-6">
            <p className="text-xs text-text-light mb-1">Pending</p>
            <p className="text-xl font-bold text-amber-500">{countPending}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-dark shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-surface-dark px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <h3 className="font-bold text-lg text-primary">Daftar booking</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <TimeRangeSelect id={timeSelectId} value={timeRange} onChange={setTimeRange} />
            <PaymentStatusFilterSelect id={payStatusFilterId} value={payStatusFilter} onChange={setPayStatusFilter} />
            <div className="flex items-center gap-1">
              <label htmlFor="date-from-booking" className="text-xs font-semibold text-text whitespace-nowrap">Dari</label>
              <input
                id="date-from-booking"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="flex items-center gap-1">
              <label htmlFor="date-to-booking" className="text-xs font-semibold text-text whitespace-nowrap">Sampai</label>
              <input
                id="date-to-booking"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="inline-flex items-center gap-1 rounded-lg border border-surface-dark bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-surface transition-colors"
                title="Reset filter tanggal"
              >
                <span>×</span>
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportBookingsCsv(filtered)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-surface-dark bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-surface transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1024px] text-sm">
            <thead>
              <tr className="bg-primary text-white text-left text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Tamu</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Check-in / out</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dark">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-text-light">
                    Belum ada data booking untuk rentang ini.
                  </td>
                </tr>
              ) : (
                pagedRows.map((b) => {
                  const checkInBadge = getCheckInBadge(b.checkIn);
                  const isCancel = b.payment_status === "dibatalkan" || b.payment_status === "gagal";
                  const unifiedStatus = getUnifiedBookingStatus(b);

                  return (
                    <tr key={b.order_id + b.recordedAt} className="hover:bg-surface/50 transition-colors align-top group">
                      <td className="px-4 py-3 font-mono text-xs text-primary font-medium max-w-[140px] break-all">
                        <span title={b.order_id}>{truncateOrderId(b.order_id)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-primary flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-text-light shrink-0" />
                          <span className="line-clamp-1">{b.guestName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-light text-xs">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {b.guestPhone || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            {formatDateId(b.checkIn)} <span className="text-text-light text-[10px]">→</span> {formatDateId(b.checkOut)}
                          </span>
                          {checkInBadge && !isCancel && (
                            <span className={`inline-block w-fit px-1.5 py-0.5 rounded text-[10px] font-semibold ${checkInBadge.color}`}>{checkInBadge.text}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block w-fit px-2.5 py-1 text-[11px] rounded font-semibold ${unifiedStatus.colorClass}`}>
                            {unifiedStatus.badge}
                          </span>
                          <span className="text-[10px] text-text-light mt-0.5 leading-snug max-w-[140px]">
                            {unifiedStatus.desc}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center justify-center rounded bg-surface px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-dark"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookingToEdit(b)}
                            className="inline-flex items-center justify-center rounded border border-surface-dark px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-surface"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookingToDelete(b)}
                            className="inline-flex items-center justify-center rounded bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <ClientPaginationFooter
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          selectId={`bookings-${pageSizeSelectId}`}
        />
      </div>
      <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      <BookingEditModal
        booking={bookingToEdit}
        onClose={() => setBookingToEdit(null)}
        onSave={async (id, updates) => {
          await updateBooking(id, updates);
        }}
      />
      <DeleteConfirmModal
        booking={bookingToDelete}
        onClose={() => setBookingToDelete(null)}
        onConfirm={async (id) => {
          await deleteBooking(id);
        }}
      />
    </div>
  );
}

