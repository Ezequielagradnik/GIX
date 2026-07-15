"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MacFrame } from "./CajaUI";

/* Compu de la caja en 3D. Sin WebGL / reduced-motion: la misma
   pantalla en un marco 2D, escalada. */

const MacScreen = dynamic(() => import("./three/MacScreen"), {
  ssr: false,
  loading: () => <MacStatic />,
});

const S = 0.72;

export function MacStatic() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div style={{ width: 504 * S, height: 366 * S }}>
        <div className="origin-top-left" style={{ transform: `scale(${S})` }}>
          <MacFrame />
        </div>
      </div>
    </div>
  );
}

export function DemoMac() {
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

  return (
    <div className="h-[420px] w-full sm:h-[480px]">
      {!ready || reduced ? <MacStatic /> : <MacScreen codigo="583921" saldo={27} />}
    </div>
  );
}
