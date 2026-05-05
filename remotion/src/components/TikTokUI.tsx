import React from "react";
import { useCurrentFrame, useVideoConfig, Img, spring } from "remotion";

interface Props {
  palette: { accent: string; accentRgb: string; text: string };
  platform: string;
  progress: number;
  influencerName: string;
  voiceAccent: string;
}

export const TikTokUI: React.FC<Props> = ({
  palette, platform, progress, influencerName, voiceAccent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sideSpring = spring({
    frame, fps,
    config: { damping: 18, stiffness: 90 },
    from: 20, to: 0,
    durationInFrames: 15,
  });

  // TikTok-style right sidebar buttons
  const sidebarBtns = [
    { icon: "♥", label: "Like" },
    { icon: "💬", label: "Comment" },
    { icon: "↗", label: "Share" },
    { icon: "☆", label: "Save" },
  ];

  return (
    <>
      {/* Right sidebar — TikTok interaction buttons */}
      <div
        style={{
          position: "absolute",
          right: 14 + sideSpring,
          bottom: "22%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          zIndex: 5,
        }}
      >
        {/* Profile mini-circle */}
        <div
          style={{
            width: 44, height: 44,
            borderRadius: "50%",
            border: `2px solid ${palette.accent}`,
            background: `linear-gradient(135deg, ${palette.accent}, rgba(${palette.accentRgb},0.4))`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
            marginBottom: 4,
          }}
        >
          {influencerName.charAt(0)}
        </div>

        {sidebarBtns.map((btn, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 44, height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
                backdropFilter: "blur(4px)",
              }}
            >
              {btn.icon}
            </div>
            <div style={{
              fontSize: 11, color: "rgba(255,255,255,0.6)",
              marginTop: 4, fontFamily: "'Geist', 'Inter', sans-serif",
            }}>
              {btn.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom-left — handle + description */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: 16 - sideSpring,
          zIndex: 5,
          maxWidth: 500,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Geist', 'Inter', sans-serif",
            color: "#fff",
            marginBottom: 6,
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          @{influencerName.toLowerCase()} • {voiceAccent}
        </div>
      </div>

      {/* Top right — platform label */}
      <div
        style={{
          position: "absolute",
          top: 40, right: 16 + sideSpring,
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Geist', 'Inter', sans-serif",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.03em",
          }}
        >
          {platform}
        </div>
      </div>

      {/* Bottom — VYRL watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 24, right: 20 + sideSpring,
          fontSize: 12, fontWeight: 600,
          fontFamily: "'Geist', 'Inter', sans-serif",
          color: "rgba(255,255,255,0.1)",
          zIndex: 5,
        }}
      >
        VYRL
      </div>

      {/* TikTok progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 16,
          right: 16,
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          zIndex: 5,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${palette.accent}30, ${palette.accent}90)`,
            borderRadius: 2,
          }}
        />
      </div>
    </>
  );
};
