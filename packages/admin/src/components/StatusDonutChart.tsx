import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  berhasil: number;
  cancel: number;
  pending: number;
  total: number;
  revenueIn?: number;
  revenueLost?: number;
  mostActiveDay?: { name: string; count: number } | null;
};

const COLORS = { berhasil: "#22C55E", cancel: "#F87171", pending: "#FBBF24" };

function formatIdrInline(n: number): string {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

export default function StatusDonutChart({ berhasil, cancel, pending, total, revenueIn, revenueLost, mostActiveDay }: Props) {
  const data = [
    { name: "Berhasil", value: berhasil, color: COLORS.berhasil },
    { name: "Cancel", value: cancel, color: COLORS.cancel },
    ...(pending > 0 ? [{ name: "Pending", value: pending, color: COLORS.pending }] : []),
  ].filter((d) => d.value > 0);

  const hasRevenueData = typeof revenueIn === "number" || typeof revenueLost === "number";
  const rIn = revenueIn ?? 0;
  const rLost = revenueLost ?? 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-text-light text-sm">
        Belum ada data booking.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-[400px]">
        <div className="relative w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} booking`, name]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  color: '#111827',
                  fontSize: '13px',
                  padding: '8px 12px',
                }}
                itemStyle={{ color: '#111827' }}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-display font-black text-primary">{total}</span>
            <span className="text-[10px] text-text-light uppercase tracking-wider">Total</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-3 min-w-[140px] text-sm">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-text">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <div className="flex items-center gap-3 text-right">
                <span className="font-semibold text-primary">{entry.value}</span>
                <span className="text-text-light text-xs w-8">
                  {((entry.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
          <div className="border-t border-surface-dark pt-2 flex items-center justify-between mt-1">
            <span className="text-text-light font-medium ml-4.5">Total</span>
            <span className="font-bold text-primary mr-11">{total}</span>
          </div>
        </div>
      </div>

      {/* Revenue & Most Active Day Insights */}
      {hasRevenueData && (
        <div className="w-full max-w-[400px] space-y-3">
          {/* Blok A: Ringkasan Pendapatan */}
          <div className="bg-surface/50 rounded-lg p-3 space-y-1.5 border border-surface-dark">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-light mb-2">Ringkasan Pendapatan</p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-text">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                Pendapatan Masuk
              </span>
              <span className="font-semibold text-emerald-700 text-sm tabular-nums">{formatIdrInline(rIn)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-text">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                Pendapatan Hilang (Cancel)
              </span>
              <span className="font-semibold text-red-400 text-sm tabular-nums">{formatIdrInline(rLost)}</span>
            </div>
          </div>

          {/* Blok B: Hari Paling Aktif */}
          {mostActiveDay && (
            <div className="bg-surface/50 rounded-lg p-3 border border-surface-dark">
              <p className="text-sm text-text">
                Paling banyak booking:{" "}
                <span className="font-semibold text-primary">{mostActiveDay.name}</span>
                <span className="text-text-light"> ({mostActiveDay.count} booking)</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
