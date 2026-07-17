"use client";

import { useEffect, useRef, useState } from "react";
import { Container, SectionLabel } from "./ui";

/* ============================================================
   § 02 EL PROBLEMA — fichas que se dan vuelta.
   De frente: el problema, seco. Al hover (o con el boton, en
   touch/teclado) la ficha gira como una tarjetita del split-flap
   y muestra como lo resuelve GIX, con numeros.
   Abajo, un ticker de mostrador con las promesas.
   ============================================================ */

type Item = {
  n: string;
  problema: string;
  solucion: string;
  detalle: string;
};

const ITEMS: Item[] = [
  {
    n: "01",
    problema: "No sabés cuánto vas a facturar.",
    solucion: "Cobrás el 1, pase lo que pase.",
    detalle: "50 suscriptores × $30.000 = $1.500.000 por adelantado.",
  },
  {
    n: "02",
    problema: "El cliente que viene 4 veces por semana no vale más que el que viene una.",
    solucion: "El frecuente paga membresía.",
    detalle: "Plan Café: $30.000/mes · 30 cafés · máx. 2 por día.",
  },
  {
    n: "03",
    problema: "Tu tarjeta de sellos es un papelito que nadie mira.",
    solucion: "El saldo vive en su teléfono.",
    detalle: "QR en el mostrador. Código de 6 dígitos en caja. Sin papel.",
  },
];

const TICKER = [
  "Ingreso fijo",
  "Cobrado el 1",
  "Sin papelitos",
  "Saldo en el teléfono",
  "Sin hardware",
  "30 días gratis",
];

function FlipCard({
  item,
  index,
  visible,
}: {
  item: Item;
  index: number;
  visible: boolean;
}) {
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const flipped = pinned || hover;

  return (
    <div
      className={`pcard h-[340px] transition-all duration-500 sm:h-[320px] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPinned(false);
      }}
    >
      <div className={`pcard-inner ${flipped ? "pcard-flipped" : ""}`}>
        {/* FRENTE: el problema */}
        <div
          className="pcard-face flex flex-col justify-between border border-chrome bg-tile p-6 sm:p-7"
          aria-hidden={flipped}
        >
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm tabular-nums text-slate">
              P·{item.n}
            </span>
            <span className="h-px flex-1 bg-chrome" aria-hidden="true" />
          </div>
          <p className="font-display text-[1.5rem] leading-tight text-ink sm:text-[1.65rem]">
            {item.problema}
          </p>
          <button
            type="button"
            onClick={() => setPinned(true)}
            tabIndex={flipped ? -1 : 0}
            className="readout w-fit border border-ink px-3 py-2 transition-colors hover:bg-ink hover:text-tile"
          >
            ¿Y con GIX? ↺
          </button>
        </div>

        {/* DORSO: la solución */}
        <div
          className="pcard-face pcard-back flex flex-col justify-between bg-ink p-6 sm:p-7"
          aria-hidden={!flipped}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-sm tabular-nums text-chrome">
              GIX·{item.n}
            </span>
            <button
              type="button"
              onClick={() => setPinned(false)}
              tabIndex={flipped ? 0 : -1}
              className="font-mono text-xs uppercase tracking-[0.18em] text-chrome transition-colors hover:text-tile"
            >
              Volver ↺
            </button>
          </div>
          <div>
            <p className="font-display text-2xl leading-tight text-tile">
              {item.solucion}
            </p>
            <p className="mt-3 font-mono text-sm leading-relaxed text-chrome">
              {item.detalle}
            </p>
          </div>
          <a
            href="#waitlist"
            tabIndex={flipped ? 0 : -1}
            className="w-fit font-mono text-sm text-stamp underline underline-offset-4 transition-colors hover:text-tile"
          >
            Probar 30 días →
          </a>
        </div>
      </div>
    </div>
  );
}

export function Problem() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="border-b border-chrome pt-16 sm:pt-24">
      <Container>
        <SectionLabel index="§ 02">El problema</SectionLabel>

        <div ref={gridRef} className="mt-12 grid gap-5 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <FlipCard key={item.n} item={item} index={i} visible={visible} />
          ))}
        </div>
      </Container>

      {/* Ticker de mostrador: corre; se frena al pasar el mouse. */}
      <div className="marquee mt-14 border-t border-chrome py-3" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1, 2, 3].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {TICKER.map((t) => (
                <span
                  key={t}
                  className="flex items-center font-mono text-xs uppercase tracking-[0.22em] text-slate"
                >
                  <span className="px-5">{t}</span>
                  <span className="inline-block text-stamp">✓</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
