import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";

import type { Radiograph } from "./hooks";

export function RadiographLightbox({
  radiograph,
  onClose,
}: {
  radiograph: Radiograph | null;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);

  return (
    <AnimatePresence onExitComplete={() => setZoom(1)}>
      {radiograph && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col bg-slate-950/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <p className="font-medium">{radiograph.title}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Alejar"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="w-12 text-center text-sm tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Acercar"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <a
                href={radiograph.file_url}
                download
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Descargar"
              >
                <Download className="h-5 w-5" />
              </a>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div
            className="flex flex-1 items-center justify-center overflow-auto p-6"
            onClick={onClose}
          >
            <motion.img
              src={radiograph.file_url}
              alt={radiograph.title}
              className="max-h-full rounded-lg shadow-2xl"
              style={{ scale: zoom }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
