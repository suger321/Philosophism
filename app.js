/* 主义星图 · 第一版 */
(function () {
  const D = window.ISM_DATA;
  const SPAN = 8;
  const isTouch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || innerWidth < 820;

  const AXIS_LIFE = {
    mood: { neg: '消极', pos: '积极', color: 0xff7b7b },
    effort: { neg: '放松', pos: '用力', color: 0x7ce38b },
    focus: { neg: '向内', pos: '向外', color: 0x7fb2ff },
    reality: { neg: '现实', pos: '玄学', color: 0xd08bff },
    social: { neg: '独处', pos: '群居', color: 0xffb86b },
    money: { neg: '省', pos: '花', color: 0xffd166 },
    horizon: { neg: '当下', pos: '长期', color: 0x6ee7ff },
    stance: { neg: '顺从', pos: '反抗', color: 0xff8bc7 }
  };

  const AXIS_PHILO = {
    situation: { neg: '消极', pos: '积极', color: 0xff7b7b },
    theory: { neg: '思辨', pos: '实用', color: 0x7ce38b },
    locus: { neg: '集体', pos: '个体', color: 0x7fb2ff },
    source: { neg: '体验', pos: '理性', color: 0xffb86b },
    stance: { neg: '顺从', pos: '反抗', color: 0xd08bff },
    plurality: { neg: '一元', pos: '多元', color: 0x6ee7ff },
    dimension: { neg: '世俗', pos: '超越', color: 0xf5e56b },
    aim: { neg: '描述', pos: '规范', color: 0xff8bc7 }
  };

  const FRAMES_LIFE = [
    { id: 'life-mood', name: '生活观', axes: ['mood', 'effort', 'horizon'] },
    { id: 'value', name: '价值观', axes: ['money', 'stance', 'reality'] },
    { id: 'emotion', name: '情感观', axes: ['social', 'focus', 'stance'] },
    { id: 'state', name: '状态观', axes: ['mood', 'reality', 'effort'] }
  ];

  const FRAMES_PHILO = [
    { id: 'epistemology', name: '认识论', axes: ['source', 'plurality', 'dimension'] },
    { id: 'ontology', name: '存在论', axes: ['situation', 'theory', 'dimension'] },
    { id: 'ethics', name: '伦理观', axes: ['locus', 'stance', 'aim'] },
    { id: 'practice', name: '实践观', axes: ['theory', 'stance', 'situation'] }
  ];

  let curMode = 'life';
  const axDef = () => (curMode === 'life' ? AXIS_LIFE : AXIS_PHILO);
  const frameList = () => (curMode === 'life' ? FRAMES_LIFE : FRAMES_PHILO);

  const CUSTOM_KEY = 'ism_atlas_custom_v1';

  /* ---------- 数据 ---------- */
  const isms = D.isms.isms.slice();
  const sources = D.sources.sources;
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (raw) JSON.parse(raw).forEach(x => isms.push(x));
  } catch (e) { /* 忽略损坏的本地数据 */ }

  let frame = FRAMES_LIFE[0];
  let mode = 'analyze'; // analyze | roam
  let selected = null;

  /* ---------- 场景 ---------- */
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06070c, 0.012);

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400);

  // 分析视角（球坐标）
  const orbit = { theta: 0.95, phi: 1.02, radius: isTouch ? 46 : 33, target: new THREE.Vector3() };
  // 漫游视角
  const roam = { pos: new THREE.Vector3(0, 3, 26), yaw: 0, pitch: 0, vel: 0 };

  function applyOrbit() {
    const r = orbit.radius;
    camera.position.set(
      orbit.target.x + r * Math.sin(orbit.phi) * Math.sin(orbit.theta),
      orbit.target.y + r * Math.cos(orbit.phi),
      orbit.target.z + r * Math.sin(orbit.phi) * Math.cos(orbit.theta)
    );
    camera.lookAt(orbit.target);
  }

  function applyRoam() {
    camera.position.copy(roam.pos);
    camera.rotation.set(0, 0, 0);
    camera.rotateY(roam.yaw);
    camera.rotateX(roam.pitch);
  }

  /* ---------- 轴线与网格 ---------- */
  const axisGroup = new THREE.Group();
  scene.add(axisGroup);

  function makeLabelSprite(text, color, fs, k) {
    fs = fs || 30;
    k = k || 0.017;
    const weight = fs > 24 ? 600 : 500;
    const pad = fs > 24 ? 10 : 6;
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.font = `${weight} ${fs}px "PingFang SC","Microsoft YaHei",system-ui`;
    const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
    c.width = w; c.height = fs + pad * 2;
    const g = c.getContext('2d');
    g.font = `${weight} ${fs}px "PingFang SC","Microsoft YaHei",system-ui`;
    g.textBaseline = 'middle';
    g.fillStyle = color;
    g.fillText(text, pad, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.userData.base = { x: c.width * k, y: c.height * k };
    sp.scale.set(c.width * k, c.height * k, 1);
    return sp;
  }

  function rebuildAxes() {
    while (axisGroup.children.length) {
      const o = axisGroup.children.pop();
      if (o.geometry) o.geometry.dispose();
      if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    }
    const cols = [axDef()[frame.axes[0]].color, axDef()[frame.axes[1]].color, axDef()[frame.axes[2]].color];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(i === 0 ? SPAN : 0, i === 1 ? SPAN : 0, i === 2 ? SPAN : 0)
      ]);
      const m = new THREE.LineBasicMaterial({ color: cols[i], transparent: true, opacity: 0.55 });
      axisGroup.add(new THREE.Line(g, m));
      const g2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(i === 0 ? -SPAN : 0, i === 1 ? -SPAN : 0, i === 2 ? -SPAN : 0)
      ]);
      axisGroup.add(new THREE.Line(g2, m));
    }
    // 轴端标签
    const hex = v => '#' + v.toString(16).padStart(6, '0');
    [0, 1, 2].forEach(i => {
      const key = frame.axes[i];
      const ext = SPAN + (isTouch ? 1.3 : 2.1);
      const plus = i === 0 ? new THREE.Vector3(ext, 0, 0)
        : i === 1 ? new THREE.Vector3(0, ext, 0)
          : new THREE.Vector3(0, 0, ext);
      const minus = plus.clone().multiplyScalar(-1);
      const s1 = makeLabelSprite(axDef()[key].pos, hex(axDef()[key].color));
      s1.position.copy(plus);
      s1.material.depthTest = false; s1.renderOrder = 999;
      axisGroup.add(s1);
      const s2 = makeLabelSprite(axDef()[key].neg, hex(axDef()[key].color));
      s2.position.copy(minus);
      s2.material.depthTest = false; s2.renderOrder = 999;
      axisGroup.add(s2);
    });
    // 原点
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x9fb6d0 })
    );
    axisGroup.add(dot);
  }

  const grid = new THREE.GridHelper(SPAN * 2, 16, 0x1b2940, 0x121b2c);
  grid.position.y = -SPAN;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  scene.add(grid);

  /* ---------- 原点（点击回全景，无面板） ---------- */
  const origin = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 })
  );
  origin.userData.isOrigin = true;
  origin.material.depthTest = false;
  origin.renderOrder = 995;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.78, 48),
    new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, depthTest: false })
  );
  ring.renderOrder = 996;
  origin.add(ring);
  // 原点上的签名
  const mark = makeLabelSprite('suger', 'rgba(12,26,40,0.92)', 26, 0.0055);
  mark.position.set(0, 0, 0);
  mark.material.depthTest = false;
  mark.renderOrder = 997;
  origin.add(mark);
  scene.add(origin);

  /* ---------- 点 ---------- */
  const ptGroup = new THREE.Group();
  scene.add(ptGroup);

  const geo = new THREE.SphereGeometry(isTouch ? 0.38 : 0.32, 18, 18);
  const nodes = [];
  let showLabels = false;
  let hovered = null;

  function colorFor(v) {
    const t = (Math.max(-1, Math.min(1, v)) + 1) / 2;
    const h = 0.63 - 0.2 * t;
    return new THREE.Color().setHSL(h, 0.72, 0.58);
  }

  function posOf(ism, f) {
    const c = ism.coords || {};
    return new THREE.Vector3(
      (c[f.axes[0]] || 0) * SPAN,
      (c[f.axes[1]] || 0) * SPAN,
      (c[f.axes[2]] || 0) * SPAN
    );
  }

  function buildNodes() {
    isms.forEach(ism => {
      const mat = new THREE.MeshBasicMaterial({ color: colorFor((ism.coords || {})[frame.axes[0]] || 0) });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(posOf(ism, frame));
      mesh.visible = (ism.mode || 'life') === curMode;
      mesh.userData.ism = ism;
      mesh.userData.target = mesh.position.clone();
      const lab = makeLabelSprite(ism.name, 'rgba(203,220,240,0.86)', 22, 0.0115);
      lab.position.copy(mesh.position).add(new THREE.Vector3(0, 0.78, 0));
      lab.visible = false;
      mesh.userData.label = lab;
      ptGroup.add(mesh);
      ptGroup.add(lab);
      nodes.push(mesh);
    });
  }

  /* ---------- 相机动画 ---------- */
  const camTarget = { pos: null, look: null, active: false };

  function focusOn(mesh) {
    const p = mesh.position;
    const dir = new THREE.Vector3().subVectors(camera.position, p).normalize();
    if (mode === 'analyze') {
      orbit.target.copy(p);
      orbit.radius = 16;
      if (orbit.phi > 1.45) orbit.phi = 1.3;
    } else {
      camTarget.pos = p.clone().add(dir.multiplyScalar(7));
      camTarget.look = p.clone();
      camTarget.active = true;
    }
  }

  function resetView() {
    orbit.target.set(0, 0, 0);
    orbit.radius = isTouch ? 46 : 33;
    orbit.theta = 0.95;
    orbit.phi = 1.02;
    roam.pos.set(0, 3, 26);
    roam.yaw = 0; roam.pitch = 0; roam.vel = 0;
    camTarget.active = false;
    camTarget.pos = null;
  }

  /* ---------- 交互 ---------- */
  let dragging = false, downX = 0, downY = 0, moved = 0;
  let mouseX = 0, mouseY = 0;
  const pointers = new Map();
  let pinch = null;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const tip = document.getElementById('tip');

  canvas.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (mode === 'roam') {
      if (document.pointerLockElement !== canvas) {
        try {
          const p = canvas.requestPointerLock();
          if (p && p.catch) p.catch(() => {});
        } catch (err) { /* 浏览器限制时忽略 */ }
      }
      return;
    }

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), radius: orbit.radius };
      dragging = false;
      canvas.classList.remove('dragging');
      return;
    }

    dragging = true; downX = e.clientX; downY = e.clientY; moved = 0;
    canvas.classList.add('dragging');
  });

  canvas.addEventListener('pointermove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (mode === 'analyze' && pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 0 && pinch.dist > 0) {
        orbit.radius = Math.max(5, Math.min(60, pinch.radius * (pinch.dist / d)));
      }
      return;
    }

    if (mode === 'analyze' && dragging) {
      const dx = e.clientX - downX, dy = e.clientY - downY;
      moved += Math.abs(dx) + Math.abs(dy);
      orbit.theta -= dx * 0.005;
      orbit.phi = Math.max(0.18, Math.min(Math.PI - 0.18, orbit.phi - dy * 0.005));
      downX = e.clientX; downY = e.clientY;
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove('dragging');
    if (moved < 6) pick(e.clientX, e.clientY);
  }
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    if (mode === 'analyze') {
      orbit.radius = Math.max(5, Math.min(60, orbit.radius * (1 + Math.sign(e.deltaY) * 0.1)));
    } else {
      roam.vel -= Math.sign(e.deltaY) * 2.2;
    }
  }, { passive: false });

  document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== canvas) return;
    roam.yaw -= e.movementX * 0.0022;
    roam.pitch = Math.max(-1.35, Math.min(1.35, roam.pitch - e.movementY * 0.0022));
  });

  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === canvas;
    canvas.classList.toggle('locked', locked);
    if (!locked && mode === 'roam') {
      // 退出锁定时保留位置
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'r' || e.key === 'R') resetView();
    if (e.key === 'Escape') closePanel();
  });

  function pick(cx, cy) {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((cx - r.left) / r.width) * 2 - 1;
    ndc.y = -((cy - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(nodes.filter(n => n.visible).concat(origin), false)[0];
    if (!hit) {
      if (panel.classList.contains('open')) closePanel();
      return;
    }
    if (hit.object.userData.isOrigin) { closePanel(); resetView(); return; }
    selected = hit.object;
    openPanel(hit.object.userData.ism);
    focusOn(hit.object);
  }

  // 悬停提示
  function updateTip() {
    if (isTouch || mode === 'roam' || dragging) { tip.style.opacity = 0; return; }
    const r = canvas.getBoundingClientRect();
    ndc.x = ((mouseX - r.left) / r.width) * 2 - 1;
    ndc.y = -((mouseY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(nodes.filter(n => n.visible).concat(origin), false)[0];
    if (hit && hit.object.userData.isOrigin) {
      hovered = null;
      tip.textContent = '原点 · 点一下回到全景';
      tip.style.left = mouseX + 'px';
      tip.style.top = mouseY + 'px';
      tip.style.opacity = 1;
      canvas.style.cursor = 'pointer';
    } else if (hit) {
      hovered = hit.object;
      tip.textContent = hit.object.userData.ism.name;
      tip.style.left = mouseX + 'px';
      tip.style.top = mouseY + 'px';
      tip.style.opacity = 1;
      canvas.style.cursor = 'pointer';
    } else {
      hovered = null;
      tip.style.opacity = 0;
      canvas.style.cursor = mode === 'roam' ? 'none' : 'grab';
    }
  }

  /* ---------- 面板 ---------- */
  const panel = document.getElementById('panel');
  const pName = document.getElementById('pName');
  const pEn = document.getElementById('pEn');
  const pOne = document.getElementById('pOne');
  const pBody = document.getElementById('pBody');

  function openPanel(ism) {
    pName.textContent = ism.name;
    pEn.textContent = ism.nameEn || '';
    pOne.textContent = ism.oneLine || '';
    const parts = [];
    if (ism.definition) parts.push(`<h5>这是什么</h5><p>${esc(ism.definition)}</p>`);
    if (ism.when) parts.push(`<h5>什么时候会想它</h5><p style="color:#a9c7e6">${esc(ism.when)}</p>`);
    if (ism.tenets && ism.tenets.length) {
      parts.push(`<h5>核心主张</h5><ul>${ism.tenets.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`);
    }
    if (ism.strengths && ism.strengths.length) {
      parts.push(`<h5>优势</h5><ul class="good">${ism.strengths.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`);
    }
    if (ism.limits && ism.limits.length) {
      parts.push(`<h5>局限</h5><ul class="bad">${ism.limits.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`);
    }
    if (ism.figures && ism.figures.length) {
      parts.push(`<h5>常见说法</h5><div class="tags">${ism.figures.map(f => `<span class="tag">${esc(f)}</span>`).join('')}</div>`);
    }
    // 八轴
    const c = ism.coords || {};
    const axisSet = axDef();
    const bars = Object.keys(axisSet).map(k => {
      const v = c[k] || 0;
      const pct = Math.min(50, Math.abs(v) * 50);
      const left = v >= 0 ? 50 : 50 - pct;
      return `<div class="bar"><span>${axisSet[k].neg}</span><div class="track"><i class="mid"></i><i class="fill" style="left:${left}%;width:${pct}%"></i></div><span style="text-align:right">${axisSet[k].pos}</span></div>`;
    }).join('');
    parts.push(`<h5>在八条轴上的位置</h5><div class="bars">${bars}</div>`);
    // 来源
    const srcList = (ism.sources || []).map(id => sources[id]).filter(Boolean);
    if (srcList.length) {
      parts.push(`<h5>材料来源</h5><div class="src">${srcList.map(s =>
        `${esc(s.title)}，${esc(s.author)}，${esc(s.publisher)}，<a href="${s.url}" target="_blank" rel="noopener">原文</a>`
      ).join('<br/>')}</div>`);
    } else {
      parts.push(`<h5>来源</h5><div class="src">编辑部整理，取自日常语汇与网络观察，不是学术定义。</div>`);
    }
    pBody.innerHTML = parts.join('');
    pBody.scrollTop = 0;
    panel.classList.add('open');
  }

  function closePanel() { panel.classList.remove('open'); selected = null; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  document.getElementById('btnClose').addEventListener('click', closePanel);
  document.getElementById('creditsMore').addEventListener('click', e => {
    e.preventDefault();
    const h = D.editorial.honesty;
    const items = h.items.map(t => `<li>${esc(t)}</li>`).join('');
    pName.textContent = '为什么这样打分';
    pEn.textContent = 'HOW IT WORKS';
    pOne.textContent = D.editorial.axisNote.text;
    pBody.innerHTML = `<h5>${esc(h.title)}</h5><ul>${items}</ul>
      <h5>${esc(D.editorial.citation.title)}</h5><p>${esc(D.editorial.citation.intro)}</p>
      <p class="src" style="margin-top:10px">${esc(D.editorial.citation.thanks)}</p>`;
    panel.classList.add('open');
  });

  /* ---------- 顶部与图例 ---------- */
  const framesEl = document.getElementById('frames');
  function buildFrameButtons() {
    framesEl.innerHTML = '';
    frameList().forEach(f => {
      const b = document.createElement('button');
      b.className = 'fbtn' + (f.id === frame.id ? ' on' : '');
      b.textContent = f.name;
      b.dataset.id = f.id;
      b.addEventListener('click', () => switchFrame(f));
      framesEl.appendChild(b);
    });
  }
  buildFrameButtons();

  function switchFrame(f) {
    frame = f;
    [...framesEl.children].forEach(b => b.classList.toggle('on', b.dataset.id === f.id));
    rebuildAxes();
    renderLegend();
    nodes.forEach(n => {
      if (!n.visible) return;
      n.userData.target = posOf(n.userData.ism, f);
      const v = (n.userData.ism.coords || {})[f.axes[0]] || 0;
      n.material.color.copy(colorFor(v));
    });
    if (selected) closePanel();
  }

  function renderLegend() {
    const el = document.getElementById('axes');
    el.innerHTML = frame.axes.map((k, i) => {
      const a = axDef()[k];
      const hex = '#' + a.color.toString(16).padStart(6, '0');
      return `<div class="axrow"><span class="axdot" style="background:${hex}"></span>
        <span class="axend">${a.neg}</span><span style="color:#4c5a70">——</span><span>${a.pos}</span></div>`;
    }).join('');
    document.getElementById('hint').textContent =
      mode === 'analyze' ? '拖拽旋转 · 滚轮缩放 · 点击圆点看详情' : '点击画面后移动鼠标转头 · 滚轮前后 · Esc 退出';
  }

  const btnMode = document.getElementById('btnMode');
  btnMode.addEventListener('click', () => {
    mode = mode === 'analyze' ? 'roam' : 'analyze';
    const mlbl = btnMode.querySelector('.lbl');
    if (mlbl) mlbl.textContent = mode === 'analyze' ? '自由漫游' : '分析视图';
    btnMode.classList.toggle('on', mode === 'roam');
    document.exitPointerLock && document.exitPointerLock();
    if (mode === 'roam') {
      roam.pos.copy(camera.position);
      const dir = new THREE.Vector3().subVectors(orbit.target, camera.position).normalize();
      roam.yaw = Math.atan2(-dir.x, -dir.z);
      roam.pitch = Math.asin(dir.y);
    } else {
      const d = camera.position.length() || 26;
      orbit.radius = Math.max(6, Math.min(50, d));
      orbit.theta = Math.atan2(camera.position.x, camera.position.z);
      orbit.phi = Math.acos(Math.max(-1, Math.min(1, camera.position.y / (camera.position.length() || 1))));
      orbit.target.set(0, 0, 0);
    }
    renderLegend();
  });

  document.getElementById('btnReset').addEventListener('click', resetView);

  document.getElementById('btnLabels').addEventListener('click', e => {
    showLabels = !showLabels;
    e.currentTarget.classList.toggle('on', showLabels);
    const lbl = e.currentTarget.querySelector('.lbl');
    if (lbl) lbl.textContent = showLabels ? '隐藏名称' : '显示名称';
  });

  /* ---------- 生活 / 哲学 两套模式 ---------- */
  function switchMode(m) {
    if (m === curMode) return;
    curMode = m;
    frame = frameList()[0];
    buildFrameButtons();
    nodes.forEach(n => {
      const on = (n.userData.ism.mode || 'life') === m;
      n.visible = on;
      if (n.userData.label) n.userData.label.visible = false;
      if (on) {
        n.userData.target = posOf(n.userData.ism, frame);
        n.material.color.copy(colorFor((n.userData.ism.coords || {})[frame.axes[0]] || 0));
      }
    });
    rebuildAxes();
    renderLegend();
    closePanel();
    resetView();
    const mb = document.getElementById('btnMode2');
    if (mb) mb.textContent = curMode === 'life' ? '哲学模式' : '生活模式';
  }

  const modeBtn = document.getElementById('btnMode2');
  if (modeBtn) modeBtn.addEventListener('click', () => switchMode(curMode === 'life' ? 'philosophy' : 'life'));

  /* ---------- 添加主义 ---------- */
  const addEl = document.getElementById('add');
  const slidersEl = document.getElementById('aSliders');

  function buildSliders() {
    slidersEl.innerHTML = '';
    const axisSet = axDef();
    Object.keys(axisSet).forEach(k => {
      const row = document.createElement('div');
      row.className = 'slider';
      row.innerHTML = `<span>${axisSet[k].neg}</span>
        <input type="range" min="-1" max="1" step="0.05" value="0" data-axis="${k}" />
        <span style="text-align:right">${axisSet[k].pos}</span>`;
      slidersEl.appendChild(row);
    });
  }

  document.getElementById('btnAdd').addEventListener('click', () => {
    buildSliders();
    addEl.classList.add('show');
  });
  document.getElementById('btnAddCancel').addEventListener('click', () => addEl.classList.remove('show'));

  document.getElementById('btnAddSave').addEventListener('click', () => {
    const name = document.getElementById('aName').value.trim();
    if (!name) { document.getElementById('aName').focus(); return; }
    const coords = {};
    slidersEl.querySelectorAll('input[type=range]').forEach(inp => { coords[inp.dataset.axis] = parseFloat(inp.value); });
    const item = {
      id: 'custom-' + Date.now().toString(36),
      name,
      nameEn: document.getElementById('aEn').value.trim(),
      oneLine: document.getElementById('aOne').value.trim(),
      definition: document.getElementById('aDef').value.trim(),
      tenets: [], strengths: [], limits: [], figures: [],
      coords,
      mode: curMode,
      sources: [],
      custom: true
    };
    try {
      const raw = localStorage.getItem(CUSTOM_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(item);
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(arr));
    } catch (e) { alert('本地保存失败，可能是浏览器禁用了存储'); }

    isms.push(item);
    const mat = new THREE.MeshBasicMaterial({ color: colorFor(coords[frame.axes[0]] || 0) });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(posOf(item, frame));
    mesh.visible = true;
    mesh.userData.ism = item;
    mesh.userData.target = mesh.position.clone();
    const lab = makeLabelSprite(item.name, 'rgba(203,220,240,0.86)', 22, 0.0115);
    lab.position.copy(mesh.position).add(new THREE.Vector3(0, 0.78, 0));
    lab.visible = false;
    mesh.userData.label = lab;
    ptGroup.add(mesh);
    ptGroup.add(lab);
    nodes.push(mesh);

    addEl.classList.remove('show');
    ['aName', 'aEn', 'aOne', 'aDef'].forEach(id => { document.getElementById(id).value = ''; });
    slidersEl.querySelectorAll('input[type=range]').forEach(i => { i.value = 0; });
    openPanel(item);
  });

  /* ---------- 首屏 ---------- */
  document.getElementById('btnEnter').addEventListener('click', () => {
    document.body.classList.remove('intro-open');
  });

  /* ---------- 循环 ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // 原点轻微脉动，提示可点
    origin.scale.setScalar(1 + 0.07 * Math.sin(now / 460));

    // 轴标签按距离保持视觉大小稳定
    axisGroup.children.forEach(o => {
      if (o.isSprite && o.userData.base) {
        const d = camera.position.distanceTo(o.position);
        const f = Math.max(0.45, Math.min(2.4, d / 34));
        o.scale.set(o.userData.base.x * f, o.userData.base.y * f, 1);
      }
    });

    // 点位过渡
    nodes.forEach(n => {
      n.position.lerp(n.userData.target, 1 - Math.pow(0.001, dt));
      const lab = n.userData.label;
      if (lab) {
        lab.position.set(n.position.x, n.position.y + 0.78, n.position.z);
        lab.visible = showLabels || n === hovered || n === selected;
        if (lab.visible && lab.userData.base) {
          const d = camera.position.distanceTo(n.position);
          const f = Math.max(0.5, Math.min(2.2, d / 30));
          lab.scale.set(lab.userData.base.x * f, lab.userData.base.y * f, 1);
        }
      }
    });

    if (mode === 'analyze') {
      applyOrbit();
    } else {
      if (roam.vel !== 0 || true) {
        const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(roam.pitch, roam.yaw, 0, 'YXZ'));
        roam.pos.addScaledVector(dir, roam.vel * dt * 6);
        roam.vel *= Math.pow(0.02, dt);
        if (Math.abs(roam.vel) < 0.01) roam.vel = 0;
        const lim = SPAN * 2.2;
        roam.pos.x = Math.max(-lim, Math.min(lim, roam.pos.x));
        roam.pos.y = Math.max(-lim, Math.min(lim, roam.pos.y));
        roam.pos.z = Math.max(-lim, Math.min(lim, roam.pos.z));
      }
      if (camTarget.active && camTarget.pos) {
        roam.pos.lerp(camTarget.pos, 1 - Math.pow(0.002, dt));
        const d = new THREE.Vector3().subVectors(camTarget.look, roam.pos).normalize();
        roam.yaw = Math.atan2(-d.x, -d.z);
        roam.pitch = Math.asin(Math.max(-1, Math.min(1, d.y)));
        if (roam.pos.distanceTo(camTarget.pos) < 0.4) camTarget.active = false;
      }
      applyRoam();
    }

    updateTip();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  /* ---------- 尺寸 ---------- */
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
    renderer.setSize(w, h, false);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  /* ---------- 启动 ---------- */
  document.body.classList.add('intro-open');
  window.__ism = { nodes, camera, scene, orbit, switchFrame, frame: () => frame, mode: () => mode, resetView };
  rebuildAxes();
  buildNodes();
  renderLegend();
  resize();
  applyOrbit();
  requestAnimationFrame(loop);
})();
