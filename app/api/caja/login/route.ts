import { NextResponse } from "next/server";
import { CAJA_COOKIE, cajaHash, codeMatches } from "@/lib/caja";

/* POST /api/caja/login  { password }  -> setea cookie httpOnly
   DELETE /api/caja/login              -> cierra sesion */

export async function POST(req: Request) {
  if (!process.env.CAJA_CODE) {
    return NextResponse.json(
      { error: "Falta configurar CAJA_CODE en el servidor." },
      { status: 500 }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password || !codeMatches(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CAJA_COOKIE, cajaHash(process.env.CAJA_CODE), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CAJA_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}
