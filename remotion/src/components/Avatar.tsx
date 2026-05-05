import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface Props {
  palette: { accent: string; glow: string; accentRgb: string };
  influencer: {
    influencerName: string;
    influencerInitial: string;
    influencerStyle: string;
  };
  progress: number;
  frame: number;
  fps: number;
}

export const Avatar: React.FC<Props> = ({ palette, influencer, progress, frame, fps }) => {
  // Avatar entrance — bounces in from scale 0
  const avatarSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.5 },
    from: 0,
    to: 1,
    durationInFrames: 30,
  });

  // Pulse animation
  const pulse = 1 + Math.sin(progress * Math.PI * 3) * 0.04;

  // Glow ring rotation
  const ringRotation = progress * 15;

  // Sparkle particles
  const sparkles = Array.from({ length: 5 }, (_, i) => ({
    angle: progress * 1.5 + (i * Math.PI * 2) / 5,
    distance: 105 + Math.sin(progress * 4 + i) * 8,
    size: 3 + Math.sin(progress * 6 + i) * 1.5,
    opacity: 0.2 + Math.sin(progress * 7 + i) * 0.15,
  }));

  return (
    <div
      style={{
        position: "absolute",
        top: "19%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${avatarSpring * pulse})`,
      }}
    >
      {/* Glow ring */}
      <div
        style={{
          position: "absolute",
          inset: -12,
          borderRadius: "50%",
          border: `2px solid ${palette.accent}`,
          opacity: 0.4,
          filter: `blur(0.5px)`,
          transform: `rotate(${ringRotation}deg)`,
          boxShadow: `0 0 25px ${palette.glow}, inset 0 0 15px ${palette.glow}`,
        }}
      />

      {/* Secondary glow ring */}
      <div
        style={{
          position: "absolute",
          inset: 6,
          borderRadius: "50%",
          border: `1px solid rgba(${palette.accentRgb},0.15)`,
          opacity: 0.3,
          transform: `rotate(${-ringRotation * 0.7}deg)`,
        }}
      />

      {/* Avatar circle */}
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${palette.accent}, rgba(${palette.accentRgb},0.5))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 60px ${palette.glow}, 0 20px 40px rgba(0,0,0,0.4)`,
          position: "relative",
        }}
      >
        {/* Initial */}
        <span
          style={{
            color: "#fff",
            fontSize: 80,
            fontWeight: 900,
            fontFamily: "'Geist', 'Inter', sans-serif",
            lineHeight: 1,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {influencer.influencerInitial}
        </span>

        {/* Inner highlight */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "25%",
            right: "25%",
            height: "30%",
            background: `radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Sparkles around avatar */}
      {sparkles.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: s.size,
            height: s.size,
            left: "50%",
            top: "50%",
            marginLeft: Math.cos(s.angle) * s.distance - s.size / 2,
            marginTop: Math.sin(s.angle) * s.distance - s.size / 2,
            backgroundColor: palette.accent,
            borderRadius: "50%",
            opacity: s.opacity,
            boxShadow: `0 0 ${s.size * 2}px ${palette.glow}`,
          }}
        />
      ))}

      {/* Style label */}
      <div
        style={{
          position: "absolute",
          bottom: -30,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Geist', 'Inter', sans-serif",
          color: palette.accent,
          opacity: 0.7,
          whiteSpace: "nowrap",
          letterSpacing: "0.03em",
        }}
      >
        {influencer.influencerStyle}
      </div>
    </div>
  );
};
