import { Logo } from "./Logo";

/* ============================================================
   UI de la app de GIX (la pantalla del telefono del cliente).
   DOM real: nitida, con las fuentes de marca. La usa el telefono
   3D (proyectada con drei Html) y el fallback estatico 2D.
   Diseño fijo 312 x 664 (proporcion de pantalla de telefono).
   ============================================================ */

/* Marco del telefono + pantalla, una sola pieza DOM: el bisel es
   uniforme siempre (lo usan el telefono 3D y el fallback 2D). */
export function PhoneFrame({
  saldo = 28,
  codigo = "583921",
}: {
  saldo?: number;
  codigo?: string;
}) {
  return (
    <div className="w-fit rounded-[44px] bg-ink p-[10px] shadow-[0_30px_60px_-30px_rgba(22,25,26,0.6)]">
      <GixAppUI saldo={saldo} codigo={codigo} />
    </div>
  );
}

export function GixAppUI({
  saldo = 28,
  codigo = "583921",
}: {
  saldo?: number;
  codigo?: string;
}) {
  return (
    <div
      id="gix-app-screen"
      className="relative flex h-[664px] w-[312px] flex-col overflow-hidden rounded-[34px] bg-tile"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Dynamic island */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[12px] h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-ink"
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-7 pt-[16px]">
        <span className="font-mono text-[12px] font-semibold text-ink">9:41</span>
        <div className="flex items-center gap-[6px]">
          <span className="flex items-end gap-[2px]" aria-hidden="true">
            <span className="h-[4px] w-[3px] rounded-[1px] bg-ink" />
            <span className="h-[7px] w-[3px] rounded-[1px] bg-ink" />
            <span className="h-[10px] w-[3px] rounded-[1px] bg-ink" />
          </span>
          <span
            aria-hidden="true"
            className="relative h-[11px] w-[22px] rounded-[3px] border border-ink"
          >
            <span className="absolute bottom-[2px] left-[2px] top-[2px] w-[11px] rounded-[1px] bg-ink" />
          </span>
        </div>
      </div>

      {/* Header: marca + plan */}
      <div className="mt-8 flex items-baseline justify-between px-7">
        <Logo size={22} />
        <span className="readout">Plan Café</span>
      </div>
      <div className="mx-7 mt-5 border-t border-chrome" />

      {/* Saldo */}
      <div className="px-7 pt-6">
        <p className="readout">Tu saldo</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-[80px] font-semibold leading-[0.95] text-stamp tabular-nums">
            {saldo}
          </span>
          <span className="text-[17px] text-slate">cafés</span>
        </div>
        <p className="mt-3 font-mono text-[11px] text-slate">
          Podés retirar 2 hoy
        </p>
      </div>

      {/* Codigo */}
      <div className="px-7 pt-7">
        <p className="readout">Mostrá este código en caja</p>
        <div className="mt-3 rounded-[10px] border-[1.5px] border-ink py-4 text-center">
          <span className="pl-[0.18em] font-mono text-[30px] font-semibold tracking-[0.18em] text-ink tabular-nums">
            {codigo}
          </span>
        </div>
        <div className="mt-3 rounded-[10px] bg-ink py-[14px] text-center">
          <span className="font-display text-[15px] text-tile">Mostrar QR</span>
        </div>
      </div>

      {/* Detalle del plan */}
      <div className="mt-auto px-7 pb-7">
        <div className="border-t border-chrome pt-4">
          <div className="flex items-baseline justify-between font-mono text-[11px] text-slate">
            <span>Último retiro</span>
            <span>Hoy 09:12</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono text-[11px] text-slate">
            <span>Se renueva</span>
            <span>01 AGO</span>
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div
        aria-hidden="true"
        className="absolute bottom-[8px] left-1/2 h-[4px] w-[110px] -translate-x-1/2 rounded-full bg-ink/70"
      />
    </div>
  );
}
