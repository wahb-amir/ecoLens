"use client";

import React, { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Sphere,
  Points,
  PointMaterial,
  useTexture,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";
import { animate, useScroll, useTransform } from "framer-motion";

// --- Types & Constants ---

type WasteType = "plastic" | "organic" | "hazardous";

interface WasteEvent {
  id: string;
  position: THREE.Vector3;
  type: WasteType;
  color: string;
}

const WASTE_COLORS = {
  plastic: "#06b6d4",
  organic: "#22c55e",
  hazardous: "#ef4444",
};

// --- Utility: UA checks & helpers ---

const isIOS15Safari = (() => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isiOS = /iP(hone|ad|od)/.test(navigator.platform) || /iPhone|iPad|iPod/.test(ua);
  return isiOS && /Version\/15\./.test(ua);
})();

// robust UUID fallback
function uid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      return (crypto as any).randomUUID();
    }
  } catch (e) {
    // ignore
  }
  // fallback — deterministic-ish, safe
  return "id-" + Math.random().toString(36).slice(2, 9);
}

// portable random unit vector (avoids depending on THREE.Vector3.randomDirection)
function randomUnitVector() {
  const z = 2 * Math.random() - 1; // -1..1
  const t = 2 * Math.PI * Math.random();
  const r = Math.sqrt(1 - z * z);
  return new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), z);
}

// --- Helpers ---

function createPoints(
  count: number,
  radius: number,
  varyingRadius: number = 0,
) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const effectiveRadius = radius + Math.random() * varyingRadius;
    const vertex = randomUnitVector().multiplyScalar(effectiveRadius);
    positions[i3] = vertex.x;
    positions[i3 + 1] = vertex.y;
    positions[i3 + 2] = vertex.z;
  }
  return positions;
}

// --- Components ---

function MoonContent({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  // choose safe format on older Safari
  const moonSrc = isIOS15Safari ? "/2k_moon.jpg" : "/2k_moon.avif";
  const moonTexture = useTexture(moonSrc);

  // defensive: if texture exists, set colorSpace
  if (moonTexture) {
    try {
      // three r128+ has SRGBColorSpace constant; older versions may differ — guard it
      if ((THREE as any).SRGBColorSpace !== undefined) {
        (moonTexture as any).colorSpace = (THREE as any).SRGBColorSpace;
      } else if ((moonTexture as any).isSRGBColorSpace !== undefined) {
        (moonTexture as any).colorSpace = (THREE as any).SRGBColorSpace;
      }
    } catch {
      // ignore colorSpace set failures
    }
  }

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 8]}>
      <mesh position={[2.5 * (1 / scale), 0, 0]} receiveShadow castShadow>
        <sphereGeometry args={[0.27 * (1 / scale), 32, 32]} />
        <meshStandardMaterial map={moonTexture} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

function LiveWasteBeacon({
  position,
  color,
  scale = 1,
}: {
  position: THREE.Vector3;
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const dotRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    animate(0, 1, {
      duration: 0.5,
      ease: "backOut",
      onUpdate: (v) => {
        if (dotRef.current) dotRef.current.scale.setScalar(v);
      },
    });

    const controls = animate(0, 1, {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 0.5,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ringRef.current) {
          ringRef.current.scale.setScalar(1 + v * 3);
          const mat = ringRef.current.material as THREE.MeshBasicMaterial;
          if (mat) mat.opacity = 1 - v;
        }
      },
    });
    return () => controls.stop();
  }, []);

  useFrame(() => {
    if (meshRef.current) meshRef.current.lookAt(new THREE.Vector3(0, 0, 0));
  });

  const dotRadius = 0.012 * Math.max(0.6, scale);
  const ringInner = 0.015 * Math.max(0.6, scale);
  const ringOuter = 0.02 * Math.max(0.6, scale);

  return (
    <group ref={meshRef} position={position}>
      <mesh ref={dotRef} scale={[0, 0, 0]}>
        <sphereGeometry args={[dotRadius, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringInner, ringOuter, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function WasteStream({ scale = 1 }: { scale?: number }) {
  const [events, setEvents] = useState<WasteEvent[]>([]);

  useEffect(() => {
    let mounted = true;

    const spawnWaste = () => {
      if (!mounted) return;
      try {
        const pos = randomUnitVector().multiplyScalar(1.01);
        const types: WasteType[] = ["plastic", "plastic", "organic", "hazardous"];
        const type = types[Math.floor(Math.random() * types.length)];

        const newEvent: WasteEvent = {
          id: uid(),
          position: pos,
          type: type,
          color: WASTE_COLORS[type],
        };

        setEvents((prev) => [...prev.slice(-7), newEvent]);
      } catch (err) {
        // defensive: log and continue spawning later
        // eslint-disable-next-line no-console
        console.error("spawnWaste error (safe):", err);
      } finally {
        // schedule next spawn even if we had an error
        setTimeout(spawnWaste, Math.random() * 1500 + 500);
      }
    };
    spawnWaste();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {events.map((ev) => (
        <LiveWasteBeacon
          key={ev.id}
          position={ev.position}
          color={ev.color}
          scale={scale}
        />
      ))}
    </>
  );
}

function Planet({ axialTilt }: { axialTilt: number }) {
  // choose fallback for planet texture as well
  const planetSrc = isIOS15Safari ? "/earth_atmos_2048.jpg" : "/earth_atmos_2048.avif";
  const dayTexture = useTexture(planetSrc);

  if (dayTexture) {
    try {
      if ((THREE as any).SRGBColorSpace !== undefined) {
        (dayTexture as any).flipY = false;
        (dayTexture as any).colorSpace = (THREE as any).SRGBColorSpace;
      } else {
        (dayTexture as any).flipY = false;
      }
    } catch {
      // ignore
    }
  }

  return (
    <Sphere args={[1, 64, 64]}>
      <meshStandardMaterial
        map={dayTexture || undefined}
        metalness={0.1}
        roughness={0.7}
      />
    </Sphere>
  );
}

// --- MAIN EXPORT ---

export function Globe() {
  const meshRef = useRef<THREE.Group>(null!);
  const { scrollYProgress } = useScroll();
  const xParallax = useTransform(scrollYProgress, [0, 0.4], [0.1, -0.4]);

  const { size, gl, camera } = useThree();

  const scale = useMemo(() => {
    const w = size.width;
    const maxW = 500;
    const minW = 320;
    const minScale = 0.78;
    if (w >= maxW) return 1;
    if (w <= minW) return minScale;
    const t = (w - minW) / (maxW - minScale * 0 + (maxW - minW)); // linear interp (safe)
    return minScale + t * (1 - minScale);
  }, [size.width]);

  useEffect(() => {
    const DPR = Math.min(
      (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1,
      size.width <= 420 ? 1.0 : 1.5,
    );
    gl.setPixelRatio(DPR);
    const baseZ = 3;
    camera.position.set(0, 0, baseZ * (1 / scale));
  }, [gl, size.width, scale, camera]);

  const pointDensity = useMemo(() => {
    if (size.width <= 420) return 0.12;
    if (size.width <= 768) return 0.5;
    return 1;
  }, [size.width]);

  const plasticPoints = useMemo(
    () => createPoints(Math.max(80, Math.round(400 * pointDensity)), 1.005),
    [pointDensity],
  );
  const organicPoints = useMemo(
    () => createPoints(Math.max(40, Math.round(200 * pointDensity)), 1.005),
    [pointDensity],
  );

  const pointSize = 0.008 * (1 + (1 - scale) * 1.2);

  const axialTilt = (23.44 * Math.PI) / 180;
  const dirLightPos = useMemo(() => [-8, 2, 4] as const, []);

  const frameCount = useRef(0);
  useEffect(() => {
    if (typeof document !== "undefined") {
      const orig = document.documentElement.style.overflowY;
      document.documentElement.style.overflowY = "hidden";
      return () => {
        document.documentElement.style.overflowY = orig ?? "";
      };
    }
  }, []);

  useFrame((state, delta) => {
    if (frameCount.current < 2) {
      frameCount.current += 1;
      if (frameCount.current === 2 && typeof document !== "undefined") {
        document.documentElement.style.overflowY = "";
      }
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      try {
        meshRef.current.rotation.x =
          xParallax?.get && typeof xParallax.get === "function"
            ? (xParallax.get() as number)
            : meshRef.current.rotation.x;
      } catch (e) {
        // ignore — avoid render crash
      }
    }
  });

  return (
    <group scale={[scale, scale, scale]}>
      <Stars
        radius={100}
        depth={50}
        count={size.width <= 420 ? 1000 : 5000}
        factor={size.width <= 420 ? 2 : 4}
        saturation={0}
        fade
        speed={1}
      />
      <ambientLight intensity={0.03} />
      <directionalLight
        position={dirLightPos}
        intensity={size.width <= 420 ? 1.2 : 2.0}
      />

      <Suspense fallback={null}>
        <MoonContent scale={scale} />
      </Suspense>

      <group rotation={[axialTilt, 0, 0]}>
        <group ref={meshRef}>
          <group rotation={[0, 0, 0]}>
            <Suspense
              fallback={
                <Sphere args={[1, 32, 32]}>
                  <meshStandardMaterial color="#071426" />
                </Sphere>
              }
            >
              <Planet axialTilt={axialTilt} />
            </Suspense>
          </group>

          <Points positions={plasticPoints} stride={3} frustumCulled={false}>
            <PointMaterial
              transparent
              color={WASTE_COLORS.plastic}
              size={pointSize}
              sizeAttenuation
              opacity={0.6}
              depthWrite={false}
            />
          </Points>
          <Points positions={organicPoints} stride={3} frustumCulled={false}>
            <PointMaterial
              transparent
              color={WASTE_COLORS.organic}
              size={pointSize}
              sizeAttenuation
              opacity={0.6}
              depthWrite={false}
            />
          </Points>

          <WasteStream scale={scale} />
        </group>
      </group>
    </group>
  );
}
