/* ═══════════════════════════════════════════
   VYRL — renderer.js (rebuilt with real faces)
   Client-side Canvas + MediaRecorder video renderer
   Composites real portrait images + lifestyle backgrounds
   Full TikTok UGC look
   ═══════════════════════════════════════════ */

const VYRLRenderer = (() => {
  'use strict';

  const WIDTH = 720;
  const HEIGHT = 1280;
  const FPS = 24;
  const DURATION_SEC = 8;

  // ── Image cache ──
  const imageCache = new Map();

  async function loadImage(url) {
    if (imageCache.has(url)) return imageCache.get(url);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { imageCache.set(url, img); resolve(img); };
      img.onerror = () => {
        // Return null silently — we'll draw fallback
        imageCache.set(url, null);
        resolve(null);
      };
      img.src = url;
    });
  }

  // ── Draw TikTok-style video ──
  function drawBackground(ctx, bgImg, progress) {
    // Ken Burns effect
    const scale = 1 + progress * 0.08;
    const shiftX = Math.sin(progress * 0.7) * 15;
    const shiftY = Math.cos(progress * 0.5) * 10;

    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(scale, scale);
    ctx.translate(-WIDTH / 2 + shiftX, -HEIGHT / 2 + shiftY);

    if (bgImg) {
      // Scale to fill
      const imgRatio = bgImg.width / bgImg.height;
      const canvasRatio = WIDTH / HEIGHT;
      let sw, sh, sx, sy;
      if (imgRatio > canvasRatio) {
        sh = bgImg.height;
        sw = sh * canvasRatio;
        sx = (bgImg.width - sw) / 2;
        sy = 0;
      } else {
        sw = bgImg.width;
        sh = sw / canvasRatio;
        sx = 0;
        sy = (bgImg.height - sh) / 2;
      }
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, WIDTH, HEIGHT);
    } else {
      // Fallback gradient
      const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      grad.addColorStop(0, '#1a0525');
      grad.addColorStop(1, '#0a0a0b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    ctx.restore();

    // Dark overlays for readability
    const overlayGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    overlayGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
    overlayGrad.addColorStop(0.4, 'rgba(0,0,0,0.05)');
    overlayGrad.addColorStop(0.8, 'rgba(0,0,0,0.5)');
    overlayGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Vignette
    const vignetteGrad = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, WIDTH * 0.35, WIDTH / 2, HEIGHT / 2, WIDTH * 0.7);
    vignetteGrad.addColorStop(0, 'transparent');
    vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawFaceCircle(ctx, faceImg, palette, progress) {
    const cx = WIDTH / 2;
    const cy = HEIGHT * 0.24;
    const radius = 140;

    // Subtle float + tilt
    const floatY = Math.sin(progress * Math.PI * 2.5) * 4;
    const tilt = Math.sin(progress * Math.PI * 3.1) * 0.03;

    ctx.save();
    ctx.translate(cx, cy + floatY);
    ctx.rotate(tilt);

    // Glow ring
    ctx.beginPath();
    ctx.arc(0, 4, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = palette.accent + '30';
    ctx.lineWidth = 3;
    ctx.shadowColor = palette.accent;
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();

    // Draw face or fallback
    if (faceImg) {
      const size = radius * 2;
      ctx.drawImage(faceImg, -radius, -radius * 0.15, size, size * 1.15);
    } else {
      // Gradient fallback
      const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      grad.addColorStop(0, palette.accent);
      grad.addColorStop(1, palette.accent + '40');
      ctx.fillStyle = grad;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      // Initial
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${radius}px "Geist", "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, 10);
    }

    // Inner glow overlay
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${parseHexRgb(palette.accent)},0.08)`;
    ctx.fill();

    ctx.restore();
  }

  function drawTikTokSidebar(ctx, palette, influencerName, sideX) {
    const cx = WIDTH - 36 - sideX;
    const startY = HEIGHT * 0.68;

    // Profile mini
    ctx.beginPath();
    ctx.arc(cx, startY, 22, 0, Math.PI * 2);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = palette.accent + '50';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Geist", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(influencerName.charAt(0), cx, startY);

    // Action buttons
    const buttons = ['♥', '💬', '↗', '☆'];
    let by = startY + 50;
    ctx.font = '22px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    buttons.forEach(btn => {
      ctx.beginPath();
      ctx.arc(cx, by, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(btn, cx, by);
      by += 48;
    });
  }

  function drawBrandCaption(ctx, palette, caption, progress) {
    const revealProgress = Math.min(progress * 2.4, 1);
    const words = caption.split(' ');
    let charCount = 0;
    let wordIdx = 0;
    for (let i = 0; i < words.length; i++) {
      charCount += words[i].length + 1;
      if (charCount > caption.length * revealProgress) { wordIdx = i; break; }
      wordIdx = i + 1;
    }
    const visibleWords = words.slice(0, wordIdx);

    // Wrap text
    const maxWidth = WIDTH - 80;
    const fontSize = 38;
    ctx.font = `700 ${fontSize}px/1.3 "Geist", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const lines = [];
    let current = '';
    for (const w of visibleWords) {
      const test = current ? current + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    // Draw
    const startY = HEIGHT * 0.72;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    lines.forEach((line, i) => {
      ctx.fillStyle = '#F4F4F5';
      ctx.fillText(line, WIDTH / 2, startY + i * (fontSize * 1.35));
    });
    ctx.restore();
  }

  function drawBrandPill(ctx, palette, brandHandle, progress) {
    const slideProgress = Math.max(0, Math.min((progress - 0.35) * 3, 1));
    const text = `@${brandHandle}`;
    ctx.font = '600 28px "Geist", "Inter", sans-serif';
    const tw = ctx.measureText(text).width;
    const pw = tw + 48, ph = 44;
    const px = (WIDTH - pw) / 2;
    const py = HEIGHT * 0.88 - (1 - slideProgress) * 50;

    ctx.globalAlpha = slideProgress;
    // Pill bg
    ctx.beginPath();
    roundRectPath(ctx, px, py, pw, ph, 22);
    ctx.fillStyle = palette.accent + '18';
    ctx.fill();
    ctx.strokeStyle = palette.accent + '35';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Text
    ctx.fillStyle = palette.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, WIDTH / 2, py + ph / 2);
    ctx.globalAlpha = 1;
  }

  function drawTikTokBottomUI(ctx, palette, progress, platform, influencerName, voiceAccent) {
    // Handle + voice label
    ctx.font = '700 16px "Geist", "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`@${influencerName.toLowerCase()} • ${voiceAccent}`, 20, HEIGHT - 65);
    ctx.shadowBlur = 0;

    // Platform
    ctx.font = '600 13px "Geist", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(platform, WIDTH - 20, 40);

    // VYRL watermark
    ctx.font = '600 12px "Geist", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillText('VYRL', WIDTH - 20, HEIGHT - 18);

    // Progress bar
    const barY = HEIGHT - 10;
    ctx.beginPath();
    roundRectPath(ctx, 16, barY, WIDTH - 32, 4, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.beginPath();
    roundRectPath(ctx, 16, barY, (WIDTH - 32) * progress, 4, 2);
    ctx.fillStyle = palette.accent + '60';
    ctx.fill();
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function parseHexRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  // ── Main render ──
  async function renderVideo(influencer, videoData, paletteIdx = 0) {
    const palette = {
      accent: ['#EC4899', '#06B6D4', '#7C3AED', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'][paletteIdx % 8],
    };

    // Load images
    const faceUrl = videoData.faceUrl || VYRLFaces.getRandomFace(videoData.industry || 'beauty', influencer.gender || 'female');
    const bgUrl = videoData.backgroundUrl || VYRLFaces.getRandomBackground();

    const [faceImg, bgImg] = await Promise.all([
      loadImage(faceUrl),
      loadImage(bgUrl),
    ]);

    const totalFrames = Math.ceil(DURATION_SEC * FPS);
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(FPS);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8';
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3000000 });

    const recordingDone = new Promise(resolve => {
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    });

    recorder.start();
    const startTime = performance.now();
    const frameDuration = 1000 / FPS;

    for (let frame = 0; frame < totalFrames; frame++) {
      const targetTime = startTime + frame * frameDuration;
      const now = performance.now();
      if (now < targetTime) await sleep(targetTime - now);

      const progress = frame / totalFrames;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      drawBackground(ctx, bgImg, progress);
      drawFaceCircle(ctx, faceImg, palette, progress);
      drawTikTokSidebar(ctx, palette, influencer.name, 0);
      drawBrandCaption(ctx, palette, videoData.caption, progress);
      drawBrandPill(ctx, palette, videoData.brandHandle || videoData.brandName?.toLowerCase(), progress);
      drawTikTokBottomUI(ctx, palette, progress, videoData.platform, influencer.name, influencer.voice?.name || 'RP');
    }

    await sleep(100);
    recorder.stop();
    const blob = await recordingDone;

    // Poster
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBackground(ctx, bgImg, 0);
    drawFaceCircle(ctx, faceImg, palette, 0);
    drawTikTokSidebar(ctx, palette, influencer.name, 0);
    drawBrandCaption(ctx, palette, videoData.caption, 0.05);
    drawBrandPill(ctx, palette, videoData.brandHandle || videoData.brandName?.toLowerCase(), 0);
    drawTikTokBottomUI(ctx, palette, 0, videoData.platform, influencer.name, influencer.voice?.name || 'RP');
    const poster = canvas.toDataURL('image/jpeg', 0.85);

    return {
      blob,
      poster,
      url: URL.createObjectURL(blob),
      width: WIDTH,
      height: HEIGHT,
      duration: DURATION_SEC,
    };
  }

  async function renderBatch(influencer, videoDatas, onProgress) {
    const results = [];
    for (let i = 0; i < videoDatas.length; i++) {
      onProgress?.(i, videoDatas.length, `Rendering video ${i + 1}/${videoDatas.length}...`);
      try {
        const result = await renderVideo(influencer, videoDatas[i], i);
        results.push({ ...videoDatas[i], ...result });
      } catch (err) {
        console.error(`Render failed for video ${i}:`, err);
        results.push({ ...videoDatas[i], error: err.message });
      }
    }
    return results;
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  return { renderVideo, renderBatch, WIDTH, HEIGHT, DURATION_SEC, FPS };
})();
