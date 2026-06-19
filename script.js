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

/* ============ 3D RAM STICK (Three.js) ============ */
(function () {
  const canvas = document.getElementById("ram-canvas");
  const fallback = document.getElementById("canvas-fallback");
  if (!canvas || typeof THREE === "undefined") {
    if (fallback) fallback.style.display = "grid";
    return;
  }

  const frame = canvas.parentElement;
  let W = frame.clientWidth, H = frame.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
  camera.position.set(0, 0.3, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ----- Lights -----
  scene.add(new THREE.AmbientLight(0x4060ff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(5, 6, 8); scene.add(key);
  const cyan = new THREE.PointLight(0x00e5ff, 2.2, 30); cyan.position.set(-6, 3, 5); scene.add(cyan);
  const violet = new THREE.PointLight(0x7a5cff, 2.0, 30); violet.position.set(6, -3, 4); scene.add(violet);
  const magenta = new THREE.PointLight(0xff3df0, 1.4, 30); magenta.position.set(0, -5, -4); scene.add(magenta);

  // ----- Build the RAM stick group -----
  const ram = new THREE.Group();

  // PCB green board
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0c8f5a, metalness: 0.35, roughness: 0.45 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.1, 0.16), pcbMat);
  ram.add(board);

  // Notch (key) cut illusion — small dark block at bottom
  const notch = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.5, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x05060c, metalness: 0.2, roughness: 0.8 })
  );
  notch.position.set(-0.7, -1.05, 0);
  ram.add(notch);

  // Heatsink-style top bar
  const heatMat = new THREE.MeshStandardMaterial({ color: 0x16203a, metalness: 0.8, roughness: 0.25 });
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.42, 0.26), heatMat);
  topBar.position.set(0, 1.05, 0);
  ram.add(topBar);

  // Memory chips (black ICs) — two rows
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x0a0d16, metalness: 0.5, roughness: 0.4 });
  const chipGeo = new THREE.BoxGeometry(0.72, 0.62, 0.12);
  const cols = 8;
  for (let i = 0; i < cols; i++) {
    const x = -2.62 + i * 0.75;
    [0.42, -0.42].forEach((y) => {
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(x, y, 0.14);
      ram.add(chip);
      const chipB = chip.clone(); chipB.position.z = -0.14; ram.add(chipB);
    });
  }

  // Gold contact pins along the bottom edge
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffcf5c, metalness: 1.0, roughness: 0.25, emissive: 0x3a2c00, emissiveIntensity: 0.3 });
  const pinGeo = new THREE.BoxGeometry(0.07, 0.34, 0.02);
  for (let i = 0; i < 46; i++) {
    const x = -3.1 + i * 0.137;
    if (Math.abs(x + 0.7) < 0.28) continue; // skip notch area
    const pinF = new THREE.Mesh(pinGeo, goldMat); pinF.position.set(x, -0.92, 0.09); ram.add(pinF);
    const pinB = new THREE.Mesh(pinGeo, goldMat); pinB.position.set(x, -0.92, -0.09); ram.add(pinB);
  }

  // Glowing "$RAM" label plate on the heatsink
  const label = makeLabelTexture();
  const labelMat = new THREE.MeshStandardMaterial({ map: label, transparent: true, emissive: 0x00e5ff, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.4 });
  const labelPlate = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.78), labelMat);
  labelPlate.position.set(0, 0.02, 0.092);
  ram.add(labelPlate);
  const labelBack = labelPlate.clone(); labelBack.position.z = -0.092; labelBack.rotation.y = Math.PI; ram.add(labelBack);

  ram.rotation.x = 0.08;
  scene.add(ram);

  // soft glow ring behind
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x7a5cff, transparent: true, opacity: 0.12 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.5, 16, 60), ringMat);
  ring.position.z = -2; scene.add(ring);

  function makeLabelTexture() {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 128;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = "900 84px Orbitron, Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, "#00e5ff"); grad.addColorStop(0.5, "#ffffff"); grad.addColorStop(1, "#ff3df0");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 24;
    ctx.fillText("$RAM", 256, 70);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }

  // ----- Interaction: drag to spin + auto-rotate -----
  let autoRot = true;
  let velY = 0.004, velX = 0;
  let dragging = false, lastX = 0, lastY = 0;
  let targetX = 0.08;

  const onDown = (x, y) => { dragging = true; autoRot = false; lastX = x; lastY = y; };
  const onMove = (x, y) => {
    if (!dragging) return;
    const dx = x - lastX, dy = y - lastY;
    ram.rotation.y += dx * 0.01;
    targetX = Math.max(-0.8, Math.min(0.8, targetX + dy * 0.006));
    velY = dx * 0.0006;
    lastX = x; lastY = y;
  };
  const onUp = () => { dragging = false; setTimeout(() => { autoRot = true; }, 1500); };

  canvas.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  canvas.addEventListener("touchmove", (e) => { onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  canvas.addEventListener("touchend", onUp);

  // ----- Resize -----
  function resize() {
    W = frame.clientWidth; H = frame.clientHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  }
  window.addEventListener("resize", resize);

  // ----- Animate -----
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;
    if (autoRot) { ram.rotation.y += 0.005; }
    else { ram.rotation.y += velY; velY *= 0.95; }
    ram.rotation.x += (targetX - ram.rotation.x) * 0.08;
    ram.position.y = Math.sin(t) * 0.12;
    ring.rotation.z += 0.002;
    // pulse the lights subtly
    cyan.intensity = 2.0 + Math.sin(t * 1.5) * 0.5;
    violet.intensity = 1.8 + Math.cos(t * 1.2) * 0.5;
    renderer.render(scene, camera);
  }
  resize();
  animate();
})();
