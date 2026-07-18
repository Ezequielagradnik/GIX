/* ============================================================
   La terminal de cobro de GIX (DOM real).
   Un posnet vertical: cabezal de impresora arriba (de donde sale
   el recibo con el sello "30 días gratis"), pantalla con el
   precio y mentón. Todo el frente es UNA pieza DOM: la usan la
   terminal 3D (proyectada con drei Html) y el fallback 2D.
   Ancho fijo 340. `printed` dispara la impresión del recibo.
   ============================================================ */

export const TERM_W = 340;
export const PAPER_H = 120; // ventana por donde asoma el recibo

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="px-6 py-3">
      <div className="flex items-baseline justify-between gap-4 font-mono text-ink">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      </div>
      {sub && <p className="mt-1 font-mono text-xs text-slate">{sub}</p>}
    </div>
  );
}

export function TerminalFrame({ printed = true }: { printed?: boolean }) {
  return (
    <div style={{ width: TERM_W }} className="relative">
      {/* El recibo: sube desde atrás del cabezal cuando se imprime. */}
      <div
        className="absolute left-1/2 top-0 z-0 -translate-x-1/2 overflow-hidden"
        style={{ width: 264, height: PAPER_H }}
      >
        <div
          style={{
            transform: printed
              ? "translateY(12px)"
              : `translateY(${PAPER_H + 6}px)`,
            transition: "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.25s",
          }}
        >
          <div
            style={{ height: PAPER_H }}
            className="bg-[#f3f5f3] px-4 pt-3 text-center shadow-[0_-4px_14px_rgba(22,25,26,0.18)]"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate">
              GIX · Recibo N.º 0001
            </p>
            <div
              className="mx-auto mt-3 w-fit rotate-[-6deg] rounded-[6px] border-[3px] border-stamp px-3 py-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-stamp"
              style={{ filter: "url(#gix-stamp-ink)" }}
            >
              30 días gratis
            </div>
          </div>
        </div>
      </div>

      {/* El cuerpo de la terminal. */}
      <div
        className="relative z-10 overflow-hidden rounded-[30px] bg-ink shadow-[0_30px_60px_-30px_rgba(22,25,26,0.6)]"
        style={{ marginTop: PAPER_H - 10 }}
      >
        {/* Cabezal de impresión: ranura, barra de corte y LED. */}
        <div className="relative h-[62px]">
          <div className="mx-auto mt-[16px] h-[10px] w-[76%] rounded-full bg-black/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]" />
          <div className="mx-auto mt-[6px] h-[3px] w-[62%] rounded-full bg-white/10" />
          <span
            className="gix-led absolute right-6 top-[19px] h-[7px] w-[7px] rounded-full"
            style={{
              background: "var(--color-stamp)",
              boxShadow: "0 0 8px var(--color-stamp)",
            }}
          />
        </div>

        {/* Pantalla: el precio. */}
        <div className="px-[14px]">
          <div className="overflow-hidden rounded-[16px] bg-tile">
            <div className="px-6 pb-4 pt-5 text-center">
              <p className="font-display text-2xl text-ink">GIX</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-slate">
                Membresías por consumo
              </p>
            </div>
            <hr className="ticket-rule" />
            <Row label="Prueba 30 días" value="$0" sub="Sin tarjeta." />
            <hr className="ticket-rule" />
            <Row
              label="Después"
              value="$39.900 /mes"
              sub="Un plan. Sin escalones."
            />
            <hr className="ticket-rule" />
            <div className="px-6 py-4">
              <div className="flex items-baseline justify-between font-mono text-ink">
                <span className="text-sm uppercase tracking-[0.15em]">
                  Total hoy
                </span>
                <span className="text-2xl font-semibold tabular-nums">$0</span>
              </div>
            </div>
            <div className="px-6 pb-6 pt-1">
              <a
                href="#waitlist"
                style={{ pointerEvents: "auto" }}
                className="btn-stamp flex w-full items-center justify-center rounded-[8px] px-6 py-4 text-base"
              >
                Probar 30 días gratis
              </a>
            </div>
          </div>
        </div>

        {/* Mentón. */}
        <div className="flex h-[46px] items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-chrome">
            GIX · Terminal 01
          </span>
        </div>
      </div>
    </div>
  );
}
