"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { TerminalFrame } from "./TicketUI";

/* La terminal de cobro del precio (3D, frente DOM real: pantalla
   con el precio + recibo que se imprime). Sin WebGL /
   reduced-motion: la misma terminal en 2D, recibo ya impreso. */

const TicketApp = dynamic(() => import("./three/TicketApp"), {
  ssr: false,
  loading: () => <TicketStatic />,
});

const S = 0.78; // escala del fallback

export function TicketStatic() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div style={{ width: 300 * S, height: 693 * S }}>
        <div className="origin-top-left" style={{ transform: `scale(${S})` }}>
          <TerminalFrame mode="done" />
        </div>
      </div>
    </div>
  );
}

export function DemoTicket() {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    setReady(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Imprime cuando la sección entra al viewport.
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
    <div ref={ref} className="h-[560px] w-full sm:h-[620px]">
      {!ready || reduced ? <TicketStatic /> : <TicketApp printed={printed} />}
    </div>
  );
}
