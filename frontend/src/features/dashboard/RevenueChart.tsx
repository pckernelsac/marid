import type { ChartOptions, ScriptableContext } from "chart.js";
import { Line } from "react-chartjs-2";

import { formatCurrency } from "@/lib/utils";

import "./chartSetup";
import type { DayPoint } from "./hooks";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function gradient(
  ctx: ScriptableContext<"line">,
  from: string,
  to: string,
): CanvasGradient | string {
  const { chart } = ctx;
  const { ctx: canvas, chartArea } = chart;
  if (!chartArea) return from;
  const g = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

export function RevenueChart({ data }: { data: DayPoint[] }) {
  const labels = data.map((p) => {
    const d = new Date(`${p.day}T00:00:00`);
    return WEEKDAYS[d.getDay()];
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Ingresos",
        data: data.map((p) => p.income),
        borderColor: "#2563eb",
        backgroundColor: (ctx: ScriptableContext<"line">) =>
          gradient(ctx, "rgba(37, 99, 235, 0.28)", "rgba(37, 99, 235, 0)"),
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#2563eb",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      },
      {
        label: "Egresos",
        data: data.map((p) => p.expense),
        borderColor: "#f43f5e",
        backgroundColor: (ctx: ScriptableContext<"line">) =>
          gradient(ctx, "rgba(244, 63, 94, 0.16)", "rgba(244, 63, 94, 0)"),
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#f43f5e",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          font: { size: 12, weight: 500 },
          color: "#475569",
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        cornerRadius: 12,
        titleColor: "#f8fafc",
        titleFont: { size: 12, weight: 600 },
        bodyColor: "#e2e8f0",
        bodyFont: { size: 12 },
        bodySpacing: 6,
        usePointStyle: true,
        boxPadding: 6,
        callbacks: {
          label: (item) =>
            `  ${item.dataset.label}: ${formatCurrency(item.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 12 }, padding: 8 },
      },
      y: {
        grid: { color: "#eef2f7" },
        border: { display: false },
        ticks: {
          font: { size: 12 },
          padding: 8,
          maxTicksLimit: 5,
          callback: (v) =>
            new Intl.NumberFormat("es-PE", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(Number(v)),
        },
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
