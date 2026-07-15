"use client";

import { useState } from "react";
import { Container, SectionLabel } from "./ui";

/* ============================================================
   § 05 LA CUENTA — la app por dentro.
   Una ventana del panel de GIX: sliders de suscriptores y precio,
   el desglose (bruto, GIX, comisión de cobro) y el gráfico de
   acumulado a 12 meses que se mueve con los sliders.
   Gráfico: una sola serie, barras ink sobre tile, techo "redondo"
   que se adapta. El rojo queda para el número héroe.
   ============================================================ */

const GIX_FEE = 39900;
const PROC_RATE = 0.06; // estimado; depende del medio de cobro

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat("es-AR");

const MESES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

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

function SliderRow({
  id,
  label,
  value,
  valueLabel,
  min,
  max,
  step,
  onChange,
  ariaText,
}: {
  id: string;
  label: string;
  value: number;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  ariaText: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="font-body text-ink">
          {label}
        </label>
        <span className="font-mono text-xl font-semibold tabular-nums text-ink">
          {valueLabel}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="reg-slider mt-3"
        aria-valuetext={ariaText}
      />
    </div>
  );
}

export function Calculator() {
  const [subs, setSubs] = useState(50);
  const [price, setPrice] = useState(30000);

  const bruto = subs * price;
  const proc = Math.round(bruto * PROC_RATE);
  const neto = Math.max(0, bruto - GIX_FEE - proc);
  const anual = neto * 12;
  const ceil = niceCeil(anual);

  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 05">La cuenta</SectionLabel>

        <div className="mt-4 max-w-[52ch]">
          <h2 className="font-display text-ink text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
            Así se ve tu plan por dentro.
          </h2>
          <p className="mt-3 text-slate leading-relaxed">
            Movés los sliders, ves tu plata. Sin sorpresas.
          </p>
        </div>

        {/* Ventana del panel */}
        <div className="mt-10 overflow-hidden rounded-[10px] border border-ink bg-tile shadow-[0_40px_70px_-45px_rgba(22,25,26,0.6)]">
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
            {/* IZQUIERDA: controles + desglose */}
            <div>
              <p className="readout font-mono">Configuración del plan</p>
              <div className="mt-6 grid gap-7">
                <SliderRow
                  id="subs"
                  label="Suscriptores"
                  value={subs}
                  valueLabel={plain.format(subs)}
                  min={10}
                  max={500}
                  step={5}
                  onChange={setSubs}
                  ariaText={`${subs} suscriptores`}
                />
                <SliderRow
                  id="price"
                  label="Precio del plan"
                  value={price}
                  valueLabel={ars.format(price)}
                  min={10000}
                  max={60000}
                  step={1000}
                  onChange={setPrice}
                  ariaText={`${ars.format(price)} por mes`}
                />
              </div>

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

            {/* DERECHA: acumulado 12 meses */}
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <p className="readout font-mono">Acumulado 12 meses</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-ink">
                  {ars.format(anual)}
                </p>
              </div>

              {/* Grafico de barras (una serie). */}
              <div className="mt-5 flex-1">
                <div className="relative h-[230px]">
                  {/* Gridlines recesivas + labels de techo */}
                  {[0, 25, 50, 75].map((p) => (
                    <div
                      key={p}
                      aria-hidden="true"
                      className="absolute inset-x-0 border-t border-chrome/70"
                      style={{ top: `${p}%` }}
                    />
                  ))}
                  <span className="absolute right-0 top-0 -translate-y-1/2 bg-tile pl-2 font-mono text-[10px] text-slate">
                    {compact(ceil)}
                  </span>

                  {/* Barras */}
                  <div className="absolute inset-0 flex items-end gap-[5px] border-b border-slate/60 sm:gap-[7px]">
                    {MESES.map((m, i) => {
                      const acc = neto * (i + 1);
                      const pct = Math.max(1, (acc / ceil) * 100);
                      const last = i === 11;
                      return (
                        <div
                          key={i}
                          className="group relative flex h-full flex-1 items-end"
                        >
                          <div
                            className="w-full rounded-t-[3px] bg-ink transition-[height] duration-500 ease-out group-hover:bg-ink/85"
                            style={{ height: `${pct}%` }}
                          />
                          {/* Label directo solo en la ultima barra */}
                          {last && (
                            <span
                              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] font-semibold text-ink transition-[bottom] duration-500 ease-out"
                              style={{ bottom: `calc(${pct}% + 6px)` }}
                            >
                              {compact(acc)}
                            </span>
                          )}
                          {/* Tooltip por barra */}
                          <span
                            className="pointer-events-none absolute left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-ink px-2 py-1 font-mono text-[10px] text-tile group-hover:block"
                            style={{ bottom: `calc(${pct}% + 8px)` }}
                            role="status"
                          >
                            Mes {i + 1} · {ars.format(acc)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Meses */}
                <div className="mt-2 flex gap-[5px] sm:gap-[7px]" aria-hidden="true">
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
                  Acumulado neto a 12 meses: {ars.format(anual)}. Neto mensual:{" "}
                  {ars.format(neto)}.
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
