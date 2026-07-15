"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Piezas 3D compartidas entre el contador del hero y la demo. */

export const INK = "#16191A";
export const HOUSING = "#1c2021";
export const STAMP = "#E23E2C";
export const CHROME = "#c8ccc9";

/* Textura de un glifo dibujada en canvas (sin fuentes 3D asincronas). */
export function glyphTexture(
  txt: string,
  opts: { flip?: boolean; bg?: string; fg?: string; ratio?: number; px?: number; spacing?: number } = {}
) {
  const { flip = false, bg = INK, fg = STAMP, ratio = 1.45, px, spacing = 0 } = opts;
  const w = 256;
  const h = Math.round(w * ratio);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  x.fillStyle = bg;
  x.fillRect(0, 0, w, h);
  if (flip) {
    x.translate(w, h);
    x.rotate(Math.PI);
  }
  x.fillStyle = fg;
  x.textAlign = "center";
  x.textBaseline = "middle";
  try {
    (x as unknown as { letterSpacing: string }).letterSpacing = `${spacing}px`;
  } catch {}
  // Fuente mono de marca (IBM Plex Mono via next/font); cae a system mono.
  const fam =
    (typeof document !== "undefined" &&
      getComputedStyle(document.body).getPropertyValue("--font-plex-mono").trim()) ||
    "ui-monospace";
  x.font = `700 ${px ?? Math.round(h * 0.66)}px ${fam}, ui-monospace, monospace`;
  x.fillText(txt, w / 2, h / 2 + h * 0.03);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.needsUpdate = true;
  return t;
}

/* Una ficha que gira (flip) cuando su digito cambia. */
export function FlipCard({
  digit,
  x = 0,
  w = 0.92,
  h = 1.34,
  depth = 0.16,
}: {
  digit: number;
  x?: number;
  w?: number;
  h?: number;
  depth?: number;
}) {
  const flip = useRef<THREE.Group>(null);
  const rot = useRef(0);
  const target = useRef(0);
  const frontShowing = useRef(true);
  const frontMat = useRef<THREE.MeshBasicMaterial>(null);
  const backMat = useRef<THREE.MeshBasicMaterial>(null);
  const shown = useRef(digit);
  const ratio = h / w;

  const normal = useMemo(
    () => Array.from({ length: 10 }, (_, i) => glyphTexture(String(i), { ratio })),
    [ratio]
  );
  const flipped = useMemo(
    () => Array.from({ length: 10 }, (_, i) => glyphTexture(String(i), { flip: true, ratio })),
    [ratio]
  );

  useEffect(() => {
    if (frontMat.current) {
      frontMat.current.map = normal[digit];
      frontMat.current.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (digit === shown.current) return;
    shown.current = digit;
    if (frontShowing.current) {
      if (backMat.current) {
        backMat.current.map = flipped[digit];
        backMat.current.needsUpdate = true;
      }
    } else {
      if (frontMat.current) {
        frontMat.current.map = normal[digit];
        frontMat.current.needsUpdate = true;
      }
    }
    frontShowing.current = !frontShowing.current;
    target.current += Math.PI;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digit]);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0009, Math.min(dt, 0.05));
    rot.current += (target.current - rot.current) * k;
    if (flip.current) flip.current.rotation.x = rot.current;
  });

  return (
    <group position={[x, 0, 0]}>
      <group ref={flip}>
        <mesh castShadow>
          <boxGeometry args={[w, h, depth]} />
          <meshStandardMaterial attach="material-0" color={INK} roughness={0.9} />
          <meshStandardMaterial attach="material-1" color={INK} roughness={0.9} />
          <meshStandardMaterial attach="material-2" color={INK} roughness={0.9} />
          <meshStandardMaterial attach="material-3" color={INK} roughness={0.9} />
          <meshBasicMaterial ref={frontMat} attach="material-4" toneMapped={false} />
          <meshBasicMaterial ref={backMat} attach="material-5" toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0, depth / 2 + 0.02]}>
        <boxGeometry args={[w * 0.98, 0.022 * (h / 1.34), 0.02]} />
        <meshStandardMaterial color="#0c0e0e" roughness={0.8} />
      </mesh>
    </group>
  );
}
