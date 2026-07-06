import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = width < 768;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      o: number;
      hue: number;
      pulse: number;
      pulseSpeed: number;
    };

    const particles: Particle[] = [];
    const count = isMobile ? 30 : 70;
    const connectionDistance = isMobile ? 95 : 160;
    const maxConnectionsPerParticle = isMobile ? 4 : 6;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = {
      primary: 200, // cyan from --primary
      accent: 270,  // purple from --accent
      gold: 45,     // warm gold accent for data packets
    };

    for (let i = 0; i < count; i++) {
      const hue = Math.random() > 0.55 ? colors.accent : colors.primary;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6 + 0.25, // rightward drift
        vy: (Math.random() - 0.5) * 0.4 - 0.08, // slight upward drift
        r: Math.random() * 1.6 + 0.9,
        o: Math.random() * 0.45 + 0.45,
        hue,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const drawParticle = (p: Particle) => {
      p.pulse += p.pulseSpeed;
      const pulseFactor = 0.85 + Math.sin(p.pulse) * 0.15;
      const alpha = p.o * pulseFactor;
      const radius = p.r * pulseFactor;

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 62%, ${alpha})`;
      ctx.fill();

      // soft glow on accent and larger nodes
      if (p.hue === colors.accent || p.r > 1.1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 62%, ${alpha * 0.12})`;
        ctx.fill();
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < particles.length && connections < maxConnectionsPerParticle; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(200, 100%, 55%, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            connections++;
          }
        }
      }
    };

    const drawDataPacket = () => {
      if (Math.random() > 0.04) return;
      const source = particles[Math.floor(Math.random() * particles.length)];
      const nearby = particles.filter((p) => {
        if (p === source) return false;
        const d = Math.hypot(p.x - source.x, p.y - source.y);
        return d < connectionDistance * 1.6;
      });
      if (nearby.length === 0) return;
      const target = nearby[Math.floor(Math.random() * nearby.length)];

      // gold tracer line
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = `hsla(${colors.gold}, 90%, 60%, 0.4)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // bright packet at destination
      ctx.beginPath();
      ctx.arc(target.x, target.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${colors.gold}, 90%, 70%, 0.65)`;
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // subtle ambient vignette gradient
      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.7
      );
      gradient.addColorStop(0, "hsla(220, 30%, 8%, 0)");
      gradient.addColorStop(1, "hsla(270, 50%, 18%, 0.08)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // update positions
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -24) p.x = width + 24;
        if (p.x > width + 24) p.x = -24;
        if (p.y < -24) p.y = height + 24;
        if (p.y > height + 24) p.y = -24;
      });

      drawConnections();
      drawDataPacket();
      particles.forEach(drawParticle);

      animId = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      resize();
      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.7
      );
      gradient.addColorStop(0, "hsla(220, 30%, 8%, 0)");
      gradient.addColorStop(1, "hsla(270, 50%, 18%, 0.08)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      drawConnections();
      particles.forEach(drawParticle);
    };

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default ParticleBackground;
