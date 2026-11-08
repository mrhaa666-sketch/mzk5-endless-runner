// 《荆棘之路 逃跑计划》心理恐怖效果
// 「恐惧值」0 到 1：关卡越往后、失误越多就越高。下面所有效果都跟着它逐渐加重。
// 调强度改 TUNE；整体关掉恐怖效果把 visual 和 audio 设成 0。
'use strict';

window.Horror = (() => {
  const TUNE = {
    levelFear: [[0.0, 0.25], [0.3, 0.6], [0.65, 0.95]],  // 每关开头 → 结尾的恐惧值
    perMistake: 0.06,      // 每失去一格距离，恐惧值额外增加多少
    visual: 1,             // 画面效果总强度（0 关闭）
    audio: 1,              // 声音效果总强度（0 关闭）
    breathStart: 0.12,     // 恐惧值超过这个数开始出现呼吸声
    heartStart: 0.45,      // 开始出现心跳
    droneStart: 0.25,      // 开始出现低沉嗡鸣
    flickerStart: 0.35,    // 开始出现灯光闪烁
    glitchStart: 0.55,     // 开始出现画面撕裂
    flashStart: 0.28,      // 开始闪过红字、白字
    flashCard: 0.8,        // 开始偶尔整屏一黑、正中闪一个大字
    flashText: 1,          // 闪字总强度（0 关闭；对闪光敏感的话调低）
    lite: false,           // 轻量模式（手机上自动打开）：不复制整个画面、不用滤镜，效果接近但省很多性能
  };
  // 红字是「追来的那个人」的声音，白字是瑞希自己脑子里的声音
  const WORDS = {
    red: ['别回头', '找到你了', '为什么要逃', '回来', '跑不掉的', '不许走', '我看见你了', '瑞希'],
    white: ['她就在后面', '一直都在看着你', '……', '你听见了吗', '还要跑多久', '脚步声', '不要停', '是谁在叫我'],
    // 坏结局专用
    badRed: ['没有人在找你', '你被讨厌了', '别来找我', '看不见', '只剩你一个', '为什么要逃'],
    badWhite: ['K', '雪', 'えななん', '很可爱哦', '没有脸', '谁都找不到', '……', '再系紧一点'],
  };

  let fear = 0, target = 0, active = false, muted = false;
  let flickerT = 0, glitchT = 0, flashes = [], flashCD = 4, storyMode = false;
  // 呼吸节奏：breath 是画面用的呼吸曲线（吸气时升高）
  let breathStartAt = 0, breathPeriod = 3, breathOn = false;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const over = (start) => clamp01((fear - start) / (1 - start));

  // ---------------------------------------------------------- 画面
  let off = null, octx = null, grain = null;
  function ensureCanvases(W, H) {
    if (off) return;
    off = document.createElement('canvas'); off.width = W; off.height = H; octx = off.getContext('2d');
    grain = document.createElement('canvas'); grain.width = 256; grain.height = 256;
    const g = grain.getContext('2d'), d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
  }
  function breathCurve(now) {
    if (!breathOn) return 0;
    const ph = ((now - breathStartAt) / breathPeriod) % 1;
    return ph < 0.4 ? Math.sin(ph / 0.4 * Math.PI / 2) : Math.cos((ph - 0.4) / 0.6 * Math.PI / 2);
  }

  // 世界画面画完之后调用：整体变灰变暗、随呼吸缩放、暗角、噪点、闪烁、撕裂、闪字
  function postFX(ctx, canvas, W, H, now) {
    const f = fear * TUNE.visual;
    if (f < 0.01) return;
    ensureCanvases(W, H);
    const b = breathCurve(now);
    if (TUNE.lite) {
      // 轻量模式：直接在画面上叠色——去色、压暗；画面撕裂时才复制画面
      ctx.save();
      ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.7 * f})`; ctx.fillRect(0, 0, W, H);
      const v = 255 * (1 - 0.32 * f) | 0;
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      if (glitchT > 0) {
        octx.clearRect(0, 0, W, H); octx.drawImage(canvas, 0, 0);
        for (let i = 0; i < 5; i++) {
          const y = Math.random() * H, h = 8 + Math.random() * 40, dx = (Math.random() - 0.5) * 70;
          ctx.drawImage(off, 0, y, W, h, dx, y, W, h);
        }
      }
    } else {
    octx.clearRect(0, 0, W, H); octx.drawImage(canvas, 0, 0);
    const zoom = 1 + 0.014 * f * b;
    const blur = f > 0.6 ? (f - 0.6) * 4 * (1 - b) : 0;
    ctx.save();
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.filter = `saturate(${1 - 0.7 * f}) brightness(${1 - 0.32 * f}) contrast(${1 + 0.25 * f}) sepia(${0.18 * f})` + (blur > 0.05 ? ` blur(${blur.toFixed(2)}px)` : '');
    ctx.setTransform(zoom, 0, 0, zoom, W / 2 * (1 - zoom), H / 2 * (1 - zoom));
    ctx.drawImage(off, 0, 0);
    ctx.restore();
    // 画面撕裂：几条横带错位，再叠一层偏红的残影
    if (glitchT > 0) {
      for (let i = 0; i < 5; i++) {
        const y = Math.random() * H, h = 8 + Math.random() * 40, dx = (Math.random() - 0.5) * 70;
        ctx.drawImage(off, 0, y, W, h, dx, y, W, h);
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.12; ctx.filter = 'hue-rotate(-40deg) saturate(3)';
      ctx.drawImage(off, 8, 0); ctx.restore();
    }
    }
    // 冷红色调
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgb(${255 - 45 * f | 0},${255 - 95 * f | 0},${255 - 60 * f | 0})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    // 呼吸暗角：越恐惧越窄，吸气时张开、呼气时收紧
    const inner = W * (0.5 - 0.2 * f + 0.05 * b * f), outer = W * (0.86 - 0.1 * f);
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.max(50, inner), W / 2, H / 2, outer);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(8,0,6,${0.25 + 0.6 * f})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // 胶片噪点
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.05 + 0.12 * f;
    const ox = Math.random() * 256 | 0, oy = Math.random() * 256 | 0;
    for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(grain, x, y);
    ctx.restore();
    // 灯光闪烁
    if (flickerT > 0) { ctx.fillStyle = `rgba(0,0,0,${0.45 + 0.3 * Math.random()})`; ctx.fillRect(0, 0, W, H); }
    // 一闪而过的文字
    drawFlashes(ctx, W, H);
  }

  // ---------------------------------------------------------- 闪字
  const SERIF = '"Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif';
  const pick = a => a[Math.random() * a.length | 0];
  // kind: word 一个词 / row 一整行重复的名字 / card 整屏一黑、正中一个大字
  function spawn(color, kind = 'word', delay = 0) {
    const list = WORDS[(storyMode ? 'bad' + color[0].toUpperCase() + color.slice(1) : color)];
    const text = kind === 'row' ? '瑞希'.repeat(40) : pick(list);
    const yMin = storyMode ? 150 : 190, yMax = storyMode ? 560 : 760;
    flashes.push({
      color, kind, text, delay, t: 0,
      d: kind === 'card' ? 0.07 + Math.random() * 0.04 : color === 'red' ? 0.1 + Math.random() * 0.12 : 0.07 + Math.random() * 0.09,
      x: 300 + Math.random() * 1320, y: yMin + Math.random() * (yMax - yMin),
      size: kind === 'card' ? 230 : color === 'red' ? 110 + Math.random() * 90 : 70 + Math.random() * 70,
      a: Math.min(1, (color === 'red' ? 0.55 : 0.4) + 0.4 * fear) * TUNE.flashText,
      rot: (Math.random() - 0.5) * 0.12,
    });
  }
  // 失误时立刻闪一个红字
  function jolt() { if (TUNE.visual > 0 && TUNE.flashText > 0 && active && fear > 0.15) spawn('red'); }
  function drawFlashes(ctx, W, H) {
    for (const f of flashes) {
      if (f.delay > 0) continue;
      const a = f.a * (Math.random() < 0.2 ? 0.45 : 1);
      ctx.save();
      if (f.kind === 'card') {
        ctx.fillStyle = `rgba(4,0,3,${0.88 * f.a})`; ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = a; ctx.font = `900 ${f.size}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = f.color === 'red' ? '#d0102a' : '#f3edf0'; ctx.fillText(f.text, W / 2, H / 2);
      } else if (f.kind === 'row') {
        ctx.globalAlpha = a * 0.55; ctx.font = `700 34px ${SERIF}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#c0101f'; ctx.fillText(f.text, -((f.x * 7) % 68), f.y);
      } else {
        ctx.font = `900 ${f.size | 0}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        // 整个字都留在画面里
        const half = ctx.measureText(f.text).width / 2 + 30;
        const x = half * 2 > W ? W / 2 : Math.min(W - half, Math.max(half, f.x));
        ctx.translate(x, f.y); ctx.rotate(f.rot);
        if (f.color === 'red') {
          // 重影：错开一点的暗红残像
          ctx.globalAlpha = a * 0.45; ctx.fillStyle = '#5a0010'; ctx.fillText(f.text, 7, -4);
          ctx.globalAlpha = a; ctx.shadowColor = 'rgba(150,0,16,0.9)'; ctx.shadowBlur = 22; ctx.fillStyle = '#d6142c';
        } else {
          ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 14; ctx.fillStyle = '#f4eef2';
        }
        ctx.fillText(f.text, 0, 0);
      }
      ctx.restore();
    }
  }
  function updateFlashes(dt) {
    for (const f of flashes) { if (f.delay > 0) f.delay -= dt; else f.t += dt; }
    flashes = flashes.filter(f => f.t < f.d);
    if (TUNE.visual <= 0 || TUNE.flashText <= 0 || fear < TUNE.flashStart) return;
    const k = over(TUNE.flashStart);
    flashCD -= dt * (storyMode ? 1.6 : 0.6 + 1.4 * k);
    if (flashCD > 0) return;
    flashCD = 2.5 + Math.random() * 4.5;
    const red = Math.random() < 0.3 + 0.45 * k;
    if (fear > TUNE.flashCard && Math.random() < 0.12) { spawn(red ? 'red' : 'white', 'card'); flashCD += 6; return; }
    if (red && fear > 0.6 && Math.random() < 0.18) { spawn('red', 'row'); return; }
    spawn(red ? 'red' : 'white');
    // 越怕越容易一连闪两三个
    const extra = fear > 0.65 ? (Math.random() < 0.5 ? 2 : 1) : fear > 0.45 && Math.random() < 0.4 ? 1 : 0;
    for (let i = 1; i <= extra; i++) spawn(Math.random() < 0.5 ? 'red' : 'white', 'word', i * (0.09 + Math.random() * 0.12));
  }

  // 角色额外变暗：真冬比瑞希暗得多
  function charFilter(who) {
    const f = fear * TUNE.visual;
    if (f < 0.01) return 'none';
    return who === 'mafuyu'
      ? `brightness(${1 - 0.55 * f}) contrast(${1 + 0.35 * f}) saturate(${1 - 0.5 * f})`
      : `brightness(${1 - 0.2 * f}) saturate(${1 - 0.3 * f})`;
  }
  // 表情阶段：0 正常，1 惊慌，2 崩溃（需要对应的图，没有就用原图）
  const stage = () => fear > 0.66 ? 2 : fear > 0.33 ? 1 : 0;

  // ---------------------------------------------------------- 声音（全部用代码合成，不需要音频文件）
  let ac = null, master, droneGain, hiGain, noiseBuf, nextBreath = 0, nextBeat = 0;
  function unlock() {
    if (ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.04 * w) / 1.04; d[i] = w * 0.6 + last * 3; }
    // 低沉嗡鸣：两个略微走调的低音，透过低通
    droneGain = ac.createGain(); droneGain.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 200;
    for (const fr of [55, 55.8, 82.6]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(lp); o.start(); }
    lp.connect(droneGain); droneGain.connect(master);
    // 高处细细的耳鸣声，忽强忽弱
    hiGain = ac.createGain(); hiGain.gain.value = 0;
    const hi = ac.createOscillator(); hi.type = 'sine'; hi.frequency.value = 1760;
    const trem = ac.createOscillator(); trem.frequency.value = 0.3; const tg = ac.createGain(); tg.gain.value = 0.5;
    const hv = ac.createGain(); hv.gain.value = 0.5; trem.connect(tg); tg.connect(hv.gain);
    hi.connect(hv); hv.connect(hiGain); hiGain.connect(master); hi.start(); trem.start();
  }
  // 一口气：滤过的噪声，吸气音调上扬、呼气下沉；越恐惧越抖
  function breath(at, inhale, dur, vol, shaky) {
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
    const g = ac.createGain(); g.gain.value = 0;
    bp.frequency.setValueAtTime(inhale ? 850 : 1150, at);
    bp.frequency.linearRampToValueAtTime(inhale ? 1500 : 620, at + dur);
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + dur * (inhale ? 0.55 : 0.25));
    if (shaky) for (let i = 1; i < 6; i++) g.gain.linearRampToValueAtTime(vol * (0.55 + 0.45 * Math.random()), at + dur * (0.3 + i * 0.1));
    g.gain.linearRampToValueAtTime(0, at + dur);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(at, Math.random() * 1.2); src.stop(at + dur + 0.05);
  }
  function thump(at, vol) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(70, at); o.frequency.exponentialRampToValueAtTime(40, at + 0.18);
    const g = ac.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, at + 0.22);
    o.connect(g); g.connect(master); o.start(at); o.stop(at + 0.25);
  }
  function updateAudio(units) {
    if (!ac) return;
    const now = ac.currentTime, A = TUNE.audio, on = active && !muted && A > 0;
    master.gain.setTargetAtTime(on ? 0.9 : 0, now, 0.3);
    droneGain.gain.setTargetAtTime(on ? 0.11 * A * over(TUNE.droneStart) : 0, now, 0.8);
    hiGain.gain.setTargetAtTime(on ? 0.018 * A * over(0.7) : 0, now, 0.8);
    breathOn = on && fear > TUNE.breathStart;
    if (breathOn && now >= nextBreath - 0.05) {
      const urgent = units <= 1 ? 0.8 : 1;
      breathPeriod = (3.4 - 2.3 * fear) * urgent;
      const vol = (0.05 + 0.3 * over(TUNE.breathStart)) * A, shaky = fear > 0.55;
      const t0 = Math.max(now, nextBreath);
      breathStartAt = performance.now() / 1000 + (t0 - now);
      breath(t0, true, breathPeriod * 0.38, vol, shaky);
      // 恐惧很高时偶尔倒抽一口气（吸不上来）
      if (fear > 0.75 && Math.random() < 0.35) breath(t0 + breathPeriod * 0.2, true, breathPeriod * 0.15, vol * 0.9, true);
      breath(t0 + breathPeriod * 0.42, false, breathPeriod * 0.5, vol * 0.85, shaky);
      nextBreath = t0 + breathPeriod;
    }
    if (on && fear > TUNE.heartStart && now >= nextBeat - 0.05) {
      const bpm = 70 + 75 * over(TUNE.heartStart) + (units <= 1 ? 20 : 0), t0 = Math.max(now, nextBeat), v = 0.35 * A * (0.4 + 0.6 * over(TUNE.heartStart));
      thump(t0, v); thump(t0 + 0.22, v * 0.7);
      nextBeat = t0 + 60 / bpm;
    }
  }

  // ---------------------------------------------------------- 每帧更新
  // s：{ target 恐惧目标值, active 是否在恐怖场景里, paused, muted, units }
  function update(dt, s) {
    target = clamp01(s.target);
    fear += (target - fear) * Math.min(1, dt * 0.6);
    active = s.active; muted = s.muted;
    if (ac) { if (s.paused && ac.state === 'running') ac.suspend(); else if (!s.paused && ac.state === 'suspended') ac.resume(); }
    if (!s.paused) updateAudio(s.units);
    storyMode = !!s.story;
    if (!active || s.paused) { flickerT = glitchT = 0; flashes = []; return; }
    flickerT = Math.max(0, flickerT - dt); glitchT = Math.max(0, glitchT - dt);
    updateFlashes(dt);
    if (TUNE.visual > 0) {
      if (Math.random() < dt * 0.25 * over(TUNE.flickerStart)) flickerT = 0.05 + Math.random() * 0.1;
      if (Math.random() < dt * 0.3 * over(TUNE.glitchStart)) glitchT = 0.08 + Math.random() * 0.12;
    }
  }
  // 背景音乐越来越慢、越来越低沉
  const bgmRate = () => 1 - 0.16 * fear * TUNE.audio;
  const bgmVolume = () => 1 - 0.35 * fear * TUNE.audio;

  // 耳鸣：被车撞上那一刻，很高、很细的一声，慢慢淡掉
  function ring(dur = 3) {
    if (!ac || !master) return;
    const t0 = ac.currentTime, g = ac.createGain(), o = ac.createOscillator(), o2 = ac.createOscillator();
    o.frequency.value = 4200; o2.frequency.value = 4213;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.06, t0 + 0.05); g.gain.exponentialRampToValueAtTime(0.0005, t0 + dur);
    o.connect(g); o2.connect(g); g.connect(master); o.start(t0); o2.start(t0); o.stop(t0 + dur + 0.1); o2.stop(t0 + dur + 0.1);
  }
  return { TUNE, update, postFX, drawFlashes, jolt, ring, charFilter, stage, unlock, bgmRate, bgmVolume, get fear() { return fear; }, set fear(v) { fear = v; } };
})();
