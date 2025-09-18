// Lightweight confetti utility (dev mode only) – no external deps.
// Usage: import { fireConfetti } from '@/lib/confetti'; fireConfetti();

const COLORS = [
  '#F5753B', // orange
  '#EF4136', // red
  '#FAA83F', // yellow gradient tone
  '#ffffff', // white accent
  '#3b2c23', // deep background accent
];

export function fireConfetti(count = 120) {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;
  const canvasId = '__ch_confetti_canvas';
  let canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    const resize = () => { canvas!.width = window.innerWidth; canvas!.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  interface Particle { x: number; y: number; r: number; c: string; vx: number; vy: number; rot: number; vr: number; shape: number; life: number; };
  const parts: Particle[] = [];
  for (let i = 0; i < count; i++) {
    parts.push({
      x: window.innerWidth * Math.random(),
      y: -20 + Math.random() * 40,
      r: 6 + Math.random() * 10,
      c: COLORS[i % COLORS.length],
      vx: (Math.random() - 0.5) * 4,
      vy: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      shape: Math.floor(Math.random() * 3),
      life: 220 + Math.random() * 80,
    });
  }

  let frame = 0;
  function tick() {
    if (!canvas) return;
  if (!ctx) return; // safety
  ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy *= 0.992; p.vx *= 0.998; p.life -= 1;
      // gentle drift
      p.vx += Math.sin((frame + p.r) * 0.01) * 0.02;
      // draw
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 260));
      if (p.shape === 0) {
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape === 1) {
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r * 0.6, -p.r * 0.6, p.r * 1.2, p.r * 1.2 * (0.6 + Math.sin(frame * 0.15 + p.r) * 0.25));
      } else {
        ctx.strokeStyle = p.c; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-p.r, 0); ctx.lineTo(p.r, 0); ctx.stroke();
      }
      ctx.restore();
    });
    frame++;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].y > window.innerHeight + 40 || parts[i].life <= 0) parts.splice(i, 1);
    }
    if (parts.length > 0) requestAnimationFrame(tick); else cleanup();
  }
  function cleanup() {
    if (canvas && canvas.parentElement) {
      // fade out quickly
      canvas.style.transition = 'opacity .4s ease';
      canvas.style.opacity = '0';
      setTimeout(() => { canvas && canvas.remove(); }, 450);
    }
  }
  requestAnimationFrame(tick);
}

export default fireConfetti;