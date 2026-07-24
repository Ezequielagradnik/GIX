"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useInView,
} from "motion/react";
import type { Variants } from "motion/react";
import { Container, SectionLabel } from "./ui";
import { Logo } from "./Logo";

/* ============================================================
   § 03 CÓMO FUNCIONA — el turnero grande, ahora con motion.
   El número de turno gira como ficha mecánica (spring), el
   contenido del paso entra en cascada (título → texto → escena,
   con blur), las tabs tienen una pastilla que se desliza entre
   ellas y la barra de progreso corre sincronizada con el turno.
   Cada escena además se anima al entrar: el ticket sella su
   "ACTIVO", el QR se imprime módulo a módulo y la plata cuenta
   en el tablero split-flap 3D.
   Reduced-motion: MotionConfig apaga todo; queda quieto.
   ============================================================ */

/* El tablero de la plata en 3D (split-flap real). Se monta una sola
   vez y se muestra en el paso 03; sin WebGL / reduced-motion cae al
   tablero DOM estático. */
const MoneyBoard3D = dynamic(() => import("./three/MoneyBoard3D"), {
  ssr: false,
  loading: () => null,
});

const STEP_MS = 3600;

const STEPS = [
  {
    n: "01",
    title: "Creás el plan",
    body: "Definís el nombre del plan, la cantidad de consumos, el precio, la frecuencia de pago, el límite diario, los regalos incluidos, la duración de la suscripción, los días y horarios de uso y la fecha de facturación. Todo en pocos minutos.",
  },
  {
    n: "02",
    title: "Recibí tu QR",
    body: "Te damos un QR personalizado, listo para imprimir y colocar en el mostrador. Descargalo, imprimilo y empezá a sumar miembros.",
  },
  {
    n: "03",
    title: "Tus ingresos también se vuelven recurrentes",
    body: "Mientras tus clientes siguen disfrutando de su membresía, vos seguís cobrando todos los meses.",
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

/* ---- Coreografía del swap de paso: cascada con blur ---- */
const swapContainer: Variants = {
  in: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const swapItem: Variants = {
  out: { opacity: 0, y: 22, filter: "blur(6px)" },
  in: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 340, damping: 30 },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(5px)",
    transition: { duration: 0.16, ease: "easeIn" },
  },
};

/* ---- Escena 01: el ticket del plan ----
   Comprobante térmico: marca, precio héroe, sello de goma, chip de
   horario y código de barras. El sello cae con un pop al entrar. */
const BARCODE = [
  3, 1, 1, 2, 1, 1, 3, 2, 1, 3, 1, 1, 2, 1, 2, 1, 1, 3, 1, 2,
  2, 1, 1, 2, 3, 1, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 2, 3, 1, 2,
];

function Barcode({ small = false }: { small?: boolean }) {
  return (
    <div className="flex justify-center px-5" aria-hidden="true">
      <div className={`flex items-stretch ${small ? "h-7" : "h-9"}`}>
        {BARCODE.map((w, i) => (
          <motion.span
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.4 + i * 0.008, duration: 0.18 }}
            style={{ width: `${w}px`, transformOrigin: "bottom" }}
            className={i % 2 === 0 ? "bg-ink" : "bg-transparent"}
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
      style={{ ["--z" as string]: "9px", paddingBlock: "calc(9px + 0.7rem)" }}
    >
      {/* Encabezado: marca + folio */}
      <div className="flex items-center justify-between px-5">
        <Logo size={18} />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate">
          N.º 0001
        </span>
      </div>
      <p className="mt-1 px-5 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-slate">
        Nuevo plan · Comprobante
      </p>
      <hr className="ticket-rule" />

      {/* Nombre del plan + sello + precio héroe */}
      <div className="px-5 py-2.5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-[1.4rem] leading-none text-ink">
            Café Mensual
          </p>
          <motion.span
            initial={{ opacity: 0, scale: 1.7, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 380, damping: 17 }}
            className="mt-0.5 shrink-0 rounded-[5px] border-2 border-stamp px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-stamp"
            style={{ filter: "url(#gix-stamp-ink)" }}
          >
            Activo
          </motion.span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
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
      ].map(([k, v], i) => (
        <motion.div
          key={k}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.28 + i * 0.09 }}
          className="flex items-baseline justify-between px-5 py-1 font-mono text-[11px] text-ink"
        >
          <span className="text-slate">{k}</span>
          <span className="font-semibold">{v}</span>
        </motion.div>
      ))}
      <hr className="ticket-rule" />

      {/* ¿Qué incluye? + chip de horario */}
      <div className="px-5 pb-2.5 pt-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate">
          ¿Qué incluye?
        </p>
        <p className="mt-1 font-mono text-[12px] font-semibold text-ink">
          Café + medialuna
        </p>
        <span className="mt-2 inline-block rounded-full border border-ink/25 px-2.5 py-1 font-mono text-[10px] text-slate">
          Lun a Jue · 10–17 h
        </span>
      </div>
      <hr className="ticket-rule" />

      {/* Código de barras */}
      <div className="pt-2.5">
        <Barcode small />
        <p className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-slate">
          GIX·CAFE·30
        </p>
      </div>
    </div>
  );
}

/* ---- Escena 02: el QR que se imprime módulo a módulo ---- */
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
      <motion.div
        initial={{ opacity: 0, scale: 0.94, rotate: -1.5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="w-fit rounded-[8px] border border-chrome bg-white p-3 shadow-[0_6px_18px_-10px_rgba(22,25,26,0.5)]"
      >
        <svg
          viewBox={`0 0 ${N} ${N}`}
          className="h-[128px] w-[128px]"
          role="img"
          aria-label="Código QR del plan"
        >
          {/* Datos: cada módulo aparece en diagonal, como impreso */}
          {QR_CELLS.map(([r, c]) => (
            <motion.circle
              key={`${r}-${c}`}
              cx={c + 0.5}
              cy={r + 0.5}
              r={0.46}
              fill="#16191a"
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ delay: 0.25 + (r + c) * 0.016, duration: 0.1 }}
            />
          ))}
          {/* Ojos: caen con pop */}
          {QR_EYES.map(([r0, c0], i) => (
            <motion.g
              key={`${r0}-${c0}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.4 }}
              transition={{
                delay: 0.18 + i * 0.12,
                type: "spring",
                stiffness: 380,
                damping: 20,
              }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <rect x={c0} y={r0} width={7} height={7} rx={1.8} fill="#16191a" />
              <rect x={c0 + 1} y={r0 + 1} width={5} height={5} rx={1.2} fill="#ffffff" />
              <rect x={c0 + 2} y={r0 + 2} width={3} height={3} rx={0.8} fill="#16191a" />
            </motion.g>
          ))}
        </svg>
      </motion.div>
      <p className="max-w-[16ch] font-mono text-[11px] uppercase tracking-[0.15em] text-slate">
        Pegalo en el mostrador y listo
      </p>
    </div>
  );
}

/* ---- Escena 03 (fallback reduced-motion): tablero DOM quieto ---- */
const TARGET = 10_500_000;
const MONTHS = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

function MoneyBoardStatic() {
  const full = new Intl.NumberFormat("es-AR").format(TARGET);
  return (
    <div>
      <div
        role="img"
        aria-label={`$${full} acumulados en el año`}
        className="flex items-center gap-[3px] sm:gap-[4px]"
      >
        <span className="mr-1 font-mono text-[22px] font-semibold text-ink sm:text-[26px]">
          $
        </span>
        {full.split("").map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`relative flex h-[46px] items-center justify-center overflow-hidden rounded-[4px] bg-ink font-mono font-semibold tabular-nums text-stamp sm:h-[56px] ${
              ch === "."
                ? "w-[13px] text-[17px] sm:w-[17px] sm:text-[21px]"
                : "w-[28px] text-[23px] sm:w-[35px] sm:text-[28px]"
            }`}
          >
            {ch}
            <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-[1px] bg-black/45" />
          </span>
        ))}
      </div>
      <div className="mt-5 grid w-fit grid-cols-6 gap-[6px]">
        {MONTHS.map((m) => (
          <span
            key={m}
            className="flex h-[30px] w-[52px] items-center justify-center gap-1 border border-stamp font-mono text-[9px] tracking-[0.14em] text-stamp"
          >
            {m} ✓
          </span>
        ))}
      </div>
      <p className="mt-4 inline-block border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink">
        Cobrado el 1 de cada mes
      </p>
    </div>
  );
}

export function HowItWorks() {
  const reduced = usePrefersReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const visible = useInView(boardRef, { once: true, amount: 0.25 });
  const [active, setActive] = useState(0);
  const hovering = useRef(false);

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
      <MotionConfig reducedMotion="user">
        <Container>
          <SectionLabel index="§ 03">Cómo funciona</SectionLabel>

          <motion.div
            ref={boardRef}
            onMouseEnter={() => (hovering.current = true)}
            onMouseLeave={() => (hovering.current = false)}
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="mt-12 grid border border-ink bg-tile lg:grid-cols-[0.8fr_1.2fr]"
          >
            {/* IZQUIERDA: el número de turno gigante + tabs */}
            <div className="relative flex flex-col overflow-hidden border-b border-chrome p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <span className="readout font-mono">Paso</span>
              <div className="my-2 flex-1" style={{ perspective: 900 }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={active}
                    initial={{ rotateX: -95, opacity: 0.2 }}
                    animate={{
                      rotateX: 0,
                      opacity: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    }}
                    exit={{
                      rotateX: 82,
                      opacity: 0,
                      transition: { duration: 0.18, ease: "easeIn" },
                    }}
                    style={{
                      transformOrigin: "center bottom",
                      backfaceVisibility: "hidden",
                    }}
                    className="font-mono text-[clamp(7rem,16vw,11rem)] font-semibold leading-none tabular-nums text-stamp"
                  >
                    {step.n}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 pt-6">
                {STEPS.map((s, i) => (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={active === i}
                    aria-label={`Paso ${s.n}: ${s.title}`}
                    className={`relative border px-4 py-2 font-mono text-sm tabular-nums transition-colors duration-200 ${
                      active === i
                        ? "border-ink text-tile"
                        : "border-chrome text-slate hover:border-ink hover:text-ink"
                    }`}
                  >
                    {/* La pastilla que viaja entre tabs */}
                    {active === i && (
                      <motion.span
                        layoutId="step-tab-pill"
                        transition={{ type: "spring", stiffness: 520, damping: 40 }}
                        className="absolute inset-0 bg-ink"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{s.n}</span>
                  </button>
                ))}
              </div>

              {/* Barra de avance del turno, sincronizada con el timer */}
              {visible && !reduced && (
                <motion.span
                  key={`progress-${active}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-[3px] bg-stamp"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* DERECHA: el paso y su escena.
                Los tres pasos se renderizan invisibles en la misma celda
                del grid ("fantasmas"): fijan una única altura, la del paso
                más alto, para que el tablero no cambie de tamaño al rotar
                entre 01, 02 y 03. Arriba se dibuja solo el paso activo. */}
            <div className="grid min-h-[380px] p-6 sm:p-8">
              {/* En el paso 01 el ticket va AL LADO del texto en desktop
                  (no abajo): es lo que mantiene bajo el panel entero. */}
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  aria-hidden="true"
                  className={`invisible col-start-1 row-start-1 flex ${
                    i === 0
                      ? "flex-col lg:flex-row lg:items-center lg:gap-10"
                      : "flex-col"
                  }`}
                >
                  <div className={i === 0 ? "lg:flex-1" : ""}>
                    <h3 className="font-display text-[clamp(1.6rem,3.4vw,2.3rem)] leading-tight">
                      {s.title}
                    </h3>
                    <p className="mt-3 max-w-[62ch] leading-relaxed">{s.body}</p>
                  </div>
                  <div className={i === 0 ? "mt-8 shrink-0 lg:mt-0" : "mt-auto pt-8"}>
                    {i === 0 && <PlanTicket />}
                    {i === 1 && <QRPrint active={false} />}
                    {i === 2 &&
                      (reduced ? <MoneyBoardStatic /> : <div className="h-[240px]" />)}
                  </div>
                </div>
              ))}

              <div className="col-start-1 row-start-1 flex flex-col">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    variants={swapContainer}
                    initial="out"
                    animate="in"
                    exit="exit"
                    className={`flex flex-1 ${
                      active === 0
                        ? "flex-col lg:flex-row lg:items-center lg:gap-10"
                        : "flex-col"
                    }`}
                  >
                    <div className={active === 0 ? "lg:flex-1" : ""}>
                      <motion.h3
                        variants={swapItem}
                        className="font-display text-[clamp(1.6rem,3.4vw,2.3rem)] leading-tight text-ink"
                      >
                        {step.title}
                      </motion.h3>
                      <motion.p
                        variants={swapItem}
                        className="mt-3 max-w-[62ch] leading-relaxed text-slate"
                      >
                        {step.body}
                      </motion.p>
                    </div>
                    <motion.div
                      variants={swapItem}
                      className={
                        active === 0 ? "mt-8 shrink-0 lg:mt-0" : "mt-auto pt-8"
                      }
                    >
                      {active === 0 && <PlanTicket />}
                      {active === 1 && <QRPrint active />}
                      {active === 2 && reduced && <MoneyBoardStatic />}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Capa persistente del tablero 3D del paso 03: el canvas
                  se monta UNA vez (nada de recrear WebGL en cada vuelta)
                  y aparece/desaparece con opacidad. */}
              {!reduced && (
                <div
                  aria-hidden={active !== 2}
                  className={`pointer-events-none col-start-1 row-start-1 flex flex-col justify-end transition-opacity duration-300 ${
                    active === 2 ? "opacity-100" : "invisible opacity-0"
                  }`}
                >
                  <div className="pointer-events-auto h-[240px]">
                    <MoneyBoard3D playing={visible && active === 2} />
                  </div>
                  <p className="mt-3 inline-block w-fit border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink">
                    Cobrado el 1 de cada mes
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </Container>
      </MotionConfig>
    </section>
  );
}
