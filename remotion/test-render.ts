#!/usr/bin/env npx tsx
/* Quick test — renders a realistic UGC video with real face + lifestyle background */

import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs";

async function main() {
  const outputPath = path.join(__dirname, "..", "output", "maya-ugc-tiktok.mp4");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log("📦 Bundling Remotion...");
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, "src/index.ts"),
    webpackOverride: (config) => config,
  });

  const comps = await getCompositions(bundled);
  const comp = comps.find(c => c.id === "ugc-video");
  if (!comp) throw new Error("Composition not found");

  // Use a real portrait from randomuser.me
  const faceUrl = `https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 50)}.jpg`;
  const backgroundUrl = `https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=720&q=80`;

  console.log(`🎭 Face: ${faceUrl}`);
  console.log(`🏠 Background: cozy bedroom`);
  console.log("🎥 Rendering 8-second TikTok-style UGC video...\n");

  await renderMedia({
    serveUrl: bundled,
    composition: comp,
    inputProps: {
      brandName: "GlowLab",
      brandHandle: "glowlab_club",
      influencerName: "Maya",
      influencerAge: 24,
      influencerInitial: "M",
      influencerStyle: "Clean Girl Aesthetic",
      influencerVibe: "soft-spoken skincare guru — ingredient obsessed",
      voiceAccent: "RP — London",
      voiceStyle: "polished, trustworthy",
      industry: "Beauty",
      tones: ["Friendly", "Bold"],
      caption: "This serum literally changed my skin in 48 hours. Not even joking. My dark spots? Gone. My texture? Smooth as butter. @glowlab_club you've outdone yourself. Link in bio. ✨",
      format: "Honest Review",
      platform: "TikTok",
      faceUrl,
      backgroundUrl,
      palette: {
        bg: "#0a0a0b",
        accent: "#EC4899",
        text: "#F4F4F5",
        glow: "rgba(236,72,153,0.3)",
        accentRgb: "236,72,153",
      },
    },
    codec: "h264",
    outputLocation: outputPath,
    chromiumOptions: { headless: true },
  });

  const stats = fs.statSync(outputPath);
  console.log(`\n✅ Done! ${(stats.size / (1024 * 1024)).toFixed(1)}MB`);
  console.log(`📁 ${outputPath}`);
  console.log(`\n🎬 Watch: open ${outputPath}`);
}

main().catch(err => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
