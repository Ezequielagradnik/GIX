import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CAJA_COOKIE, cookieIsValid } from "@/lib/caja";

/* POST /api/caja/contactado  { id, contactado }
   Marca / desmarca un lead como contactado. Solo con sesion de caja. */

export async function POST(req: NextRequest) {
  if (!cookieIsValid(req.cookies.get(CAJA_COOKIE)?.value)) {
    return NextResponse.json({ error: "Sin acceso." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Supabase sin configurar." }, { status: 500 });
  }

  let body: { id?: unknown; contactado?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const contactado = Boolean(body.contactado);
  if (!id) {
    return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase
    .from("waitlist")
    .update({ contactado })
    .eq("id", id);

  if (error) {
    if (/contactado/i.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "Falta la columna. Corré en el SQL Editor: alter table public.waitlist add column contactado boolean not null default false;",
        },
        { status: 400 }
      );
    }
    console.error("[caja] update error:", error.message);
    return NextResponse.json({ error: "No se pudo actualizar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
