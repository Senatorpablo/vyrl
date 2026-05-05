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

  // ── Form Handlers ──
  window.handleHeroSubmit = function(e) {
    e.preventDefault();
    const url = document.getElementById('heroUrl').value;
    showToast(`✓ Scanning ${url || 'your website'}... We'll generate your influencer shortly.`);
    document.getElementById('heroUrl').value = '';
  };

  window.handleCTASubmit = function(e) {
    e.preventDefault();
    const url = document.getElementById('ctaUrl').value;
    showToast(`✓ ${url || 'Success'}! Your AI influencer is being generated. Check your email.`);
    document.getElementById('ctaUrl').value = '';
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
