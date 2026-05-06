/* ═══════════════════════════════════════════
   VYRL — renderer.js (v5 — live canvas animation, no MediaRecorder)
   Works on file://, localhost, any origin.
   Each preview is a <canvas> running a rAF loop.
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

  function drawBackground(ctx, progress, paletteIdx) {
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
      const px = ((Math.sin(progress * 2.8 + i * 1.9) * 0.5 + 0.5) * W + i * 44) % W;
      const py = ((Math.cos(progress * 2.1 + i * 1.4) * 0.5 + 0.5) * H + i * 70) % H;
      const a  = Math.max(0, 0.025 + Math.sin(progress * 5 + i) * 0.012);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(px, py, 1.2 + i * 0.12, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawPortrait(ctx, faceImg, progress) {
    if (!faceImg) {
      // Placeholder gradient silhouette when no image available
      const grad = ctx.createLinearGradient(0, 0, W, H * 0.68);
      grad.addColorStop(0, 'rgba(80,60,120,0.6)');
      grad.addColorStop(1, 'rgba(40,30,60,0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H * 0.68);
    } else {
      const zoom   = 1 + Math.sin(progress * Math.PI) * 0.03;
      const driftX = Math.sin(progress * Math.PI * 1.1) * 8;
      const driftY = Math.cos(progress * Math.PI * 0.85) * 5
                   + Math.sin(progress * Math.PI * 2) * 2.5;

      const faceAreaH = H * 0.68;

      ctx.save();
      ctx.translate(W / 2 + driftX, faceAreaH / 2 + driftY);
      ctx.scale(zoom, zoom);

      const iW = faceImg.naturalWidth  || faceImg.width  || 512;
      const iH = faceImg.naturalHeight || faceImg.height || 512;
      const iAspect = iW / iH;
      const tAspect = W  / faceAreaH;

      let sw, sh, sx, sy;
      if (iAspect > tAspect) {
        sh = iH; sw = iH * tAspect;
        sx = (iW - sw) / 2; sy = 0;
      } else {
        sw = iW; sh = iW / tAspect;
        sx = 0; sy = (iH - sh) / 4;
      }
      ctx.drawImage(faceImg, sx, sy, sw, sh, -W / 2, -faceAreaH / 2, W, faceAreaH);
      ctx.restore();

      // Talking glow
      const driftX2 = Math.sin(progress * Math.PI * 1.1) * 8;
      const driftY2 = Math.cos(progress * Math.PI * 0.85) * 5 + Math.sin(progress * Math.PI * 2) * 2.5;
      const mouthY  = H * 0.68 * 0.62 + driftY2;
      const mouthX  = W / 2 + driftX2 * 0.4;
      const talkAmp = Math.abs(Math.sin(progress * Math.PI * 9 * DUR));
      if (talkAmp > 0.25) {
        const glow = ctx.createRadialGradient(mouthX, mouthY, 0, mouthX, mouthY, 40);
        glow.addColorStop(0,   `rgba(255,210,160,${talkAmp * 0.15})`);
        glow.addColorStop(0.5, `rgba(255,180,100,${talkAmp * 0.07})`);
        glow.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(mouthX - 55, mouthY - 22, 110, 44);
      }

      // Blink
      const blinkCycle = (progress * DUR) % 3.5;
      if (blinkCycle < 0.12) {
        const blinkAlpha = Math.sin((blinkCycle / 0.12) * Math.PI) * 0.45;
        const eyeY = H * 0.68 * 0.38 + driftY2;
        ctx.fillStyle = `rgba(0,0,0,${blinkAlpha})`;
        ctx.fillRect(W / 2 - 60, eyeY - 10, 120, 20);
      }
    }

    // Bottom fade gradient
    const fade = ctx.createLinearGradient(0, H * 0.68 * 0.38, 0, H);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.35, 'rgba(0,0,0,0.55)');
    fade.addColorStop(0.65, 'rgba(0,0,0,0.82)');
    fade.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);
  }

  function drawCaption(ctx, caption, progress) {
    const reveal = Math.min(progress / 0.72, 1);
    const words  = caption.split(' ');
    const shown  = Math.round(words.length * reveal);
    const text   = words.slice(0, shown).join(' ');

    ctx.font = '700 20px "Geist","Inter",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';

    const lines = []; let cur = '';
    for (const w of text.split(' ')) {
      const trial = cur ? cur + ' ' + w : w;
      if (ctx.measureText(trial).width > W - 48 && cur) {
        lines.push(cur); cur = w;
      } else cur = trial;
    }
    if (cur) lines.push(cur);

    const startY = H * 0.74;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 14;
    lines.forEach((l, i) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(l, W / 2, startY + i * 28);
    });
    ctx.restore();
  }

  function drawUI(ctx, progress, platform, influencerName, voiceAccent) {
    const railX = W - 22;
    const baseY = H * 0.60;

    // Avatar circle
    ctx.beginPath(); ctx.arc(railX, baseY, 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px "Geist",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((influencerName[0] || '?').toUpperCase(), railX, baseY);

    // Action buttons
    ['♥','💬','↗','☆'].forEach((icon, i) => {
      const y = baseY + 32 + i * 32;
      ctx.beginPath(); ctx.arc(railX, y, 13, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(icon, railX, y);
    });

    // Handle + accent (bottom-left)
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 6;
    ctx.font = '700 11px "Geist",sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(`@${influencerName.toLowerCase()}`, 12, H - 58);
    ctx.font = '400 9px "Geist",sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(voiceAccent, 12, H - 46);
    ctx.restore();

    // Platform badge
    ctx.font = '600 9px "Geist",sans-serif'; ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(platform, W - 12, 24);

    // VYRL watermark
    ctx.font = '600 8px "Geist",sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText('VYRL', W - 12, H - 8);

    // Progress stripe
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, H - 3, W, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(0, H - 3, W * progress, 3);
  }

  /* ── Create a live animated canvas preview ── */
  async function renderPreview(influencer, videoData, paletteIdx) {
    // Load face image
    const faceDataUrl = pickFaceDataUrl(influencer);
    let faceImg = null;
    if (faceDataUrl) {
      try { faceImg = await loadImage(faceDataUrl); } catch (_) {}
    }
    if (!faceImg && typeof VYRLFaces !== 'undefined') {
      try { faceImg = VYRLFaces.renderFace(influencer.name, influencer.gender || 'female', 512); } catch (_) {}
    }

    const canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    canvas.style.cssText = 'width:100%;aspect-ratio:9/16;display:block;border-radius:10px;background:#111;';

    const ctx = canvas.getContext('2d');
    const voiceAccent = influencer.voice?.name || 'RP';
    let startTime = null;
    let rafId = null;
    let running = false;

    function paint(progress) {
      ctx.clearRect(0, 0, W, H);
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
      running = true;
      startTime = null;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    // Draw first frame immediately so canvas isn't blank
    paint(0.08);

    // Attach start/stop to canvas for IntersectionObserver
    canvas._previewStart = start;
    canvas._previewStop  = stop;

    return canvas;
  }

  /* ── Batch render (returns live canvases) ── */
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
