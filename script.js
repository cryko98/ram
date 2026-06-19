/* ============ RAMCOIN — interactions + 3D RAM stick ============ */

/* ---------- Copy contract address ---------- */
(function () {
  const btn = document.getElementById("copy-btn");
  const ca = "G5grLASvz1xzgdh1c1GKy2q55mfuDDXhMQoXnDxWpump";
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(ca);
    } catch (e) {
      const t = document.createElement("textarea");
      t.value = ca; document.body.appendChild(t); t.select();
      document.execCommand("copy"); t.remove();
    }
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1600);
  });
})();

/* ---------- Navbar shadow on scroll ---------- */
(function () {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---------- Section reveal on scroll ---------- */
(function () {
  const sections = document.querySelectorAll(".section");
  if (!("IntersectionObserver" in window)) {
    sections.forEach((s) => s.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  sections.forEach((s) => io.observe(s));
})();

/* ---------- Animated counters ---------- */
(function () {
  const nums = document.querySelectorAll(".mini-num");
  if (!nums.length) return;
  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(0);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.6 });
  nums.forEach((n) => io.observe(n));
})();

/* ---------- Card 3D tilt on hover (high-tech feel) ---------- */
(function () {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const cards = document.querySelectorAll(".news-card, .tok-card, .step");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
})();

/* ============ 3D RAM MODULE (Three.js) ============ */
(function () {
  const canvas = document.getElementById("ram-canvas");
  const fallback = document.getElementById("canvas-fallback");
  if (!canvas || typeof THREE === "undefined") {
    if (fallback) fallback.style.display = "grid";
    return;
  }

  const stage = canvas.parentElement;
  let W = stage.clientWidth, H = stage.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 100);
  camera.position.set(0, 0.2, 9.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
  if (THREE.ACESFilmicToneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; }

  // ----- Lights (rich colored rim lighting in place of a costly env map) -----
  scene.add(new THREE.AmbientLight(0x44569c, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(5, 6, 8); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.5); fill.position.set(-4, 2, 6); scene.add(fill);
  const cyan = new THREE.PointLight(0x00e5ff, 2.4, 40); cyan.position.set(-7, 3, 6); scene.add(cyan);
  const violet = new THREE.PointLight(0x7a5cff, 2.2, 40); violet.position.set(7, -2, 5); scene.add(violet);
  const magenta = new THREE.PointLight(0xff3df0, 1.5, 40); magenta.position.set(0, -6, -3); scene.add(magenta);

  // ----- Materials (moderate metalness reads well without an env map) -----
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0a7a4d, metalness: 0.25, roughness: 0.6 });
  const spreadMat = new THREE.MeshStandardMaterial({ color: 0x232f54, metalness: 0.55, roughness: 0.38 });
  const finMat = new THREE.MeshStandardMaterial({ color: 0x37467e, metalness: 0.6, roughness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x080b16, metalness: 0.3, roughness: 0.7 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffcf5c, metalness: 0.85, roughness: 0.3, emissive: 0x5a4200, emissiveIntensity: 0.35 });

  // ----- Build the module -----
  const ram = new THREE.Group();

  // PCB board
  const board = new THREE.Mesh(new THREE.BoxGeometry(6.7, 2.0, 0.14), pcbMat);
  ram.add(board);

  // Front + back heatspreader plates
  function spreader(z) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.74, 0.07), spreadMat);
    plate.position.set(0, 0.06, z);
    ram.add(plate);
    // decorative diagonal inset lines
    for (let i = -2; i <= 2; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.02), darkMat);
      line.position.set(i * 1.0 + 0.4, 0.06, z + 0.04 * Math.sign(z || 1));
      line.rotation.z = 0.32;
      ram.add(line);
    }
  }
  spreader(0.12);
  spreader(-0.12);

  // Heatsink comb fins along the crown
  const finGeo = new THREE.BoxGeometry(0.10, 0.46, 0.40);
  for (let i = 0; i < 30; i++) {
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(-2.9 + i * 0.20, 1.06, 0);
    ram.add(fin);
  }

  // Glowing RGB diffuser strip on the very top
  const diffuserMat = new THREE.MeshStandardMaterial({ color: 0x05060c, emissive: 0x00e5ff, emissiveIntensity: 1.4, metalness: 0.2, roughness: 0.4 });
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.20, 0.46), diffuserMat);
  diffuser.position.set(0, 1.34, 0);
  ram.add(diffuser);

  // Activity LEDs on the front spreader
  const leds = [];
  for (let i = 0; i < 3; i++) {
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x05060c, emissive: 0x2bff9b, emissiveIntensity: 1.5 })
    );
    led.position.set(2.0 + i * 0.22, -0.6, 0.17);
    leds.push(led); ram.add(led);
  }

  // $RAM glowing label
  function makeLabelTexture() {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = "900 88px Orbitron, Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, "#00e5ff"); grad.addColorStop(0.5, "#ffffff"); grad.addColorStop(1, "#ff3df0");
    ctx.fillStyle = grad; ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 26;
    ctx.fillText("$RAM", 256, 72);
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex;
  }
  const labelTex = makeLabelTexture();
  const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, transparent: true, emissive: 0x00e5ff, emissiveIntensity: 0.7, metalness: 0.2, roughness: 0.5 });
  const labelF = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.82), labelMat);
  labelF.position.set(0, 0.05, 0.17); ram.add(labelF);
  const labelB = labelF.clone(); labelB.position.z = -0.17; labelB.rotation.y = Math.PI; ram.add(labelB);

  // Notch + gold contact pins along the bottom edge
  const notch = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.20), darkMat);
  notch.position.set(-0.8, -1.0, 0); ram.add(notch);
  const pinGeo = new THREE.BoxGeometry(0.066, 0.32, 0.02);
  for (let i = 0; i < 48; i++) {
    const x = -3.18 + i * 0.135;
    if (Math.abs(x + 0.8) < 0.3) continue;
    const pinF = new THREE.Mesh(pinGeo, goldMat); pinF.position.set(x, -0.9, 0.08); ram.add(pinF);
    const pinB = new THREE.Mesh(pinGeo, goldMat); pinB.position.set(x, -0.9, -0.08); ram.add(pinB);
  }

  ram.rotation.x = 0.06;
  scene.add(ram);

  // ----- Floating tech particles -----
  const pCount = 90;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.sin(i * 12.9) * 43758.5 % 1) * 14 - 7;
    pPos[i * 3 + 1] = (Math.sin(i * 78.2) * 12543.1 % 1) * 12 - 6;
    pPos[i * 3 + 2] = (Math.sin(i * 4.7) * 9812.3 % 1) * 8 - 5;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x00e5ff, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // soft back glow ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.7, 0.45, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x7a5cff, transparent: true, opacity: 0.10 })
  );
  ring.position.z = -2.4; scene.add(ring);

  // ----- Interaction: drag to spin + auto rotate -----
  let autoRot = true, velY = 0.005, dragging = false, lastX = 0, lastY = 0, targetX = 0.06;
  const onDown = (x, y) => { dragging = true; autoRot = false; lastX = x; lastY = y; };
  const onMove = (x, y) => {
    if (!dragging) return;
    const dx = x - lastX, dy = y - lastY;
    ram.rotation.y += dx * 0.01;
    targetX = Math.max(-0.8, Math.min(0.8, targetX + dy * 0.006));
    velY = dx * 0.0006; lastX = x; lastY = y;
  };
  const onUp = () => { dragging = false; setTimeout(() => { autoRot = true; }, 1400); };
  canvas.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  canvas.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  canvas.addEventListener("touchend", onUp);

  // ----- Resize -----
  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  }
  window.addEventListener("resize", resize);

  // ----- HSL helper for the RGB diffuser -----
  const diffColor = new THREE.Color();

  // ----- Animate -----
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;
    if (autoRot) ram.rotation.y += 0.005;
    else { ram.rotation.y += velY; velY *= 0.95; }
    ram.rotation.x += (targetX - ram.rotation.x) * 0.08;
    ram.position.y = Math.sin(t) * 0.12;

    // RGB diffuser cycles hue
    const hue = (t * 0.06) % 1;
    diffColor.setHSL(hue, 1.0, 0.55);
    diffuserMat.emissive.copy(diffColor);
    diffuserMat.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.35;

    // LEDs blink in sequence
    leds.forEach((led, i) => {
      led.material.emissiveIntensity = 0.6 + Math.max(0, Math.sin(t * 4 - i * 1.2)) * 1.8;
    });

    particles.rotation.y += 0.0006;
    particles.rotation.x += 0.0003;
    ring.rotation.z += 0.002;
    cyan.intensity = 2.0 + Math.sin(t * 1.5) * 0.5;
    violet.intensity = 1.8 + Math.cos(t * 1.2) * 0.5;
    renderer.render(scene, camera);
  }
  resize();
  animate();
})();
