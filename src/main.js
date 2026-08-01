// Initialize Lucide Icons
if (window.lucide) {
  window.lucide.createIcons();
}

// ----------------------------------------------------
// 1. STATE & GLOBAL CONFIG
// ----------------------------------------------------
let currentSceneId = 'loading';
const scenes = ['loading', 'welcome', 'problem-solution', 'bento', 'services', 'work', 'impact', 'vision'];
const navLinks = document.querySelectorAll('.nav-link');
const header = document.getElementById('os-header');

// Initialize active nav state helper
function updateNavState(sceneId) {
  navLinks.forEach(link => {
    if (link.getAttribute('data-scene') === sceneId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

window.transitionToScene = function(sceneId) {
  const target = document.getElementById(`scene-${sceneId}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

function setupScrollObserver() {
  const options = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('scene-', '');
        updateNavState(id);
        currentSceneId = id;
      }
    });
  }, options);
  
  const sections = document.querySelectorAll('.scene');
  sections.forEach(s => {
    if (s.id !== 'scene-loading') {
      observer.observe(s);
    }
  });
}

// ----------------------------------------------------
// 2. MOUSE CURSOR GLOW
// ----------------------------------------------------
const cursorGlow = document.getElementById('cursor-glow');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Smoothly follow cursor with interpolation (lerp)
function updateCursor() {
  const dx = mouseX - currentX;
  const dy = mouseY - currentY;
  
  currentX += dx * 0.1;
  currentY += dy * 0.1;
  
  if (cursorGlow) {
    cursorGlow.style.left = `${currentX}px`;
    cursorGlow.style.top = `${currentY}px`;
  }
  
  requestAnimationFrame(updateCursor);
}
requestAnimationFrame(updateCursor);

// ----------------------------------------------------
// 3. CANVAS NEURAL NETWORK
// ----------------------------------------------------
const bgCanvas = document.getElementById('bg-canvas');
const ctx = bgCanvas.getContext('2d');
let particles = [];
const particleCount = 60;
const connectDist = 120;

function resizeCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.x = Math.random() * bgCanvas.width;
    this.y = Math.random() * bgCanvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.radius = Math.random() * 2 + 1;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // Bounds check
    if (this.x < 0 || this.x > bgCanvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > bgCanvas.height) this.vy *= -1;
    
    // Mouse interaction
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      this.x -= dx * 0.02;
      this.y -= dy * 0.02;
    }
  }
  
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    ctx.fillStyle = theme === 'dark' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(109, 74, 255, 0.12)';
    ctx.fill();
  }
}

// Populate particles
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  // Update and draw particles
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  
  // Draw connecting lines
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const lineColor = theme === 'dark' ? '124, 93, 255' : '109, 74, 255';
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < connectDist) {
        const alpha = (1 - dist / connectDist) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${lineColor}, ${alpha * (theme === 'dark' ? 1.0 : 0.4)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
  
  requestAnimationFrame(animateParticles);
}
requestAnimationFrame(animateParticles);

// ----------------------------------------------------
// 4. LOGO PROCESSOR (DYNAMIC BACKGROUND REMOVAL)
// ----------------------------------------------------
function processLogoToTransparent() {
  return new Promise((resolve) => {
    const rawImg = new Image();
    rawImg.src = '/assets/logo.png';
    rawImg.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = rawImg.naturalWidth;
      canvas.height = rawImg.naturalHeight;
      ctx.drawImage(rawImg, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Get background color from top-left pixel (cream off-white)
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      
      // Threshold distance to remove off-white background cleanly
      const threshold = 40;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        );
        
        if (dist < threshold) {
          data[i + 3] = 0; // Make transparent
        } else if (dist < threshold + 15) {
          // Smooth antialiased edges
          const ratio = (dist - threshold) / 15;
          data[i + 3] = Math.floor(ratio * 255);
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      const transparentDataUrl = canvas.toDataURL('image/png');
      
      // Proactively replace all instances on the page
      const logoTargets = document.querySelectorAll('.nav-logo, .loading-logo-img, .welcome-logo-img, .taskbar-logo, .final-logo-img, .vault-item-preview img');
      logoTargets.forEach(el => {
        el.src = transparentDataUrl;
      });
      
      resolve(transparentDataUrl);
    };
    rawImg.onerror = () => {
      console.warn("Logo failed to load locally; resolving immediately.");
      resolve(null);
    };
  });
}

// ----------------------------------------------------
// 5. SCENE 1: INITIALIZATION TIMELINE
// ----------------------------------------------------
function runLoadingTimeline() {
  const tl = gsap.timeline();
  
  const loaderCircle = document.getElementById('loader-circle-fill');
  const percentageTxt = document.getElementById('loader-percentage');
  const statusTxt = document.getElementById('loading-status-text');
  
  const statusMessages = [
    { pct: 0, text: 'Initializing CYL OS' },
    { pct: 25, text: 'Loading AI Studio' },
    { pct: 50, text: 'Connecting Brand Vault' },
    { pct: 75, text: 'Preparing Creative Workspace' },
    { pct: 100, text: 'System ready.' }
  ];
  
  let currentMsgIndex = 0;
  let progressObj = { value: 0 };
  
  // Set initial status text
  statusTxt.textContent = statusMessages[0].text;
  gsap.to(statusTxt, { opacity: 1, y: 0, duration: 0.5 });
  
  // Animate progress values
  tl.to(progressObj, {
    value: 100,
    duration: 4.5,
    ease: 'power2.inOut',
    onUpdate: () => {
      const pct = Math.floor(progressObj.value);
      percentageTxt.textContent = `${pct}%`;
      
      // Update SVG circular border stroke offset
      // Circumference = 2 * PI * r (r=110) = 691.15
      const offset = 691 - (pct / 100) * 691;
      if (loaderCircle) loaderCircle.style.strokeDashoffset = offset;
      
      // Update status logs based on percentage ticks
      if (currentMsgIndex < statusMessages.length - 1 && pct >= statusMessages[currentMsgIndex + 1].pct) {
        currentMsgIndex++;
        const nextText = statusMessages[currentMsgIndex].text;
        
        gsap.to(statusTxt, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          onComplete: () => {
            statusTxt.textContent = nextText;
            gsap.to(statusTxt, { opacity: 1, y: 0, duration: 0.3 });
          }
        });
      }
    }
  });

  // Reveal processed logo inside glass sphere, fade out line-drawing SVG
  tl.to('#loading-logo-img', {
    opacity: 1,
    duration: 1.0,
    ease: 'power2.out'
  }, '-=1.2')
  .to('#loading-logo-svg', {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=1.2');
  
  // Sweep reflection
  tl.to('#loading-light-sweep', {
    duration: 1.5,
    onStart: () => {
      const sweep = document.getElementById('loading-light-sweep');
      if (sweep) sweep.style.animation = 'sweepEffect 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }
  }, '-=0.8');

  // Shrink and expand warp transition portal
  tl.to('.loader-orb-system', {
    scale: 0.9,
    duration: 0.5,
    ease: 'power2.in'
  })
  .to('#scene-loading', {
    onComplete: () => {
      // Fade out loading screen overlay
      const loadingScreen = document.getElementById('scene-loading');
      if (loadingScreen) loadingScreen.classList.add('hidden');
      
      // Enable body scroll
      document.body.classList.add('loaded');
      
      // Reveal navbar
      header.classList.add('visible');
      
      // Text reveal animations for Welcome
      gsap.to('.welcome-headline', { y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 });
      gsap.to('.welcome-sub-headline', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.5 });
      gsap.to('.welcome-description', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.7 });
      gsap.to('.cta-group', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.9 });
      
      // Load interactive tools
      initializeBentoWorkspace();
      initializeServicesDeck();
      initializeMapGlobe();
      setupScrollObserver();
    }
  });
}

// Theme Toggle Logic
function initializeThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;
  
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    
    // Update Lucide icon highlights in navbar
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}

// Start Loading and processing immediately on DOM load
window.addEventListener('DOMContentLoaded', async () => {
  initializeThemeToggle();
  await processLogoToTransparent();
  runLoadingTimeline();
});

// ----------------------------------------------------
// 5. SCENE 3: BENTO GRID INTERACTIVE OS
// ----------------------------------------------------
function initializeBentoWorkspace() {
  // Clock widget
  setInterval(() => {
    const clock = document.getElementById('os-clock');
    if (clock) {
      const now = new Date();
      clock.textContent = now.toTimeString().split(' ')[0];
    }
  }, 1000);
  
  // Flat sheen hover mouse tracking (no 3D tilt)
  const bentoCards = document.querySelectorAll('.bento-card, .service-card, .portfolio-card');
  bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Sheen tracking
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });
  });
  
  // Loop Creative Automation flow pulses automatically
  let nodeIndex = 0;
  const flowNodes = ['node-idea', 'node-ai', 'node-system', 'node-growth'];
  const connectors = document.querySelectorAll('.automation-flow .flow-connector');
  
  setInterval(() => {
    // Reset all nodes
    flowNodes.forEach(id => {
      document.getElementById(id).classList.remove('active');
    });
    connectors.forEach(c => c.classList.remove('active'));
    
    // Activate current node and next connector
    const currentNode = document.getElementById(flowNodes[nodeIndex]);
    if (currentNode) currentNode.classList.add('active');
    
    if (nodeIndex > 0 && connectors[nodeIndex - 1]) {
      connectors[nodeIndex - 1].classList.add('active');
    }
    
    nodeIndex = (nodeIndex + 1) % flowNodes.length;
  }, 2000);
}

// AI Studio Simulator
window.runAISimulation = function() {
  const goal = document.getElementById('studio-goal-select').value;
  const prompt = document.getElementById('studio-prompt').value || 'Premium corporate system';
  const placeholder = document.getElementById('studio-placeholder');
  const output = document.getElementById('studio-output');
  const previewGlow = document.getElementById('preview-glow-shape');
  const ratioMeta = document.getElementById('meta-ratio');
  
  // Show Loading inside preview
  placeholder.innerHTML = `<i data-lucide="loader" class="animate-spin" style="width: 40px; height: 40px; color: var(--glow-lavender);"></i><span>COMPILING BRAND NEURAL MODEL...</span>`;
  if (window.lucide) window.lucide.createIcons();
  
  output.classList.remove('active');
  
  setTimeout(() => {
    placeholder.style.display = 'none';
    output.classList.add('active');
    
    // Vary results based on selected goal
    if (goal === 'logo') {
      previewGlow.style.borderRadius = '50%';
      previewGlow.style.background = 'conic-gradient(from 0deg, var(--primary-purple), var(--glow-lavender), var(--primary-purple))';
      ratioMeta.textContent = '1:1 Vector SVG';
    } else if (goal === 'guidelines') {
      previewGlow.style.borderRadius = '8px';
      previewGlow.style.background = 'linear-gradient(135deg, var(--glow-lavender) 0%, var(--primary-purple) 100%)';
      ratioMeta.textContent = 'Grid System Specs';
    } else {
      previewGlow.style.borderRadius = '30% 70% 70% 30% / 30% 30% 70% 70%';
      previewGlow.style.background = 'radial-gradient(circle, var(--glow-lavender) 0%, var(--primary-purple) 100%)';
      ratioMeta.textContent = 'HSL Custom Hex';
    }
  }, 2200);
};

// Brand Vault Tab Switcher
window.switchVaultTab = function(tabName) {
  // Tabs
  const tabs = document.querySelectorAll('.vault-tab');
  tabs.forEach(tab => {
    if (tab.textContent.toLowerCase() === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Content Panes
  const panes = document.querySelectorAll('.vault-content-pane');
  panes.forEach(pane => {
    if (pane.id === `vault-${tabName}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
};

// ----------------------------------------------------
// 6. SCENE 4: SERVICE DECK PROGRAMMATIC GENERATION
// ----------------------------------------------------
const servicesData = [
  { name: 'Brand Identity Design', category: 'branding', icon: 'award', desc: 'Crafting premium corporate guidelines, styles, and typography systems.' },
  { name: 'Logo Design', category: 'branding', icon: 'fingerprint', desc: 'Signature high-readability vector logomarks matching original vectors.' },
  { name: 'Graphic Design', category: 'automation', icon: 'pen-tool', desc: 'Standard production vector formats and visual communication materials.' },
  { name: 'Social Media Design', category: 'automation', icon: 'share-2', desc: 'Dynamic template layouts optimized for modern feed interactions.' },
  { name: 'Poster & Banner Design', category: 'automation', icon: 'image', desc: 'Large advertising banners balancing typographic hierarchy and image weight.' },
  { name: 'Packaging Design', category: 'automation', icon: 'box', desc: 'Sensory product packaging specifications and folding templates.' },
  { name: 'Business Card Design', category: 'automation', icon: 'credit-card', desc: 'Tactile print cards integrating modern layouts and luxury finishes.' },
  { name: 'UI/UX Design', category: 'uiux', icon: 'layout', desc: 'Designing seamless wireframes and interactive screens focusing on user flow.' },
  { name: 'Website Design', category: 'uiux', icon: 'monitor', desc: 'Stunning interactive responsive websites with premium glassmorphism.' },
  { name: 'Mobile App Design', category: 'uiux', icon: 'smartphone', desc: 'Native app mockups and screens optimized for thumb reach and accessibility.' },
  { name: 'SaaS Dashboard Design', category: 'uiux', icon: 'gauge', desc: 'Complex enterprise dashboard visualization and workflow interfaces.' },
  { name: 'Pitch Deck Design', category: 'strategy', icon: 'rocket', desc: 'High-impact pitch presentations designed to win capital investments.' },
  { name: 'Brand Strategy', category: 'branding', icon: 'compass', desc: 'Competitive mapping, positioning workshops, and tone design.' },
  { name: 'Digital Marketing Creatives', category: 'strategy', icon: 'megaphone', desc: 'Performance marketing templates and dynamic layouts.' },
  { name: 'Product Mockups', category: 'uiux', icon: 'package', desc: 'High-fidelity 3D device visuals and package wrapping mockups.' },
  { name: 'AI-Assisted Creative Services', category: 'branding', icon: 'cpu', desc: 'Utilizing custom diffusion and neural networks for creative brainstorming.' },
  { name: 'Digital Identity Development', category: 'branding', icon: 'globe', desc: 'Unifying your complete brand presence and IP across web channels.' },
  { name: 'Creative Consulting', category: 'branding', icon: 'help-circle', desc: 'Expert consultation sessions to align design sprints and brand architecture.' }
];

function initializeServicesDeck() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  
  servicesData.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = `service-card glass-panel`;
    card.setAttribute('data-cat', s.category);
    
    card.innerHTML = `
      <div class="service-card-glow"></div>
      <div class="service-card-icon">
        <i data-lucide="${s.icon}"></i>
      </div>
      <div class="service-card-content">
        <h3 class="service-card-title">${s.name}</h3>
        <p class="service-card-desc">${s.desc}</p>
      </div>
      <div class="service-card-graphic">
        <i data-lucide="${s.icon}" style="width: 60px; height: 60px;"></i>
      </div>
    `;
    
    // Flat sheen hover mouse tracking (no 3D tilt)
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });
    
    grid.appendChild(card);
  });
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
  
  // Filter Tabs Event Listeners
  const filterBtns = document.querySelectorAll('.services-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const cat = btn.getAttribute('data-category');
      const cards = document.querySelectorAll('.service-card');
      
      cards.forEach(c => {
        const itemCat = c.getAttribute('data-cat');
        if (cat === 'all' || itemCat === cat) {
          c.classList.remove('hidden');
          gsap.fromTo(c, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 });
        } else {
          c.classList.add('hidden');
        }
      });
    });
  });
}

// ----------------------------------------------------
// 7. SCENE 6: PHILOSOPHY PIPELINE TIMELINE
// ----------------------------------------------------
function animatePhilosophyPipeline() {
  const steps = document.querySelectorAll('.pipeline-step');
  const progressLine = document.getElementById('pipeline-progress');
  
  let currentStep = 0;
  
  const interval = setInterval(() => {
    if (currentSceneId !== 'why') {
      clearInterval(interval);
      return;
    }
    
    steps.forEach((s, idx) => {
      if (idx <= currentStep) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
    
    const percentage = (currentStep / (steps.length - 1)) * 90;
    if (progressLine) progressLine.style.width = `${percentage}%`;
    
    currentStep = (currentStep + 1) % steps.length;
  }, 2200);
}

// ----------------------------------------------------
// 8. SCENE 7: WORLD MAP GLOBE
// ----------------------------------------------------
function initializeMapGlobe() {
  const mapCanvas = document.getElementById('map-canvas');
  if (!mapCanvas) return;
  
  const mctx = mapCanvas.getContext('2d');
  let mapParticles = [];
  
  function resizeMapCanvas() {
    mapCanvas.width = mapCanvas.parentElement.clientWidth;
    mapCanvas.height = mapCanvas.parentElement.clientHeight;
  }
  resizeMapCanvas();
  window.addEventListener('resize', resizeMapCanvas);
  
  // Generate stylized coordinate dots representing a global map
  const columns = 24;
  const rows = 14;
  
  // Focal hubs to pulse
  const hubs = [
    { x: 0.2, y: 0.35, size: 4, pulseRadius: 0 }, // SF
    { x: 0.5, y: 0.3, size: 4, pulseRadius: 0 },  // London
    { x: 0.7, y: 0.45, size: 4, pulseRadius: 0 }, // India
    { x: 0.82, y: 0.35, size: 4, pulseRadius: 0 } // Tokyo
  ];
  
  function drawMap() {
    mctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    
    const colWidth = mapCanvas.width / columns;
    const rowHeight = mapCanvas.height / rows;
    
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const dotColor = theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(109, 74, 255, 0.08)';
    const hubColor = theme === 'dark' ? 'rgb(192, 132, 252)' : 'rgb(109, 74, 255)';
    const pulseColor = theme === 'dark' ? '192, 132, 252' : '109, 74, 255';
    
    // Draw grid of dots
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        // Skip dots to shape it roughly like a world map outline
        if ((r === 0 && (c < 4 || c > 20)) ||
            (r === rows - 1 && (c < 10 || c > 14)) ||
            (c === 0 || c === columns - 1)) {
          continue;
        }
        
        const x = c * colWidth + colWidth / 2;
        const y = r * rowHeight + rowHeight / 2;
        
        mctx.beginPath();
        mctx.arc(x, y, 1.5, 0, Math.PI * 2);
        mctx.fillStyle = dotColor;
        mctx.fill();
      }
    }
    
    // Draw pulsing hub centers
    hubs.forEach(h => {
      const hx = h.x * mapCanvas.width;
      const hy = h.y * mapCanvas.height;
      
      // Draw hub center node
      mctx.beginPath();
      mctx.arc(hx, hy, h.size, 0, Math.PI * 2);
      mctx.fillStyle = hubColor;
      mctx.fill();
      
      // Draw pulse ripple ring
      h.pulseRadius += 0.5;
      if (h.pulseRadius > 35) h.pulseRadius = 0;
      
      mctx.beginPath();
      mctx.arc(hx, hy, h.pulseRadius, 0, Math.PI * 2);
      mctx.strokeStyle = `rgba(${pulseColor}, ${(1 - h.pulseRadius / 35) * (theme === 'dark' ? 0.6 : 0.3)})`;
      mctx.lineWidth = 1;
      mctx.stroke();
    });
    
    requestAnimationFrame(drawMap);
  }
  
  drawMap();
}

// Native scrolling enabled. Scrolling navigation handled via CSS smooth scrolling.
