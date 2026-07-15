/* Fallback estatico del contador: sin WebGL, sin animacion.
   Se usa mientras carga el 3D, en prefers-reduced-motion y si no
   hay soporte. Mismo lenguaje: tiles ink, digitos rojo mono. */
export function CounterStatic({ value = 30, unit = "CAFÉS" }: { value?: number; unit?: string }) {
  const digits = String(value).padStart(2, "0").split("");
  return (
    <div className="flex items-stretch gap-1.5" aria-label={`Saldo: ${value} ${unit.toLowerCase()}`}>
      {digits.map((d, i) => (
        <div
          key={i}
          className="relative flex h-[1.34em] w-[0.92em] items-center justify-center rounded-[0.08em] bg-ink font-mono font-semibold text-stamp tabular-nums"
          style={{ boxShadow: "inset 0 0 0 1px rgba(200,204,201,0.2)" }}
        >
          <span
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/40"
            aria-hidden="true"
          />
          {d}
        </div>
      ))}
      <div
        className="flex h-[1.34em] items-center justify-center rounded-[0.08em] bg-ink px-[0.34em]"
        aria-hidden="true"
      >
        <span
          className="font-mono font-medium text-chrome"
          style={{ fontSize: "0.3em", letterSpacing: "0.26em", paddingLeft: "0.26em" }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}
