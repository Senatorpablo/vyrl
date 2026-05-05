/* ═══════════════════════════════════════════
   VYRL — renderer.js
   Client-side Canvas video renderer
   Renders real TikTok-style UGC videos in-browser
   using Canvas + MediaRecorder → WebM
   ═══════════════════════════════════════════ */

const VYRLRenderer = (() => {
  'use strict';

  // 9:16 TikTok/Reels/Shorts aspect ratio
  const WIDTH = 720;
  const HEIGHT = 1280;
  const FPS = 24;
  const DURATION_SEC = 8; // 8-second reels

  // ── Color palettes ──
  const PALETTES = [
    { bg: '#1a0525', accent: '#7C3AED', text: '#F4F4F5', glow: 'rgba(124,58,237,0.3)' },
    { bg: '#0a1628', accent: '#06B6D4', text: '#F4F4F5', glow: 'rgba(6,182,212,0.3)' },
    { bg: '#1a0a2e', accent: '#EC4899', text: '#F4F4F5', glow: 'rgba(236,72,153,0.3)' },
    { bg: '#0f1a0a', accent: '#22C55E', text: '#F4F4F5', glow: 'rgba(34,197,94,0.3)' },
    { bg: '#1a1505', accent: '#F59E0B', text: '#F4F4F5', glow: 'rgba(245,158,11,0.3)' },
    { bg: '#0a0a20', accent: '#8B5CF6', text: '#F4F4F5', glow: 'rgba(139,92,246,0.3)' },
    { bg: '#200a0a', accent: '#EF4444', text: '#F4F4F5', glow: 'rgba(239,68,68,0.3)' },
    { bg: '#0a1a1a', accent: '#14B8A6', text: '#F4F4F5', glow: 'rgba(20,184,166,0.3)' },
  ];

  function pickPalette(idx) {
    return PALETTES[idx % PALETTES.length];
  }

  // ── Draw gradient background ──
  function drawBackground(ctx, palette, frame, totalFrames) {
    const progress = frame / totalFrames;

    // Animated radial gradient
    const cx = WIDTH / 2 + Math.sin(progress * Math.PI * 2) * 80;
    const cy = HEIGHT / 2 + Math.cos(progress * Math.PI * 2.3) * 120;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, WIDTH);
    grad.addColorStop(0, palette.accent + '15');
    grad.addColorStop(0.4, palette.bg);
    grad.addColorStop(1, '#000000');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Floating particles (subtle)
    for (let i = 0; i < 12; i++) {
      const px = (WIDTH * 0.3 + Math.sin(progress * 3 + i * 1.7) * WIDTH * 0.35 + i * 30) % WIDTH;
      const py = (HEIGHT * 0.3 + Math.cos(progress * 2.5 + i * 1.3) * HEIGHT * 0.35 + i * 20) % HEIGHT;
      const alpha = 0.03 + Math.sin(progress * 4 + i) * 0.02;
      ctx.fillStyle = palette.accent + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(px, py, 2 + i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Draw influencer avatar circle ──
  function drawAvatar(ctx, palette, influencer, frame, totalFrames) {
    const progress = frame / totalFrames;
    const cx = WIDTH / 2;
    const cy = HEIGHT * 0.27;
    const radius = 90;

    // Pulsing glow ring
    const pulseScale = 1 + Math.sin(progress * Math.PI * 2 * 0.8) * 0.08;
    ctx.save();
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 40 + Math.sin(progress * 4) * 10;

    // Outer ring
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * pulseScale + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Avatar circle with gradient
    const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    grad.addColorStop(0, palette.accent);
    grad.addColorStop(1, palette.accent + '80');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Initial
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${radius}px "Geist", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(influencer.name.charAt(0).toUpperCase(), cx, cy + 4);

    // Small sparkle effects around avatar
    for (let i = 0; i < 4; i++) {
      const angle = progress * 2 + (i * Math.PI) / 2;
      const sx = cx + Math.cos(angle) * (radius + 20);
      const sy = cy + Math.sin(angle) * (radius + 20);
      const sparkAlpha = 0.3 + Math.sin(progress * 6 + i) * 0.2;

      ctx.fillStyle = palette.accent + Math.floor(sparkAlpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      // Tiny star shape
      drawSparkle(ctx, sx, sy, 6);
      ctx.fill();
    }
  }

  function drawSparkle(ctx, x, y, size) {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.3, y - size * 0.3);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size * 0.3, y + size * 0.3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.3, y + size * 0.3);
    ctx.lineTo(x - size, y);
    ctx.lineTo(x - size * 0.3, y - size * 0.3);
    ctx.closePath();
  }

  // ── Typewriter text renderer ──
  function drawCaption(ctx, palette, videoData, frame, totalFrames) {
    const text = videoData.caption;
    const revealProgress = Math.min((frame / totalFrames) * 2.2, 1); // full text by ~45% of video
    const charCount = Math.floor(text.length * easeOutCubic(revealProgress));

    const displayed = text.slice(0, charCount);

    // Handle text wrapping
    const maxWidth = WIDTH - 100;
    const fontSize = 38;
    ctx.font = `600 ${fontSize}px/1.35 "Geist", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const words = displayed.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Draw text with glow
    const startY = HEIGHT * 0.46;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 15;

    lines.forEach((line, i) => {
      const y = startY + i * (fontSize * 1.35);
      // Slight fade-in for the last line being typed
      const lineAlpha = i === lines.length - 1 && charCount < text.length ? 0.7 : 1;
      ctx.fillStyle = palette.text + Math.floor(lineAlpha * 255).toString(16).padStart(2, '0');
      ctx.fillText(line, WIDTH / 2, y);
    });

    ctx.restore();
  }

  // ── Draw brand tag ──
  function drawBrandTag(ctx, palette, videoData, frame, totalFrames) {
    const progress = frame / totalFrames;
    // Slide up from bottom at 40% of video
    const slideProgress = Math.max(0, Math.min((progress - 0.35) * 2.5, 1));
    const y = HEIGHT * 0.82 + (1 - slideProgress) * 60;

    // Brand mention pill
    const brandText = `@${videoData.brandHandle || videoData.brandName.toLowerCase().replace(/\s+/g, '')}`;
    ctx.font = '600 28px "Geist", "Inter", sans-serif';
    const textWidth = ctx.measureText(brandText).width;
    const pillW = textWidth + 48;
    const pillH = 44;
    const pillX = WIDTH / 2 - pillW / 2;
    const pillY = y - pillH / 2;

    // Pill background
    ctx.fillStyle = palette.accent + '30';
    ctx.strokeStyle = palette.accent + '50';
    ctx.lineWidth = 1.5;
    roundRect(ctx, pillX, pillY, pillW, pillH, 22);
    ctx.fill();
    ctx.stroke();

    // Brand text
    ctx.fillStyle = palette.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandText, WIDTH / 2, y);
  }

  // ── Draw platform indicator and VYRL watermark ──
  function drawUI(ctx, palette, videoData, frame, totalFrames) {
    // Platform label top-right
    ctx.font = '600 22px "Geist", "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(videoData.platform || 'TikTok', WIDTH - 40, 36);

    // VYRL watermark bottom-right (subtle)
    ctx.font = '500 20px "Geist", "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText('VYRL', WIDTH - 40, HEIGHT - 36);

    // Sound indicator (TikTok style) bottom-left
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '500 18px "Geist", "Inter", sans-serif';
    ctx.fillText('🔊 Original Audio', 40, HEIGHT - 36);

    // Progress bar (thin) at very bottom
    const barY = HEIGHT - 8;
    const barW = WIDTH - 80;
    const barX = 40;
    const barProgress = frame / totalFrames;

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, barX, barY, barW, 4, 2);
    ctx.fill();

    ctx.fillStyle = palette.accent + '60';
    roundRect(ctx, barX, barY, barW * barProgress, 4, 2);
    ctx.fill();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
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

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // ── Render a single frame ──
  function renderFrame(ctx, palette, influencer, videoData, frame, totalFrames) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawBackground(ctx, palette, frame, totalFrames);
    drawAvatar(ctx, palette, influencer, frame, totalFrames);
    drawCaption(ctx, palette, videoData, frame, totalFrames);
    drawBrandTag(ctx, palette, videoData, frame, totalFrames);
    drawUI(ctx, palette, videoData, frame, totalFrames);
  }

  // ── Render video and get Blob ──
  async function renderVideo(influencer, videoData, paletteIdx = 0) {
    const palette = pickPalette(paletteIdx);
    const totalFrames = Math.ceil(DURATION_SEC * FPS);
    const frameDuration = 1000 / FPS;

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');

    // Set up MediaRecorder
    const stream = canvas.captureStream(FPS);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm;codecs=vp8';

    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });

    const recordingDone = new Promise((resolve) => {
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
    });

    recorder.start();

    // Render frames with precise timing
    const startTime = performance.now();

    for (let frame = 0; frame < totalFrames; frame++) {
      const targetTime = startTime + frame * frameDuration;
      const now = performance.now();

      if (now < targetTime) {
        await sleep(targetTime - now);
      }

      renderFrame(ctx, palette, influencer, videoData, frame, totalFrames);
    }

    // Small delay to capture last frame
    await sleep(100);
    recorder.stop();

    const blob = await recordingDone;

    // Also create a poster thumbnail
    renderFrame(ctx, palette, influencer, videoData, 0, totalFrames);
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

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ── Batch render multiple videos ──
  async function renderBatch(influencer, videoDatas, onProgress) {
    const results = [];

    for (let i = 0; i < videoDatas.length; i++) {
      if (onProgress) {
        onProgress(i, videoDatas.length, `Rendering video ${i + 1}/${videoDatas.length}...`);
      }

      try {
        const result = await renderVideo(influencer, videoDatas[i], i);
        results.push({
          ...videoDatas[i],
          ...result,
        });
      } catch (err) {
        console.error(`Failed to render video ${i + 1}:`, err);
        results.push({
          ...videoDatas[i],
          error: err.message,
        });
      }
    }

    return results;
  }

  // ── Public API ──
  return {
    renderVideo,
    renderBatch,
    WIDTH,
    HEIGHT,
    DURATION_SEC,
    FPS,
    PALETTES,
  };
})();
