"use client";

import { useEffect, useRef, useState } from "react";
import { Container, SectionLabel } from "./ui";

/* ============================================================
   § 05 LA CUENTA — la app por dentro.
   Una ventana del panel de GIX. Ya no hay sliders: el panel corre
   solo, como un mini video en loop. Un plan real va sumando
   suscriptores mes a mes durante el año; el número de suscriptores
   sube, cambia el mes y el gráfico de líneas (evolución de los
   últimos 12 meses) se va dibujando. El desglose (bruto, GIX,
   comisión y neto por mes) tickea con cada mes. Reduced-motion:
   todo quieto en diciembre.
   ============================================================ */

const GIX_FEE = 39900;
const PROC_RATE = 0.06; // estimado; depende del medio de cobro
const PRICE = 30000; // precio del plan (fijo)

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat("es-AR");

const MESES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MES_LARGO = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/* Un plan que crece: suscriptores mes a mes a lo largo del año. */
const SUB_SERIES = [45, 62, 80, 100, 122, 145, 168, 190, 210, 228, 244, 260];

/* Neto de cada mes y acumulado (constantes: derivan de la serie). */
const MONTHLY_NET = SUB_SERIES.map((s) => {
  const bruto = s * PRICE;
  const proc = Math.round(bruto * PROC_RATE);
  return Math.max(0, bruto - GIX_FEE - proc);
});
const ACCUM = MONTHLY_NET.reduce<number[]>((arr, n, i) => {
  arr.push((arr[i - 1] ?? 0) + n);
  return arr;
}, []);
const TOTAL_ANUAL = ACCUM[ACCUM.length - 1];

/* Techo "redondo" para la escala: 1 / 2 / 2.5 / 5 × 10^n. */
function niceCeil(v: number) {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (v <= m * base) return m * base;
  }
  return 10 * base;
}

function compact(v: number) {
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    return `$${m >= 100 ? Math.round(m) : m.toFixed(1).replace(".", ",")} M`;
  }
  return `$${Math.round(v / 1000)} mil`;
}

const CEIL = niceCeil(TOTAL_ANUAL);
const CW = 100; // ancho del viewBox del gráfico
const CH = 56; // alto del viewBox del gráfico
const xAt = (i: number) => (i / 11) * CW;
const yAt = (v: number) => CH - (v / CEIL) * CH;

/* Duración de un ciclo del loop (12 meses + una pausa en diciembre). */
const CYCLE_MS = 10500;

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

export function Calculator() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Playhead continuo en [0, 12): 0..11 recorre el año, 11..12 pausa.
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current;
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
    if (!visible || reduced) {
      setP(11);
      return;
    }
    let raf = 0;
    let last: number | null = null;
    const speed = 12 / CYCLE_MS; // unidades por ms
    const tick = (t: number) => {
      if (last === null) last = t;
      const dt = t - last;
      last = t;
      setP((prev) => {
        let np = prev + dt * speed;
        if (np >= 12) np -= 12;
        return np;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduced]);

  // Playhead visible (clampeado a 11: durante la pausa queda lleno).
  const pv = Math.min(p, 11);
  const mi = Math.floor(pv);
  const frac = pv - mi;
  const nextI = Math.min(mi + 1, 11);

  const subsShown = Math.round(
    SUB_SERIES[mi] + (SUB_SERIES[nextI] - SUB_SERIES[mi]) * frac
  );

  // Desglose del mes actual (tickea con el loop).
  const bruto = subsShown * PRICE;
  const proc = Math.round(bruto * PROC_RATE);
  const neto = Math.max(0, bruto - GIX_FEE - proc);

  // Gráfico: línea que se dibuja hasta el playhead.
  const vEnd = ACCUM[mi] + (ACCUM[nextI] - ACCUM[mi]) * frac;
  const xEnd = xAt(pv);
  const yEnd = yAt(vEnd);

  const trackPts = ACCUM.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const drawn = ACCUM.slice(0, mi + 1).map((v, i) => `${xAt(i)},${yAt(v)}`);
  drawn.push(`${xEnd},${yEnd}`);
  const drawnLine = `M ${drawn.join(" L ")}`;
  const drawnArea = `${drawnLine} L ${xEnd},${CH} L 0,${CH} Z`;

  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 05">La cuenta</SectionLabel>

        <div className="mt-4 max-w-[52ch]">
          <h2 className="font-display text-ink text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
            Así se ve tu plan por dentro.
          </h2>
          <p className="mt-3 text-slate leading-relaxed">
            El plan corre solo. Vos ves tu plata crecer, mes a mes.
          </p>
        </div>

        {/* Ventana del panel */}
        <div
          ref={ref}
          className="mt-10 overflow-hidden rounded-[10px] border border-ink bg-tile shadow-[0_40px_70px_-45px_rgba(22,25,26,0.6)]"
        >
          {/* Barra de ventana */}
          <div className="flex items-center gap-4 border-b border-chrome px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-stamp" />
              <span className="h-2.5 w-2.5 rounded-full bg-chrome" />
              <span className="h-2.5 w-2.5 rounded-full bg-chrome" />
            </span>
            <span className="flex-1 text-center font-mono text-xs text-slate">
              panel.gix.app · Tu plan
            </span>
            <span className="w-[54px]" aria-hidden="true" />
          </div>

          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            {/* IZQUIERDA: card del plan + desglose */}
            <div>
              <p className="readout font-mono">Plan en marcha</p>

              {/* Card: nombre, suscriptores (sube) y precio. */}
              <div className="mt-5 rounded-[8px] border border-chrome bg-white/40 p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="readout font-mono">Plan</p>
                    <p className="mt-1 font-display text-[1.35rem] leading-none text-ink">
                      Café Mensual
                    </p>
                  </div>
                  <span className="border border-chrome px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
                    {MES_LARGO[mi]}
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="readout font-mono">Suscriptores</p>
                    <p className="mt-1 font-mono text-[clamp(1.8rem,4vw,2.4rem)] font-semibold leading-none tabular-nums text-ink">
                      {plain.format(subsShown)}
                    </p>
                  </div>
                  <div>
                    <p className="readout font-mono">Precio del plan</p>
                    <p className="mt-1 font-mono text-[clamp(1.8rem,4vw,2.4rem)] font-semibold leading-none tabular-nums text-ink">
                      {ars.format(PRICE)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desglose (esta parte queda igual). */}
              <div className="mt-8 border-t border-chrome pt-5">
                <dl className="grid gap-2 font-mono text-sm">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-slate">Ingreso bruto</dt>
                    <dd className="tabular-nums text-ink">{ars.format(bruto)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-slate">Suscripción GIX</dt>
                    <dd className="tabular-nums text-ink">−{ars.format(GIX_FEE)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-slate">Comisión de cobro (est. 6%)</dt>
                    <dd className="tabular-nums text-ink">−{ars.format(proc)}</dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-chrome pt-4">
                  <p className="readout font-mono">Neto por mes</p>
                  <p className="mt-1 font-mono text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-none tabular-nums text-stamp">
                    {ars.format(neto)}
                  </p>
                </div>
                <p className="mt-3 font-mono text-[10px] text-slate">
                  Comisión estimada; depende de tu medio de cobro.
                </p>
              </div>
            </div>

            {/* DERECHA: evolución 12 meses (gráfico de líneas) */}
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <p className="readout font-mono">Evolución · últimos 12 meses</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-ink">
                  {ars.format(TOTAL_ANUAL)}
                </p>
              </div>

              {/* Gráfico de líneas (una serie, acumulado). */}
              <div className="mt-5 flex-1">
                <div className="relative h-[230px]">
                  {/* Gridlines recesivas + label de techo */}
                  {[0, 25, 50, 75].map((pct) => (
                    <div
                      key={pct}
                      aria-hidden="true"
                      className="absolute inset-x-0 border-t border-chrome/70"
                      style={{ top: `${pct}%` }}
                    />
                  ))}
                  <span className="absolute right-0 top-0 -translate-y-1/2 bg-tile pl-2 font-mono text-[10px] text-slate">
                    {compact(CEIL)}
                  </span>

                  <div className="absolute inset-0 border-b border-slate/60">
                    <svg
                      viewBox={`0 0 ${CW} ${CH}`}
                      preserveAspectRatio="none"
                      className="h-full w-full overflow-visible"
                      aria-hidden="true"
                    >
                      {/* Track completo (recesivo) */}
                      <polyline
                        points={trackPts}
                        fill="none"
                        stroke="var(--color-chrome)"
                        strokeWidth={1.5}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Área bajo la parte dibujada */}
                      <path d={drawnArea} fill="var(--color-ink)" opacity={0.06} />
                      {/* Línea dibujada hasta el playhead */}
                      <path
                        d={drawnLine}
                        fill="none"
                        stroke="var(--color-ink)"
                        strokeWidth={2.5}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Punto que avanza */}
                      <circle
                        cx={xEnd}
                        cy={yEnd}
                        r={3}
                        fill="var(--color-stamp)"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>

                {/* Meses */}
                <div className="mt-2 flex" aria-hidden="true">
                  {MESES.map((m, i) => (
                    <span
                      key={i}
                      className="flex-1 text-center font-mono text-[9px] uppercase text-slate"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <p className="sr-only">
                  Evolución del neto acumulado a 12 meses. Total anual:{" "}
                  {ars.format(TOTAL_ANUAL)}.
                </p>
              </div>

              <p className="mt-5 max-w-[44ch] text-sm leading-relaxed text-slate">
                Cobrado por adelantado el 1 de cada mes. Entre o no entre el
                cliente al local.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
