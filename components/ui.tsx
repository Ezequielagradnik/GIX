import type { ReactNode } from "react";

/* Contenedor de ancho maximo, consistente en toda la pagina. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}

/* Label de seccion como lectura de registradora: indice mono + hairline.
   Reemplaza los titulos centrados de marketing. */
export function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="readout font-mono shrink-0">{index}</span>
      <span className="readout font-mono shrink-0">{children}</span>
      <span className="h-px flex-1 bg-chrome" aria-hidden="true" />
    </div>
  );
}
