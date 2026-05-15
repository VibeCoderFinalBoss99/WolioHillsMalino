import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, AlertCircle } from "lucide-react";
import type { RecordedBooking, PaymentUiStatus } from "../lib/adminBookingStore";

type Props = {
  booking: RecordedBooking | null;
  onClose: () => void;
  onSave: (orderId: string, updates: Partial<RecordedBooking>) => Promise<void>;
};

export default function BookingEditModal({ booking, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentUiStatus>("pending");

  useEffect(() => {
    if (booking) {
      setGuestName(booking.guestName);
      setGuestPhone(booking.guestPhone);
      setCheckIn(booking.checkIn);
      setCheckOut(booking.checkOut);
      setPaymentStatus(booking.payment_status);
      setError(null);
    }
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(booking.order_id, {
        guestName,
        guestPhone,
        checkIn,
        checkOut,
        payment_status: paymentStatus,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-surface-dark flex flex-col">
        <div className="sticky top-0 bg-white border-b border-surface-dark px-6 py-4 flex items-center justify-between rounded-t-2xl z-10 shrink-0">
          <h3 className="font-display font-bold text-lg text-primary">Edit Booking</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-text-light"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-100 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-light mb-1">Status Pembayaran</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentUiStatus)}
              className="w-full px-3 py-2 rounded-lg border border-surface-dark focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent text-sm text-primary font-medium bg-surface/50"
            >
              <option value="berhasil">Berhasil</option>
              <option value="pending">Pending</option>
              <option value="gagal">Gagal</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light mb-1">Nama Tamu</label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-surface-dark focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent text-sm text-primary font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light mb-1">Telepon Tamu</label>
            <input
              type="text"
              required
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-surface-dark focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent text-sm text-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light mb-1">Check-in</label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-dark focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent text-sm text-primary font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-light mb-1">Check-out</label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-dark focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent text-sm text-primary font-medium"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-4 border-t border-surface-dark">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-text-light hover:bg-surface rounded-lg transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
