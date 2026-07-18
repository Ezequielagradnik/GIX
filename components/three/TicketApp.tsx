"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { INK } from "./flip";
import { TerminalFrame, TERM_W, TICKET_WIN_H, OVERLAP } from "../TicketUI";

/* ============================================================
   POSNET 3D imprimiendo el ticket del precio.
   El frente (ticket que sale + cabezal + pantalla + teclado) es
   UNA pieza DOM proyectada con drei Html: texto nítido y sin
   desfases. El WebGL pone lo físico: cuerpo con grosor de posnet,
   botón lateral y sombra de contacto. Flota suave y sigue el
   mouse, igual que el teléfono de la demo.
   ============================================================ */

const DF = 2;
const PX = DF / 400; // px del DOM -> unidades de mundo

// Alto estimado del cuerpo de la máquina (sin la ventana del ticket).
const DEV_H = 365;
const BODY_W = TERM_W * PX;
const BODY_H = DEV_H * PX;
// El DOM completo incluye la ventana del ticket abajo: su centro no
// coincide con el centro del cuerpo; el cuerpo queda corrido arriba.
const BODY_OFF_Y = ((TICKET_WIN_H - OVERLAP) / 2) * PX;

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

function Terminal({
  printed,
  mouse,
}: {
  printed: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);

  // Cuerpo del posnet: más profundo que un teléfono (es un fierro
  // de mostrador). Apenas más chico que el frente DOM, así nunca
  // asoma por delante; aporta grosor y silueta al rotar.
  const bodyGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(
      roundedRectShape(BODY_W * 0.965, BODY_H * 0.955, 0.15),
      {
        depth: 0.26,
        bevelEnabled: true,
        bevelSize: 0.03,
        bevelThickness: 0.04,
        bevelSegments: 3,
        curveSegments: 20,
      }
    );
    geo.center();
    return geo;
  }, []);

  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05);
    if (!g.current) return;
    const m = mouse.current;
    const targetY = 0.12 + Math.sin(t.current * 0.5) * 0.06 + m.x * 0.14;
    const targetX = -0.01 + Math.sin(t.current * 0.7) * 0.015 + m.y * 0.04;
    const k = 1 - Math.pow(0.001, dt);
    g.current.rotation.y += (targetY - g.current.rotation.y) * k;
    g.current.rotation.x += (targetX - g.current.rotation.x) * k;
    g.current.rotation.z = Math.sin(t.current * 0.35) * 0.008;
    g.current.position.y = Math.sin(t.current * 0.8) * 0.035;
  });

  return (
    <group ref={g}>
      {/* Grosor del cuerpo, detrás del DOM. */}
      <mesh geometry={bodyGeo} position={[0, BODY_OFF_Y, -0.18]} castShadow>
        <meshStandardMaterial color={INK} roughness={0.55} metalness={0.3} />
      </mesh>

      {/* Botón de encendido, pegado al cuerpo. */}
      <RoundedBox
        args={[0.035, 0.3, 0.08]}
        radius={0.015}
        position={[(BODY_W / 2) * 0.985, BODY_OFF_Y + 0.4, -0.18]}
      >
        <meshStandardMaterial color={INK} roughness={0.45} metalness={0.4} />
      </RoundedBox>

      {/* Frente completo (ticket + cabezal + pantalla + teclado):
          una sola pieza DOM proyectada. */}
      <Html
        transform
        distanceFactor={DF}
        position={[0, 0, 0]}
        zIndexRange={[30, 0]}
        style={{ pointerEvents: "none" }}
      >
        <TerminalFrame mode={printed ? "play" : "waiting"} />
      </Html>
    </group>
  );
}

export default function TicketApp({ printed = false }: { printed?: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });

  return (
    <div
      className="h-full w-full"
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
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0.5, 0.15, 7.1], fov: 30 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[3, 4, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 1, 2]} intensity={0.35} />
        <Suspense fallback={null}>
          <Terminal printed={printed} mouse={mouse} />
        </Suspense>
        <ContactShadows
          position={[0, -1.85, 0]}
          opacity={0.28}
          scale={7}
          blur={2.6}
          far={3}
          color={INK}
        />
      </Canvas>
    </div>
  );
}
