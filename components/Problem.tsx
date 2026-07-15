import { Container, SectionLabel } from "./ui";

const LINES = [
  "No sabés cuánto vas a facturar.",
  "El cliente que viene 4 veces por semana no vale más que el que viene una.",
  "Tu tarjeta de sellos es un papelito que nadie mira.",
];

export function Problem() {
  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 02">El problema</SectionLabel>
        <ul className="mt-10 border-t border-chrome">
          {LINES.map((line) => (
            <li
              key={line}
              className="border-b border-chrome py-6 sm:py-8"
            >
              <p className="font-display text-ink text-[clamp(1.5rem,3.6vw,2.4rem)] leading-tight max-w-[24ch]">
                {line}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
