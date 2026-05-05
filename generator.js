/* ═══════════════════════════════════════════
   VYRL — generator.js
   Brand scraper + AI influencer profile engine
   Client-side (uses CORS proxy for URL fetching)
   ═══════════════════════════════════════════ */

const VYRL = (() => {
  'use strict';

  // ── CORS Proxies (tried in order) ──
  const PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  // ── UK regional voice accents ──
  const VOICES = [
    { id: 'rp', name: 'Received Pronunciation', region: 'South East', style: 'polished, trustworthy' },
    { id: 'cockney', name: 'Cockney', region: 'East London', style: 'gritty, authentic' },
    { id: 'scouse', name: 'Scouse', region: 'Liverpool', style: 'warm, witty' },
    { id: 'manc', name: 'Mancunian', region: 'Manchester', style: 'confident, northern charm' },
    { id: 'brum', name: 'Brummie', region: 'Birmingham', style: 'friendly, down-to-earth' },
    { id: 'yorks', name: 'Yorkshire', region: 'Yorkshire', style: 'no-nonsense, relatable' },
    { id: 'geordie', name: 'Geordie', region: 'Newcastle', style: 'energetic, fun' },
    { id: 'scottish', name: 'Scottish', region: 'Scotland', style: 'passionate, distinctive' },
    { id: 'welsh', name: 'Welsh', region: 'Wales', style: 'melodic, warm' },
    { id: 'essex', name: 'Estuary English', region: 'Essex', style: 'trendy, relatable' },
    { id: 'bristol', name: 'West Country', region: 'Bristol', style: 'rustic, honest' },
  ];

  // ── Industry → Influencer Archetypes ──
  const ARCHETYPES = {
    'beauty': [
      { age: 24, gender: 'female', name: 'Maya', style: 'Clean Girl Aesthetic', vibe: 'soft-spoken, ingredient-obsessed skincare guru' },
      { age: 27, gender: 'female', name: 'Zara', style: 'Bold Glam', vibe: 'confident, trend-setting makeup artist' },
    ],
    'fashion': [
      { age: 25, gender: 'female', name: 'Priya', style: 'Street Style', vibe: 'effortlessly cool, trend-aware fashion enthusiast' },
      { age: 29, gender: 'male', name: 'Kai', style: 'Minimalist', vibe: 'sharp, fashion-forward city professional' },
    ],
    'fitness': [
      { age: 28, gender: 'male', name: 'Josh', style: 'Athletic', vibe: 'high-energy, motivational fitness coach' },
      { age: 26, gender: 'female', name: 'Tara', style: 'Wellness', vibe: 'holistic health advocate, yoga instructor' },
    ],
    'tech': [
      { age: 32, gender: 'male', name: 'Leo', style: 'Tech Reviewer', vibe: 'sharp, analytical gadget reviewer' },
      { age: 28, gender: 'female', name: 'Ada', style: 'Productivity Creator', vibe: 'smart, relatable tech tips creator' },
    ],
    'food': [
      { age: 30, gender: 'female', name: 'Ella', style: 'Home Cook', vibe: 'passionate home chef, recipe creator' },
      { age: 27, gender: 'male', name: 'Tom', style: 'Foodie Explorer', vibe: 'adventurous eater, honest reviewer' },
    ],
    'home': [
      { age: 31, gender: 'female', name: 'Sophie', style: 'Home Décor', vibe: 'cosy home stylist, DIY enthusiast' },
      { age: 34, gender: 'male', name: 'Dan', style: 'DIY Pro', vibe: 'practical, no-nonsense renovation expert' },
    ],
    'travel': [
      { age: 26, gender: 'female', name: 'Luna', style: 'Solo Traveller', vibe: 'adventurous budget traveller' },
      { age: 30, gender: 'male', name: 'Oscar', style: 'Luxury Explorer', vibe: 'discerning, experience-seeking traveller' },
    ],
    '_default': [
      { age: 27, gender: 'female', name: 'Amelia', style: 'Lifestyle Creator', vibe: 'versatile, charismatic brand storyteller' },
      { age: 31, gender: 'male', name: 'Jack', style: 'Product Reviewer', vibe: 'trustworthy, detailed product advocate' },
    ],
  };

  // ── Mock video template formats ──
  const VIDEO_FORMATS = [
    {
      id: 'haul', name: 'Mini Haul', style: 'casual',
      template: (brand, product, influencer) =>
        `Just got my @${brand} order and I'm honestly obsessed 😍 ${product} is a total game changer. Watch 'til the end for the ick test! #${brand}haul #UKfinds`,
    },
    {
      id: 'review', name: 'Honest Review', style: 'trustworthy',
      template: (brand, product, influencer) =>
        `POV: you finally found ${product} that actually works. I've been using @${brand} for 2 weeks now and here's my unfiltered review. Spoiler: it's good. #honestreview #${brand}`,
    },
    {
      id: 'grwm', name: 'Get Ready With Me', style: 'intimate',
      template: (brand, product, influencer) =>
        `GRWM while I chat about why @${brand} has been my go-to this month. ${product} is the one thing I won't skip in my routine. #GRWM #${brand}partner`,
    },
    {
      id: 'comparison', name: 'Then vs Now', style: 'transformation',
      template: (brand, product, influencer) =>
        `Before @${brand} vs. after. The difference is actually mad. ${product} has completely changed my game. Not even exaggerating. #transformation #${brand}`,
    },
    {
      id: 'dayinlife', name: 'Day In The Life', style: 'aspirational',
      template: (brand, product, influencer) =>
        `Come with me on a typical day and see how ${product} from @${brand} fits into everything I do. It's the little things that stack up. #dayinmylife #${brand}`,
    },
    {
      id: 'unboxing', name: 'Unboxing', style: 'exciting',
      template: (brand, product, influencer) =>
        `The moment you've been waiting for — unboxing the new ${product} from @${brand}. The packaging alone has me shook. Wait for the reveal 👀 #unboxing #${brand}`,
    },
    {
      id: 'tutorial', name: 'Quick Tutorial', style: 'educational',
      template: (brand, product, influencer) =>
        `Stop scrolling and watch this. Here's how to actually use ${product} from @${brand}. 30 seconds that'll change your life. Save this for later. #tutorial #${brand}`,
    },
    {
      id: 'problemsolution', name: 'Problem → Solution', style: 'relatable',
      template: (brand, product, influencer) =>
        `Struggling with [problem]? Same, until I found ${product} from @${brand}. 10/10 would recommend. Link in the usual place. #solved #${brand}`,
    },
  ];

  // ── Brand categories with keywords ──
  const CATEGORY_MAP = {
    beauty: ['beauty', 'skincare', 'makeup', 'cosmetics', 'serum', 'cream', 'glow', 'skin', 'face', 'lipstick', 'mascara', 'foundation', 'cleanse', 'moisturiser'],
    fashion: ['fashion', 'clothing', 'apparel', 'wear', 'dress', 'shoes', 'jacket', 'outfit', 'style', 'streetwear', 'accessories', 'jewellery'],
    fitness: ['fitness', 'gym', 'workout', 'supplement', 'protein', 'nutrition', 'health', 'wellness', 'sport', 'active', 'training', 'yoga'],
    tech: ['tech', 'gadget', 'software', 'app', 'device', 'phone', 'laptop', 'headphone', 'smart', 'digital', 'AI', 'automation'],
    food: ['food', 'drink', 'coffee', 'tea', 'snack', 'meal', 'recipe', 'cook', 'bake', 'organic', 'vegan', 'delivery', 'restaurant'],
    home: ['home', 'house', 'furniture', 'décor', 'interior', 'renovation', 'kitchen', 'bedroom', 'living', 'garden', 'diy'],
    travel: ['travel', 'hotel', 'flight', 'holiday', 'vacation', 'tour', 'destination', 'luggage', 'adventure', 'explore'],
  };

  // ── Utility functions ──
  function normalizeUrl(url) {
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }

  function extractDomain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch(e) { return url; }
  }

  function extractBrandName(domain) {
    return domain.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  async function fetchPage(url) {
    for (const proxyFn of PROXIES) {
      try {
        const proxyUrl = proxyFn(url);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const html = await res.text();
          if (html.length > 200 && (html.includes('<html') || html.includes('<body') || html.includes('<!DOCTYPE'))) {
            return html;
          }
        }
      } catch(e) {
        continue;
      }
    }
    throw new Error('All CORS proxies failed. The site may block external access.');
  }

  function parseHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Title
    const title = doc.querySelector('title')?.textContent?.trim() || '';
    
    // Meta description
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
                        doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() || '';
    
    // Headings
    const h1s = [...doc.querySelectorAll('h1')].map(h => h.textContent.trim()).filter(Boolean);
    const h2s = [...doc.querySelectorAll('h2')].map(h => h.textContent.trim()).filter(Boolean).slice(0, 10);
    
    // Body text — extract meaningful text blocks
    const bodyText = doc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';
    
    // Try to find product names / key terms
    const productElements = doc.querySelectorAll('[class*="product"], [class*="item"], [class*="card"], [data-product]');
    const productNames = [...productElements].map(el => el.textContent.trim()).filter(t => t.length > 3 && t.length < 120).slice(0, 8);
    
    // Images (for vibe analysis)
    const images = [...doc.querySelectorAll('img')]
      .map(img => img.getAttribute('alt') || '')
      .filter(Boolean)
      .slice(0, 10);
    
    // Extract CSS colors if available
    const styles = [...doc.querySelectorAll('style')].map(s => s.textContent).join(' ');
    const colorMatches = styles.match(/#[0-9a-fA-F]{6}/g) || [];
    
    return { title, description, h1s, h2s, bodyText, productNames, images, colorMatches };
  }

  function detectIndustry(parsed, domain) {
    const allText = (parsed.title + ' ' + parsed.description + ' ' + parsed.h1s.join(' ') + ' ' + parsed.bodyText).toLowerCase();
    
    const scores = {};
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
      scores[category] = keywords.reduce((score, kw) => 
        score + (allText.match(new RegExp('\\b' + kw + '\\w*', 'gi')) || []).length * 3, 0
      );
    }
    
    // Boost from domain name
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
      keywords.forEach(kw => {
        if (domain.includes(kw)) scores[category] += 15;
      });
    }
    
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topScore = sorted[0][1];
    
    // If no strong signal, return default
    if (topScore < 10) return 'lifestyle';
    
    return sorted[0][0];
  }

  function analyzeTone(parsed) {
    const allText = (parsed.description + ' ' + parsed.h2s.join(' ')).toLowerCase();
    
    const tones = {
      bold: ['revolutionary', 'game.changer', 'disrupt', 'powerful', 'ultimate', 'best', '#1', 'leading'],
      friendly: ['hello', 'welcome', 'friend', 'community', 'together', 'we', 'you', 'your', 'help'],
      premium: ['luxury', 'premium', 'exclusive', 'bespoke', 'crafted', 'curated', 'artisan', 'concierge'],
      playful: ['fun', 'play', 'joy', 'happy', 'love', 'magic', 'delight', '✨', '🎉', '💫'],
      sustainable: ['sustainable', 'eco', 'green', 'organic', 'ethical', 'planet', 'carbon', 'recycle'],
    };
    
    const scores = {};
    for (const [tone, keywords] of Object.entries(tones)) {
      scores[tone] = keywords.reduce((s, kw) => 
        s + (allText.match(new RegExp(kw, 'gi')) || []).length * 10, 0
      );
    }
    
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    // Pick top 2 tones
    return sorted.slice(0, 2).map(([t]) => t);
  }

  function generateInfluencerProfile(brandInfo) {
    const { industry, brandName, domain, tones } = brandInfo;
    
    const archetypes = ARCHETYPES[industry] || ARCHETYPES._default;
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    
    // Pick a voice that matches the brand's vibe
    const voice = VOICES[Math.floor(Math.random() * VOICES.length)];
    
    return {
      name: archetype.name,
      age: archetype.age,
      gender: archetype.gender,
      style: archetype.style,
      vibe: archetype.vibe,
      voice: voice,
      personaStatement: `${archetype.name} is a ${archetype.age}-year-old ${archetype.vibe} based in ${voice.region}. They speak with a ${voice.name} accent that brings ${voice.style} energy to every video.`,
      brandFit: `${archetype.name} is the perfect ambassador for ${brandName} because their ${tones.join(' and ')} approach aligns naturally with the brand's identity.`,
    };
  }

  function generateVideoScripts(brandInfo, influencer, count = 8) {
    const { brandName } = brandInfo;
    const product = brandInfo.products[0] || brandInfo.brandName;
    const shuffled = [...VIDEO_FORMATS].sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, count).map((format, i) => ({
      id: `vid-${i + 1}`,
      format: format.name,
      style: format.style,
      platform: i % 3 === 0 ? 'TikTok' : i % 3 === 1 ? 'Reels' : 'Shorts',
      caption: format.template(brandName.toLowerCase().replace(/\s+/g, ''), product, influencer.name),
      stats: {
        views: Math.floor(Math.random() * 95000) + 5000,
        likes: Math.floor(Math.random() * 8500) + 500,
        comments: Math.floor(Math.random() * 450) + 20,
        shares: Math.floor(Math.random() * 200) + 10,
      },
      status: 'generated',
    }));
  }

  function getBrandColorsFromSite(parsed) {
    const purpleShades = ['#7C3AED', '#8B5CF6', '#A855F7', '#C084FC', '#6D28D9'];
    const cyanShades = ['#06B6D4', '#22D3EE', '#67E8F9', '#0891B2', '#0E7490'];
    
    // Try to find dominant colors from the site
    if (parsed.colorMatches && parsed.colorMatches.length > 3) {
      const hexes = parsed.colorMatches.filter(h => {
        const r = parseInt(h.slice(1,3), 16);
        const g = parseInt(h.slice(3,5), 16);
        const b = parseInt(h.slice(5,7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 200 && brightness > 20; // not too light, not too dark
      });
      
      if (hexes.length >= 2) {
        return {
          primary: hexes[0],
          accent: hexes[Math.min(1, hexes.length - 1)],
        };
      }
    }
    
    // Fallback: VYRL brand colors
    return {
      primary: purpleShades[Math.floor(Math.random() * purpleShades.length)],
      accent: cyanShades[Math.floor(Math.random() * cyanShades.length)],
    };
  }

  // ── Main generation pipeline ──
  async function generate(url) {
    const normalizedUrl = normalizeUrl(url);
    const domain = extractDomain(normalizedUrl);
    const brandName = extractBrandName(domain);

    let parsed = null;
    let industry = null;
    let tones = ['friendly', 'bold'];
    let products = [brandName];
    let scraperWorked = false;

    // Try to scrape the site
    try {
      const html = await fetchPage(normalizedUrl);
      parsed = parseHTML(html);
      industry = detectIndustry(parsed, domain);
      tones = analyzeTone(parsed);
      products = parsed.productNames.length > 0 ? parsed.productNames.slice(0, 5) : [brandName];
      scraperWorked = true;
    } catch (e) {
      // Scraping failed — use domain-based fallback
      industry = detectIndustry({ title: '', description: '', h1s: [], bodyText: '' }, domain);
      if (industry === 'lifestyle') {
        // Try to guess from domain
        for (const [cat, kws] of Object.entries(CATEGORY_MAP)) {
          if (kws.some(kw => brandName.toLowerCase().includes(kw))) {
            industry = cat;
            break;
          }
        }
      }
      products = [brandName];
    }

    const brandInfo = {
      brandName,
      domain,
      normalizedUrl,
      industry,
      tones,
      products,
      scraperWorked,
      parsed,
    };

    const influencer = generateInfluencerProfile(brandInfo);
    const videos = generateVideoScripts(brandInfo, influencer);
    const colors = parsed ? getBrandColorsFromSite(parsed) : { primary: '#7C3AED', accent: '#06B6D4' };

    return {
      brand: brandInfo,
      influencer,
      videos,
      colors,
      generatedAt: new Date().toISOString(),
    };
  }

  // ── Public API ──
  return {
    generate,
    VOICES,
    VIDEO_FORMATS,
    ARCHETYPES,
    CATEGORY_MAP,
  };
})();
