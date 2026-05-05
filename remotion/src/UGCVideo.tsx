import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill, spring } from "remotion";
import { Background } from "./components/Background";
import { Avatar } from "./components/Avatar";
import { Caption } from "./components/Caption";
import { BrandTag } from "./components/BrandTag";
import { VideoUI } from "./components/VideoUI";
import { GlowOverlay } from "./components/GlowOverlay";

interface VideoProps {
  brandName: string;
  brandHandle: string;
  influencerName: string;
  influencerAge: number;
  influencerInitial: string;
  influencerStyle: string;
  influencerVibe: string;
  voiceAccent: string;
  voiceStyle: string;
  industry: string;
  tones: string[];
  caption: string;
  format: string;
  platform: string;
  palette: {
    bg: string;
    accent: string;
    text: string;
    glow: string;
    accentRgb: string;
  };
}

const TOTAL_DURATION_SEC = 8;

export const UGCVideo: React.FC<VideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = fps * TOTAL_DURATION_SEC;
  const progress = frame / totalFrames;

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
    from: 0.9,
    to: 1,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: props.palette.bg }}>
      <Background palette={props.palette} progress={progress} />
      <GlowOverlay palette={props.palette} progress={progress} />
      <Avatar palette={props.palette} influencer={props} progress={progress} frame={frame} fps={fps} />
      <Caption palette={props.palette} caption={props.caption} progress={progress} fps={fps} />
      <BrandTag palette={props.palette} brandHandle={props.brandHandle} progress={progress} />
      <VideoUI palette={props.palette} platform={props.platform} progress={progress} />
    </AbsoluteFill>
  );
};
