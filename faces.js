/* ═══════════════════════════════════════════
   VYRL — faces.js
   Human-like influencer face library
   Uses randomuser.me API + fallback portrait URLs
   Diverse UK-representative faces by archetype
   ═══════════════════════════════════════════ */

const VYRLFaces = (() => {
  'use strict';

  // ── Real portrait URLs by gender (from randomuser.me — CORS-friendly) ──
  const PORTRAIT_BASE = 'https://randomuser.me/api/portraits';

  // Women portraits
  const WOMEN = Array.from({ length: 50 }, (_, i) => ({
    url: `${PORTRAIT_BASE}/women/${i}.jpg`,
    id: `w${i}`,
  }));

  // Men portraits
  const MEN = Array.from({ length: 50 }, (_, i) => ({
    url: `${PORTRAIT_BASE}/men/${i}.jpg`,
    id: `m${i}`,
  }));

  // ── Lifestyle backgrounds (real rooms, UK vibe) ──
  // Using Unsplash permanent image URLs (free, no API key needed)
  const BACKGROUNDS = [
    { url: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=720&q=80', desc: 'cozy bedroom' },
    { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=720&q=80', desc: 'modern kitchen' },
    { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=720&q=80', desc: 'living room sofa' },
    { url: 'https://images.unsplash.com/photo-1598928506311-c55e85a3c0bc?w=720&q=80', desc: 'bright bathroom' },
    { url: 'https://images.unsplash.com/photo-1558882224-dda166733046?w=720&q=80', desc: 'city street' },
    { url: 'https://images.unsplash.com/photo-1596178065887-119a8ea2f4fa?w=720&q=80', desc: 'mirror selfie room' },
    { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=720&q=80', desc: 'minimalist home' },
    { url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=720&q=80', desc: 'aesthetic room' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=720&q=80', desc: 'plant-filled corner' },
    { url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=720&q=80', desc: 'clean bathroom mirror' },
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=720&q=80', desc: 'cozy living room' },
    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=720&q=80', desc: 'modern apartment' },
  ];

  // ── Product placement backgrounds (hands holding phone, empty table, etc) ──
  const PRODUCT_SHOTS = [
    { url: 'https://images.unsplash.com/photo-1607006348138-5f0c2d2f7b41?w=720&q=80', desc: 'product on table' },
    { url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=720&q=80', desc: 'product in hands' },
    { url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=720&q=80', desc: 'unboxing' },
  ];

  // ── Archetype → face mapping ──
  const ARCHETYPE_FACES = {
    // Beauty — young women, polished look
    beauty: {
      female: [WOMEN[0], WOMEN[1], WOMEN[2], WOMEN[5], WOMEN[8], WOMEN[12], WOMEN[15], WOMEN[22]],
      male: [MEN[3], MEN[7], MEN[11], MEN[18]],
    },
    // Fashion — model-esque
    fashion: {
      female: [WOMEN[3], WOMEN[6], WOMEN[9], WOMEN[13], WOMEN[17], WOMEN[20], WOMEN[25], WOMEN[30]],
      male: [MEN[1], MEN[5], MEN[9], MEN[14], MEN[20], MEN[25], MEN[30], MEN[35]],
    },
    // Fitness — athletic
    fitness: {
      female: [WOMEN[4], WOMEN[10], WOMEN[14], WOMEN[18], WOMEN[23], WOMEN[28], WOMEN[33], WOMEN[38]],
      male: [MEN[0], MEN[4], MEN[8], MEN[13], MEN[17], MEN[22], MEN[27], MEN[32]],
    },
    // Tech — sharp, modern
    tech: {
      female: [WOMEN[7], WOMEN[16], WOMEN[21], WOMEN[26], WOMEN[31], WOMEN[36], WOMEN[41], WOMEN[45]],
      male: [MEN[2], MEN[6], MEN[10], MEN[15], MEN[19], MEN[24], MEN[29], MEN[34]],
    },
    // Food — friendly, warm
    food: {
      female: [WOMEN[11], WOMEN[19], WOMEN[24], WOMEN[29], WOMEN[34], WOMEN[39], WOMEN[43], WOMEN[47]],
      male: [MEN[12], MEN[16], MEN[21], MEN[26], MEN[31], MEN[36], MEN[40], MEN[44]],
    },
  };

  // ── Default faces for any archetype ──
  const DEFAULT_FACES = {
    female: WOMEN.slice(0, 20),
    male: MEN.slice(0, 20),
  };

  function getRandomFace(archetype, gender) {
    const faces = (ARCHETYPE_FACES[archetype] || DEFAULT_FACES)[gender || 'female'] || DEFAULT_FACES.female;
    const face = faces[Math.floor(Math.random() * faces.length)];
    return face.url;
  }

  function getRandomBackground() {
    const bg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    return bg.url;
  }

  function getProductShot() {
    const shot = PRODUCT_SHOTS[Math.floor(Math.random() * PRODUCT_SHOTS.length)];
    return shot.url;
  }

  // ── Public API ──
  return {
    getRandomFace,
    getRandomBackground,
    getProductShot,
    WOMEN,
    MEN,
    BACKGROUNDS,
    PRODUCT_SHOTS,
    ARCHETYPE_FACES,
  };
})();
