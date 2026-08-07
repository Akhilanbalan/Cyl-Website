// CYL OS — Antigravity Showcase Controller
window.addEventListener('error', (e) => {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.width = '100%';
  errDiv.style.background = 'red';
  errDiv.style.color = 'white';
  errDiv.style.padding = '20px';
  errDiv.style.zIndex = '99999';
  errDiv.style.fontFamily = 'monospace';
  errDiv.style.fontSize = '12px';
  errDiv.style.wordBreak = 'break-all';
  errDiv.innerHTML = `<strong>GLOBAL ERROR:</strong> ${e.message}<br>File: ${e.filename}:${e.lineno}:${e.colno}<br>Stack: ${e.error ? e.error.stack : ''}`;
  document.body.appendChild(errDiv);
});

import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';

// Initialize Lucide Icons
if (window.lucide) {
  window.lucide.createIcons();
}

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// 1. STATE & GLOBAL CONFIG
// ----------------------------------------------------
let gravityValue = 1.0; // 0.0 (Zero-G) to 1.0 (Earth gravity)
let time = 0;
let mouseX = 0;
let mouseY = 0;

// Track window mouse coords
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ----------------------------------------------------
// 2. STARFIELD & PARTICLE SYSTEM
// ----------------------------------------------------
const starCanvas = document.getElementById('starfield-canvas');
const sctx = starCanvas.getContext('2d');

let stars = [];
const starCount = 120;

function resizeStarCanvas() {
  if (starCanvas) {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
  }
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
    this.color = `rgba(${140 + Math.random() * 40}, ${120 + Math.random() * 40}, 255, ${0.3 + Math.random() * 0.7})`;
  }
  
  update() {
    const speed = (2 - gravityValue) * 1.2;
    this.z -= speed;
    if (this.z <= 0) {
      this.reset();
    }
  }
  
  draw() {
    const cx = starCanvas.width / 2;
    const cy = starCanvas.height / 2;
    
    const sx = (this.x / this.z) * cx + cx;
    const sy = (this.y / this.z) * cy + cy;
    
    if (sx < 0 || sx > starCanvas.width || sy < 0 || sy > starCanvas.height) {
      return;
    }
    
    const r = (1 - this.z / starCanvas.width) * 2;
    sctx.beginPath();
    sctx.arc(sx, sy, r, 0, Math.PI * 2);
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    sctx.fillStyle = theme === 'dark' ? this.color : `rgba(139, 92, 246, ${0.2 + (1 - this.z / starCanvas.width) * 0.4})`;
    sctx.fill();
    
    if (this.px !== 0 && gravityValue < 0.8) {
      sctx.beginPath();
      sctx.moveTo(sx, sy);
      sctx.lineTo(this.px, this.py);
      sctx.strokeStyle = theme === 'dark' ? `rgba(139, 92, 246, ${(1 - this.z / starCanvas.width) * 0.12})` : `rgba(139, 92, 246, ${(1 - this.z / starCanvas.width) * 0.06})`;
      sctx.lineWidth = r / 2;
      sctx.stroke();
    }
    
    this.px = sx;
    this.py = sy;
  }
}

// Populate stars
if (starCanvas) {
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }
}

function animateStars() {
  if (!starCanvas) return;
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  sctx.fillStyle = theme === 'dark' ? 'rgba(9, 9, 11, 0.2)' : 'rgba(248, 249, 251, 0.2)';
  sctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
  
  stars.forEach(s => {
    s.update();
    s.draw();
  });
  
  requestAnimationFrame(animateStars);
}
requestAnimationFrame(animateStars);

// ----------------------------------------------------
// 3. PREMIUM CUSTOM CURSOR & CLICK RIPPLES
// ----------------------------------------------------
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let dotX = 0, dotY = 0;
let ringX = 0, ringY = 0;

function updateCursor() {
  if (cursorDot && cursorRing) {
    // Lag effects
    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    
    cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  }
  requestAnimationFrame(updateCursor);
}
requestAnimationFrame(updateCursor);

// Ring hover class triggers
function initCursorInteractions() {
  const hoverables = document.querySelectorAll('a, button, select, textarea, input, .form-option-card, .vault-tab, .slider-btn, .folder-header, .tree-file');
  hoverables.forEach(item => {
    item.addEventListener('mouseenter', () => {
      if (cursorRing) cursorRing.classList.add('active');
    });
    item.addEventListener('mouseleave', () => {
      if (cursorRing) cursorRing.classList.remove('active');
    });
  });
}

// Click ripple animations
window.addEventListener('click', (e) => {
  const ripple = document.createElement('div');
  ripple.className = 'cursor-ripple';
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
});

// ----------------------------------------------------
// 4. MAGNETIC BUTTONS PHYSICS
// ----------------------------------------------------
function initMagneticButtons() {
  const magnets = document.querySelectorAll('.btn-minimal-primary, .btn-minimal-secondary, .slider-btn, .ai-assistant-toggle');
  
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;
      
      const dx = e.clientX - btnX;
      const dy = e.clientY - btnY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < 70) {
        // Pull button slightly toward mouse coords
        gsap.to(btn, {
          x: dx * 0.35,
          y: dy * 0.35,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'power3.out'
      });
    });
  });
}

// ----------------------------------------------------
// 5. ANTIGRAVITY ENGINE (ZERO-G FLOOR FLOATING)
// ----------------------------------------------------
function applyZeroGPhysics() {
  time += 0.015;
  const drift = (1 - gravityValue);
  
  const panels = document.querySelectorAll('.glass-panel, .portfolio-card');
  panels.forEach((panel, idx) => {
    if (drift === 0) {
      panel.style.transform = 'none';
      return;
    }
    
    const ampX = (10 + idx * 3) * drift;
    const ampY = (14 + idx * 4) * drift;
    const rotAmp = (1.5 + idx * 0.2) * drift;
    
    // Normalized mouse offsets
    const mx = (mouseX - window.innerWidth / 2) / (window.innerWidth / 2);
    const my = (mouseY - window.innerHeight / 2) / (window.innerHeight / 2);
    
    const x = Math.sin(time + idx * 1.2) * ampX + (mx * -12 * drift);
    const y = Math.cos(time * 0.8 + idx * 1.8) * ampY + (my * -15 * drift);
    const rot = Math.sin(time * 0.4 + idx) * rotAmp;
    
    panel.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
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
    if (gravityValLabel) gravityValLabel.textContent = `${val}%`;
    gravityValue = val / 100;
  });
}

// ----------------------------------------------------
// 6. ANIMATED TYPING SUBTITLES
// ----------------------------------------------------
const typingWords = ['Brand Identity', 'UI/UX Design', 'AI Custom Solutions', 'Creative Studio', '3D Visual Systems', 'Marketing'];
let wordIdx = 0;
let charIdx = 0;
let isDeleting = false;

function typeWordsLoop() {
  const typingText = document.getElementById('typing-text');
  if (!typingText) return;
  
  const currentWord = typingWords[wordIdx];
  
  if (isDeleting) {
    charIdx--;
  } else {
    charIdx++;
  }
  
  typingText.textContent = currentWord.substring(0, charIdx);
  
  let typingSpeed = 100;
  if (isDeleting) {
    typingSpeed = 50;
  }
  
  if (!isDeleting && charIdx === currentWord.length) {
    typingSpeed = 1800; // hold
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    wordIdx = (wordIdx + 1) % typingWords.length;
    typingSpeed = 500; // pause before next word
  }
  
  setTimeout(typeWordsLoop, typingSpeed);
}

// ----------------------------------------------------
// 7. GENERATING PREMIUM SERVICES
// ----------------------------------------------------
const servicesData = [
  { name: 'Brand Identity', icon: 'cpu', rating: 5, clients: '200+ Brands', desc: 'Crafting premium, strategic guidelines, typographic parameters, and vector structures.' },
  { name: 'UI/UX Interface', icon: 'layout', rating: 5, clients: '80+ Apps', desc: 'Pixel-perfect wireframes, design components, and responsive, fluid system code.' },
  { name: 'AI Custom Solutions', icon: 'refresh-cw', rating: 5, clients: '50+ Pipelines', desc: 'Developing smart design networks, automated assets, and local agent context integrations.' },
  { name: 'Creative Marketing', icon: 'shield', rating: 5, clients: '120+ Audits', desc: 'Corporate presentation design, sensory packaging specifications, and digital templates.' }
];

function initializeServicesGrid() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  servicesData.forEach((s) => {
    const card = document.createElement('div');
    card.className = 'service-card glass-panel reveal-item-trigger';
    
    // stars html
    let starsHtml = '';
    for(let i=0; i<s.rating; i++) starsHtml += '★';
    
    card.innerHTML = `
      <div class="card-sheen"></div>
      <div class="service-icon">
        <i data-lucide="${s.icon}"></i>
      </div>
      <div>
        <div class="service-card-rating">${starsHtml}</div>
        <div class="service-card-meta">${s.clients}</div>
        <h3 class="service-title">${s.name}</h3>
        <p class="service-desc">${s.desc}</p>
        <a class="service-explore-link" href="#scene-contact">Explore <i data-lucide="arrow-right" style="width:12px;height:12px;"></i></a>
      </div>
    `;
    grid.appendChild(card);
  });
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Mouse Sheen positioning
document.body.addEventListener('mousemove', (e) => {
  const target = e.target.closest('.glass-panel');
  if (!target) return;
  
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  target.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
  target.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
});

// ----------------------------------------------------
// 8. LIVE STATISTICS COUNT-UP UTILITIES
// ----------------------------------------------------
let statsTriggered = false;
function animateStatsCountUp() {
  if (statsTriggered) return;
  statsTriggered = true;
  
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(num => {
    const target = parseInt(num.getAttribute('data-target'));
    const isSatisfaction = num.getAttribute('id') === 'stat-satisfaction';
    let current = 0;
    const duration = 2000; // ms
    const increment = target / (duration / 16); // 60fps
    
    const count = () => {
      current += increment;
      if (current >= target) {
        num.textContent = isSatisfaction ? `${target}%` : `${target}+`;
      } else {
        num.textContent = isSatisfaction ? `${Math.floor(current)}%` : `${Math.floor(current)}+`;
        requestAnimationFrame(count);
      }
    };
    count();
  });
}

// ----------------------------------------------------
// 9. TESTIMONIALS SLIDER
// ----------------------------------------------------
let testimonialIdx = 0;
let testimonialTimer;

function initTestimonialSlider() {
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('prev-testimonial-btn');
  const nextBtn = document.getElementById('next-testimonial-btn');
  const cards = document.querySelectorAll('.testimonial-card');
  
  if (!track || cards.length === 0) return;
  
  const showTestimonial = (idx) => {
    testimonialIdx = (idx + cards.length) % cards.length;
    track.style.transform = `translateX(-${testimonialIdx * 100}%)`;
  };
  
  const startAutoplay = () => {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => {
      showTestimonial(testimonialIdx + 1);
    }, 5000);
  };
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showTestimonial(testimonialIdx - 1);
      startAutoplay();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showTestimonial(testimonialIdx + 1);
      startAutoplay();
    });
  }
  
  startAutoplay();
}

// ----------------------------------------------------
// 10. PRECISE PROCESS TIMELINE SCROLL SCALING
// ----------------------------------------------------
function updateScrollTimeline() {
  const timelineSection = document.getElementById('scene-timeline');
  const timelineProgress = document.getElementById('timeline-scroll-progress');
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  if (!timelineSection || !timelineProgress) return;
  
  const rect = timelineSection.getBoundingClientRect();
  const sectionHeight = rect.height;
  const topOffset = rect.top;
  
  // Calculate percentage of timeline section scrolled through viewport
  // starts at top of screen, ends at bottom
  const viewportHeight = window.innerHeight;
  const start = topOffset - viewportHeight / 2;
  const end = topOffset + sectionHeight - viewportHeight / 2;
  
  let progress = 0;
  if (start < 0) {
    progress = Math.min(Math.abs(start) / (sectionHeight - viewportHeight / 2), 1) * 100;
  }
  
  timelineProgress.style.height = `${progress}%`;
  
  // Highlight items sequentially
  const stepCount = timelineItems.length;
  const activeStep = Math.min(Math.floor((progress / 100) * stepCount), stepCount - 1);
  
  timelineItems.forEach((item, idx) => {
    if (idx <= activeStep && progress > 0) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
window.addEventListener('scroll', updateScrollTimeline);

// ----------------------------------------------------
// 11. CONVERSATIONAL STEP-BY-STEP FORM
// ----------------------------------------------------
let currentFormStep = 0;
const formSteps = document.querySelectorAll('.form-step');
const formTrack = document.getElementById('form-steps-track');
const formProgressFill = document.getElementById('form-progress-fill');
const formPrevBtn = document.getElementById('btn-form-prev');
const formNextBtn = document.getElementById('btn-form-next');
const formSubmitBtn = document.getElementById('btn-form-submit');

// Option selections
const selectedBrief = {
  name: '',
  company: '',
  projectType: '',
  budget: ''
};

function initConversationalForm() {
  if (!formTrack || formSteps.length === 0) return;
  
  // Wire options grids
  const wireOptionCards = (containerId, briefKey) => {
    const cards = document.querySelectorAll(`#${containerId} .form-option-card`);
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedBrief[briefKey] = card.getAttribute('data-val');
      });
    });
  };
  
  wireOptionCards('form-options-type', 'projectType');
  wireOptionCards('form-options-budget', 'budget');
  
  const updateFormNavigation = () => {
    formTrack.style.transform = `translateX(-${currentFormStep * 20}%)`;
    formProgressFill.style.width = `${(currentFormStep + 1) * 20}%`;
    
    // Toggle prev button visibility
    if (currentFormStep > 0) {
      formPrevBtn.style.visibility = 'visible';
    } else {
      formPrevBtn.style.visibility = 'hidden';
    }
    
    // Toggle next vs submit trigger
    if (currentFormStep === formSteps.length - 1) {
      formNextBtn.style.display = 'none';
      formSubmitBtn.style.display = 'flex';
    } else {
      formNextBtn.style.display = 'flex';
      formSubmitBtn.style.display = 'none';
    }
  };
  
  if (formNextBtn) {
    formNextBtn.addEventListener('click', () => {
      // Simple validation
      if (currentFormStep === 0) {
        const val = document.getElementById('form-input-name').value.trim();
        if (!val) {
          alert('Please enter your name to proceed.');
          return;
        }
        selectedBrief.name = val;
      }
      if (currentFormStep === 1) {
        const val = document.getElementById('form-input-company').value.trim();
        if (!val) {
          alert('Please enter your company/organization.');
          return;
        }
        selectedBrief.company = val;
      }
      if (currentFormStep === 2 && !selectedBrief.projectType) {
        alert('Please select a project type.');
        return;
      }
      if (currentFormStep === 3 && !selectedBrief.budget) {
        alert('Please choose a budget bracket.');
        return;
      }
      
      currentFormStep = Math.min(currentFormStep + 1, formSteps.length - 1);
      updateFormNavigation();
    });
  }
  
  if (formPrevBtn) {
    formPrevBtn.addEventListener('click', () => {
      currentFormStep = Math.max(currentFormStep - 1, 0);
      updateFormNavigation();
    });
  }
  
  if (formSubmitBtn) {
    formSubmitBtn.addEventListener('click', () => {
      // Confetti burst micro-interaction!
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.65 }
      });
      
      alert(`Project brief compiled! Thank you, ${selectedBrief.name}. We will initiate scoping calls for ${selectedBrief.company} shortly.`);
      
      // Reset form
      document.getElementById('form-input-name').value = '';
      document.getElementById('form-input-company').value = '';
      document.querySelectorAll('.form-option-card').forEach(c => c.classList.remove('selected'));
      selectedBrief.name = '';
      selectedBrief.company = '';
      selectedBrief.projectType = '';
      selectedBrief.budget = '';
      currentFormStep = 0;
      updateFormNavigation();
    });
  }
}

// ----------------------------------------------------
// 12. DYNAMIC AI EXPERIENCE SUGGESTION ASSISTANT
// ----------------------------------------------------
function initAIAssistant() {
  const toggleBtn = document.getElementById('ai-toggle-btn');
  const viewport = document.getElementById('ai-viewport');
  const closeBtn = document.getElementById('ai-close-btn');
  const sendBtn = document.getElementById('ai-send-btn');
  const chatInput = document.getElementById('ai-chat-input');
  const chatMessages = document.getElementById('ai-chat-messages');
  
  if (!toggleBtn || !viewport || !chatMessages) return;
  
  toggleBtn.addEventListener('click', () => {
    viewport.classList.toggle('active');
  });
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      viewport.classList.remove('active');
    });
  }
  
  const appendMessage = (text, sender) => {
    const msg = document.createElement('div');
    msg.className = `ai-msg ${sender}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };
  
  const generateSuggestions = (idea) => {
    appendMessage("Analyzing concept matrices...", "system");
    
    setTimeout(() => {
      let brandingStyle = "Minimal Scandinavian Tech";
      let logoDesign = "Clean geometric logomark containing breathing gradients";
      let palettes = "#09090B (Midnight) // #8B5CF6 (Purple) // #C4B5FD (Lavender)";
      let marketing = "Run automated visual diff campaigns on LinkedIn and post deterministic AST diagram maps.";
      
      if (idea.toLowerCase().includes('coffee') || idea.toLowerCase().includes('cafe')) {
        brandingStyle = "Organic Cozy Minimalist";
        logoDesign = "Drawn botanical single-line vector art";
        palettes = "#FDFBF7 (Cream) // #78350F (Warm Amber) // #D97706 (Gold)";
        marketing = "Launch visual Instagram reels showing packaging mockups and run geographical targeted ads.";
      } else if (idea.toLowerCase().includes('game') || idea.toLowerCase().includes('play')) {
        brandingStyle = "Cyberpunk Neo-Glow Visuals";
        logoDesign = "Abstract neon coordinate badge with metallic highlights";
        palettes = "#030306 (Midnight) // #10B981 (Emerald) // #3B82F6 (Blue)";
        marketing = "Broadcast 3D showreel clips on TikTok and host beta gameplay feedback channels.";
      }
      
      appendMessage(`💡 Suggestions for "${idea}":`, "system");
      appendMessage(`• Style: ${brandingStyle}`, "system");
      appendMessage(`• Logo Concept: ${logoDesign}`, "system");
      appendMessage(`• Colors: ${palettes}`, "system");
      appendMessage(`• Strategy: ${marketing}`, "system");
    }, 1500);
  };
  
  const handleSend = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    
    chatInput.value = '';
    appendMessage(text, 'user');
    
    generateSuggestions(text);
  };
  
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}

// ----------------------------------------------------
// 13. FLOATING STATUS & BACK TO TOP WIDGETS
// ----------------------------------------------------
function initFloatingWidgets() {
  const backToTop = document.getElementById('back-to-top-btn');
  const statusWidget = document.getElementById('floating-status');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      if (backToTop) backToTop.classList.add('visible');
      if (statusWidget) statusWidget.classList.add('visible');
    } else {
      if (backToTop) backToTop.classList.remove('visible');
      if (statusWidget) statusWidget.classList.remove('visible');
    }
  });
  
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ----------------------------------------------------
// 14. LOGO TRANSPARENCY PIPELINE
// ----------------------------------------------------
async function processLogoToTransparent() {
  const images = ['loading-logo-img', 'nav-logo-img', 'vault-primary-logo', 'vault-inverse-logo'];
  
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
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          if (r > 235 && g > 235 && b > 225) {
            data[i+3] = 0; // Transparent
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
// 15. LOADING SEQUENCE & CINEMATIC FIRST IMPRESSION
// ----------------------------------------------------
function runLoadingTimeline() {
  const timeline = gsap.timeline();
  
  const loadingStatusTexts = [
    'Booting Virtual OS Kernel...',
    'Loading starfield space warp mechanics...',
    'Stabilizing quantum memory matrix...',
    'Cockpit online. G-forces neutralized.'
  ];
  
  let percentageObj = { value: 0 };
  
  timeline.to(percentageObj, {
    value: 100,
    duration: 2.5,
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
    },
    onComplete: () => {
      // Loading finished: reveal the Cinematic enter button!
      const enterBtn = document.getElementById('btn-enter-universe');
      if (enterBtn) {
        enterBtn.style.display = 'block';
        gsap.to(enterBtn, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)'
        });
      }
    }
  });
}

// Cinematic Entrance Click Handler
const enterUniverseBtn = document.getElementById('btn-enter-universe');
if (enterUniverseBtn) {
  enterUniverseBtn.addEventListener('click', () => {
    // Fade out loading screen with zoom and blur page transition style
    gsap.to('#scene-loading', {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(10px)',
      duration: 0.8,
      ease: 'power2.inOut',
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
        gsap.from('.typing-container', { opacity: 0, y: 15, duration: 1.0, ease: 'power3.out', delay: 0.4 });
        gsap.from('.cta-group', { opacity: 0, y: 15, duration: 1.0, ease: 'power3.out', delay: 0.6 });
        
        // Run loops
        setTimeout(typeWordsLoop, 800);
        initCursorInteractions();
        initMagneticButtons();
        initializeServicesGrid();
        initTestimonialSlider();
        initConversationalForm();
        initAIAssistant();
        initFloatingWidgets();
        setupScrollTriggerAnimations();
        setupScrollObserver();
      }
    });
  });
}

// ----------------------------------------------------
// 16. SCROLL OBSERVER (NAVBAR ACTIVE LINK HIGHLIGHT)
// ----------------------------------------------------
function setupScrollObserver() {
  const sections = document.querySelectorAll('section.scene');
  const navItems = document.querySelectorAll('.nav-links .nav-link');
  
  const options = {
    root: null,
    threshold: 0.2,
    rootMargin: '-80px 0px -80px 0px'
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

// ----------------------------------------------------
// 17. GSAP SCROLLTRIGGER REVEALS & COUNT-UPS
// ----------------------------------------------------
function setupScrollTriggerAnimations() {
  if (!window.ScrollTrigger) return;
  
  // Stagger reveal of services
  gsap.from('#services-grid .service-card', {
    scrollTrigger: {
      trigger: '#scene-services',
      start: 'top 75%'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });
  
  // Rotate portfolio cards slightly on entry
  gsap.from('#scene-portfolio .portfolio-card', {
    scrollTrigger: {
      trigger: '#scene-portfolio',
      start: 'top 75%'
    },
    scale: 0.95,
    rotation: 2,
    opacity: 0,
    duration: 1.0,
    stagger: 0.2,
    ease: 'power3.out'
  });
  
  // Trigger count-up of statistics when they enter viewport
  ScrollTrigger.create({
    trigger: '#scene-stats',
    start: 'top 80%',
    onEnter: () => animateStatsCountUp()
  });
  
  // Timeline items stagger reveal
  gsap.from('#scene-timeline .timeline-item', {
    scrollTrigger: {
      trigger: '#scene-timeline',
      start: 'top 75%'
    },
    x: -30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power2.out'
  });
}

// ----------------------------------------------------
// 18. HOLOGRAPHIC MAP GLOBE RENDERER
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
    
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const dotColor = theme === 'dark' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(109, 74, 255, 0.08)';
    const hubColor = theme === 'dark' ? 'rgb(139, 92, 246)' : 'rgb(109, 74, 255)';
    const pulseColor = theme === 'dark' ? '139, 92, 246' : '109, 74, 255';
    
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
        mctx.fillStyle = dotColor;
        mctx.fill();
      }
    }
    
    // Draw pulsing hub centers
    hubs.forEach(h => {
      const hx = h.x * mapCanvas.width;
      const hy = h.y * mapCanvas.height;
      
      mctx.beginPath();
      mctx.arc(hx, hy, h.size, 0, Math.PI * 2);
      mctx.fillStyle = hubColor;
      mctx.fill();
      
      h.pulseRadius += 0.4;
      if (h.pulseRadius > 25) h.pulseRadius = 0;
      
      mctx.beginPath();
      mctx.arc(hx, hy, h.pulseRadius, 0, Math.PI * 2);
      mctx.strokeStyle = `rgba(${pulseColor}, ${(1 - h.pulseRadius / 25) * (theme === 'dark' ? 1.0 : 0.4)})`;
      mctx.lineWidth = 1;
      mctx.stroke();
    });
    
    animationFrameId = requestAnimationFrame(drawMap);
  }
  
  drawMap();
}

// DOM load starts
window.addEventListener('DOMContentLoaded', async () => {
  await processLogoToTransparent();
  runLoadingTimeline();
});

// ----------------------------------------------------
// 19. THEME SWITCHER TOGGLE
// ----------------------------------------------------
function initializeThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;
  
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}
initializeThemeToggle();
