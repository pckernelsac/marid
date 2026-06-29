import type { ChartOptions, Plugin } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { formatCurrency } from "@/lib/utils";

import "./chartSetup";
import type { NamedAmount } from "./hooks";

const PALETTE = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

// Plugin: total al centro del doughnut.
function centerTextPlugin(total: string): Plugin<"doughnut"> {
  return {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 11px Inter, sans-serif";
      ctx.fillText("Total mes", x, y - 12);
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 18px Inter, sans-serif";
      ctx.fillText(total, x, y + 8);
      ctx.restore();
    },
  };
}

export function IncomeMethodChart({ data }: { data: NamedAmount[] }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
        borderColor: "#fff",
        borderWidth: 3,
        hoverOffset: 6,
        hoverBorderColor: "#fff",
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 14,
          font: { size: 12 },
          color: "#475569",
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        cornerRadius: 12,
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        usePointStyle: true,
        boxPadding: 6,
        callbacks: {
          label: (item) => {
            const value = item.parsed;
            const pct = total ? Math.round((value / total) * 100) : 0;
            return `  ${formatCurrency(value)} · ${pct}%`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Doughnut
        data={chartData}
        options={options}
        plugins={[centerTextPlugin(formatCurrency(total))]}
      />
    </div>
  );
}
