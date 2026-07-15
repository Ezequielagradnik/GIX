import { Container, SectionLabel } from "./ui";

function Row({
  label,
  value,
  strike = false,
  sub,
}: {
  label: string;
  value: string;
  strike?: boolean;
  sub?: string;
}) {
  return (
    <div className="px-7 py-3">
      <div className="flex items-baseline justify-between gap-4 font-mono text-ink">
        <span className="text-sm">{label}</span>
        <span
          className={`text-sm tabular-nums ${
            strike ? "text-slate line-through" : "font-semibold"
          }`}
        >
          {value}
        </span>
      </div>
      {sub && <p className="mt-1 font-mono text-xs text-slate">{sub}</p>}
    </div>
  );
}

export function Pricing() {
  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 06">Precio</SectionLabel>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="max-w-[40ch]">
            <h2 className="font-display text-ink text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
              Un plan. $39.900 por mes.
            </h2>
            <p className="mt-4 text-slate leading-relaxed">
              Sin tabla de tres columnas. Sin &ldquo;contactar ventas&rdquo;. El
              competidor cobra $49.900 y no te resuelve el costo de
              procesamiento.
            </p>
            <p className="mt-4 font-mono text-ink">
              Lo mismo, pero te queda más plata.
            </p>
          </div>

          {/* Ticket termico */}
          <div className="mx-auto w-full max-w-[380px]">
            <div className="ticket">
              <div className="px-7 pb-4 text-center">
                <p className="font-display text-2xl text-ink">GIX</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.22em] text-slate">
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
              <Row label="Otras plataformas" value="$49.900" strike sub="Y te cobran el procesamiento aparte." />
              <hr className="ticket-rule" />
              <div className="px-7 py-4">
                <div className="flex items-baseline justify-between font-mono text-ink">
                  <span className="text-sm uppercase tracking-[0.15em]">
                    Total hoy
                  </span>
                  <span className="text-2xl font-semibold tabular-nums">$0</span>
                </div>
              </div>
              <div className="px-7 pt-2">
                <a
                  href="#waitlist"
                  className="btn-stamp flex w-full items-center justify-center rounded-[3px] px-6 py-4 text-base"
                >
                  Probar 30 días gratis
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
