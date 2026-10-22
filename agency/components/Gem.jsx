"use client";

// The Idea Pulse logo as a real-time 3D object (React Three Fiber).
// Mouse: drag to rotate (with inertia), the gem leans toward the cursor.
// Scroll: while the hero is pinned the gem spins, its glass facets split apart and come back together.
// If WebGL is unavailable the error boundary renders nothing and the static logo image stays visible.

import { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks";

const GOLD = "#f2b83c";
const TEAL = "#3ef0d8";
const WARM_WHITE = new THREE.Color("#fff4dc");
const ICE_TEAL = new THREE.Color("#63f2df");
const RADIUS = 1.35;

// three bands, like the logo: clear crystal on top, glowing teal at the bottom
const GLASS_BANDS = [
  { emissive: "#fff4dc", intensity: 0.12, opacity: 0.55 },
  { emissive: "#9ff7ea", intensity: 0.3, opacity: 0.6 },
  { emissive: "#2fe6d0", intensity: 0.7, opacity: 0.68 },
];



/**
 * procedural textures
 */

function makeCrackleTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(1, "#dfe7ee");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // soft cloudy patches
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 40 + Math.random() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(170, 190, 205, 0.35)");
    g.addColorStop(1, "rgba(170, 190, 205, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // crystal cracks
  ctx.lineCap = "round";
  for (let i = 0; i < 46; i++) {
    let x = Math.random() * size;
    let y = Math.random() * size;
    let angle = Math.random() * Math.PI * 2;
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 150, 170, 0.45)";
    ctx.lineWidth = 0.6 + Math.random() * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 8; s++) {
      angle += (Math.random() - 0.5) * 1.1;
      x += Math.cos(angle) * (10 + Math.random() * 26);
      y += Math.sin(angle) * (10 + Math.random() * 26);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255, 255, 255, 1)");
  g.addColorStop(0.25, "rgba(255, 255, 255, 0.45)");
  g.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}



/**
 * builds the geodesic gem: gold frame (bar per edge, joint per vertex) + glass facets
 */

function buildGem(goldMat) {
  const group = new THREE.Group();
  const ico = new THREE.IcosahedronGeometry(RADIUS, 1);
  const pos = ico.getAttribute("position");
  const key = (v) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
  const faces = [];
  const vertices = new Map();
  const edges = new Map();

  for (let i = 0; i < pos.count; i += 3) {
    const tri = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, i + k));
    faces.push(tri);

    for (let k = 0; k < 3; k++) {
      const a = tri[k];
      const b = tri[(k + 1) % 3];
      vertices.set(key(a), a);
      const edgeKey = [key(a), key(b)].sort().join("|");
      if (!edges.has(edgeKey)) edges.set(edgeKey, [a, b]);
    }
  }
  ico.dispose();

  const up = new THREE.Vector3(0, 1, 0);
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  const frame = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.055, 0.055, 1, 8, 1), goldMat, edges.size);
  let index = 0;
  edges.forEach(([a, b]) => {
    const dir = b.clone().sub(a);
    const length = dir.length();
    quat.setFromUnitVectors(up, dir.normalize());
    matrix.compose(a.clone().add(b).multiplyScalar(0.5), quat, scale.set(1, length, 1));
    frame.setMatrixAt(index++, matrix);
  });

  const joints = new THREE.InstancedMesh(new THREE.SphereGeometry(0.078, 14, 10), goldMat, vertices.size);
  index = 0;
  vertices.forEach((v) => {
    matrix.compose(v, quat.identity(), scale.set(1, 1, 1));
    joints.setMatrixAt(index++, matrix);
  });

  group.add(frame, joints);

  const crackle = makeCrackleTexture();
  const glassMats = GLASS_BANDS.map(
    (band) =>
      new THREE.MeshPhysicalMaterial({
        map: crackle,
        vertexColors: true,
        transparent: true,
        opacity: band.opacity,
        roughness: 0.14,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        emissive: band.emissive,
        emissiveMap: crackle,
        emissiveIntensity: band.intensity,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
  );

  const panels = faces.map((tri) => {
    const centroid = tri[0].clone().add(tri[1]).add(tri[2]).divideScalar(3);
    const local = tri.map((v) => v.clone().sub(centroid).multiplyScalar(0.9));
    const colors = [];

    tri.forEach((v) => {
      const t = THREE.MathUtils.smoothstep(v.y / RADIUS, -0.6, 0.45);
      const c = ICE_TEAL.clone().lerp(WARM_WHITE, t);
      colors.push(c.r, c.g, c.b);
    });

    const u = Math.random() * 0.5;
    const w = Math.random() * 0.5;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(local.flatMap((v) => [v.x, v.y, v.z]), 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute([u, w, u + 0.5, w, u + 0.25, w + 0.5], 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const band = centroid.y > RADIUS * 0.15 ? 0 : centroid.y > -RADIUS * 0.4 ? 1 : 2;
    const mesh = new THREE.Mesh(geo, glassMats[band]);
    mesh.renderOrder = 2;
    mesh.position.copy(centroid).multiplyScalar(0.985);
    mesh.userData = {
      base: mesh.position.clone(),
      reach: 0.25 + Math.random() * 0.55,
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      twist: (Math.random() - 0.5) * 2.4,
    };

    group.add(mesh);
    return mesh;
  });

  const dispose = () => {
    group.traverse((obj) => obj.geometry?.dispose());
    glassMats.forEach((m) => m.dispose());
    crackle.dispose();
  };

  return { group, panels, dispose };
}

const heartbeat = (t) => {
  const c = t % 1.5;
  return Math.exp(-((c - 0.1) ** 2) / 0.003) + 0.6 * Math.exp(-((c - 0.34) ** 2) / 0.003);
};



/**
 * scene graph: root (drag + lean) → gem (scroll spin) + base
 */

function Scene({ progressRef, input, reduced, onReady }) {
  const root = useRef();
  const gem = useRef();
  const core = useRef();
  const glowTeal = useRef();
  const innerLight = useRef();
  const strip = useRef();
  const state = useRef({ smooth: 0, spin: 0, ready: false });

  const goldMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.26, envMapIntensity: 1.35 }),
    []
  );
  const baseMat = useMemo(() => {
    const m = goldMat.clone();
    m.color.set("#f6c453");
    m.metalness = 0.85;
    m.roughness = 0.38;
    return m;
  }, [goldMat]);
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const built = useMemo(() => buildGem(goldMat), [goldMat]);
  const coreGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.42, 0)), []);

  useEffect(
    () => () => {
      built.dispose();
      goldMat.dispose();
      baseMat.dispose();
      glowTex.dispose();
      coreGeo.dispose();
    },
    [built, goldMat, baseMat, glowTex, coreGeo]
  );

  useFrame(({ camera, clock }, delta) => {
    const s = state.current;
    const i = input.current;
    const dt = Math.min(delta, 0.05);
    const time = clock.elapsedTime;

    s.smooth += (progressRef.current - s.smooth) * 0.08;

    // facets split apart in the middle step ("Shape") and come back for "Ship"
    const split = Math.sin(THREE.MathUtils.clamp((s.smooth - 0.12) / 0.7, 0, 1) * Math.PI);

    if (!i.dragging) {
      i.dragY += i.velocity;
      i.velocity *= 0.95;
    }

    if (!reduced) s.spin += dt * 0.18;

    root.current.rotation.y += (i.dragY + i.leanX * 0.35 - root.current.rotation.y) * 0.08;
    root.current.rotation.x += (i.dragX + i.leanY * 0.15 - root.current.rotation.x) * 0.08;

    gem.current.rotation.y = s.spin + s.smooth * Math.PI * 2.5;
    gem.current.rotation.x = 0.1 + split * 0.35;
    gem.current.position.y = 0.3 + (reduced ? 0 : Math.sin(time * 1.3) * 0.05);

    for (const panel of built.panels) {
      const { base, reach, axis, twist } = panel.userData;
      panel.position.copy(base).multiplyScalar(1 + split * reach);
      panel.quaternion.setFromAxisAngle(axis, split * twist);
    }

    const beat = reduced ? 0.4 : heartbeat(time);
    core.current.rotation.x = time * 0.6;
    core.current.rotation.y = -time * 0.9;
    core.current.scale.setScalar(1 + beat * 0.12 + split * 0.4);
    glowTeal.current.material.opacity = 0.38 + beat * 0.22 + split * 0.2 + s.smooth * 0.15;
    glowTeal.current.scale.setScalar(3.3 + beat * 0.35 + split * 0.6);
    innerLight.current.intensity = 5 + beat * 6;
    strip.current.material.color.setHSL(0.475, 0.9, 0.5 + beat * 0.1);

    // keep the whole logo (plus room for the split facets) in frame
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const distance = Math.max(4.4 / 2 / Math.tan(halfFov), 4.2 / 2 / (Math.tan(halfFov) * camera.aspect));
    camera.position.set(0, 0.35, distance - split * 0.5);
    camera.lookAt(0, 0, 0);

    if (!s.ready) {
      s.ready = true;
      onReady?.();
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#fff1d6" />
      <directionalLight position={[-4, -1, -3]} intensity={0.35} color={TEAL} />

      {/* studio reflections for the gold: warm/white only, teal would turn gold green */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff3dc" position={[0, 4, 4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffe6b8" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1} color="#fff8ee" position={[0, -4, 2]} scale={4} />
      </Environment>

      <group ref={root} position-y={-0.15}>
        <group ref={gem} position-y={0.3}>
          <primitive object={built.group} />

          <lineSegments ref={core} geometry={coreGeo}>
            <lineBasicMaterial color="#9ffcf0" transparent opacity={0.85} toneMapped={false} />
          </lineSegments>

          <sprite ref={glowTeal} scale={3.4}>
            <spriteMaterial map={glowTex} color={TEAL} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>

          <sprite scale={2.6} position-y={0.35}>
            <spriteMaterial map={glowTex} color="#ffd98c" transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>

          <pointLight ref={innerLight} color="#ffeccc" intensity={6} distance={2.6} decay={2} />
        </group>

        {/* gold base with the glowing teal edge */}
        <mesh position-y={-1.22} material={baseMat}>
          <boxGeometry args={[2.6, 0.2, 2.6]} />
        </mesh>

        <mesh ref={strip} position-y={-1.355}>
          <boxGeometry args={[2.56, 0.07, 2.56]} />
          <meshBasicMaterial color="#5ff5e1" toneMapped={false} />
        </mesh>

        <sprite scale={[3.4, 0.45, 1]} position-y={-1.5}>
          <spriteMaterial map={glowTex} color={TEAL} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>

        <pointLight color={TEAL} intensity={4} distance={2.5} decay={2} position-y={-1.75} />
      </group>
    </>
  );
}



class GemErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("3D logo unavailable, showing the static image instead.", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}



export default function Gem({ progressRef, heroRef, onReady }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const input = useRef({ dragging: false, lastX: 0, lastY: 0, dragY: 0.4, dragX: 0, velocity: 0, leanX: 0, leanY: 0 });

  // pause rendering while the hero is off screen
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => setVisible(entries[0].isIntersecting));
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [heroRef]);

  // the gem leans toward the mouse anywhere on the page
  useEffect(() => {
    const onMove = (event) => {
      if (event.pointerType !== "mouse") return;
      input.current.leanX = (event.clientX / window.innerWidth - 0.5) * 2;
      input.current.leanY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const onPointerDown = (event) => {
    const i = input.current;
    i.dragging = true;
    i.lastX = event.clientX;
    i.lastY = event.clientY;
    i.velocity = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const i = input.current;
    if (!i.dragging) return;
    i.velocity = (event.clientX - i.lastX) * 0.01;
    i.dragY += i.velocity;
    i.dragX = THREE.MathUtils.clamp(i.dragX + (event.clientY - i.lastY) * 0.006, -0.6, 0.6);
    i.lastX = event.clientX;
    i.lastY = event.clientY;
  };

  const endDrag = () => {
    input.current.dragging = false;
  };

  return (
    <GemErrorBoundary>
      <div
        className="gem-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Canvas
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
          camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0.35, 8.4] }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.15;
          }}
        >
          <Scene progressRef={progressRef} input={input} reduced={reduced} onReady={onReady} />
        </Canvas>
      </div>
    </GemErrorBoundary>
  );
}
