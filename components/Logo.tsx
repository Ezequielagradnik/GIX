import type { CSSProperties } from "react";

/* ============================================================
   LOGO GIX
   Concepto: la X es un sello. GIX termina en X, la tarjeta de
   sellos se marca con una X. El logo ES la accion del producto.
   "GI" solido en ink. "X" en stamp, rotada 3deg, con textura de
   tinta (filtro url(#gix-stamp-ink), definido en layout).
   ============================================================ */

type LogoProps = {
  /** Alto en px del wordmark. El resto escala proporcional. */
  size?: number;
  /** true = sobre fondo ink (negativo). */
  negative?: boolean;
  className?: string;
};

export function Logo({ size = 34, negative = false, className }: LogoProps) {
  const giColor = negative ? "var(--color-tile)" : "var(--color-ink)";
  const style: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 900,
    fontSize: `${size}px`,
    letterSpacing: "-0.07em",
    lineHeight: 1,
    color: giColor,
  };

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "baseline" }}
      aria-label="GIX"
      role="img"
    >
      <span style={style} aria-hidden="true">
        GI
      </span>
      <StampX size={size} inline />
    </span>
  );
}

/* La X estampada, reutilizable como marca de "consumo validado". */
export function StampX({
  size = 34,
  inline = false,
}: {
  size?: number;
  inline?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: `${size}px`,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        color: "var(--color-stamp)",
        transform: "rotate(3deg)",
        transformOrigin: "center",
        filter: "url(#gix-stamp-ink)",
        marginLeft: inline ? "-0.02em" : 0,
      }}
    >
      X
    </span>
  );
}

/* Isotipo / app icon: solo la X estampada dentro de un cuadrado
   de esquinas apenas redondeadas. */
export function Isotype({
  size = 44,
  negative = false,
}: {
  size?: number;
  negative?: boolean;
}) {
  const bg = negative ? "var(--color-ink)" : "var(--color-tile)";
  const ring = negative
    ? "color-mix(in srgb, var(--color-tile) 20%, transparent)"
    : "var(--color-chrome)";
  return (
    <span
      role="img"
      aria-label="GIX"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        background: bg,
        borderRadius: `${Math.round(size * 0.18)}px`,
        boxShadow: `inset 0 0 0 1px ${ring}`,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: `${size * 0.62}px`,
          lineHeight: 1,
          color: "var(--color-stamp)",
          transform: "rotate(3deg)",
          filter: "url(#gix-stamp-ink)",
        }}
      >
        X
      </span>
    </span>
  );
}
