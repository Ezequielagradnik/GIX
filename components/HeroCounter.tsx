"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CounterStatic } from "./CounterStatic";

/* Carga el 3D solo en cliente (WebGL no corre en SSR). Mientras carga,
   o si el usuario pidio menos movimiento, mostramos el fallback estatico.
   El 3D queda en su propio chunk: no pesa en la carga inicial. */
const Counter3D = dynamic(() => import("./three/Counter3D"), {
  ssr: false,
  loading: () => <Fallback />,
});

function Fallback({ unit = "CONSUMOS" }: { unit?: string }) {
  return (
    <div className="flex h-full w-full items-center text-[clamp(3rem,11vw,7rem)]">
      <CounterStatic value={30} unit={unit} />
    </div>
  );
}

export function HeroCounter({ unit = "CONSUMOS" }: { unit?: string }) {
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Alto fijo para el canvas; el contenido 3D escala solo (FitCamera).
  return (
    <div className="h-[230px] w-full sm:h-[300px]">
      {!ready || reduced ? <Fallback unit={unit} /> : <Counter3D unit={unit} />}
    </div>
  );
}
