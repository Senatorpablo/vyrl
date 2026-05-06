/* ═══════════════════════════════════════════
   VYRL — renderer.js (v6 — crisp DPR canvas, visible face motion)
   ═══════════════════════════════════════════ */

const VYRLRenderer = (() => {
  'use strict';

  const W = 405, H = 720, FPS = 30, DUR = 8;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) { reject(new Error('no src')); return; }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('load failed'));
      img.src = src;
    });
  }

  function pickFaceDataUrl(influencer) {
    if (typeof RealFaces === 'undefined') return null;
    const gallery = RealFaces.getGalleryFaces();
    if (!gallery || !gallery.length) return null;
    const byName = gallery.find(f => f.name.toLowerCase() === influencer.name.toLowerCase());
    if (byName && byName.faceData) return byName.faceData;
    const gender = influencer.gender || 'female';
    const byGender = gallery.filter(f => f.gender === gender);
    if (byGender.length) return byGender[Math.floor(Math.random() * byGender.length)].faceData;
    return gallery[0].faceData;
  }

  function drawBackground(ctx, t, paletteIdx) {
    const palettes = [
      ['#140820', '#0a1020'], ['#0e1f26', '#0a1628'],
      ['#1a0d28', '#0d0a1e'], ['#0a1a10', '#101a0a'],
      ['#200a10', '#0a1020'], ['#0a0a20', '#200a18'],
      ['#101420', '#0a1820'], ['#1e0a14', '#140a1e'],
    ];
    const [c1, c2] = palettes[paletteIdx % palettes.length];
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, c1); bg.addColorStop(1, c2);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 14; i++) {
      const px = ((Math.sin(t * 2.8 + i * 1.9) * 0.5 + 0.5) * W + i * 44) % W;
      const py = ((Math.cos(t * 2.1 + i * 1.4) * 0.5 + 0.5) * H + i * 70) % H;
      const a  = Math.max(0, 0.03 + Math.sin(t * 5 + i) * 0.015);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* ── Portrait with visible Ken Burns + head motion ── */
  function drawPortrait(ctx, faceImg, progress) {
    const faceAreaH = H * 0.70;

    if (!faceImg) {
      const grad = ctx.createLinearGradient(0, 0, W, faceAreaH);
      grad.addColorStop(0, 'rgba(80,60,120,0.6)');
      grad.addColorStop(1, 'rgba(40,30,60,0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, faceAreaH);
    } else {
      // ── Visible motion: large enough to see ──
      const t = progress;

      // Ken Burns zoom: 1.0 → 1.14 over 8s (clearly visible)
      const zoom = 1 + Math.sin(t * Math.PI) * 0.07;

      // Slow lateral sway — head moves left/right
      const driftX = Math.sin(t * Math.PI * 0.9) * 22;

      // Slow vertical drift (looking down then up)
      const driftY = Math.cos(t * Math.PI * 0.7) * 14;

      // Head-bob: 1.5 cycles over 8s — like natural talking movement
      const headBob = Math.sin(t * Math.PI * 2 * 1.5 * DUR / DUR) * 10;

      // Speaking micro-bounce: fast small bounce while talking (3 Hz)
      const speakBounce = Math.abs(Math.sin(t * Math.PI * 3 * DUR / DUR)) * 5;

      // Total vertical offset
      const totalY = driftY + headBob + speakBounce;

      // Slight head tilt (rotate)
      const tilt = Math.sin(t * Math.PI * 1.1) * 0.018; // ~1° max

      ctx.save();
      ctx.translate(W / 2 + driftX, faceAreaH / 2 + totalY);
      ctx.rotate(tilt);
      ctx.scale(zoom, zoom);

      const iW = faceImg.naturalWidth  || faceImg.width  || 512;
      const iH = faceImg.naturalHeight || faceImg.height || 512;
      const iAspect = iW / iH;
      const tAspect = W  / faceAreaH;

      let sw, sh, sx, sy;
      if (iAspect > tAspect) {
        sh = iH; sw = iH * tAspect; sx = (iW - sw) / 2; sy = 0;
      } else {
        sw = iW; sh = iW / tAspect; sx = 0; sy = (iH - sh) / 4;
      }
      ctx.drawImage(faceImg, sx, sy, sw, sh, -W / 2, -faceAreaH / 2, W, faceAreaH);
      ctx.restore();

      // ── Talking glow at mouth area ──
      const mouthY = faceAreaH * 0.60 + totalY;
      const mouthX = W / 2 + driftX * 0.3;
      // Fast flicker at ~8 Hz (speech rate)
      const talkPhase = Math.sin(t * Math.PI * 8 * DUR / DUR);
      const talkAmp   = Math.abs(talkPhase) * 0.5 + 0.2; // always some glow, pulses
      const glow = ctx.createRadialGradient(mouthX, mouthY, 0, mouthX, mouthY, 55);
      glow.addColorStop(0,   `rgba(255,220,160,${talkAmp * 0.22})`);
      glow.addColorStop(0.5, `rgba(255,170, 80,${talkAmp * 0.10})`);
      glow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouthX - 70, mouthY - 30, 140, 60);

      // ── Blink every 3.5 s ──
      const blinkCycle = (t * DUR) % 3.5;
      if (blinkCycle < 0.13) {
        const eyeY = faceAreaH * 0.37 + totalY;
        const ba   = Math.sin((blinkCycle / 0.13) * Math.PI) * 0.85; // solid blink
        ctx.fillStyle = `rgba(0,0,0,${ba})`;
        ctx.fillRect(W / 2 - 75, eyeY - 13, 150, 26);
      }
    }

    // Bottom fade
    const fade = ctx.createLinearGradient(0, H * 0.35, 0, H);
    fade.addColorStop(0,    'rgba(0,0,0,0)');
    fade.addColorStop(0.38, 'rgba(0,0,0,0.52)');
    fade.addColorStop(0.65, 'rgba(0,0,0,0.80)');
    fade.addColorStop(1,    'rgba(0,0,0,0.96)');
    ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);
  }

  /* ── Typewriter caption ── */
  function drawCaption(ctx, caption, progress) {
    const reveal = Math.min(progress / 0.75, 1);
    const words  = caption.split(' ');
    const shown  = Math.round(words.length * reveal);
    const text   = words.slice(0, shown).join(' ');

    ctx.font = '700 22px "Geist","Inter",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';

    const maxW  = W - 52;
    const lines = []; let cur = '';
    for (const w of text.split(' ')) {
      const trial = cur ? cur + ' ' + w : w;
      if (ctx.measureText(trial).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = trial;
    }
    if (cur) lines.push(cur);

    const startY = H * 0.73;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.95)'; ctx.shadowBlur = 18;
    lines.forEach((l, i) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(l, W / 2, startY + i * 30);
    });
    ctx.restore();
  }

  /* ── TikTok-style UI rail ── */
  function drawUI(ctx, progress, platform, influencerName, voiceAccent) {
    const railX = W - 24;
    const baseY = H * 0.58;

    ctx.beginPath(); ctx.arc(railX, baseY, 15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Geist",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((influencerName[0] || '?').toUpperCase(), railX, baseY);

    ['♥','💬','↗','☆'].forEach((icon, i) => {
      const y = baseY + 36 + i * 36;
      ctx.beginPath(); ctx.arc(railX, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(icon, railX, y);
    });

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 8;
    ctx.font = '700 12px "Geist",sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
    ctx.fillText(`@${influencerName.toLowerCase()}`, 14, H - 60);
    ctx.font = '400 10px "Geist",sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(voiceAccent, 14, H - 46);
    ctx.restore();

    ctx.font = '600 10px "Geist",sans-serif'; ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(platform, W - 14, 26);

    ctx.font = '600 9px "Geist",sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText('VYRL', W - 14, H - 10);

    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(0, H - 3, W, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(0, H - 3, W * progress, 3);
  }

  /* ── Create a live animated canvas preview ── */
  async function renderPreview(influencer, videoData, paletteIdx) {
    const faceDataUrl = pickFaceDataUrl(influencer);
    let faceImg = null;
    if (faceDataUrl) {
      try { faceImg = await loadImage(faceDataUrl); } catch (_) {}
    }
    if (!faceImg && typeof VYRLFaces !== 'undefined') {
      try { faceImg = VYRLFaces.renderFace(influencer.name, influencer.gender || 'female', 512); } catch (_) {}
    }

    // Use device pixel ratio for crisp rendering on retina/HiDPI screens
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const canvas = document.createElement('canvas');
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.cssText = 'width:100%;aspect-ratio:9/16;display:block;border-radius:10px;background:#111;image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges;';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr); // all drawing coords stay in logical pixels

    const voiceAccent = influencer.voice?.name || 'RP';
    let startTime = null;
    let rafId = null;
    let running = false;

    function paint(progress) {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset to scaled baseline
      ctx.clearRect(0, 0, W, H);
      ctx.restore();
      drawBackground(ctx, progress, paletteIdx);
      drawPortrait(ctx, faceImg, progress);
      drawCaption(ctx, videoData.caption || 'Generated content', progress);
      drawUI(ctx, progress, videoData.platform || 'TikTok', influencer.name, voiceAccent);
    }

    function loop(ts) {
      if (!running) return;
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      const progress = (elapsed % DUR) / DUR;
      paint(progress);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true; startTime = null;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    paint(0.08); // first frame immediately

    canvas._previewStart = start;
    canvas._previewStop  = stop;

    return canvas;
  }

  /* ── Batch render ── */
  async function renderBatch(influencer, videoDatas, onProgress) {
    const results = [];
    for (let i = 0; i < videoDatas.length; i++) {
      onProgress?.(i, videoDatas.length, `Preparing preview ${i + 1} / ${videoDatas.length}…`);
      try {
        const canvas = await renderPreview(influencer, videoDatas[i], i);
        results.push({ ...videoDatas[i], canvas });
      } catch (err) {
        console.error('Preview error:', err);
        results.push({ ...videoDatas[i], error: err.message });
      }
    }
    return results;
  }

  return { renderPreview, renderBatch, WIDTH: W, HEIGHT: H, DURATION_SEC: DUR, FPS };
})();
