#!/usr/bin/env npx tsx
/* ═══════════════════════════════════════════
   VYRL Remotion — batch-render.ts (v2 — real faces)
   Uses randomuser.me portraits + Unsplash backgrounds
   for hyper-realistic AI influencer UGC videos

   Usage: npx tsx batch-render.ts [--brand=gloss] [--count=4] [--output=./videos]
   ═══════════════════════════════════════════ */

import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";

// ── Color palettes ──
const PALETTES: Record<string, any> = {
  pink: { bg: "#0a0a0b", accent: "#EC4899", text: "#F4F4F5", glow: "rgba(236,72,153,0.3)", accentRgb: "236,72,153" },
  cyan: { bg: "#0a0a0b", accent: "#06B6D4", text: "#F4F4F5", glow: "rgba(6,182,212,0.3)", accentRgb: "6,182,212" },
  purple: { bg: "#0a0a0b", accent: "#7C3AED", text: "#F4F4F5", glow: "rgba(124,58,237,0.3)", accentRgb: "124,58,237" },
  green: { bg: "#0a0a0b", accent: "#22C55E", text: "#F4F4F5", glow: "rgba(34,197,94,0.3)", accentRgb: "34,197,94" },
  amber: { bg: "#0a0a0b", accent: "#F59E0B", text: "#F4F4F5", glow: "rgba(245,158,11,0.3)", accentRgb: "245,158,11" },
};

// ── Face URLs by brand preset (seeded for consistency) ──
const FACE_SEEDS: Record<string, { female: number[]; male: number[] }> = {
  gloss: { female: [0, 1, 5, 8, 12, 15, 22, 28], male: [3, 7, 11, 18] },
  fit: { female: [4, 10, 14, 18, 23, 28, 33, 38], male: [0, 4, 8, 13, 17, 22, 27, 32] },
  tech: { female: [7, 16, 21, 26, 31, 36, 41, 45], male: [2, 6, 10, 15, 19, 24, 29, 34] },
  cosy: { female: [3, 6, 9, 13, 17, 20, 25, 30], male: [1, 5, 9, 14, 20, 25, 30, 35] },
  london: { female: [11, 19, 24, 29, 34, 39, 43, 47], male: [12, 16, 21, 26, 31, 36, 40, 44] },
};

// ── Background URLs ──
const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=720&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55e85a3c0bc?w=720&q=80',
  'https://images.unsplash.com/photo-1558882224-dda166733046?w=720&q=80',
  'https://images.unsplash.com/photo-1596178065887-119a8ea2f4fa?w=720&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=720&q=80',
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=720&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=720&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=720&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=720&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=720&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=720&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=720&q=80',
];

// ── Brand presets ──
const BRAND_PRESETS: Record<string, any> = {
  gloss: { brandName: "GlowLab", brandHandle: "glowlab_club", industry: "beauty", gender: "female", tones: ["Friendly", "Bold"], product: "their Vitamin C Serum", voiceAccent: "RP — London", voiceStyle: "polished, trustworthy" },
  fit: { brandName: "FitFuel", brandHandle: "fitfueluk", industry: "fitness", gender: "male", tones: ["Bold", "Playful"], product: "the Protein Blend", voiceAccent: "Mancunian — Manchester", voiceStyle: "confident, northern charm" },
  tech: { brandName: "TechGear", brandHandle: "techgearuk", industry: "tech", gender: "male", tones: ["Bold", "Premium"], product: "the Pro Buds X", voiceAccent: "Scottish — Edinburgh", voiceStyle: "passionate, distinctive" },
  cosy: { brandName: "CosyLondon", brandHandle: "cosylondon", industry: "fashion", gender: "female", tones: ["Friendly", "Premium"], product: "the Cloud Hoodie", voiceAccent: "Cockney — East London", voiceStyle: "gritty, authentic" },
  london: { brandName: "LondonGrind", brandHandle: "londongrind", industry: "food", gender: "female", tones: ["Bold", "Friendly"], product: "the Matcha Latte", voiceAccent: "Estuary English — Essex", voiceStyle: "trendy, relatable" },
};

const ARCHETYPES: Record<string, any> = {
  beauty: { name: "Maya", age: 24, style: "Clean Girl Aesthetic", vibe: "ingredient-obsessed skincare guru" },
  fitness: { name: "Josh", age: 28, style: "Athletic Coach", vibe: "high-energy motivational fitness coach" },
  tech: { name: "Leo", age: 32, style: "Tech Reviewer", vibe: "sharp analytical gadget reviewer" },
  fashion: { name: "Priya", age: 25, style: "Street Style Maven", vibe: "effortlessly cool trend-aware enthusiast" },
  food: { name: "Ella", age: 30, style: "Home Chef", vibe: "passionate recipe creator" },
  lifestyle: { name: "Amelia", age: 27, style: "Lifestyle Creator", vibe: "versatile charismatic storyteller" },
};

const VIDEO_TEMPLATES = [
  { format: "Honest Review", caption: (b: string, p: string) => `POV: you finally found ${p} that actually works. I've been testing @${b} for 2 weeks and here's my honest verdict. Not sponsored, just genuinely impressed. The results speak for themselves. 😳 #${b} #honestreview` },
  { format: "Mini Haul", caption: (b: string, p: string) => `Just got my @${b} order and I'm honestly obsessed. ${p} is everything I hoped for. Quick try-on + first impressions. Wait for the close-up 👀 #${b}haul #UKfinds` },
  { format: "GRWM", caption: (b: string, p: string) => `GRWM while I tell you why @${b} has been my go-to this month. ${p} is genuinely the one thing I won't skip in my routine. It's that good. #GRWM #${b}` },
  { format: "Then vs Now", caption: (b: string, p: string) => `Before @${b} vs. 4 weeks after. The difference is actually mad. ${p} has completely transformed my game. Not even exaggerating — check the glow up. ✨ #transformation #${b}` },
  { format: "Day In The Life", caption: (b: string, p: string) => `Come with me on a typical day and see how ${p} from @${b} fits into everything I do. It's the little daily habits that stack up. Save this for later. 💫 #dayinmylife #${b}` },
  { format: "Unboxing", caption: (b: string, p: string) => `The moment you've all been waiting for — unboxing the new ${p} from @${b}. The packaging alone has me shook. Wait for the full reveal at the end... 👀 #unboxing #${b}` },
  { format: "Quick Tutorial", caption: (b: string, p: string) => `Stop scrolling and watch this for 30 seconds. Here's exactly how to use ${p} from @${b} to get the best results. I wish someone showed me this sooner. #tutorial #${b}` },
  { format: "Problem → Solution", caption: (b: string, p: string) => `Been struggling with this for months. Tried everything. Then I found ${p} from @${b} and it changed everything. 10/10. Link in the usual place. #solved #${b}` },
];

function buildVideoProps(brand: any, template: any, archetype: any, platform: string, palette: any, faceNum: number, bgUrl: string) {
  const gender = brand.gender || 'female';
  const faceUrl = `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${faceNum}.jpg`;

  return {
    brandName: brand.brandName,
    brandHandle: brand.brandHandle,
    influencerName: archetype.name,
    influencerAge: archetype.age,
    influencerInitial: archetype.name.charAt(0),
    influencerStyle: archetype.style,
    influencerVibe: archetype.vibe,
    voiceAccent: brand.voiceAccent,
    voiceStyle: brand.voiceStyle,
    industry: brand.industry,
    tones: brand.tones,
    caption: template.caption(brand.brandHandle, brand.product),
    format: template.format,
    platform,
    faceUrl,
    backgroundUrl: bgUrl,
    palette,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const brandFlag = args.find(a => a.startsWith("--brand="))?.split("=")[1] || "gloss";
  const countFlag = parseInt(args.find(a => a.startsWith("--count="))?.split("=")[1] || "4", 10);
  const outputDir = args.find(a => a.startsWith("--output="))?.split("=")[1] || path.join(os.homedir(), "Developer", "vyrl", "output");

  const brand = BRAND_PRESETS[brandFlag] || BRAND_PRESETS.gloss;
  const archetype = ARCHETYPES[brand.industry] || ARCHETYPES.lifestyle;
  const seed = FACE_SEEDS[brandFlag] || { female: [0, 1, 2], male: [0, 1, 2] };
  const faces = seed[brand.gender || 'female'] || seed.female;
  const platforms = ["TikTok", "Reels", "Shorts"];
  const paletteKeys = Object.keys(PALETTES);

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  VYRL Remotion — Real UGC Renderer`);
  console.log(`══════════════════════════════════════════`);
  console.log(`  Brand:      ${brand.brandName}`);
  console.log(`  Influencer: ${archetype.name}, ${archetype.age}`);
  console.log(`  Voice:      ${brand.voiceAccent}`);
  console.log(`  Videos:     ${countFlag}`);
  console.log(`  Style:      TikTok vertical | Real faces | Lifestyle BGs`);
  console.log(`══════════════════════════════════════════\n`);

  fs.mkdirSync(outputDir, { recursive: true });

  console.log("📦 Bundling Remotion...");
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, "src/index.ts"),
    webpackOverride: (config) => config,
  });

  const comps = await getCompositions(bundled);
  const comp = comps.find(c => c.id === "ugc-video");
  if (!comp) throw new Error("Composition 'ugc-video' not found");

  const videos: any[] = [];
  for (let i = 0; i < countFlag; i++) {
    const template = VIDEO_TEMPLATES[i % VIDEO_TEMPLATES.length];
    const platform = platforms[i % platforms.length];
    const paletteKey = paletteKeys[i % paletteKeys.length];
    const faceNum = faces[i % faces.length];
    const bgUrl = BACKGROUNDS[i % BACKGROUNDS.length];
    videos.push(buildVideoProps(brand, template, archetype, platform, PALETTES[paletteKey], faceNum, bgUrl));
  }

  const startTime = Date.now();
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const filename = `${brand.brandHandle}-${v.format.toLowerCase().replace(/\s+/g, "-")}-${v.platform.toLowerCase()}.mp4`;
    const outputPath = path.join(outputDir, filename);

    console.log(`\n🎬 [${i + 1}/${countFlag}] ${v.format} — ${v.platform}`);
    console.log(`   Face: ${v.faceUrl.slice(-10)} | BG: ${v.backgroundUrl.slice(-20)}`);

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
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".mp4"));
  console.log(`\n══════════════════════════════════════════`);
  console.log(`  ✅ ${files.length}/${countFlag} videos rendered (${elapsed}s)`);
  console.log(`  📁 ${outputDir}`);
  console.log(`══════════════════════════════════════════\n`);
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  console.log(`\n  🎬 Quick view: open ${outputDir}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
