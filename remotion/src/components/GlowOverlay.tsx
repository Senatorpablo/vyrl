import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface Props {
  palette: { bg: string; accent: string; glow: string; accentRgb: string };
  progress: number;
}

export const GlowOverlay: React.FC<Props> = ({ palette, progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Top highlight glow (TikTok-style top-light leak)
  const topGlowIntensity = interpolate(
    Math.sin(progress * Math.PI * 1.5),
    [-1, 1],
    [0.02, 0.06]
  );

  // Edge vignette
  return (
    <>
      {/* Top light leak */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "35%",
          background: `linear-gradient(180deg, rgba(${palette.accentRgb},${topGlowIntensity}) 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(
              ellipse at center,
              transparent 55%,
              rgba(0,0,0,0.45) 100%
            )
          `,
          pointerEvents: "none",
        }}
      />

      {/* Bottom gradient for text readability */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: `linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />
    </>
  );
};
