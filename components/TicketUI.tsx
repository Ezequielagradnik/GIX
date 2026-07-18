"use client";

import { useEffect, useState } from "react";
import { StampCheck } from "./Logo";

/* ============================================================
   El posnet de GIX cobrando solo (DOM real).
   La máquina actúa la operación sin usuario: tipea el monto,
   presiona ✓, procesa, la pantalla marca Aprobada con el tic y
   el ticket del precio sale impreso por ABAJO, debajo del
   teclado. Todo el frente es UNA pieza DOM: la usan la terminal
   3D (drei Html) y el fallback 2D.

   `mode`: "waiting" (quieta, antes de entrar al viewport),
   "play" (actúa la secuencia una vez), "done" (estado final:
   ticket impreso, Aprobada — el fallback estático).
   ============================================================ */

export const TERM_W = 300; // ancho de la máquina (y del frente DOM)
export const TICKET_WIN_H = 340; // ventana por donde baja el ticket
export const OVERLAP = 12; // cuánto tapa la máquina al ticket

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];

type Phase = "amount" | "proc" | "ok";

const fmt = (s: string) =>
  new Intl.NumberFormat("es-AR").format(Number(s || "0"));

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="px-5 py-2.5">
      <div className="flex items-baseline justify-between gap-3 font-mono text-[13px] text-ink">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      {sub && <p className="mt-0.5 font-mono text-[11px] text-slate">{sub}</p>}
    </div>
  );
}

function Dots() {
  return (
    <span className="ml-2 inline-flex items-baseline gap-[4px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="gix-led inline-block h-[5px] w-[5px] rounded-full bg-stamp"
          style={{ animationDelay: `${i * 0.2}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

export function TerminalFrame({
  mode = "done",
}: {
  mode?: "waiting" | "play" | "done";
}) {
  const done = mode === "done";
  const [phase, setPhase] = useState<Phase>(done ? "ok" : "amount");
  const [printed, setPrinted] = useState(done);
  const [emitted, setEmitted] = useState(done);
  const [typed, setTyped] = useState(done ? "39900" : "");
  const [pressed, setPressed] = useState<string | null>(null);

  /* El guion de la operación, cronometrado: tipea el monto,
     presiona ✓, procesa, aprueba e imprime el ticket. */
  useEffect(() => {
    if (mode !== "play") return;
    const timers: number[] = [];
    const at = (t: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, t));
    const press = (t: number, k: string) => {
      at(t, () => setPressed(k));
      at(t + 220, () => setPressed(null));
    };

    // 1) Ingresá el monto y presioná ✓.
    ["3", "9", "9", "0", "0"].forEach((d, i) => {
      const t = 700 + i * 380;
      press(t, d);
      at(t, () => setTyped((s) => s + d));
    });
    press(2950, "✓");

    // 2) Procesando… aprobada (con el tic).
    at(3300, () => setPhase("proc"));
    at(4600, () => setPhase("ok"));

    // 3) El ticket sale impreso por abajo.
    at(5200, () => setPrinted(true));
    at(7600, () => setEmitted(true));

    return () => timers.forEach(clearTimeout);
  }, [mode]);

  return (
    <div style={{ width: TERM_W }} className="relative">
      {/* LA MÁQUINA. */}
      <div className="relative z-10 overflow-hidden rounded-[26px] bg-ink shadow-[0_30px_60px_-30px_rgba(22,25,26,0.6)]">
        {/* Barra superior: marca + LED. */}
        <div className="flex h-[40px] items-center justify-between px-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-chrome">
            GIX · Terminal 01
          </span>
          <span
            className="gix-led h-[6px] w-[6px] rounded-full"
            style={{
              background: "var(--color-stamp)",
              boxShadow: "0 0 8px var(--color-stamp)",
            }}
          />
        </div>

        {/* Pantalla: cada paso de la operación. */}
        <div className="mx-[14px] flex h-[96px] flex-col justify-center rounded-[12px] bg-tile px-5">
          {phase === "amount" && (
            <>
              <div className="flex items-baseline justify-between">
                <span className="readout">Monto</span>
                <span className="font-mono text-[28px] font-semibold leading-none tabular-nums text-ink">
                  ${fmt(typed)}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] text-slate">
                Ingresá el monto y presioná ✓
              </p>
            </>
          )}
          {phase === "proc" && (
            <div className="flex items-baseline">
              <span className="font-mono text-[14px] text-ink">Procesando</span>
              <Dots />
            </div>
          )}
          {phase === "ok" && (
            <div className="flex items-center gap-3">
              <StampCheck size={30} />
              <div>
                <p className="font-display text-[18px] leading-none text-ink">
                  Aprobada
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate">
                  {emitted ? "$39.900 · Ticket emitido" : "Imprimiendo ticket…"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Teclado numérico. */}
        <div
          aria-hidden="true"
          className="mx-[14px] mt-3 grid grid-cols-3 gap-[7px]"
        >
          {KEYS.map((k) => {
            const isPressed = pressed === k;
            return (
              <div
                key={k}
                className={`flex h-[40px] items-center justify-center rounded-[8px] font-mono text-[15px] transition-all duration-150 ${
                  k === "✓"
                    ? `bg-stamp font-bold text-tile ${
                        isPressed ? "scale-90 brightness-125" : ""
                      }`
                    : isPressed
                      ? "scale-90 bg-chrome text-ink"
                      : "bg-white/10 text-chrome"
                }`}
              >
                {k}
              </div>
            );
          })}
        </div>

        {/* Ranura de impresión, abajo del teclado. */}
        <div className="relative h-[36px]">
          <div className="mx-auto mt-[10px] h-[10px] w-[78%] rounded-full bg-black/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]" />
          <div className="mx-auto mt-[5px] h-[3px] w-[64%] rounded-full bg-white/10" />
        </div>
      </div>

      {/* EL TICKET: baja desde atrás de la máquina cuando se imprime. */}
      <div
        className="relative z-0 overflow-hidden"
        style={{
          width: TERM_W,
          height: TICKET_WIN_H,
          marginTop: -OVERLAP,
        }}
      >
        <div
          style={{
            transform: printed ? "translateY(0)" : "translateY(-103%)",
            transition: "transform 1.9s cubic-bezier(0.22, 1, 0.36, 1) 0.25s",
          }}
        >
          <div
            className="ticket relative mx-auto w-[260px]"
            style={{
              ["--z" as string]: "9px",
              paddingBlock: "calc(9px + 0.9rem)",
            }}
          >
            <div className="px-5 pb-3 text-center">
              <p className="font-display text-xl text-ink">GIX</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-slate">
                Membresías por consumo
              </p>
            </div>
            <hr className="ticket-rule" />
            <Row label="Prueba 30 días" value="$0" sub="Sin tarjeta." />
            <hr className="ticket-rule" />
            <Row
              label="Después"
              value="$39.900 /mes"
              sub="Un plan. Sin escalones."
            />
            <hr className="ticket-rule" />
            <div className="flex items-baseline justify-between px-5 py-3 font-mono text-ink">
              <span className="text-[12px] uppercase tracking-[0.15em]">
                Total hoy
              </span>
              <span className="text-xl font-semibold tabular-nums">$0</span>
            </div>
            <div className="px-5 pt-1">
              <a
                href="#waitlist"
                style={{ pointerEvents: "auto" }}
                className="btn-stamp flex w-full items-center justify-center rounded-[3px] px-5 py-3 text-[15px]"
              >
                Probar 30 días gratis
              </a>
            </div>

            {/* Sello de goma: cae cuando terminó de imprimir. */}
            <div
              aria-hidden="true"
              className="absolute right-3 top-[62px] rounded-[6px] border-[3px] border-stamp px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-stamp"
              style={{
                filter: "url(#gix-stamp-ink)",
                opacity: printed ? 1 : 0,
                transform: printed
                  ? "rotate(-8deg) scale(1)"
                  : "rotate(-8deg) scale(1.5)",
                transition:
                  "opacity 0.3s ease-out 2.2s, transform 0.3s cubic-bezier(0.3, 1.4, 0.5, 1) 2.2s",
              }}
            >
              30 días gratis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
