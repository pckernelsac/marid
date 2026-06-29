import { useMemo } from "react";

import type { OdontogramEntry, ToothSurface } from "@/types";
import { Tooth, TOOTH_SIZE } from "./Tooth";
import { FDI_PERMANENT, FDI_TEMPORARY } from "./constants";

const GAP = 16;
const CELL = TOOTH_SIZE + GAP;
const CENTER_GAP = 28;
const ROW_GAP = 64;
const PAD_X = 24;
const LABEL_W = 132;

interface RowConfig {
  key: string;
  label: string;
  right: readonly string[];
  left: readonly string[];
  flipped: boolean;
}

const ROWS: RowConfig[] = [
  {
    key: "perm-upper",
    label: "Permanente superior",
    right: FDI_PERMANENT.upperRight,
    left: FDI_PERMANENT.upperLeft,
    flipped: false,
  },
  {
    key: "temp-upper",
    label: "Temporal superior",
    right: FDI_TEMPORARY.upperRight,
    left: FDI_TEMPORARY.upperLeft,
    flipped: false,
  },
  {
    key: "temp-lower",
    label: "Temporal inferior",
    right: FDI_TEMPORARY.lowerRight,
    left: FDI_TEMPORARY.lowerLeft,
    flipped: true,
  },
  {
    key: "perm-lower",
    label: "Permanente inferior",
    right: FDI_PERMANENT.lowerRight,
    left: FDI_PERMANENT.lowerLeft,
    flipped: true,
  },
];

const MAX_TEETH = FDI_PERMANENT.upperRight.length + FDI_PERMANENT.upperLeft.length;
const ARCH_WIDTH = MAX_TEETH * CELL + CENTER_GAP;
const SVG_WIDTH = LABEL_W + PAD_X * 2 + ARCH_WIDTH;
const SVG_HEIGHT = PAD_X * 2 + ROWS.length * (TOOTH_SIZE + ROW_GAP);

interface ChartProps {
  entriesByTooth: Map<string, OdontogramEntry[]>;
  selectedTooth: string | null;
  hoveredTooth: string | null;
  onSurfaceClick: (fdi: string, surface: ToothSurface) => void;
  onHover: (fdi: string | null) => void;
}

export function OdontogramChart({
  entriesByTooth,
  selectedTooth,
  hoveredTooth,
  onSurfaceClick,
  onHover,
}: ChartProps) {
  const rows = useMemo(() => ROWS, []);

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="w-full select-none"
      role="img"
      aria-label="Odontograma"
    >
      {rows.map((row, rowIdx) => {
        const rowY = PAD_X + rowIdx * (TOOTH_SIZE + ROW_GAP) + 24;
        const archStartX = LABEL_W + PAD_X;
        // center the row's teeth (temporary rows are shorter)
        const teethInRow = row.right.length + row.left.length;
        const rowWidth = teethInRow * CELL + CENTER_GAP;
        const offsetX = archStartX + (ARCH_WIDTH - rowWidth) / 2;

        return (
          <g key={row.key}>
            <text
              x={PAD_X}
              y={rowY + TOOTH_SIZE / 2}
              className="fill-slate-400 text-[12px] font-medium"
            >
              {row.label}
            </text>
            {/* midline */}
            <line
              x1={archStartX + ARCH_WIDTH / 2}
              y1={rowY - 18}
              x2={archStartX + ARCH_WIDTH / 2}
              y2={rowY + TOOTH_SIZE + 18}
              className="stroke-slate-200"
              strokeDasharray="3 4"
            />
            {[...row.right, ...row.left].map((fdi, i) => {
              const isRight = i < row.right.length;
              const x =
                offsetX +
                i * CELL +
                (isRight ? 0 : CENTER_GAP);
              return (
                <g key={fdi} transform={`translate(${x}, ${rowY})`}>
                  <Tooth
                    fdi={fdi}
                    entries={entriesByTooth.get(fdi) ?? []}
                    flipped={row.flipped}
                    selected={selectedTooth === fdi}
                    highlighted={hoveredTooth === fdi}
                    onSurfaceClick={onSurfaceClick}
                    onHover={onHover}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
