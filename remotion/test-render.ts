#!/usr/bin/env npx tsx
/* Quick test — bundles & renders a single VYRL video */

import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs";

async function main() {
  const outputPath = path.join(__dirname, "..", "output", "test-video.mp4");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log("📦 Bundling...");
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, "src/index.ts"),
    webpackOverride: (config) => config,
  });

  console.log("🔍 Fetching compositions...");
  const comps = await getCompositions(bundled);
  console.log("   Available:", comps.map(c => c.id).join(", "));

  const comp = comps.find(c => c.id === "ugc-video");
  if (!comp) throw new Error("Composition 'ugc-video' not found");

  console.log("🎥 Rendering...");
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
    },
    codec: "h264",
    outputLocation: outputPath,
    chromiumOptions: { headless: true },
  });

  const stats = fs.statSync(outputPath);
  console.log(`\n✅ Done! ${(stats.size / (1024 * 1024)).toFixed(1)}MB`);
  console.log(`📁 ${outputPath}`);
}

main().catch(err => {
  console.error("❌ Render failed:", err);
  process.exit(1);
});
