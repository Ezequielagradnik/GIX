# GIX

Landing e identidad de **GIX**: membresías por consumo para comercios físicos. Una cafetería crea un plan ("30 cafés por mes"), el cliente se suscribe por QR y paga por adelantado todos los meses. Cada retiro descuenta un consumo del saldo. La tarjeta de sellos, cobrada por adelantado y automatizada.

La página le habla al **dueño del comercio**: cuánta plata le entra y cuándo.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Three.js + React Three Fiber + drei (piezas 3D)
- Supabase para la waitlist (opcional hasta conectar)
- Deploy en Vercel

## Correr local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
```

## Identidad

Tokens (en `app/globals.css`, `@theme`):

| token       | valor     | uso                                            |
|-------------|-----------|------------------------------------------------|
| `--tile`    | `#E9EDEA` | fondo, porcelana fría (no crema)               |
| `--ink`     | `#16191A` | texto y estructura, negro frío                 |
| `--stamp`   | `#E23E2C` | acento único: logo, CTA, dígitos del saldo     |
| `--slate`   | `#5B6663` | texto secundario                               |
| `--chrome`  | `#C8CCC9` | bordes, hairlines, detalle metálico            |

Tipografía: **Archivo** (display), **Public Sans** (cuerpo), **IBM Plex Mono** (todo dato duro: saldo, precio, código). Vía `next/font/google`.

### Logo

La **X es un sello**. Wordmark `GIX` con la X en rojo, rotada 3°, con textura de tinta imperfecta (filtro SVG de turbulencia, en `app/layout.tsx`). El componente vive en `components/Logo.tsx`. Entregables en `public/logo/` (wordmark, isotipo, y negativos sobre ink). El favicon (`app/icon.svg`) es solo la X.

### Piezas 3D

- **Contador del hero** (`components/three/Counter3D.tsx`): tablero split-flap que baja 30 → 29 → 28... Fichas que giran; solo gira la que cambia. Cámara auto-ajustable al ancho de la columna.
- **Teléfono de la demo** (`components/three/PhoneApp.tsx`): teléfono 3D con la app de GIX. El marco y la pantalla son DOM real proyectado en 3D (drei `Html`, ver `components/GixAppUI.tsx`): nítido y con las fuentes de marca. El WebGL aporta grosor, botones y sombra. Sigue apenas el mouse.
- Helpers compartidos en `components/three/flip.tsx`.

Todo el 3D carga solo en cliente (`next/dynamic`, `ssr: false`), en su propio chunk. Con `prefers-reduced-motion` o sin WebGL cae a un fallback estático 2D. Foco de teclado visible; sin scroll horizontal.

## Waitlist → Supabase

El form (`components/Waitlist.tsx`) postea a `app/api/waitlist/route.ts`. Está **env-guarded**: sin variables de Supabase valida y responde OK sin persistir (la UI funciona). Para conectar:

1. Creá la tabla:

```sql
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  comercio text not null,
  rubro text not null,
  whatsapp text not null
);
alter table public.waitlist enable row level security;
-- El insert entra por service role desde el route handler (server), no desde el cliente.
```

2. Completá `.env.local` (ver `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. Listo. El route valida los campos, chequea el rubro y el WhatsApp, e inserta.

> El service role key es server-only. No lo expongas al cliente.

## Estructura

```
app/
  layout.tsx        fuentes, metadata, filtro de tinta del sello
  page.tsx          arma las secciones
  icon.svg          favicon (la X)
  globals.css       tokens, tipografía, grout de azulejo, split-flap CSS fallback
  api/waitlist/     route handler (Supabase-ready)
components/
  Hero, Problem, HowItWorks, CounterDemo, Calculator, Pricing, Waitlist, Footer
  Logo, CounterStatic, HeroCounter, DemoPhone, GixAppUI, ui
  three/            Counter3D, PhoneApp, flip
public/
  logo/             SVGs del wordmark e isotipo
```
