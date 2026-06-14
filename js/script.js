// ============== SCATTERING / REGROUPING DOT BACKGROUND ==============
(function initDots() {
  const canvas = document.getElementById('bgGrid');
  const ctx = canvas.getContext('2d');

  const SPACING = 42;
  const RADIUS = 160;          // mouse influence radius
  const MAX_PUSH = 34;          // max displacement of a dot (bubble pop)
  const BASE_RADIUS = 1.4;      // resting dot size
  const MAX_RADIUS = 3.6;       // dot size near cursor
  const EASE = 0.08;            // how fast dots settle back

  let width, height, cols, rows, points = [];
  let mouse = { x: -9999, y: -9999 };
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  // ---------- PACMAN ----------
  const PACMAN_RADIUS = 16;
  const PACMAN_SPEED = 1.6;
  const EAT_RADIUS = 22;
  const RESPAWN_DELAY = 4000; // ms before an eaten dot reappears

  const pacman = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    angle: 0,
    mouth: 0,
    mouthDir: 1,
  };

  function resetPacmanDirection() {
    const a = Math.random() * Math.PI * 2;
    pacman.dx = Math.cos(a);
    pacman.dy = Math.sin(a);
    pacman.angle = a;
  }

  function initPacman() {
    pacman.x = Math.random() * width;
    pacman.y = Math.random() * height;
    resetPacmanDirection();
    // Occasionally change direction at random for an erratic, organic path
    setInterval(() => {
      if (Math.random() < 0.6) resetPacmanDirection();
    }, 1500);
  }

  function updatePacman() {
    pacman.x += pacman.dx * PACMAN_SPEED;
    pacman.y += pacman.dy * PACMAN_SPEED;

    if (pacman.x < PACMAN_RADIUS) { pacman.x = PACMAN_RADIUS; pacman.dx *= -1; }
    if (pacman.x > width - PACMAN_RADIUS) { pacman.x = width - PACMAN_RADIUS; pacman.dx *= -1; }
    if (pacman.y < PACMAN_RADIUS) { pacman.y = PACMAN_RADIUS; pacman.dy *= -1; }
    if (pacman.y > height - PACMAN_RADIUS) { pacman.y = height - PACMAN_RADIUS; pacman.dy *= -1; }

    if (pacman.dx !== 0 || pacman.dy !== 0) {
      pacman.angle = Math.atan2(pacman.dy, pacman.dx);
    }

    // Chomping mouth animation
    pacman.mouth += pacman.mouthDir * 0.015;
    if (pacman.mouth > 0.25) { pacman.mouth = 0.25; pacman.mouthDir = -1; }
    if (pacman.mouth < 0.02) { pacman.mouth = 0.02; pacman.mouthDir = 1; }

    // Eat nearby dots
    const now = Date.now();
    for (const p of points) {
      if (p.eaten && now >= p.respawnAt) {
        p.eaten = false;
      }
      if (!p.eaten) {
        const d = Math.hypot(p.x - pacman.x, p.y - pacman.y);
        if (d < EAT_RADIUS) {
          p.eaten = true;
          p.respawnAt = now + RESPAWN_DELAY + Math.random() * 2000;
        }
      }
    }
  }

  function drawPacman() {
    ctx.save();
    ctx.translate(pacman.x, pacman.y);
    ctx.rotate(pacman.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, PACMAN_RADIUS, pacman.mouth * Math.PI, (2 - pacman.mouth) * Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#5b8cff';
    ctx.shadowColor = 'rgba(91, 140, 255, 0.6)';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();
  }

  function buildGrid() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(width / SPACING) + 1;
    rows = Math.ceil(height / SPACING) + 1;
    points = [];

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        points.push({
          ox: i * SPACING,
          oy: j * SPACING,
          x: i * SPACING,
          y: j * SPACING,
        });
      }
    }
  }

  function update() {
    for (const p of points) {
      const dx = p.ox - mouse.x;
      const dy = p.oy - mouse.y;
      const dist = Math.hypot(dx, dy);

      let targetX = p.ox;
      let targetY = p.oy;
      let force = 0;

      if (dist < RADIUS) {
        force = 1 - dist / RADIUS;
        const angle = Math.atan2(dy, dx);
        const push = force * force * MAX_PUSH;
        targetX = p.ox + Math.cos(angle) * push;
        targetY = p.oy + Math.sin(angle) * push;
      }

      p.x += (targetX - p.x) * EASE;
      p.y += (targetY - p.y) * EASE;
      p.force = force;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const p of points) {
      if (p.eaten) continue;

      const t = p.force || 0;
      const radius = BASE_RADIUS + t * (MAX_RADIUS - BASE_RADIUS);
      const alpha = 0.08 + t * 0.6;

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = t > 0.05
        ? `rgba(91, 140, 255, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    drawPacman();
  }

  function loop() {
    update();
    updatePacman();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support (Android / iOS) — finger acts like the cursor
  window.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    buildGrid();
    pacman.x = Math.min(pacman.x, width - PACMAN_RADIUS);
    pacman.y = Math.min(pacman.y, height - PACMAN_RADIUS);
  });

  buildGrid();
  initPacman();
  loop();
})();

// ============== CUSTOM CURSOR ==============
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const bgGlow = document.getElementById('bgGlow');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
const isTouch = window.matchMedia('(hover: none)').matches;

if (!isTouch) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;

    bgGlow.style.left = `${mouseX}px`;
    bgGlow.style.top = `${mouseY}px`;
    bgGlow.style.opacity = '1';
  });

  // Smooth ring follow (lerp)
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state for interactive elements
  const hoverables = document.querySelectorAll('a, button, .tilt, .tag, .nav-link');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
  });

  document.addEventListener('mouseleave', () => {
    bgGlow.style.opacity = '0';
  });
}

// ============== MAGNETIC BUTTONS ==============
if (!isTouch) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
} else {
  // Touch tap pulse for magnetic buttons
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('touchstart', () => {
      el.style.transform = 'scale(0.94)';
    }, { passive: true });
    el.addEventListener('touchend', () => {
      el.style.transform = 'scale(1)';
    });
  });
}

// ============== TILT EFFECT ON CARDS ==============
if (!isTouch) {
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
} else {
  // Touch tap tilt pulse for cards
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('touchstart', () => {
      card.style.transform = 'perspective(800px) scale(0.98) translateY(-2px)';
    }, { passive: true });
    card.addEventListener('touchend', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });
}

// ============== TYPING ANIMATION ==============
const roles = [
  'Unity Game Developer',
  'C# / .NET Engineer (in progress)',
  'Live Mobile F2P Games Specialist',
  'Gameplay Systems Architect'
];

const typedTextEl = document.getElementById('typedText');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIndex];

  if (!deleting) {
    typedTextEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    typedTextEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeLoop, deleting ? 35 : 60);
}
typeLoop();

// ============== SCROLL REVEAL ==============
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach((el) => revealObserver.observe(el));

// ============== ACTIVE NAV LINK ON SCROLL ==============
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach((section) => navObserver.observe(section));

// ============== MOBILE NAV TOGGLE ==============
const navToggle = document.getElementById('navToggle');
const navLinksContainer = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinksContainer.classList.toggle('open');
  navToggle.classList.toggle('active');
});

navLinksContainer.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
  });
});

// ============== FOOTER YEAR ==============
document.getElementById('year').textContent = new Date().getFullYear();
