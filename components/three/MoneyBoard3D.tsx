"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { glyphTexture, INK, HOUSING, STAMP, CHROME } from "./flip";

/* ============================================================
   TABLERO DE LA PLATA 3D (§ 03 · paso 3).
   Split-flap de verdad: cada dígito es una ficha física que gira
   cuando cambia. La plata entra mes a mes ($875.000 por mes) y el
   tablero cascadea flips hasta $10.500.000, mientras abajo los 12
   meses se dan vuelta de chrome a rojo, uno por uno. Al llegar,
   respira y todo vuelve a girar a cero para contar de nuevo.
   Flota y sigue el mouse, como el resto de las escenas.
   ============================================================ */

const DIGITS = 8;
const MONTH_STEP = 875_000; // 12 x 875.000 = 10.500.000
const MONTHS = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

/* Cámara que encuadra el ancho del tablero en cualquier aspecto. */
function FitCamera({ halfWidth = 3.7, fov = 26, baseZ = 5 }) {
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

/* Ficha que gira entre caracteres (dígitos o blanco). Mismo
   mecanismo que FlipCard del hero, pero por carácter. */
function CharFlip({
  ch,
  x,
  y = 0,
  w = 0.55,
  h = 0.8,
  depth = 0.12,
}: {
  ch: string;
  x: number;
  y?: number;
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
  const shown = useRef(ch);
  const ratio = h / w;

  const texs = useMemo(() => {
    const m = new Map<
      string,
      { n: THREE.CanvasTexture; f: THREE.CanvasTexture }
    >();
    for (const c of " 0123456789") {
      m.set(c, {
        n: glyphTexture(c.trim(), { ratio }),
        f: glyphTexture(c.trim(), { flip: true, ratio }),
      });
    }
    return m;
  }, [ratio]);

  useEffect(() => {
    if (frontMat.current) {
      frontMat.current.map = texs.get(ch)?.n ?? null;
      frontMat.current.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ch === shown.current) return;
    shown.current = ch;
    if (frontShowing.current) {
      if (backMat.current) {
        backMat.current.map = texs.get(ch)?.f ?? null;
        backMat.current.needsUpdate = true;
      }
    } else {
      if (frontMat.current) {
        frontMat.current.map = texs.get(ch)?.n ?? null;
        frontMat.current.needsUpdate = true;
      }
    }
    frontShowing.current = !frontShowing.current;
    target.current += Math.PI;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch]);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0009, Math.min(dt, 0.05));
    rot.current += (target.current - rot.current) * k;
    if (flip.current) flip.current.rotation.x = rot.current;
  });

  return (
    <group position={[x, y, 0]}>
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
      {/* la ranura */}
      <mesh position={[0, 0, depth / 2 + 0.012]}>
        <boxGeometry args={[w * 0.98, 0.016, 0.012]} />
        <meshStandardMaterial color="#0c0e0e" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* Ficha de mes: chrome de frente, roja al darse vuelta (sellada). */
function MonthFlip({
  label,
  x,
  y,
  flipped,
}: {
  label: string;
  x: number;
  y: number;
  flipped: boolean;
}) {
  const flip = useRef<THREE.Group>(null);
  const rot = useRef(0);
  const w = 0.46;
  const h = 0.3;
  const ratio = h / w;

  const texFront = useMemo(
    () => glyphTexture(label, { fg: CHROME, ratio, px: 88, spacing: 4 }),
    [label, ratio]
  );
  const texBack = useMemo(
    () => glyphTexture(label, { fg: STAMP, flip: true, ratio, px: 88, spacing: 4 }),
    [label, ratio]
  );

  useFrame((_, dt) => {
    const target = flipped ? Math.PI : 0;
    const k = 1 - Math.pow(0.002, Math.min(dt, 0.05));
    rot.current += (target - rot.current) * k;
    if (flip.current) flip.current.rotation.x = rot.current;
  });

  return (
    <group position={[x, y, 0]}>
      <group ref={flip}>
        <mesh castShadow>
          <boxGeometry args={[w, h, 0.07]} />
          <meshStandardMaterial attach="material-0" color={INK} roughness={0.9} />
          <meshStandardMaterial attach="material-1" color={INK} roughness={0.9} />
          <meshStandardMaterial attach="material-2" color={INK} roughness={0.9} />
          <meshStandardMaterial attach="material-3" color={INK} roughness={0.9} />
          <meshBasicMaterial attach="material-4" map={texFront} toneMapped={false} />
          <meshBasicMaterial attach="material-5" map={texBack} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* Tile estático (el "$" y el rótulo AÑO). */
function StaticTile({
  text,
  x,
  y = 0,
  w = 0.5,
  h = 0.8,
  fg = CHROME,
  px,
}: {
  text: string;
  x: number;
  y?: number;
  w?: number;
  h?: number;
  fg?: string;
  px?: number;
}) {
  const tex = useMemo(
    () => glyphTexture(text, { fg, ratio: h / w, px }),
    [text, fg, h, w, px]
  );
  return (
    <mesh position={[x, y, 0]} castShadow>
      <boxGeometry args={[w, h, 0.12]} />
      <meshStandardMaterial attach="material-0" color={INK} roughness={0.9} />
      <meshStandardMaterial attach="material-1" color={INK} roughness={0.9} />
      <meshStandardMaterial attach="material-2" color={INK} roughness={0.9} />
      <meshStandardMaterial attach="material-3" color={INK} roughness={0.9} />
      <meshBasicMaterial attach="material-4" map={tex} toneMapped={false} />
      <meshStandardMaterial attach="material-5" color={INK} roughness={0.9} />
    </mesh>
  );
}

function Board({
  chars,
  month,
  mouse,
}: {
  chars: string[];
  month: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);

  // Posiciones de los dígitos, con respiro entre grupos de miles.
  const xs = useMemo(() => {
    const arr: number[] = [];
    let x = 0;
    for (let i = 0; i < DIGITS; i++) {
      arr.push(x);
      x += 0.62;
      if (i === 1 || i === 4) x += 0.16; // 10 | 500 | 000
    }
    const width = x - 0.07;
    return { arr: arr.map((v) => v - width / 2 + 0.35), width };
  }, []);

  const monthXs = useMemo(() => {
    const total = 12 * 0.52 - 0.06;
    return MONTHS.map((_, i) => i * 0.52 - total / 2 + 0.23);
  }, []);

  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05);
    if (!g.current) return;
    const m = mouse.current;
    const targetY = Math.sin(t.current * 0.45) * 0.05 + m.x * 0.16;
    const targetX = Math.sin(t.current * 0.7) * 0.012 + m.y * 0.05;
    const k = 1 - Math.pow(0.001, dt);
    g.current.rotation.y += (targetY - g.current.rotation.y) * k;
    g.current.rotation.x += (targetX - g.current.rotation.x) * k;
    g.current.position.y = Math.sin(t.current * 0.8) * 0.03;
  });

  return (
    <group ref={g}>
      {/* Carcasa del tablero */}
      <RoundedBox
        args={[xs.width + 1.55, 1.24, 0.14]}
        radius={0.07}
        smoothness={4}
        position={[0, 0.42, -0.17]}
        receiveShadow
      >
        <meshStandardMaterial color={HOUSING} roughness={1} metalness={0} />
      </RoundedBox>

      {/* $ + dígitos que giran */}
      <StaticTile text="$" x={xs.arr[0] - 0.68} y={0.42} fg={STAMP} px={120} />
      {chars.map((ch, i) => (
        <CharFlip key={i} ch={ch} x={xs.arr[i]} y={0.42} />
      ))}

      {/* Riel de los 12 meses */}
      <RoundedBox
        args={[12 * 0.52 + 0.28, 0.52, 0.1]}
        radius={0.05}
        smoothness={4}
        position={[0, -0.62, -0.14]}
        receiveShadow
      >
        <meshStandardMaterial color={HOUSING} roughness={1} metalness={0} />
      </RoundedBox>
      {MONTHS.map((m, i) => (
        <MonthFlip key={m} label={m} x={monthXs[i]} y={-0.62} flipped={month >= i + 1} />
      ))}
    </group>
  );
}

export default function MoneyBoard3D({ playing = true }: { playing?: boolean }) {
  const [month, setMonth] = useState(0);
  const mouse = useRef({ x: 0, y: 0 });

  /* El año contando en loop: un mes cada ~270 ms, pausa al llegar
     a los 12, vuelta a cero (todo gira de vuelta) y de nuevo. */
  useEffect(() => {
    if (!playing) return;
    let alive = true;
    let id: number;
    let m = 0;
    setMonth(0);
    const tick = () => {
      if (!alive) return;
      if (m < 12) {
        m += 1;
        setMonth(m);
        id = window.setTimeout(tick, m === 12 ? 2000 : 270);
      } else {
        m = 0;
        setMonth(0);
        id = window.setTimeout(tick, 800);
      }
    };
    id = window.setTimeout(tick, 450);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [playing]);

  const value = month * MONTH_STEP;
  const chars = String(value === 0 ? 0 : value)
    .padStart(DIGITS, " ")
    .split("");

  return (
    <div
      className="h-full w-full"
      role="img"
      aria-label="Tablero mecánico: $10.500.000 acumulados en 12 meses, cobrados el 1 de cada mes"
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
        camera={{ position: [0, 0.1, 5], fov: 26 }}
      >
        <FitCamera />
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[3, 4, 5]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 2, 2]} intensity={0.4} />
        <Suspense fallback={null}>
          <Board chars={chars} month={month} mouse={mouse} />
        </Suspense>
        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.3}
          scale={9}
          blur={2.4}
          far={2}
          color={INK}
        />
      </Canvas>
    </div>
  );
}
