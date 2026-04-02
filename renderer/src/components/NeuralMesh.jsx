import { useEffect, useRef } from "react";

export default function NeuralMesh() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const NODE_COUNT = 60;
    const MAX_DIST = 140;
    const MESH_RADIUS = Math.min(w, h) * 0.22;
    const CENTER_X = w / 2;
    const CENTER_Y = h / 2;

    const nodes = Array.from({ length: NODE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * MESH_RADIUS;

      return {
        x: CENTER_X + Math.cos(angle) * r,
        y: CENTER_Y + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      };
    });

    const draw = () => {
      // SAME WHITE BACKGROUND
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);

      // Update nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        const dx = n.x - CENTER_X;
        const dy = n.y - CENTER_Y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > MESH_RADIUS) {
          const ratio = MESH_RADIUS / dist;
          n.x = CENTER_X + dx * ratio;
          n.y = CENTER_Y + dy * ratio;
          n.vx *= -0.5;
          n.vy *= -0.5;
        }
      }

      // Edges
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "#000000";
        ctx.fill();
      }

      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        aria-label="Neural mesh background"
      />
    </main>
  );
}