/* ============ RAMCOIN — interactions + 3D RAM + install game ============ */

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

/* ---------- Card 3D tilt on hover ---------- */
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

/* ============ 3D RAM MODULE — realistic green PCB + futuristic glow ============ */
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
  const camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
  camera.position.set(0, 0.1, 11.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  // ----- Lights -----
  scene.add(new THREE.AmbientLight(0x6a72a0, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(4, 6, 9); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc7d2ff, 0.4); fill.position.set(-5, 1, 7); scene.add(fill);
  const backLight = new THREE.DirectionalLight(0xbfeaff, 0.45); backLight.position.set(0, 2, -8); scene.add(backLight);
  const cyan = new THREE.PointLight(0x00e5ff, 1.2, 50); cyan.position.set(-8, 3, 6); scene.add(cyan);
  const violet = new THREE.PointLight(0x7a5cff, 1.1, 50); violet.position.set(8, -2, 5); scene.add(violet);

  // ----- Materials -----
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x0d8240, metalness: 0.3, roughness: 0.55 });
  const boardEdgeMat = new THREE.MeshStandardMaterial({ color: 0x0a5e30, metalness: 0.3, roughness: 0.6 });
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x131316, metalness: 0.5, roughness: 0.45 });
  const chipTopMat = new THREE.MeshStandardMaterial({ color: 0x1b1b20, metalness: 0.55, roughness: 0.4 });
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x040406, metalness: 0.3, roughness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0e, metalness: 0.35, roughness: 0.6 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf2c24a, metalness: 0.9, roughness: 0.3, emissive: 0x4a3500, emissiveIntensity: 0.3 });
  const traceMat = new THREE.MeshStandardMaterial({ color: 0x0a3a2a, emissive: 0x00e5ff, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.5 });

  // ----- Build the module -----
  const ram = new THREE.Group();
  const BW = 7.4, BH = 2.5, BD = 0.16;

  // PCB board
  const board = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, BD), boardMat);
  ram.add(board);
  // thin darker back to give depth
  const back = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, BD * 0.5), boardEdgeMat);
  back.position.z = -BD * 0.5; ram.add(back);

  // Black chips with horizontal ridge slots (built facing +z, local origin)
  function makeChip() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.56, 1.32, 0.20), chipMat);
    g.add(body);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.44, 1.20, 0.06), chipTopMat);
    cap.position.z = 0.12; g.add(cap);
    for (let k = -1; k <= 1; k++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.17, 0.05), slotMat);
      slot.position.set(0, k * 0.34, 0.15);
      g.add(slot);
    }
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14),
      new THREE.MeshStandardMaterial({ color: 0x05060c, emissive: 0x00e5ff, emissiveIntensity: 1.6 }));
    dot.position.set(-0.62, 0.46, 0.16); g.add(dot);
    return g;
  }
  // double-sided: chips on front (+z) and back (-z)
  [-2.6, -0.86, 0.86, 2.6].forEach((x) => {
    const f = makeChip(); f.position.set(x, 0.12, BD / 2 + 0.02); ram.add(f);
    const b = makeChip(); b.position.set(x, 0.12, -(BD / 2 + 0.02)); b.rotation.y = Math.PI; ram.add(b);
  });

  // Top retention tabs (two small black tabs like the photo)
  [-1.4, 1.4].forEach((x) => {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.32), darkMat);
    tab.position.set(x, BH / 2 + 0.02, 0.06); ram.add(tab);
  });

  // Corner screw holes (gold ring + dark center)
  [-1, 1].forEach((sx) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.04, 10, 22), goldMat);
    ring.position.set(sx * (BW / 2 - 0.45), BH / 2 - 0.35, BD / 2 + 0.02); ram.add(ring);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.10, 18), slotMat);
    hole.position.set(sx * (BW / 2 - 0.45), BH / 2 - 0.35, BD / 2 + 0.03); ram.add(hole);
  });

  // Glowing futuristic traces on the green PCB
  const traces = [];
  function addTrace(x, y, w, h) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), traceMat.clone());
    t.position.set(x, y, BD / 2 + 0.015); ram.add(t); traces.push(t);
  }
  addTrace(0, BH / 2 - 0.08, BW - 0.6, 0.035);      // top rail
  addTrace(0, -BH / 2 + 0.55, BW - 0.6, 0.035);     // bottom rail
  addTrace(-BW / 2 + 0.25, 0, 0.035, BH - 0.7);     // left riser
  addTrace(BW / 2 - 0.25, 0, 0.035, BH - 0.7);      // right riser
  [-1.73, 0, 1.73].forEach((x) => addTrace(x, -BH / 2 + 0.9, 0.035, 0.7)); // verticals between chips

  // Glowing $RAM badge (silkscreen, futuristic)
  function makeLabelTexture() {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128;
    const ctx = c.getContext("2d"); ctx.clearRect(0, 0, 512, 128);
    ctx.font = "900 84px Orbitron, Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, "#00e5ff"); grad.addColorStop(0.5, "#ffffff"); grad.addColorStop(1, "#ff3df0");
    ctx.fillStyle = grad; ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 22;
    ctx.fillText("$RAM", 256, 70);
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex;
  }
  const labelMat = new THREE.MeshStandardMaterial({ map: makeLabelTexture(), transparent: true, emissive: 0x00e5ff, emissiveIntensity: 0.7, metalness: 0.2, roughness: 0.5 });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.42), labelMat);
  label.position.set(0, -BH / 2 + 0.9, BD / 2 + 0.04); ram.add(label);
  const labelBack = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.42), labelMat);
  labelBack.position.set(0, -BH / 2 + 0.9, -(BD / 2 + 0.04)); labelBack.rotation.y = Math.PI; ram.add(labelBack);

  // Gold edge connector fingers (single textured strip per side = cheap)
  const notchX = -0.9;
  function makeFingerTex() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 128;
    const ctx = c.getContext("2d"); ctx.clearRect(0, 0, 1024, 128);
    const notchPx = ((notchX + BW / 2) / BW) * 1024;
    for (let i = 0; i < 60; i++) {
      const x = 28 + i * 16.4;
      if (Math.abs(x - notchPx) < 26) continue; // key-notch gap
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "#ffe08a"); g.addColorStop(0.5, "#f2c24a"); g.addColorStop(1, "#b9882a");
      ctx.fillStyle = g; ctx.fillRect(x, 6, 10, 116);
    }
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex;
  }
  const fingerMat = new THREE.MeshStandardMaterial({ map: makeFingerTex(), transparent: true, metalness: 0.9, roughness: 0.3, emissive: 0x3a2900, emissiveIntensity: 0.25 });
  const fingerGeo = new THREE.PlaneGeometry(BW - 0.04, 0.46);
  const fingerF = new THREE.Mesh(fingerGeo, fingerMat); fingerF.position.set(0, -BH / 2 + 0.18, BD / 2 + 0.012); ram.add(fingerF);
  const fingerB = new THREE.Mesh(fingerGeo, fingerMat); fingerB.position.set(0, -BH / 2 + 0.18, -(BD / 2 + 0.012)); fingerB.rotation.y = Math.PI; ram.add(fingerB);
  // key notch (physical cut look)
  const notch = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, BD + 0.05), slotMat);
  notch.position.set(notchX, -BH / 2 + 0.12, 0); ram.add(notch);

  // small blinking status LEDs
  const leds = [];
  [[-3.3, 0.95, 0x2bff9b], [3.3, 0.95, 0x00e5ff]].forEach(([x, y, col]) => {
    const led = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x05060c, emissive: col, emissiveIntensity: 1.4 }));
    led.position.set(x, y, BD / 2 + 0.02); leds.push(led); ram.add(led);
  });

  ram.rotation.x = 0.05;
  scene.add(ram);

  // ----- Floating particles + back ring -----
  const pCount = 80;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = ((Math.sin(i * 12.9) * 43758.5) % 1) * 16 - 8;
    pPos[i * 3 + 1] = ((Math.sin(i * 78.2) * 12543.1) % 1) * 12 - 6;
    pPos[i * 3 + 2] = ((Math.sin(i * 4.7) * 9812.3) % 1) * 8 - 5;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00e5ff, size: 0.05, transparent: true, opacity: 0.5, depthWrite: false }));
  scene.add(particles);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.45, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x7a5cff, transparent: true, opacity: 0.09 }));
  ring.position.z = -2.6; scene.add(ring);

  // ----- Interaction -----
  let autoRot = true, velY = 0.005, dragging = false, lastX = 0, lastY = 0, targetX = 0.05;
  const onDown = (x, y) => { dragging = true; autoRot = false; lastX = x; lastY = y; };
  const onMove = (x, y) => {
    if (!dragging) return;
    const dx = x - lastX, dy = y - lastY;
    ram.rotation.y += dx * 0.01;
    targetX = Math.max(-0.7, Math.min(0.7, targetX + dy * 0.006));
    velY = dx * 0.0006; lastX = x; lastY = y;
  };
  const onUp = () => { dragging = false; setTimeout(() => { autoRot = true; }, 1400); };
  canvas.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  canvas.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  canvas.addEventListener("touchend", onUp);

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  }
  window.addEventListener("resize", resize);

  const traceColor = new THREE.Color();
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;
    if (autoRot) ram.rotation.y += 0.004;
    else { ram.rotation.y += velY; velY *= 0.95; }
    ram.rotation.x += (targetX - ram.rotation.x) * 0.08;
    ram.position.y = Math.sin(t) * 0.1;

    // flowing glow along traces (hue cycle + pulse offset per trace)
    traces.forEach((tr, i) => {
      traceColor.setHSL((0.5 + t * 0.03 + i * 0.04) % 1, 1, 0.55);
      tr.material.emissive.copy(traceColor);
      tr.material.emissiveIntensity = 0.35 + Math.max(0, Math.sin(t * 2.2 - i * 0.7)) * 0.7;
    });
    leds.forEach((led, i) => { led.material.emissiveIntensity = 0.5 + Math.max(0, Math.sin(t * 4 - i * 1.5)) * 1.7; });
    labelMat.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.25;

    particles.rotation.y += 0.0006; particles.rotation.x += 0.0003;
    ring.rotation.z += 0.002;
    cyan.intensity = 1.8 + Math.sin(t * 1.5) * 0.5;
    violet.intensity = 1.6 + Math.cos(t * 1.2) * 0.5;
    renderer.render(scene, camera);
  }
  resize();
  animate();
})();

/* ============ INSTALL THE RAM — drag into the motherboard slot ============ */
(function () {
  const stage = document.getElementById("install-stage");
  if (!stage) return;
  const dimm = document.getElementById("dimm");
  const slot = document.getElementById("dimm-slot");
  const msg = document.getElementById("install-msg");
  const eject = document.getElementById("eject-btn");
  let dragging = false, installed = false, offX = 0, offY = 0, homeX = 0, homeY = 0;

  const pt = (e) => (e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY });
  const setPos = (x, y) => { dimm.style.left = x + "px"; dimm.style.top = y + "px"; };

  function home() {
    const s = stage.getBoundingClientRect();
    homeX = s.width * 0.5 - dimm.offsetWidth / 2;
    homeY = s.height - dimm.offsetHeight - 18;
    setPos(homeX, homeY);
  }

  function near() {
    const sr = slot.getBoundingClientRect(), dr = dimm.getBoundingClientRect();
    const dx = (sr.left + sr.width / 2) - (dr.left + dr.width / 2);
    const dy = (sr.top + sr.height / 2) - (dr.top + dr.height / 2);
    return Math.abs(dx) < 70 && Math.abs(dy) < 80;
  }

  function onDown(e) {
    if (installed) return;
    dragging = true; dimm.classList.add("dragging");
    const p = pt(e), r = dimm.getBoundingClientRect();
    offX = p.x - r.left; offY = p.y - r.top;
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    const s = stage.getBoundingClientRect(), p = pt(e);
    let x = Math.max(0, Math.min(s.width - dimm.offsetWidth, p.x - s.left - offX));
    let y = Math.max(0, Math.min(s.height - dimm.offsetHeight, p.y - s.top - offY));
    setPos(x, y);
    slot.classList.toggle("armed", near());
  }
  function onUp() {
    if (!dragging) return;
    dragging = false; dimm.classList.remove("dragging");
    if (near()) { install(); }
    else {
      slot.classList.remove("armed");
      dimm.style.transition = "left .3s ease, top .3s ease";
      setPos(homeX, homeY);
      setTimeout(() => (dimm.style.transition = ""), 300);
    }
  }

  function install() {
    installed = true; slot.classList.remove("armed");
    const s = stage.getBoundingClientRect(), sr = slot.getBoundingClientRect();
    const tx = sr.left - s.left + (sr.width - dimm.offsetWidth) / 2;
    const ty = sr.top - s.top - dimm.offsetHeight * 0.46;
    dimm.style.transition = "left .22s cubic-bezier(.2,.9,.2,1), top .22s cubic-bezier(.2,.9,.2,1)";
    setPos(tx, ty);
    setTimeout(() => {
      dimm.classList.add("installed");
      slot.classList.add("filled");
      stage.classList.add("powered");
      if (msg) msg.classList.add("show");
      if (eject) eject.classList.add("show");
      burst(sr, s);
      try { navigator.vibrate && navigator.vibrate(60); } catch (e) {}
    }, 230);
  }

  function burst(sr, s) {
    const cx = sr.left - s.left + sr.width / 2;
    const cy = sr.top - s.top + sr.height / 2;
    const colors = ["#00e5ff", "#7a5cff", "#ff3df0", "#2bff9b", "#ffffff"];
    for (let i = 0; i < 34; i++) {
      const sp = document.createElement("span");
      sp.className = "spark";
      const ang = (Math.PI * 2 * i) / 34 + Math.sin(i) * 0.4;
      const dist = 60 + (Math.sin(i * 9.1) * 0.5 + 0.5) * 120;
      sp.style.left = cx + "px"; sp.style.top = cy + "px";
      sp.style.background = colors[i % colors.length];
      sp.style.setProperty("--tx", Math.cos(ang) * dist + "px");
      sp.style.setProperty("--ty", Math.sin(ang) * dist + "px");
      stage.appendChild(sp);
      setTimeout(() => sp.remove(), 1000);
    }
    // shockwave ring
    const wave = document.createElement("span");
    wave.className = "shockwave";
    wave.style.left = cx + "px"; wave.style.top = cy + "px";
    stage.appendChild(wave);
    setTimeout(() => wave.remove(), 900);
  }

  function reset() {
    installed = false;
    dimm.classList.remove("installed");
    slot.classList.remove("filled");
    stage.classList.remove("powered");
    if (msg) msg.classList.remove("show");
    if (eject) eject.classList.remove("show");
    dimm.style.transition = "left .3s ease, top .3s ease";
    home();
    setTimeout(() => (dimm.style.transition = ""), 300);
  }

  dimm.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  dimm.addEventListener("touchstart", onDown, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onUp);
  if (eject) eject.addEventListener("click", reset);
  window.addEventListener("resize", () => { if (!installed) home(); });

  home();
})();
