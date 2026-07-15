import { Container, SectionLabel } from "./ui";

const STEPS = [
  {
    n: "01",
    title: "Creás el plan",
    body: "Definís cuántos consumos, el precio y el tope por día. Dos minutos.",
  },
  {
    n: "02",
    title: "Pegás el QR",
    body: "Lo imprimís y lo pegás en el mostrador. El cliente se suscribe solo, desde el teléfono.",
  },
  {
    n: "03",
    title: "Cobrás todos los meses",
    body: "El cobro se renueva automático. Vos ves cuánto entra el 1 de cada mes.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 03">Cómo funciona</SectionLabel>
        <ol className="mt-12 grid gap-px border border-chrome bg-chrome sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="flex flex-col bg-tile p-6 sm:p-8">
              {/* Ticket de turno del deli: numero grande en mono, borde troquelado. */}
              <span
                className="mb-6 inline-flex w-fit items-baseline border border-ink px-3 py-1"
                style={{ borderBottomStyle: "dashed" }}
              >
                <span className="font-mono text-3xl font-semibold text-ink tabular-nums">
                  {step.n}
                </span>
              </span>
              <h3 className="font-display text-2xl text-ink leading-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-slate leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
