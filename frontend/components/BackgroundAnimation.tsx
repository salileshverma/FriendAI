"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const BackgroundAnimation = () => {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width: number;
    let height: number;

    const stars: {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      twinkle: number;
      layer: number;
      hue: number;
    }[] = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Create stars in 3 layers for parallax
      const layers = [
        { count: Math.floor((width * height) / 10000), speed: 0.1, sizeRange: [0.5, 1.2] },
        { count: Math.floor((width * height) / 8000), speed: 0.05, sizeRange: [0.3, 0.8] },
        { count: Math.floor((width * height) / 12000), speed: 0.2, sizeRange: [0.8, 1.5] },
      ];

      stars.length = 0;
      layers.forEach((layer, index) => {
        for (let i = 0; i < layer.count; i++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]) + layer.sizeRange[0],
            opacity: Math.random(),
            speed: layer.speed * (Math.random() * 0.5 + 0.75),
            twinkle: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
            layer: index,
            // Occasional blue-tinted stars
            hue: Math.random() < 0.2 ? 220 : 0, 
          });
        }
      });
    };

    const draw = () => {
      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, "#02040a"); // Black
      bgGradient.addColorStop(0.5, "#0a1128"); // Deep Blue
      bgGradient.addColorStop(1, "#02040a"); 
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Add a subtle blue glow/nebula in the center
      const nebula = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width * 0.8
      );
      nebula.addColorStop(0, "rgba(10, 17, 40, 0.4)");
      nebula.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      // Draw and update stars
      stars.forEach((star) => {
        // Twinkle
        star.opacity += star.twinkle;
        if (star.opacity > 1 || star.opacity < 0.1) {
          star.twinkle *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        if (star.hue > 0) {
          ctx.fillStyle = `hsla(${star.hue}, 80%, 80%, ${star.opacity})`;
          ctx.shadowBlur = star.size * 2;
          ctx.shadowColor = `hsla(${star.hue}, 80%, 50%, 0.5)`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();

        // Parallax movement
        star.y -= star.speed;
        if (star.y < -10) {
          star.y = height + 10;
          star.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", init);
    init();
    draw();

    return () => {
      window.removeEventListener("resize", init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Do not show the animation on the chat page
  if (pathname?.startsWith("/chat")) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
};

export default BackgroundAnimation;
