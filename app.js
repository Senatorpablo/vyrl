/* ═══════════════════════════════════════════
   VYRL — app.js
   Interactions, animations, carousel, FAQ, counters
   ═══════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Loader ──
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 600);
    });
    // Fallback if load already fired
    if (document.readyState === 'complete') {
      setTimeout(() => loader.classList.add('hidden'), 300);
    }
  }

  // ── Sticky Nav ──
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  let scrollTicking = false;

  function updateNav() {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateNav);
      scrollTicking = true;
    }
  }, { passive: true });

  // ── Mobile menu ──
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.innerHTML = `
    <button class="mobile-close" aria-label="Close menu">×</button>
    <a href="#features">Features</a>
    <a href="#how-it-works">How It Works</a>
    <a href="#pricing">Pricing</a>
    <a href="#faq">FAQ</a>
    <a href="#cta" class="btn-primary">Get Started</a>
  `;
  document.body.appendChild(mobileMenu);

  const mobileClose = mobileMenu.querySelector('.mobile-close');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  function openMobileMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileClose.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ── Smooth scroll for all # links (JS fallback) ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = 64;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Reveal on scroll ──
  const revealElements = document.querySelectorAll(
    '.step-card, .feature-card, .pricing-card, .influencer-card, .stat-item'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    revealObserver.observe(el);
  });

  // ── Counter Animation ──
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    if (!target || el.dataset.animated) return;
    el.dataset.animated = 'true';

    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (isDecimal) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
      }
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(el => counterObserver.observe(el));

  // ── Testimonial Carousel ──
  const testimonialTrack = document.getElementById('testimonialTrack');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  let currentSlide = 0;
  const totalSlides = testimonialDots.length;
  let carouselInterval;

  function goToSlide(index) {
    currentSlide = index;
    testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    testimonialDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  testimonialDots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
      resetCarouselTimer();
    });
  });

  // Touch swipe for carousel
  let touchStartX = 0;
  let touchEndX = 0;

  testimonialTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  testimonialTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        goToSlide(currentSlide - 1);
      }
      resetCarouselTimer();
    }
  });

  function autoAdvance() {
    goToSlide((currentSlide + 1) % totalSlides);
    resetCarouselTimer();
  }

  function resetCarouselTimer() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(autoAdvance, 5000);
  }

  carouselInterval = setInterval(autoAdvance, 5000);

  // ── FAQ Accordion ──
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ── Blitz Mode Swipe Demo ──
  const swipeCard = document.getElementById('swipeCard');
  const swipeApprove = document.getElementById('swipeApprove');
  const swipeReject = document.getElementById('swipeReject');

  const swipeCaptions = [
    '"You guys. This jacket. I\'ve worn it 6 times this week. Zero regrets."',
    '"POV: the skincare routine that cleared my acne in 3 weeks. Link in bio."',
    '"Just got the new @techgearuk buds. Sound quality is actually insane."',
    '"Rate my Sunday reset routine 1-10 👇 @homelabuk"'
  ];

  let swipeIndex = 0;

  function doSwipe(direction) {
    const translateX = direction === 'right' ? 300 : -300;
    const rotate = direction === 'right' ? 15 : -15;
    const opacity = '0';

    swipeCard.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    swipeCard.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
    swipeCard.style.opacity = opacity;

    setTimeout(() => {
      swipeIndex = (swipeIndex + 1) % swipeCaptions.length;
      document.querySelector('.swipe-cap').textContent = swipeCaptions[swipeIndex];

      swipeCard.style.transition = 'none';
      swipeCard.style.transform = 'translateX(0) rotate(0deg)';
      swipeCard.style.opacity = '1';

      // Force reflow
      swipeCard.offsetHeight;

      swipeCard.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
    }, 400);
  }

  swipeApprove.addEventListener('click', () => doSwipe('right'));
  swipeReject.addEventListener('click', () => doSwipe('left'));

  // Keyboard swipe
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') doSwipe('right');
    if (e.key === 'ArrowLeft') doSwipe('left');
  });

  // ── Back to Top ──
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Footer Year ──
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // ── Generation Engine Orchestration ──
  const overlay = document.getElementById('genOverlay');
  const modal = document.getElementById('genModal');
  const phase1 = document.getElementById('genPhase1');
  const phase2 = document.getElementById('genPhase2');
  const phaseErr = document.getElementById('genPhaseErr');
  const progressBar = document.getElementById('genProgressBar');
  const genStatus = document.getElementById('genStatus');
  let currentResult = null;
  const genSteps = document.querySelectorAll('.gen-step');

  function resetGenUI() {
    phase1.style.display = 'block';
    phase2.style.display = 'none';
    phaseErr.style.display = 'none';
    progressBar.style.width = '0%';
    genStatus.textContent = 'Analysing your brand...';
    genSteps.forEach(s => { s.classList.remove('active', 'done'); });
    document.querySelector('[data-step="scrape"]').classList.add('active');
  }

  function showPhase2() {
    phase1.style.display = 'none';
    phaseErr.style.display = 'none';
    phase2.style.display = 'block';
  }

  function showPhaseErr(msg) {
    phase1.style.display = 'none';
    phase2.style.display = 'none';
    phaseErr.style.display = 'block';
    document.getElementById('genErrMsg').textContent = msg || 'All proxies failed to reach the site.';
  }

  async function advanceStep(step, percent) {
    const el = document.querySelector(`[data-step="${step}"]`);
    if (el) {
      el.classList.remove('active');
      el.classList.add('done');
    }
    progressBar.style.width = `${percent}%`;

    // Activate next step
    const steps = ['scrape', 'analyze', 'influencer', 'videos', 'render'];
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      const nextEl = document.querySelector(`[data-step="${steps[idx + 1]}"]`);
      if (nextEl) nextEl.classList.add('active');
    }
  }

  function renderResults(result) {
    currentResult = result;
    const { brand, influencer, videos, colors } = result;

    // Brand name
    document.getElementById('genBrandName').textContent = brand.brandName;

    // Influencer card
    const avatarImg = document.getElementById('genAvatarImg');
    avatarImg.style.background = `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`;
    document.getElementById('genInitials').textContent = influencer.name[0];
    document.getElementById('genInfName').textContent = `${influencer.name}, ${influencer.age}`;
    document.getElementById('genInfStyle').textContent = `${influencer.style} — ${influencer.voice.region}`;
    document.getElementById('genInfBio').textContent = influencer.vibe;
    document.getElementById('genVoiceAccent').textContent = `${influencer.voice.name} — ${influencer.voice.style}`;

    // Brand analysis
    document.getElementById('genIndustry').textContent = brand.industry.charAt(0).toUpperCase() + brand.industry.slice(1);
    document.getElementById('genTones').textContent = brand.tones.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
    document.getElementById('genProducts').textContent = brand.products.slice(0, 3).join(', ');
    document.getElementById('genSource').textContent = brand.scraperWorked ? 'Direct site analysis ✓' : 'Domain-based inference';

    // Video grid — show actual rendered videos
    const grid = document.getElementById('genVideosGrid');
    grid.innerHTML = '';
    videos.forEach(v => {
      const hasVideo = v.url && !v.error;
      grid.innerHTML += `
        <div class="gen-video-card">
          <div class="vid-header">
            <span class="vid-format">${v.format}</span>
            <span class="vid-platform">${v.platform}</span>
          </div>
          ${hasVideo ? `
            <div class="vid-player">
              <video 
                src="${v.url}" 
                poster="${v.poster || ''}" 
                controls 
                playsinline 
                preload="metadata"
                class="vid-video"
                width="720" 
                height="1280"
              ></video>
            </div>
          ` : `
            <div class="vid-script">${v.caption}</div>
          `}
          <div class="vid-stats">
            <span>👁 ${v.stats.views >= 1000 ? (v.stats.views/1000).toFixed(1)+'K' : v.stats.views}</span>
            <span>❤ ${v.stats.likes >= 1000 ? (v.stats.likes/1000).toFixed(1)+'K' : v.stats.likes}</span>
            <span>💬 ${v.stats.comments}</span>
          </div>
        </div>`;
    });

    showPhase2();
  }

  async function runGeneration(url) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetGenUI();

    try {
      // Step 1: Scrape
      genStatus.textContent = 'Scanning your website...';
      await sleep(300);
      advanceStep('scrape', 20);

      // Step 2: Analyze
      await sleep(400);
      genStatus.textContent = 'Analysing brand DNA...';
      advanceStep('analyze', 45);

      // Step 3: Generate influencer
      await sleep(500);
      genStatus.textContent = 'Generating your AI influencer...';
      advanceStep('influencer', 70);

      // Step 4: Create videos
      await sleep(600);
      genStatus.textContent = 'Creating video content...';
      advanceStep('videos', 75);

      // Run actual generation (brand analysis + scripts)
      const result = await VYRL.generate(url);

      // If scraper failed, we still render (domain fallback)
      if (!result.brand.scraperWorked) {
        showPhaseErr('Could not reach your site directly. We generated your influencer from domain analysis instead.');
        document.getElementById('genShowFallback').onclick = () => {
          phaseErr.style.display = 'none';
          genStatus.textContent = 'Complete!';
          progressBar.style.width = '100%';
          renderResults(result);
        };
        return;
      }

      // Step 5: Render actual videos
      genStatus.textContent = 'Rendering video files...';
      advanceStep('render', 85);

      const videoDatas = result.videos.map(v => ({
        ...v,
        brandName: result.brand.brandName,
        brandHandle: result.brand.brandName.toLowerCase().replace(/\s+/g, ''),
        caption: v.caption,
        platform: v.platform,
      }));

      const renderedVideos = await VYRLRenderer.renderBatch(
        result.influencer,
        videoDatas,
        (done, total, msg) => {
          genStatus.textContent = msg;
          progressBar.style.width = `${85 + (done / total) * 12}%`;
        }
      );

      result.videos = renderedVideos;

      genStatus.textContent = 'Complete!';
      advanceStep('render', 100);

      await sleep(300);
      renderResults(result);

    } catch (err) {
      console.error('Generation failed:', err);
      showPhaseErr(`Error: ${err.message || 'Something went wrong'}`);
      document.getElementById('genShowFallback').onclick = () => {
        phaseErr.style.display = 'none';
        // Emergency fallback — generate from domain name only
        VYRL.generate(url).then(r => renderResults(r));
      };
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Close modal
  document.getElementById('genClose').addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Start Again button
  document.getElementById('genStartAgain').addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    const heroInput = document.getElementById('heroUrl');
    heroInput.focus();
  });

  // ── Form Handlers (wired to real generation) ──
  window.handleHeroSubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('heroUrl');
    const url = input.value.trim();
    if (!url) {
      showToast('⚠️ Please enter a website URL');
      return;
    }
    input.value = '';
    runGeneration(url);
  };

  window.handleCTASubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('ctaUrl');
    const url = input.value.trim();
    if (!url) {
      showToast('⚠️ Please enter a website URL');
      return;
    }
    input.value = '';
    runGeneration(url);
  };

  // ── Toast ──
  const toast = document.getElementById('toast');

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // ── Parallax hero phones on mouse move ──
  const heroSection = document.querySelector('.hero');
  const phones = document.querySelectorAll('.phone:not(.phone-main)');

  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      phones.forEach((phone, i) => {
        const factor = (i + 1) * 15;
        phone.style.transition = 'transform 0.1s ease-out';
        if (phone.classList.contains('phone-left')) {
          phone.style.transform = `translate(-50%, -50%) rotate(-8deg) translate(${x * factor}px, ${y * factor}px)`;
        } else {
          phone.style.transform = `translate(-50%, -50%) rotate(8deg) translate(${x * factor}px, ${y * factor}px)`;
        }
      });
    });

    heroSection.addEventListener('mouseleave', () => {
      phones.forEach(phone => {
        phone.style.transition = 'transform 0.6s ease';
        if (phone.classList.contains('phone-left')) {
          phone.style.transform = 'translate(-50%, -50%) rotate(-8deg)';
        } else {
          phone.style.transform = 'translate(-50%, -50%) rotate(8deg)';
        }
      });
    });
  }

})();
