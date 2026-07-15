import { HeroCounter } from "./HeroCounter";
import { Container } from "./ui";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-chrome">
      <div className="tile-grout absolute inset-0 opacity-70" aria-hidden="true" />
      <Container className="relative py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* IZQUIERDA — copy + CTA */}
          <div>
            <p className="readout font-mono mb-6">GIX · El mostrador</p>

            <h1 className="font-display text-ink text-[clamp(2.6rem,6.4vw,4.8rem)] leading-[0.92]">
              Cobrá el mes que viene, hoy.
            </h1>

            <p className="mt-6 max-w-[42ch] text-lg text-slate leading-relaxed">
              Tus clientes pagan la membresía por adelantado. Vos sabés cuánto
              entra el 1 de cada mes.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="#waitlist"
                className="btn-stamp inline-flex items-center rounded-[3px] px-7 py-4 text-lg"
              >
                Probar 30 días gratis
              </a>
              <span className="font-mono text-sm text-slate">
                Sin tarjeta. $39.900/mes cuando arranques.
              </span>
            </div>
          </div>

          {/* DERECHA — el saldo bajando. Elemento firma. */}
          <div className="w-full">
            <div className="border border-ink bg-tile px-4 pt-4 sm:px-5 sm:pt-5">
              <div className="flex items-center justify-between gap-6">
                <span className="readout font-mono">Plan Café Mensual</span>
                <span className="readout font-mono text-ink">Saldo</span>
              </div>
              <HeroCounter unit="CAFÉS" />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-chrome py-3">
                <span className="font-mono text-sm text-slate">$30.000/mes</span>
                <span className="font-mono text-sm text-slate">30 cafés</span>
                <span className="font-mono text-sm text-slate">máx. 2 por día</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
