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
  camera.position.set(0, 0.1, 12.6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  // ----- Lights (cool key raking from upper-left so the flat face stays dark, edges catch light) -----
  scene.add(new THREE.AmbientLight(0x7e88a0, 0.42));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-7, 8, 3.5); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fb6e8, 0.32); fill.position.set(6, 0, 6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0x6fd2ff, 0.85); rim.position.set(3, 4, -7); scene.add(rim);
  const spec = new THREE.PointLight(0xeaf2ff, 0.8, 60); spec.position.set(-4, 7, 6); scene.add(spec);

  // ----- Materials -----
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0a0b0e, metalness: 0.3, roughness: 0.6 });
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x141417, metalness: 0.4, roughness: 0.35 });
  // brushed-metal micro-texture (varies roughness → realistic anodized aluminium sheen)
  function brushedTex() {
    const c = document.createElement("canvas"); c.width = 256; c.height = 64;
    const ctx = c.getContext("2d"); ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 900; i++) {
      const y = ((Math.sin(i * 91.7) * 4391.3) % 1) * 64;
      const v = 90 + ((Math.sin(i * 12.3) * 233.1) % 1) * 110;
      ctx.strokeStyle = "rgba(" + (v | 0) + "," + (v | 0) + "," + (v | 0) + ",0.5)";
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y + (((Math.sin(i) % 1)) * 2)); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1); return t;
  }
  const brush = brushedTex();
  const metalBody = new THREE.MeshStandardMaterial({ color: 0x3a3e46, metalness: 0.72, roughness: 0.46, roughnessMap: brush });
  const metalHi = new THREE.MeshStandardMaterial({ color: 0xb4bbc6, metalness: 0.92, roughness: 0.24, roughnessMap: brush });
  const metalRecess = new THREE.MeshStandardMaterial({ color: 0x131418, metalness: 0.55, roughness: 0.5 });
  const grooveMat = new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: 0.5, roughness: 0.6 });
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x050608, metalness: 0.3, roughness: 0.7 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xe9bd55, metalness: 0.95, roughness: 0.3 });

  // ----- Build the module -----
  const ram = new THREE.Group();
  const BW = 6.2, BH = 2.5, BD = 0.16;
  const zF = BD / 2;

  // PCB board (dark)
  const board = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, BD), pcbMat);
  ram.add(board);

  // Black memory chips on the exposed lower PCB (front + back)
  const chipGeo = new THREE.BoxGeometry(0.6, 0.66, 0.055);
  for (let i = 0; i < 8; i++) {
    const x = -2.38 + i * 0.68;
    const cf = new THREE.Mesh(chipGeo, chipMat); cf.position.set(x, -0.82, zF + 0.03); ram.add(cf);
    const cb = new THREE.Mesh(chipGeo, chipMat); cb.position.set(x, -0.82, -zF - 0.03); ram.add(cb);
  }

  // Heatspreader — single extruded bar with an aggressive stepped angular crown
  const HS_Y = 0.45;
  const hw = (BW - 0.2) / 2;                 // half width of heatspreader
  const yB = -0.78, ySide = 0.30, yStep = 0.46, yTop = 0.78; // crown profile heights (local)
  const shape = new THREE.Shape();
  shape.moveTo(-hw, yB);
  shape.lineTo(-hw, ySide);
  shape.lineTo(-hw + 0.5, ySide);
  shape.lineTo(-hw + 0.62, yStep);
  shape.lineTo(-1.95, yStep);
  shape.lineTo(-1.6, yTop);
  shape.lineTo(1.6, yTop);
  shape.lineTo(1.95, yStep);
  shape.lineTo(hw - 0.62, yStep);
  shape.lineTo(hw - 0.5, ySide);
  shape.lineTo(hw, ySide);
  shape.lineTo(hw, yB);
  shape.closePath();
  const hsGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, steps: 1 });
  hsGeo.translate(0, 0, -0.17); // centre depth so the heatsink wraps the module
  const heatspreader = new THREE.Mesh(hsGeo, metalBody);
  heatspreader.position.y = HS_Y; ram.add(heatspreader);

  // machined bright top edge (catches light along the crown like the photo)
  const topHi = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 0.50), metalHi);
  topHi.position.set(0, HS_Y + yTop - 0.02, 0); ram.add(topHi);
  [-1, 1].forEach((s) => {
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.50), metalHi);
    sh.position.set(s * (hw - 0.75), HS_Y + yStep - 0.02, 0); ram.add(sh);
  });

  // raised centre panel that holds the glowing logo (both faces), sits proud of the bevel
  const PANEL_Z = 0.26;
  function centrePanel(s) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.98, 0.05), metalRecess);
    p.position.set(0, HS_Y - 0.02, s * PANEL_Z); ram.add(p);
    // angular accent grooves flanking the panel
    [-1, 1].forEach((sx) => {
      const gv = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.03), grooveMat);
      gv.position.set(sx * 2.1, HS_Y, s * (PANEL_Z + 0.02)); gv.rotation.z = sx * 0.32; ram.add(gv);
      const gv2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.03), grooveMat);
      gv2.position.set(sx * 2.4, HS_Y, s * (PANEL_Z + 0.02)); gv2.rotation.z = sx * 0.32; ram.add(gv2);
    });
  }
  centrePanel(1); centrePanel(-1);

  // "Ram Coin" glowing logo (matches the reference image)
  function makeLogoTexture() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 256;
    const ctx = c.getContext("2d"); ctx.clearRect(0, 0, 1024, 256);
    ctx.textAlign = "center";
    ctx.font = "600 124px 'Space Grotesk', Arial, sans-serif";
    ctx.fillStyle = "#eafaff"; ctx.shadowColor = "#3fc8ff"; ctx.shadowBlur = 36;
    ctx.fillText("Ram Coin", 512, 124);
    ctx.shadowBlur = 12; ctx.font = "600 36px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#8fd6f2";
    ctx.fillText("X P E R T   P E R F O R M A N C E", 512, 194);
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex;
  }
  const logoMat = new THREE.MeshStandardMaterial({ map: makeLogoTexture(), transparent: true, emissive: 0x36bdff, emissiveIntensity: 0.6, metalness: 0.1, roughness: 0.6 });
  const logoGeo = new THREE.PlaneGeometry(3.5, 0.875);
  const logoF = new THREE.Mesh(logoGeo, logoMat); logoF.position.set(0, HS_Y - 0.02, 0.291); ram.add(logoF);
  const logoB = new THREE.Mesh(logoGeo, logoMat); logoB.position.set(0, HS_Y - 0.02, -0.291); logoB.rotation.y = Math.PI; ram.add(logoB);

  // Gold edge connector fingers (textured strip) + key notch
  const notchX = -0.85;
  function makeFingerTex() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 128;
    const ctx = c.getContext("2d"); ctx.clearRect(0, 0, 1024, 128);
    const notchPx = ((notchX + BW / 2) / BW) * 1024;
    for (let i = 0; i < 58; i++) {
      const x = 26 + i * 16.8;
      if (Math.abs(x - notchPx) < 26) continue;
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "#ffe9a8"); g.addColorStop(0.5, "#e9bd55"); g.addColorStop(1, "#a87c2a");
      ctx.fillStyle = g; ctx.fillRect(x, 10, 10, 110);
    }
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex;
  }
  const fingerMat = new THREE.MeshStandardMaterial({ map: makeFingerTex(), transparent: true, metalness: 0.95, roughness: 0.3 });
  const fingerGeo = new THREE.PlaneGeometry(BW - 0.04, 0.4);
  const fingerF = new THREE.Mesh(fingerGeo, fingerMat); fingerF.position.set(0, -BH / 2 + 0.16, zF + 0.012); ram.add(fingerF);
  const fingerB = new THREE.Mesh(fingerGeo, fingerMat); fingerB.position.set(0, -BH / 2 + 0.16, -(zF + 0.012)); fingerB.rotation.y = Math.PI; ram.add(fingerB);
  const notch = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.46, BD + 0.05), slotMat);
  notch.position.set(notchX, -BH / 2 + 0.1, 0); ram.add(notch);

  ram.rotation.x = 0.04;
  scene.add(ram);

  // subtle floating dust + soft back ring (kept very low-key)
  const pCount = 46;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = ((Math.sin(i * 12.9) * 43758.5) % 1) * 16 - 8;
    pPos[i * 3 + 1] = ((Math.sin(i * 78.2) * 12543.1) % 1) * 12 - 6;
    pPos[i * 3 + 2] = ((Math.sin(i * 4.7) * 9812.3) % 1) * 8 - 5;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x7fb8d8, size: 0.045, transparent: true, opacity: 0.35, depthWrite: false }));
  scene.add(particles);

  // ----- Interaction -----
  let autoRot = true, velY = 0.004, dragging = false, lastX = 0, lastY = 0, targetX = 0.04;
  const onDown = (x, y) => { dragging = true; autoRot = false; lastX = x; lastY = y; };
  const onMove = (x, y) => {
    if (!dragging) return;
    const dx = x - lastX, dy = y - lastY;
    ram.rotation.y += dx * 0.01;
    targetX = Math.max(-0.6, Math.min(0.6, targetX + dy * 0.006));
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

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;
    if (autoRot) ram.rotation.y += 0.0035;
    else { ram.rotation.y += velY; velY *= 0.95; }
    ram.rotation.x += (targetX - ram.rotation.x) * 0.08;
    ram.position.y = Math.sin(t) * 0.08;
    logoMat.emissiveIntensity = 0.45 + Math.sin(t * 1.6) * 0.18; // gentle logo breathe
    particles.rotation.y += 0.0005;
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
    // exact fit: dimm and slot share the same width, so centring aligns edges + key notch
    const tx = sr.left - s.left + (sr.width - dimm.offsetWidth) / 2;
    // seat so the gold pins sink just into the slot mouth (then pins fade as they enter)
    const ty = sr.top - s.top - dimm.offsetHeight + 16;
    dimm.style.transition = "left .2s cubic-bezier(.2,.9,.2,1), top .26s cubic-bezier(.34,1.4,.5,1)";
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
