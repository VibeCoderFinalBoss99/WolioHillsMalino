import { useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import type { RecordedBooking } from "../lib/adminBookingStore";

type Props = {
  booking: RecordedBooking | null;
  onClose: () => void;
  onConfirm: (orderId: string) => Promise<void>;
};

export default function DeleteConfirmModal({ booking, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!booking) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(booking.order_id);
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-surface-dark p-6 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-text-light"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="font-display font-bold text-lg text-primary mb-2">Hapus Booking?</h3>
        <p className="text-sm text-text-light mb-6">
          Apakah Anda yakin ingin menghapus booking <strong>{booking.order_id}</strong> atas nama{" "}
          <strong>{booking.guestName}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>

        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 p-2 rounded-lg w-full">
            {error}
          </div>
        )}

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-text hover:bg-surface rounded-xl border border-surface-dark transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
