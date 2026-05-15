import { createPortal } from "react-dom";
import { X, Phone, Mail, Calendar, CreditCard, MessageCircle } from "lucide-react";
import type { RecordedBooking } from "../lib/adminBookingStore";
import {
  formatIdr,
  formatWhen,
  paymentStatusLabel,
  paymentStatusBadgeClass,
  getUnifiedBookingStatus,
} from "../lib/chartUtils";

type Props = {
  booking: RecordedBooking | null;
  onClose: () => void;
};

export default function BookingDetailModal({ booking: b, onClose }: Props) {
  if (!b) return null;
  const unified = getUnifiedBookingStatus(b);
  const whatsappLink = b.guestPhone
    ? `https://wa.me/${b.guestPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo ${b.guestName}, terkait booking ${b.order_id} di Wolio Hills.`)}`
    : null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-surface-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-dark px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="font-display font-bold text-lg text-primary">Detail Booking</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-text-light"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order ID */}
          <div className="bg-surface rounded-xl p-4">
            <p className="text-xs text-text-light font-semibold uppercase tracking-wider mb-1">Order ID</p>
            <p className="font-mono text-sm text-primary font-medium select-all">{b.order_id}</p>
          </div>

          {/* Status badges */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex px-3 py-1 text-xs rounded-full font-semibold ${paymentStatusBadgeClass(b.payment_status)}`}>
                Pembayaran: {paymentStatusLabel(b.payment_status)}
              </span>
              <span className={`inline-flex px-3 py-1 text-xs rounded-full font-semibold ${unified.colorClass}`}>
                {unified.badge}
              </span>
            </div>
            <p className="text-xs text-text-light px-1">{unified.desc}</p>
          </div>

          {/* Guest info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-light">Informasi Tamu</h4>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary">{b.guestName}</p>
              <p className="flex items-center gap-2 text-sm text-text-light">
                <Mail className="w-4 h-4 shrink-0" />
                {b.guestEmail || "—"}
              </p>
              <p className="flex items-center gap-2 text-sm text-text-light">
                <Phone className="w-4 h-4 shrink-0" />
                {b.guestPhone || "—"}
              </p>
            </div>
          </div>

          {/* Booking details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl p-3">
              <p className="text-[11px] text-text-light font-semibold uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Check-in
              </p>
              <p className="text-sm font-medium text-primary">{b.checkIn}</p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <p className="text-[11px] text-text-light font-semibold uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Check-out
              </p>
              <p className="text-sm font-medium text-primary">{b.checkOut}</p>
            </div>
          </div>

          <div className="space-y-2">

            <p className="flex items-center gap-2 text-sm text-text">
              <CreditCard className="w-4 h-4 text-text-light shrink-0" />
              <span>
                {b.payment_type || "—"}
                {b.transaction_status ? ` · ${b.transaction_status}` : ""}
              </span>
            </p>
          </div>

          {/* Total */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-center">
            <p className="text-xs text-text-light mb-1">Total Pembayaran</p>
            <p className={`text-2xl font-display font-black ${b.payment_status === "gagal" || b.payment_status === "dibatalkan" ? "text-red-400 line-through" : "text-primary"}`}>
              {formatIdr(b.gross_amount)}
            </p>
            {b.payment_status === "pending" && (
              <p className="text-xs text-text-light mt-1 italic">Menunggu pembayaran dari tamu</p>
            )}
            {(b.payment_status === "gagal" || b.payment_status === "dibatalkan") && (
              <p className="text-xs text-text-light mt-1 italic">Pembayaran tidak diselesaikan oleh tamu</p>
            )}
          </div>

          {/* Timestamp */}
          <div className="space-y-1 text-center">
            <p className="text-xs text-text-light">
              Dicatat: {formatWhen(b.recordedAt)}
            </p>
            <p className="text-[10px] text-text-light/80 italic bg-surface/50 inline-block px-2 py-1 rounded">
              *Data nominal pembayaran diambil dari tabel Monitoring Pembayaran.
            </p>
          </div>

          {/* WhatsApp button */}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 text-sm font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
