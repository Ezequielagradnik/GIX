"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { RoundedBox, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FlipCard, glyphTexture, INK, HOUSING, CHROME } from "./flip";

/* Ajusta la distancia de la camara para que el tablero (ancho) entre
   entero en cualquier proporcion de canvas. */
function FitCamera({ halfWidth = 2.35, fov = 26, baseZ = 4.3 }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const need = halfWidth / (Math.tan((fov * Math.PI) / 180 / 2) * aspect);
    camera.position.z = Math.max(baseZ, need);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size, halfWidth, fov, baseZ]);
  return null;
}

/* ============================================================
   CONTADOR 3D — tablero split-flap (tipo tablero de aeropuerto).
   Fichas planas que giran y muestran el numero nuevo: 30 -> 29 ...
   El saldo bajando, mecanico y fisico. Mate, sin brillo. No fintech.
   Solo gira la ficha cuyo digito cambia (unidades siempre, decenas
   casi nunca), como un flip-clock de verdad.
   ============================================================ */

const TH = 1.34;
const DEPTH = 0.16;
const START = 30;
const STEP_MS = 2400;

function UnitTile({ unit, x }: { unit: string; x: number }) {
  const tex = useMemo(() => {
    // Fuente adaptativa: textos largos (CONSUMOS) achican para no
    // salirse del canvas de 256px del tile.
    const px = Math.min(62, Math.floor(236 / (unit.length * 0.72)));
    const spacing = px > 50 ? 8 : 4;
    return glyphTexture(unit, { bg: INK, fg: CHROME, ratio: TH / 1.5, px, spacing });
  }, [unit]);
  return (
    <mesh position={[x, 0, 0]} castShadow>
      <boxGeometry args={[1.5, TH, DEPTH]} />
      <meshStandardMaterial attach="material-0" color={INK} roughness={0.9} />
      <meshStandardMaterial attach="material-1" color={INK} roughness={0.9} />
      <meshStandardMaterial attach="material-2" color={INK} roughness={0.9} />
      <meshStandardMaterial attach="material-3" color={INK} roughness={0.9} />
      <meshBasicMaterial attach="material-4" map={tex} toneMapped={false} />
      <meshStandardMaterial attach="material-5" color={INK} roughness={0.9} />
    </mesh>
  );
}

function Board({ value, unit }: { value: number; unit: string }) {
  const tens = Math.floor(value / 10);
  const units = value % 10;
  return (
    <group position={[-0.72, 0, 0]}>
      <RoundedBox args={[4.2, TH + 0.34, 0.12]} radius={0.06} smoothness={4} position={[0.66, 0, -0.16]} receiveShadow>
        <meshStandardMaterial color={HOUSING} roughness={1} metalness={0} />
      </RoundedBox>
      <FlipCard digit={tens} x={-0.75} />
      <FlipCard digit={units} x={0.28} />
      <UnitTile unit={unit} x={1.72} />
    </group>
  );
}

export default function Counter3D({ unit = "CONSUMOS" }: { unit?: string }) {
  const [value, setValue] = useState(START);
  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((v) => (v <= 0 ? START : v - 1));
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="h-full w-full"
      role="status"
      aria-live="off"
      aria-label={`Disponibles: ${value} ${unit.toLowerCase()}`}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0.15, 4.3], fov: 26 }}
      >
        <FitCamera />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-3, 2, 2]} intensity={0.4} />
        <Suspense fallback={null}>
          <Board value={value} unit={unit} />
        </Suspense>
        <ContactShadows position={[0, -0.9, 0]} opacity={0.3} scale={7} blur={2.4} far={2} color={INK} />
      </Canvas>
    </div>
  );
}
