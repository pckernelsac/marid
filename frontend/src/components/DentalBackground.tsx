import { cn } from "@/lib/utils";

const TOOTH_PATH =
  "M12 2.5c-2.2 0-3.2 1-5 1S3.5 2.8 3 5.2c-.5 2.4.6 4.2 1.2 6.6.5 2 .4 4.3 1.1 6.5.4 1.3 1 2.7 1.9 2.7 1.2 0 1.1-2.4 1.6-4 .3-1 .6-1.8 1.2-1.8s.9.8 1.2 1.8c.5 1.6.4 4 1.6 4 .9 0 1.5-1.4 1.9-2.7.7-2.2.6-4.5 1.1-6.5.6-2.4 1.7-4.2 1.2-6.6C20.5 2.8 18.8 3.5 17 3.5s-2.8-1-5-1Z";

interface Props {
  /** Pattern stroke/fill color. */
  color?: string;
  /** Overall opacity of the pattern layer. */
  opacity?: number;
  /** Unique id so multiple instances don't collide. */
  id?: string;
  className?: string;
}

/**
 * Subtle, vectorial dentistry-themed background: a tiled tooth motif.
 * Render it as the first child of a `relative` container.
 */
export function DentalBackground({
  color = "#3b82f6",
  opacity = 0.05,
  id = "dental-pattern",
  className,
}: Props) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={id}
            width="112"
            height="112"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-8)"
          >
            <g fill={color}>
              <g transform="translate(8 10) scale(1.5)">
                <path d={TOOTH_PATH} />
              </g>
              <g transform="translate(64 60) scale(1.1)" opacity="0.7">
                <path d={TOOTH_PATH} />
              </g>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
