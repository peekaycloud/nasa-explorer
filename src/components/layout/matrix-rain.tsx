"use client";

import { useEffect, useRef } from "react";

const CHARSET = "アイウエオカキクケコ0123456789NASA·APOD·NEO·EPIC·DONKI·GIBS·MARS·EONET";
const MATRIX_GREEN = "#00ff41";
const MATRIX_DIM = "#003b00";

export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const surface = canvas;
    const context = ctx;

    let animationId = 0;
    let columns = 0;
    let drops: number[] = [];
    const fontSize = 14;

    function resize() {
      const parent = surface.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      surface.width = width * dpr;
      surface.height = height * dpr;
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.floor(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -40);
    }

    function draw() {
      const width = surface.clientWidth;
      const height = surface.clientHeight;

      context.fillStyle = "rgba(0, 0, 0, 0.08)";
      context.fillRect(0, 0, width, height);

      context.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        context.fillStyle = y > height * 0.65 ? MATRIX_DIM : MATRIX_GREEN;
        context.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.55 + Math.random() * 0.45;
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const observer = new ResizeObserver(resize);
    if (surface.parentElement) observer.observe(surface.parentElement);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
    />
  );
}
