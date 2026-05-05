import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";

interface Props {
  palette: { accent: string; accentRgb: string };
  brandHandle: string;
  progress: number;
}

export const BrandTag: React.FC<Props> = ({ palette, brandHandle, progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide up from bottom
  const slideProgress = Math.max(0, Math.min((progress - 0.35) * 3, 1));

  const tagSpring = spring({
    frame: frame - Math.floor(fps * 0.35),
    fps,
    config: { damping: 15, stiffness: 100 },
    from: 60,
    to: 0,
    durationInFrames: 20,
  });

  const brandText = `@${brandHandle}`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: `${14 + tagSpring}%`,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "10px 28px",
          background: `rgba(${palette.accentRgb},0.18)`,
          backdropFilter: "blur(12px)",
          border: `1px solid rgba(${palette.accentRgb},0.35)`,
          borderRadius: 24,
          color: palette.accent,
          fontSize: 28,
          fontWeight: 600,
          fontFamily: "'Geist', 'Inter', sans-serif",
          letterSpacing: "-0.01em",
          boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 15px rgba(${palette.accentRgb},0.1)`,
          opacity: slideProgress,
        }}
      >
        {brandText}
      </div>
    </div>
  );
};
