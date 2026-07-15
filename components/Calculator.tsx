"use client";

import { useState } from "react";
import { Container, SectionLabel } from "./ui";

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const plain = new Intl.NumberFormat("es-AR");

export function Calculator() {
  const [subs, setSubs] = useState(50);
  const [price, setPrice] = useState(30000);

  const monthly = subs * price;
  const yearly = monthly * 12;

  return (
    <section className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 05">La cuenta</SectionLabel>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* CONTROLES */}
          <div className="flex flex-col justify-center gap-10">
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="subs" className="font-body text-ink">
                  Suscriptores
                </label>
                <span className="font-mono text-2xl font-semibold text-ink tabular-nums">
                  {plain.format(subs)}
                </span>
              </div>
              <input
                id="subs"
                type="range"
                min={10}
                max={500}
                step={5}
                value={subs}
                onChange={(e) => setSubs(Number(e.target.value))}
                className="reg-slider mt-4"
                aria-valuetext={`${subs} suscriptores`}
              />
              <div className="mt-2 flex justify-between font-mono text-xs text-slate">
                <span>10</span>
                <span>500</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="price" className="font-body text-ink">
                  Precio del plan
                </label>
                <span className="font-mono text-2xl font-semibold text-ink tabular-nums">
                  {ars.format(price)}
                </span>
              </div>
              <input
                id="price"
                type="range"
                min={10000}
                max={60000}
                step={1000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="reg-slider mt-4"
                aria-valuetext={`${ars.format(price)} por mes`}
              />
              <div className="mt-2 flex justify-between font-mono text-xs text-slate">
                <span>{ars.format(10000)}</span>
                <span>{ars.format(60000)}</span>
              </div>
            </div>
          </div>

          {/* RESULTADO */}
          <div className="flex flex-col justify-center border-t border-chrome pt-10 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <p className="readout font-mono">Ingreso recurrente por mes</p>
            <p
              className="mt-3 font-mono font-semibold text-ink tabular-nums leading-none break-words"
              style={{ fontSize: "clamp(2.4rem, 7vw, 4.5rem)" }}
            >
              {ars.format(monthly)}
            </p>
            <p className="mt-6 font-mono text-lg text-slate tabular-nums">
              {ars.format(yearly)} al año
            </p>
            <p className="mt-4 max-w-[38ch] text-slate leading-relaxed">
              Cobrado por adelantado el 1 de cada mes. Entre o no entre el
              cliente al local.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
