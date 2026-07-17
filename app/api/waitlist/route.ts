import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ============================================================
   POST /api/waitlist
   Guarda un lead en Supabase (tabla `waitlist`).
   Env-guarded: si faltan las variables de Supabase, valida y
   responde OK igual (loguea el lead), asi la UI funciona antes
   de conectar la base. Conectar = completar .env.local.
   ============================================================ */

const RUBROS = [
  "Cafetería de especialidad",
  "Panadería",
  "Lavadero",
  "Estudio de pilates",
  "Otro",
];

type Payload = {
  nombre?: unknown;
  comercio?: unknown;
  rubro?: unknown;
  rubroOtro?: unknown;
  whatsapp?: unknown;
};

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const nombre = clean(body.nombre);
  const comercio = clean(body.comercio);
  const rubro = clean(body.rubro);
  const rubroOtro = clean(body.rubroOtro);
  const whatsapp = clean(body.whatsapp);

  if (!nombre || !comercio || !rubro || !whatsapp) {
    return NextResponse.json(
      { error: "Faltan datos. Completá todos los campos." },
      { status: 400 }
    );
  }
  if (!RUBROS.includes(rubro)) {
    return NextResponse.json({ error: "Rubro no válido." }, { status: 400 });
  }
  if (rubro === "Otro" && !rubroOtro) {
    return NextResponse.json({ error: "Contanos qué rubro." }, { status: 400 });
  }
  // Solo guardamos el detalle cuando el rubro es "Otro".
  const rubro_otro = rubro === "Otro" ? rubroOtro : null;
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 8) {
    return NextResponse.json(
      { error: "Revisá el WhatsApp." },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Supabase todavía no conectado: no persistimos, pero no rompemos la UI.
  if (!url || !serviceKey) {
    console.info("[waitlist] lead sin Supabase:", {
      nombre,
      comercio,
      rubro,
      rubro_otro,
      whatsapp,
    });
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    const { error } = await supabase
      .from("waitlist")
      .insert({ nombre, comercio, rubro, rubro_otro, whatsapp });

    if (error) {
      console.error("[waitlist] supabase error:", error.message);
      return NextResponse.json(
        { error: "No se pudo guardar. Probá de nuevo." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[waitlist] error:", err);
    return NextResponse.json(
      { error: "No se pudo guardar. Probá de nuevo." },
      { status: 500 }
    );
  }
}
