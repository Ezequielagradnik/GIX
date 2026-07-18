import { Container, SectionLabel } from "./ui";
import { DemoTicket } from "./DemoTicket";

/* ============================================================
   § 06 PRECIO — la impresora del mostrador, ahora en 3D.
   Al entrar al viewport, el ticket sale de la ranura, queda
   colgado del slot y se hamaca como papel recién impreso; sigue
   apenas el mouse. Al final cae el sello "30 días gratis".
   Reduced-motion / sin WebGL: impresora 2D, ticket ya impreso.
   ============================================================ */

export function Pricing() {
  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 06">Precio</SectionLabel>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="max-w-[40ch]">
            <h2 className="font-display text-ink text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
              Un solo plan. Todo incluido.
            </h2>
            <p className="readout mt-6 font-mono">Precio</p>
            <p className="mt-2 font-mono text-[clamp(1.9rem,3.5vw,2.6rem)] font-semibold leading-none tabular-nums text-ink">
              $39.900{" "}
              <span className="text-base font-normal tracking-normal text-slate">
                por mes
              </span>
            </p>
            <p className="mt-5 text-slate leading-relaxed">
              Creá tus planes, cobrá automáticamente, gestioná consumos y
              fidelizá clientes desde un solo lugar.
            </p>
          </div>

          {/* La impresora térmica, en 3D */}
          <DemoTicket />
        </div>
      </Container>
    </section>
  );
}
