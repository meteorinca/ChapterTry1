/* ================================================
   Mission Control — First Contact · App Logic
   ================================================ */

(function () {
  'use strict';

  // ── Helpers ──────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── Screen Manager ───────────────────────────────
  const screens = $$('.screen');
  function goTo(id) {
    screens.forEach((s) => s.classList.remove('active'));
    const target = $(`#${id}`);
    requestAnimationFrame(() => {
      target.classList.add('active');
      // If scrollable screen, scroll to top
      if (target.classList.contains('screen-scroll')) {
        target.scrollTop = 0;
      }
    });
    target.querySelectorAll('.animate-in').forEach((el, i) => {
      el.style.animationDelay = `${0.1 + i * 0.12}s`;
    });
  }

  // ── 3D Robot Drag-to-Rotate ──────────────────────
  function initRobotDrag(scene) {
    const robot3d = scene.querySelector('.robot-3d');
    if (!robot3d) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let rotX = -10;
    let rotY = -25;

    function getPointer(e) {
      if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    function onStart(e) {
      isDragging = true;
      robot3d.classList.add('dragging');
      const pos = getPointer(e);
      startX = pos.x;
      startY = pos.y;

      const style = getComputedStyle(robot3d);
      const transform = style.transform;
      if (transform && transform !== 'none') {
        const mat = new DOMMatrix(transform);
        rotY = Math.atan2(mat.m13, mat.m33) * (180 / Math.PI);
        rotX = Math.atan2(-mat.m23, Math.sqrt(mat.m13 * mat.m13 + mat.m33 * mat.m33)) * (180 / Math.PI);
      }
    }

    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const pos = getPointer(e);
      const dx = pos.x - startX;
      const dy = pos.y - startY;
      startX = pos.x;
      startY = pos.y;

      rotY += dx * 0.6;
      rotX -= dy * 0.4;
      rotX = Math.max(-45, Math.min(30, rotX));

      robot3d.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      setTimeout(() => {
        if (!isDragging) {
          robot3d.classList.remove('dragging');
          robot3d.style.transform = '';
        }
      }, 3000);
    }

    scene.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    scene.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  // Initialize drag on all robot scenes
  $$('.robot-scene').forEach(initRobotDrag);

  // ── Floating Background Dots ─────────────────────
  function spawnFloatingDots() {
    const container = $('#float-dots');
    const colors = ['#F5C842', '#22D1C3', '#FF6B6B', '#D4A520'];
    for (let i = 0; i < 18; i++) {
      const dot = document.createElement('div');
      dot.classList.add('float-dot');
      const size = 6 + Math.random() * 18;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.background = colors[Math.floor(Math.random() * colors.length)];
      dot.style.animationDuration = `${12 + Math.random() * 18}s`;
      dot.style.animationDelay = `${Math.random() * 15}s`;
      container.appendChild(dot);
    }
  }

  // ── Confetti / Spark Particles ───────────────────
  const canvas = $('#particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animating = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function spawnParticles(x, y, count = 40) {
    const colors = ['#F5C842', '#22D1C3', '#FF6B6B', '#fff', '#D4A520', '#19A89D'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 2,
        size: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.012 + Math.random() * 0.015,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
    if (!animating) {
      animating = true;
      animateParticles();
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= p.decay;
      p.rotation += p.rotSpeed;
      if (p.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    });
    particles = particles.filter((p) => p.life > 0);
    if (particles.length > 0) {
      requestAnimationFrame(animateParticles);
    } else {
      animating = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function celebrateCenter(count = 60) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spawnParticles(cx, cy, count);
  }

  function celebrateFromElement(el, count = 40) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    spawnParticles(cx, cy, count);
  }

  // ── SCREEN 0: Intro ──────────────────────────────
  const introVideo = $('#intro-video');
  if (introVideo) {
    introVideo.playbackRate = 0.6; // Epic slow motion
  }

  const btnSkipIntro = $('#btn-skip-intro');
  if (btnSkipIntro) {
    btnSkipIntro.addEventListener('click', function () {
      goTo('screen-loading');
      setTimeout(initLoading, 200);
    });
  }

  // ── SCREEN 1: Loading ────────────────────────────
  async function initLoading() {
    await wait(2800);
    const wrapper = $('#start-btn-wrapper');
    if (wrapper) {
      wrapper.style.opacity = '1';
      wrapper.style.animation = 'fade-in 0.8s var(--ease) forwards';
    }
  }

  $('#btn-start').addEventListener('click', function () {
    celebrateFromElement(this, 30);
    setTimeout(() => goTo('screen-welcome'), 400);
  });

  // ── SCREEN 2: Welcome ───────────────────────────
  $('#btn-continue-welcome').addEventListener('click', function () {
    goTo('screen-connect');
  });

  // ── SCREEN 3: Connection Wizard ──────────────────
  const btnWiz1 = $('#btn-wizard-next-1');
  const btnWiz2 = $('#btn-wizard-next-2');
  const btnWiz3 = $('#btn-wizard-next-3');

  if (btnWiz1) {
    btnWiz1.addEventListener('click', () => {
      $('#wizard-step-1').style.display = 'none';
      $('#wizard-step-2').style.display = 'flex';
    });
  }

  if (btnWiz2) {
    btnWiz2.addEventListener('click', () => {
      $('#wizard-step-2').style.display = 'none';
      $('#wizard-step-3').style.display = 'flex';
    });
  }

  if (btnWiz3) {
    btnWiz3.addEventListener('click', () => {
      $('#wizard-step-3').style.display = 'none';
      $('#wizard-step-4').style.display = 'flex';
      celebrateCenter(50);
    });
  }

  // ── WiFi Gallery Prev/Next ───────────────────────
  const wifiImgs = $$('.wifi-img');
  let currentWifiStep = 0;
  const btnWifiPrev = $('#btn-wifi-prev');
  const btnWifiNext = $('#btn-wifi-next');
  const wifiStepCounter = $('#wifi-step-counter');

  function updateWifiGallery() {
    wifiImgs.forEach((img, i) => {
      img.style.display = i === currentWifiStep ? 'block' : 'none';
      if (i === currentWifiStep) {
        img.style.animation = 'none';
        img.offsetHeight;
        img.style.animation = 'fade-in 0.4s var(--ease) forwards';
      }
    });
    if (wifiStepCounter) wifiStepCounter.textContent = `${currentWifiStep + 1} / 5`;
    if (btnWifiPrev) btnWifiPrev.disabled = currentWifiStep === 0;
    if (btnWifiNext) btnWifiNext.disabled = currentWifiStep === wifiImgs.length - 1;
  }

  if (btnWifiPrev) {
    btnWifiPrev.addEventListener('click', () => {
      if (currentWifiStep > 0) { currentWifiStep--; updateWifiGallery(); }
    });
  }
  if (btnWifiNext) {
    btnWifiNext.addEventListener('click', () => {
      if (currentWifiStep < wifiImgs.length - 1) { currentWifiStep++; updateWifiGallery(); }
    });
  }

  $('#btn-continue-connect').addEventListener('click', function () {
    goTo('screen-wave');
  });

  // ── SCREEN 4: Wave Test ──────────────────────────
  let waved = false;

  $('#btn-wave').addEventListener('click', async function () {
    if (waved) return;
    waved = true;

    const robot = $('#wave-robot');
    robot.classList.add('robot-waving');
    celebrateFromElement(this, 50);

    this.style.background = 'linear-gradient(135deg, #22D1C3 0%, #19A89D 100%)';
    this.innerHTML = '<span class="btn-icon" style="font-size:2.4rem;">🎉</span> Waving!';

    await wait(2500);
    robot.classList.remove('robot-waving');
    robot.classList.add('robot-happy');

    await wait(800);
    robot.classList.remove('robot-happy');
    $('#wave-success').classList.add('show');
  });

  $('#btn-continue-wave').addEventListener('click', function () {
    goTo('screen-faces');
  });

  // ── SCREEN 5: Face Picker ────────────────────────
  let selectedFace = null;
  const faceCards = $$('.face-card');
  const sendBtn = $('#btn-send-face');

  faceCards.forEach((card) => {
    card.addEventListener('click', function () {
      faceCards.forEach((c) => c.classList.remove('selected'));
      this.classList.add('selected');
      selectedFace = this.dataset.face;
      sendBtn.disabled = false;

      this.style.transform = 'translateY(-4px) scale(1.05)';
      setTimeout(() => {
        this.style.transform = 'translateY(-4px) scale(1)';
      }, 200);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  sendBtn.addEventListener('click', async function () {
    if (!selectedFace) return;
    this.disabled = true;
    this.innerHTML = '<span class="btn-icon">📡</span> Sending…';

    const progress = $('#send-progress');
    const bar = $('#send-progress-bar');
    progress.classList.add('show');

    await wait(200);
    bar.style.width = '30%';
    await wait(600);
    bar.style.width = '70%';
    await wait(800);
    bar.style.width = '100%';
    await wait(500);

    progress.classList.remove('show');
    this.innerHTML = '<span class="btn-icon">✅</span> Sent!';
    this.style.background = 'linear-gradient(135deg, #22D1C3 0%, #19A89D 100%)';

    celebrateCenter(60);
    await wait(600);
    $('#face-success').classList.add('show');
  });

  // Face picker now goes to lessons
  $('#btn-continue-faces').addEventListener('click', function () {
    goTo('screen-lessons');
    // Scroll to top of lessons
    setTimeout(() => {
      const lessonsScreen = $('#screen-lessons');
      if (lessonsScreen) lessonsScreen.scrollTop = 0;
    }, 300);
  });

  // ── PYTHON MINI-INTERPRETER ─────────────────────
  function runPython(code) {
    const output = [];
    const vars = {};
    const robotActions = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;
      // Skip imports
      if (line.startsWith('from ') || line.startsWith('import ')) continue;

      try {
        // Robot object creation: my_dog = Dog("name")
        const dogMatch = line.match(/^(\w+)\s*=\s*Dog\((.+)\)$/);
        if (dogMatch) {
          const varName = dogMatch[1];
          const arg = evalExpr(dogMatch[2], vars);
          vars[varName] = { __type: 'Dog', name: arg };
          robotActions.push(`🤖 Created robot "${arg}"`);
          continue;
        }

        // Robot method calls: my_dog.action(...)
        const robotCall = line.match(/^(\w+)\.(set_face|say|stand|wave|sit|dance|nod)\((.*)?\)$/);
        if (robotCall) {
          const objName = robotCall[1];
          const method = robotCall[2];
          const argRaw = robotCall[3] || '';
          const arg = argRaw ? evalExpr(argRaw, vars) : '';
          
          if (!vars[objName]) throw new PythonError(`NameError: name '${objName}' is not defined`);
          
          const icons = { set_face: '😊', say: '🔊', stand: '🦿', wave: '🐾', sit: '🦿', dance: '💃', nod: '😊' };
          robotActions.push(`${icons[method] || '🤖'} Robot.${method}(${argRaw ? '"' + arg + '"' : ''})`);
          continue;
        }

        // Variable assignment: x = value
        const assignMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
        if (assignMatch && !line.startsWith('print')) {
          const varName = assignMatch[1];
          const val = evalExpr(assignMatch[2], vars);
          vars[varName] = val;
          continue;
        }

        // print() call
        const printMatch = line.match(/^print\((.+)\)$/);
        if (printMatch) {
          const val = evalExpr(printMatch[1], vars);
          output.push(String(val));
          continue;
        }

        // print without parens
        if (line.startsWith('print ') && !line.startsWith('print(')) {
          throw new PythonError(`SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...)?`);
        }

        // Unclosed string
        if ((line.match(/"/g) || []).length % 2 !== 0 || (line.match(/'/g) || []).length % 2 !== 0) {
          throw new PythonError(`SyntaxError: EOL while scanning string literal`);
        }

      } catch (e) {
        if (e instanceof PythonError) {
          output.push(e.message);
          return { output, robotActions, error: true };
        }
        output.push(`Error on line ${i + 1}: ${e.message}`);
        return { output, robotActions, error: true };
      }
    }

    return { output, robotActions, error: false };
  }

  class PythonError extends Error {
    constructor(msg) { super(msg); this.name = 'PythonError'; }
  }

  function evalExpr(expr, vars) {
    expr = expr.trim();

    // f-string: f"...{expr}..."
    const fMatch = expr.match(/^f(["'])(.*)(\1)$/);
    if (fMatch) {
      let content = fMatch[2];
      content = content.replace(/\{([^}]+)\}/g, (_, inner) => {
        // Format spec like :.1f
        const formatMatch = inner.match(/^(.+):(.+)$/);
        if (formatMatch) {
          const val = evalExpr(formatMatch[1].trim(), vars);
          const spec = formatMatch[2];
          if (spec.endsWith('f')) {
            const decimals = parseInt(spec.replace('.', '').replace('f', '')) || 0;
            return Number(val).toFixed(decimals);
          }
          return val;
        }
        return String(evalExpr(inner.trim(), vars));
      });
      return content;
    }

    // String literal
    const strMatch = expr.match(/^(["'])(.*)(\1)$/);
    if (strMatch) return strMatch[2];

    // Unclosed string
    if ((expr.startsWith('"') && !expr.endsWith('"')) || (expr.startsWith("'") && !expr.endsWith("'"))) {
      throw new PythonError('SyntaxError: EOL while scanning string literal');
    }

    // type() call
    const typeMatch = expr.match(/^type\((.+)\)$/);
    if (typeMatch) {
      const val = evalExpr(typeMatch[1], vars);
      if (typeof val === 'string') return "<class 'str'>";
      if (typeof val === 'number' && Number.isInteger(val)) return "<class 'int'>";
      if (typeof val === 'number') return "<class 'float'>";
      if (typeof val === 'boolean') return "<class 'bool'>";
      return "<class 'object'>";
    }

    // str() call
    const strCallMatch = expr.match(/^str\((.+)\)$/);
    if (strCallMatch) return String(evalExpr(strCallMatch[1], vars));

    // Boolean literals
    if (expr === 'True') return true;
    if (expr === 'False') return false;

    // Number
    if (!isNaN(expr) && expr !== '') return Number(expr);

    // String concatenation and math
    if (expr.includes('+')) {
      const parts = splitOnOperator(expr, '+');
      if (parts) {
        const left = evalExpr(parts[0], vars);
        const right = evalExpr(parts[1], vars);
        if (typeof left === 'string' && typeof right !== 'string') {
          throw new PythonError(`TypeError: can only concatenate str (not "${typeof right === 'number' ? 'int' : typeof right}") to str`);
        }
        return left + right;
      }
    }

    // Division
    if (expr.includes('/')) {
      const parts = splitOnOperator(expr, '/');
      if (parts) {
        const left = evalExpr(parts[0], vars);
        const right = evalExpr(parts[1], vars);
        return left / right;
      }
    }

    // Multiplication
    if (expr.includes('*')) {
      const parts = splitOnOperator(expr, '*');
      if (parts) return evalExpr(parts[0], vars) * evalExpr(parts[1], vars);
    }

    // Subtraction
    if (expr.includes('-') && !expr.startsWith('-')) {
      const parts = splitOnOperator(expr, '-');
      if (parts) return evalExpr(parts[0], vars) - evalExpr(parts[1], vars);
    }

    // Comparison >
    if (expr.includes('>')) {
      const parts = splitOnOperator(expr, '>');
      if (parts) return evalExpr(parts[0], vars) > evalExpr(parts[1], vars);
    }

    // Comparison <
    if (expr.includes('<')) {
      const parts = splitOnOperator(expr, '<');
      if (parts) return evalExpr(parts[0], vars) < evalExpr(parts[1], vars);
    }

    // Variable lookup
    if (/^\w+$/.test(expr)) {
      if (expr in vars) return vars[expr];
      throw new PythonError(`NameError: name '${expr}' is not defined`);
    }

    return expr;
  }

  function splitOnOperator(expr, op) {
    // Split on operator but not inside strings or parens
    let depth = 0;
    let inStr = false;
    let strChar = '';
    for (let i = expr.length - 1; i >= 1; i--) {
      const ch = expr[i];
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; continue; }
      if (inStr && ch === strChar) { inStr = false; continue; }
      if (inStr) continue;
      if (ch === ')') depth++;
      if (ch === '(') depth--;
      if (depth === 0 && ch === op) {
        return [expr.slice(0, i), expr.slice(i + 1)];
      }
    }
    return null;
  }

  // ── RUN BUTTONS ──────────────────────────────────
  document.addEventListener('click', function (e) {
    // Run button
    if (e.target.classList.contains('btn-run') || e.target.closest('.btn-run')) {
      const btn = e.target.closest('.btn-run') || e.target;
      const editorId = btn.dataset.editor;
      const editor = $(`#editor-${editorId}`);
      const outputEl = $(`#output-${editorId}`);
      if (!editor || !outputEl) return;

      const code = editor.value;
      const result = runPython(code);

      let html = '';
      result.robotActions.forEach(a => {
        html += `<div class="robot-action">${a}</div>`;
      });
      result.output.forEach(line => {
        if (result.error && line.includes('Error')) {
          html += `<div class="error-line">${escHtml(line)}</div>`;
        } else {
          html += `<div>${escHtml(line)}</div>`;
        }
      });

      if (!result.output.length && !result.robotActions.length) {
        html = '<div style="color:#686878;">(no output)</div>';
      }

      outputEl.innerHTML = html;
      outputEl.classList.add('visible');

      // Scroll output into view
      setTimeout(() => outputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }

    // Hint toggle
    if (e.target.classList.contains('hint-toggle')) {
      const hintText = e.target.parentElement.querySelector('.hint-text');
      if (hintText) hintText.classList.toggle('show');
    }

    // Lesson next button
    if (e.target.classList.contains('lesson-next-btn') || e.target.closest('.lesson-next-btn')) {
      const btn = e.target.closest('.lesson-next-btn') || e.target;
      const next = btn.dataset.next;

      if (next === 'done') {
        celebrateCenter(80);
        setTimeout(() => {
          goTo('screen-debrief');
          setTimeout(initDebriefReveals, 300);
        }, 500);
        updateLessonProgress(8);
        return;
      }

      const nextNum = parseInt(next);
      const currentBlock = btn.closest('.lesson-block');
      const nextBlock = $(`#lesson-${nextNum}`);

      if (currentBlock) currentBlock.style.display = 'none';
      if (nextBlock) {
        nextBlock.style.display = '';
        nextBlock.style.animation = 'none';
        // Force reflow
        nextBlock.offsetHeight;
        nextBlock.style.animation = 'fade-in-up 0.6s var(--ease) both';
      }

      // Scroll to top of lessons screen
      const lessonsScreen = $('#screen-lessons');
      if (lessonsScreen) lessonsScreen.scrollTop = 0;

      updateLessonProgress(nextNum - 1);
      celebrateFromElement(btn, 25);
    }
  });

  function updateLessonProgress(completed) {
    const fill = $('#lessons-progress-fill');
    const text = $('#lessons-progress-text');
    if (fill) fill.style.width = `${(completed / 8) * 100}%`;
    if (text) text.textContent = `${completed} / 8`;
  }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── LABEL EXERCISE (Lesson 6) ───────────────────
  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('label-select')) {
      const select = e.target;
      const answer = select.dataset.answer;
      const feedback = select.parentElement.querySelector('.label-feedback');
      if (select.value === answer) {
        feedback.textContent = '✅';
        feedback.className = 'label-feedback correct';
        select.style.borderColor = '#16a34a';
      } else {
        feedback.textContent = '✗';
        feedback.className = 'label-feedback wrong';
        select.style.borderColor = 'var(--coral)';
      }
    }
  });

  // ── SCREEN 6 (now 7): Mission Debrief — Scroll Reveals ───
  let debriefObserver = null;

  function initDebriefReveals() {
    const debriefScreen = $('#screen-debrief');
    const sections = debriefScreen.querySelectorAll('[data-reveal]');

    // Reset all reveals
    sections.forEach((s) => s.classList.remove('revealed'));

    // Kill old observer
    if (debriefObserver) debriefObserver.disconnect();

    // Create intersection observer rooted in the scrollable screen
    debriefObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        root: debriefScreen,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15,
      }
    );

    sections.forEach((s) => debriefObserver.observe(s));
  }

  // Debrief → Completion
  $('#btn-continue-debrief').addEventListener('click', function () {
    celebrateFromElement(this, 40);
    setTimeout(() => {
      goTo('screen-complete');
      setTimeout(() => {
        const ring = $('#ring-fill');
        ring.style.strokeDashoffset = 408 - 408 * 1.0;
        celebrateCenter(80);
      }, 400);
    }, 400);
  });

  // ── SCREEN 8: Completion ─────────────────────────
  $('#btn-restart').addEventListener('click', function () {
    connecting = false;
    waved = false;
    selectedFace = null;

    // Reset connection wizard
    $$('.wizard-step').forEach((s, i) => {
      s.style.display = i === 0 ? 'flex' : 'none';
      s.classList.toggle('active', i === 0);
    });

    // Reset wave
    const waveBtn = $('#btn-wave');
    waveBtn.style.background = '';
    waveBtn.innerHTML = '<span class="btn-icon">🐾</span>Wave';
    $('#wave-success').classList.remove('show');
    const waveRobot = $('#wave-robot');
    waveRobot.classList.remove('robot-waving', 'robot-happy');

    // Reset faces
    faceCards.forEach((c) => c.classList.remove('selected'));
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="btn-icon">📤</span> Send to Robot';
    sendBtn.style.background = '';
    $('#send-progress-bar').style.width = '0%';
    $('#face-success').classList.remove('show');

    // Reset lessons
    $$('.lesson-block').forEach((block, i) => {
      block.style.display = i === 0 ? '' : 'none';
    });
    $$('.output-console').forEach(o => { o.classList.remove('visible'); o.innerHTML = ''; });
    $$('.hint-text').forEach(h => h.classList.remove('show'));
    $$('.label-select').forEach(s => { s.value = ''; s.style.borderColor = ''; });
    $$('.label-feedback').forEach(f => { f.textContent = ''; f.className = 'label-feedback'; });
    updateLessonProgress(0);

    // Reset debrief reveals
    const debriefSections = $$('#screen-debrief [data-reveal]');
    debriefSections.forEach((s) => s.classList.remove('revealed'));
    if (debriefObserver) debriefObserver.disconnect();

    // Reset completion ring
    $('#ring-fill').style.strokeDashoffset = '408';

    goTo('screen-intro');
    if (introVideo) {
      introVideo.currentTime = 0;
      introVideo.play();
    }
  });

  // ── Init ─────────────────────────────────────────
  spawnFloatingDots();
  // initLoading(); // Now called after Intro Screen

  // ── Cursor Spigot Logic ─────────────────────────
  const btnToggleSpigot = document.getElementById('btn-toggle-spigot');
  const spigotCanvas = document.getElementById('spigot-canvas');
  let spigotEnabled = true; // ON by default

  if (btnToggleSpigot) {
    // Set initial state
    document.body.style.cursor = 'none';
    btnToggleSpigot.innerHTML = '💧 Spigot: ON';
    btnToggleSpigot.style.background = 'var(--teal-light)';

    btnToggleSpigot.addEventListener('click', (e) => {
      // Prevent the spigot toggle itself from spraying immediately on this click if we want,
      // but it's fine since we handle pointerdown globally.
      spigotEnabled = !spigotEnabled;
      if (spigotEnabled) {
        document.body.style.cursor = 'none';
        // Add a global class to ensure all elements hide their cursor if needed
        document.documentElement.classList.add('hide-cursor');
        btnToggleSpigot.innerHTML = '💧 Spigot: ON';
        btnToggleSpigot.style.background = 'var(--teal-light)';
      } else {
        document.body.style.cursor = '';
        document.documentElement.classList.remove('hide-cursor');
        btnToggleSpigot.innerHTML = '💧 Spigot: OFF';
        btnToggleSpigot.style.background = 'var(--bg)';
        // Clear canvas instantly when disabled
        const ctx = spigotCanvas.getContext('2d');
        ctx.clearRect(0, 0, spigotCanvas.width, spigotCanvas.height);
      }
    });

    // Also add the style to hide all cursors when enabled
    const style = document.createElement('style');
    style.textContent = `
      html.hide-cursor, html.hide-cursor * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    document.documentElement.classList.add('hide-cursor');

    (function () {
      const CURSOR_SIZE = 32;
      const PARTICLE_SCALE = 0.7;
      const GRAVITY = 980;
      const GROUND_BOUNCE = 0.35;
      const WALL_BOUNCE = 0.5;
      const FRICTION = 0.92;
      const AIR_DRAG = 0.998;
      const SPRAY_SPEED_MIN = 180;
      const SPRAY_SPEED_MAX = 520;
      const SPRAY_SPREAD = 0.9;
      const SPAWN_RATE = 3;
      const BURST_COUNT = 14;
      const MAX_PARTICLES = 250;
      const SETTLE_THRESHOLD = 25;
      const FADE_TIME = 5;

      const canvas = spigotCanvas;
      const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

      let W, H, groundY;
      let spigotOn = false;
      let mouseX, mouseY;
      let mouseActive = false;
      let particles = [];
      let sprite, spriteSize;

      function resize() {
          W = canvas.width = innerWidth;
          H = canvas.height = innerHeight;
          groundY = H - 6;
      }
      resize();
      addEventListener('resize', resize);
      addEventListener('orientationchange', () => setTimeout(resize, 100));

      function buildSprite() {
          const s = CURSOR_SIZE;
          const off = document.createElement('canvas');
          off.width = s;
          off.height = s;
          const t = off.getContext('2d');
          const scale = s / 32;

          t.save();
          t.scale(scale, scale);

          function rr(x, y, w, h, r) {
              t.beginPath();
              t.moveTo(x + r, y);
              t.lineTo(x + w - r, y);
              t.quadraticCurveTo(x + w, y, x + w, y + r);
              t.lineTo(x + w, y + h - r);
              t.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
              t.lineTo(x + r, y + h);
              t.quadraticCurveTo(x, y + h, x, y + h - r);
              t.lineTo(x, y + r);
              t.quadraticCurveTo(x, y, x + r, y);
              t.closePath();
          }

          t.shadowColor = 'rgba(255, 220, 0, 0.9)';
          t.shadowBlur = 6;

          rr(10, 11, 16, 10, 3);
          t.fillStyle = '#ffd51c';
          t.fill();
          t.lineWidth = 1.2;
          t.strokeStyle = '#fff6a8';
          t.stroke();

          rr(5, 9, 14, 12, 3);
          t.fillStyle = '#ffd51c';
          t.fill();
          t.stroke();

          t.shadowBlur = 0;

          rr(7, 11, 10, 7, 1.5);
          t.fillStyle = '#151515';
          t.fill();

          t.beginPath();
          t.arc(10, 14.5, 1, 0, Math.PI * 2);
          t.arc(14, 14.5, 1, 0, Math.PI * 2);
          t.fillStyle = '#8eeeff';
          t.fill();

          t.beginPath();
          t.arc(12, 9.7, 0.7, 0, Math.PI * 2);
          t.fillStyle = '#111';
          t.fill();

          t.lineWidth = 3.2;
          t.lineCap = 'round';
          t.strokeStyle = '#f5bf00';
          t.beginPath();
          t.moveTo(8, 20);
          t.lineTo(7, 27);
          t.moveTo(15, 21);
          t.lineTo(15, 28);
          t.moveTo(22, 20);
          t.lineTo(23, 27);
          t.moveTo(26, 19);
          t.lineTo(28, 25);
          t.stroke();

          t.lineWidth = 3.5;
          t.strokeStyle = '#111';
          t.beginPath();
          t.moveTo(6.5, 27);
          t.lineTo(8.5, 27);
          t.moveTo(14, 28);
          t.lineTo(16, 28);
          t.moveTo(22, 27);
          t.lineTo(24, 27);
          t.moveTo(27, 25);
          t.lineTo(29, 25);
          t.stroke();

          t.beginPath();
          t.arc(19, 20, 1, 0, Math.PI * 2);
          t.arc(25, 19, 1, 0, Math.PI * 2);
          t.fillStyle = '#d99f00';
          t.fill();

          t.beginPath();
          t.moveTo(11, 12);
          t.lineTo(24, 12);
          t.strokeStyle = 'rgba(255,255,255,0.35)';
          t.lineWidth = 1;
          t.stroke();

          t.restore();
          sprite = off;
          spriteSize = s;
      }
      buildSprite();

      function createParticle(x, y, vx, vy, sc) {
          return {
              x, y, vx, vy,
              rot: Math.random() * 6.283,
              av: (Math.random() - 0.5) * 10,
              sc: sc || PARTICLE_SCALE + Math.random() * 0.15,
              settled: false,
              time: 0,
              op: 1
          };
      }

      function spray(count) {
          const len = particles.length;
          const max = MAX_PARTICLES;
          for (let i = 0; i < count && len + i < max; i++) {
              const a = -1.57 + (Math.random() - 0.5) * SPRAY_SPREAD * 2;
              const spd = SPRAY_SPEED_MIN + Math.random() * (SPRAY_SPEED_MAX - SPRAY_SPEED_MIN);
              particles.push(createParticle(mouseX, mouseY, Math.cos(a) * spd, Math.sin(a) * spd));
          }
      }

      function spraySteady() {
          if (particles.length >= MAX_PARTICLES) return;
          const n = SPAWN_RATE + (Math.random() < 0.6 ? 1 : 0);
          for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
              const a = -1.57 + (Math.random() - 0.5) * SPRAY_SPREAD * 2;
              const spd = SPRAY_SPEED_MIN * 0.75 + Math.random() * (SPRAY_SPEED_MAX - SPRAY_SPEED_MIN * 0.75);
              particles.push(createParticle(mouseX, mouseY, Math.cos(a) * spd, Math.sin(a) * spd));
          }
      }

      function pos(e) {
          const t = e.touches;
          if (t && t.length) return { x: t[0].clientX, y: t[0].clientY };
          if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
          return { x: e.clientX, y: e.clientY };
      }

      window.addEventListener('pointerdown', e => {
          // DO NOT preventDefault so buttons can still be clicked!
          const p = pos(e);
          mouseX = p.x;
          mouseY = p.y;
          mouseActive = true;
          spigotOn = true;
          spray(BURST_COUNT);
      });

      window.addEventListener('pointermove', e => {
          const p = pos(e);
          mouseX = p.x;
          mouseY = p.y;
          mouseActive = true;
      });

      window.addEventListener('pointerup', e => {
          spigotOn = false;
          spray(3);
      });

      window.addEventListener('pointerleave', () => {
          mouseActive = false;
          spigotOn = false;
      });

      window.addEventListener('pointerenter', e => {
          const p = pos(e);
          if (p) { mouseX = p.x; mouseY = p.y; mouseActive = true; }
      });

      window.addEventListener('pointercancel', () => {
          spigotOn = false;
      });

      function update(dt) {
          if (!spigotEnabled && particles.length === 0) return; // Save CPU when completely disabled and clear

          const d = Math.min(dt, 0.1);
          const g = GRAVITY * d;
          const ad = AIR_DRAG;
          const hs = spriteSize * 0.5;

          if (spigotOn && mouseActive && spigotEnabled) spraySteady();

          for (let i = particles.length - 1; i >= 0; i--) {
              const p = particles[i];

              if (p.settled) {
                  p.time += d;
                  p.op = 1 - p.time / FADE_TIME;
                  p.y += d * 3;
                  p.rot += p.av * 0.05 * d;
                  if (p.time >= FADE_TIME || p.op <= 0.02) {
                      particles[i] = particles[particles.length - 1];
                      particles.pop();
                  }
                  continue;
              }

              p.vy += g;
              p.vx *= ad;
              p.vy *= ad;
              p.x += p.vx * d;
              p.y += p.vy * d;
              p.rot += p.av * d;

              const h = hs * p.sc;
              const gy = groundY - h;

              if (p.y >= gy) {
                  p.y = gy;
                  if (Math.abs(p.vy) > SETTLE_THRESHOLD) {
                      p.vy = -Math.abs(p.vy) * GROUND_BOUNCE;
                      p.vx *= FRICTION;
                      p.av *= 0.6;
                      p.vx += (Math.random() - 0.5) * 35;
                  } else {
                      p.settled = true;
                      p.time = 0;
                      p.vy = 0;
                      p.vx *= 0.15;
                      p.av *= 0.08;
                  }
              }

              if (p.x - h < 0) { p.x = h; p.vx = Math.abs(p.vx) * WALL_BOUNCE; }
              if (p.x + h > W) { p.x = W - h; p.vx = -Math.abs(p.vx) * WALL_BOUNCE; }
              if (p.y - h < 0) { p.y = h; p.vy = Math.abs(p.vy) * WALL_BOUNCE * 0.7; }
          }

          while (particles.length > MAX_PARTICLES) {
              let idx = -1, oldest = -1;
              for (let i = 0; i < particles.length; i++) {
                  if (particles[i].settled && particles[i].time > oldest) { oldest = particles[i].time; idx = i; }
              }
              if (idx >= 0) { particles[idx] = particles[particles.length - 1]; particles.pop(); } 
              else { particles.pop(); }
          }
      }

      function render() {
          if (!spigotEnabled && particles.length === 0) return;
          ctx.clearRect(0, 0, W, H);

          if (particles.length > 0) {
              const grad = ctx.createLinearGradient(0, groundY - 15, 0, groundY + 15);
              grad.addColorStop(0, 'rgba(255,255,255,0)');
              grad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
              grad.addColorStop(1, 'rgba(255,255,255,0)');
              ctx.fillStyle = grad;
              ctx.fillRect(0, groundY - 15, W, 30);
          }

          for (let i = 0; i < particles.length; i++) {
              const p = particles[i];
              const sz = spriteSize * p.sc;
              const hsz = sz * 0.5;
              ctx.save();
              ctx.globalAlpha = p.op;
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot);
              ctx.drawImage(sprite, -hsz, -hsz, sz, sz);
              ctx.restore();
          }

          if (mouseActive && spigotEnabled) {
              const pulse = spigotOn ? 1 + Math.sin(performance.now() * 0.008) * 0.05 : 1;
              const sz = spriteSize * pulse;
              const hsz = sz * 0.5;
              ctx.save();
              ctx.translate(mouseX, mouseY);
              ctx.shadowColor = spigotOn ? 'rgba(255,200,140,0.7)' : 'rgba(255,255,255,0.25)';
              ctx.shadowBlur = spigotOn ? 16 : 6;
              ctx.drawImage(sprite, -hsz, -hsz, sz, sz);
              ctx.restore();
          }
      }

      let last = performance.now();
      function loop(now) {
          const dt = (now - last) / 1000;
          last = now;
          update(dt);
          render();
          requestAnimationFrame(loop);
      }

      mouseX = W / 2;
      mouseY = H / 2;
      requestAnimationFrame(loop);
      addEventListener('blur', () => { spigotOn = false; });
    })();
  }
})();

