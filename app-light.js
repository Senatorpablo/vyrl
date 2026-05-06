(function() {
  'use strict';

  const loader = document.getElementById('loader');
  if (document.readyState === 'complete') loader.classList.add('hidden');
  else window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 400));

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
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', function(e) { const t = document.querySelector(this.getAttribute('href')); if(t) { e.preventDefault(); window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-64,behavior:'smooth'}); } }));

  // Gallery
  const gals = RealFaces.getGalleryFaces();
  const gg = document.getElementById('galleryGrid');
  gals.forEach(inf => { const c=document.createElement('div');c.className='gal-card';const i=document.createElement('div');i.className='gal-img';const img=document.createElement('img');img.src=inf.faceData;img.alt=inf.name;img.loading='lazy';i.appendChild(img);c.appendChild(i);const d=document.createElement('div');d.className='gal-info';d.innerHTML=`<div class="gal-name">${inf.name}</div><div class="gal-style">${inf.style}</div>`;c.appendChild(d);gg.appendChild(c); });

  // Hero + blitz faces
  const heroFaces = document.querySelectorAll('.hps-face');
  [['maya','female'],['josh','male'],['priya','female']].forEach(([n,g],idx)=>{if(heroFaces[idx]){const f=RealFaces.getFace(n,g);if(f){const img=document.createElement('img');img.src=f;img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:50%;';heroFaces[idx].innerHTML='';heroFaces[idx].appendChild(img);}}});
  const bpFace = document.querySelector('.bp-face'); if(bpFace){const f=RealFaces.getFace('priya','female');if(f){const img=document.createElement('img');img.src=f;img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:50%;';bpFace.innerHTML='';bpFace.appendChild(img);}}

  // Blitz swipe
  const swipes = ['"You guys. This jacket. 6 wears. Zero regrets. @cosylondon"','"POV: the skincare that cleared my acne. @glowlab_club"','"Just got @techgearuk buds. Sound is mental."','"Rate my Sunday reset 👇 @homelabuk"','"Tried this viral recipe. @fitfueluk"'];
  let si=0; const sc=document.getElementById('bpSwipeCard'),scc=sc?.querySelector('.bp-cap');
  function doSwipe(dir){const x=dir==='right'?200:-200;sc.style.transition='transform .4s ease,opacity .4s ease';sc.style.transform=`translateX(${x}px) rotate(${dir==='right'?12:-12}deg)`;sc.style.opacity='0';setTimeout(()=>{si=(si+1)%swipes.length;scc.textContent=swipes[si];sc.style.transition='none';sc.style.transform='';sc.style.opacity='1';sc.offsetHeight;sc.style.transition='transform .4s cubic-bezier(.175,.885,.32,1.275),opacity .4s ease';},400);}
  document.getElementById('bpApprove')?.addEventListener('click',()=>doSwipe('right'));document.getElementById('bpReject')?.addEventListener('click',()=>doSwipe('left'));document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')doSwipe('right');if(e.key==='ArrowLeft')doSwipe('left');});

  // Testimonials
  const tt=document.getElementById('testimonialTrack'),td=document.querySelectorAll('.testim-dot');let ts=0,ti;function gt(n){ts=n;tt.style.transform=`translateX(-${ts*100}%)`;td.forEach((d,i)=>d.classList.toggle('active',i===ts));}td.forEach(d=>d.addEventListener('click',()=>{gt(+d.dataset.idx);clearInterval(ti);ti=setInterval(()=>gt((ts+1)%3),5000);}));ti=setInterval(()=>gt((ts+1)%3),5000);
  document.querySelectorAll('.faq-q').forEach(b=>b.addEventListener('click',()=>{const i=b.parentElement,o=i.classList.contains('open');document.querySelectorAll('.faq-item').forEach(x=>x.classList.remove('open'));if(!o)i.classList.add('open');}));
  document.getElementById('footerYear').textContent=new Date().getFullYear();

  // Generation
  const ov=document.getElementById('genOverlay'),p1=document.getElementById('genPhaseProgress'),p2=document.getElementById('genPhaseResults'),bf=document.getElementById('genBarFill'),gs=document.getElementById('genStatus'),sl=document.getElementById('genStepList');
  const stp=[{id:'scrape',l:'Analysing your brand'},{id:'influencer',l:'Generating AI influencer'},{id:'videos',l:'Creating video scripts'},{id:'render',l:'Rendering UGC videos'}];
  function bs(){sl.innerHTML=stp.map((s,i)=>`<div class="gen-step-item${i===0?' active':''}" data-step="${s.id}">${s.l}</div>`).join('');return sl.querySelectorAll('.gen-step-item');}
  function rg(){p1.style.display='block';p2.style.display='none';bf.style.width='0%';gs.textContent='Connecting...';bs();}function sr(){p1.style.display='none';p2.style.display='block';}
  function ds(id,pct){const e=sl.querySelector(`[data-step="${id}"]`);if(e){e.classList.remove('active');e.classList.add('done');}bf.style.width=`${pct}%`;const idx=stp.findIndex(s=>s.id===id);if(idx<stp.length-1){const n=sl.querySelector(`[data-step="${stp[idx+1].id}"]`);if(n)n.classList.add('active');}}
  function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),3500);}

  async function runGen(rawUrl){
    ov.classList.add('active');document.body.style.overflow='hidden';rg();
    try{
      const url=fixUrl(rawUrl);gs.textContent='Analysing...';await sleep(500);ds('scrape',25);
      const result=await VYRL.generate(url);
      const scraperWorked=result.brand.scraperWorked;
      gs.textContent=scraperWorked?'Generating influencer...':'Using brand analysis...';await sleep(400);ds('influencer',55);
      gs.textContent='Creating scripts...';await sleep(300);ds('videos',72);
      gs.textContent='Rendering videos...';ds('render',80);
      const vdata=result.videos.map(v=>({...v,brandName:result.brand.brandName,brandHandle:result.brand.brandName.toLowerCase().replace(/\s+/g,''),industry:result.brand.industry,caption:v.caption,platform:v.platform}));
      const rendered=await VYRLRenderer.renderBatch(result.influencer,vdata,(d,t,m)=>{gs.textContent=m;bf.style.width=`${80+(d/t)*18}%`;});
      result.videos=rendered;gs.textContent='Complete!';ds('render',100);await sleep(300);sr();renderResults(result);
    }catch(e){console.error(e);toast('⚠ Could not render. Using generated profile anyway.');try{const result=await VYRL.generate(fixUrl(rawUrl));sr();renderResults(result);}catch(e2){toast('⚠ Please try a different website URL');ov.classList.remove('active');document.body.style.overflow='';}}}

  function fixUrl(url){url=url.trim();if(!/^https?:\/\//i.test(url))url='https://'+url;return url;}

  function renderResults(r){const{brand,influencer,videos}=r;
    document.getElementById('grBrandName').textContent=brand.brandName;
    const av=document.getElementById('griAvatar');av.innerHTML='';const face=RealFaces.getFace(influencer.name.toLowerCase(),influencer.gender||'female');if(face){const img=document.createElement('img');img.src=face;img.style.cssText='width:100%;height:100%;object-fit:cover;';av.appendChild(img);}else{const d=document.createElement('div');d.style.cssText='width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#FF530F,#FF9500);display:flex;align-items:center;justify-content:center;color:#fff;font-size:2em;font-weight:900;';d.textContent=influencer.name[0];av.appendChild(d);}
    document.getElementById('griName').textContent=`${influencer.name}, ${influencer.age}`;document.getElementById('griStyle').textContent=`${influencer.style} — ${influencer.voice.region}`;document.getElementById('griBio').textContent=influencer.vibe;document.getElementById('griVoice').innerHTML=`🗣️ ${influencer.voice.name} — ${influencer.voice.style}`;
    document.getElementById('grAnalysis').innerHTML=`<div class="gr-ai"><strong>Industry</strong><span>${brand.industry.charAt(0).toUpperCase()+brand.industry.slice(1)}</span></div><div class="gr-ai"><strong>Brand Tone</strong><span>${brand.tones.map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(', ')}</span></div><div class="gr-ai"><strong>Products</strong><span>${brand.products.slice(0,3).join(', ')}</span></div><div class="gr-ai"><strong>Source</strong><span>${brand.scraperWorked?'Direct site ✓':'Domain analysis'}</span></div>`;
    const vg=document.getElementById('grVideoGrid');vg.innerHTML=videos.map(v=>{const h=v.url&&!v.error;return`<div class="gr-vid">${h?`<video src="${v.url}" poster="${v.poster||''}" controls playsinline preload="metadata" style="width:100%;aspect-ratio:9/16;background:#000;border-radius:8px;"></video>`:`<div style="width:100%;aspect-ratio:9/16;background:#000;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#666;font-size:.8em;">Render skipped</div>`}<div class="gr-vid-cap">${v.format} · ${v.platform}</div></div>`}).join('');}
  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
  document.getElementById('genClose')?.addEventListener('click',()=>{ov.classList.remove('active');document.body.style.overflow='';});
  ov.addEventListener('click',e=>{if(e.target===ov){ov.classList.remove('active');document.body.style.overflow='';}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('active')){ov.classList.remove('active');document.body.style.overflow='';}});
  document.getElementById('genAgain')?.addEventListener('click',()=>{ov.classList.remove('active');document.body.style.overflow='';document.getElementById('heroUrl').focus();});

  window.handleStart=function(e){e.preventDefault();const input=e.target.querySelector('input[type="text"]');const url=(input&&input.value.trim())||'';if(!url){toast('⚠ Please enter your website domain');return false;}input.value='';runGen(url);return false;};

})();
