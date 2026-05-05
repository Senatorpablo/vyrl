/* ═══════════════════════════════════════════
   VYRL — procedural-faces.js
   Draws human-like influencer portraits in Canvas
   Zero external dependencies, no CORS, always works
   ═══════════════════════════════════════════ */

const VYRLFaces = (() => {
  'use strict';

  // ── Skin tone palettes (realistic human skin) ──
  const SKIN_TONES = [
    { base: '#F5D5C8', shadow: '#DEB8A8', highlight: '#FFE8DD', lip: '#D4726A', hair: ['#3B2314', '#2C1810', '#1A0F08'] },
    { base: '#F0C4A8', shadow: '#D9A080', highlight: '#FDD9C0', lip: '#C95C50', hair: ['#2C1810', '#1A0F08', '#3B2314'] },
    { base: '#DEB887', shadow: '#C49A6C', highlight: '#F5D5B0', lip: '#BC4E42', hair: ['#1A0F08', '#2C1810', '#0D0603'] },
    { base: '#C68642', shadow: '#A56B2E', highlight: '#D9A066', lip: '#A04030', hair: ['#1A0F08', '#0D0603', '#2C1810'] },
    { base: '#FDE0D4', shadow: '#E8C4B4', highlight: '#FFF0E8', lip: '#E08078', hair: ['#8B6914', '#6B4F10', '#4A350B'] },
    { base: '#F5E1D0', shadow: '#DCC4B0', highlight: '#FFF2E5', lip: '#D08070', hair: ['#5C3A1E', '#3B2314', '#2C1810'] },
    { base: '#E8C4A0', shadow: '#CFA884', highlight: '#F5DCC0', lip: '#B85040', hair: ['#1A0F08', '#0D0603', '#2C1810'] },
    { base: '#FFDBB5', shadow: '#E8C09E', highlight: '#FFECD5', lip: '#D4685A', hair: ['#3B2314', '#2C1810', '#5C3A1E'] },
  ];

  // ── Generate seed from name ──
  function hashStr(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  function seededRandom(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 493013;
    return x - Math.floor(x);
  }

  // ── Draw face portrait on canvas ──
  function drawFace(ctx, name, gender, size) {
    const w = size || 300, h = size || 300;
    const cx = w / 2, cy = h * 0.45;
    const r = w * 0.42;

    const seed = hashStr(name);
    const skinIdx = Math.floor(Math.abs(seed % SKIN_TONES.length));
    const skin = SKIN_TONES[skinIdx];

    // ── Clear ──
    ctx.clearRect(0, 0, w, h);

    // ── Background fill ──
    const bgGrad = ctx.createRadialGradient(cx, cy - r * 0.2, r * 0.5, cx, cy, r * 1.6);
    bgGrad.addColorStop(0, skin.highlight);
    bgGrad.addColorStop(0.6, skin.shadow);
    bgGrad.addColorStop(1, '#2a2522');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ── Neck ──
    ctx.fillStyle = skin.base;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.35, cy + r * 0.85);
    ctx.quadraticCurveTo(cx - r * 0.3, h, cx - r * 0.1, h);
    ctx.lineTo(cx + r * 0.1, h);
    ctx.quadraticCurveTo(cx + r * 0.3, h, cx + r * 0.35, cy + r * 0.85);
    ctx.fill();

    // ── Face shape (slightly oval) ──
    ctx.fillStyle = skin.base;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.85, r, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Jaw shadow ──
    ctx.fillStyle = skin.shadow + '40';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.5, r * 0.65, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Eye sockets ──
    const eyeY = cy - r * 0.12;
    const eyeSpacing = r * 0.3;
    const eyeR = r * 0.17;

    [{ x: cx - eyeSpacing }, { x: cx + eyeSpacing }].forEach(eye => {
      // Socket shadow
      ctx.fillStyle = skin.shadow + '30';
      ctx.beginPath();
      ctx.ellipse(eye.x, eyeY, eyeR * 1.2, eyeR * 1.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // White
      ctx.fillStyle = '#FEFEFE';
      ctx.beginPath();
      ctx.ellipse(eye.x, eyeY, eyeR, eyeR * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris
      const irisColor = gender === 'male' ? '#4A6741' : '#5B7B4A';
      const irisR = eyeR * 0.55;
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.arc(eye.x, eyeY, irisR, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(eye.x, eyeY, irisR * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eye.x - irisR * 0.25, eyeY - irisR * 0.3, irisR * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Upper eyelid crease
      ctx.strokeStyle = skin.shadow;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(eye.x, eyeY - eyeR * 0.05, eyeR * 1.25, eyeR * 0.9, 0, Math.PI * 1.3, Math.PI * 1.7);
      ctx.stroke();

      // Eyelash line
      ctx.strokeStyle = '#1a1513';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(eye.x, eyeY - eyeR * 0.15, eyeR * 1.15, eyeR * 0.7, Math.PI * 0.15, Math.PI * 0.85, false);
      ctx.stroke();
    });

    // ── Eyebrows ──
    const browY = eyeY - eyeR * 1.3;
    [{ x: cx - eyeSpacing, flip: false }, { x: cx + eyeSpacing, flip: true }].forEach(brow => {
      ctx.strokeStyle = skin.hair[0];
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const bx = brow.x;
      const by = browY;
      ctx.moveTo(bx - eyeR * 1.0, by);
      ctx.quadraticCurveTo(bx - eyeR * 0.3, by - eyeR * 0.4, bx, by - eyeR * 0.3);
      ctx.quadraticCurveTo(bx + eyeR * 0.4, by - eyeR * 0.1, bx + eyeR * 1.0, by);
      ctx.stroke();
    });

    // ── Nose ──
    const noseY = eyeY + r * 0.35;
    ctx.fillStyle = skin.shadow + '40';
    ctx.beginPath();
    ctx.ellipse(cx, noseY, r * 0.09, r * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose bridge shadow
    ctx.strokeStyle = skin.shadow + '30';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, eyeY + eyeR * 0.8);
    ctx.quadraticCurveTo(cx - r * 0.04, noseY - r * 0.04, cx, noseY);
    ctx.stroke();

    // ── Mouth ──
    const mouthY = noseY + r * 0.22;
    const mouthW = r * 0.28;

    // Upper lip
    ctx.fillStyle = skin.lip;
    ctx.beginPath();
    ctx.moveTo(cx - mouthW, mouthY);
    ctx.quadraticCurveTo(cx - mouthW * 0.5, mouthY - r * 0.07, cx, mouthY - r * 0.06);
    ctx.quadraticCurveTo(cx + mouthW * 0.5, mouthY - r * 0.07, cx + mouthW, mouthY);
    ctx.quadraticCurveTo(cx + mouthW * 0.3, mouthY + r * 0.04, cx, mouthY + r * 0.05);
    ctx.quadraticCurveTo(cx - mouthW * 0.3, mouthY + r * 0.04, cx - mouthW, mouthY);
    ctx.fill();

    // Lip line
    ctx.strokeStyle = skin.lip + '90';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - mouthW, mouthY);
    ctx.quadraticCurveTo(cx - mouthW * 0.5, mouthY - r * 0.07, cx, mouthY - r * 0.06);
    ctx.quadraticCurveTo(cx + mouthW * 0.5, mouthY - r * 0.07, cx + mouthW, mouthY);
    ctx.stroke();

    // ── Hair ──
    const hairType = Math.abs(seed % 3);
    const hairColor = skin.hair[hairType];

    ctx.fillStyle = hairColor;
    ctx.beginPath();

    if (gender === 'female') {
      // Long/wavy hair
      ctx.arc(cx, cy - r * 0.1, r * 1.1, Math.PI * 1.1, Math.PI * 1.9, false);
      // Hair falling on sides
      ctx.quadraticCurveTo(cx + r * 1.0, cy + r * 0.6, cx + r * 0.6, h * 0.95);
      ctx.lineTo(cx - r * 0.6, h * 0.95);
      ctx.quadraticCurveTo(cx - r * 1.0, cy + r * 0.6, cx - r * 1.0, cy - r * 0.2);
      // Bangs
      ctx.moveTo(cx - r * 0.85, cy - r * 0.55);
      ctx.quadraticCurveTo(cx - r * 0.4, cy - r * 0.75, cx, cy - r * 0.7);
      ctx.quadraticCurveTo(cx + r * 0.4, cy - r * 0.75, cx + r * 0.85, cy - r * 0.55);
    } else {
      // Shorter/messy hair
      ctx.arc(cx, cy - r * 0.1, r * 1.05, Math.PI * 1.15, Math.PI * 1.85, false);
      ctx.quadraticCurveTo(cx + r * 0.7, cy - r * 0.2, cx + r * 0.5, cy - r * 0.65);
      ctx.quadraticCurveTo(cx + r * 0.3, cy - r * 0.4, cx, cy - r * 0.5);
      ctx.quadraticCurveTo(cx - r * 0.3, cy - r * 0.4, cx - r * 0.5, cy - r * 0.65);
      ctx.quadraticCurveTo(cx - r * 0.7, cy - r * 0.2, cx - r * 0.9, cy - r * 0.3);
    }
    ctx.fill();

    // Hair texture strokes
    ctx.strokeStyle = hairColor + '60';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const sx = cx - r * 0.7 + (r * 1.4 * i / 7);
      ctx.beginPath();
      ctx.moveTo(sx, cy - r * 0.8);
      ctx.quadraticCurveTo(sx + 10, cy - r * 0.3, sx, cy - r * 0.1);
      ctx.stroke();
    }

    // ── Blush ──
    [{ x: cx - eyeSpacing * 0.9 }, { x: cx + eyeSpacing * 0.9 }].forEach(chk => {
      const chkGrad = ctx.createRadialGradient(chk.x, noseY - r * 0.05, 0, chk.x, noseY - r * 0.05, r * 0.2);
      chkGrad.addColorStop(0, 'rgba(255,160,140,0.15)');
      chkGrad.addColorStop(1, 'rgba(255,160,140,0)');
      ctx.fillStyle = chkGrad;
      ctx.beginPath();
      ctx.arc(chk.x, noseY - r * 0.05, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // ── Chin highlight ──
    const chinGrad = ctx.createRadialGradient(cx, cy + r * 0.6, r * 0.05, cx, cy + r * 0.6, r * 0.2);
    chinGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
    chinGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = chinGrad;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.55, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // ── Forehead highlight ──
    const foreGrad = ctx.createRadialGradient(cx, cy - r * 0.5, r * 0.1, cx, cy - r * 0.5, r * 0.5);
    foreGrad.addColorStop(0, 'rgba(255,255,255,0.05)');
    foreGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = foreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.5, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Draw face to offscreen canvas and return ImageData / data URL ──
  function renderFace(name, gender, size, bgColor) {
    const s = size || 300;
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d');
    drawFace(ctx, name, gender, s);
    return canvas;
  }

  function renderFaceDataURL(name, gender, size) {
    return renderFace(name, gender, size).toDataURL('image/jpeg', 0.9);
  }

  // ── Gallery image URLs (procedural, no external deps) ──
  function getGalleryFaces() {
    return [
      { name: 'Maya, 24', style: 'Beauty & Wellness', gender: 'female', seed: 'maya' },
      { name: 'Josh, 28', style: 'Fitness & Nutrition', gender: 'male', seed: 'josh' },
      { name: 'Priya, 25', style: 'Fashion & Style', gender: 'female', seed: 'priya' },
      { name: 'Leo, 32', style: 'Tech & Gaming', gender: 'male', seed: 'leo' },
      { name: 'Ella, 30', style: 'Food & Lifestyle', gender: 'female', seed: 'ella' },
      { name: 'Sophie, 31', style: 'Home & DIY', gender: 'female', seed: 'sophie' },
      { name: 'Oscar, 29', style: 'Travel & Adventure', gender: 'male', seed: 'oscar' },
      { name: 'Luna, 26', style: 'Accessories & Jewellery', gender: 'female', seed: 'luna' },
    ];
  }

  // ── Lifestyle backgrounds (procedural gradients) ──
  const BGS = [
    () => { const c=document.createElement('canvas');c.width=720;c.height=1280;const g=c.getContext('2d').createLinearGradient(0,0,720,1280);g.addColorStop(0,'#2d1b69');g.addColorStop(1,'#16213e');c.getContext('2d').fillStyle=g;c.getContext('2d').fillRect(0,0,720,1280);return c; },
    () => { const c=document.createElement('canvas');c.width=720;c.height=1280;const g=c.getContext('2d').createLinearGradient(0,0,0,1280);g.addColorStop(0,'#1a0a2e');g.addColorStop(0.6,'#0d1b2a');g.addColorStop(1,'#1b2838');c.getContext('2d').fillStyle=g;c.getContext('2d').fillRect(0,0,720,1280);return c; },
    () => { const c=document.createElement('canvas');c.width=720;c.height=1280;const g=c.getContext('2d').createLinearGradient(0,1280,720,0);g.addColorStop(0,'#0f2027');g.addColorStop(0.5,'#203a43');g.addColorStop(1,'#2c5364');c.getContext('2d').fillStyle=g;c.getContext('2d').fillRect(0,0,720,1280);return c; },
    () => { const c=document.createElement('canvas');c.width=720;c.height=1280;const g=c.getContext('2d').createRadialGradient(360,400,100,360,640,700);g.addColorStop(0,'#3a1c71');g.addColorStop(0.5,'#d76d77');g.addColorStop(1,'#0f0c29');c.getContext('2d').fillStyle=g;c.getContext('2d').fillRect(0,0,720,1280);return c; },
  ];
  function getProceduralBg(idx) { return (BGS[idx % BGS.length]()).toDataURL('image/jpeg', 0.8); }

  // Keep old API methods for compatibility
  function getRandomFace(archetype, gender) { return renderFaceDataURL(archetype || 'maya', gender || 'female', 300); }
  function getRandomBackground() { return getProceduralBg(Math.floor(Math.random() * BGS.length)); }
  function getProductShot() { return getProceduralBg(3); }

  return {
    drawFace, renderFace, renderFaceDataURL, getGalleryFaces,
    getRandomFace, getRandomBackground, getProductShot, getProceduralBg,
    SKIN_TONES, BGS,
  };
})();
