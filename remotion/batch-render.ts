#!/usr/bin/env npx tsx
/* ═══════════════════════════════════════════
   VYRL Remotion — batch-render.ts
   Reads brand+influencer data and renders
   high-quality MP4 UGC videos via Remotion.

   Usage: npx tsx batch-render.ts [--brand=gloss] [--count=4] [--output=./videos]
   ═══════════════════════════════════════════ */

import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";

// ── Color palettes ──
const PALETTES: Record<string, any> = {
  purple: { bg: "#1a0525", accent: "#7C3AED", text: "#F4F4F5", glow: "rgba(124,58,237,0.3)", accentRgb: "124,58,237" },
  cyan: { bg: "#0a1628", accent: "#06B6D4", text: "#F4F4F5", glow: "rgba(6,182,212,0.3)", accentRgb: "6,182,212" },
  pink: { bg: "#1a0a2e", accent: "#EC4899", text: "#F4F4F5", glow: "rgba(236,72,153,0.3)", accentRgb: "236,72,153" },
  green: { bg: "#0f1a0a", accent: "#22C55E", text: "#F4F4F5", glow: "rgba(34,197,94,0.3)", accentRgb: "34,197,94" },
  amber: { bg: "#1a1505", accent: "#F59E0B", text: "#F4F4F5", glow: "rgba(245,158,11,0.3)", accentRgb: "245,158,11" },
  indigo: { bg: "#0a0a20", accent: "#8B5CF6", text: "#F4F4F5", glow: "rgba(139,92,246,0.3)", accentRgb: "139,92,246" },
  red: { bg: "#200a0a", accent: "#EF4444", text: "#F4F4F5", glow: "rgba(239,68,68,0.3)", accentRgb: "239,68,68" },
  teal: { bg: "#0a1a1a", accent: "#14B8A6", text: "#F4F4F5", glow: "rgba(20,184,166,0.3)", accentRgb: "20,184,166" },
};

// ── Influencer archetypes by industry ──
const ARCHETYPES: Record<string, any> = {
  beauty: { name: "Maya", age: 24, initial: "M", style: "Clean Girl Aesthetic", vibe: "soft-spoken ingredient-obsessed skincare guru" },
  fashion: { name: "Priya", age: 25, initial: "P", style: "Street Style Maven", vibe: "effortlessly cool trend-aware fashion enthusiast" },
  fitness: { name: "Josh", age: 28, initial: "J", style: "Athletic Coach", vibe: "high-energy motivational fitness coach" },
  tech: { name: "Leo", age: 32, initial: "L", style: "Tech Reviewer", vibe: "sharp analytical gadget reviewer" },
  food: { name: "Ella", age: 30, initial: "E", style: "Home Cook", vibe: "passionate home chef recipe creator" },
  home: { name: "Sophie", age: 31, initial: "S", style: "Home Stylist", vibe: "cosy home décor DIY enthusiast" },
  travel: { name: "Luna", age: 26, initial: "L", style: "Solo Traveller", vibe: "adventurous budget explorer" },
  lifestyle: { name: "Amelia", age: 27, initial: "A", style: "Lifestyle Creator", vibe: "versatile charismatic brand storyteller" },
};

// ── Video format templates ──
const VIDEO_TEMPLATES = [
  { format: "Mini Haul", caption: (b: string, p: string) => `Just got my @${b} order and I'm honestly obsessed 😍 ${p} is a total game changer. Watch 'til the end! #${b}haul #UKfinds` },
  { format: "Honest Review", caption: (b: string, p: string) => `POV: you finally found ${p} that actually works. I've been using @${b} for 2 weeks now and here's my unfiltered review. Spoiler: it's good. #honestreview #${b}` },
  { format: "GRWM", caption: (b: string, p: string) => `GRWM while I chat about why @${b} has been my go-to this month. ${p} is the one thing I won't skip. #GRWM #${b}partner` },
  { format: "Then vs Now", caption: (b: string, p: string) => `Before @${b} vs. after. The difference is actually mad. ${p} has completely changed my game. Not even exaggerating. #transformation #${b}` },
  { format: "Day In The Life", caption: (b: string, p: string) => `Come with me on a typical day and see how ${p} from @${b} fits into everything I do. It's the little things that stack up. #dayinmylife #${b}` },
  { format: "Unboxing", caption: (b: string, p: string) => `The moment you've been waiting for — unboxing the new ${p} from @${b}. The packaging alone has me shook. Wait for the reveal 👀 #unboxing #${b}` },
  { format: "Quick Tutorial", caption: (b: string, p: string) => `Stop scrolling and watch this. Here's how to actually use ${p} from @${b}. 30 seconds that'll change your life. Save this for later. #tutorial #${b}` },
  { format: "Problem → Solution", caption: (b: string, p: string) => `Struggling with this? Same, until I found ${p} from @${b}. 10/10 would recommend. Link in the usual place. #solved #${b}` },
];

// ── Brand presets ──
const BRAND_PRESETS: Record<string, any> = {
  gloss: { brandName: "GlowLab", brandHandle: "glowlab_club", industry: "beauty", tones: ["Friendly", "Bold"], product: "their Vitamin C Serum", voiceAccent: "RP — London", voiceStyle: "polished, trustworthy" },
  fit: { brandName: "FitFuel", brandHandle: "fitfueluk", industry: "fitness", tones: ["Bold", "Playful"], product: "the Protein Blend", voiceAccent: "Mancunian — Manchester", voiceStyle: "confident, northern charm" },
  tech: { brandName: "TechGear", brandHandle: "techgearuk", industry: "tech", tones: ["Bold", "Premium"], product: "the Pro Buds X", voiceAccent: "Scottish — Edinburgh", voiceStyle: "passionate, distinctive" },
  cosy: { brandName: "CosyLondon", brandHandle: "cosylondon", industry: "fashion", tones: ["Friendly", "Premium"], product: "the Cloud Hoodie", voiceAccent: "Cockney — East London", voiceStyle: "gritty, authentic" },
  london: { brandName: "LondonGrind", brandHandle: "londongrind", industry: "food", tones: ["Bold", "Friendly"], product: "the Matcha Latte", voiceAccent: "Estuary English — Essex", voiceStyle: "trendy, relatable" },
};

function buildVideoProps(brand: any, template: any, archetype: any, platform: string, palette: any) {
  return {
    brandName: brand.brandName,
    brandHandle: brand.brandHandle,
    influencerName: archetype.name,
    influencerAge: archetype.age,
    influencerInitial: archetype.initial,
    influencerStyle: archetype.style,
    influencerVibe: archetype.vibe,
    voiceAccent: brand.voiceAccent,
    voiceStyle: brand.voiceStyle,
    industry: brand.industry,
    tones: brand.tones,
    caption: template.caption(brand.brandHandle, brand.product),
    format: template.format,
    platform,
    palette,
  };
}

async function main() {
  // Parse args
  const args = process.argv.slice(2);
  const brandFlag = args.find(a => a.startsWith("--brand="))?.split("=")[1] || "gloss";
  const countFlag = parseInt(args.find(a => a.startsWith("--count="))?.split("=")[1] || "4", 10);
  const outputDir = args.find(a => a.startsWith("--output="))?.split("=")[1] || path.join(os.homedir(), "Developer", "vyrl", "output");

  const brand = BRAND_PRESETS[brandFlag] || BRAND_PRESETS.gloss;
  const archetype = ARCHETYPES[brand.industry] || ARCHETYPES.lifestyle;
  const platforms = ["TikTok", "Reels", "Shorts"];
  const paletteKeys = Object.keys(PALETTES);

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  VYRL Remotion — Batch Video Renderer`);
  console.log(`══════════════════════════════════════════`);
  console.log(`  Brand:      ${brand.brandName}`);
  console.log(`  Industry:   ${brand.industry}`);
  console.log(`  Influencer: ${archetype.name}, ${archetype.age}`);
  console.log(`  Voice:      ${brand.voiceAccent}`);
  console.log(`  Videos:     ${countFlag}`);
  console.log(`  Output:     ${outputDir}`);
  console.log(`══════════════════════════════════════════\n`);

  fs.mkdirSync(outputDir, { recursive: true });

  // Bundle Remotion
  console.log("📦 Bundling Remotion project...");
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, "src/index.ts"),
    webpackOverride: (config) => config,
  });
  console.log(`   Bundle: ${bundled}\n`);

  // Get composition
  const comps = await getCompositions(bundled);
  const comp = comps.find(c => c.id === "ugc-video");
  if (!comp) throw new Error("Composition 'ugc-video' not found");

  // Build video list
  const videos: any[] = [];
  for (let i = 0; i < countFlag; i++) {
    const template = VIDEO_TEMPLATES[i % VIDEO_TEMPLATES.length];
    const platform = platforms[i % platforms.length];
    const paletteKey = paletteKeys[i % paletteKeys.length];
    videos.push(buildVideoProps(brand, template, archetype, platform, PALETTES[paletteKey]));
  }

  // Render all
  const startTime = Date.now();
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const filename = `${brand.brandHandle}-${v.format.toLowerCase().replace(/\s+/g, "-")}-${v.platform.toLowerCase()}.mp4`;
    const outputPath = path.join(outputDir, filename);

    console.log(`\n🎬 [${i + 1}/${countFlag}] ${v.format} — ${v.platform}`);
    console.log(`   "${v.caption}"`);

    try {
      await renderMedia({
        serveUrl: bundled,
        composition: comp,
        inputProps: v,
        codec: "h264",
        outputLocation: outputPath,
        chromiumOptions: { headless: true },
      });

      const stats = fs.statSync(outputPath);
      console.log(`   ✅ ${(stats.size / (1024 * 1024)).toFixed(1)}MB → ${filename}`);
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  // List files
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".mp4"));
  console.log(`\n══════════════════════════════════════════`);
  console.log(`  ✅ ${files.length}/${countFlag} videos rendered (${elapsed}s)`);
  console.log(`  📁 ${outputDir}`);
  console.log(`══════════════════════════════════════════\n`);

  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
