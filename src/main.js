// CYL OS — Antigravity Workspace Controller

// Initialize Lucide Icons
if (window.lucide) {
  window.lucide.createIcons();
}

// ----------------------------------------------------
// 1. STARFIELD & PARTICLE SYSTEM
// ----------------------------------------------------
const starCanvas = document.getElementById('starfield-canvas');
const sctx = starCanvas.getContext('2d');

let stars = [];
const starCount = 150;
let gravityValue = 1.0; // 0.0 (Zero-G) to 1.0 (Earth gravity)

function resizeStarCanvas() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}
resizeStarCanvas();
window.addEventListener('resize', resizeStarCanvas);

class Star {
  constructor() {
    this.reset();
    this.z = Math.random() * starCanvas.width;
  }
  
  reset() {
    this.x = (Math.random() - 0.5) * starCanvas.width;
    this.y = (Math.random() - 0.5) * starCanvas.height;
    this.z = starCanvas.width;
    this.px = 0;
    this.py = 0;
    this.color = `rgba(${130 + Math.random() * 50}, ${110 + Math.random() * 50}, 255, ${0.4 + Math.random() * 0.6})`;
  }
  
  update() {
    // Warp speed increases when gravity decreases (zero-g mode warping)
    const speed = (2 - gravityValue) * 1.5;
    this.z -= speed;
    
    if (this.z <= 0) {
      this.reset();
    }
  }
  
  draw() {
    const cx = starCanvas.width / 2;
    const cy = starCanvas.height / 2;
    
    // Project 3D coordinates to 2D
    const sx = (this.x / this.z) * cx + cx;
    const sy = (this.y / this.z) * cy + cy;
    
    if (sx < 0 || sx > starCanvas.width || sy < 0 || sy > starCanvas.height) {
      return;
    }
    
    // Draw star with tail
    const r = (1 - this.z / starCanvas.width) * 2;
    sctx.beginPath();
    sctx.arc(sx, sy, r, 0, Math.PI * 2);
    sctx.fillStyle = this.color;
    sctx.fill();
    
    if (this.px !== 0 && gravityValue < 0.8) {
      sctx.beginPath();
      sctx.moveTo(sx, sy);
      sctx.lineTo(this.px, this.py);
      sctx.strokeStyle = `rgba(124, 93, 255, ${(1 - this.z / starCanvas.width) * 0.15})`;
      sctx.lineWidth = r / 2;
      sctx.stroke();
    }
    
    this.px = sx;
    this.py = sy;
  }
}

// Populate stars
for (let i = 0; i < starCount; i++) {
  stars.push(new Star());
}

function animateStars() {
  sctx.fillStyle = 'rgba(3, 3, 6, 0.2)'; // trail effect
  sctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
  
  stars.forEach(s => {
    s.update();
    s.draw();
  });
  
  requestAnimationFrame(animateStars);
}
requestAnimationFrame(animateStars);

// ----------------------------------------------------
// 2. ANTIGRAVITY ENGINE: INTERACTIVE COCKPIT FLOATING
// ----------------------------------------------------
let time = 0;
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
  mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
});

function applyZeroGPhysics() {
  time += 0.015;
  const drift = (1 - gravityValue);
  
  // Apply gravity drift to ALL glass panels on the page
  const panels = document.querySelectorAll('.glass-panel');
  panels.forEach((panel, idx) => {
    if (drift === 0) {
      panel.style.transform = 'none';
      return;
    }
    
    const ampX = (12 + idx * 3) * drift;
    const ampY = (16 + idx * 4) * drift;
    const rotAmp = (1.5 + idx * 0.3) * drift;
    
    const x = Math.sin(time + idx * 1.2) * ampX + (mouseX * -15 * drift);
    const y = Math.cos(time * 0.8 + idx * 1.8) * ampY + (mouseY * -20 * drift);
    const rot = Math.sin(time * 0.4 + idx) * rotAmp;
    
    panel.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
  });
  
  requestAnimationFrame(applyZeroGPhysics);
}
requestAnimationFrame(applyZeroGPhysics);

// Gravity Slider controls
const gravitySlider = document.getElementById('gravity-slider-input');
const gravityValLabel = document.getElementById('gravity-slider-val');

if (gravitySlider) {
  gravitySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    gravityValLabel.textContent = `${val}%`;
    gravityValue = val / 100;
  });
}

// ----------------------------------------------------
// 3. TRANSPARENT LOGO PROCESSOR (CANVAS CLEANER)
// ----------------------------------------------------
async function processLogoToTransparent() {
  const images = ['loading-logo-img', 'nav-logo-img', 'hero-logo-img', 'vault-primary-logo', 'vault-inverse-logo'];
  
  images.forEach(imgId => {
    const imgEl = document.getElementById(imgId);
    if (!imgEl) return;
    
    const process = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imgEl.naturalWidth || imgEl.width;
        canvas.height = imgEl.naturalHeight || imgEl.height;
        
        if (canvas.width === 0 || canvas.height === 0) return;
        
        ctx.drawImage(imgEl, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Loop pixels: find cream background and clean it
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          if (r > 235 && g > 235 && b > 225) {
            data[i+3] = 0; // Set fully transparent
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        imgEl.src = canvas.toDataURL();
      } catch (err) {
        console.warn('Logo transparent processing skipped (cross-origin or load timing)', err);
      }
    };
    
    if (imgEl.complete) {
      process();
    } else {
      imgEl.addEventListener('load', process);
    }
  });
}

// ----------------------------------------------------
// 4. GENERATING SERVICES CARDS
// ----------------------------------------------------
const servicesData = [
  { name: 'AI Brand Generation', icon: 'cpu', desc: 'Instantly generate vector art, dynamic logs, and palette structures.' },
  { name: 'Corporate UI/UX Design', icon: 'layout', desc: 'Sleek responsive web layouts integrating premium glassmorphic backings.' },
  { name: 'Creative Pipelines', icon: 'refresh-cw', desc: 'Automate repetitive collateral exports, templates, and social maps.' },
  { name: 'Air-Gap Security Checks', icon: 'shield', desc: 'Static code auditing preventing dependency violations in CI/CD.' }
];

function initializeServicesGrid() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  
  servicesData.forEach((s) => {
    const card = document.createElement('div');
    card.className = 'service-card glass-panel';
    card.innerHTML = `
      <div class="card-sheen"></div>
      <div class="service-icon">
        <i data-lucide="${s.icon}"></i>
      </div>
      <div>
        <h3 class="service-title">${s.name}</h3>
        <p class="service-desc">${s.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Wire mouse movement sheen tracking on all glass panels
function setupSheenTracking() {
  document.body.addEventListener('mousemove', (e) => {
    const target = e.target.closest('.glass-panel');
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    target.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    target.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  });
}

// ----------------------------------------------------
// 5. QUANTUM CORE LOADING OVERLAY TIMER
// ----------------------------------------------------
function runLoadingTimeline() {
  const timeline = gsap.timeline();
  
  const loadingStatusTexts = [
    'Booting Virtual OS Kernel...',
    'Loading starfield space warp mechanics...',
    'Stabilizing quantum memory matrix...',
    'Cockpit online. Decoupling G-forces...'
  ];
  
  let percentageObj = { value: 0 };
  
  timeline.to(percentageObj, {
    value: 100,
    duration: 3.0,
    ease: 'power1.inOut',
    onUpdate: () => {
      const pct = Math.floor(percentageObj.value);
      const label = document.getElementById('loader-percentage');
      if (label) label.textContent = `${pct}%`;
      
      const textIndex = Math.floor((pct / 100) * (loadingStatusTexts.length - 1));
      const statusText = document.getElementById('loading-status-text');
      if (statusText) {
        const currentMilestone = loadingStatusTexts[textIndex];
        const lastEntry = statusText.lastElementChild;
        if (!lastEntry || lastEntry.textContent.indexOf(currentMilestone) === -1) {
          const entry = document.createElement('div');
          entry.className = 'log-entry info';
          entry.textContent = `[SYS] ${currentMilestone}`;
          statusText.appendChild(entry);
          statusText.scrollTop = statusText.scrollHeight;
        }
      }
    }
  });
  
  // Hide loading screen and reveal cockpit
  timeline.to('#scene-loading', {
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => {
      const loadingScreen = document.getElementById('scene-loading');
      if (loadingScreen) loadingScreen.classList.add('hidden');
      document.body.classList.add('loaded');
      
      // Reveal navbar and gravity controls
      const header = document.getElementById('os-header');
      const gravityCtrl = document.getElementById('gravity-controller');
      if (header) header.classList.add('visible');
      if (gravityCtrl) gravityCtrl.classList.add('visible');
      
      // Text reveals
      gsap.from('.welcome-headline', { opacity: 0, y: 30, duration: 1.0, ease: 'power3.out' });
      gsap.from('.welcome-sub-headline', { opacity: 0, y: 20, duration: 1.0, ease: 'power3.out', delay: 0.2 });
      gsap.from('.cta-group', { opacity: 0, y: 15, duration: 1.0, ease: 'power3.out', delay: 0.4 });
      
      // Initialize subcomponents
      initializeServicesGrid();
      setupSheenTracking();
      initializeMapGlobe();
      setupScrollObserver();
    }
  });
}

// ----------------------------------------------------
// 6. SCROLL OBSERVER (NAVBAR ACTIVE LINK HIGHLIGHT)
// ----------------------------------------------------
function setupScrollObserver() {
  const sections = document.querySelectorAll('section.scene');
  const navItems = document.querySelectorAll('.nav-links .nav-link');
  
  const options = {
    root: null,
    threshold: 0.25, // highlight when 25% on screen
    rootMargin: '-50px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id').replace('scene-', '');
        
        navItems.forEach(item => {
          if (item.getAttribute('data-scene') === id) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, options);
  
  sections.forEach(s => observer.observe(s));
}

// Start Loading and processing immediately on DOM load
window.addEventListener('DOMContentLoaded', async () => {
  await processLogoToTransparent();
  runLoadingTimeline();
});

// ----------------------------------------------------
// 7. HOLOGRAPHIC MAP GLOBE RENDERER
// ----------------------------------------------------
function initializeMapGlobe() {
  const mapCanvas = document.getElementById('map-canvas');
  if (!mapCanvas) return;
  
  const mctx = mapCanvas.getContext('2d');
  
  function resizeMapCanvas() {
    mapCanvas.width = mapCanvas.parentElement.clientWidth;
    mapCanvas.height = mapCanvas.parentElement.clientHeight;
  }
  resizeMapCanvas();
  
  const columns = 20;
  const rows = 10;
  
  const hubs = [
    { x: 0.2, y: 0.35, size: 3, pulseRadius: 0 }, // SF
    { x: 0.5, y: 0.3, size: 3, pulseRadius: 0 },  // London
    { x: 0.7, y: 0.45, size: 3, pulseRadius: 0 }, // India
    { x: 0.82, y: 0.35, size: 3, pulseRadius: 0 } // Tokyo
  ];
  
  let animationFrameId;
  
  function drawMap() {
    mctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    
    const colWidth = mapCanvas.width / columns;
    const rowHeight = mapCanvas.height / rows;
    
    // Draw grid of dots
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        if ((r === 0 && (c < 3 || c > 17)) ||
            (r === rows - 1 && (c < 8 || c > 12)) ||
            (c === 0 || c === columns - 1)) {
          continue;
        }
        
        const x = c * colWidth + colWidth / 2;
        const y = r * rowHeight + rowHeight / 2;
        
        mctx.beginPath();
        mctx.arc(x, y, 1.2, 0, Math.PI * 2);
        mctx.fillStyle = 'rgba(124, 93, 255, 0.12)';
        mctx.fill();
      }
    }
    
    // Draw pulsing hub centers
    hubs.forEach(h => {
      const hx = h.x * mapCanvas.width;
      const hy = h.y * mapCanvas.height;
      
      mctx.beginPath();
      mctx.arc(hx, hy, h.size, 0, Math.PI * 2);
      mctx.fillStyle = 'rgb(124, 93, 255)';
      mctx.fill();
      
      h.pulseRadius += 0.4;
      if (h.pulseRadius > 25) h.pulseRadius = 0;
      
      mctx.beginPath();
      mctx.arc(hx, hy, h.pulseRadius, 0, Math.PI * 2);
      mctx.strokeStyle = `rgba(124, 93, 255, ${1 - h.pulseRadius / 25})`;
      mctx.lineWidth = 1;
      mctx.stroke();
    });
    
    animationFrameId = requestAnimationFrame(drawMap);
  }
  
  drawMap();
}
