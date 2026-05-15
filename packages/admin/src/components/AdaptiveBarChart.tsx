import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import type { SeriesPoint } from "../lib/chartUtils";
import { formatIdr } from "../lib/chartUtils";

type TrendMetric = "count" | "revenue";

type Props = {
  series: SeriesPoint[];
  metric: TrendMetric;
};

export default function AdaptiveBarChart({ series, metric }: Props) {
  const values = series.map((s) => s[metric]);
  const maxVal = Math.max(0, ...values);
  const maxIdx = values.indexOf(maxVal);

  const barColor = metric === "count" ? "#2D3748" : "#C19652";
  const highlightColor = metric === "count" ? "#4A5A6F" : "#D4A574";

  if (series.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-light text-sm">
        Tidak ada data untuk ditampilkan.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#6B7280" }}
          tickLine={false}
          axisLine={{ stroke: "#E8E6E3" }}
          interval={series.length > 20 ? Math.floor(series.length / 15) : 0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6B7280" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => (metric === "revenue" ? `${(v / 1_000_000).toFixed(0)}jt` : String(v))}
          width={48}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #E8E6E3",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: "12px",
          }}
          formatter={(value: any) => [
            metric === "count" ? `${value} booking` : formatIdr(value as number),
            metric === "count" ? "Total Booking" : "Total Pendapatan",
          ]}
          labelFormatter={(label: any) => `Periode: ${label}`}
        />
        <Bar
          dataKey={metric}
          radius={[4, 4, 0, 0]}
          animationDuration={600}
          animationBegin={0}
        >
          {series.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === maxIdx && maxVal > 0 ? highlightColor : barColor}
              opacity={series[index][metric] === 0 ? 0.25 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
