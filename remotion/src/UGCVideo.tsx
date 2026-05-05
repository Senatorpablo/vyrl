import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill, spring } from "remotion";
import { TikTokAvatar } from "./components/TikTokAvatar";
import { Caption } from "./components/Caption";
import { BrandTag } from "./components/BrandTag";
import { TikTokUI } from "./components/TikTokUI";

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
  faceUrl: string;
  backgroundUrl: string;
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

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TikTokAvatar
        faceUrl={props.faceUrl}
        backgroundUrl={props.backgroundUrl}
        influencerName={props.influencerName}
        influencerAge={props.influencerAge}
        influencerStyle={props.influencerStyle}
        palette={props.palette}
        progress={progress}
      />
      <Caption
        palette={props.palette}
        caption={props.caption}
        progress={progress}
        fps={fps}
      />
      <BrandTag
        palette={props.palette}
        brandHandle={props.brandHandle}
        progress={progress}
      />
      <TikTokUI
        palette={props.palette}
        platform={props.platform}
        progress={progress}
        influencerName={props.influencerName}
        voiceAccent={props.voiceAccent}
      />
    </AbsoluteFill>
  );
};
