// 《荆棘之路 逃跑计划》触屏操作（手机 / 平板）
// 只在触屏设备上启用（game.js 里的 TOUCH）；电脑上这个文件什么都不做。
// 右手：「跳」（按住跳得更高）和「冲刺」；屏幕右半边点空白处也算跳。
// 左手：▲ ▼ 换道；也可以在左半边上下滑动换道。
// 这四个按钮贴着手机屏幕边缘：宽屏手机上落在游戏画面两侧的黑边里，不挡画面（尤其不挡身后的真冬）。
// 右上角：游戏中是暂停，剧情里是跳过。结局画面有「再来一次」「回到标题」两个按钮。
(() => {
  if (!TOUCH) return;
  Horror.TUNE.lite = true;   // 手机用轻量版恐怖效果

  const CORNER = { x: W - 150, y: 22, w: 128, h: 92 };         // 暂停 / 跳过（画布坐标）
  const END_BTN = { again: { x: W / 2 - 330, y: H / 2 + 200, w: 300, h: 84, text: '再来一次' },
                    title: { x: W / 2 + 30, y: H / 2 + 200, w: 300, h: 84, text: '回到标题' } };
  const SWIPE = 70;                                            // 左半边上下滑动多少（画布像素）算换道

  const held = { UP: 0, DOWN: 0, DASH: 0, JUMP: 0 };
  const playing = () => game.state === 'play' || game.state === 'leaving';
  function press(k) { if (!keys[k]) pressed[k] = true; keys[k] = true; held[k]++; }
  function release(k) { held[k] = Math.max(0, held[k] - 1); if (!held[k]) keys[k] = false; }
  const inBox = (pt, r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  }

  // ---------------------------------------------------------------- 屏幕边缘的四个按钮
  const css = document.createElement('style');
  css.textContent = `
    #touch-ui { position: fixed; inset: 0; pointer-events: none; z-index: 5; display: none; }
    #touch-ui.on { display: block; }
    .tbtn { position: absolute; border-radius: 50%; pointer-events: auto; touch-action: none;
      display: flex; align-items: center; justify-content: center; box-sizing: border-box;
      background: rgba(20,14,30,0.42); border: 0.6vh solid rgba(242,184,214,0.75);
      color: #fbe8f3; font: 700 6vh ${FONT}; opacity: 0.72; user-select: none; -webkit-user-select: none; }
    .tbtn.down { background: rgba(242,184,214,0.5); border-color: #ffe3f1; opacity: 0.95; transform: scale(0.94); }
    .tbtn small { font-size: 4.6vh; }
    .tbtn .ring { position: absolute; inset: -1.8vh; border-radius: 50%; pointer-events: none;
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.2vh), #000 calc(100% - 1.1vh));
              mask: radial-gradient(farthest-side, transparent calc(100% - 1.2vh), #000 calc(100% - 1.1vh)); }
    #tb-UP   { width: 22vh; height: 22vh; left: max(2.5vh, env(safe-area-inset-left)); bottom: 30vh; }
    #tb-DOWN { width: 22vh; height: 22vh; left: max(2.5vh, env(safe-area-inset-left)); bottom: 4vh; }
    #tb-JUMP { width: 31vh; height: 31vh; right: max(2.5vh, env(safe-area-inset-right)); bottom: 13vh; }
    #tb-DASH { width: 20vh; height: 20vh; right: calc(max(2.5vh, env(safe-area-inset-right)) + 30vh); bottom: 3vh; }`;
  document.head.appendChild(css);
  const ui = document.createElement('div'); ui.id = 'touch-ui';
  const btns = {};
  for (const [k, label] of [['UP', '▲'], ['DOWN', '▼'], ['JUMP', '跳'], ['DASH', '<small>冲刺</small>']]) {
    const el = document.createElement('div'); el.className = 'tbtn'; el.id = 'tb-' + k; el.innerHTML = label;
    if (k === 'DASH') { const r = document.createElement('div'); r.className = 'ring'; el.appendChild(r); }
    const down = new Set();
    el.addEventListener('pointerdown', e => {
      e.preventDefault(); unlockAudio();
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      if (!down.has(e.pointerId)) { down.add(e.pointerId); press(k); el.classList.add('down'); }
    });
    const up = e => { if (down.delete(e.pointerId)) { release(k); if (!down.size) el.classList.remove('down'); } };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', e => e.preventDefault());
    btns[k] = el; ui.appendChild(el);
  }
  document.body.appendChild(ui);
  let lastRing = '';
  function syncUI() {
    ui.classList.toggle('on', playing());
    if (!playing() || !game.p) return;
    // 冲刺冷却：按钮外圈一圈进度
    const cd = Math.max(0, Math.min(1, 1 - game.p.dashCD / DASH_CD));
    const ring = cd >= 1 ? 'none' : `conic-gradient(#f2b8d6 ${Math.round(cd * 360)}deg, rgba(0,0,0,0) 0)`;
    if (ring !== lastRing) { btns.DASH.querySelector('.ring').style.background = ring; lastRing = ring; }
  }

  // ---------------------------------------------------------------- 画面本身：右半边点一下跳，左半边上下滑换道，右上角暂停 / 跳过
  const touches = new Map();   // pointerId → { action, y0, swiped }
  canvas.style.touchAction = 'none';
  // game.js 自己的 pointerdown 先记下 game.click；这里再按场景决定这一下算什么
  canvas.addEventListener('pointerdown', e => {
    const pt = toCanvas(e);
    e.preventDefault();
    if (playing()) {
      game.click = null;
      if (inBox(pt, CORNER)) { pressed.ESC = true; return; }
      const a = pt.x > W * 0.55 ? 'JUMP' : null;
      touches.set(e.pointerId, { action: a, x0: pt.x, y0: pt.y, swiped: false });
      if (a) press(a);
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      return;
    }
    if (game.state === 'story' && game.storySkippable && inBox(pt, CORNER)) { game.click = null; pressed.ESC = true; return; }
    if (game.state === 'end') {
      game.click = null;
      if ((game.endT || 0) < 0.8) return;
      if (inBox(pt, END_BTN.again)) pressed.OK = true;
      else if (inBox(pt, END_BTN.title)) pressed.ESC = true;
    }
  }, { passive: false });
  canvas.addEventListener('pointermove', e => {
    const t = touches.get(e.pointerId); if (!t || !playing()) return;
    const pt = toCanvas(e);
    if (!t.action && !t.swiped && Math.abs(pt.y - t.y0) > SWIPE) { pressed[pt.y < t.y0 ? 'UP' : 'DOWN'] = true; t.swiped = true; }
  });
  function end(e) { const t = touches.get(e.pointerId); if (!t) return; if (t.action) release(t.action); touches.delete(e.pointerId); }
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  // 切到后台 / 来电时把按住的键都松开，回来不会自己一直跳
  addEventListener('blur', () => {
    touches.clear();
    for (const k in held) { held[k] = 0; keys[k] = false; }
    for (const k in btns) btns[k].classList.remove('down');
  });

  // ---------------------------------------------------------------- 文字：把键盘的说法换成按钮
  const EXACT = {
    '空格': '跳', '空格 ×2': '跳 ×2', 'W / S': '▲ ▼', 'Shift': '冲刺', 'SHIFT': '冲刺',
    'W / S 选择　空格 / Enter 开始（也可以直接点击）': '点一下难度，马上开始',
    '游戏中：空格 跳（踩物可借力）　W / S 换道　Shift 冲刺 / 钻箱　Esc 暂停': '游戏中：右手「跳」「冲刺」，左手 ▲ ▼ 换道（也可以上下滑），右上角暂停',
    '空格 / Enter 继续　Esc 跳过': '点击屏幕继续',
    'Enter 同难度再来一次　　Esc 回到标题（可换难度）': '',
    'W / S 选择　Enter 确定　Esc 继续　（换难度请回到标题）': '点一下选项　（换难度请回到标题）',
  };
  const RULES = [
    [/^空格 /, '按「跳」'], [/再按空格/g, '再按「跳」'], [/按空格/g, '按「跳」'], [/空格/g, '「跳」'],
    [/按 Shift/g, '按「冲刺」'], [/Shift/g, '「冲刺」'], [/按 W \/ S/g, '按 ▲ ▼'], [/W \/ S/g, '▲ ▼'],
  ];
  function mapText(s) {
    if (typeof s !== 'string') return s;
    if (s in EXACT) return EXACT[s];
    for (const [re, to] of RULES) s = s.replace(re, to);
    return s;
  }
  const P = CanvasRenderingContext2D.prototype;
  for (const m of ['fillText', 'strokeText']) { const f = P[m]; P[m] = function (t, ...a) { return f.call(this, mapText(t), ...a); }; }
  const mt = P.measureText; P.measureText = function (t) { return mt.call(this, mapText(t)); };

  // ---------------------------------------------------------------- 画右上角按钮和结局按钮
  function drawCorner(text) {
    const r = CORNER;
    ctx.save(); ctx.globalAlpha = 0.75;
    ctx.fillStyle = 'rgba(20,14,30,0.6)'; roundRect(r.x, r.y, r.w, r.h, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(242,184,214,0.8)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#fbe8f3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (text === 'pause') { ctx.fillRect(r.x + r.w / 2 - 20, r.y + 24, 13, r.h - 48); ctx.fillRect(r.x + r.w / 2 + 7, r.y + 24, 13, r.h - 48); }
    else { ctx.font = `600 30px ${FONT}`; ctx.fillText(text, r.x + r.w / 2, r.y + r.h / 2 + 2); }
    ctx.restore();
  }
  function drawEndBtns() {
    if ((game.endT || 0) < 0.8) return;
    ctx.save();
    for (const k in END_BTN) {
      const b = END_BTN[k];
      ctx.fillStyle = 'rgba(28,21,40,0.9)'; roundRect(b.x, b.y, b.w, b.h, 22); ctx.fill();
      ctx.strokeStyle = 'rgba(242,184,214,0.9)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#fbe8f3'; ctx.font = `600 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2 + 2);
    }
    ctx.restore();
  }
  const baseRender = render;
  render = function () {
    baseRender();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (game.state === 'play') drawCorner('pause');
    else if (game.state === 'story' && game.storySkippable) drawCorner('跳过');
    else if (game.state === 'end') drawEndBtns();
    syncUI();
  };
  window.__touch = { btns, CORNER, END_BTN, mapText };
})();
