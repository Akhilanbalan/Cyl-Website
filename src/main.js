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
  sctx.fillStyle = 'rgba(3, 3, 5, 0.2)'; // trail effect
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
const commandDeck = document.getElementById('command-deck-container');
const panels = document.querySelectorAll('.glass-ide-panel');

let time = 0;
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
  mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
});

function applyZeroGPhysics() {
  time += 0.02;
  
  // Drift factor: higher drift when gravityValue is lower
  const drift = (1 - gravityValue);
  
  panels.forEach((panel, idx) => {
    if (drift === 0) {
      panel.style.transform = 'none';
      return;
    }
    
    // Each panel oscillates on a different frequency and amplitude
    const ampX = (10 + idx * 4) * drift;
    const ampY = (15 + idx * 5) * drift;
    const rotAmp = (1.5 + idx * 0.5) * drift;
    
    const x = Math.sin(time + idx * 1.5) * ampX + (mouseX * -15 * drift);
    const y = Math.cos(time * 0.8 + idx * 2) * ampY + (mouseY * -20 * drift);
    const rot = Math.sin(time * 0.5 + idx) * rotAmp;
    
    panel.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
    panel.style.boxShadow = `0 ${8 + y/2}px ${32 + Math.abs(x)}px rgba(124, 93, 255, ${0.1 + drift * 0.08})`;
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
    
    // Log change
    if (val === 0) {
      appendTerminalLog('Zero-G warning: Cabin structures decoupled. Starfield warp factor: MAX.', 'warn');
    } else if (val === 100) {
      appendTerminalLog('Gravity matrix loaded. Grid structures locked.', 'system');
    } else {
      appendTerminalLog(`Gravity level synchronized: ${val}%`, 'info');
    }
  });
}

// ----------------------------------------------------
// 3. SECURE SHELL TERMINAL LOGGING & COMMANDS
// ----------------------------------------------------
const shellInput = document.getElementById('terminal-shell-input');
const logBox = document.getElementById('terminal-log-box');

function appendTerminalLog(text, type = 'info') {
  if (!logBox) return;
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  entry.textContent = `[${timeStr}] ${text}`;
  
  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}

if (shellInput) {
  shellInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = shellInput.value.trim();
      shellInput.value = '';
      if (!cmd) return;
      
      appendTerminalLog(`$ ${cmd}`, 'system');
      processShellCommand(cmd);
    }
  });
}

function processShellCommand(commandString) {
  const parts = commandString.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  switch(cmd) {
    case 'help':
      appendTerminalLog('Commands available:', 'info');
      appendTerminalLog('  help             Show instructions', 'info');
      appendTerminalLog('  clear            Clear log screen', 'info');
      appendTerminalLog('  gravity <num>    Set gravity value (0-100)', 'info');
      appendTerminalLog('  compile          Re-process vector assets', 'info');
      appendTerminalLog('  status           Print KERNEL resources status', 'info');
      appendTerminalLog('  agent <name>     Toggle subagent status', 'info');
      break;
    case 'clear':
      if (logBox) logBox.innerHTML = '';
      break;
    case 'gravity':
      const gval = parseInt(args[0]);
      if (isNaN(gval) || gval < 0 || gval > 100) {
        appendTerminalLog('Error: gravity must be a number between 0 and 100', 'err');
      } else {
        if (gravitySlider) {
          gravitySlider.value = gval;
          gravityValLabel.textContent = `${gval}%`;
        }
        gravityValue = gval / 100;
        appendTerminalLog(`Gravity level synchronized: ${gval}%`, 'info');
      }
      break;
    case 'compile':
      const statusIndicator = document.getElementById('compiling-indicator');
      const compText = document.getElementById('compiler-status');
      if (statusIndicator) statusIndicator.className = 'status-indicator compiling';
      if (compText) compText.textContent = 'KERNEL: RECOMPILING...';
      
      appendTerminalLog('[COMPILER] Refreshing canvas logo vectors...', 'info');
      setTimeout(() => {
        if (statusIndicator) statusIndicator.className = 'status-indicator';
        if (compText) compText.textContent = 'KERNEL: ACTIVE';
        appendTerminalLog('[COMPILER] Vector asset processing complete. Cleaned logo overlays.', 'info');
      }, 1500);
      break;
    case 'status':
      appendTerminalLog('CYL OS Status Report:', 'info');
      appendTerminalLog(`  Active core theme: ${document.documentElement.getAttribute('data-theme')}`, 'info');
      appendTerminalLog('  Uptime: 99.99%', 'info');
      appendTerminalLog('  Network socket: SECURE SSH', 'info');
      appendTerminalLog(`  Damping gravity: ${gravityValue * 100}%`, 'info');
      break;
    case 'agent':
      if (!args[0]) {
        appendTerminalLog('Error: specify agent name', 'err');
      } else {
        appendTerminalLog(`Agent "${args[0]}" command triggered. Toggled status.`, 'info');
      }
      break;
    default:
      appendTerminalLog(`Shell error: command not recognized: "${cmd}". Type "help" for instructions.`, 'err');
  }
}

// ----------------------------------------------------
// 4. WORKSPACE TAB CONTROLLER & EXPLORER
// ----------------------------------------------------
const tabsBar = document.getElementById('tabs-bar');
const panes = document.querySelectorAll('.viewport-pane');
const treeFiles = document.querySelectorAll('.tree-file');

const tabIcons = {
  'welcome': 'file-text',
  'ai-studio': 'cpu',
  'globe': 'globe',
  'vault': 'archive',
  'metrics': 'activity'
};

const tabLabels = {
  'welcome': 'WELCOME.md',
  'ai-studio': 'ai_studio.py',
  'globe': 'map_globe.canvas',
  'vault': 'brand_vault.json',
  'metrics': 'metrics_log.sh'
};

window.loadTab = function(tabId) {
  // Update tree active selection
  treeFiles.forEach(tf => {
    if (tf.getAttribute('data-target') === tabId) {
      tf.classList.add('active');
    } else {
      tf.classList.remove('active');
    }
  });
  
  // Manage tabs bar tags
  let existingTab = tabsBar.querySelector(`[data-pane="${tabId}"]`);
  if (!existingTab) {
    // Generate new tab tag
    const tabTag = document.createElement('div');
    tabTag.className = 'viewport-tab active';
    tabTag.setAttribute('data-pane', tabId);
    tabTag.innerHTML = `
      <i data-lucide="${tabIcons[tabId]}" class="tree-icon"></i>
      <span>${tabLabels[tabId]}</span>
      <i data-lucide="x" class="viewport-tab-close" onclick="closeTab('${tabId}', event)"></i>
    `;
    tabsBar.appendChild(tabTag);
    if (window.lucide) window.lucide.createIcons();
  }
  
  // Set active tabs tags
  tabsBar.querySelectorAll('.viewport-tab').forEach(tab => {
    if (tab.getAttribute('data-pane') === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Switch pane content
  panes.forEach(p => {
    if (p.getAttribute('id') === `pane-${tabId}`) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  
  // Initialize specific tab logic on load
  if (tabId === 'globe') {
    setTimeout(initializeMapGlobe, 100);
  }
  
  appendTerminalLog(`Workspace viewport loaded: ${tabLabels[tabId]}`, 'info');
};

window.closeTab = function(tabId, event) {
  if (event) event.stopPropagation();
  
  const tabTag = tabsBar.querySelector(`[data-pane="${tabId}"]`);
  if (!tabTag) return;
  
  const wasActive = tabTag.classList.contains('active');
  tabTag.remove();
  
  // If we closed the active tab, fall back to welcome or another open tab
  if (wasActive) {
    const remainingTabs = tabsBar.querySelectorAll('.viewport-tab');
    if (remainingTabs.length > 0) {
      const targetId = remainingTabs[remainingTabs.length - 1].getAttribute('data-pane');
      loadTab(targetId);
    } else {
      loadTab('welcome');
    }
  }
};

// Wire file tree items
treeFiles.forEach(file => {
  file.addEventListener('click', () => {
    const target = file.getAttribute('data-target');
    loadTab(target);
  });
});

// Wire tab clicks in navbar tabs
tabsBar.addEventListener('click', (e) => {
  const tab = e.target.closest('.viewport-tab');
  if (tab) {
    const target = tab.getAttribute('data-pane');
    loadTab(target);
  }
});

// Brand Vault tabs selection inside pane
const vaultTabs = document.querySelectorAll('.vault-tab');
const vaultPanes = document.querySelectorAll('.vault-content-pane');

vaultTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    vaultTabs.forEach(vt => vt.classList.remove('active'));
    tab.classList.add('active');
    
    const target = tab.getAttribute('data-vault');
    vaultPanes.forEach(pane => {
      if (pane.getAttribute('id') === `vault-${target}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
    
    appendTerminalLog(`JSON vault directory filtered: ${target}`, 'info');
  });
});

// AI Studio Prompt compiler simulator
const studioRunBtn = document.getElementById('btn-studio-run');
const studioPlaceholder = document.getElementById('studio-placeholder');
const studioOutput = document.getElementById('studio-output');

if (studioRunBtn) {
  studioRunBtn.addEventListener('click', () => {
    const prompt = document.getElementById('studio-prompt').value.trim();
    if (!prompt) {
      appendTerminalLog('Studio compiler error: please write a prompt description first.', 'err');
      return;
    }
    
    appendTerminalLog(`[AI ENGINE] Compiling prompt vector mapping...`, 'info');
    studioPlaceholder.innerHTML = `
      <i data-lucide="loader" class="tree-icon spinner" style="width: 32px; height: 32px; color: var(--border-active); animation: rotateClockwise 1.5s linear infinite;"></i>
      <span>Neural Diffusion processing...</span>
    `;
    if (window.lucide) window.lucide.createIcons();
    
    studioOutput.classList.remove('active');
    studioPlaceholder.style.display = 'flex';
    
    setTimeout(() => {
      studioPlaceholder.style.display = 'none';
      studioOutput.classList.add('active');
      appendTerminalLog('[AI ENGINE] Prompt compiled successfully. Generated 1:1 Vector SVG shape.', 'info');
    }, 2000);
  });
}

// ----------------------------------------------------
// 5. TRANSPARENT LOGO PROCESSOR (CANVAS CLEANER)
// ----------------------------------------------------
async function processLogoToTransparent() {
  const images = ['loading-logo-img', 'nav-logo-img', 'vault-primary-logo', 'vault-inverse-logo'];
  
  images.forEach(imgId => {
    const imgEl = document.getElementById(imgId);
    if (!imgEl) return;
    
    // Process once image loads
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
        
        // Loop pixels: find cream off-white background and set alpha to 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          // Cream off-white matches r > 240, g > 240, b > 230
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
// 6. QUANTUM CORE LOADING OVERLAY TIMER
// ----------------------------------------------------
function runLoadingTimeline() {
  const timeline = gsap.timeline();
  
  const loadingStatusTexts = [
    'Booting Virtual OS Kernel...',
    'Loading starfield space warp mechanics...',
    'Spawning autonomous subagents...',
    'Stabilizing quantum memory matrix...',
    'Cockpit online. Decoupling G-forces...'
  ];
  
  let percentageObj = { value: 0 };
  
  timeline.to(percentageObj, {
    value: 100,
    duration: 3.5,
    ease: 'power1.inOut',
    onUpdate: () => {
      const pct = Math.floor(percentageObj.value);
      const label = document.getElementById('loader-percentage');
      if (label) label.textContent = `${pct}%`;
      
      // Update text index based on progress
      const textIndex = Math.floor((pct / 100) * (loadingStatusTexts.length - 1));
      const statusText = document.getElementById('loading-status-text');
      if (statusText) {
        // Append unique logs representing loading milestones
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
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => {
      const loadingScreen = document.getElementById('scene-loading');
      if (loadingScreen) loadingScreen.classList.add('hidden');
      document.body.classList.add('loaded');
      
      appendTerminalLog('Zero-G Command Deck fully initialized. Welcome back, Pilot.', 'system');
    }
  });
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
  
  // Generate stylized coordinate dots representing a global map
  const columns = 20;
  const rows = 10;
  
  // Focal hubs to pulse
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
        // Skip dots to shape it roughly like a world map outline
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
      
      // Draw hub center node
      mctx.beginPath();
      mctx.arc(hx, hy, h.size, 0, Math.PI * 2);
      mctx.fillStyle = 'rgb(124, 93, 255)';
      mctx.fill();
      
      // Draw pulse ripple ring
      h.pulseRadius += 0.5;
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
  
  // Clean up animation frame upon tab changes
  window.addEventListener('blur', () => cancelAnimationFrame(animationFrameId));
}

// ----------------------------------------------------
// 8. CLOCK CLOCK UPDATE TIME
// ----------------------------------------------------
setInterval(() => {
  const clock = document.getElementById('os-clock');
  if (clock) {
    const now = new Date();
    clock.textContent = now.toTimeString().split(' ')[0];
  }
}, 1000);
