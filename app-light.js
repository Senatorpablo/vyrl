(function() {
  'use strict';

  // ── Loader ──
  const loader = document.getElementById('loader');
  if (document.readyState === 'complete') loader.classList.add('hidden');
  else window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 400));

  // ── Nav ──
  const nav = document.getElementById('nav'), hamburger = document.getElementById('hamburger');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { nav.classList.toggle('scrolled', window.scrollY > 20); ticking = false; }); ticking = true; }
  }, { passive: true });

  // Mobile menu
  const menu = document.createElement('div'); menu.className = 'mobile-menu'; menu.style.cssText = 'position:fixed;inset:0;z-index:999;background:#FDF9F6;display:none;flex-direction:column;align-items:center;justify-content:center;gap:28px;';
  menu.innerHTML = '<button class="m-close" style="position:absolute;top:20px;right:20px;background:none;border:none;font-size:2rem;cursor:pointer;color:#151515;">×</button>' +
    '<a href="#how" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">How It Works</a>' +
    '<a href="#features" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">Features</a>' +
    '<a href="#gallery" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">Gallery</a>' +
    '<a href="#pricing" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">Pricing</a>' +
    '<a href="#start" class="btn-primary" style="font-size:1.1rem;padding:14px 32px;">Get Started</a>';
  document.body.appendChild(menu);
  const mClose = menu.querySelector('.m-close');
  hamburger.addEventListener('click', () => { menu.style.display = 'flex'; document.body.style.overflow = 'hidden'; });
  mClose.addEventListener('click', () => { menu.style.display = 'none'; document.body.style.overflow = ''; });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.style.display = 'none'; document.body.style.overflow = ''; }));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const t = document.querySelector(this.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 64, behavior: 'smooth' }); }
    });
  });

  // ── Gallery ──
  const influencerData = [
    { name: 'Maya, 24', style: 'Beauty & Wellness', img: '01', gender: 'female', bg: 0 },
    { name: 'Josh, 28', style: 'Fitness & Nutrition', img: '04', gender: 'male', bg: 3 },
    { name: 'Priya, 25', style: 'Fashion & Style', img: '06', gender: 'female', bg: 5 },
    { name: 'Leo, 32', style: 'Tech & Gaming', img: '10', gender: 'male', bg: 7 },
    { name: 'Ella, 30', style: 'Food & Lifestyle', img: '11', gender: 'female', bg: 9 },
    { name: 'Sophie, 31', style: 'Home & DIY', img: '13', gender: 'female', bg: 2 },
    { name: 'Oscar, 29', style: 'Travel & Adventure', img: '15', gender: 'male', bg: 8 },
    { name: 'Luna, 26', style: 'Accessories & Jewellery', img: '18', gender: 'female', bg: 10 },
  ];
  const galGrid = document.getElementById('galleryGrid');
  if (galGrid) {
    galGrid.innerHTML = influencerData.map(inf => `
      <div class="gal-card">
        <div class="gal-img">
          <img src="https://randomuser.me/api/portraits/${inf.gender === 'male' ? 'men' : 'women'}/${inf.img}.jpg" 
               alt="${inf.name}" loading="lazy" 
               onerror="this.style.display='none'">
        </div>
        <div class="gal-info">
          <div class="gal-name">${inf.name}</div>
          <div class="gal-style">${inf.style}</div>
        </div>
      </div>
    `).join('');
  }

  // ── Blitz mode swipe ──
  const swipeCard = document.getElementById('bpSwipeCard'), swipeCap = swipeCard?.querySelector('.bp-cap');
  const swipes = [
    '"You guys. This jacket. 6 wears this week. Zero regrets. @cosylondon"',
    '"POV: the skincare that cleared my acne in 3 weeks. Link in bio. @glowlab_club"',
    '"Just got the new @techgearuk buds. Sound quality is actually mental."',
    '"Rate my Sunday reset 1-10 👇 @homelabuk"',
    '"Tried this viral protein recipe. Honestly surprised. @fitfueluk"',
  ];
  let si = 0;
  function doSwipe(dir) {
    const x = dir === 'right' ? 200 : -200;
    swipeCard.style.transition = 'transform .4s ease, opacity .4s ease';
    swipeCard.style.transform = `translateX(${x}px) rotate(${dir === 'right' ? 12 : -12}deg)`;
    swipeCard.style.opacity = '0';
    setTimeout(() => {
      si = (si + 1) % swipes.length; swipeCap.textContent = swipes[si];
      swipeCard.style.transition = 'none'; swipeCard.style.transform = ''; swipeCard.style.opacity = '1';
      swipeCard.offsetHeight;
      swipeCard.style.transition = 'transform .4s cubic-bezier(.175,.885,.32,1.275), opacity .4s ease';
    }, 400);
  }
  document.getElementById('bpApprove')?.addEventListener('click', () => doSwipe('right'));
  document.getElementById('bpReject')?.addEventListener('click', () => doSwipe('left'));
  document.addEventListener('keydown', e => { if (e.key === 'ArrowRight') doSwipe('right'); if (e.key === 'ArrowLeft') doSwipe('left'); });

  // ── Testimonial carousel ──
  const tTrack = document.getElementById('testimonialTrack'), tDots = document.querySelectorAll('.testim-dot');
  let tSlide = 0, tInt;
  function goT(n) { tSlide = n; tTrack.style.transform = `translateX(-${tSlide*100}%)`; tDots.forEach((d,i) => d.classList.toggle('active', i===tSlide)); }
  tDots.forEach(d => d.addEventListener('click', () => { goT(+d.dataset.idx); clearInterval(tInt); tInt = setInterval(() => goT((tSlide+1)%3), 5000); }));
  tInt = setInterval(() => goT((tSlide+1)%3), 5000);

  // ── FAQ ──
  document.querySelectorAll('.faq-q').forEach(b => b.addEventListener('click', () => {
    const item = b.parentElement, open = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!open) item.classList.add('open');
  }));

  // ── Footer year ──
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // ═══════════ GENERATION ENGINE ═══════════
  const overlay = document.getElementById('genOverlay'), phaseProg = document.getElementById('genPhaseProgress'),
        phaseRes = document.getElementById('genPhaseResults'), barFill = document.getElementById('genBarFill'),
        genStatus = document.getElementById('genStatus'), stepList = document.getElementById('genStepList');

  const steps = [
    { id: 'scrape', label: 'Scanning your website' },
    { id: 'analyze', label: 'Analysing brand DNA' },
    { id: 'influencer', label: 'Generating AI influencer' },
    { id: 'videos', label: 'Creating video scripts' },
    { id: 'render', label: 'Rendering UGC videos' },
  ];

  function buildStepList() {
    stepList.innerHTML = steps.map((s, i) =>
      `<div class="gen-step-item${i===0?' active':''}" data-step="${s.id}">${s.label}</div>`
    ).join('');
    return stepList.querySelectorAll('.gen-step-item');
  }

  let genStepEls = buildStepList();

  function resetGen() {
    phaseProg.style.display = 'block'; phaseRes.style.display = 'none';
    barFill.style.width = '0%'; genStatus.textContent = 'Analysing your brand...';
    genStepEls = buildStepList();
  }

  function showResults() { phaseProg.style.display = 'none'; phaseRes.style.display = 'block'; }

  function doStep(id, pct) {
    const el = stepList.querySelector(`[data-step="${id}"]`);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
    barFill.style.width = `${pct}%`;
    const idx = steps.findIndex(s => s.id === id);
    if (idx < steps.length - 1) { const n = stepList.querySelector(`[data-step="${steps[idx+1].id}"]`); if (n) n.classList.add('active'); }
  }

  function showToast(msg) {
    const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3500);
  }

  // ── Run generation ──
  async function runGeneration(url) {
    overlay.classList.add('active'); document.body.style.overflow = 'hidden'; resetGen();

    try {
      genStatus.textContent = 'Scanning your website...'; await sleep(300); doStep('scrape', 20);
      genStatus.textContent = 'Analysing brand DNA...'; await sleep(400); doStep('analyze', 45);
      genStatus.textContent = 'Generating AI influencer...'; await sleep(400); doStep('influencer', 65);

      const result = await VYRL.generate(url);
      if (!result.brand.scraperWorked) {
        genStatus.textContent = '⚠ Couldn\'t reach your site directly. Using domain analysis.';
        await sleep(800);
      }

      genStatus.textContent = 'Creating video scripts...'; await sleep(300); doStep('videos', 78);
      genStatus.textContent = 'Rendering UGC videos...'; doStep('render', 85);

      // Build render data
      const vdata = result.videos.map((v, i) => ({
        ...v,
        brandName: result.brand.brandName,
        brandHandle: result.brand.brandName.toLowerCase().replace(/\s+/g, ''),
        industry: result.brand.industry,
        faceUrl: VYRLFaces.getRandomFace(result.brand.industry, result.influencer.gender || 'female'),
        backgroundUrl: VYRLFaces.getRandomBackground(),
      }));

      const rendered = await VYRLRenderer.renderBatch(result.influencer, vdata, (done, total, msg) => {
        genStatus.textContent = msg; barFill.style.width = `${85 + (done/total)*12}%`;
      });

      result.videos = rendered;
      genStatus.textContent = 'Complete!'; doStep('render', 100);
      await sleep(400); showResults(); renderResults(result);

    } catch (err) {
      console.error(err); showToast('⚠ Something went wrong. Please try again.');
      overlay.classList.remove('active'); document.body.style.overflow = '';
    }
  }

  function renderResults(r) {
    const { brand, influencer, videos, colors } = r;
    document.getElementById('grBrandName').textContent = brand.brandName;

    // Avatar
    const av = document.getElementById('griAvatar');
    av.innerHTML = `<img src="${VYRLFaces.getRandomFace(brand.industry, influencer.gender || 'female')}" alt="${influencer.name}" onerror="this.parentElement.innerHTML='<div style=width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#FF530F,#FF9500);display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:900;>${influencer.name[0]}</div>'">`;

    document.getElementById('griName').textContent = `${influencer.name}, ${influencer.age}`;
    document.getElementById('griStyle').textContent = `${influencer.style} — ${influencer.voice.region}`;
    document.getElementById('griBio').textContent = influencer.vibe;
    document.getElementById('griVoice').innerHTML = `🗣️ ${influencer.voice.name} — ${influencer.voice.style}`;

    // Analysis
    document.getElementById('grAnalysis').innerHTML = `
      <div class="gr-ai"><strong>Industry</strong><span>${brand.industry.charAt(0).toUpperCase()+brand.industry.slice(1)}</span></div>
      <div class="gr-ai"><strong>Brand Tone</strong><span>${brand.tones.map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(', ')}</span></div>
      <div class="gr-ai"><strong>Products</strong><span>${brand.products.slice(0,3).join(', ')}</span></div>
      <div class="gr-ai"><strong>Source</strong><span>${brand.scraperWorked ? 'Direct site ✓' : 'Domain inference'}</span></div>
    `;

    // Videos
    const vg = document.getElementById('grVideoGrid');
    vg.innerHTML = videos.map(v => {
      const hasVid = v.url && !v.error;
      return `<div class="gr-vid">
        ${hasVid ? `<video src="${v.url}" poster="${v.poster||''}" controls playsinline preload="metadata" style="width:100%;aspect-ratio:9/16;background:#000;border-radius:8px;"></video>` : ''}
        <div class="gr-vid-cap">${v.format} · ${v.platform}</div>
      </div>`;
    }).join('');
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ── Close overlay ──
  document.getElementById('genClose')?.addEventListener('click', () => { overlay.classList.remove('active'); document.body.style.overflow = ''; });
  overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) { overlay.classList.remove('active'); document.body.style.overflow = ''; } });
  document.getElementById('genAgain')?.addEventListener('click', () => { overlay.classList.remove('active'); document.body.style.overflow = ''; document.getElementById('heroUrl').focus(); });

  // ── Form handler ──
  window.handleStart = function(e) {
    e.preventDefault();
    const input = document.getElementById('heroUrl') || document.getElementById('ctaUrl');
    const url = input.value.trim();
    if (!url) { showToast('⚠ Please enter a website URL'); return false; }
    input.value = ''; runGeneration(url); return false;
  };

})();
