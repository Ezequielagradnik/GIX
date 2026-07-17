"use client";

import { useEffect, useRef, useState } from "react";
import { Container, SectionLabel } from "./ui";

/* ============================================================
   § 06 PRECIO — el ticket se imprime.
   Al entrar al viewport, el ticket sale de la ranura de la
   impresora térmica; cuando termina, cae el sello de goma
   "30 días gratis". Reduced-motion: todo aparece quieto.
   ============================================================ */

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
  const ref = useRef<HTMLDivElement>(null);
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPrinted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
              Creá tus planes, cobrá automáticamente, gestioná consumos y
              fidelizá clientes desde un solo lugar.
            </p>
            <p className="mt-4 font-mono text-ink">
              Un solo plan. Todo incluido.
            </p>
          </div>

          {/* Impresora térmica */}
          <div ref={ref} className="mx-auto w-full max-w-[380px]">
            {/* Ranura */}
            <div
              aria-hidden="true"
              className="relative z-10 mx-auto h-[12px] w-[92%] rounded-full bg-ink shadow-[inset_0_2px_5px_rgba(0,0,0,0.55)]"
            />
            {/* Papel que sale */}
            <div className="-mt-[5px] overflow-hidden pt-[5px]">
              <div
                style={{
                  transform: printed ? "translateY(0)" : "translateY(-103%)",
                  transition: "transform 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s",
                }}
              >
                <div className="ticket relative transition-transform duration-300 hover:-translate-y-1">
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

                  {/* Sello de goma: cae cuando terminó de imprimir */}
                  <div
                    aria-hidden="true"
                    className="absolute right-5 top-[92px] rounded-[6px] border-[3px] border-stamp px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp"
                    style={{
                      filter: "url(#gix-stamp-ink)",
                      opacity: printed ? 1 : 0,
                      transform: printed
                        ? "rotate(-8deg) scale(1)"
                        : "rotate(-8deg) scale(1.5)",
                      transition:
                        "opacity 0.3s ease-out 1.7s, transform 0.3s cubic-bezier(0.3, 1.4, 0.5, 1) 1.7s",
                    }}
                  >
                    30 días gratis
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
