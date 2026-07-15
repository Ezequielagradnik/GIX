"use client";

import { useState } from "react";
import { Logo } from "../Logo";

/* La reja de /caja: una contraseña, nada mas. */

export function LoginCard({ configured }: { configured: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/caja/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.get("password") }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo entrar.");
      }
      window.location.reload();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo entrar.");
    }
  }

  return (
    <main className="tile-grout flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-[360px] border border-ink bg-tile p-8">
        <div className="flex items-center justify-between">
          <Logo size={26} />
          <span className="readout font-mono">Caja</span>
        </div>

        {configured ? (
          <form onSubmit={onSubmit} className="mt-8">
            <label htmlFor="password" className="readout font-mono mb-2 block">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              className="w-full border border-chrome bg-tile px-4 py-3 font-mono text-ink"
            />
            {error && (
              <p role="alert" className="mt-3 font-mono text-sm text-stamp">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-stamp mt-5 flex w-full items-center justify-center rounded-[3px] px-6 py-3.5 text-base disabled:opacity-60"
            >
              {status === "sending" ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <p className="mt-8 font-mono text-sm leading-relaxed text-slate">
            Falta configurar <span className="text-ink">CAJA_CODE</span> en el
            .env del servidor.
          </p>
        )}
      </div>
    </main>
  );
}
