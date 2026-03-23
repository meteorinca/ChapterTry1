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

  // ── SCREEN 1: Loading ────────────────────────────
  async function initLoading() {
    await wait(2800);
    const wrapper = $('#start-btn-wrapper');
    wrapper.style.opacity = '1';
    wrapper.style.animation = 'fade-in 0.8s var(--ease) forwards';
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
  let connecting = false;

  $('#btn-connect').addEventListener('click', async function () {
    if (connecting) return;
    connecting = true;
    this.style.display = 'none';

    const steps = $$('.connect-step');
    const progressBar = $('#connect-progress-bar');

    // Step 1: USB
    steps[0].classList.add('active');
    progressBar.style.width = '25%';
    await wait(1200);
    steps[0].classList.remove('active');
    steps[0].classList.add('done');
    steps[0].querySelector('.step-icon').textContent = '✅';

    // Step 2: Power
    steps[1].classList.add('active');
    progressBar.style.width = '50%';
    await wait(1200);
    steps[1].classList.remove('active');
    steps[1].classList.add('done');
    steps[1].querySelector('.step-icon').textContent = '✅';

    // Step 3: Searching
    steps[2].classList.add('active');
    progressBar.style.width = '75%';
    await wait(2000);
    steps[2].classList.remove('active');
    steps[2].classList.add('done');
    steps[2].querySelector('.step-icon').textContent = '✅';
    steps[2].querySelector('.step-text').textContent = 'Robot found!';

    // Step 4: Connected
    steps[3].classList.add('active');
    steps[3].classList.add('done');
    progressBar.style.width = '100%';
    await wait(600);

    celebrateCenter(50);

    await wait(600);
    $('#connect-success').classList.add('show');
  });

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
    $$('.connect-step').forEach((s) => {
      s.classList.remove('active', 'done');
    });
    $('#step-1 .step-icon').textContent = '🔌';
    $('#step-2 .step-icon').textContent = '⚡';
    $('#step-3 .step-icon').textContent = '📡';
    $('#step-3 .step-text').textContent = 'Searching for your robot…';
    $('#step-4 .step-icon').textContent = '✅';
    $('#connect-progress-bar').style.width = '0%';
    $('#connect-success').classList.remove('show');
    const connectBtn = $('#btn-connect');
    connectBtn.style.display = '';

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

    goTo('screen-loading');
    setTimeout(initLoading, 100);
  });

  // ── Init ─────────────────────────────────────────
  spawnFloatingDots();
  initLoading();
})();

