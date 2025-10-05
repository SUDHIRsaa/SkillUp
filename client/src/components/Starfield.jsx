import { useEffect, useRef } from 'react';

export default function Starfield({ density = 140, speed = 0.45, twinkle = true, twinkleSpeed = 1.2, sizeMultiplier = 1.8, lightColors = [[24,119,242],[0,122,255],[0,0,0]], darkColor = [255,255,255] }) {
  const canvasRef = useRef(null);
  const starsRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const resizeObsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // set initial size with devicePixelRatio support
    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      canvas.style.width = Math.round(rect.width) + 'px';
      canvas.style.height = Math.round(rect.height) + 'px';
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height };
    };

    let { w, h } = setSize();

    // initialize stars once and persist them across resizes/rerenders
    if (!starsRef.current) {
      starsRef.current = Array.from({ length: density }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        // treat vx/vy as "pixels per 60fps frame" so we scale by dt*60
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 2.0 + 0.4,
        phase: Math.random() * Math.PI * 2,
        freq: 0.5 + Math.random() * 1.5,
        idx: i % (lightColors ? Math.max(1, lightColors.length) : 3),
      }));
    }

    // Use ResizeObserver to detect layout changes (not just window resize)
    if (typeof ResizeObserver !== 'undefined') {
      resizeObsRef.current = new ResizeObserver(() => {
        const sizes = setSize();
        w = sizes.w; h = sizes.h;
      });
      resizeObsRef.current.observe(canvas);
      // Also observe parent if canvas is full-bleed and parent size changes
      if (canvas.parentElement) resizeObsRef.current.observe(canvas.parentElement);
    } else {
      // fallback
      const onResize = () => { const sizes = setSize(); w = sizes.w; h = sizes.h; };
      window.addEventListener('resize', onResize);
      resizeObsRef.current = { disconnect: () => window.removeEventListener('resize', onResize) };
    }

    let t = 0;
    const step = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000); // cap dt to avoid large jumps
      lastTimeRef.current = timestamp;

      // clear with full size in device pixels handled by transform
      ctx.clearRect(0, 0, w, h);
      const isDark = document.documentElement.classList.contains('dark');
      const baseAlpha = isDark ? 0.78 : 0.22;

      const stars = starsRef.current;
      for (const s of stars) {
        // scale movement to time delta (preserve previous behavior approx. by *60)
        s.x += s.vx * dt * 60;
        s.y += s.vy * dt * 60;
        if (s.x < -5) s.x = w + 5; if (s.x > w + 5) s.x = -5;
        if (s.y < -5) s.y = h + 5; if (s.y > h + 5) s.y = -5;

        let alpha = baseAlpha;
        if (twinkle) {
          // Smooth twinkle between ~0.25x and 1x of base alpha
          const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.phase + t * twinkleSpeed * s.freq));
          alpha = baseAlpha * tw;
        }

        ctx.beginPath();
        let color;
        if (isDark) {
          const [r, g, b] = darkColor;
          color = `rgba(${r},${g},${b},${alpha})`;
        } else {
          const palette = (lightColors || []).filter(c => c);
          const pick = palette[s.idx ?? 0] || palette[(Math.random() * palette.length) | 0] || [0, 0, 0];
          const [r, g, b] = pick;
          color = `rgba(${r},${g},${b},${alpha})`;
        }
        ctx.fillStyle = color;
        ctx.arc(s.x, s.y, s.size * s.z * sizeMultiplier, 0, Math.PI * 2);
        ctx.fill();
      }

      t += dt;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (resizeObsRef.current) try { resizeObsRef.current.disconnect(); } catch (e) {}
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  // intentionally keep dependency list small: these props are stable or minor visual changes
  }, [density, speed, twinkle, twinkleSpeed, sizeMultiplier, lightColors, darkColor]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none select-none star-canvas" />;
}
