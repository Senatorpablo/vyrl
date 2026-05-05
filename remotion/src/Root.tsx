import React from "react";
import { Composition } from "remotion";
import { UGCVideo } from "./UGCVideo";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ugc-video"
        component={UGCVideo}
        durationInFrames={192} // 8 seconds at 24fps
        fps={24}
        width={720}
        height={1280}
        defaultProps={{
          brandName: "GlowLab",
          brandHandle: "glowlab_club",
          influencerName: "Maya",
          influencerAge: 24,
          influencerInitial: "M",
          influencerStyle: "Clean Girl Aesthetic",
          influencerVibe: "soft-spoken, ingredient-obsessed skincare guru",
          voiceAccent: "RP — London",
          voiceStyle: "polished, trustworthy",
          industry: "Beauty",
          tones: ["Friendly", "Bold"],
          caption: "This serum literally changed my skin in 48 hours. Not even joking. @glowlab",
          format: "Honest Review",
          platform: "TikTok",
          palette: {
            bg: "#1a0525",
            accent: "#7C3AED",
            text: "#F4F4F5",
            glow: "rgba(124,58,237,0.3)",
            accentRgb: "124,58,237",
          },
        }}
      />
    </>
  );
};
