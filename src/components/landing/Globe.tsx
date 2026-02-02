'use client'
import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Points, PointMaterial, useTexture, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { animate, useScroll, useTransform } from 'framer-motion'

// --- Types & Constants ---

type WasteType = 'plastic' | 'organic' | 'hazardous';

interface WasteEvent {
  id: number;
  position: THREE.Vector3;
  type: WasteType;
  color: string;
}

const WASTE_COLORS = {
  plastic: '#06b6d4',
  organic: '#22c55e',
  hazardous: '#ef4444'
};

// --- Helpers ---

function createPoints(count: number, radius: number, varyingRadius: number = 0) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const effectiveRadius = radius + Math.random() * varyingRadius;
    const vertex = new THREE.Vector3()
      .randomDirection()
      .multiplyScalar(effectiveRadius);
    positions[i3] = vertex.x;
    positions[i3 + 1] = vertex.y;
    positions[i3 + 2] = vertex.z;
  }
  return positions;
}

// --- Components ---

function MoonContent() {
  const groupRef = useRef<THREE.Group>(null!)
  const moonTexture = useTexture('/2k_moon.avif')

  if (moonTexture) {
    moonTexture.colorSpace = THREE.SRGBColorSpace;
  }

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  })

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 8]}>
      <mesh position={[2.5, 0, 0]} receiveShadow castShadow>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshStandardMaterial
          map={moonTexture}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

function LiveWasteBeacon({ position, color }: { position: THREE.Vector3, color: string }) {
  const meshRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const dotRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    animate(0, 1, {
      duration: 0.5,
      ease: 'backOut',
      onUpdate: (v) => { if (dotRef.current) dotRef.current.scale.setScalar(v); }
    });

    const controls = animate(0, 1, {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 0.5,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ringRef.current) {
          ringRef.current.scale.setScalar(1 + (v * 3));
          const mat = ringRef.current.material as THREE.MeshBasicMaterial;
          mat.opacity = 1 - v;
        }
      }
    });
    return () => controls.stop();
  }, []);

  useFrame(() => {
    if (meshRef.current) meshRef.current.lookAt(new THREE.Vector3(0,0,0));
  });

  return (
    <group ref={meshRef} position={position}>
      <mesh ref={dotRef} scale={[0,0,0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.015, 0.02, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

function WasteStream() {
  const [events, setEvents] = useState<WasteEvent[]>([]);

  useEffect(() => {
    let idCounter = 0;
    let mounted = true;

    const spawnWaste = () => {
      if (!mounted) return;
      const pos = new THREE.Vector3().randomDirection().multiplyScalar(1.01);
      const types: WasteType[] = ['plastic', 'plastic', 'organic', 'hazardous'];
      const type = types[Math.floor(Math.random() * types.length)];

      const newEvent: WasteEvent = {
        id: idCounter++,
        position: pos,
        type: type,
        color: WASTE_COLORS[type]
      };

      setEvents(prev => [...prev.slice(-7), newEvent]);
      setTimeout(spawnWaste, Math.random() * 1500 + 500);
    };
    spawnWaste();

    return () => { mounted = false; }
  }, []);

  return (
    <>
      {events.map(ev => (
        <LiveWasteBeacon key={ev.id} position={ev.position} color={ev.color} />
      ))}
    </>
  )
}

function Planet({ axialTilt }: { axialTilt: number }) {
  const dayTexture = useTexture('/earth_atmos_2048.avif');

  if (dayTexture) {
    dayTexture.flipY = false;
    dayTexture.colorSpace = THREE.SRGBColorSpace;
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
  const meshRef = useRef<THREE.Group>(null!)
  const { scrollYProgress } = useScroll()
  const xParallax = useTransform(scrollYProgress, [0, 0.4], [0.1, -0.4])

  const plasticPoints = useMemo(() => createPoints(400, 1.005), []);
  const organicPoints = useMemo(() => createPoints(200, 1.005), []);

  const axialTilt = (23.44 * Math.PI) / 180;
  const dirLightPos = useMemo(() => [-8, 2, 4] as const, []);

  // --- Prevent transient scrollbar flash:
  // On mount, hide vertical scroll until the scene renders a couple frames,
  // then restore overflow so the page can scroll normally.
  const frameCount = useRef(0);
  useEffect(() => {
    // Only run in the browser
    if (typeof document !== 'undefined') {
      // store original value so we can restore reliably
      const orig = document.documentElement.style.overflowY;
      document.documentElement.style.overflowY = 'hidden';
      return () => {
        document.documentElement.style.overflowY = orig ?? '';
      }
    }
  }, []);

  useFrame((state, delta) => {
    // restore after 2 rendered frames
    if (frameCount.current < 2) {
      frameCount.current += 1;
      if (frameCount.current === 2 && typeof document !== 'undefined') {
        document.documentElement.style.overflowY = '';
      }
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      try {
        // xParallax is a MotionValue; get() can throw if not ready, guard it
        meshRef.current.rotation.x = (xParallax?.get && typeof xParallax.get === 'function') ? xParallax.get() as number : meshRef.current.rotation.x;
      } catch (e) {
        // ignore — we only want to avoid a render crash
      }
    }
  })

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.03} />
      <directionalLight position={dirLightPos} intensity={2.0} />

      <Suspense fallback={null}>
        <MoonContent />
      </Suspense>

      <group rotation={[axialTilt, 0, 0]}>
        <group ref={meshRef}>
          <group rotation={[0, 0, 0]}>
            <Suspense fallback={<Sphere args={[1, 32, 32]}><meshStandardMaterial color="#071426" /></Sphere>}>
              <Planet axialTilt={axialTilt} />
            </Suspense>
          </group>

          <Points positions={plasticPoints} stride={3} frustumCulled={false}>
            <PointMaterial transparent color={WASTE_COLORS.plastic} size={0.008} sizeAttenuation opacity={0.6} depthWrite={false} />
          </Points>
          <Points positions={organicPoints} stride={3} frustumCulled={false}>
            <PointMaterial transparent color={WASTE_COLORS.organic} size={0.008} sizeAttenuation opacity={0.6} depthWrite={false} />
          </Points>

          <WasteStream />
        </group>
      </group>
    </group>
  )
}
