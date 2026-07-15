import { createHash, timingSafeEqual } from "node:crypto";

/* Acceso a /caja: un codigo de 6 digitos (env CAJA_CODE).
   La cookie guarda el hash del codigo (nunca el codigo). */

export const CAJA_COOKIE = "gix_caja";

export function cajaHash(code: string) {
  return createHash("sha256").update(`gix-caja-v1:${code}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/* ¿El codigo ingresado es el de la caja? (comparacion constante) */
export function codeMatches(input: string) {
  const code = process.env.CAJA_CODE;
  if (!code) return false;
  return safeEqual(cajaHash(input), cajaHash(code));
}

/* ¿La cookie es valida? */
export function cookieIsValid(value: string | undefined) {
  const code = process.env.CAJA_CODE;
  if (!code || !value) return false;
  return safeEqual(value, cajaHash(code));
}
