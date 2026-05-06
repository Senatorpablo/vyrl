(function() {
  'use strict';

  // ── Loader ──
  const loader = document.getElementById('loader');
  if (document.readyState === 'complete') loader.classList.add('hidden');
  else window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 400));

  // ── Sticky nav ──
  const nav = document.getElementById('nav');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { nav.classList.toggle('scrolled', window.scrollY > 20); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // ── Mobile menu ──
  const hamburger = document.getElementById('hamburger');
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.style.cssText = 'position:fixed;inset:0;z-index:999;background:#FDF9F6;display:none;flex-direction:column;align-items:center;justify-content:center;gap:28px;';
  menu.innerHTML =
    '<button class="m-close" style="position:absolute;top:20px;right:20px;background:none;border:none;font-size:2rem;cursor:pointer;color:#151515;">×</button>' +
    '<a href="#how" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">How It Works</a>' +
    '<a href="#formats" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">Formats</a>' +
    '<a href="#gallery" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">Gallery</a>' +
    '<a href="#compare" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">Compare</a>' +
    '<a href="#pricing" style="font-size:1.3rem;font-weight:700;color:#151515;text-decoration:none;">Pricing</a>' +
    '<a href="#start" class="btn-primary" style="font-size:1.1rem;padding:14px 32px;">Get Started</a>';
  document.body.appendChild(menu);

  function closeMenu() { menu.style.display = 'none'; document.body.style.overflow = ''; hamburger.classList.remove('active'); }
  hamburger.addEventListener('click', () => { menu.style.display = 'flex'; document.body.style.overflow = 'hidden'; hamburger.classList.add('active'); });
  menu.querySelector('.m-close').addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ── Smooth scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 64, behavior: 'smooth' }); }
  }));

  // ── Gallery ──
  const gals = RealFaces.getGalleryFaces();
  const gg = document.getElementById('galleryGrid');
  gals.forEach(inf => {
    const c = document.createElement('div'); c.className = 'gal-card';
    const i = document.createElement('div'); i.className = 'gal-img';
    const img = document.createElement('img'); img.src = inf.faceData; img.alt = inf.name; img.loading = 'lazy';
    i.appendChild(img); c.appendChild(i);
    const d = document.createElement('div'); d.className = 'gal-info';
    d.innerHTML = `<div class="gal-name">${inf.name}</div><div class="gal-style">${inf.style}</div>`;
    c.appendChild(d); gg.appendChild(c);
  });

  // ── Hero Carousel ──
  (function buildHeroCarousel() {
    const track = document.getElementById('hcTrack');
    if (!track) return;
    const faces = RealFaces.getGalleryFaces();
    if (!faces || !faces.length) return;

    const captions = [
      '"Rate my glow up ✨ @glowlab_club"',
      '"Got my order. Obsessed. 😍 @cosylondon"',
      '"GRWM + honest review 🎀 @vyrl"',
      '"This changed my routine 🙌 @fitfueluk"',
      '"Honest take — worth every penny 💅 @glowlab"',
      '"Day 7 update. Still obsessed. @vyrl"',
    ];

    // Build two copies for seamless loop
    function makeCards() {
      return faces.map((face, i) => {
        const sizeClass = i % 5 === 2 ? 'hc-lg' : (i % 5 === 0 || i % 5 === 4) ? 'hc-sm' : 'hc-md';
        const card = document.createElement('div');
        card.className = `hc-card ${sizeClass}`;
        const img = document.createElement('img');
        img.src = face.faceData; img.alt = face.name; img.loading = 'lazy';
        card.appendChild(img);
        const lbl = document.createElement('div');
        lbl.className = 'hc-label';
        lbl.textContent = captions[i % captions.length];
        card.appendChild(lbl);
        return card;
      });
    }

    makeCards().forEach(c => track.appendChild(c));
    makeCards().forEach(c => track.appendChild(c)); // duplicate for loop
  })();

  // ── Blitz phone face ──
  const bpFace = document.querySelector('.bp-face');
  if (bpFace) {
    const faces = RealFaces.getGalleryFaces();
    const pick = faces.find(f => f.gender === 'female') || faces[0];
    if (pick) {
      const img = document.createElement('img'); img.src = pick.faceData;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
      bpFace.innerHTML = ''; bpFace.appendChild(img);
    }
  }

  // ── Blitz swipe ──
  const swipes = [
    '"You guys. This jacket. 6 wears. Zero regrets. @cosylondon"',
    '"POV: the skincare that cleared my acne. @glowlab_club"',
    '"Just got @techgearuk buds. Sound is mental."',
    '"Rate my Sunday reset 👇 @homelabuk"',
    '"Tried this viral recipe. @fitfueluk"',
  ];
  let si = 0;
  const sc = document.getElementById('bpSwipeCard'), scc = sc && sc.querySelector('.bp-cap');
  function doSwipe(dir) {
    if (!sc) return;
    const x = dir === 'right' ? 200 : -200;
    sc.style.transition = 'transform .4s ease,opacity .4s ease';
    sc.style.transform = `translateX(${x}px) rotate(${dir === 'right' ? 12 : -12}deg)`;
    sc.style.opacity = '0';
    setTimeout(() => {
      si = (si + 1) % swipes.length;
      if (scc) scc.textContent = swipes[si];
      sc.style.transition = 'none'; sc.style.transform = ''; sc.style.opacity = '1';
      sc.offsetHeight;
      sc.style.transition = 'transform .4s cubic-bezier(.175,.885,.32,1.275),opacity .4s ease';
    }, 400);
  }
  document.getElementById('bpApprove')?.addEventListener('click', () => doSwipe('right'));
  document.getElementById('bpReject')?.addEventListener('click', () => doSwipe('left'));
  document.addEventListener('keydown', e => { if (e.key === 'ArrowRight') doSwipe('right'); if (e.key === 'ArrowLeft') doSwipe('left'); });

  // ── Testimonials ──
  const tt = document.getElementById('testimonialTrack'), td = document.querySelectorAll('.testim-dot');
  let ts = 0, ti;
  function gt(n) { ts = n; tt.style.transform = `translateX(-${ts * 100}%)`; td.forEach((d, i) => d.classList.toggle('active', i === ts)); }
  td.forEach(d => d.addEventListener('click', () => { gt(+d.dataset.idx); clearInterval(ti); ti = setInterval(() => gt((ts + 1) % 3), 5000); }));
  ti = setInterval(() => gt((ts + 1) % 3), 5000);

  // ── FAQ ──
  document.querySelectorAll('.faq-q').forEach(b => b.addEventListener('click', () => {
    const i = b.parentElement, o = i.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(x => x.classList.remove('open'));
    if (!o) i.classList.add('open');
  }));

  // ── Footer year ──
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // ── Generation overlay ──
  const ov = document.getElementById('genOverlay');
  const p0 = document.getElementById('genPhaseCustomise');
  const p1 = document.getElementById('genPhaseProgress');
  const p2 = document.getElementById('genPhaseResults');
  const bf = document.getElementById('genBarFill');
  const gs = document.getElementById('genStatus');
  const sl = document.getElementById('genStepList');

  const stp = [
    { id: 'scrape',     l: 'Analysing your brand' },
    { id: 'influencer', l: 'Generating AI influencer' },
    { id: 'videos',     l: 'Creating video scripts' },
    { id: 'render',     l: 'Rendering UGC videos' },
  ];

  function showPhase(phase) {
    [p0, p1, p2].forEach(p => { if (p) p.style.display = 'none'; });
    if (phase) phase.style.display = 'block';
  }

  function buildSteps() {
    sl.innerHTML = stp.map((s, i) =>
      `<div class="gen-step-item${i === 0 ? ' active' : ''}" data-step="${s.id}">${s.l}</div>`
    ).join('');
  }

  function resetProgress() {
    showPhase(p1); bf.style.width = '0%'; gs.textContent = 'Connecting...'; buildSteps();
  }

  function ds(id, pct) {
    const e = sl.querySelector(`[data-step="${id}"]`);
    if (e) { e.classList.remove('active'); e.classList.add('done'); }
    bf.style.width = `${pct}%`;
    const idx = stp.findIndex(s => s.id === id);
    if (idx < stp.length - 1) { const n = sl.querySelector(`[data-step="${stp[idx + 1].id}"]`); if (n) n.classList.add('active'); }
  }

  function toast(m) {
    const t = document.getElementById('toast');
    t.textContent = m; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3500);
  }

  function closeOverlay() {
    ov.classList.remove('active');
    document.body.style.overflow = '';
    // Stop all canvas animations when overlay closes
    if (window._vyrlCanvasObserver) { window._vyrlCanvasObserver.disconnect(); window._vyrlCanvasObserver = null; }
    document.querySelectorAll('#grVideoGrid canvas').forEach(cv => cv._previewStop?.());
  }

  // ── Customisation options state ──
  const opts = { gender: 'female', age: 'any', style: 'any', voice: 'any' };

  document.querySelectorAll('.gc-row').forEach(row => {
    const optName = row.dataset.opt;
    row.querySelectorAll('.gc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.gc-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        opts[optName] = btn.dataset.val;
      });
    });
  });

  // ── Pending URL (set when customise phase opens) ──
  let pendingUrl = '';

  document.getElementById('genGoBtn')?.addEventListener('click', () => {
    if (!pendingUrl) return;
    runGen(pendingUrl, { ...opts });
  });

  // ── Close handlers ──
  document.getElementById('genCloseCustomise')?.addEventListener('click', closeOverlay);
  document.getElementById('genClose')?.addEventListener('click', closeOverlay);
  document.getElementById('genCloseResults')?.addEventListener('click', closeOverlay);
  ov.addEventListener('click', e => { if (e.target === ov) closeOverlay(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('active')) closeOverlay(); });
  document.getElementById('genAgain')?.addEventListener('click', () => { closeOverlay(); document.getElementById('heroUrl')?.focus(); });

  // ── Main generation runner ──
  async function runGen(rawUrl, preferences) {
    resetProgress();
    try {
      const url = fixUrl(rawUrl);
      gs.textContent = 'Analysing...'; await sleep(500); ds('scrape', 25);
      const result = await VYRL.generate(url, preferences);
      gs.textContent = result.brand.scraperWorked ? 'Generating influencer...' : 'Using brand analysis...';
      await sleep(400); ds('influencer', 55);
      gs.textContent = 'Creating scripts...'; await sleep(300); ds('videos', 72);
      gs.textContent = 'Rendering videos...'; ds('render', 80);
      const vdata = result.videos.map(v => ({
        ...v,
        brandName: result.brand.brandName,
        brandHandle: result.brand.brandName.toLowerCase().replace(/\s+/g, ''),
        industry: result.brand.industry,
        caption: v.caption,
        platform: v.platform,
      }));
      const rendered = await VYRLRenderer.renderBatch(result.influencer, vdata, (d, t, m) => {
        gs.textContent = m; bf.style.width = `${80 + (d / t) * 18}%`;
      });
      result.videos = rendered;
      gs.textContent = 'Complete!'; ds('render', 100); await sleep(300);
      showPhase(p2); renderResults(result);
    } catch (e) {
      console.error(e);
      toast('⚠ Could not render. Using generated profile anyway.');
      try {
        const result = await VYRL.generate(fixUrl(rawUrl), preferences);
        showPhase(p2); renderResults(result);
      } catch (e2) {
        toast('⚠ Please try a different website URL');
        closeOverlay();
      }
    }
  }

  function fixUrl(url) { url = url.trim(); if (!/^https?:\/\//i.test(url)) url = 'https://' + url; return url; }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ── Results renderer ──
  function renderResults(r) {
    const { brand, influencer, videos } = r;

    document.getElementById('grBrandName').textContent = brand.brandName;

    // Growth Profile
    document.getElementById('grAnalysis').innerHTML =
      `<div class="gr-ai"><strong>Industry</strong><span>${brand.industry.charAt(0).toUpperCase() + brand.industry.slice(1)}</span></div>` +
      `<div class="gr-ai"><strong>Brand Tone</strong><span>${brand.tones.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</span></div>` +
      `<div class="gr-ai"><strong>Products</strong><span>${brand.products.slice(0, 3).join(', ')}</span></div>` +
      `<div class="gr-ai"><strong>Source</strong><span>${brand.scraperWorked ? 'Direct site ✓' : 'Domain analysis'}</span></div>`;

    // Influencer card — find matching face from gallery by name then gender
    const av = document.getElementById('griAvatar'); av.innerHTML = '';
    const allFaces = RealFaces.getGalleryFaces();
    const matchedFace = allFaces.find(f => f.name.toLowerCase() === influencer.name.toLowerCase())
      || allFaces.find(f => f.gender === (influencer.gender || 'female'))
      || allFaces[0];
    if (matchedFace && matchedFace.faceData) {
      const img = document.createElement('img'); img.src = matchedFace.faceData; img.style.cssText = 'width:100%;height:100%;object-fit:cover;'; av.appendChild(img);
    } else {
      const d = document.createElement('div');
      d.style.cssText = 'width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#FF530F,#FF9500);display:flex;align-items:center;justify-content:center;color:#fff;font-size:2em;font-weight:900;';
      d.textContent = influencer.name[0]; av.appendChild(d);
    }
    document.getElementById('griName').textContent = `${influencer.name}, ${influencer.age}`;
    document.getElementById('griStyle').textContent = `${influencer.style} — ${influencer.voice.region}`;
    document.getElementById('griBio').textContent = influencer.vibe;
    document.getElementById('griVoice').innerHTML = `🗣️ ${influencer.voice.name} — ${influencer.voice.style}`;

    // Videos — live canvas previews
    const vg = document.getElementById('grVideoGrid');
    vg.innerHTML = '';

    // Stop any previously running canvas animations
    if (window._vyrlCanvasObserver) { window._vyrlCanvasObserver.disconnect(); }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const cv = entry.target;
        if (entry.isIntersecting) { cv._previewStart?.(); }
        else { cv._previewStop?.(); }
      });
    }, { threshold: 0.1 });
    window._vyrlCanvasObserver = observer;

    videos.forEach(v => {
      const wrap = document.createElement('div');
      wrap.className = 'gr-vid';

      if (v.canvas) {
        // Live animated canvas preview
        wrap.appendChild(v.canvas);
        observer.observe(v.canvas);

        // Play/pause toggle on click
        let playing = false;
        v.canvas.style.cursor = 'pointer';
        v.canvas.title = 'Click to play/pause';
        v.canvas.addEventListener('click', () => {
          if (playing) { v.canvas._previewStop?.(); playing = false; }
          else { v.canvas._previewStart?.(); playing = true; }
        });
        // Auto-start when visible
        v.canvas._previewStart?.();
        playing = true;
      } else {
        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'width:100%;aspect-ratio:9/16;background:#111;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#666;font-size:.8em;padding:16px;text-align:center;';
        placeholder.textContent = v.caption ? v.caption.substring(0, 80) + '…' : 'Preview unavailable';
        wrap.appendChild(placeholder);
      }

      const cap = document.createElement('div');
      cap.className = 'gr-vid-cap';
      cap.textContent = `${v.format || 'Video'} · ${v.platform || 'TikTok'}`;
      wrap.appendChild(cap);
      vg.appendChild(wrap);
    });
  }

  // ── Demo Grid — live canvas previews ──
  (async function buildDemoGrid() {
    const dg = document.getElementById('demoGrid');
    if (!dg) return;
    const faces = RealFaces.getGalleryFaces();
    const demoCases = [
      { name: faces[0]?.name || 'Sophia', gender: 'female', caption: 'Rate my glow up ✨ this routine changed everything for my skin', platform: 'TikTok', format: 'GRWM' },
      { name: faces[1]?.name || 'Jade',   gender: 'female', caption: 'Honest review after 30 days — is it actually worth the hype?', platform: 'Reels', format: 'Honest Review' },
      { name: faces[2]?.name || 'Marcus', gender: 'male',   caption: 'POV: you finally found the supplement that actually works 💪', platform: 'Shorts', format: 'Hook + Demo' },
    ];
    for (let i = 0; i < demoCases.length; i++) {
      const d = demoCases[i];
      try {
        const canvas = await VYRLRenderer.renderPreview(
          { name: d.name, gender: d.gender, voice: { name: 'RP' } },
          { caption: d.caption, platform: d.platform, format: d.format },
          i
        );
        const wrap = document.createElement('div'); wrap.className = 'demo-card';
        wrap.appendChild(canvas);
        const cap = document.createElement('div'); cap.className = 'demo-cap';
        cap.textContent = `${d.name} · ${d.format} · ${d.platform}`;
        wrap.appendChild(cap);
        dg.appendChild(wrap);
        // Auto-play via IntersectionObserver
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) canvas._previewStart?.(); else canvas._previewStop?.(); });
        }, { threshold: 0.1 });
        obs.observe(canvas);
        canvas._previewStart?.();
      } catch (_) {}
    }
  })();

  // ── Form handler ──
  window.handleStart = function(e) {
    e.preventDefault();
    const input = e.target.querySelector('input[type="text"]');
    const raw = (input && input.value.trim()) || '';
    if (!raw) { toast('⚠ Please enter your website domain'); return false; }

    // Basic validation — must look like a domain
    const cleaned = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').trim();
    if (!cleaned.includes('.') || cleaned.includes(' ')) {
      toast('⚠ Please enter a valid website — e.g. glossier.com'); return false;
    }

    input.value = '';
    const domain = cleaned.split('/')[0];
    const brandSlug = domain.replace(/(\.[a-z]{2,6})+$/i, '').split('.').pop();
    const displayName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);

    document.getElementById('gcBrandName').textContent = displayName;
    document.getElementById('gcBadge').textContent = '🔍 Scanning brand…';
    const scanEl = document.getElementById('gcScanResult');
    if (scanEl) scanEl.innerHTML = `<span class="gc-scan-checking">Checking ${domain}…</span>`;

    pendingUrl = raw;
    showPhase(p0);
    ov.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Background pre-scan — updates the panel while user picks options
    VYRL.scanBrand(raw).then(scan => {
      if (!ov.classList.contains('active')) return; // modal closed
      document.getElementById('gcBadge').textContent = scan.ok ? '✓ Brand read' : '⚠ Domain analysis';
      if (scanEl) {
        const industryLabel = scan.industry.charAt(0).toUpperCase() + scan.industry.slice(1);
        if (scan.ok) {
          const productsLine = scan.products.length
            ? `<span class="gc-scan-products">Products found: ${scan.products.slice(0,3).join(', ')}</span>`
            : '';
          scanEl.innerHTML =
            `<span class="gc-scan-ok">✓ Successfully read ${scan.domain}</span>` +
            `<span class="gc-scan-info">Detected industry: ${industryLabel}${scan.siteTitle ? ' · ' + scan.siteTitle.slice(0,50) : ''}</span>` +
            productsLine;
        } else {
          scanEl.innerHTML =
            `<span class="gc-scan-warn">⚠ Couldn't reach ${scan.domain} — using domain analysis</span>` +
            `<span class="gc-scan-info">Estimated industry: ${industryLabel}. Results will be less tailored.</span>`;
        }
      }
    }).catch(() => {
      if (scanEl) scanEl.innerHTML = `<span class="gc-scan-warn">⚠ Could not reach site — using domain analysis</span>`;
    });

    return false;
  };

})();
