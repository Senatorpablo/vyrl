/* ═══════════════════════════════════════════
   VYRL — renderer.js (v3 — procedural faces)
   Composites procedural face portraits onto backgrounds
   Zero external image dependencies — always works
   ═══════════════════════════════════════════ */

const VYRLRenderer = (() => {
  'use strict';
  const W = 720, H = 1280, FPS = 24, DUR = 8;

  function drawBg(ctx, progress, paletteIdx) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    const p = [
      ['#2d1b69', '#16213e'], ['#1a0a2e', '#0d1b2a'],
      ['#0f2027', '#203a43'], ['#3a1c71', '#0f0c29'],
      ['#1a0525', '#0a1628'], ['#200a0a', '#0a0a20'],
      ['#0a1a1a', '#1a1505'], ['#0a0a20', '#1a0525'],
    ][paletteIdx % 8];
    grad.addColorStop(0, p[0]); grad.addColorStop(1, p[1]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    // Floating particles
    for (let i = 0; i < 15; i++) {
      const px = (150 + Math.sin(progress * 3 + i * 1.7) * 300 + i * 45) % W;
      const py = (200 + Math.cos(progress * 2.5 + i * 1.3) * 400 + i * 50) % H;
      ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.sin(progress * 4 + i) * 0.01})`;
      ctx.beginPath(); ctx.arc(px, py, 2 + i * 0.2, 0, Math.PI * 2); ctx.fill();
    }

    // Vignette
    const vg = ctx.createRadialGradient(W/2, H/2, W*0.3, W/2, H/2, W*0.65);
    vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  function drawFaceCircle(ctx, faceCanvas, progress) {
    const cx = W / 2, cy = H * 0.26, radius = 155;
    const floatY = Math.sin(progress * Math.PI * 2.5) * 3;
    const tilt = Math.sin(progress * Math.PI * 3.1) * 0.02;

    ctx.save();
    ctx.translate(cx, cy + floatY);
    ctx.rotate(tilt);

    // Glow
    ctx.shadowColor = 'rgba(255,100,150,0.3)'; ctx.shadowBlur = 35;
    ctx.beginPath(); ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;

    // Clip circle
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(faceCanvas, -radius, -radius * 0.15, radius * 2, radius * 2.3);
    ctx.restore();
  }

  function drawCaptions(ctx, caption, progress) {
    const rp = Math.min(progress * 2.2, 1);
    const words = caption.split(' '); let cc = 0, wi = 0;
    for (let i = 0; i < words.length; i++) { cc += words[i].length + 1; if (cc > caption.length * rp) { wi = i; break; } wi = i + 1; }
    const vw = words.slice(0, wi);

    ctx.font = '700 38px/1.3 "Geist", "Inter", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const lines = []; let cur = '';
    for (const w of vw) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > W - 80 && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);

    const sy = H * 0.74;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14;
    lines.forEach((l, i) => { ctx.fillStyle = '#F4F4F5'; ctx.fillText(l, W/2, sy + i * 52); });
    ctx.restore();
  }

  function drawUI(ctx, progress, platform, influencerName, voiceAccent) {
    // Right sidebar
    const sx = W - 36, by = H * 0.68;
    ctx.beginPath(); ctx.arc(sx, by, 22, 0, Math.PI*2); ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 14px "Geist",sans-serif'; ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(influencerName[0],sx,by);
    ['♥','💬','↗','☆'].forEach((b,i)=>{ const y=by+50+i*48; ctx.beginPath();ctx.arc(sx,y,22,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.06)';ctx.fill();ctx.fillStyle='rgba(255,255,255,0.5)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b,sx,y); });

    // Bottom left
    ctx.font='700 16px "Geist",sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#fff'; ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=4;
    ctx.fillText(`@${influencerName.toLowerCase()} • ${voiceAccent}`, 20, H - 70); ctx.shadowBlur=0;

    // Top right, watermark, progress bar
    ctx.font='600 13px "Geist",sans-serif'; ctx.textAlign='right'; ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fillText(platform, W-20, 40);
    ctx.font='600 12px "Geist",sans-serif'; ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillText('VYRL', W-20, H-18);
    ctx.beginPath(); ctx.rect(16, H-10, W-32, 4); ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fill();
    ctx.beginPath(); ctx.rect(16, H-10, (W-32)*progress, 4); ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill();
  }

  async function renderVideo(influencer, videoData, paletteIdx) {
    const faceCanvas = VYRLFaces.renderFace(influencer.name, influencer.gender || 'female', 320);
    const totalFrames = Math.ceil(DUR * FPS);
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(FPS);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8';
    const chunks = []; const rec = new MediaRecorder(stream, { mime, videoBitsPerSecond: 3000000 });
    const done = new Promise(r => { rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); }; rec.onstop = () => r(new Blob(chunks, { type: 'video/webm' })); });
    rec.start(); const st = performance.now(); const fd = 1000 / FPS;

    for (let f = 0; f < totalFrames; f++) {
      const tt = st + f * fd, nw = performance.now(); if (nw < tt) await new Promise(r => setTimeout(r, tt - nw));
      ctx.clearRect(0, 0, W, H);
      drawBg(ctx, f / totalFrames, paletteIdx);
      drawFaceCircle(ctx, faceCanvas, f / totalFrames);
      drawCaptions(ctx, videoData.caption, f / totalFrames);
      drawUI(ctx, f / totalFrames, videoData.platform, influencer.name, influencer.voice?.name || 'RP');
    }

    await new Promise(r => setTimeout(r, 100)); rec.stop();
    const blob = await done;
    // Poster
    ctx.clearRect(0, 0, W, H); drawBg(ctx, 0, paletteIdx); drawFaceCircle(ctx, faceCanvas, 0);
    drawCaptions(ctx, videoData.caption, 0.05); drawUI(ctx, 0, videoData.platform, influencer.name, 'RP');
    return { blob, poster: canvas.toDataURL('image/jpeg', 0.85), url: URL.createObjectURL(blob), width: W, height: H, duration: DUR };
  }

  async function renderBatch(influencer, videoDatas, onProgress) {
    const res = [];
    for (let i = 0; i < videoDatas.length; i++) {
      onProgress?.(i, videoDatas.length, `Rendering video ${i+1}/${videoDatas.length}...`);
      try { const r = await renderVideo(influencer, videoDatas[i], i); res.push({ ...videoDatas[i], ...r }); }
      catch (e) { console.error(e); res.push({ ...videoDatas[i], error: e.message }); }
    }
    return res;
  }

  return { renderVideo, renderBatch, WIDTH: W, HEIGHT: H, DURATION_SEC: DUR, FPS };
})();
