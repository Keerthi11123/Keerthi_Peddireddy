const state = { data: null, route: 'home' };

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

async function load() {
  const res = await fetch('data.json');
  state.data = await res.json();
  initHeader();
  routeFromHash();
  bindNav();
  $('#year').textContent = new Date().getFullYear();

  // Theme
  const saved = localStorage.getItem('theme') || 'dark';
  setTheme(saved);
  $('#themeToggle').checked = saved === 'light';
  $('#themeToggle').addEventListener('change', e => setTheme(e.target.checked ? 'light' : 'dark'));
}

function setTheme(mode){
  if(mode === 'light'){ document.documentElement.classList.add('light'); }
  else{ document.documentElement.classList.remove('light'); }
  localStorage.setItem('theme', mode);
}

function initHeader(){
  $('#name').textContent = state.data.name;
  $('#title').textContent = state.data.title;
  const wrap = $('#concepts'); wrap.innerHTML = '';
  state.data.concepts.slice(0, 8).forEach(c => {
    const x = document.createElement('span');
    x.className = 'chip';
    x.textContent = c;
    wrap.appendChild(x);
  });
}

function bindNav(){
  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
    window.location.hash = btn.dataset.route;
  }));
  window.addEventListener('hashchange', routeFromHash);
}

function routeFromHash(){
  const hash = window.location.hash.replace('#', '') || 'home';
  state.route = hash;
  render();
}

function section(title){
  const sec = document.createElement('section');
  sec.className = 'glass section';
  const h2 = document.createElement('h2');
  h2.textContent = title;
  sec.appendChild(h2);
  return sec;
}

function render(){
  const view = $('#view');
  view.innerHTML = '';

  if(state.route === 'home'){
    const sec = section('About');
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = state.data.summary;
    sec.appendChild(p);

    // Quick Links
    const links = document.createElement('div');
    links.className = 'grid';
    const profiles = state.data.profiles || {};
    const linkCards = [
      {label:'GitHub', href: profiles.github},
      {label:'LinkedIn', href: profiles.linkedin},
      {label:'Email', href: `mailto:${state.data.email}`},
      {label:'Phone', href: `tel:${state.data.phone}`}
    ];
    linkCards.forEach(({label, href}) => {
      const c = document.createElement('div');
      c.className = 'card row';
      const a = document.createElement('a');
      a.textContent = label;
      a.href = href || '#';
      if(!href) a.classList.add('muted');
      c.appendChild(a);
      sec.appendChild(c);
    });

    view.appendChild(sec);

    // Spotlight
    const spot = section('Spotlight Projects');
    const grid = document.createElement('div'); grid.className='grid';
    state.data.projects.slice(0,3).forEach(pr => grid.appendChild(projectCard(pr)));
    spot.appendChild(grid);
    view.appendChild(spot);
  }

  if(state.route === 'experience'){
    const sec = section('Experience');
    state.data.experience.forEach(exp => {
      const card = document.createElement('div'); card.className='card';
      const head = document.createElement('div'); head.className='row';
      const t = document.createElement('div'); t.innerHTML = `<strong>${exp.role}</strong> • ${exp.company}`;
      const p = document.createElement('span'); p.className='badge muted'; p.textContent = exp.period;
      head.appendChild(t); head.appendChild(p);
      card.appendChild(head);
      const ul = document.createElement('ul');
      exp.bullets.forEach(b => { const li = document.createElement('li'); li.textContent = b; ul.appendChild(li); });
      card.appendChild(ul);
      sec.appendChild(card);
    });
    view.appendChild(sec);
  }

  if(state.route === 'projects'){
    const sec = section('Projects');
    const grid = document.createElement('div'); grid.className='grid';
    state.data.projects.forEach(pr => grid.appendChild(projectCard(pr)));
    sec.appendChild(grid);
    view.appendChild(sec);
  }

  if(state.route === 'skills'){
    const sec = section('Skills');
    // Bars
    state.data.skills.forEach(s => {
      const row = document.createElement('div'); row.className='card';
      row.innerHTML = `<div class="row"><strong>${s.name}</strong><span class="muted">${s.level}%</span></div>
        <div class="progress"><span style="width:${s.level}%"></span></div>`;
      sec.appendChild(row);
    });

    // Radar
    const radar = document.createElement('div'); radar.className='card';
    const c = document.createElement('canvas'); c.height=360; c.id='radar';
    radar.appendChild(c);
    sec.appendChild(radar);
    view.appendChild(sec);
    drawRadar();
  }

  if(state.route === 'education'){
    const e = state.data.education;
    const sec = section('Education');
    const kv = document.createElement('div'); kv.className='kv card';
    kv.innerHTML = `<div>School</div><div><strong>${e.school}</strong></div>
                    <div>Degree</div><div>${e.degree} (GPA ${e.gpa})</div>
                    <div>Period</div><div>${e.period}</div>
                    <div>Key Courses</div><div>${e.courses.join(', ')}</div>`;
    sec.appendChild(kv);
    view.appendChild(sec);
  }

  if(state.route === 'contact'){
    const sec = section('Contact');
    const grid = document.createElement('div'); grid.className='grid';
    grid.appendChild(infoCard('Email', state.data.email, `mailto:${state.data.email}`));
    grid.appendChild(infoCard('Phone', state.data.phone, `tel:${state.data.phone}`));
    if(state.data.profiles.github) grid.appendChild(infoCard('GitHub', state.data.profiles.github, state.data.profiles.github));
    if(state.data.profiles.linkedin) grid.appendChild(infoCard('LinkedIn', state.data.profiles.linkedin, state.data.profiles.linkedin));
    sec.appendChild(grid);
    view.appendChild(sec);
  }
}

function projectCard(pr){
  const c = document.createElement('div'); c.className='card';
  const h = document.createElement('div'); h.className='row';
  h.innerHTML = `<strong>${pr.name}</strong><span class="badge">${pr.tag}</span>`;
  const p = document.createElement('p'); p.className='muted'; p.textContent = pr.desc;
  c.appendChild(h); c.appendChild(p);
  const btn = document.createElement('a'); btn.className='btn'; btn.textContent = pr.repo ? 'View Repository' : 'Repository Coming Soon';
  btn.href = pr.repo || '#'; btn.target = pr.repo ? '_blank' : '_self';
  c.appendChild(btn);
  return c;
}

function infoCard(label, value, href){
  const c = document.createElement('div'); c.className='card row';
  const a = document.createElement('a'); a.href = href; a.textContent = `${label}: ${value}`;
  c.appendChild(a);
  return c;
}

// Simple radar chart with vanilla canvas
function drawRadar(){
  const canvas = $('#radar'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const skills = state.data.skills.slice(0, 8);
  const N = skills.length;
  const cx = canvas.width/2, cy = canvas.height/2, R = Math.min(cx, cy) - 20;

  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // grid rings
  ctx.globalAlpha = .4;
  for(let r=0.2; r<=1.0; r+=0.2){
    ctx.beginPath();
    for(let i=0;i<N;i++){
      const a = (Math.PI*2*i)/N - Math.PI/2;
      const x = cx + Math.cos(a)*R*r;
      const y = cy + Math.sin(a)*R*r;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#7c86a8';
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // polygon
  ctx.beginPath();
  skills.forEach((s,i)=>{
    const a = (Math.PI*2*i)/N - Math.PI/2;
    const x = cx + Math.cos(a)*R*(s.level/100);
    const y = cy + Math.sin(a)*R*(s.level/100);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.closePath();
  const grd = ctx.createLinearGradient(0,0,canvas.width,0);
  grd.addColorStop(0,'#60a5fa'); grd.addColorStop(1,'#86efac');
  ctx.fillStyle = grd; ctx.globalAlpha = .25; ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2; ctx.stroke();

  // labels
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--txt') || '#e6e8ef';
  ctx.font = '12px Inter';
  skills.forEach((s,i)=>{
    const a = (Math.PI*2*i)/N - Math.PI/2;
    const x = cx + Math.cos(a)*(R+12);
    const y = cy + Math.sin(a)*(R+12);
    ctx.textAlign = Math.cos(a)>0.1 ? 'left' : (Math.cos(a)<-0.1 ? 'right' : 'center');
    ctx.textBaseline = Math.sin(a)>0.1 ? 'top' : (Math.sin(a)<-0.1 ? 'bottom' : 'middle');
    ctx.fillText(s.name, x, y);
  });
}

load();
