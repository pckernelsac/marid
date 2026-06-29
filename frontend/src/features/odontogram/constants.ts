import type { ToothCondition } from "@/types";

export interface ConditionMeta {
  label: string;
  /** Fill color for the surface */
  color: string;
  /** Text/accent color for legends and badges */
  badge: string;
}

/**
 * Visual state map for every tooth condition.
 * Colors follow the clinical convention requested by Madrid Dental Studio.
 */
export const CONDITION_META: Record<ToothCondition, ConditionMeta> = {
  healthy: { label: "Sano", color: "#ffffff", badge: "#64748b" },
  caries: { label: "Caries", color: "#ef4444", badge: "#ef4444" },
  resin: { label: "Resina", color: "#3b82f6", badge: "#3b82f6" },
  endodontics: { label: "Endodoncia", color: "#8b5cf6", badge: "#8b5cf6" },
  crown: { label: "Corona", color: "#f59e0b", badge: "#d97706" },
  implant: { label: "Implante", color: "#94a3b8", badge: "#64748b" },
  extraction: { label: "Extracción", color: "#0f172a", badge: "#0f172a" },
  absent: { label: "Ausente", color: "#e2e8f0", badge: "#94a3b8" },
  prosthesis: { label: "Prótesis", color: "#22c55e", badge: "#16a34a" },
  sealant: { label: "Sellante", color: "#38bdf8", badge: "#0ea5e9" },
  fracture: { label: "Fractura", color: "#fb923c", badge: "#ea580c" },
  mobility: { label: "Movilidad", color: "#facc15", badge: "#ca8a04" },
};

export const CONDITION_ORDER: ToothCondition[] = [
  "healthy",
  "caries",
  "resin",
  "endodontics",
  "crown",
  "implant",
  "prosthesis",
  "sealant",
  "fracture",
  "mobility",
  "extraction",
  "absent",
];

/**
 * FDI numbering. Quadrants are ordered as drawn on screen
 * (patient's perspective mirrored to the dentist's view: right → left).
 */
export const FDI_PERMANENT = {
  upperRight: ["18", "17", "16", "15", "14", "13", "12", "11"],
  upperLeft: ["21", "22", "23", "24", "25", "26", "27", "28"],
  lowerRight: ["48", "47", "46", "45", "44", "43", "42", "41"],
  lowerLeft: ["31", "32", "33", "34", "35", "36", "37", "38"],
} as const;

export const FDI_TEMPORARY = {
  upperRight: ["55", "54", "53", "52", "51"],
  upperLeft: ["61", "62", "63", "64", "65"],
  lowerRight: ["85", "84", "83", "82", "81"],
  lowerLeft: ["71", "72", "73", "74", "75"],
} as const;

export const SURFACE_LABELS: Record<string, string> = {
  vestibular: "Vestibular",
  lingual: "Lingual / Palatino",
  mesial: "Mesial",
  distal: "Distal",
  oclusal: "Oclusal / Incisal",
  root: "Raíz",
  crown: "Corona",
  whole: "Pieza completa",
};
