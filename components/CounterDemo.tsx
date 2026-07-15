import { StampCheck } from "./Logo";
import { DemoPhone } from "./DemoPhone";
import { Container, SectionLabel } from "./ui";

export function CounterDemo() {
  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 04">La demo del mostrador</SectionLabel>

        <div className="mt-4 max-w-[52ch]">
          <h2 className="font-display text-ink text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
            El cliente muestra su saldo. El cajero lo descuenta.
          </h2>
          <p className="mt-3 text-slate leading-relaxed">
            Sin hardware. Sin app que instalar. Un código de 6 dígitos y listo.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* TELEFONO DEL CLIENTE — app de GIX en 3D */}
          <div className="w-full">
            <span className="readout font-mono mb-2 block">Teléfono del cliente</span>
            <DemoPhone />
          </div>

          {/* FLUJO */}
          <div className="flex items-center justify-center lg:flex-col" aria-hidden="true">
            <span className="font-mono text-2xl text-chrome lg:rotate-90">&rarr;</span>
          </div>

          {/* PANTALLA DE LA CAJA — 2D nítido */}
          <div className="mx-auto w-full max-w-[380px]">
            <span className="readout font-mono mb-2 block">Pantalla de la caja</span>
            <div className="rounded-[6px] border-2 border-ink bg-ink p-6 text-tile shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-sm text-chrome">CAJA · 01</span>
                <span className="font-mono text-sm text-chrome">Validar consumo</span>
              </div>
              <p className="font-mono text-sm text-chrome">Código del cliente</p>
              <p className="font-mono text-3xl font-semibold tracking-[0.12em] tabular-nums">
                583921
              </p>

              <div className="my-6 flex items-center gap-4 border-y border-white/10 py-5">
                <span className="leading-none">
                  <StampCheck size={54} />
                </span>
                <div>
                  <p className="font-display text-xl leading-none">Validado</p>
                  <p className="mt-1 font-mono text-sm text-chrome">Consumo descontado</p>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="font-mono text-sm text-chrome">Nuevo saldo</span>
                <span className="font-mono text-2xl font-semibold text-stamp tabular-nums">
                  27 cafés
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
