/* ═══════════════════════════════════════════
   VYRL — renderer.js (v4 — real-face portrait videos)
   Uses embedded real face photos from RealFaces library.
   Adds Ken Burns motion, head-bob, talking-glow, and
   typewriter captions so videos look like actual UGC.
   ═══════════════════════════════════════════ */

const VYRLRenderer = (() => {
  'use strict';

  const W = 720, H = 1280, FPS = 24, DUR = 8;

  /* ── Load an image from a data-URI or URL ── */
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) { reject(new Error('no src')); return; }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('load failed'));
      img.src = src;
    });
  }

  /* ── Pick the best face image for this influencer ── */
  function pickFaceDataUrl(influencer) {
    if (typeof RealFaces === 'undefined') return null;
    const gallery = RealFaces.getGalleryFaces();
    if (!gallery || !gallery.length) return null;

    // Exact name match first
    const byName = gallery.find(
      f => f.name.toLowerCase() === influencer.name.toLowerCase()
    );
    if (byName && byName.faceData) return byName.faceData;

    // Same gender
    const gender = influencer.gender || 'female';
    const byGender = gallery.filter(f => f.gender === gender);
    if (byGender.length) {
      const pick = byGender[Math.floor(Math.random() * byGender.length)];
      return pick.faceData;
    }

    return gallery[0].faceData;
  }

  /* ── Dark gradient background with floating dust ── */
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

    // Subtle floating dust particles
    for (let i = 0; i < 14; i++) {
      const px = ((Math.sin(progress * 2.8 + i * 1.9) * 0.5 + 0.5) * W + i * 44) % W;
      const py = ((Math.cos(progress * 2.1 + i * 1.4) * 0.5 + 0.5) * H + i * 70) % H;
      const a = Math.max(0, 0.025 + Math.sin(progress * 5 + i) * 0.012);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(px, py, 1.2 + i * 0.12, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* ── Portrait face layer with Ken Burns + head-bob + talking glow ── */
  function drawPortrait(ctx, faceImg, progress) {
    if (!faceImg) return;

    // --- Ken Burns: slow zoom from 1.0 → 1.06, slight lateral drift ---
    const zoom   = 1 + Math.sin(progress * Math.PI) * 0.03;          // breathes in/out
    const driftX = Math.sin(progress * Math.PI * 1.1) * 10;          // left/right sway
    const driftY = Math.cos(progress * Math.PI * 0.85) * 6           // up/down sway
                 + Math.sin(progress * Math.PI * 2)    * 3;           // head-bob

    // Face occupies the top ~68% of the frame
    const faceAreaH = H * 0.68;

    ctx.save();
    ctx.translate(W / 2 + driftX, faceAreaH / 2 + driftY);
    ctx.scale(zoom, zoom);

    // Cover-fit the photo into the face area
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
      sx = 0; sy = (iH - sh) / 4; // bias toward top (face, not torso)
    }

    ctx.drawImage(faceImg, sx, sy, sw, sh, -W / 2, -faceAreaH / 2, W, faceAreaH);
    ctx.restore();

    // --- Bottom fade: dark gradient covers lower face + caption zone ---
    const fade = ctx.createLinearGradient(0, faceAreaH * 0.38, 0, H);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.35, 'rgba(0,0,0,0.55)');
    fade.addColorStop(0.65, 'rgba(0,0,0,0.82)');
    fade.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);

    // --- Talking glow: fast-oscillating warm highlight at mouth area ---
    // Mouth is roughly at 62% of faceAreaH, centred
    const mouthY  = faceAreaH * 0.62 + driftY;
    const mouthX  = W / 2       + driftX * 0.4;
    const talkHz  = 9;  // beats per second — typical speech rate
    const talkAmp = Math.abs(Math.sin(progress * Math.PI * talkHz * DUR));
    if (talkAmp > 0.25) {
      const glow = ctx.createRadialGradient(mouthX, mouthY, 0, mouthX, mouthY, 52);
      glow.addColorStop(0,   `rgba(255,210,160,${talkAmp * 0.13})`);
      glow.addColorStop(0.5, `rgba(255,180,100,${talkAmp * 0.06})`);
      glow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouthX - 70, mouthY - 28, 140, 56);
    }

    // --- Blink: every ~3.5 s, briefly darken the eye area ---
    const blinkCycle = (progress * DUR) % 3.5;
    if (blinkCycle < 0.12) {
      const blinkAlpha = Math.sin((blinkCycle / 0.12) * Math.PI) * 0.45;
      const eyeY = faceAreaH * 0.38 + driftY;
      ctx.fillStyle = `rgba(0,0,0,${blinkAlpha})`;
      ctx.fillRect(W / 2 - 80, eyeY - 14, 160, 28);
    }
  }

  /* ── Typewriter caption with word wrap ── */
  function drawCaption(ctx, caption, progress) {
    // Reveal words linearly over the first 72 % of the clip
    const reveal = Math.min(progress / 0.72, 1);
    const words  = caption.split(' ');
    const shown  = Math.round(words.length * reveal);
    const text   = words.slice(0, shown).join(' ');

    ctx.font = '700 38px "Geist","Inter",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';

    // Wrap to lines
    const lines = []; let cur = '';
    for (const w of text.split(' ')) {
      const trial = cur ? cur + ' ' + w : w;
      if (ctx.measureText(trial).width > W - 88 && cur) {
        lines.push(cur); cur = w;
      } else cur = trial;
    }
    if (cur) lines.push(cur);

    const startY = H * 0.74;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 18;
    lines.forEach((l, i) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(l, W / 2, startY + i * 54);
    });
    ctx.restore();
  }

  /* ── TikTok-style right-rail UI + watermark + progress bar ── */
  function drawUI(ctx, progress, platform, influencerName, voiceAccent) {
    const railX = W - 38;
    const baseY = H * 0.64;

    // Avatar circle
    ctx.beginPath(); ctx.arc(railX, baseY, 23, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px "Geist",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(influencerName[0].toUpperCase(), railX, baseY);

    // Action buttons
    ['♥','💬','↗','☆'].forEach((icon, i) => {
      const y = baseY + 52 + i * 52;
      ctx.beginPath(); ctx.arc(railX, y, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(icon, railX, y);
    });

    // Handle + accent (bottom-left)
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 8;
    ctx.font = '700 16px "Geist",sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(`@${influencerName.toLowerCase()}`, 18, H - 96);
    ctx.font = '400 13px "Geist",sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(voiceAccent, 18, H - 76);
    ctx.restore();

    // Platform badge
    ctx.font = '600 12px "Geist",sans-serif'; ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(platform, W - 18, 38);

    // VYRL watermark
    ctx.font = '600 11px "Geist",sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillText('VYRL', W - 18, H - 14);

    // Bottom progress stripe
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, H - 3, W, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(0, H - 3, W * progress, 3);
  }

  /* ── Render one video clip ── */
  async function renderVideo(influencer, videoData, paletteIdx) {
    // Load the real face photo
    const faceDataUrl = pickFaceDataUrl(influencer);
    let faceImg = null;
    if (faceDataUrl) {
      try { faceImg = await loadImage(faceDataUrl); } catch (_) { /* fall through */ }
    }

    // Fallback: procedural canvas face
    if (!faceImg && typeof VYRLFaces !== 'undefined') {
      faceImg = VYRLFaces.renderFace(influencer.name, influencer.gender || 'female', 720);
    }

    const totalFrames = Math.ceil(DUR * FPS);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(FPS);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8';
    const chunks = [];
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3_500_000 });
    const done = new Promise(res => {
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => res(new Blob(chunks, { type: 'video/webm' }));
    });

    rec.start();
    const t0 = performance.now();
    const fd = 1000 / FPS;

    for (let f = 0; f < totalFrames; f++) {
      const target = t0 + f * fd;
      const lag = target - performance.now();
      if (lag > 0) await new Promise(r => setTimeout(r, lag));

      const progress = f / totalFrames;
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, progress, paletteIdx);
      drawPortrait(ctx, faceImg, progress);
      drawCaption(ctx, videoData.caption, progress);
      drawUI(ctx, progress, videoData.platform, influencer.name, influencer.voice?.name || 'RP');
    }

    await new Promise(r => setTimeout(r, 150));
    rec.stop();
    const blob = await done;

    // Poster at 8 % progress (early in clip, face visible)
    const tp = 0.08;
    ctx.clearRect(0, 0, W, H);
    drawBackground(ctx, tp, paletteIdx);
    drawPortrait(ctx, faceImg, tp);
    drawCaption(ctx, videoData.caption, tp);
    drawUI(ctx, tp, videoData.platform, influencer.name, influencer.voice?.name || 'RP');
    const poster = canvas.toDataURL('image/jpeg', 0.85);

    return { blob, poster, url: URL.createObjectURL(blob), width: W, height: H, duration: DUR };
  }

  /* ── Batch render ── */
  async function renderBatch(influencer, videoDatas, onProgress) {
    const results = [];
    for (let i = 0; i < videoDatas.length; i++) {
      onProgress?.(i, videoDatas.length, `Rendering video ${i + 1} / ${videoDatas.length}…`);
      try {
        const r = await renderVideo(influencer, videoDatas[i], i);
        results.push({ ...videoDatas[i], ...r });
      } catch (err) {
        console.error('Render error:', err);
        results.push({ ...videoDatas[i], error: err.message });
      }
    }
    return results;
  }

  return { renderVideo, renderBatch, WIDTH: W, HEIGHT: H, DURATION_SEC: DUR, FPS };
})();
