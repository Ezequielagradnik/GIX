"use client";

import { useMemo, useState } from "react";
import { Logo, StampCheck } from "../Logo";

/* El panel de la caja: los anotados de la waitlist, listos para
   contactar por WhatsApp con mensaje precargado. */

export type Lead = {
  id: string;
  created_at: string;
  nombre: string;
  comercio: string;
  rubro: string;
  whatsapp: string;
  contactado?: boolean | null;
};

/* Formato manual (dd/mm hh:mm, hora de Argentina = UTC-3 fijo):
   identico en server y cliente, sin diferencias de ICU. */
const fmtFecha = (iso: string) => {
  const t = new Date(+new Date(iso) - 3 * 3600 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(t.getUTCDate())}/${p(t.getUTCMonth() + 1)} · ${p(t.getUTCHours())}:${p(t.getUTCMinutes())}`;
};

/* wa.me quiere solo digitos con codigo de pais. Si parece un numero
   argentino sin prefijo, le anteponemos 549. */
function waLink(lead: Lead) {
  let digits = lead.whatsapp.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length <= 10) digits = `549${digits}`;
  const msg = `Hola ${lead.nombre}, somos de GIX. Vimos que anotaste ${lead.comercio} para la prueba de 30 días. ¿Lo activamos?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-chrome bg-tile px-4 py-3">
      <p className="readout font-mono">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

export function CajaPanel({
  leads: initial,
  loadError,
}: {
  leads: Lead[];
  loadError: string | null;
}) {
  const [leads, setLeads] = useState(initial);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return {
      total: leads.length,
      hoy: leads.filter((l) => now - +new Date(l.created_at) < day).length,
      semana: leads.filter((l) => now - +new Date(l.created_at) < 7 * day).length,
      sinContactar: leads.filter((l) => !l.contactado).length,
    };
  }, [leads]);

  async function toggle(lead: Lead) {
    const next = !lead.contactado;
    setToggleError(null);
    setLeads((ls) =>
      ls.map((l) => (l.id === lead.id ? { ...l, contactado: next } : l))
    );
    try {
      const res = await fetch("/api/caja/contactado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, contactado: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo actualizar.");
      }
    } catch (err) {
      // revertir
      setLeads((ls) =>
        ls.map((l) => (l.id === lead.id ? { ...l, contactado: !next } : l))
      );
      setToggleError(err instanceof Error ? err.message : "No se pudo actualizar.");
    }
  }

  async function logout() {
    await fetch("/api/caja/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-chrome bg-tile/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Logo size={24} />
            <span className="readout font-mono">Caja · Waitlist</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="font-mono text-xs uppercase tracking-[0.15em] text-slate underline underline-offset-4 hover:text-ink"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1120px] px-5 py-10 sm:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Anotados" value={stats.total} />
          <Stat label="Hoy" value={stats.hoy} />
          <Stat label="Últimos 7 días" value={stats.semana} />
          <Stat label="Sin contactar" value={stats.sinContactar} />
        </div>

        {loadError && (
          <p className="mt-6 border border-stamp px-4 py-3 font-mono text-sm text-stamp">
            {loadError}
          </p>
        )}
        {toggleError && (
          <p className="mt-6 border border-stamp px-4 py-3 font-mono text-sm text-stamp">
            {toggleError}
          </p>
        )}

        {/* Tabla */}
        <div className="mt-8 overflow-x-auto border border-chrome">
          <table className="w-full min-w-[760px] border-collapse bg-tile text-left">
            <thead>
              <tr className="border-b border-chrome">
                {["Nombre", "Comercio", "Rubro", "Fecha", "Contacto", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="readout whitespace-nowrap px-4 py-3 font-mono font-normal"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && !loadError && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center font-mono text-sm text-slate">
                    Todavía no hay anotados. Cuando entren, aparecen acá.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`border-b border-chrome last:border-b-0 ${
                    lead.contactado ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-body font-semibold text-ink">
                    {lead.nombre}
                  </td>
                  <td className="px-4 py-3 text-slate">{lead.comercio}</td>
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap border border-chrome px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-slate">
                      {lead.rubro}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm tabular-nums text-slate">
                    {fmtFecha(lead.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a
                      href={waLink(lead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-stamp inline-flex items-center rounded-[3px] px-3 py-1.5 font-mono text-xs"
                    >
                      WhatsApp →
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggle(lead)}
                      aria-pressed={Boolean(lead.contactado)}
                      className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                        lead.contactado
                          ? "border-ink text-ink"
                          : "border-chrome text-slate hover:border-ink hover:text-ink"
                      }`}
                    >
                      {lead.contactado ? (
                        <>
                          <StampCheck size={14} /> Contactado
                        </>
                      ) : (
                        "Marcar contactado"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 font-mono text-[11px] text-slate">
          El botón de WhatsApp abre el chat con un mensaje precargado. Si el
          número no abre bien, revisalo en Supabase.
        </p>
      </div>
    </main>
  );
}
