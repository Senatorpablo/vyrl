import React, { useMemo } from "react";
import { Img, useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";

interface Props {
  influencerName: string;
  influencerAge: number;
  influencerStyle: string;
  faceUrl: string;
  backgroundUrl: string;
  palette: { accent: string; accentRgb: string; text: string };
  progress: number;
}

export const TikTokAvatar: React.FC<Props> = ({
  faceUrl, backgroundUrl, palette, progress, influencerStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background zoom (slow Ken Burns)
  const bgScale = 1 + progress * 0.08;
  const bgShiftX = Math.sin(progress * 0.7) * 15;
  const bgShiftY = Math.cos(progress * 0.5) * 10;

  // Face entrance
  const faceSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
    from: 0.85,
    to: 1,
    durationInFrames: 25,
  });

  // Face subtle float
  const faceFloat = Math.sin(progress * 2.5) * 4;
  const faceTilt = Math.sin(progress * 3.1) * 1.5;

  return (
    <AbsoluteFill>
      {/* Lifestyle background image */}
      <div
        style={{
          position: "absolute",
          inset: -20,
          transform: `scale(${bgScale}) translate(${bgShiftX}px, ${bgShiftY}px)`,
          filter: "brightness(0.75) saturate(0.9)",
        }}
      >
        <Img
          src={backgroundUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)`,
        }}
      />

      {/* Face — positioned like a TikTok talking head (centered, slightly above middle) */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: `translate(-50%, 0) scale(${faceSpring}) translateY(${faceFloat}px) rotate(${faceTilt}deg)`,
          width: 280,
          height: 280,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid rgba(${palette.accentRgb},0.3)`,
          boxShadow: `0 0 40px rgba(${palette.accentRgb},0.2), 0 10px 40px rgba(0,0,0,0.5)`,
          zIndex: 2,
        }}
      >
        <Img
          src={faceUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
        {/* Subtle inner glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            boxShadow: `inset 0 0 30px rgba(${palette.accentRgb},0.15)`,
          }}
        />
      </div>

      {/* Style badge below face */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "'Geist', 'Inter', sans-serif",
          color: `rgba(${palette.accentRgb},0.7)`,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          zIndex: 2,
        }}
      >
        {influencerStyle}
      </div>
    </AbsoluteFill>
  );
};
