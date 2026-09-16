/* =========================================================
   CONFIG — edit these to personalize the site. Used across
   every page (boarding pass on index.html, message on
   finale.html, etc).
   ========================================================= */
const CONFIG = {
  name: "My Friend Lyra",
  boardingDate: "Her Birthday",
  seat: "1A",
  flightNumber: "AE-" + new Date().getFullYear(),
  finaleMessage: "HAPPY HAPPY BIRTHDAY LYRA! 🎉🎂🎈Thanks for the long friendship we have!Goodluck on your journey as 21, Wishing you na sumakses ka para libre mo na lang ako 🥰Im wishing you  to have healthy and blessed life🎀🩷"
};

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Gate order, used for nav active-state + progress rail ---------- */
const GATES = [
  { id:'home',     href:'index.html',    label:'Home' },
  { id:'math',     href:'math.html',     label:'Math' },
  { id:'chess',    href:'chess.html',    label:'Chess' },
  { id:'eras',     href:'eras.html',     label:'Eras' },
  { id:'aviation', href:'aviation.html', label:'Aviation' },
  { id:'finale',   href:'finale.html',   label:'Arrivals' }
];

function currentPageId(){
  return document.body.getAttribute('data-page') || 'home';
}

/* ---------- Visited-gate tracking (localStorage) ---------- */
function markVisited(id){
  if(id === 'home') return;
  try{
    const v = JSON.parse(localStorage.getItem('bday_visited') || '[]');
    if(!v.includes(id)){ v.push(id); localStorage.setItem('bday_visited', JSON.stringify(v)); }
  }catch(e){}
}
function getVisited(){
  try{ return JSON.parse(localStorage.getItem('bday_visited') || '[]'); }catch(e){ return []; }
}

/* ---------- Page transition overlay ---------- */
function initPageTransition(){
  const overlay = document.getElementById('pageTransition');
  if(!overlay) return;

  // Entering: fade the covering overlay away
  requestAnimationFrame(()=>{
    setTimeout(()=> overlay.classList.add('hide'), REDUCED_MOTION ? 0 : 120);
  });

  // Leaving: intercept same-site nav links and play the fly-across animation first
  document.querySelectorAll('a[data-transition]').forEach(link=>{
    link.addEventListener('click', e=>{
      const href = link.getAttribute('href');
      if(!href || link.target === '_blank') return;
      e.preventDefault();
      if(REDUCED_MOTION){ window.location.href = href; return; }
      overlay.classList.remove('hide');
      overlay.classList.add('animate-out');
      setTimeout(()=>{ window.location.href = href; }, 620);
    });
  });
}

/* ---------- Nav + progress rail injection ---------- */
function initNav(){
  const navEl = document.getElementById('siteNav');
  if(!navEl) return;
  const visited = getVisited();
  navEl.innerHTML = GATES.map(g=>{
    const isActive = g.id === currentPageId();
    const isVisited = visited.includes(g.id);
    return `<a href="${g.href}" data-transition class="${isActive ? 'active':''}">${g.label}${isVisited ? '<span class="check">✓</span>':''}</a>`;
  }).join('');

  const railEl = document.getElementById('progressRail');
  if(railEl){
    const order = GATES.filter(g=>g.id!=='home');
    const currentIdx = order.findIndex(g=>g.id===currentPageId());
    railEl.innerHTML = order.map((g,i)=>{
      let cls = '';
      if(i < currentIdx || visited.includes(g.id)) cls = 'done';
      if(i === currentIdx) cls = 'current';
      return `<div class="seg ${cls}" title="${g.label}"><div class="fill"></div></div>`;
    }).join('');
  }
}

/* ---------- Scroll reveal ---------- */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  if(REDUCED_MOTION || !('IntersectionObserver' in window)){
    items.forEach(el=> el.classList.add('in'));
    return;
  }
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('in'); obs.unobserve(entry.target); }
    });
  }, { threshold:.15 });
  items.forEach(el=> obs.observe(el));
}

/* ---------- Starfield ---------- */
function initStars(){
  const canvas = document.getElementById('stars');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w,h,stars=[];

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.body.scrollHeight;
    stars = [];
    const count = Math.floor((w*h)/9000);
    for(let i=0;i<count;i++){
      stars.push({ x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.4+.3, phase:Math.random()*Math.PI*2, speed:Math.random()*.02+.008 });
    }
  }
  function draw(t){
    ctx.clearRect(0,0,w,h);
    for(const s of stars){
      const tw = REDUCED_MOTION ? 1 : (Math.sin(t*s.speed + s.phase)+1)/2;
      ctx.globalAlpha = .25 + tw*.75;
      ctx.fillStyle = '#e8f1ff';
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if(!REDUCED_MOTION) requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

/* ---------- Hero looping plane (home only) ---------- */
function initHeroPlane(){
  const host = document.getElementById('planeLoop');
  if(!host) return;
  host.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="none" style="width:100%;height:100%;">
    <path id="loopPath" d="M -50 480 C 200 380, 350 500, 550 420 S 900 250, 1050 300" fill="none" stroke="#4f7fd433" stroke-width="1.5" stroke-dasharray="6 8"/>
  </svg>`;
  const path = document.getElementById('loopPath');
  const len = path.getTotalLength();
  const plane = document.createElementNS('http://www.w3.org/2000/svg','text');
  plane.textContent = '✈';
  plane.setAttribute('font-size','22');
  plane.setAttribute('fill', '#f4c95d');
  path.parentNode.appendChild(plane);
  let start = null;
  function frame(ts){
    if(!start) start = ts;
    const dur = 9000;
    const p = ((ts-start)%dur)/dur;
    const pt = path.getPointAt(p*len);
    const pt2 = path.getPointAt(Math.min(p*len+2,len));
    const angle = Math.atan2(pt2.y-pt.y, pt2.x-pt.x) * 180/Math.PI;
    plane.setAttribute('x', pt.x-11);
    plane.setAttribute('y', pt.y+7);
    plane.setAttribute('transform', `rotate(${angle} ${pt.x} ${pt.y})`);
    if(!REDUCED_MOTION) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- Boarding pass fill (home only) ---------- */
function initBoardingPass(){
  const nameEl = document.getElementById('passName');
  if(!nameEl) return;
  nameEl.textContent = CONFIG.name;
  document.getElementById('passDate').textContent = CONFIG.boardingDate;
  document.getElementById('passSeat').textContent = CONFIG.seat;
  document.getElementById('flightNo').textContent = CONFIG.flightNumber;

  const bc = document.getElementById('barcode');
  let html = '';
  for(let i=0;i<26;i++){
    const bw = Math.random() > .7 ? 4 : 2.5;
    const bh = 20 + Math.random()*14;
    html += `<span style="width:${bw}px;height:${bh}px;"></span>`;
  }
  bc.innerHTML = html;
}

/* ---------- Gate grid visited badges (home only) ---------- */
function initGateGrid(){
  const grid = document.getElementById('gateGrid');
  if(!grid) return;
  const visited = getVisited();
  grid.querySelectorAll('.gate-card').forEach(card=>{
    const id = card.getAttribute('data-gate');
    if(visited.includes(id)) card.classList.add('visited');
  });
}

/* ---------- Math puzzle ---------- */
function initMath(){
  const input = document.getElementById('mathInput');
  if(!input) return;
  const btn = document.getElementById('mathCheck');
  const fb = document.getElementById('mathFeedback');
  const reveal = document.getElementById('mathReveal');
  function check(){
    const val = parseInt(input.value,10);
    if(val === 100){
      fb.textContent = 'Correct — obviously.';
      fb.classList.remove('shake');
      reveal.classList.add('show');
      burstConfettiAt(btn);
    } else if(isNaN(val)){
      fb.textContent = 'Type a number first.';
    } else {
      fb.textContent = 'Not quite — try again.';
      fb.classList.remove('shake'); void fb.offsetWidth; fb.classList.add('shake');
    }
  }
  btn.addEventListener('click', check);
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') check(); });
}

/* ---------- Chessboard + knight's tour ---------- */
function initChess(){
  const board = document.getElementById('board');
  if(!board) return;
  const cells = [];
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const sq = document.createElement('div');
      sq.className = 'sq ' + (((r+c)%2===0) ? 'light':'dark');
      const kn = document.createElement('span');
      kn.className='knight'; kn.textContent='♞';
      sq.appendChild(kn);
      board.appendChild(sq);
      cells.push(sq);
    }
  }
  function idx(r,c){ return r*8+c; }
  const path = [[0,0],[2,1],[0,2],[1,4],[0,6],[2,7],[4,6],[6,7],[7,5],[5,4]];
  const btn = document.getElementById('knightBtn');
  const reveal = document.getElementById('chessReveal');
  let playing = false;

  function run(){
    if(playing) return;
    playing = true;
    cells.forEach(c=>{ c.classList.remove('trail'); const k=c.querySelector('.knight'); k.style.opacity=0; k.style.transform='scale(.4)'; });
    reveal.classList.remove('show');
    let i = 0;
    function step(){
      if(i>0){
        const [pr,pc] = path[i-1];
        cells[idx(pr,pc)].classList.add('trail');
        const pk = cells[idx(pr,pc)].querySelector('.knight');
        pk.style.opacity = 0; pk.style.transform = 'scale(.4)';
      }
      if(i < path.length){
        const [r,c] = path[i];
        const cell = cells[idx(r,c)];
        const kn = cell.querySelector('.knight');
        kn.style.opacity = 1; kn.style.transform = 'scale(1)';
        i++;
        setTimeout(step, 260);
      } else {
        playing = false;
        reveal.classList.add('show');
      }
    }
    step();
  }
  btn.addEventListener('click', run);
  // Auto-play once on arrival for extra motion
  setTimeout(run, REDUCED_MOTION ? 0 : 500);
}

/* ---------- Bracelet + eras cards ---------- */
function initEras(){
  const bracelet = document.getElementById('bracelet');
  if(!bracelet) return;
  const colors = ['#4f7fd4','#f4c95d','#bcdcff','#8fb8ff','#f4c95d','#4f7fd4','#bcdcff'];
  'FRIEND'.split('').forEach((l,i)=>{
    const b = document.createElement('div');
    b.className='bead'; b.style.background = colors[i%colors.length]; b.textContent = l;
    bracelet.appendChild(b);
  });

  const grid = document.getElementById('eraGrid');
  const data = [
    { tag:'Era 00', title:'The Origin Era', photo:'bbypic.jpg', back:"Before the equations and the endgames, this is where it all started. Same sharp eyes, same quiet determination — just a little smaller." },
    { tag:'Era 01', title:'The Math Era', back:"You once explained a proof to me twice and I still didn't get it — and somehow that made me more impressed, not less." },
    { tag:'Era 02', title:'The Chess Era', back:"You think five moves ahead in a game and about three life-decisions ahead of the rest of us. Unreal." },
    { tag:'Era 03', title:'The Swiftie Era', back:"Full setlist memorized, friendship bracelets made, tears cried on cue. A dedicated fan, a devoted friend." },
    { tag:'Era 04', title:'The Aviator Era', back:"Somewhere over the next few years, you're going to be the calmest voice in a cockpit. I already believe it." }
  ];
  data.forEach(d=>{
    const card = document.createElement('div');
    card.className = 'era-card' + (d.photo ? ' has-photo' : '');
    const frontHTML = d.photo
      ? `<div class="era-face era-front era-front-photo">
           <img src="${d.photo}" alt="">
           <div class="era-photo-scrim">
             <div class="era-tag">${d.tag}</div>
             <div class="era-title">${d.title}</div>
           </div>
         </div>`
      : `<div class="era-face era-front">
           <div class="era-tag">${d.tag}</div>
           <div class="era-title">${d.title}</div>
           <div class="era-hint">Tap to open</div>
         </div>`;
    card.innerHTML = `<div class="era-inner">
      ${frontHTML}
      <div class="era-face era-back"><p>${d.back}</p></div>
    </div>`;
    card.addEventListener('click', ()=> card.classList.toggle('flipped'));
    grid.appendChild(card);
  });
}

/* ---------- Finale / cake / confetti ---------- */
function initFinale(){
  const cake = document.getElementById('cakeBtn');
  if(!cake) return;
  const msg = document.getElementById('finaleMsg');
  const photo = document.getElementById('cakePhotoWrap');
  const replay = document.getElementById('replayBtn');
  msg.textContent = CONFIG.finaleMessage;
  function blow(){
    cake.textContent = '🎂';
    msg.classList.add('show');
    replay.style.display = 'inline-flex';
    burstConfettiAt(cake, 150);
    setTimeout(()=> photo && photo.classList.add('show'), 350);
  }
  cake.addEventListener('click', blow);
  cake.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); blow(); } });
  replay.addEventListener('click', ()=>{
    cake.textContent = '🎂🕯️';
    msg.classList.remove('show');
    if(photo) photo.classList.remove('show');
    replay.style.display = 'none';
  });
}

/* ---------- Confetti engine (shared) ---------- */
let confettiCanvas, cctx, particles = [];
function initConfettiCanvas(){
  confettiCanvas = document.getElementById('confetti-canvas');
  if(!confettiCanvas) return;
  cctx = confettiCanvas.getContext('2d');
  function resize(){ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
}
const confettiColors = ['#4f7fd4','#f4c95d','#bcdcff','#f5f7fb'];
function burstConfettiAt(el, count=90){
  if(!cctx || REDUCED_MOTION) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  for(let i=0;i<count;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = 3+Math.random()*7;
    particles.push({
      x:cx, y:cy, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed - 3,
      size:4+Math.random()*5, color:confettiColors[Math.floor(Math.random()*confettiColors.length)],
      rot:Math.random()*360, vr:(Math.random()-.5)*14, life:0, maxLife:70+Math.random()*40
    });
  }
  requestAnimationFrame(tickConfetti);
}
function tickConfetti(){
  cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  particles.forEach(p=>{
    p.vy += 0.16; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
    cctx.save(); cctx.translate(p.x,p.y); cctx.rotate(p.rot*Math.PI/180);
    cctx.globalAlpha = Math.max(0, 1-p.life/p.maxLife);
    cctx.fillStyle = p.color;
    cctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.6);
    cctx.restore();
  });
  particles = particles.filter(p=>p.life < p.maxLife);
  if(particles.length){ requestAnimationFrame(tickConfetti); }
  else{ cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  markVisited(currentPageId());
  initPageTransition();
  initNav();
  initStars();
  initConfettiCanvas();
  initReveal();
  initHeroPlane();
  initBoardingPass();
  initGateGrid();
  initMath();
  initChess();
  initEras();
  initFinale();
});
