"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox, ContactShadows } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { INK, CHROME } from "./flip";
import { MacFrame } from "../CajaUI";

/* ============================================================
   COMPU DEL MOSTRADOR EN 3D (tipo iMac).
   El frente entero (bisel + pantalla + menton) es UNA pieza DOM
   proyectada (drei Html): nunca se desalinea. El WebGL pone solo
   el pie de aluminio y la sombra de apoyo, que van detras y al
   centro (tolerantes a cualquier desfase de proyeccion).
   Apoyada en el mostrador (sin flotar); sigue apenas el mouse.
   ============================================================ */

// MacFrame: 504 x 366 px -> con DF=2 (px/400*df): 2.52 x 1.83 world.
const DF = 2;
const FRAME_H = (366 * DF) / 400;

function Mac({
  codigo,
  saldo,
  mouse,
}: {
  codigo: string;
  saldo: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05);
    if (!g.current) return;
    const m = mouse.current;
    // Apoyada: nada de flotar. En reposo mira de frente (yaw ~0) para
    // que el pie quede centrado bajo la pantalla; solo sigue el mouse.
    const targetY = Math.sin(t.current * 0.4) * 0.02 + m.x * 0.11;
    const targetX = -0.01 + m.y * 0.05;
    const k = 1 - Math.pow(0.001, dt);
    g.current.rotation.y += (targetY - g.current.rotation.y) * k;
    g.current.rotation.x += (targetX - g.current.rotation.x) * k;
  });

  const bottom = -FRAME_H / 2; // borde inferior del frame

  return (
    <group position={[0, 0.34, 0]}>
      <group ref={g}>
        {/* Pie: brazo + base de aluminio. El brazo sube bien detras
            del frente opaco: cualquier desfase de proyeccion nunca
            abre un hueco entre pantalla y pie. */}
        <mesh position={[0, bottom + 0.05, -0.14]} castShadow>
          <boxGeometry args={[0.52, 0.95, 0.05]} />
          <meshStandardMaterial color={CHROME} roughness={0.45} metalness={0.35} />
        </mesh>
        <RoundedBox args={[1.5, 0.045, 0.6]} radius={0.02} position={[0, bottom - 0.42, 0.02]} castShadow>
          <meshStandardMaterial color={CHROME} roughness={0.45} metalness={0.35} />
        </RoundedBox>

        {/* Pantalla + menton: una pieza DOM proyectada. */}
        <Html
          transform
          distanceFactor={DF}
          position={[0, 0, 0.0]}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "none" }}
        >
          <MacFrame codigo={codigo} saldo={saldo} />
        </Html>
      </group>

      <ContactShadows
        position={[0, bottom - 0.45, 0]}
        opacity={0.3}
        scale={7}
        blur={2.2}
        far={2}
        color={INK}
      />
    </group>
  );
}

export default function MacScreen({
  codigo = "583921",
  saldo = 27,
}: {
  codigo?: string;
  saldo?: number;
}) {
  const mouse = useRef({ x: 0, y: 0 });

  return (
    <div
      className="h-full w-full"
      aria-hidden="true"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      }}
      onPointerLeave={() => {
        mouse.current.x = 0;
        mouse.current.y = 0;
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0.12, 6.6], fov: 26 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 5]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-3, 1, 2]} intensity={0.35} />
        <Suspense fallback={null}>
          <Mac codigo={codigo} saldo={saldo} mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
