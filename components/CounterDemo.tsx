import { DemoPhone } from "./DemoPhone";
import { DemoMac } from "./DemoMac";
import { Container, SectionLabel } from "./ui";

export function CounterDemo() {
  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 04">La demo del mostrador</SectionLabel>

        <div className="mt-4 max-w-[52ch]">
          <h2 className="font-display text-ink text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
            Mostrá tu token y empezá a consumir. Validar el consumo lleva menos
            de 3 segundos.
          </h2>
          <p className="mt-3 text-slate leading-relaxed">
            Sin hardware. Sin app que instalar. Un código de 6 dígitos y listo.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-6 lg:grid-cols-[0.85fr_auto_1.15fr]">
          {/* TELEFONO DEL CLIENTE — app de GIX en 3D */}
          <div className="w-full">
            <span className="readout font-mono mb-2 block">Teléfono del cliente</span>
            <DemoPhone />
          </div>

          {/* FLUJO */}
          <div className="flex items-center justify-center lg:flex-col" aria-hidden="true">
            <span className="font-mono text-2xl text-chrome lg:rotate-90">&rarr;</span>
          </div>

          {/* COMPU DE LA CAJA — 3D */}
          <div className="w-full">
            <span className="readout font-mono mb-2 block">Pantalla de la caja</span>
            <DemoMac />
          </div>
        </div>
      </Container>
    </section>
  );
}
