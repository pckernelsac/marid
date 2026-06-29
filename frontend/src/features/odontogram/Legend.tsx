import { CONDITION_META, CONDITION_ORDER } from "./constants";

export function Legend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {CONDITION_ORDER.map((c) => {
        const meta = CONDITION_META[c];
        return (
          <div key={c} className="flex items-center gap-2 text-xs text-slate-600">
            <span
              className="h-3.5 w-3.5 rounded-[4px] border border-slate-300"
              style={{ background: meta.color }}
            />
            {meta.label}
          </div>
        );
      })}
    </div>
  );
}
