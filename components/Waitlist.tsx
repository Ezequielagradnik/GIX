"use client";

import { useState } from "react";
import { StampX } from "./Logo";
import { Container, SectionLabel } from "./ui";

const RUBROS = [
  "Cafetería de especialidad",
  "Panadería",
  "Lavadero",
  "Estudio de pilates",
  "Otro",
];

type Status = "idle" | "sending" | "done" | "error";

export function Waitlist() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo guardar. Probá de nuevo.");
      }
      setStatus("done");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    }
  }

  return (
    <section id="waitlist" className="border-b border-chrome py-16 sm:py-24">
      <Container>
        <SectionLabel index="§ 07">Anotate</SectionLabel>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="max-w-[36ch]">
            <h2 className="font-display text-ink text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
              Dejá tu comercio en la lista.
            </h2>
            <p className="mt-4 text-slate leading-relaxed">
              Te escribimos por WhatsApp para activarte los 30 días de prueba.
              Sin tarjeta.
            </p>
          </div>

          {status === "done" ? (
            <div className="flex items-center gap-5 border border-ink bg-tile p-8">
              <span className="text-5xl leading-none">
                <StampX size={52} />
              </span>
              <div>
                <p className="font-display text-2xl text-ink">Anotado.</p>
                <p className="mt-1 font-mono text-sm text-slate">
                  Te escribimos por WhatsApp en las próximas 48 horas.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              <Field label="Nombre" name="nombre" placeholder="Tu nombre" required />
              <Field
                label="Comercio"
                name="comercio"
                placeholder="Nombre del local"
                required
              />
              <div>
                <label htmlFor="rubro" className="readout font-mono mb-2 block">
                  Rubro
                </label>
                <select
                  id="rubro"
                  name="rubro"
                  required
                  defaultValue=""
                  className="w-full border border-chrome bg-tile px-4 py-3 font-body text-ink focus-visible:border-ink"
                >
                  <option value="" disabled>
                    Elegí un rubro
                  </option>
                  {RUBROS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="WhatsApp"
                name="whatsapp"
                type="tel"
                inputMode="tel"
                placeholder="+54 9 11 ..."
                required
              />

              {status === "error" && (
                <p role="alert" className="font-mono text-sm text-stamp">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-stamp mt-2 inline-flex items-center justify-center rounded-[3px] px-7 py-4 text-lg disabled:opacity-60"
              >
                {status === "sending" ? "Guardando..." : "Anotarme"}
              </button>
              <p className="font-mono text-xs text-slate">
                Solo lo usamos para activarte la prueba.
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: "tel" | "text" | "email";
}) {
  return (
    <div>
      <label htmlFor={name} className="readout font-mono mb-2 block">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full border border-chrome bg-tile px-4 py-3 font-body text-ink placeholder:text-slate/60 focus-visible:border-ink"
      />
    </div>
  );
}
