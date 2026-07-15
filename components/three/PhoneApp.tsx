"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { INK } from "./flip";
import { PhoneFrame } from "../GixAppUI";

/* ============================================================
   TELEFONO 3D con la app de GIX.
   El marco y la pantalla son UNA pieza DOM (PhoneFrame) proyectada
   en 3D con drei Html: bisel uniforme, tipografia de marca, nitida.
   El WebGL pone lo fisico: lamina trasera con grosor (silueta de
   profundidad al rotar), botones laterales y sombra de contacto.
   Flota suave y sigue apenas el mouse.
   ============================================================ */

// PhoneFrame: 332 x 684 px. Con distanceFactor=2 (px/400*df):
// 332px -> 1.66 world, 684px -> 3.42 world.
const DF = 2;
const FRAME_W = (332 * DF) / 400;
const FRAME_H = (684 * DF) / 400;

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function Phone({
  saldo,
  codigo,
  mouse,
}: {
  saldo: number;
  codigo: string;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);

  // Lamina trasera: apenas mas chica que el marco DOM, asi nunca
  // asoma por delante; solo aporta grosor y sombra.
  const slabGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(
      roundedRectShape(FRAME_W * 0.965, FRAME_H * 0.982, 0.2),
      { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.025, bevelSegments: 3, curveSegments: 20 }
    );
    geo.center();
    return geo;
  }, []);

  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05);
    if (!g.current) return;
    const m = mouse.current;
    const targetY = 0.13 + Math.sin(t.current * 0.5) * 0.07 + m.x * 0.15;
    const targetX = -0.02 + Math.sin(t.current * 0.7) * 0.02 + m.y * 0.07;
    const k = 1 - Math.pow(0.001, dt);
    g.current.rotation.y += (targetY - g.current.rotation.y) * k;
    g.current.rotation.x += (targetX - g.current.rotation.x) * k;
    g.current.rotation.z = Math.sin(t.current * 0.35) * 0.01;
    g.current.position.y = Math.sin(t.current * 0.8) * 0.05;
  });

  return (
    <group ref={g}>
      {/* Grosor del cuerpo, detras del DOM. */}
      <mesh geometry={slabGeo} position={[0, 0, -0.08]} castShadow>
        <meshStandardMaterial color={INK} roughness={0.55} metalness={0.3} />
      </mesh>

      {/* Botones laterales, pegados a la lamina. */}
      <RoundedBox args={[0.035, 0.28, 0.06]} radius={0.015} position={[-(FRAME_W / 2) * 0.985, 0.6, -0.08]}>
        <meshStandardMaterial color={INK} roughness={0.45} metalness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.035, 0.2, 0.06]} radius={0.015} position={[-(FRAME_W / 2) * 0.985, 0.26, -0.08]}>
        <meshStandardMaterial color={INK} roughness={0.45} metalness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.035, 0.34, 0.06]} radius={0.015} position={[(FRAME_W / 2) * 0.985, 0.44, -0.08]}>
        <meshStandardMaterial color={INK} roughness={0.45} metalness={0.4} />
      </RoundedBox>

      {/* Marco + pantalla: una sola pieza DOM proyectada. */}
      <Html
        transform
        distanceFactor={DF}
        position={[0, 0, 0.0]}
        zIndexRange={[30, 0]}
        style={{ pointerEvents: "none" }}
      >
        <PhoneFrame saldo={saldo} codigo={codigo} />
      </Html>
    </group>
  );
}

export default function PhoneApp({
  saldo = 28,
  codigo = "583921",
}: {
  saldo?: number;
  codigo?: string;
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
        camera={{ position: [0.5, 0.2, 7.9], fov: 30 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 5]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-3, 1, 2]} intensity={0.35} />
        <Suspense fallback={null}>
          <Phone saldo={saldo} codigo={codigo} mouse={mouse} />
        </Suspense>
        <ContactShadows position={[0, -1.95, 0]} opacity={0.28} scale={6} blur={2.6} far={3} color={INK} />
      </Canvas>
    </div>
  );
}
