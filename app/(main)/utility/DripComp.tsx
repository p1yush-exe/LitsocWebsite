"use client";

/**
 * DripComp — reusable ripple/drip WebGL wrapper.
 *
 * <DripComp className="w-full h-64">           wrap children
 * <DripComp src="/hero.jpg" className="..." />  image src (no html2canvas)
 * <DripComp ready={animReady} snapshotDelay={140}>…</DripComp>
 * <DripComp strength={0.5} gridSize={80} idleSpeed={0.01}>…</DripComp>
 */

import * as THREE from "three";
import { useEffect, useRef, ReactNode, CSSProperties } from "react";

export interface DripCompProps {
  children?:      ReactNode;
  className?:     string;
  style?:         CSSProperties;
  src?:           string;
  gridSize?:      number;
  strength?:      number;
  idleSpeed?:     number;
  fps?:           number;
  ready?:         boolean;
  snapshotDelay?: number;
}

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const fragmentShader = /* glsl */`
  varying vec2 vUv;
  uniform sampler2D u_texture;
  uniform vec2  u_mouse;
  uniform vec2  u_prevMouse;
  uniform float u_grid;
  uniform float u_strength;
  void main() {
    vec2 gridUV = floor(vUv * u_grid) / u_grid;
    vec2 center = gridUV + vec2(1.0 / u_grid);
    vec2 dir    = u_mouse - u_prevMouse;
    float dist  = length(center - u_mouse);
    float s     = smoothstep(0.3, 0.0, dist);
    gl_FragColor = texture2D(u_texture, vUv - s * -dir * u_strength);
  }
`;

function textureFromImage(imgSrc: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { const t = new THREE.Texture(img); t.needsUpdate = true; resolve(t); };
    img.onerror = reject;
    img.src = imgSrc;
  });
}

async function textureFromDOM(
  wrapper:   HTMLDivElement,
  container: HTMLDivElement,
): Promise<THREE.Texture> {
  await document.fonts.ready;
  const { default: html2canvas } = await import("html2canvas");

  // Size the snapshot to the OVERLAY div (container), not the wrapper.
  // The wrapper may have padding/transforms that differ from the visible area.
  // The overlay is already position:absolute inset:0, so its offsetWidth/Height
  // is exactly the visible rendered area we want to capture.
  const w = container.offsetWidth;
  const h = container.offsetHeight;

  // We need to capture the wrapper's content at the same rect as the container.
  // Use x/y to tell html2canvas where inside the wrapper to start reading.
  const wrapperRect    = wrapper.getBoundingClientRect();
  const containerRect  = container.getBoundingClientRect();
  const offsetX = containerRect.left - wrapperRect.left;
  const offsetY = containerRect.top  - wrapperRect.top;

  const offscreen = await html2canvas(wrapper, {
    useCORS:         true,
    allowTaint:      true,
    backgroundColor: null,
    scale:           1,
    width:           w,
    height:          h,
    windowWidth:     window.innerWidth,
    windowHeight:    window.innerHeight,
    // x/y tell html2canvas which part of the element to render.
    // This accounts for any offset between wrapper origin and overlay origin.
    x:               offsetX,
    y:               offsetY,
    scrollX:         -window.scrollX,
    scrollY:         -window.scrollY,
    logging:         false,
    ignoreElements:  (el) => el === container,

    onclone: (_doc, clonedWrapper) => {
      const view = wrapper.ownerDocument.defaultView;
      if (!view) return;

      const liveEls  = [wrapper,       ...Array.from(wrapper.querySelectorAll<HTMLElement>("*"))];
      const cloneEls = [clonedWrapper, ...Array.from(clonedWrapper.querySelectorAll<HTMLElement>("*"))];

      liveEls.forEach((liveEl, i) => {
        const cloneEl = cloneEls[i];
        if (!cloneEl) return;
        const cs = view.getComputedStyle(liveEl);

        cloneEl.style.fontFamily    = cs.fontFamily;
        cloneEl.style.fontSize      = cs.fontSize;
        cloneEl.style.fontWeight    = cs.fontWeight;
        cloneEl.style.fontStyle     = cs.fontStyle;
        cloneEl.style.letterSpacing = cs.letterSpacing;
        cloneEl.style.lineHeight    = cs.lineHeight;
        cloneEl.style.textTransform = cs.textTransform;

        // Masks — resolve CSS variables before stamping onto clone.
        // The clone document doesn't inherit :root custom properties from the
        // live page, so var(--ghost-text-start) etc. would be unresolved.
        const resolveCSSVars = (val: string) =>
          val.replace(/var\((--[^,)]+)(?:,\s*([^)]*))?\)/g, (_, name, fallback) => {
            const resolved = getComputedStyle(document.documentElement)
              .getPropertyValue(name).trim();
            return resolved || (fallback?.trim() ?? "transparent");
          });
        const wm = cs.getPropertyValue("-webkit-mask-image");
        const m  = cs.getPropertyValue("mask-image");
        if (wm) cloneEl.style.setProperty("-webkit-mask-image", resolveCSSVars(wm));
        if (m)  cloneEl.style.setProperty("mask-image", resolveCSSVars(m));

        // Gradient text: background-clip:text + color:transparent
        // html2canvas can't composite this. We draw the gradient onto a canvas
        // and use it as a background-image data URI instead.
        const clip = cs.getPropertyValue("-webkit-background-clip") || cs.backgroundClip;
        const isTransparent = cs.color === "rgba(0, 0, 0, 0)";
        const bgImg = cs.backgroundImage;
        const isGrad = bgImg.startsWith("linear-gradient") || bgImg.startsWith("radial-gradient");

        if (clip === "text" && isTransparent && isGrad) {
          // html2canvas can't do background-clip:text. Strip it entirely and
          // fall back to a solid color sampled from the gradient's mid-stop.
          // This avoids the "gradient rectangle behind text" artifact that
          // occurred when we used a background-image data-URI approach.
          const stops: string[] = [];
          const re = /rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*[\d.]+)?\s*\)/g;
          let m2: RegExpExecArray | null;
          while ((m2 = re.exec(bgImg)) !== null) stops.push(m2[0]);

          cloneEl.style.setProperty("-webkit-background-clip", "unset");
          cloneEl.style.setProperty("-webkit-text-fill-color", "unset");
          cloneEl.style.backgroundClip  = "unset";
          cloneEl.style.backgroundImage = "none";
          cloneEl.style.color = stops[Math.floor(stops.length / 2)] ?? "rgb(102,60,41)";
        } else {
          cloneEl.style.color = cs.color;
        }
      });
    },
  });

  const tex = new THREE.CanvasTexture(offscreen);
  tex.needsUpdate = true;
  return tex;
}

export default function DripComp({
  children,
  className     = "",
  style,
  src,
  gridSize,
  strength      = 0.3,
  idleSpeed     = 0.02,
  fps           = 30,
  ready         = true,
  snapshotDelay = 120,
}: DripCompProps) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLDivElement>(null);
  const bootedRef   = useRef(false);

  const threeRef = useRef<{
    scene: THREE.Scene; camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer; mesh: THREE.Mesh;
    afId: number; lastFrame: number; frameBudget: number;
    paused: boolean; idleTimer: ReturnType<typeof setTimeout> | null;
    isInteracting: boolean; ease: number; idleAngle: number;
    mouse: { x: number; y: number }; target: { x: number; y: number }; prev: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const container = canvasRef.current!;
    const wrapper   = wrapperRef.current!;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function animate(now: number) {
      const t = threeRef.current; if (!t) return;
      t.afId = requestAnimationFrame(animate);
      if (t.paused || now - t.lastFrame < t.frameBudget) return;
      t.lastFrame = now;
      t.mouse.x += (t.target.x - t.mouse.x) * t.ease;
      t.mouse.y += (t.target.y - t.mouse.y) * t.ease;
      const mat = t.mesh.material as THREE.ShaderMaterial;
      mat.uniforms.u_mouse.value.set(    t.mouse.x, 1 - t.mouse.y);
      mat.uniforms.u_prevMouse.value.set(t.prev.x,  1 - t.prev.y);
      if (!t.isInteracting) {
        t.idleAngle += idleSpeed;
        t.target.x = 0.5 + Math.cos(t.idleAngle)     * 0.28;
        t.target.y = 0.5 + Math.sin(t.idleAngle * 2) * 0.18;
      }
      t.renderer.render(t.scene, t.camera);
      t.prev = { ...t.mouse };
    }

    function initThree(texture: THREE.Texture) {
      // Size to container (the overlay div), not wrapper.
      // Container is position:absolute inset:0 so it matches the visible area exactly.
      const w      = container.offsetWidth;
      const h      = container.offsetHeight;
      const aspect = w / h || 1;

      const scene  = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1/aspect, -1/aspect, 0.1, 1000);
      camera.position.z = 1;

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
          uniforms: {
            u_mouse:     { value: new THREE.Vector2(0.5, 0.5) },
            u_prevMouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_texture:   { value: texture },
            u_grid:      { value: gridSize ?? (window.innerWidth < 768 ? 40 : 70) },
            u_strength:  { value: strength },
          },
          vertexShader, fragmentShader,
        }),
      );
      scene.add(mesh);

      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(1);
      renderer.setSize(w, h);

      const el = renderer.domElement;
      el.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";

      container.innerHTML = "";
      container.appendChild(el);
      container.style.opacity = "1";
      if (childrenRef.current) childrenRef.current.style.visibility = "hidden";

      threeRef.current = {
        scene, camera, renderer, mesh,
        afId: 0, lastFrame: 0, frameBudget: 1000 / fps,
        paused: false, idleTimer: null, isInteracting: false,
        ease: 0.2, idleAngle: 0,
        mouse: { x: 0.5, y: 0.5 }, target: { x: 0.5, y: 0.5 }, prev: { x: 0.5, y: 0.5 },
      };
      requestAnimationFrame(animate);
    }

    const rel = (cx: number, cy: number) => {
      const r = container.getBoundingClientRect();
      return { x: (cx - r.left) / r.width, y: (cy - r.top) / r.height };
    };
    const scheduleIdle = () => {
      const t = threeRef.current; if (!t) return;
      t.isInteracting = true;
      if (t.idleTimer) clearTimeout(t.idleTimer);
      t.idleTimer = setTimeout(() => {
        const t2 = threeRef.current; if (!t2) return;
        t2.isInteracting = false; t2.ease = 0.35;
        t2.idleAngle = Math.atan2(t2.target.y - 0.5, t2.target.x - 0.5);
      }, 200);
    };
    const onEnter = (e: MouseEvent) => {
      const t = threeRef.current; if (!t) return;
      t.ease = 0.2; const p = rel(e.clientX, e.clientY);
      t.mouse.x = t.target.x = p.x; t.mouse.y = t.target.y = p.y; scheduleIdle();
    };
    const onMove = (e: MouseEvent) => {
      const t = threeRef.current; if (!t) return;
      t.ease = 0.4; const p = rel(e.clientX, e.clientY);
      t.prev = { ...t.target };
      t.mouse.x = t.target.x = p.x; t.mouse.y = t.target.y = p.y; scheduleIdle();
    };
    const onLeave = () => {
      const t = threeRef.current; if (!t) return;
      if (t.idleTimer) clearTimeout(t.idleTimer);
      t.isInteracting = false; t.ease = 0.2;
      t.idleAngle = Math.atan2(t.target.y - 0.5, t.target.x - 0.5);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = threeRef.current; if (!t) return;
      const p = rel(e.touches[0].clientX, e.touches[0].clientY);
      t.mouse.x = t.target.x = p.x; t.mouse.y = t.target.y = p.y; scheduleIdle();
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = threeRef.current; if (!t) return;
      const p = rel(e.touches[0].clientX, e.touches[0].clientY);
      t.prev = { ...t.target };
      t.mouse.x = t.target.x = p.x; t.mouse.y = t.target.y = p.y; scheduleIdle();
    };
    const onTouchEnd = () => {
      const t = threeRef.current; if (!t) return;
      t.prev = { x: t.target.x + 0.001, y: t.target.y + 0.001 };
    };
    const onVisibility = () => { if (threeRef.current) threeRef.current.paused = document.hidden; };
    const onResize = () => {
      const t = threeRef.current; if (!t) return;
      const w = container.offsetWidth; const h = container.offsetHeight;
      const aspect = w / h || 1;
      t.camera.top = 1/aspect; t.camera.bottom = -1/aspect;
      t.camera.updateProjectionMatrix();
      t.renderer.setSize(w, h);
      if (!gridSize)
        (t.mesh.material as THREE.ShaderMaterial).uniforms.u_grid.value =
          window.innerWidth < 768 ? 40 : 70;
      const build = src ? textureFromImage(src) : textureFromDOM(wrapper, container);
      build.then(tex => { (t.mesh.material as THREE.ShaderMaterial).uniforms.u_texture.value = tex; });
    };

    const observer = new IntersectionObserver(
      ([e]) => { if (threeRef.current) threeRef.current.paused = !e.isIntersecting; },
      { threshold: 0 },
    );
    observer.observe(wrapper);

    (wrapper as HTMLDivElement & { __dripBoot?: () => void }).__dripBoot = () => {
      if (bootedRef.current) return;
      bootedRef.current = true;
      const build = src ? textureFromImage(src) : textureFromDOM(wrapper, container);
      build.then(initThree).catch(console.error);
    };

    container.addEventListener("mouseenter",      onEnter);
    container.addEventListener("mousemove",       onMove);
    container.addEventListener("mouseleave",      onLeave);
    container.addEventListener("touchstart",      onTouchStart, { passive: true });
    container.addEventListener("touchmove",       onTouchMove,  { passive: true });
    container.addEventListener("touchend",        onTouchEnd);
    window.addEventListener("resize",             onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      const t = threeRef.current;
      if (t) {
        cancelAnimationFrame(t.afId);
        if (t.idleTimer) clearTimeout(t.idleTimer);
        t.mesh.geometry.dispose();
        (t.mesh.material as THREE.Material).dispose();
        t.renderer.dispose();
        threeRef.current = null;
      }
      container.removeEventListener("mouseenter",      onEnter);
      container.removeEventListener("mousemove",       onMove);
      container.removeEventListener("mouseleave",      onLeave);
      container.removeEventListener("touchstart",      onTouchStart);
      container.removeEventListener("touchmove",       onTouchMove);
      container.removeEventListener("touchend",        onTouchEnd);
      window.removeEventListener("resize",             onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const wrapper = wrapperRef.current; if (!wrapper) return;
    const id = setTimeout(
      () => (wrapper as HTMLDivElement & { __dripBoot?: () => void }).__dripBoot?.(),
      snapshotDelay,
    );
    return () => clearTimeout(id);
  }, [ready, snapshotDelay]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`} style={style}>
      <div ref={childrenRef} style={{ display: "contents" }}>
        {src
          ? <img src={src} alt="" aria-hidden style={{ display:"block", width:"100%", height:"100%", objectFit:"cover" }} />
          : children
        }
      </div>
      <div
        ref={canvasRef}
        style={{ position:"absolute", inset:0, opacity:0, transition:"opacity 0.4s ease", overflow:"hidden", pointerEvents:"auto" }}
      />
    </div>
  );
}