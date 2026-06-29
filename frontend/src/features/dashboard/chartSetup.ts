import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

// Registro único de los componentes de Chart.js usados en el dashboard.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

// Tipografía coherente con la app.
ChartJS.defaults.font.family =
  "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";
ChartJS.defaults.color = "#94a3b8";

export { ChartJS };
