/**
 * VYRL — test suite
 * Tests pure-logic functions extracted from generator.js.
 * Run: node test.mjs
 */

let passed = 0, failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

// ── Inline the pure functions under test ──────────────────────────────────────

function normalizeUrl(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch(e) { return url; }
}

function extractBrandName(domain) {
  return domain.replace(/(\.[a-z]{2,6})+$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const CATEGORY_MAP = {
  beauty: ['beauty', 'skincare', 'makeup', 'cosmetics', 'serum', 'cream', 'glow', 'skin', 'face', 'lipstick', 'mascara', 'foundation', 'cleanse', 'moisturiser'],
  fashion: ['fashion', 'clothing', 'apparel', 'wear', 'dress', 'shoes', 'jacket', 'outfit', 'style', 'streetwear', 'accessories', 'jewellery'],
  fitness: ['fitness', 'gym', 'workout', 'supplement', 'protein', 'nutrition', 'health', 'wellness', 'sport', 'active', 'training', 'yoga'],
  tech: ['tech', 'gadget', 'software', 'app', 'device', 'phone', 'laptop', 'headphone', 'smart', 'digital', 'AI', 'automation'],
  food: ['food', 'drink', 'coffee', 'tea', 'snack', 'meal', 'recipe', 'cook', 'bake', 'organic', 'vegan', 'delivery', 'restaurant'],
  home: ['home', 'house', 'furniture', 'décor', 'interior', 'renovation', 'kitchen', 'bedroom', 'living', 'garden', 'diy'],
  travel: ['travel', 'hotel', 'flight', 'holiday', 'vacation', 'tour', 'destination', 'luggage', 'adventure', 'explore'],
};

function detectIndustry(parsed, domain) {
  const allText = (parsed.title + ' ' + parsed.description + ' ' + (parsed.h1s||[]).join(' ') + ' ' + parsed.bodyText).toLowerCase();
  const scores = {};
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    scores[category] = keywords.reduce((score, kw) =>
      score + (allText.match(new RegExp('\\b' + kw + '\\w*', 'gi')) || []).length * 3, 0
    );
  }
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    keywords.forEach(kw => { if (domain.includes(kw)) scores[category] += 15; });
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] < 10) return 'lifestyle';
  return sorted[0][0];
}

function analyzeTone(parsed) {
  const allText = (parsed.description + ' ' + (parsed.h2s||[]).join(' ')).toLowerCase();
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
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log('\nnormalizeUrl');
assert('bare domain gets https://', normalizeUrl('glossier.com') === 'https://glossier.com');
assert('bare domain with path gets https://', normalizeUrl('glossier.com/products') === 'https://glossier.com/products');
assert('existing http:// unchanged', normalizeUrl('http://example.com') === 'http://example.com');
assert('existing https:// unchanged', normalizeUrl('https://example.com') === 'https://example.com');
assert('trims whitespace', normalizeUrl('  glossier.com  ') === 'https://glossier.com');

console.log('\nextractDomain');
assert('strips www', extractDomain('https://www.glossier.com') === 'glossier.com');
assert('keeps subdomain that is not www', extractDomain('https://shop.glossier.com') === 'shop.glossier.com');
assert('plain domain', extractDomain('https://glossier.com') === 'glossier.com');
assert('handles invalid URL gracefully', typeof extractDomain('not-a-url') === 'string');

console.log('\nextractBrandName');
assert('single word domain', extractBrandName('glossier.com') === 'Glossier');
assert('hyphenated .co.uk domain', extractBrandName('cosy-london.co.uk') === 'Cosy London');
assert('underscore domain', extractBrandName('glow_lab.com') === 'Glow Lab');
assert('.co.uk strips both segments', extractBrandName('fitfuel.co.uk') === 'Fitfuel');

console.log('\ndetectIndustry');
assert('beauty keyword in text', detectIndustry({ title: 'Skincare serum for glowing skin', description: '', bodyText: 'moisturiser serum cream glow face' }, 'brand.com') === 'beauty');
assert('tech keyword in text', detectIndustry({ title: 'Best laptops and gadgets', description: 'digital devices', bodyText: 'tech gadget device phone smart' }, 'brand.com') === 'tech');
assert('keyword in domain boosts score', detectIndustry({ title: '', description: '', bodyText: '' }, 'skincare-shop.com') === 'beauty');
assert('no signal → lifestyle', detectIndustry({ title: '', description: '', bodyText: '' }, 'xyz123.com') === 'lifestyle');

console.log('\nanalyzeTone');
const friendlyTones = analyzeTone({ description: 'We welcome you to our community. Your help matters to us and together we grow', h2s: [] });
assert('friendly text → includes friendly', friendlyTones.includes('friendly'));
assert('returns 2 tones', friendlyTones.length === 2);

const premiumTones = analyzeTone({ description: 'Luxury bespoke artisan crafted concierge exclusive', h2s: [] });
assert('premium text → includes premium', premiumTones.includes('premium'));

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
