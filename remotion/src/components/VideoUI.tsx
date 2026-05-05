import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";

interface Props {
  palette: { text: string; accent: string; accentRgb: string };
  platform: string;
  progress: number;
}

export const VideoUI: React.FC<Props> = ({ palette, platform, progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Progress bar
  const barWidth = 640;

  // Side elements slide in
  const sideSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90 },
    from: 20,
    to: 0,
    durationInFrames: 15,
  });

  return (
    <>
      {/* Platform label — top right */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 40 + sideSpring,
          fontSize: 22,
          fontWeight: 600,
          fontFamily: "'Geist', 'Inter', sans-serif",
          color: "rgba(255,255,255,0.25)",
          opacity: 0.9,
        }}
      >
        {platform}
      </div>

      {/* VYRL watermark — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          right: 40 + sideSpring,
          fontSize: 18,
          fontWeight: 600,
          fontFamily: "'Geist', 'Inter', sans-serif",
          color: "rgba(255,255,255,0.1)",
        }}
      >
        VYRL
      </div>

      {/* Sound indicator — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 40 - sideSpring,
          fontSize: 16,
          fontWeight: 500,
          fontFamily: "'Geist', 'Inter', sans-serif",
          color: "rgba(255,255,255,0.15)",
        }}
      >
        🔊 Original Audio
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 40,
          width: barWidth,
          height: 4,
          borderRadius: 2,
          overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${palette.accent}30, ${palette.accent}90)`,
            borderRadius: 2,
            transition: "width 0.04s linear",
          }}
        />
      </div>
    </>
  );
};
