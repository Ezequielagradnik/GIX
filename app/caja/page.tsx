import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { CAJA_COOKIE, cookieIsValid } from "@/lib/caja";
import { LoginCard } from "@/components/caja/LoginCard";
import { CajaPanel, type Lead } from "@/components/caja/CajaPanel";

/* /caja — el panel interno. Sin sesion: la reja (contraseña unica).
   Con sesion: los anotados de la waitlist, listos para contactar. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CAJA · GIX",
  robots: { index: false, follow: false },
};

export default async function CajaPage() {
  const store = await cookies();
  const authed = cookieIsValid(store.get(CAJA_COOKIE)?.value);

  if (!authed) {
    return <LoginCard configured={Boolean(process.env.CAJA_CODE)} />;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let leads: Lead[] = [];
  let loadError: string | null = null;

  if (!url || !key) {
    loadError = "Supabase sin configurar (.env).";
  } else {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      loadError = error.message;
    } else {
      leads = (data ?? []) as Lead[];
    }
  }

  return <CajaPanel leads={leads} loadError={loadError} />;
}
