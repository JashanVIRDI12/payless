"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";
import { onScrollVelocity, registerGsap } from "@/lib/motion";

const VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

/*
 * Everything here is driven by two things: a slow clock and scroll velocity.
 * There is no geometry and no model — it is one full-screen triangle sampling
 * the hero photograph, which is why the whole layer costs a few kilobytes.
 */
const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D tMap;
  uniform vec2 uCover;
  uniform float uTime;
  uniform float uVel;
  uniform float uFade;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    // Replicate object-fit: cover so the canvas lines up with the <img>
    // underneath it and the hand-off is invisible.
    vec2 uv = (vUv - 0.5) * uCover + 0.5;

    // Weather. A slow drift so the frame is never quite still — this is what
    // stops it reading as a photograph with an effect bolted on.
    float n = noise(uv * 2.6 + uTime * 0.025);
    vec2 disp = vec2(n - 0.5) * 0.0045;

    // Scroll velocity smears vertically, strongest through the middle band.
    float falloff = 1.0 - abs(uv.y - 0.5) * 1.3;
    disp.y += uVel * 0.026 * falloff;

    // Chromatic split only appears when the page is actually moving fast.
    float ca = abs(uVel) * 0.0045;
    vec3 col;
    col.r = texture2D(tMap, uv + disp + vec2(ca, 0.0)).r;
    col.g = texture2D(tMap, uv + disp).g;
    col.b = texture2D(tMap, uv + disp - vec2(ca, 0.0)).b;

    // Fine grain, tied to the clock so it shimmers rather than sits still.
    float grain = hash(gl_FragCoord.xy * 0.7 + uTime * 60.0) - 0.5;
    col += grain * 0.022;

    gl_FragColor = vec4(col, uFade);
  }
`;

export default function HeroShader({
  imgRef,
  onReady,
}: {
  imgRef: RefObject<HTMLImageElement | null>;
  onReady?: () => void;
}) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const mount = holder.current;
    if (!img || !mount) return;

    registerGsap();

    let renderer: Renderer | null = null;
    let stopVelocity: (() => void) | null = null;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let disposed = false;

    const start = () => {
      if (disposed) return;

      try {
        renderer = new Renderer({
          alpha: true,
          antialias: false,
          // Capped: a full-screen fragment shader at DPR 3 buys nothing
          // visible and costs a great deal of fill rate.
          dpr: Math.min(window.devicePixelRatio || 1, 1.75),
          powerPreference: "high-performance",
        });
      } catch {
        return; // No WebGL — the <img> underneath is already the fallback.
      }

      const gl = renderer.gl;
      gl.canvas.classList.add("hero-shader-canvas");
      mount.appendChild(gl.canvas);

      const texture = new Texture(gl, {
        image: img,
        generateMipmaps: false,
      });

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        uniforms: {
          tMap: { value: texture },
          uCover: { value: [1, 1] },
          uTime: { value: 0 },
          uVel: { value: 0 },
          uFade: { value: 0 },
        },
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const resize = () => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        if (!w || !h) return;
        renderer!.setSize(w, h);

        const canvasAspect = w / h;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        program.uniforms.uCover.value =
          canvasAspect > imgAspect
            ? [1, imgAspect / canvasAspect]
            : [canvasAspect / imgAspect, 1];
      };

      resize();
      ro = new ResizeObserver(resize);
      ro.observe(mount);

      stopVelocity = onScrollVelocity((v) => {
        program.uniforms.uVel.value = v;
      });

      // Nothing renders while the hero is off screen.
      let visible = true;
      io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting;
        },
        { rootMargin: "120px" }
      );
      io.observe(mount);

      let firstFrame = true;
      const tick = (time: number) => {
        if (!visible || !renderer) return;
        program.uniforms.uTime.value = time / 1000;
        renderer.render({ scene: mesh });
        if (firstFrame) {
          firstFrame = false;
          // Cross-fade from the <img> to the canvas so the swap is invisible.
          gsap.to(program.uniforms.uFade, {
            value: 1,
            duration: 0.9,
            ease: "brand",
            onStart: onReady,
          });
        }
      };

      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
      };
    };

    let cleanupTick: (() => void) | undefined;

    // The texture needs decoded pixels, so wait for the image if it is still
    // in flight. It normally is not — it is the priority LCP image.
    if (img.complete && img.naturalWidth) {
      cleanupTick = start();
    } else {
      img.addEventListener(
        "load",
        () => {
          cleanupTick = start();
        },
        { once: true }
      );
    }

    return () => {
      disposed = true;
      cleanupTick?.();
      stopVelocity?.();
      ro?.disconnect();
      io?.disconnect();
      const canvas = renderer?.gl.canvas;
      renderer?.gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas?.remove();
      renderer = null;
    };
  }, [imgRef, onReady]);

  return (
    <div
      ref={holder}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  );
}
