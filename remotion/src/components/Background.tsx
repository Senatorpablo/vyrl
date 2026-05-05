import React, { useMemo } from "react";
import { AbsoluteFill, interpolate } from "remotion";

interface Props {
  palette: { bg: string; accent: string; accentRgb: string };
  progress: number;
}

export const Background: React.FC<Props> = ({ palette, progress }) => {
  // Generate a mesh gradient effect with multiple overlapping radial gradients
  const orbs = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      x: 30 + Math.sin(i * 1.7) * 25,
      y: 25 + Math.cos(i * 2.1) * 30,
      radius: 25 + i * 8,
      speed: 0.3 + i * 0.15,
      opacity: 0.06 + i * 0.02,
    }));
  }, []);

  return (
    <AbsoluteFill>
      {/* Base color */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: palette.bg,
        }}
      />

      {/* Animated orb layers */}
      {orbs.map((orb, i) => {
        const xMove = interpolate(
          Math.sin(progress * orb.speed * Math.PI * 2 + i),
          [-1, 1],
          [-8, 8]
        );
        const yMove = interpolate(
          Math.cos(progress * orb.speed * Math.PI * 2.3 + i),
          [-1, 1],
          [-10, 10]
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${orb.radius * 3}%`,
              height: `${orb.radius * 3}%`,
              left: `${orb.x + xMove}%`,
              top: `${orb.y + yMove}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${palette.accentRgb},${orb.opacity}) 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
        );
      })}

      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          height: "40%",
          background: `radial-gradient(ellipse, rgba(${palette.accentRgb},0.04) 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Subtle grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: 128,
        }}
      />
    </AbsoluteFill>
  );
};
