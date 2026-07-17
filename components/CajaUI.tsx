import { Logo, StampCheck } from "./Logo";

/* ============================================================
   UI de la caja (la pantalla de la compu del mostrador).
   DOM real: nitida, fuentes de marca. La usa la Mac 3D
   (proyectada con drei Html) y el fallback estatico 2D.
   Diseño fijo 480 x 300 (pantalla apaisada).
   ============================================================ */

export function CajaUI({
  codigo = "583921",
  saldo = 27,
  nombre = "Martín Gómez",
  pack = "Café + medialuna",
}: {
  codigo?: string;
  saldo?: number;
  nombre?: string;
  pack?: string;
}) {
  return (
    <div
      id="gix-caja-screen"
      className="flex h-[300px] w-[480px] flex-col bg-ink p-6 text-tile"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between font-mono text-[12px] text-chrome">
        <span>CAJA · 01</span>
        <span>Validar consumo</span>
      </div>
      <div className="mt-4 border-t border-white/10" />

      {/* Cuerpo */}
      <div className="flex flex-1 items-stretch gap-6 pt-5">
        {/* Izquierda: cliente + token + validado */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="font-mono text-[12px] text-chrome">Cliente</p>
            <p className="mt-1 font-display text-[20px] leading-tight">{nombre}</p>
            <p className="mt-0.5 font-mono text-[12px] text-slate">{pack}</p>
            <p className="mt-4 font-mono text-[12px] text-chrome">Token</p>
            <p className="mt-1 font-mono text-[30px] font-semibold leading-none tracking-[0.12em] tabular-nums">
              {codigo}
            </p>
          </div>
          <div className="flex items-center gap-3 pb-1">
            <StampCheck size={42} />
            <div>
              <p className="font-display text-[19px] leading-none">Validado</p>
              <p className="mt-1 font-mono text-[12px] text-chrome">
                Consumo descontado
              </p>
            </div>
          </div>
        </div>

        {/* Derecha: nuevo saldo */}
        <div className="flex w-[150px] flex-col justify-center border-l border-white/10 pl-6">
          <p className="font-mono text-[12px] text-chrome">Nuevo saldo</p>
          <p className="mt-2 font-mono text-[46px] font-semibold leading-none text-stamp tabular-nums">
            {saldo}
          </p>
          <p className="mt-1 font-body text-[14px] text-slate">cafés</p>
        </div>
      </div>
    </div>
  );
}

/* Compu del mostrador: bisel + pantalla + menton de aluminio con el
   logo, una sola pieza DOM (mismo patron que PhoneFrame). */
export function MacFrame({
  codigo = "583921",
  saldo = 27,
}: {
  codigo?: string;
  saldo?: number;
}) {
  return (
    <div className="w-fit overflow-hidden rounded-[16px] shadow-[0_30px_60px_-30px_rgba(22,25,26,0.6)]">
      <div className="bg-[#0b0d0d] p-[12px]">
        <div className="overflow-hidden rounded-[6px]">
          <CajaUI codigo={codigo} saldo={saldo} />
        </div>
      </div>
      <div className="flex h-[44px] items-center justify-center bg-chrome">
        <span className="inline-block -translate-x-[3px]">
          <Logo size={22} />
        </span>
      </div>
    </div>
  );
}
