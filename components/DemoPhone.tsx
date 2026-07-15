"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PhoneFrame } from "./GixAppUI";

/* Teléfono del cliente con la app de GIX (3D, pantalla DOM real).
   Sin WebGL / reduced-motion: la misma app en un marco 2D. */

const PhoneApp = dynamic(() => import("./three/PhoneApp"), {
  ssr: false,
  loading: () => <PhoneStatic />,
});

const S = 0.56; // escala del fallback

export function PhoneStatic() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div style={{ width: 332 * S, height: 684 * S }}>
        <div className="origin-top-left" style={{ transform: `scale(${S})` }}>
          <PhoneFrame />
        </div>
      </div>
    </div>
  );
}

export function DemoPhone() {
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
    <div className="h-[440px] w-full sm:h-[490px]">
      {!ready || reduced ? <PhoneStatic /> : <PhoneApp saldo={28} codigo="583921" />}
    </div>
  );
}
