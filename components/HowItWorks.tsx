"use client";

import { useEffect, useRef, useState } from "react";
import { Container, SectionLabel } from "./ui";
import { Logo } from "./Logo";

/* ============================================================
   § 03 CÓMO FUNCIONA — el turnero grande.
   Un número gigante que gira mecánicamente (el gesto split-flap
   de la marca) al pasar de paso: 01 -> 02 -> 03. Avanza solo,
   con barra de progreso; tabs para saltar; hover pausa.
   Cada paso trae su escena: el ticket del plan, el QR que se
   imprime, la plata contando. Reduced-motion: quieto.
   ============================================================ */

const STEP_MS = 3200;

const STEPS = [
  {
    n: "01",
    title: "Creás el plan",
    body: "Definís el nombre del plan, la cantidad de consumos, el precio, la frecuencia de pago, el límite diario, los regalos incluidos, la duración de la suscripción, los días y horarios de uso y la fecha de facturación. Todo en pocos minutos.",
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

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/* ---- Escena 01: el ticket del plan ----
   Comprobante térmico: marca, precio héroe, sello de goma, chip de
   horario y código de barras. Más comanda de verdad, menos lista. */
const BARCODE = [
  3, 1, 1, 2, 1, 1, 3, 2, 1, 3, 1, 1, 2, 1, 2, 1, 1, 3, 1, 2,
  2, 1, 1, 2, 3, 1, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 2, 3, 1, 2,
];

function Barcode() {
  return (
    <div className="flex justify-center px-5" aria-hidden="true">
      <div className="flex h-9 items-stretch">
        {BARCODE.map((w, i) => (
          <span
            key={i}
            className={i % 2 === 0 ? "bg-ink" : "bg-transparent"}
            style={{ width: `${w}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function PlanTicket() {
  return (
    <div
      className="ticket relative w-[268px]"
      style={{ ["--z" as string]: "9px", paddingBlock: "calc(9px + 1rem)" }}
    >
      {/* Encabezado: marca + folio */}
      <div className="flex items-center justify-between px-5">
        <Logo size={18} />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate">
          N.º 0001
        </span>
      </div>
      <p className="mt-1.5 px-5 pb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-slate">
        Nuevo plan · Comprobante
      </p>
      <hr className="ticket-rule" />

      {/* Nombre del plan + sello + precio héroe */}
      <div className="px-5 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-[1.4rem] leading-none text-ink">
            Café Mensual
          </p>
          <span
            className="mt-0.5 shrink-0 rotate-[-6deg] rounded-[5px] border-2 border-stamp px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-stamp"
            style={{ filter: "url(#gix-stamp-ink)" }}
          >
            Activo
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="font-mono text-[1.9rem] font-semibold leading-none tabular-nums text-ink">
            $30.000
          </span>
          <span className="font-mono text-[11px] text-slate">/mes</span>
        </div>
      </div>
      <hr className="ticket-rule" />

      {/* Detalle */}
      {[
        ["Consumos", "30 cafés"],
        ["Tope diario", "máx. 2"],
        ["Cobro", "1 de cada mes"],
      ].map(([k, v]) => (
        <div
          key={k}
          className="flex items-baseline justify-between px-5 py-1.5 font-mono text-[11px] text-ink"
        >
          <span className="text-slate">{k}</span>
          <span className="font-semibold">{v}</span>
        </div>
      ))}
      <hr className="ticket-rule" />

      {/* ¿Qué incluye? + chip de horario */}
      <div className="px-5 pb-3 pt-2.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate">
          ¿Qué incluye?
        </p>
        <p className="mt-1.5 font-mono text-[12px] font-semibold text-ink">
          Café + medialuna
        </p>
        <span className="mt-2.5 inline-block rounded-full border border-ink/25 px-2.5 py-1 font-mono text-[10px] text-slate">
          Lun a Jue · 10–17 h
        </span>
      </div>
      <hr className="ticket-rule" />

      {/* Código de barras */}
      <div className="pt-3.5">
        <Barcode />
        <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-slate">
          GIX·CAFE·30
        </p>
      </div>
    </div>
  );
}

/* ---- Escena 02: el QR que se imprime ---- */
const QR_SIZE = 25;

/* Matriz tipo QR determinista: tres ojos (finder patterns) en las
   esquinas y datos pseudo-aleatorios estables (mismo render en SSR
   y cliente). Los ojos se dibujan aparte, redondeados, para que
   quede como un QR real y no como un grid de cuadraditos. */
function buildQRData() {
  const N = QR_SIZE;
  const inEye = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);

  let seed = 20260717;
  const rnd = () =>
    (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const cells: Array<[number, number]> = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inEye(r, c)) continue;
      if (rnd() > 0.52) cells.push([r, c]);
    }
  }
  return cells;
}

const QR_CELLS = buildQRData();
const QR_EYES = [
  [0, 0],
  [0, QR_SIZE - 7],
  [QR_SIZE - 7, 0],
];

function QRPrint({ active }: { active: boolean }) {
  const N = QR_SIZE;
  return (
    <div className="flex items-center gap-5">
      <div className="w-fit rounded-[8px] border border-chrome bg-white p-3 shadow-[0_6px_18px_-10px_rgba(22,25,26,0.5)]">
        <svg
          viewBox={`0 0 ${N} ${N}`}
          className={`h-[128px] w-[128px] transition-opacity duration-300 ${
            active ? "opacity-100" : "opacity-0"
          }`}
          role="img"
          aria-label="Código QR del plan"
        >
          {/* Datos: modulos redondeados */}
          {QR_CELLS.map(([r, c]) => (
            <circle key={`${r}-${c}`} cx={c + 0.5} cy={r + 0.5} r={0.46} fill="#16191a" />
          ))}
          {/* Ojos: anillo redondeado + centro */}
          {QR_EYES.map(([r0, c0]) => (
            <g key={`${r0}-${c0}`}>
              <rect x={c0} y={r0} width={7} height={7} rx={1.8} fill="#16191a" />
              <rect x={c0 + 1} y={r0 + 1} width={5} height={5} rx={1.2} fill="#ffffff" />
              <rect x={c0 + 2} y={r0 + 2} width={3} height={3} rx={0.8} fill="#16191a" />
            </g>
          ))}
        </svg>
      </div>
      <p className="max-w-[16ch] font-mono text-[11px] uppercase tracking-[0.15em] text-slate">
        Pegalo en el mostrador y listo
      </p>
    </div>
  );
}

/* ---- Escena 03: la plata contando ---- */
function CountUp({ active, reduced }: { active: boolean; reduced: boolean }) {
  const TARGET = 10_500_000;
  const [v, setV] = useState(TARGET);

  useEffect(() => {
    if (!active || reduced) {
      setV(TARGET);
      return;
    }
    let start: number | null = null;
    let raf = 0;
    const dur = 1400;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      setV(Math.round(TARGET * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  return (
    <div>
      <p className="font-mono text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-none tabular-nums text-stamp">
        ${new Intl.NumberFormat("es-AR").format(v)}
      </p>
      <p className="mt-3 inline-block border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink">
        Cobrado el 1 de cada mes
      </p>
    </div>
  );
}

export function HowItWorks() {
  const reduced = usePrefersReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const hovering = useRef(false);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reduced) return;
    const id = window.setInterval(() => {
      if (!hovering.current) setActive((a) => (a + 1) % STEPS.length);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [visible, reduced]);

  const step = STEPS[active];

  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 03">Cómo funciona</SectionLabel>

        <div
          ref={boardRef}
          onMouseEnter={() => (hovering.current = true)}
          onMouseLeave={() => (hovering.current = false)}
          className={`mt-12 grid border border-ink bg-tile transition-all duration-500 lg:grid-cols-[0.8fr_1.2fr] ${
            visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          {/* IZQUIERDA: el número de turno gigante + tabs */}
          <div className="relative flex flex-col border-b border-chrome p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <span className="readout font-mono">Paso</span>
            <div className="my-2 flex-1" style={{ perspective: "900px" }}>
              <p
                key={active}
                className={`${reduced ? "" : "turn-flip"} font-mono text-[clamp(7rem,16vw,11rem)] font-semibold leading-none tabular-nums text-stamp`}
              >
                {step.n}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6">
              {STEPS.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  aria-label={`Paso ${s.n}: ${s.title}`}
                  className={`border px-4 py-2 font-mono text-sm tabular-nums transition-colors ${
                    active === i
                      ? "border-ink bg-ink text-tile"
                      : "border-chrome text-slate hover:border-ink hover:text-ink"
                  }`}
                >
                  {s.n}
                </button>
              ))}
            </div>

            {/* Barra de avance del turno */}
            {visible && !reduced && (
              <span
                key={`progress-${active}`}
                className="step-progress absolute bottom-0 left-0 h-[3px] bg-stamp"
                aria-hidden="true"
              />
            )}
          </div>

          {/* DERECHA: el paso y su escena */}
          <div className="flex min-h-[380px] flex-col p-6 sm:p-8">
            <div key={active} className={`${reduced ? "" : "step-swap"} flex flex-1 flex-col`}>
              <h3 className="font-display text-[clamp(1.6rem,3.4vw,2.3rem)] leading-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-slate">
                {step.body}
              </p>
              <div className="mt-auto pt-8">
                {active === 0 && <PlanTicket />}
                {active === 1 && <QRPrint active />}
                {active === 2 && <CountUp active reduced={reduced} />}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
