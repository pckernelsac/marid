import { memo } from "react";
import { motion } from "framer-motion";

import type { OdontogramEntry, ToothCondition, ToothSurface } from "@/types";
import { cn } from "@/lib/utils";
import { CONDITION_META } from "./constants";

const S = 40; // surface-cross side length
const q = S / 4;

/** The five clinical surfaces drawn as a classic odontogram cross. */
const SURFACE_POLYGONS: Record<
  Exclude<ToothSurface, "root" | "crown" | "whole">,
  string
> = {
  vestibular: `0,0 ${S},0 ${S - q},${q} ${q},${q}`,
  distal: `${S},0 ${S},${S} ${S - q},${S - q} ${S - q},${q}`,
  lingual: `0,${S} ${S},${S} ${S - q},${S - q} ${q},${S - q}`,
  mesial: `0,0 0,${S} ${q},${S - q} ${q},${q}`,
  oclusal: `${q},${q} ${S - q},${q} ${S - q},${S - q} ${q},${S - q}`,
};

const SURFACE_ORDER: (keyof typeof SURFACE_POLYGONS)[] = [
  "vestibular",
  "distal",
  "lingual",
  "mesial",
  "oclusal",
];

interface ToothProps {
  fdi: string;
  entries: OdontogramEntry[];
  flipped?: boolean; // lower arch points roots downward
  selected: boolean;
  highlighted: boolean;
  onSurfaceClick: (fdi: string, surface: ToothSurface) => void;
  onHover: (fdi: string | null) => void;
}

function conditionFor(
  entries: OdontogramEntry[],
  surface: ToothSurface,
): ToothCondition | null {
  const entry = entries.find((e) => e.surface === surface);
  return entry ? entry.condition : null;
}

function ToothComponent({
  fdi,
  entries,
  flipped = false,
  selected,
  highlighted,
  onSurfaceClick,
  onHover,
}: ToothProps) {
  const whole = entries.find((e) => e.surface === "whole");
  const wholeCondition = whole?.condition ?? null;
  const isAbsent = wholeCondition === "absent";
  const isExtraction = wholeCondition === "extraction";

  const labelY = flipped ? S + 26 : -10;
  const crownY = flipped ? S + 6 : -2;

  return (
    <motion.g
      className="cursor-pointer"
      initial={false}
      animate={{ scale: highlighted || selected ? 1.08 : 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      onMouseEnter={() => onHover(fdi)}
      onMouseLeave={() => onHover(null)}
    >
      {/* FDI number — clicking it edits the whole tooth */}
      <text
        x={S / 2}
        y={labelY}
        textAnchor="middle"
        className={cn(
          "select-none text-[11px] font-semibold tabular-nums hover:fill-primary",
          selected ? "fill-primary" : "fill-slate-500",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSurfaceClick(fdi, "whole");
        }}
      >
        {fdi}
      </text>

      {/* Selection ring */}
      {selected && (
        <rect
          x={-4}
          y={-4}
          width={S + 8}
          height={S + 8}
          rx={8}
          className="fill-primary/5 stroke-primary"
          strokeWidth={1.5}
        />
      )}

      {/* Root/crown hint marker */}
      <rect
        x={S / 2 - 5}
        y={crownY}
        width={10}
        height={3}
        rx={1.5}
        className="fill-slate-300"
      />

      {/* The five surfaces */}
      <g opacity={isAbsent ? 0.25 : 1}>
        {SURFACE_ORDER.map((surface) => {
          const condition = conditionFor(entries, surface);
          const meta = condition ? CONDITION_META[condition] : null;
          return (
            <polygon
              key={surface}
              points={SURFACE_POLYGONS[surface]}
              fill={meta ? meta.color : "#ffffff"}
              stroke="#cbd5e1"
              strokeWidth={1}
              className="transition-[fill] duration-200 hover:stroke-primary hover:stroke-[1.6px]"
              onClick={(e) => {
                e.stopPropagation();
                onSurfaceClick(fdi, surface);
              }}
            >
              <title>{`${fdi} · ${surface}${
                meta ? ` · ${meta.label}` : ""
              }`}</title>
            </polygon>
          );
        })}
      </g>

      {/* Whole-tooth overlays */}
      {isExtraction && (
        <g stroke="#0f172a" strokeWidth={2.4} strokeLinecap="round">
          <line x1={2} y1={2} x2={S - 2} y2={S - 2} />
          <line x1={S - 2} y1={2} x2={2} y2={S - 2} />
        </g>
      )}
      {wholeCondition === "implant" && (
        <g stroke="#475569" strokeWidth={1.6}>
          <line x1={S / 2} y1={6} x2={S / 2} y2={S - 6} />
          <line x1={S / 2 - 5} y1={12} x2={S / 2 + 5} y2={12} />
          <line x1={S / 2 - 5} y1={20} x2={S / 2 + 5} y2={20} />
          <line x1={S / 2 - 5} y1={28} x2={S / 2 + 5} y2={28} />
        </g>
      )}
      {wholeCondition === "crown" && (
        <circle
          cx={S / 2}
          cy={S / 2}
          r={S / 2 - 1}
          fill="none"
          stroke={CONDITION_META.crown.badge}
          strokeWidth={2.2}
        />
      )}
      {wholeCondition === "endodontics" && (
        <path
          d={`M${S / 2},${S - 4} L${S / 2 - 6},8 M${S / 2},${S - 4} L${
            S / 2 + 6
          },8`}
          stroke={CONDITION_META.endodontics.badge}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {wholeCondition === "mobility" && (
        <text
          x={S / 2}
          y={S / 2 + 4}
          textAnchor="middle"
          className="text-[12px] font-bold"
          fill={CONDITION_META.mobility.badge}
        >
          ↔
        </text>
      )}
    </motion.g>
  );
}

export const Tooth = memo(ToothComponent);
export const TOOTH_SIZE = S;
