import type { Metadata, Viewport } from "next";
import { Archivo, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-public-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GIX — Tus clientes vuelven, desde el día uno",
  description:
    "Membresías por consumo para tu comercio. Fidelizá, cobrá por adelantado y hacé que vuelvan todos los meses. 30 días de prueba, sin tarjeta.",
  openGraph: {
    title: "GIX — Tus clientes vuelven, desde el día uno",
    description:
      "Membresías por consumo para tu comercio. Ingreso recurrente, cobrado por adelantado.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e9edea",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${archivo.variable} ${publicSans.variable} ${plexMono.variable} antialiased`}
      >
        {/* Filtro de tinta de sello de goma. Bordes irregulares + tinta
            despareja. Lo comparte el wordmark y toda X estampada. */}
        <svg
          aria-hidden="true"
          focusable="false"
          width="0"
          height="0"
          style={{ position: "absolute" }}
        >
          <defs>
            <filter id="gix-stamp-ink">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.014 0.016"
                numOctaves="3"
                seed="4"
                result="grain"
              />
              <feColorMatrix
                in="grain"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.15"
                result="mask"
              />
              <feComposite
                in="SourceGraphic"
                in2="mask"
                operator="in"
                result="eroded"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9 0.8"
                numOctaves="2"
                seed="7"
                result="edge"
              />
              <feDisplacementMap
                in="eroded"
                in2="edge"
                scale="2.1"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
