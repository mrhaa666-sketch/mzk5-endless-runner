// 《荆棘之路 逃跑计划》—— 主程序
// 二次创作，与《世界计划》官方无关。直接用浏览器打开 index.html 即可游玩。
// 关卡布局在 levels.js，剧情台词在 story.js。
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 1920, H = 1080;
const A = 'assets/';
const FONT = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","Hiragino Sans GB",sans-serif';
const DEBUG = /[?&]debug/.test(location.search);
const LEVELS = window.LEVELS, STORY = window.STORY;
const DIFF = window.DIFFICULTY, DIFF_ORDER = window.DIFFICULTY_ORDER;

// ================================================================ 手感参数（调手感改这里）
const RUN = 480, RUN_FAST = 560, RUN_SLOW = 360;   // 自动奔跑速度；D 稍快、A 稍慢
const ACC = 1400;                                  // 速度变化快慢
const G = 2600, JUMP_V = 1100, JUMP_CUT = 0.55;    // 重力、起跳速度、提前松开空格时保留的速度比例
const COYOTE = 0.09, JUMP_BUFFER = 0.12;           // 离地后仍可起跳的时间、提前按空格的缓冲
const PLATFORM_JUMP_V = 1380;                      // 踩在障碍或车上时的借力起跳速度
// 学生和行人按画面上的实际身高判定（打伞的行人高一些）；没碰到就不算失误
const PEOPLE_H = { student_boy: 200, student_girl: 200, student_pair: 200, walker_office: 200, walker_student: 200, walker_umbrella: 224 };
const AIR_GRACE_X = 10, AIR_GRACE_Z = 6;           // 在空中时障碍左右各让出 10 像素、顶部让出 6 像素，擦边不算碰到
const DASH_V = 900, DASH_T = 0.38, DASH_CD = 0.9;  // 冲刺速度、持续时间、冷却
const DASH_BUFFER = 0.12, GAP_DASH_LEAD = 110;      // 落地前的输入缓冲、门洞前可提前冲刺的距离
const TUNNEL_CLEARANCE = 96;
const WALL_SIDE_SLACK = 12;                        // 贴墙换道时允许和旁边的墙重叠的像素                       // 整个滑行动作出箱后才恢复站姿
const LANE_SPEED = 7;                              // 换道速度（跑道/秒）
const HW = 26;                                     // 瑞希碰撞半宽
// 距离不显示数字，只靠画面上真冬离瑞希多远来看。开局（满距离）时真冬在画面最左边，每失误一格就近一截。
const GAP_FULL = 560, GAP_MIN = 50;
const gapPx = units => GAP_MIN + (GAP_FULL - GAP_MIN) * units / unitsMax();
const TOP_H = 999;
const STUDENT_WALL_LEAD = 260;                     // 人墙前面那个障碍在 x - 260 处
const STUDENT_WALL_V = 120, STUDENT_WALL_LATE = 60;  // 人墙学生走路的速度；瑞希越过障碍 60 像素时学生才走到                                 // 跳不过去的障碍用这个高度

// ================================================================ 素材表
const ANIMS = {
  'mizuki/run': [8, 14, 232], 'mizuki/jump': [6, 12, 232], 'mizuki/slide': [4, 12, 232],
  'mizuki/trip': [3, 12, 232], 'mizuki/caught': [3, 8, 232], 'mizuki/boost': [4, 12, 232],
  'mafuyu/jog': [8, 12, 233], 'mafuyu/reach': [4, 10, 233], 'mafuyu/stare': [2, 2, 233], 'mafuyu/hold_wrist': [3, 8, 233],
  // 恐惧表情差分（可选）：放进对应文件夹就会自动使用，没有就用原图
  'mizuki/run_fear1': [8, 14, 232], 'mizuki/run_fear2': [8, 14, 232], 'mafuyu/jog_fear1': [8, 12, 233], 'mafuyu/jog_fear2': [8, 12, 233],
};
// 全道 / 单道静态障碍：w 碰撞宽度，h 正面高度（来自障碍物来源清单）
const STATIC = {
  desk_row: { dir: 'kamiyama', w: 196, h: 136, full: true },
  cardboard_wall: { dir: 'kamiyama', w: 206, h: 138, full: true },
  cleaning_barrier: { dir: 'kamiyama', w: 212, h: 140, full: true },
  gym_mats: { dir: 'kamiyama', w: 200, h: 131, full: true },
  barrier_row: { dir: 'shibuya', w: 186, h: 120, full: true },
  trash_bag_pile: { dir: 'alley', w: 213, h: 118, full: true },
  crate_row: { dir: 'alley', w: 194, h: 121, full: true },
  pallet_row: { dir: 'alley', w: 207, h: 124, full: true },
  crate_platform: { dir: 'alley', w: 234, h: 185, full: true },
  ac_platform: { dir: 'alley', w: 242, h: 184, full: true },
  cabinet_platform: { dir: 'alley', w: 237, h: 180, full: true },
  junk_wall_a: { dir: 'alley', w: 272, h: TOP_H },
  junk_wall_b: { dir: 'alley', w: 275, h: TOP_H },
  junk_wall_gap: { dir: 'alley', w: 280, h: TOP_H, gap: true },   // 外观和普通高墙一样，入画后用提示标出
};
const STUDENTS = { student_boy: 70, student_girl: 70, student_pair: 120 };   // 碰撞宽度
const WALKERS = ['walker_office', 'walker_student', 'walker_umbrella'];
const CARS = ['car_taxi', 'car_compact', 'car_van', 'car_kei'];
const CAR_W = 360, CAR_H = 119, CAR_V = -330;
// 贴图的轮胎画在跑道线下 18 像素。以下高度从跑道线量起，按车头、车厢、车尾分段。
const CAR_PROFILE = {
  car_taxi: [[-180, -100, 80], [-100, 125, 119], [125, 180, 82]],
  car_compact: [[-180, -96, 76], [-96, 146, 119], [146, 180, 74]],
  car_van: [[-180, -144, 77], [-144, 176, 119], [176, 180, 95]],
  car_kei: [[-180, -108, 75], [-108, 157, 119], [157, 180, 73]],
};

const IMG = {};
const imageList = [];
function addImg(key, path, optional = false) { imageList.push([key, path, optional]); }
// 表情差分是可选的：先只试读第一帧，找到了再读其余帧（没有的话浏览器控制台里会有几条「找不到文件」，属正常）
for (const k in ANIMS) for (let i = 0; i < (k.includes('_fear') ? 1 : ANIMS[k][0]); i++) addImg(`${k}/${i}`, `characters/${k}/${String(i).padStart(2, '0')}.png`, k.includes('_fear'));
addImg('portrait/mizuki', 'characters/mizuki/portrait.png');
addImg('portrait/mafuyu', 'characters/mafuyu/portrait.png');
// 隐藏结局用：奏、绘名（平常 / 担心）
// 误会结局用：同学的头像，瑞希慌张、真冬疑惑的表情
addImg('portrait/classmate', 'characters/classmate/portrait.png', true);
addImg('portrait/mizuki_panic', 'characters/mizuki/portrait_panic.png', true);
addImg('portrait/mafuyu_puzzled', 'characters/mafuyu/portrait_puzzled.png', true);
for (const c of ['kanade', 'ena']) { addImg('portrait/' + c, `characters/${c}/portrait.png`, true); addImg(`portrait/${c}_worried`, `characters/${c}/portrait_worried.png`, true); }
for (const L of LEVELS) for (const l of ['far', 'mid', 'near']) {
  addImg(`map/${L.map}/${l}`, `maps/${L.map}/${l}.png`);
  addImg(`map/${L.map}/${l}_dark`, `maps/${L.map}/${l}_dark.png`, true);   // 恐怖变体：恐惧值升高时慢慢盖上来
}
for (const v of ['cold', 'smile']) addImg('portrait/mafuyu_' + v, `characters/mafuyu/portrait_${v}.png`, true);
addImg('bg/classroom', 'maps/kamiyama/intro_classroom.png');
for (const k in STATIC) addImg('obs/' + k, `obstacles/${STATIC[k].dir}/${STATIC[k].image || k}.png`);
for (const k in STUDENTS) for (const d of ['left', 'right']) for (let i = 0; i < 6; i++) addImg(`obs/${k}/${d}/${i}`, `obstacles/kamiyama/${k}/${d}/0${i}.png`);
for (const k of WALKERS) for (const d of ['front', 'back']) for (let i = 0; i < 6; i++) addImg(`obs/${k}/${d}/${i}`, `obstacles/shibuya/${k}/${d}/0${i}.png`);
for (const k of CARS) for (let i = 0; i < 4; i++) addImg(`obs/${k}/${i}`, `obstacles/shibuya/${k}/0${i}.png`);
for (const s of ['crash_empty_sekai', 'crash_empty_sekai_glow', 'crash_crossing', 'rumor_hallway', 'rumor_alone']) addImg('scene/' + s, `scenes/${s}.png`, true);
for (const s of ['title', 'good_caught', 'good_caught_chibi', 'bad_escaped_01', 'bad_escaped_02', 'bad_escaped_03', 'bad_blindfold']) addImg('scene/' + s, `scenes/${s}.png`);
for (const u of ['danger_vignette', 'distance_bar', 'pause_button', 'pause_panel', 'title_logo']) addImg('ui/' + u, `ui/${u}.png`);
for (const c of ['kamiyama', 'shibuya', 'alley']) addImg('card/' + c, `ui/level_cards/${c}.png`);

// ================================================================ 音频
const BGM = { title: '01_title', kamiyama: '02_kamiyama', shibuya: '03_shibuya', alley: '04_alley', good: '05_good_caught.mp3', bad: '06_bad_escaped.mp3', crash: '01_title', rumor: '05_good_caught.mp3', rumorSad: '01_title' };   // crash 是隐藏结局：标题曲放慢、压低   // 没写扩展名的是 .wav
const SFX = { tile: '01_run_tile', asphalt: '02_run_asphalt', puddles: '03_run_puddles', jump: '04_jump_land', slide: '05_slide',
  boost: '06_metal_boost', climb: '07_fence_climb', horn: '08_horn_traffic', brake: '13_brake', siren: '14_siren_far', crowd: '15_crowd_murmur', cat: '09_cat_dart', trip: '10_trip',
  approach: '11_mafuyu_approach', lightcut: '12_light_cut' };
const audio = { bgm: null, bgmKey: null, steps: {}, muted: false, unlocked: false };
// ================================================================ 配音（日语）
// 文件是 assets/audio/voice/<剧情>_<第几句>.mp3，比如 crash_08.mp3 就是隐藏结局的第 9 句（从 0 数）。
// 只有列在这里的句子会播放；改台词顺序的话，记得把文件名一起改。
const VOICE_LINES = new Set(['alley_00', 'bad_01', 'bad_02', 'bad_04', 'bad_07', 'bad_12', 'bad_20', 'bad_21', 'bad_22', 'bad_24', 'crash_03', 'crash_04', 'crash_05', 'crash_06', 'crash_08', 'crash_09', 'crash_10', 'crash_11', 'crash_12', 'crash_13', 'crash_14', 'crash_15', 'crash_16', 'crash_25', 'good_00', 'good_01', 'good_02', 'good_03', 'good_04', 'good_05', 'good_08', 'intro_01', 'intro_03', 'intro_04', 'intro_05', 'intro_06', 'rumor2_01', 'rumor2_02', 'rumor_01', 'rumor_02', 'rumor_03', 'rumor_04', 'rumor_06', 'rumor_07', 'rumor_08', 'rumor_09', 'rumor_10', 'shibuya_00', 'shibuya_01']);
function playVoice(kind, i) {
  stopVoice();
  const id = `${kind}_${String(i).padStart(2, '0')}`;
  if (!VOICE_LINES.has(id) || !audio.unlocked) return;
  const a = new Audio(A + 'audio/voice/' + id + '.mp3');
  a.volume = audio.muted ? 0 : 0.95;
  a.onended = () => { if (audio.voice === a) audio.voice = null; };
  audio.voice = a; a.play().catch(() => {});
}
function stopVoice() { if (audio.voice) { audio.voice.pause(); audio.voice = null; } }
function playBgm(key, loop = true) {
  if (audio.bgmKey === key && audio.bgm) return;
  stopBgm();
  const a = new Audio(A + 'audio/bgm/' + BGM[key] + (BGM[key].includes('.') ? '' : '.wav'));
  a.loop = loop; a.volume = audio.muted ? 0 : 0.5;
  a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false;   // 放慢时音调跟着变低
  audio.bgm = a; audio.bgmKey = key;
  if (audio.unlocked) a.play().catch(() => {});
}
function stopBgm() { if (audio.bgm) { audio.bgm.pause(); audio.bgm = null; audio.bgmKey = null; } }
function sfx(key, vol = 0.8) {
  if (audio.muted || !audio.unlocked) return;
  const a = new Audio(A + 'audio/sfx/' + SFX[key] + '.wav'); a.volume = vol; a.play().catch(() => {});
}
function stepLoop(surface, on) {
  for (const k of ['tile', 'asphalt', 'puddles']) {
    let a = audio.steps[k];
    const want = on && k === surface && !audio.muted && audio.unlocked;
    if (want && !a) { a = audio.steps[k] = new Audio(A + 'audio/sfx/' + SFX[k] + '.wav'); a.loop = true; a.volume = 0.45; }
    if (!a) continue;
    if (want && a.paused) a.play().catch(() => {});
    if (!want && !a.paused) a.pause();
  }
}
function setMuted(m) { audio.muted = m; if (audio.bgm) audio.bgm.volume = m ? 0 : 0.5; if (m) stepLoop(null, false); }

// ================================================================ 输入
// 空格 跳；W / S 换道；Shift 冲刺；A / D 稍慢 / 稍快；Esc 暂停；M 静音；Enter 确定
const keys = {}, pressed = {};
// 触屏设备（手机、平板）：打开 touch.js 里的屏幕按钮；电脑上不受影响
const TOUCH = !!window.FORCE_TOUCH || /[?&]touch/.test(location.search) || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches);
const KEYMAP = { Space: 'JUMP', KeyW: 'UP', KeyS: 'DOWN', ArrowUp: 'UP', ArrowDown: 'DOWN', KeyA: 'SLOW', KeyD: 'FAST',
  ArrowLeft: 'SLOW', ArrowRight: 'FAST', ShiftLeft: 'DASH', ShiftRight: 'DASH', Enter: 'OK', NumpadEnter: 'OK',
  Escape: 'ESC', KeyP: 'ESC', KeyM: 'MUTE', F2: 'INVINCIBLE' };
addEventListener('keydown', e => {
  const k = KEYMAP[e.code];
  unlockAudio();
  if (k !== 'INVINCIBLE') pressed.ANY = true;
  if (!k) return;
  e.preventDefault();
  if (!keys[k]) pressed[k] = true;
  keys[k] = true;
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
  for (const k in pressed) delete pressed[k];
  game.click = null;
  if (game.state === 'play') openPause();
});
canvas.addEventListener('pointerdown', e => {
  unlockAudio();
  const r = canvas.getBoundingClientRect();
  game.click = { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  pressed.ANY = true;
});
// 浏览器要等玩家第一次按键或点击后才允许出声。之后每次按键都检查一下：音乐该响却没响，就再播一次
function unlockAudio() {
  if (!audio.unlocked) { audio.unlocked = true; Horror.unlock(); }
  if (audio.bgm && audio.bgm.paused && game.state !== 'paused' && !audio.muted) audio.bgm.play().catch(() => {});
}
const advance = () => pressed.OK || pressed.JUMP || game.click;

// ================================================================ 状态
const NAMES = { mizuki: '晓山瑞希', mafuyu: '朝比奈真冬', kanade: '宵崎奏', ena: '东云绘名', classmate: '同学', mirror: '？？？' };
const NAME_COLOR = { mizuki: '#ffb7d5', mafuyu: '#b9a3ff', kanade: '#8fb4ff', ena: '#ffb98a', classmate: '#a8d8b0', mirror: '#9a8f9a' };
const KEY_ITEMS = [['空格', '跳 / 踩物借力'], ['W / S', '换道'], ['Shift', '冲刺 / 钻杂物堆'], ['A / D', '稍慢 / 稍快']].filter(i => !TOUCH || i[0] !== 'A / D');   // 手机上没有稍慢 / 稍快
const LEVEL_GUIDE = {
  shibuya: { title: '涩谷十字路口', items: [['空格', '跳过路障'], ['W / S', '换到没车的道'], ['A / D', '稍慢 / 稍快 对时机']] },
  alley: { title: '夜巷', items: [['空格', '跳过矮杂物'], ['空格 ×2', '跳上平台再借力跳'], ['W / S', '高墙跳不过，换道'], ['Shift', '三道都堵死时钻过去']] },
};
if (TOUCH) for (const k in LEVEL_GUIDE) LEVEL_GUIDE[k].items = LEVEL_GUIDE[k].items.filter(i => i[0] !== 'A / D');
const LANE_NAME = ['后排', '中间', '前排'];
const HINTS = {
  desk_row: '空格 跳过课桌', cardboard_wall: '空格 跳过纸箱', cleaning_barrier: '空格 跳过清扫推车', gym_mats: '空格 跳过体育垫',
  student: '学生跳不过去：按 W / S 换道躲开', student_wall: '学生堵住了整条走廊：先跳上前面的杂物，站在上面再按空格就能借力跳过去', barrier_row: '空格 跳过路障',
  car: '车：按 W / S 换到空着的道。撞上车、跳上车顶或从车上跳过去，真冬都会追近', trash_bag_pile: '空格 跳过垃圾袋', crate_row: '空格 跳过周转箱',
  pallet_row: '空格 跳过木托盘', crate_platform: '这堆比较高：跳上去站稳，再按空格借力跳下去', ac_platform: '踩上平台后可以借力跳', cabinet_platform: '踩上平台后可以借力跳',
  wall: '高墙跳不过去：换到空着的道绕过去',
};
const game = {
  state: 'loading', t: 0, fade: 0, fadeTo: null, click: null,
  invincible: DEBUG,
  level: 0, L: null, p: null, m: null, obs: [], camX: 0,
  hintsShown: {}, hint: null, story: null, storySkippable: true, pause: { sel: 0 }, ending: null,
  units: 5, unitsVis: 5, unitsAtLevel: 5, popups: [], catchT: null, approachT: 0, keyHintT: 0,
  diff: 'normal', titleSel: 1, stats: null, records: loadRecords(), seed: 1,
};
const unitsMax = () => DIFF[game.diff].units;
// 按当前难度取关卡里的值（可以直接写一个值，也可以写 { easy, normal, hard }）
const byDiff = v => (v && !Array.isArray(v) && typeof v === 'object') ? (v[game.diff] ?? v.normal) : v;
function newStats() { return { late: 0, hit: 0, time: 0, level: 0 }; }
// 每个难度达成过哪些结局，存在浏览器里；存不了也不影响游戏
function loadRecords() { try { return JSON.parse(localStorage.getItem('thornroad_records') || '{}') || {}; } catch (e) { return {}; } }
function saveRecord(kind) {
  if (game.usedInvincible) return;   // 开过无敌测试的这一局不计入记录
  const r = game.records[game.diff] = game.records[game.diff] || {};
  r[kind] = true;
  if (kind === 'bad') r.bestLeft = Math.max(r.bestLeft || 0, game.units);
  try { localStorage.setItem('thornroad_records', JSON.stringify(game.records)); } catch (e) {}
}
const laneY = (lf) => { const l = game.L.lanes; const i = Math.max(0, Math.min(1, Math.floor(lf))); return l[i] + (l[i + 1] - l[i]) * (lf - i); };

// ================================================================ 关卡搭建
function buildLevel(L) {
  const obs = [];
  let carN = 0;
  for (const it of byDiff(L.items)) {
    const [type, x, a, b] = it;
    if (STATIC[type]) {
      const s = STATIC[type];
      obs.push({ kind: s.full ? 'full' : 'wall', type, x, w: s.w, h: s.h, lane: s.full ? null : a, gap: !!s.gap, hint: s.full ? type : (s.gap ? null : 'wall') });
    } else if (type === 'student_wall') {
      // 人墙：三条道都站着学生，前面一定配一个能站上去的全道障碍（默认课桌），踩上去借力跳过
      // 学生从右边走过来，刚好走到障碍跟前、还在走的时候，瑞希踩着障碍借力跳过去；没跳的话他们就停在障碍前
      const base = STATIC[a] ? a : 'desk_row', s = STATIC[base], ob = x - STUDENT_WALL_LEAD;
      obs.push({ kind: 'full', type: base, x: ob, w: s.w, h: s.h, lane: null, gap: false, hint: 'student_wall' });
      const walk = (1500 + STUDENT_WALL_LATE) / (1 + RUN / STUDENT_WALL_V);   // 学生被激活后要走的距离，让他们和瑞希同时到
      ['student_boy', 'student_pair', 'student_girl'].forEach((t, ln) => {
        const stopX = ob + s.w / 2 + STUDENTS[t] / 2 + 25;
        obs.push({ kind: 'student', type: t, x: stopX + walk, stopX, w: STUDENTS[t], h: PEOPLE_H[t], lane: ln, vx: -STUDENT_WALL_V, active: false, animT: 0, hint: 'student_wall', wall: x });
      });
    } else if (STUDENTS[type]) {
      obs.push({ kind: 'student', type, x, w: STUDENTS[type], h: PEOPLE_H[type], lane: a, vx: b || -120, active: false, animT: 0, hint: 'student' });
    } else if (WALKERS.includes(type)) {
      obs.push({ kind: 'walker', type, x, w: 64, h: TOP_H, from: a, to: b, laneF: a, active: false, done: false, animT: 0 });
    } else if (CARS.includes(type)) {
      obs.push({ kind: 'car', type, x, w: CAR_W, h: CAR_H, lane: a, active: false, animT: 0, hint: 'car' });
    } else if (type === 'cars') {
      a.forEach(ln => obs.push({ kind: 'car', type: CARS[(carN++) % CARS.length], x, w: CAR_W, h: CAR_H, lane: ln, wave: x, active: false, animT: 0, hint: 'car' }));
    } else console.warn('未知的关卡条目', it);
  }
  return obs;
}
const left = o => o.x - o.w / 2, right = o => o.x + o.w / 2;
const laneOf = o => o.kind === 'walker' ? o.laneF : o.lane;

function walkerDashZone(o) {
  const edge = left(o) - HW;
  return { a: edge - 210, b: edge - 10 };
}

function startLevel(i) {
  const length = byDiff(LEVELS[i].length);
  game.L = { ...LEVELS[i], length, items: randomizeItems(byDiff(LEVELS[i].items), length, makeRng(game.seed + i * 7919)) };
  game.level = i;
  if (!game.stats) game.stats = newStats();
  game.stats.level = i;
  game.obs = buildLevel(game.L);
  game.p = { x: 400, lane: 1, laneF: 1, z: 0, vz: 0, vx: RUN, grounded: true, support: null, state: 'run', t: 0,
    tripT: 0, knockT: 0, dashT: 0, dashCD: 0, dashBuffer: 0, tunnel: null, jumpFrom: null, airAgo: 1, landT: 0, coyote: 0, buffer: 0, cut: false, animT: 0, bumpT: 0 };
  game.unitsAtLevel = game.units; game.unitsVis = game.units;
  game.m = { x: 400 - gapPx(game.units), lane: 1, laneF: 1, z: 0, animT: 0, reach: 0, moving: true, vx: RUN };
  game.camX = game.p.x - 700; game.fx = []; game.shake = 0;
  game.popups = []; game.catchT = null; game.approachT = 0; game.studentHits = 0;
  game.hint = i === 0 ? { text: '失误的话，真冬会追上来。小心身后', t: 4.5 } : null;
  // 第一关开头讲键位；后面每关开头讲这一关的玩法
  game.keyItems = i === 0 ? null : LEVEL_GUIDE[game.L.key];
  game.keyHintT = i === 0 ? 9 : game.keyItems ? { easy: 7, normal: 6, hard: 4.5 }[game.diff] : 0;
  game.state = 'play';
  playBgm(game.L.key);
}

// ================================================================ 关卡随机
// 每次开新的一局，关卡都会在设计好的布局上随机变化，但保证一定能过：
//   1. 每一组障碍随机左右镜像（跑道 0 和 2 对调），换道的距离不变
//   2. 同类障碍随机换外观（高度、宽度几乎一样的才互换）
//   3. 每一组整体前后挪一点，组和组之间的间隔最多缩短一成
//   4. 迎面走来的学生速度在 ±10% 内浮动
// 网址后面加 ?seed=数字 可以固定随机结果；加 ?fixed 就关掉随机，按 levels.js 原样出现
const RANDOM_OFF = /[?&]fixed/.test(location.search);
const SEED_PARAM = (location.search.match(/[?&]seed=(\d+)/) || [])[1];
function makeRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function newSeed() { return SEED_PARAM ? +SEED_PARAM : (Math.random() * 1e9) | 0; }
const SWAP_FAMILIES = [
  ['desk_row', 'cardboard_wall', 'cleaning_barrier', 'gym_mats'], ['student_boy', 'student_girl'],
  ['walker_office', 'walker_student', 'walker_umbrella'], ['car_taxi', 'car_compact', 'car_van', 'car_kei'],
  ['trash_bag_pile', 'crate_row', 'pallet_row'], ['crate_platform', 'ac_platform', 'cabinet_platform'], ['junk_wall_a', 'junk_wall_b'],
];
const JITTER = { easy: 110, normal: 90, hard: 60 };
// 真正和瑞希相遇的位置（车和迎面的学生会提前一些），用来分组和保持间隔
function meetX([type, x, a, b]) {
  if (CARS.includes(type) || type === 'cars') return x - 620;
  if (STUDENTS[type]) { const v = b || -120; return v < 0 ? x - 1500 * -v / (RUN - v) : x + 1500 * v / (RUN - v); }
  return x;
}
function randomizeItems(items, length, rng) {
  if (RANDOM_OFF || !rng) return items.map(it => it.slice());
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const swap = t => { const f = SWAP_FAMILIES.find(f => f.includes(t)); return f ? pick(f) : t; };
  const flip = l => 2 - l;
  // 按相遇位置分组：相距 350 像素以内的算同一组
  const list = items.map(it => ({ it: it.slice(), m: meetX(it) })).sort((p, q) => p.m - q.m);
  const groups = [];
  for (const e of list) { const g = groups[groups.length - 1]; if (g && e.m - g.end < 350) { g.items.push(e); g.end = e.m; } else groups.push({ items: [e], start: e.m, end: e.m }); }
  const J = JITTER[game.diff] ?? 80;
  let prevOff = 0, prevMirror = false;
  const hasCar = g => g.items.some(e => CARS.includes(e.it[0]) || e.it[0] === 'cars');
  groups.forEach((g, gi) => {
    // 挨得很近的两组（或连着来的两拨车）一起镜像，免得要在很短的距离里横跨两条道
    const prev = groups[gi - 1], gap = prev ? g.start - prev.end : 1e9;
    const linked = gap < 700 || (prev && hasCar(g) && hasCar(prev) && gap < 1000);
    const mirror = linked ? prevMirror : rng() < 0.5;
    prevMirror = mirror;
    let off = Math.round((rng() * 2 - 1) * J);
    if (gi > 0) off = Math.max(off, prevOff - Math.round(0.1 * (g.start - groups[gi - 1].end)));   // 间隔最多缩短一成
    off = Math.min(off, length - 350 - g.end);                                                     // 不挤到终点后面
    prevOff = off;
    for (const e of g.items) {
      const it = e.it, t = it[0];
      it[1] += off;
      if (t === 'student_wall') { if (STATIC[it[2]]) it[2] = swap(it[2]); continue; }
      if (STATIC[t]) { it[0] = swap(t); if (!STATIC[t].full && mirror) it[2] = flip(it[2]); continue; }
      if (STUDENTS[t]) { it[0] = swap(t); if (mirror) it[2] = flip(it[2]); if (it[3]) it[3] = Math.round(it[3] * (0.9 + rng() * 0.2)); continue; }
      if (WALKERS.includes(t)) { it[0] = swap(t); if (mirror) { it[2] = flip(it[2]); it[3] = flip(it[3]); } continue; }
      if (CARS.includes(t)) { it[0] = swap(t); if (mirror) it[2] = flip(it[2]); continue; }
      if (t === 'cars' && mirror) it[2] = it[2].map(flip);
    }
  });
  return list.map(e => e.it).sort((p, q) => p[1] - q[1]);
}

// ================================================================ 剧情
function lineStart(line, i) {
  if (!line) return;
  if (line.sfx) sfx(line.sfx);
  if (line.bgm === 'stop') stopBgm(); else if (line.bgm) playBgm(line.bgm);
  playVoice(game.storyKind, i);
}
function startStory(lines, then) {
  game.storyKind = Object.keys(STORY).find(k => STORY[k] === lines) || '';
  game.story = { lines, i: 0, t: 0, then, done: false };
  game.state = 'story';
  lineStart(lines[0], 0);
}
// 一句台词完整出现要多久：聊天记录按条出现，其余按字打出来
const CHAT_STEP = 0.75;
function lineDur(line) { return line.chat ? line.chat.length * CHAT_STEP : (line.text || '').length / (line.speed || 28); }
// 结束时保留最后一句，直到淡出完成
function finishStory() { stopVoice(); const s = game.story; if (!s || s.done) return; s.done = true; s.i = s.lines.length - 1; s.t = 99; s.then(); }
function updateStory(dt) {
  const s = game.story; if (!s || s.done) return;
  s.t += dt;
  const line = s.lines[s.i];
  const auto = line.auto && s.t >= line.auto + lineDur(line);
  if (advance() || auto) {
    if (!auto && s.t < lineDur(line) + 0.15) { s.t = 99; return; }
    if (s.i + 1 >= s.lines.length) { finishStory(); return; }
    s.i++; s.t = 0;
    lineStart(s.lines[s.i], s.i);
  }
  if (pressed.ESC && game.storySkippable) finishStory();
}

// ================================================================ 恐惧值（规则在 horror.js）
// 关卡越往后、失误越多越恐惧；被抓住后放松下来，逃走的坏结局最恐惧
function updateHorror(dt) {
  const s = game.state;
  let target = Horror.fear, active = false;
  if ((s === 'play' || s === 'leaving' || s === 'paused') && game.L) {
    const lf = Horror.TUNE.levelFear[game.level] || [0, 0];
    const prog = Math.min(1, Math.max(0, game.p.x / game.L.length));
    target = lf[0] + (lf[1] - lf[0]) * prog + Horror.TUNE.perMistake * Math.max(0, unitsMax() - game.units) + DIFF[game.diff].fear;
    target = Math.max(0, Math.min(1, target));
    active = true;
  } else if (s === 'escape') { target = 1; active = true; }
  else if (s === 'card') active = game.cardLevel > 0;
  else if (s === 'story') {
    if (game.storyKind === 'bad') { target = 1; active = true; }
    else if (game.storyKind === 'shibuya' || game.storyKind === 'alley') active = true;
    else target = 0;
  } else if (s === 'end' && game.ending === 'bad') { target = 1; active = true; }
  else target = 0;
  Horror.update(dt, { target, active, paused: s === 'paused', muted: audio.muted, units: game.units, story: s === 'story' && game.storyKind === 'bad' });
  if (audio.bgm) {
    const on = active && !audio.muted;
    audio.bgm.playbackRate = on ? Horror.bgmRate() : 1;
    audio.bgm.volume = audio.muted ? 0 : 0.5 * (on ? Horror.bgmVolume() : 1);
    if (audio.bgmKey === 'rumorSad') { audio.bgm.playbackRate = 0.78; audio.bgm.volume = audio.muted ? 0 : 0.26; }
    if (audio.bgmKey === 'crash') {
      const line = s === 'story' && game.story ? game.story.lines[game.story.i] : null;
      audio.bgm.playbackRate = 0.72;
      audio.bgm.volume = audio.muted ? 0 : line && (line.real || line.bg === 'black') ? 0.04 : 0.3;
    }
    if (audio.voice) audio.bgm.volume *= 0.4;   // 有人说话时，背景音乐压低
  }
  if (audio.voice) audio.voice.volume = audio.muted ? 0 : 0.95;
}

// ================================================================ 主循环
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  game.t += dt;
  try { update(dt); render(); } catch (e) { console.error(e); }   // 出错只跳过这一帧
  for (const k in pressed) delete pressed[k];
  game.click = null;
  requestAnimationFrame(frame);
}
function update(dt) {
  if (pressed.MUTE) setMuted(!audio.muted);
  if (pressed.INVINCIBLE) {
    game.invincible = !game.invincible;
    if (game.invincible) {
      game.usedInvincible = true;
      game.catchT = null;
      if (game.units === 0) game.units = game.unitsVis = unitsMax();
    }
  }
  updateHorror(dt);
  if (game.fadeTo) {
    game.fade = Math.min(1, game.fade + dt * 2.2);
    if (game.fade >= 1) { const f = game.fadeTo; game.fadeTo = null; f(); }
    return;
  } else if (game.fade > 0) game.fade = Math.max(0, game.fade - dt * 2.2);
  switch (game.state) {
    case 'title':
      updateTitle();
      break;
    case 'story': updateStory(dt); break;
    case 'card':
      game.cardT += dt;
      if (game.cardT > 2.4 || (game.cardT > 0.6 && advance())) fadeThen(() => startLevel(game.cardLevel));
      break;
    case 'play': updatePlay(dt); break;
    case 'caught':
      game.caughtT += dt; game.p.animT += dt; game.m.animT += dt;
      if (game.caughtT > 1.7) fadeThen(() => { stepLoop(null, false); playBgm('good'); startStory(STORY.good, () => endScreen('good')); });
      break;
    case 'rumor':
      game.rumorT += dt; game.p.animT += dt;
      if (game.rumorT > 1.5) fadeThen(() => { playBgm('rumor'); startStory(STORY.rumor, () => fadeThen(startRumorFlee)); });
      break;
    case 'rumorFlee': updateRumorFlee(dt); break;
    case 'crash':
      game.crashT += dt;
      if (game.crashT > 1.6) fadeThen(() => { playBgm('crash'); startStory(STORY.crash, () => endScreen('crash')); });
      break;
    case 'escape':
      game.escT += dt; updatePlay(dt, true);
      if (game.escT > 1.6) fadeThen(() => { stepLoop(null, false); playBgm('bad'); startStory(STORY.bad, () => endScreen('bad')); });
      break;
    case 'paused': updatePause(); break;
    case 'end':
      game.endT += dt;
      // 刚进结局画面时忽略按键，免得连按空格看剧情时直接跳过成绩
      if (game.endT < 0.8) break;
      if (pressed.OK || pressed.JUMP || game.click) fadeThen(() => newRun());
      else if (pressed.ESC) fadeThen(() => toTitle());
      break;
  }
}
function fadeThen(f) { if (!game.fadeTo) game.fadeTo = f; }
function showCard(i) { game.state = 'card'; game.cardLevel = i; game.cardT = 0; playBgm(LEVELS[i].key); }
function toTitle() { stepLoop(null, false); game.state = 'title'; playBgm('title'); }
function newRun() { game.usedInvincible = game.invincible; game.units = unitsMax(); game.hintsShown = {}; game.stats = newStats(); game.seed = newSeed(); showCard(0); }
function startRun() { game.usedInvincible = game.invincible; game.units = unitsMax(); game.hintsShown = {}; game.stats = newStats(); game.seed = newSeed(); startStory(STORY.intro, () => fadeThen(() => showCard(0))); playBgm('title'); }
// 标题：W / S（或 A / D、方向键）选难度，空格 / Enter 开始，也可以直接点
function titleRect(i) { return { x: 96, y: 568 + i * 110, w: 640, h: 96 }; }
function updateTitle() {
  if (pressed.UP || pressed.SLOW) game.titleSel = (game.titleSel + 2) % 3;
  if (pressed.DOWN || pressed.FAST) game.titleSel = (game.titleSel + 1) % 3;
  let go = pressed.OK || pressed.JUMP;
  if (game.click) for (let i = 0; i < 3; i++) if (inRect(game.click, titleRect(i))) { game.titleSel = i; go = true; }
  if (go) { game.diff = DIFF_ORDER[game.titleSel]; fadeThen(startRun); }
}
function endScreen(kind) { game.state = 'end'; game.ending = kind; game.endT = 0; saveRecord(kind); }

// ================================================================ 引导：前方的高墙组
// 找瑞希前面最近的一组高墙（同一个 x 上的墙算一组）
function wallGroupAhead(p, range) {
  let best = null;
  for (const o of game.obs) {
    if (o.kind !== 'wall' || right(o) < p.x - HW) continue;
    const d = left(o) - (p.x + HW);
    if (d > range || (p.tunnel && p.tunnel.x === o.x)) continue;
    if (!best || o.x < best.x - 40) best = o;
  }
  if (!best) return null;
  const walls = game.obs.filter(o => o.kind === 'wall' && Math.abs(o.x - best.x) < 40);
  const gap = walls.find(o => o.gap);
  const free = [0, 1, 2].filter(l => !walls.some(o => o.lane === l));
  return { x: best.x, left: Math.min(...walls.map(left)), walls, gap, free };
}
// 前面这条道被高墙挡住时，告诉玩家往哪换（困难只给笼统的提示）
function guideAhead(p) {
  const g = wallGroupAhead(p, 750);
  if (g && !p.tunnel) {
    const lane = p.lane, hard = game.diff === 'hard';
    if (g.free.includes(lane) || (g.gap && g.gap.lane === lane)) return;
    const near = l => [...l].sort((a, b) => Math.abs(a - lane) - Math.abs(b - lane))[0];
    const key = l => l < lane ? 'W' : 'S';
    let text;
    if (g.free.length) {
      const l = near(g.free);
      text = hard ? '前面是高墙，跳不过去：换到空着的道' : `前面是高墙，跳不过去：按 ${key(l)} 换到${LANE_NAME[l]}`;
    } else if (g.gap) {
      text = hard ? '三条道都堵住了：有一堆杂物底下能钻，换道找找看' : `三条道都堵住了：按 ${key(g.gap.lane)} 换到${LANE_NAME[g.gap.lane]}，那堆底下能钻`;
    } else return;
    game.hint = { text, t: 0.3, pin: true };
    return;
  }
  // 站在高平台上、前面不远还有要跳的东西：提示借力跳（每局一次）
  const sup = p.support;
  if (game.diff !== 'hard' && sup && sup.kind === 'full' && sup.h >= 170 && !game.hintsShown.platform_boost &&
      game.obs.some(o => o.kind === 'full' && o !== sup && left(o) - p.x > 0 && left(o) - p.x < 700)) {
    game.hintsShown.platform_boost = true;
    game.hint = { text: '站在平台上按空格，能借力跳得更高更远', t: 2.4 };
  }
}
// 简单、普通：在空着的道的地面上画箭头，指出能绕过去的路（能钻的那条道不画）
function renderLaneGuide() {
  if (game.diff === 'hard' || game.state !== 'play') return;
  const p = game.p, g = wallGroupAhead(p, 1300);
  if (!g || !g.free.length) return;
  const cx = game.camX, a = Math.max(p.x + 140, g.left - 760), b = g.left - 30;
  if (b - a < 80) return;
  const fade = Math.min(1, (1300 - (g.left - p.x)) / 300);
  ctx.save();
  ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const l of g.free) {
    const y = game.L.lanes[l] - 4;
    for (let x = a, i = 0; x < b; x += 80, i++) {
      const pulse = 0.5 + 0.5 * Math.sin(game.t * 6 - i * 0.8);
      ctx.strokeStyle = `rgba(156,245,242,${(0.18 + 0.32 * pulse) * fade})`;
      ctx.beginPath(); ctx.moveTo(x - cx - 14, y - 12); ctx.lineTo(x - cx + 6, y); ctx.lineTo(x - cx - 14, y + 12); ctx.stroke();
    }
  }
  ctx.restore();
}

// ================================================================ 规则：失误
// 空中撞上（起跳了但没跳过去）= 跳晚了 -1；地上没反应直接撞上 = 撞上了 -2。每个障碍最多扣一次。
// 高墙撞上一律算 -2。
function mistake(p, o) {
  if (o.hitDone || game.units <= 0) return;
  o.hitDone = true;
  const late = o.h < TOP_H && o.kind !== 'car' && (o.kind !== 'student' || !!p.jumpFrom) && (!p.grounded || p.airAgo < 0.18);   // 撞到车、从地面跳去撞学生一律 -2
  const n = late ? 1 : 2;
  if (!game.invincible) {
    game.units = Math.max(0, game.units - n);
    Horror.jolt();
    if (game.stats) { if (late) game.stats.late++; else game.stats.hit++; }
    game.shake = late ? 7 : 12;
  }
  let text = late ? '跳晚了' : '撞上了';
  if (game.invincible) text = '碰撞';
  game.popups.push({ text, x: p.x, y: laneY(p.laneF) - p.z - 240, t: 0, bad: !late });
  sfx('trip', 0.8); sfx('approach', 0.55);
  if (game.fx) dust(p.x + 20, p.laneF, p.z, 7, 1.2);
  if (p.grounded) { p.state = 'trip'; p.tripT = late ? 0.4 : 0.6; p.t = 0; p.vx = 0; p.dashT = 0; }
  else { p.vx = -160; p.knockT = 0.25; }
  // 在神山高校撞到同学第三次：误会结局（优先于被抓住）
  if (o.kind === 'student' && game.L && game.L.key === 'kamiyama' && ++game.studentHits >= 3) { startRumor(); return; }
  // 最后一下是被车撞上：隐藏结局
  if (game.units <= 0) { if (o.kind === 'car') startCrash(); else game.catchT = 0.45; }
}

// 车：跳上车顶或从车上方跳过都扣 1，不摔倒；同一排并排的车算一次
function carPenalty(p, o, text) {
  for (const c of game.obs) if (c === o || (o.wave !== undefined && c.wave === o.wave)) c.hitDone = true;
  if (game.units <= 0) return;
  if (!game.invincible) { game.units = Math.max(0, game.units - 1); if (game.stats) game.stats.late++; }
  game.popups.push({ text: game.invincible ? '车' : text, x: p.x, y: laneY(p.laneF) - p.z - 240, t: 0, bad: false });
  sfx('approach', 0.55);
  if (game.units <= 0) game.catchT = 0.45;
}

// ================================================================ 规则：碰撞判定
// 这个障碍此刻是否挡住某条跑道位置 lf、离地高度 z 的角色
// 只看有没有真的碰到：脚底高过障碍顶部就算跳过去了（空中再让出一点余量）
function blocks(o, lf, z, dashing, boosted = false) {
  // 学生从地面跳不过去；只有踩着障碍借力起跳（boosted）时才按真实身高判定
  const h = o.kind === 'student' && !boosted ? TOP_H : o.h;
  const top = h - (z > 0 ? AIR_GRACE_Z : 2);
  if (o.kind === 'full') return z < top;
  if (o.kind === 'walker') { if (!o.active || o.done || dashing) return false; return Math.abs(o.laneF - lf) < 0.55 && z < top; }
  if (Math.abs(o.lane - lf) >= 0.55) return false;
  return z < top;
}
// 撞上以后还会继续挡路的障碍（全道障碍、高墙）；学生、行人、车撞过一次就让开
const solid = o => o.kind === 'full' || o.kind === 'wall';

const CAR_FOOT_MARGIN = HW - AIR_GRACE_X;
function carTopAt(o, x, lane) {
  if (Math.abs(o.lane - lane) >= 0.55) return 0;
  const rel = x - o.x;
  let top = 0;
  for (const [a, b, height] of CAR_PROFILE[o.type]) {
    if (rel + CAR_FOOT_MARGIN > a && rel - CAR_FOOT_MARGIN < b) top = Math.max(top, height);
  }
  return top;
}

function carContact(o, p, prevX, dz, dt) {
  if (Math.abs(o.lane - p.laneF) >= 0.55) return null;
  const start = prevX - o.x + (o.active ? CAR_V * dt : 0);
  const end = p.x - o.x;
  const dx = end - start;
  const half = p.z > 0 ? CAR_FOOT_MARGIN : HW;
  let firstContact = null;
  for (const [leftEdge, rightEdge, height] of CAR_PROFILE[o.type]) {
    const a = leftEdge - half, b = rightEdge + half;
    if (Math.max(start, end) <= a || Math.min(start, end) >= b) continue;
    // 只在角色与这一段车身重叠的时间内比较脚底高度。
    let first = 0, last = 1;
    if (dx !== 0) {
      const t0 = (a - start) / dx, t1 = (b - start) / dx;
      first = Math.max(0, Math.min(t0, t1));
      last = Math.min(1, Math.max(t0, t1));
    }
    const z = p.z + dz * first;
    const side = z < height - (z > 0 ? AIR_GRACE_Z : 2);
    if (!side && dz >= 0) continue;
    const time = side ? first : Math.max(first, (height - p.z) / dz);
    if (time > last || (firstContact && time >= firstContact.time)) continue;
    firstContact = { height, time, side };
  }
  return firstContact;
}

function updatePlay(dt, auto = false) {
  const p = game.p, m = game.m, L = game.L;
  if (!auto && pressed.ESC) { openPause(); return; }
  const input = auto ? {} : keys, press = auto ? {} : pressed;

  p.t += dt; p.animT += dt; p.landT = Math.max(0, p.landT - dt); p.knockT = Math.max(0, p.knockT - dt);
  p.dashCD = Math.max(0, p.dashCD - dt); p.bumpT = Math.max(0, p.bumpT - dt);
  p.airAgo = p.grounded ? p.airAgo + dt : 0;
  if (game.keyHintT > 0) game.keyHintT -= dt;
  if (!auto && game.stats) game.stats.time += dt;
  p.buffer = press.JUMP ? JUMP_BUFFER : Math.max(0, p.buffer - dt);
  // 摔倒中按的 Shift 先记着，站起来后立刻生效
  p.dashBuffer = auto ? 0 : press.DASH ? DASH_BUFFER : p.state === 'trip' ? p.dashBuffer : Math.max(0, p.dashBuffer - dt);
  p.coyote = p.grounded ? COYOTE : Math.max(0, p.coyote - dt);

  // 活动障碍
  for (const o of game.obs) {
    const ahead = o.x - p.x;
    if (o.kind === 'student') {
      if (!o.active && ahead < 1500) o.active = true;
      if (o.active && !o.stopped) { o.x += o.vx * dt; o.animT += dt; if (o.stopX !== undefined && o.x <= o.stopX) { o.x = o.stopX; o.stopped = true; } }
    }
    if (o.kind === 'car') { if (!o.active && ahead < 1500) { o.active = true; if (ahead < 1700 && !auto) sfx('horn', 0.35); } if (o.active) { o.x += CAR_V * dt; o.animT += dt; } }
    if (o.kind === 'walker') {
      // 行人一直在走：横穿之前从路边走过来（位置按瑞希离他多远算，保证正好在原来的时机走到起点），
      // 横穿完也继续往前走出画面；只有横穿那一段（active 且没 done）会挡人
      const dir = Math.sign(o.to - o.from) || 1;
      o.animT += dt;
      if (!o.active) {
        if (ahead < 650) o.active = true;
        else o.laneF = o.from - dir * Math.min(3, (ahead - 650) / RUN * 1.4);
      }
      if (o.active) {
        o.laneF += dir * 1.4 * dt;
        if (!o.done && ((dir > 0 && o.laneF > o.to + 0.9) || (dir < 0 && o.laneF < o.to - 0.9))) o.done = true;
      }
    }
  }

  // 状态
  if (p.state === 'trip') { p.tripT -= dt; if (p.tripT <= 0) { p.state = 'run'; p.t = 0; } }
  const dashing = p.dashT > 0 || !!p.tunnel;
  p.dashT = Math.max(0, p.dashT - dt);
  if (p.tunnel) {
    p.vx = DASH_V;
    p.knockT = 0;
    p.lane = p.laneF = p.tunnel.lane;
  }
  if (p.state === 'run') {
    const target = dashing ? DASH_V : input.FAST ? RUN_FAST : input.SLOW ? RUN_SLOW : RUN;
    if (p.knockT <= 0) p.vx += Math.sign(target - p.vx) * Math.min(Math.abs(target - p.vx), (dashing ? 6000 : ACC) * dt);
    // 起跳
    if (!p.tunnel && p.buffer > 0 && (p.grounded || p.coyote > 0)) {
      p.jumpFrom = p.support;
      p.vz = p.jumpFrom ? PLATFORM_JUMP_V : JUMP_V;
      p.grounded = false; p.support = null; p.coyote = 0; p.buffer = 0; p.cut = false; p.animT = 0; p.dashT = 0;
      sfx(p.jumpFrom ? 'boost' : 'jump', 0.5);
      const v = p.vis || (p.vis = {}); v.sq = -0.14; v.sqV = 0; dust(p.x - 10, p.laneF, p.z, 3, 0.7);
    }
    if (!input.JUMP && p.vz > 420 && !p.cut && !p.grounded) { p.vz *= JUMP_CUT; p.cut = true; }
    // 在木箱那条道上、木箱就在前面时：按 Shift 一定能钻，不受冷却限制；已经贴住时按住 Shift 也行
    const boxAhead = !p.tunnel && p.grounded && p.z < 1 && game.obs.find(o => o.gap && Math.abs(o.lane - p.laneF) < 0.45 &&
      p.x + HW >= left(o) - GAP_DASH_LEAD - 60 && p.x < left(o));
    const pinned = boxAhead && p.x + HW >= left(boxAhead) - 8 ? boxAhead : null;
    p.pinned = !!pinned;
    if (boxAhead && !pinned && p.dashBuffer > 0 && p.dashT <= 0) p.dashCD = 0;
    if (pinned && !p.dashT && (!game.hint || game.hint.pin)) game.hint = { text: '贴着木箱了：按 Shift 钻过去', t: 0.6, pin: true };
    if (pinned && (input.DASH || p.dashBuffer > 0) && p.dashT <= 0) { p.dashCD = 0; p.dashBuffer = DASH_BUFFER; }
    if (!p.tunnel && p.dashBuffer > 0 && p.grounded) {
      // 连续两个行人的冲刺时机可能相叠。每个行人允许在对应时机触发一次冲刺。
      const walker = game.obs.find(o => {
        if (o.kind !== 'walker' || o.done || o.dashUsed) return false;
        const { a, b } = walkerDashZone(o);
        return p.x >= a && p.x <= b;
      });
      if (walker || p.dashCD <= 0) {
        if (walker) walker.dashUsed = true;
        p.dashT = DASH_T;
        p.dashCD = DASH_CD;
        p.dashBuffer = 0;
        p.vx = DASH_V;
        sfx('slide', 0.7);
      }
    }
    // 换道（目标跑道上有高墙挡着就换不过去）
    // 同一组的高墙宽度差几像素，贴着一面墙时旁边的墙只会重叠一点点，这种情况允许换过去，否则会被卡死在墙前
    let want = p.lane;
    if (press.UP && !p.tunnel) want = Math.max(0, p.lane - 1);
    if (press.DOWN && !p.tunnel) want = Math.min(2, p.lane + 1);
    if (want !== p.lane) {
      const blocked = game.obs.some(o => solid(o) && o.kind === 'wall' && o.lane === want && p.x + HW > left(o) + WALL_SIDE_SLACK && p.x - HW < right(o));
      if (blocked) p.bumpT = 0.15; else p.lane = want;
    }
  }
  const prevLaneF = p.laneF;
  p.laneF += Math.sign(p.lane - p.laneF) * Math.min(Math.abs(p.lane - p.laneF), LANE_SPEED * dt);

  // 横向移动与碰撞
  const prevX = p.x;
  const car = p.support?.kind === 'car' ? p.support : null;
  p.x += (p.vx + (car?.active ? CAR_V : 0)) * dt;
  if (!p.tunnel && p.dashT > 0 && p.grounded && p.z < 1) {
    const entrance = game.obs.find(o => o.gap && Math.abs(o.lane - p.laneF) < 0.45 &&
      p.x + HW > left(o) && p.x - HW < right(o));
    if (entrance) {
      p.tunnel = entrance;
      p.lane = p.laneF = entrance.lane;
      p.buffer = 0;
    }
  }
  if (!p.grounded || p.support) p.vz -= G * dt;
  const dz = p.vz * dt;
  for (const o of game.obs) {
    if (o.kind === 'car') continue;
    if (o === p.tunnel) continue;
    const g = p.z > 0 ? AIR_GRACE_X : 0;   // 在空中擦过边缘不算碰到
    if (p.x + HW - g <= left(o) || p.x - HW + g >= right(o)) continue;
    const entryX = left(o) - HW + g;
    // 起跳时按本帧到达障碍前缘的高度判定，落地仍由后面的平台逻辑处理。
    const entryTime = o.kind === 'full' && p.x > prevX ? Math.max(0, (entryX - prevX) / (p.x - prevX)) : 0;
    if (!blocks(o, p.laneF, p.z + Math.max(0, dz) * entryTime, p.dashT > 0, !p.grounded && !!p.jumpFrom)) continue;
    if (o.kind === 'student' || o.kind === 'walker') { if (!auto) mistake(p, o); continue; }
    // 贴着墙换道时侧面蹭到旁边的墙：只把人挡在墙前，不算撞上
    const sideOnly = o.kind === 'wall' && Math.abs(o.lane - prevLaneF) >= 0.55 && p.vx < 200 &&
      prevX + HW - g > left(o) - 0.05 && prevX + HW - g - left(o) <= WALL_SIDE_SLACK;   // 贴在一面墙前换道，侧面只蹭到旁边的墙一点点
    // 换道也可能碰到墙，不能只处理从左边撞上的情况。
    p.x = entryX - 0.01;
    p.vx = Math.min(p.vx, 0);
    if (sideOnly) o.hitDone = true;   // 已经贴在它前面了，之后继续顶着也不再扣
    else if (!auto) mistake(p, o);
  }

  let carSupport = null, carHeight = 0, carBump = false;
  if (car) {
    const height = carTopAt(car, p.x, p.laneF);
    if (height > 0 && height >= p.z) { carSupport = car; carHeight = height; }
  }
  if (!auto && !carSupport) {
    for (const o of game.obs) {
      if (o.kind !== 'car' || o === car || (o === p.jumpFrom && p.vz > 0)) continue;
      const contact = carContact(o, p, prevX, dz, dt);
      if (!contact) continue;
      carSupport = o;
      carHeight = contact.height;
      if (!contact.side && !o.hitDone) carPenalty(p, o, '跳上车顶');
      if (contact.side) {
        if (!o.hitDone) {
          mistake(p, o);
          if (o.wave !== undefined) {
            for (const peer of game.obs) if (peer.wave === o.wave) peer.hitDone = true;
          }
        }
        // 碰到车侧后先被车带退一点，随后恢复车上的奔跑。
        const inset = CAR_FOOT_MARGIN - 1;
        p.x = Math.max(left(o) - inset, Math.min(p.x, right(o) + inset));
        p.laneF = p.lane = o.lane;
        carHeight = carTopAt(o, p.x, p.laneF);
        carBump = true;
        p.vx = 0; p.knockT = 0.13; p.state = 'run'; p.tripT = 0; p.dashT = 0;
      }
      break;
    }
  }

  // 从车上方跳过去（没落在车顶）也算 -1：车只能换道躲
  if (!auto) for (const o of game.obs) {
    if (o.kind !== 'car' || o.hitDone) continue;
    if (Math.abs(o.lane - p.laneF) < 0.55 && !p.grounded && p.support !== o && p.x + HW > left(o) && p.x - HW < right(o)) o.over = true;
    if (o.over && right(o) < p.x - HW) carPenalty(p, o, '跳过车');
  }

  // 纵向（跳跃、落在全道障碍顶上）
  const prevZ = p.z;
  p.z = carBump ? carHeight : p.z + dz;
  const wasGrounded = p.grounded;
  p.grounded = false;
  let top = carHeight, sup = carSupport;
  if (p.vz <= 0) {
    for (const o of game.obs) {
      if (o.kind === 'full' && p.x + HW > left(o) && p.x - HW < right(o) && prevZ >= o.h - 4 && o.h > top) {
        top = o.h;
        sup = o;
      }
    }
  }
  p.support = null;
  const fallV = p.vz;
  if (p.z <= top) { p.z = top; p.vz = 0; p.grounded = true; p.support = sup; }
  if (p.grounded) {
    p.jumpFrom = null;
    if (!wasGrounded || carBump) {
      p.landT = 0.1; p.airAgo = 0; sfx('jump', 0.3);
      const impact = Math.min(1, Math.max(0.2, -fallV / 1400)), v = p.vis || (p.vis = {});
      v.sq = 0.05 + 0.09 * impact; v.sqV = 0; dust(p.x, p.laneF, p.z, 3 + Math.round(4 * impact), 0.6 + impact);
    }
  }
  if (p.tunnel && p.x >= right(p.tunnel) + TUNNEL_CLEARANCE) {
    p.tunnel = null;
    // 钻出来马上有要跳的杂物时提醒一下
    if (!auto && game.obs.some(o => o.kind === 'full' && left(o) - p.x > 0 && left(o) - p.x < 520)) game.hint = { text: '钻出来了，前面马上要跳！', t: 1.2, pin: true };
    p.buffer = 0;
    p.dashBuffer = 0;
  }

  // 真冬：恒速追逐，保持当前距离；会自己换道躲开、跳过障碍
  game.unitsVis += (game.units - game.unitsVis) * Math.min(1, dt * 3);
  const wantX = p.x - gapPx(game.units);
  if (auto) { m.vx = RUN * 0.45; m.x += m.vx * dt; }
  else {
    // 跟着瑞希的速度跑，再按差多少慢慢补上；瑞希摔倒时她会减速走过来，而不是瞬移
    const vt = Math.max(0, p.vx) + Math.max(-RUN * 0.7, Math.min(RUN * 0.9, (wantX - m.x) * 2.4));
    m.vx = m.vx ?? RUN;
    m.vx += Math.sign(vt - m.vx) * Math.min(Math.abs(vt - m.vx), 1600 * dt);
    m.x += m.vx * dt;
  }
  m.moving = m.vx > 60; m.lastX = m.x;
  m.lane = mafuyuLane(m, p);
  m.laneF += Math.sign(m.lane - m.laneF) * Math.min(Math.abs(m.lane - m.laneF), LANE_SPEED * dt);
  let mz = 0;
  for (const o of game.obs) if (o.kind === 'full') {
    // 人墙前的杂物：一口气连人墙一起跳过去，不从学生身上穿过
    const wallJump = o.hint === 'student_wall';
    const a = left(o) - 90, b = right(o) + (wallJump ? 250 : 90);
    if (m.x > a && m.x < b) mz = Math.max(mz, (wallJump ? 290 : o.h + 50) * Math.sin(Math.PI * (m.x - a) / (b - a)));
  }
  const mPrevZ = m.z;
  m.z += (mz - m.z) * Math.min(1, dt * 18);
  // 步频跟着速度走，脚不打滑
  m.animT += m.moving ? dt * Math.max(0.45, Math.min(1.6, m.vx / RUN)) : 0;
  const mv = m.vis || (m.vis = {});
  if (mPrevZ > 6 && m.z <= 6 && mz < mPrevZ) { mv.sq = 0.16; mv.sqV = 0; dust(m.x, m.laneF, 0, 4, 1); }
  if (mPrevZ < 2 && m.z >= 2) { mv.sq = -0.12; mv.sqV = 0; }
  spring(mv, 'sq', 0, 260, 14, dt);
  spring(mv, 'lean', m.z > 4 ? 0.05 : Math.max(-0.06, Math.min(0.08, (m.vx - RUN) / RUN * 0.12)) + 0.03, 120, 18, dt);
  m.reach = game.units <= 1 ? m.reach + dt : 0;

  {
    const camK = 7;
    const camT = p.x - 700 + RUN / camK;
    game.camX += (camT - game.camX) * Math.min(1, dt * camK);
    game.shake = Math.max(0, (game.shake || 0) - dt * 40);
  }
  // 瑞希的动作表现（只影响画面）：挤压拉伸回弹、前倾、跑步扬尘
  {
    const v = p.vis || (p.vis = {});
    spring(v, 'sq', 0, 260, 13, dt);
    const lean = p.state === 'trip' ? 0 : p.knockT > 0 ? -0.12 : (p.dashT > 0 || p.tunnel) ? 0.13 :
      !p.grounded ? Math.max(-0.07, Math.min(0.08, -p.vz / 5000 + 0.03)) : 0.04 + Math.max(-0.07, Math.min(0.05, (p.vx - RUN) / RUN * 0.14));
    spring(v, 'lean', lean, 150, 18, dt);
    v.stepT = (v.stepT || 0) - dt;
    if (p.grounded && p.state === 'run' && p.vx > 200 && v.stepT <= 0) { dust(p.x - 30, p.laneF, p.z, 1, 0.45); v.stepT = 0.26 * RUN / p.vx; }
  }
  for (const f of game.fx) { f.t += dt; f.x += f.vx * dt; f.z = Math.max(0, f.z + f.vz * dt); f.vz -= 260 * dt; f.vx *= 1 - 3 * dt; }
  game.fx = game.fx.filter(f => f.t < f.life);

  // 提示（每种障碍第一次出现时）
  for (const o of game.obs) {
    const k = o.hint;
    if (HINTS[k] && !game.hintsShown[k] && o.x - p.x < 900 && o.x - p.x > 0) { game.hintsShown[k] = true; game.hint = { text: HINTS[k], t: 3.2 }; }
  }
  if (!auto) guideAhead(p);
  if (game.hint) { game.hint.t -= dt; if (game.hint.t <= 0) game.hint = null; }
  for (const u of game.popups) u.t += dt;
  game.popups = game.popups.filter(u => u.t < 1.3);
  game.obs = game.obs.filter(o => !(o.kind !== 'full' && o.kind !== 'wall' && o.x < game.camX - 700));

  stepLoop(L.surface, p.grounded && p.state === 'run' && p.dashT <= 0 && !p.tunnel && p.vx > 90);
  if (!auto && game.units === 1) { game.approachT -= dt; if (game.approachT <= 0) { sfx('approach', 0.45); game.approachT = 3.6; } }

  if (auto) return;
  if (game.catchT != null) { game.catchT -= dt; if (game.catchT <= 0) { game.catchT = null; caught(); } return; }
  if (p.x >= L.length) {
    if (game.level < LEVELS.length - 1) {
      const next = game.level + 1;
      stepLoop(null, false); game.state = 'leaving';
      fadeThen(() => startStory(STORY[LEVELS[next].key], () => fadeThen(() => showCard(next))));
    } else { game.state = 'escape'; game.escT = 0; }
  }
}

// 真冬选跑道：前方 360 像素内有挡路的单道障碍就换到空着的跑道，尽量跟着瑞希
function mafuyuLane(m, p) {
  const busy = l => game.obs.some(o => o.kind !== 'full' && o.kind !== 'walker' && laneOf(o) === l &&
    right(o) > m.x - 60 && left(o) < m.x + 360);
  const order = [p.lane, m.lane, 1, 0, 2];
  if (!busy(m.lane) && (m.lane === p.lane || busy(p.lane))) return m.lane;
  for (const l of order) if (!busy(l)) return l;
  // 三条道都被高墙堵死时，走能钻的那一条
  const gap = game.obs.find(o => o.gap && right(o) > m.x - 60 && left(o) < m.x + 360);
  return gap ? gap.lane : m.lane;
}

// 隐藏结局：被车撞上的那一刻，画面定格、发白、耳鸣
function startCrash() {
  game.state = 'crash'; game.crashT = 0; game.catchT = null;
  stepLoop(null, false);
  if (audio.bgm) audio.bgm.pause();
  sfx('brake', 1); sfx('horn', 0.8);
  Horror.ring(3.2);
}
// 误会结局：撞到同学第三次，大家围过来
function startRumor() {
  game.state = 'rumor'; game.rumorT = 0; game.catchT = null;
  stepLoop(null, false);
  const p = game.p; p.vx = 0; p.dashT = 0;
}
// 真冬疑惑的那一刻：瑞希加速冲出走廊，真冬站在原地，伸出的手没有抓住
function startRumorFlee() {
  const p = game.p, m = game.m;
  game.state = 'rumorFlee'; game.fleeT = 0;
  p.state = 'run'; p.grounded = true; p.z = 0; p.dashT = 0; p.tunnel = null; p.vx = 0;
  const v = p.vis || (p.vis = {}); v.sq = 0; v.sqV = 0; v.lean = 0.15;
  // 往前跑的那条道上不能有学生；挡路的杂物收掉，免得穿模
  const freeLane = [p.lane, 1, 0, 2].find(l => !game.obs.some(o => o.kind === 'student' && o.lane === l && o.x > p.x - 60 && o.x < p.x + 1600)) ?? p.lane;
  p.lane = p.laneF = freeLane; if (p.vis) { p.vis.laneA = p.vis.laneB = freeLane; p.vis.lastVis = freeLane; }
  game.obs = game.obs.filter(o => o.kind === 'student' || o.x < p.x - 200 || o.x > p.x + 1800);
  // 真冬就在身后，伸手就能碰到的距离
  m.x = p.x - 170; m.lane = m.laneF = freeLane; if (m.vis) { m.vis.laneA = m.vis.laneB = freeLane; m.vis.lastVis = freeLane; }
  m.moving = false; m.reach = 0.001; m.vx = 0; m.z = 0;
  game.camX = p.x - 760; game.fx = []; game.shake = 0;
}
function updateRumorFlee(dt) {
  const p = game.p, m = game.m;
  game.fleeT += dt;
  p.vx = Math.min(1200, p.vx + 2600 * dt);   // 一下子加速到比冲刺还快
  p.x += p.vx * dt; p.animT += dt; m.reach += dt;
  if (game.fleeT > 0.25) { const v = p.vis; v.stepT = (v.stepT || 0) - dt; if (v.stepT <= 0) { dust(p.x - 30, p.laneF, 0, 2, 1); v.stepT = 0.12; } }
  for (const f of game.fx) { f.t += dt; f.x += f.vx * dt; f.z = Math.max(0, f.z + f.vz * dt); f.vz -= 260 * dt; f.vx *= 1 - 3 * dt; }
  game.fx = game.fx.filter(f => f.t < f.life);
  if (game.fleeT > 2.6) fadeThen(() => startStory(STORY.rumor2, () => endScreen('rumor')));
}
function caught() {
  const p = game.p, m = game.m;
  game.state = 'caught'; game.caughtT = 0;
  stepLoop(null, false);
  p.state = 'caught'; p.animT = 0; p.vx = 0; p.z = 0; p.laneF = p.lane; p.tunnel = null;
  m.x = p.x - 135; m.lane = p.lane; m.laneF = p.lane; m.z = 0; m.animT = 0;
}

// ================================================================ 暂停
const PAUSE_ITEMS = ['继续', '重新开始本关', '回到标题'];
function openPause() { if (game.state !== 'play') return; game.state = 'paused'; game.pause.sel = 0; stepLoop(null, false); if (audio.bgm) audio.bgm.pause(); }
function closePause() { game.state = 'play'; if (audio.bgm && audio.unlocked) audio.bgm.play().catch(() => {}); }
function updatePause() {
  if (pressed.ESC) { closePause(); return; }
  if (pressed.UP) game.pause.sel = (game.pause.sel + 2) % 3;
  if (pressed.DOWN) game.pause.sel = (game.pause.sel + 1) % 3;
  let choose = (pressed.OK || pressed.JUMP) ? game.pause.sel : -1;
  if (game.click) for (let i = 0; i < 3; i++) if (inRect(game.click, pauseBtnRect(i))) choose = i;
  if (choose === 0) closePause();
  if (choose === 1) { if (audio.bgm) audio.bgm.play().catch(() => {}); fadeThen(() => { game.units = game.unitsAtLevel; startLevel(game.level); }); }
  if (choose === 2) fadeThen(() => toTitle());
}
function pauseBtnRect(i) { return { x: W / 2 - 210, y: 470 + i * 110, w: 420, h: 75 }; }
function inRect(pt, r) { return pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h; }

// ================================================================ 绘制工具
const img = k => IMG[k];
function drawCover(k) {
  const im = img(k); if (!im) return;
  const s = Math.max(W / im.width, H / im.height);
  ctx.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s);
}
// 只画屏幕里看得见的那一段（背景图有 3840 宽，整张画很费性能）；接缝处分两段画
function blitWrap(im, off) {
  const iw = im.width;
  let sx = ((off % iw) + iw) % iw, dx = 0;
  while (dx < W) {
    const w = Math.min(iw - sx, W - dx);
    ctx.drawImage(im, sx, 0, w, im.height, dx, 0, w, im.height);
    dx += w; sx = 0;
  }
}
function drawLayer(k, speed) {
  const im = img(k); if (!im) return;
  const off = game.camX * speed;
  blitWrap(im, off);
  // 恐怖变体：灯管熄灭、大屏变成眼睛、窗灯一扇扇灭掉
  const dark = img(k + '_dark'), a = Math.max(0, Math.min(1, (Horror.fear - 0.3) / 0.45));
  if (!dark || a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a;
  blitWrap(dark, off);
  ctx.restore();
}
// ---------------------------------------------------------------- 画面纵深（只影响画法，不影响碰撞）
// 后排的人和物件画小一点、前排原大，三条跑道才看得出远近；走到路面以外的行人按同样比例继续变化
const DEPTH_BACK = 0.86;
function depthS(y) {
  const l = game.L ? game.L.lanes : [830, 930, 1030];
  return Math.max(0.72, Math.min(1.1, 1 + (y - l[2]) / (l[2] - l[0]) * (1 - DEPTH_BACK)));
}
const WALL_SX = 0.93, WALL_SY = 0.8;   // 夜巷杂物墙原图太高（像一栋楼），画矮一些；宽度基本不变，和碰撞对得上
// 换道时的画面位置：按 smoothstep 缓入缓出（实际判定仍用匀速的 laneF，两者最多差十几像素）
function visLane(o) {
  const v = o.vis || (o.vis = {});
  if (v.laneB !== o.lane) { v.laneA = v.lastVis ?? o.laneF; v.laneB = o.lane; }
  let lane = o.laneF, u = 1;
  if (v.laneA !== v.laneB) {
    u = Math.max(0, Math.min(1, (o.laneF - v.laneA) / (v.laneB - v.laneA)));
    lane = v.laneA + (v.laneB - v.laneA) * u * u * (3 - 2 * u);
    if (u >= 1) v.laneA = v.laneB;
  }
  v.lastVis = lane; v.laneU = u;
  return lane;
}
// 弹簧：挤压拉伸、身体前倾都用它回到原位，带一点回弹
function spring(v, key, target, k, c, dt) { const vk = key + 'V'; v[vk] = (v[vk] || 0) + ((target - (v[key] || 0)) * k - v[vk] * c) * dt; v[key] = (v[key] || 0) + v[vk] * dt; }
// 尘土 / 水花
const DUST_COLOR = { kamiyama: '232,214,232', shibuya: '196,212,245', alley: '168,168,190' };
function dust(x, lf, z, n, power = 1) {
  for (let i = 0; i < n; i++) game.fx.push({ x: x + (Math.random() - 0.5) * 30, lf, z, vx: (Math.random() - 0.65) * 160 * power, vz: 40 + Math.random() * 90 * power,
    r: 6 + Math.random() * 7 * power, t: 0, life: 0.35 + Math.random() * 0.3 });
}
function frameOf(key, t, loop = true) { const [n, fps] = ANIMS[key]; const f = Math.floor(t * fps); return loop ? f % n : Math.min(n - 1, f); }
// t：{ s 纵深缩放, sx / sy 挤压拉伸, rot 前倾（弧度，绕脚底转） }
// 轻量模式（手机）：不用滤镜，把小人先画到一张小画布上再刷一层暗色，效果接近，省很多性能
const tintCv = document.createElement('canvas'); tintCv.width = tintCv.height = 256;
const tintCx = tintCv.getContext('2d');
function tinted(im, filter) {
  const m = /brightness\(([\d.]+)\)/.exec(filter), dark = m ? 1 - parseFloat(m[1]) : 0;
  if (dark <= 0.01) return im;
  tintCx.globalCompositeOperation = 'source-over'; tintCx.clearRect(0, 0, 256, 256); tintCx.drawImage(im, 0, 0);
  tintCx.globalCompositeOperation = 'source-atop'; tintCx.fillStyle = `rgba(8,4,14,${Math.min(0.92, dark)})`; tintCx.fillRect(0, 0, 256, 256);
  return tintCv;
}
function drawChar(key, frame, x, y, alpha = 1, filter = 'none', t = null) {
  let im = img(`${key}/${frame}`); if (!im) return;
  if (Horror.TUNE.lite && filter !== 'none') { im = tinted(im, filter); filter = 'none'; }
  ctx.save(); ctx.globalAlpha = alpha; ctx.filter = filter;
  ctx.translate(x, y);
  if (t) { if (t.rot) ctx.rotate(t.rot); const s = t.s || 1; ctx.scale(s * (t.sx || 1), s * (t.sy || 1)); }
  ctx.drawImage(im, -128, -ANIMS[key][2]);
  ctx.restore();
}
// 只用完整的表情差分，避免某一帧缺图时角色消失。
function fearKey(base) {
  for (let i = Horror.stage(); i > 0; i--) {
    const k = `${base}_fear${i}`, [count] = ANIMS[k];
    let f = 0;
    while (f < count && img(`${k}/${f}`)) f++;
    if (f === count) return k;
  }
  return base;
}
function shadow(x, y, w, a = 0.28) {
  if (w <= 0) return; ctx.fillStyle = `rgba(10,5,20,${a})`; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.22, 0, 0, Math.PI * 2); ctx.fill(); }
function roundRect(x, y, w, h, r) {
  w = Math.max(0, w); r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function panel(x, y, w, h, a = 0.82) {
  ctx.fillStyle = `rgba(28,21,40,${a})`; roundRect(x, y, w, h, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(214,150,190,0.85)'; ctx.lineWidth = 2; ctx.stroke();
}
function keycap(x, y, w, label) {
  ctx.fillStyle = 'rgba(40,30,58,0.95)'; roundRect(x, y, w, 64, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(232,170,205,0.9)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fbe8f3'; ctx.font = `600 28px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(label, x + w / 2, y + 43);
}

// ================================================================ 绘制：关卡
function mizukiFrame(p) {
  if (p.state === 'caught') return ['mizuki/caught', frameOf('mizuki/caught', p.animT, false)];
  if (p.state === 'trip') return ['mizuki/trip', frameOf('mizuki/trip', p.t, false)];
  if ((p.dashT > 0 || p.tunnel) && p.grounded) return ['mizuki/slide', Math.max(1, Math.min(3, 1 + Math.floor((DASH_T - p.dashT) / DASH_T * 3)))];
  if (!p.grounded && p.jumpFrom) return ['mizuki/boost', p.vz > 500 ? 1 : p.vz > -300 ? 2 : 3];
  if (!p.grounded) return ['mizuki/jump', p.vz > 450 ? 1 : p.vz > 80 ? 2 : p.vz > -380 ? 3 : 4];
  if (p.landT > 0) return ['mizuki/jump', 5];
  if (p.vx > 40) return [fearKey('mizuki/run'), Math.floor(p.animT * Math.max(6, 14 * p.vx / RUN)) % 8];
  return [fearKey('mizuki/run'), 0];
}
function mafuyuFrame(m) {
  if (game.state === 'caught') return ['mafuyu/hold_wrist', frameOf('mafuyu/hold_wrist', m.animT, false)];
  if (m.reach > 0) return ['mafuyu/reach', frameOf('mafuyu/reach', m.reach, false)];
  if (!m.moving) return ['mafuyu/stare', frameOf('mafuyu/stare', game.t)];
  if (m.z > 12) return [fearKey('mafuyu/jog'), 2];   // 跳在空中时停在跨步的那一帧
  return [fearKey('mafuyu/jog'), frameOf('mafuyu/jog', m.animT)];
}

function renderWorld() {
  const L = game.L, p = game.p, m = game.m, lanes = L.lanes;
  // 失误时镜头抖一下
  const sh = game.shake || 0, cx = game.camX + (sh ? (Math.random() - 0.5) * sh : 0);
  ctx.save(); if (sh) ctx.translate(0, (Math.random() - 0.5) * sh * 0.6);
  drawLayer(`map/${L.map}/far`, L.speeds[0]);
  drawLayer(`map/${L.map}/mid`, L.speeds[1]);
  drawLayer(`map/${L.map}/near`, L.speeds[2]);
  if (DEBUG) { ctx.strokeStyle = 'rgba(0,255,120,0.5)'; for (const y of lanes) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
  const vis = (x, w) => x + w > cx - 300 && x - w < cx + W + 300;

  renderLaneGuide();   // 地面箭头画在所有障碍下面
  renderDashZones();
  // 尘土 / 水花
  const dc = DUST_COLOR[L.key] || '220,210,230';
  for (const f of game.fx || []) {
    const y = laneY(f.lf), s = depthS(y), k = f.t / f.life;
    ctx.fillStyle = `rgba(${dc},${0.42 * (1 - k)})`;
    ctx.beginPath(); ctx.ellipse(f.x - cx, y - f.z * s, f.r * s * (1 + k * 1.4), f.r * s * (0.7 + k), 0, 0, Math.PI * 2); ctx.fill();
  }

  // 全道障碍仍是一个碰撞体，画面上每条跑道各摆一件，和人物一起按地面位置排序。
  const list = [];
  for (const o of game.obs) {
    if (!vis(o.x, 600)) continue;
    if (o.kind === 'full') {
      for (const y of lanes) list.push({ y, o });
      continue;
    }
    if (o.kind === 'walker' && (o.laneF < -1.7 || o.laneF > 3.6)) continue;   // 走出路面以外就不画
    list.push({ y: o.kind === 'walker' ? walkerY(o) : lanes[o.lane], o });
  }
  // 真冬钻过杂物堆时画在杂物后面，不从墙前穿过去
  const mInWall = game.obs.some(o => o.kind === 'wall' && Math.abs(o.lane - m.laneF) < 0.55 && m.x + 40 > left(o) && m.x - 40 < right(o));
  const mLane = visLane(m), pLane = visLane(p);
  list.push({ y: laneY(mLane) + (mInWall ? -0.5 : 0.1), who: 'm' });
  list.push({ y: laneY(pLane) + (p.tunnel ? -0.5 : 0.2), who: 'p' });   // 钻行时画在杂物后面
  list.sort((a, b) => a.y - b.y);
  for (const e of list) {
    if (e.who === 'p') {
      const y = laneY(pLane), s = depthS(y), v = p.vis || {};
      // 换道时脚下轻轻一跳
      const hop = p.grounded && v.laneU < 1 ? Math.sin(Math.PI * v.laneU) * 12 : 0;
      const zz = (p.z + hop) * s;
      shadow(p.x - cx, y, Math.max(16, (44 - p.z * 0.08)) * s, 0.28 * Math.max(0.35, 1 - p.z / 500));
      const [k, f] = mizukiFrame(p);
      if (p.dashT > 0 || p.tunnel) { ctx.fillStyle = 'rgba(255,200,230,0.35)'; for (let i = 0; i < 4; i++) ctx.fillRect(p.x - cx - 140 - i * 30, y - zz - 150 * s + i * 30 * s, 90 * s, 4); }
      const sq = v.sq || 0;
      drawChar(k, f, p.x - cx + (p.bumpT > 0 ? Math.sin(game.t * 80) * 4 : 0), y - zz, 1, Horror.charFilter('mizuki'),
        { s, sx: 1 + sq * 0.7, sy: 1 - sq, rot: v.lean || 0 });
    } else if (e.who === 'm') {
      if (m.x < cx - 200) continue;
      const y = laneY(mLane), s = depthS(y), v = m.vis || {};
      shadow(m.x - cx, y, 42 * s * Math.max(0.5, 1 - m.z / 400), 0.28 * Math.max(0.4, 1 - m.z / 400));
      const [k, f] = mafuyuFrame(m);
      const t = { s, sx: 1 + (v.sq || 0) * 0.7, sy: 1 - (v.sq || 0), rot: v.lean || 0 };
      // 恐惧值高时，真冬身后拖出黑色残影
      const ghost = Math.max(0, (Horror.fear - 0.5) / 0.5);
      if (ghost > 0 && m.moving) for (let i = 1; i <= 2; i++) drawChar(k, f, m.x - cx - i * 26, y - m.z * s, 0.2 * ghost / i, 'brightness(0.15)', t);
      drawChar(k, f, m.x - cx, y - m.z * s, 1, Horror.charFilter('mafuyu'), t);
    } else drawObs(e.o, e.y, cx);
  }

  if (DEBUG) {
    ctx.strokeStyle = '#0f0'; ctx.strokeRect(p.x - cx - HW, laneY(p.laneF) - p.z - 178, HW * 2, 178);   // 调试框画的是实际判定，不跟画面缩放
    ctx.strokeStyle = '#f0f';
    for (const o of game.obs) {
      if (o.kind === 'full') {
        for (const y of lanes) ctx.strokeRect(left(o) - cx, y - o.h, o.w, o.h);
        continue;
      }
      const y = o.kind === 'walker' ? walkerY(o) : lanes[o.lane];
      if (o.kind === 'car') {
        for (const [a, b, h] of CAR_PROFILE[o.type]) ctx.strokeRect(o.x - cx + a, y - h, b - a, h);
      } else ctx.strokeRect(left(o) - cx, y - Math.min(o.h, 300), o.w, Math.min(o.h, 300));
    }
  }
  ctx.restore();
}

// 木箱入画就提示，钻行时跟随当前木箱，直到滑行动作完成。
function dashSpots() {
  const p = game.p, viewRight = game.camX + W;
  let next = p.tunnel;
  if (!next) {
    for (const o of game.obs) {
      if (!o.gap || p.x - HW >= right(o) || left(o) >= viewRight) continue;
      if (!next || o.x < next.x) next = o;
    }
  }
  if (!next) return [];
  const edge = left(next) - HW;
  const a = edge - GAP_DASH_LEAD - 40, b = edge + 4;
  const inLane = Math.abs(next.lane - p.laneF) < 0.45;
  return [{ o: next, a, b, inLane, inZone: inLane && p.x >= a && p.x <= b }];
}
function renderDashZones() {
  const p = game.p, cx = game.camX;
  for (const z of dashSpots()) {
    if (p.tunnel) continue;
    const { inZone } = z, y = game.L.lanes[z.o.lane];
    const pulse = 0.5 + 0.5 * Math.sin(game.t * (inZone ? 16 : 5));
    const x0 = z.a - cx + HW, x1 = z.b - cx + HW;
    ctx.save();
    ctx.fillStyle = `rgba(255,232,120,${inZone ? 0.32 + 0.2 * pulse : 0.14 + 0.08 * pulse})`;
    ctx.beginPath(); ctx.moveTo(x0 + 10, y - 22); ctx.lineTo(x1 + 10, y - 22); ctx.lineTo(x1 - 10, y + 22); ctx.lineTo(x0 - 10, y + 22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(255,236,150,${inZone ? 0.95 : 0.55})`; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = `rgba(60,40,10,${inZone ? 0.9 : 0.6})`; ctx.font = `800 26px ${FONT}`; ctx.textAlign = 'center';
    ctx.fillText('SHIFT', (x0 + x1) / 2, y + 9);
    ctx.restore();
  }
}
function renderDashGates() {
  const p = game.p, spots = dashSpots();
  for (const z of spots) {
    const { inZone } = z;
    const tunnel = p.tunnel === z.o;
    let text, accent;
    if (tunnel) { text = '钻行中'; accent = '#fff1aa'; }
    else if (inZone) { text = '现在按 Shift！'; accent = '#ffe066'; }
    else { text = z.inLane ? '底下能钻 · 到黄色区域按 Shift' : '换到这条道 · 到黄色区域按 Shift'; accent = '#9cf5f2'; }
    ctx.save();
    ctx.font = `700 ${inZone ? 30 : 24}px ${FONT}`; ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 40, h = inZone ? 56 : 48;
    const ty = game.L.lanes[z.o.lane] - 470 + Math.sin(game.t * (inZone ? 14 : 5)) * 4;
    const x = Math.min(z.o.x - game.camX, W - w / 2 - 36);
    ctx.fillStyle = 'rgba(14,18,30,0.9)'; roundRect(x - w / 2, ty, w, h, 12); ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = inZone ? 3.5 : 2.5; ctx.shadowColor = accent; ctx.shadowBlur = inZone ? 22 : 6; ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = accent; ctx.fillText(text, x, ty + h / 2 + (inZone ? 11 : 9));
    ctx.beginPath(); ctx.moveTo(x - 10, ty + h); ctx.lineTo(x + 10, ty + h); ctx.lineTo(x, ty + h + 12); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // 进入区域时屏幕两侧闪一下黄色，余光也能看到
  if (!p.tunnel && spots.some(z => z.inZone)) {
    const a = 0.18 + 0.12 * Math.sin(game.t * 16);
    for (const [x0, x1] of [[0, 90], [W, W - 90]]) { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, `rgba(255,224,102,${a})`); g.addColorStop(1, 'rgba(255,224,102,0)'); ctx.fillStyle = g; ctx.fillRect(Math.min(x0, x1), 0, 90, H); }
  }
}
const walkerY = o => laneY(Math.max(-1.7, Math.min(3.6, o.laneF)));
function drawObs(o, y, cx = game.camX) {
  const x = o.x - cx, s = depthS(y);
  if (o.kind === 'full') {
    const p = game.p;
    const occludesPlayer = y > laneY(p.laneF) + 30 && Math.abs(o.x - p.x) < o.w / 2 + 48;
    ctx.save();
    ctx.globalAlpha = occludesPlayer ? 0.68 : 1;
    // 每条道一件，按远近缩放；越往后越往右偏一点，顺着地面的透视排成一排，而不是摞成一座塔
    const depthOffset = Math.round((y - game.L.lanes[1]) * -0.22);
    shadow(x + depthOffset, y + 2, o.w * 0.55 * s, 0.22);
    ctx.translate(Math.round(x + depthOffset), Math.round(y)); ctx.scale(s, s);
    ctx.drawImage(img('obs/' + o.type), -256, -702);
    ctx.restore();
    return;
  }
  if (o.kind === 'wall') {
    // 比瑞希靠前的高墙会挡住后排，变成半透明，方便看清后面的路和门洞
    const p = game.p;
    const occl = o.lane > p.laneF + 0.3 && Math.abs(o.x - p.x) < 520;
    ctx.save();
    ctx.globalAlpha = occl ? 0.45 : 1;
    ctx.translate(Math.round(x), Math.round(y + 50 * s)); ctx.scale(s * WALL_SX, s * WALL_SY);
    ctx.drawImage(img('obs/' + o.type), -256, -752);
    ctx.restore();
    return;
  }
  if (o.kind === 'car') {
    shadow(x, y + 14 * s, 200 * s, 0.3);
    const bob = Math.sin(o.animT * 15) * 1.2;   // 车身随路面轻微起伏
    ctx.save(); ctx.translate(Math.round(x), Math.round(y + 18 * s + bob)); ctx.scale(s, s);
    ctx.drawImage(img(`obs/${o.type}/${Math.floor(o.animT * 12) % 4}`), -512, -496);
    ctx.restore(); return;
  }
  if (o.kind === 'student') {
    shadow(x, y, 40 * s);
    const d = o.vx < 0 ? 'left' : 'right';
    // 步频按走路速度算；停下以后站着，身体随呼吸轻轻起伏
    const fr = !o.stopped ? Math.floor(o.animT * 9 * Math.max(0.7, Math.min(1.5, Math.abs(o.vx) / 120))) % 6 : 0;
    const breathe = o.stopped ? 1 + 0.012 * Math.sin(game.t * 2.4 + o.x) : 1;
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(s, s * breathe);
    ctx.drawImage(img(`obs/${o.type}/${d}/${fr}`), -128, -240);
    ctx.restore(); return;
  }
  if (o.kind === 'walker') {
    shadow(x, y, 40 * s);
    const d = o.to > o.from ? 'front' : 'back';
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(s, s);
    ctx.drawImage(img(`obs/${o.type}/${d}/${Math.floor(o.animT * 9) % 6}`), -128, -240);   // 一直在走
    ctx.restore();
  }
}

// ================================================================ 绘制：界面
function fmtTime(t) { const m = Math.floor(t / 60), sec = Math.floor(t % 60); return `${m}:${String(sec).padStart(2, '0')}`; }
function chip(x, y, text, color, align = 'left') {
  ctx.font = `600 22px ${FONT}`;
  const w = ctx.measureText(text).width + 28;
  const bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = 'rgba(20,14,30,0.78)'; roundRect(bx, y, w, 36, 18); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(text, bx + w / 2, y + 26);
  return w;
}
const DIFF_COLOR = { easy: '#9fe3c4', normal: '#f2b8d6', hard: '#ff7b9c' };
function renderHud() {
  const p = game.p, L = game.L;
  const by = 22;
  // 信息条：难度 · 关卡进度（距离不显示，只看真冬在画面上离得多近）
  const iy = by + 20, prog = Math.min(1, p.x / L.length);
  chip(W / 2 - 440, iy - 2, DIFF[game.diff].name, DIFF_COLOR[game.diff]);
  ctx.textAlign = 'center'; ctx.font = `600 26px ${FONT}`; ctx.fillStyle = 'rgba(244,226,238,0.95)';
  ctx.fillText(`第 ${game.level + 1} / ${LEVELS.length} 关　${L.name}`, W / 2, iy + 24);
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; roundRect(W / 2 - 300, iy + 44, 600, 6, 3); ctx.fill();
  ctx.fillStyle = '#e9a7c9'; roundRect(W / 2 - 300, iy + 44, 600 * prog, 6, 3); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(W / 2 - 300 + 600 * prog, iy + 47, 7, 0, Math.PI * 2); ctx.fill();
  if (L.key !== 'shibuya' && !TOUCH) {   // 触屏时冷却显示在「冲刺」按钮上
    const cd = 1 - p.dashCD / DASH_CD, ready = cd >= 1;
    ctx.fillStyle = 'rgba(20,14,30,0.75)'; roundRect(36, H - 84, 250, 50, 25); ctx.fill();
    ctx.strokeStyle = ready ? 'rgba(242,184,214,0.9)' : 'rgba(200,106,165,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = ready ? '#f2b8d6' : 'rgba(200,106,165,0.55)'; roundRect(42, H - 78, 238 * cd, 38, 19); ctx.fill();
    ctx.fillStyle = ready ? '#2a1830' : '#fbe8f3'; ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center';
    ctx.fillText(ready ? 'Shift 冲刺 · 就绪' : 'Shift 冲刺 · 冷却中', 161, H - 51);
  }
  // 扣分飘字
  for (const u of game.popups) {
    ctx.globalAlpha = Math.max(0, 1 - u.t / 1.3);
    ctx.font = `700 40px ${FONT}`; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(20,10,25,0.85)'; ctx.fillStyle = u.bad ? '#ff5d86' : '#ffb35c';
    const y = u.y - u.t * 60; ctx.strokeText(u.text, u.x - game.camX, y); ctx.fillText(u.text, u.x - game.camX, y);
    ctx.globalAlpha = 1;
  }
  // 提示
  if (game.hint) {
    ctx.globalAlpha = Math.min(1, game.hint.t * 3);
    ctx.font = `500 32px ${FONT}`;
    const hw = Math.max(520, ctx.measureText(game.hint.text).width + 90);
    panel(W / 2 - hw / 2, 196, hw, 70, 0.8);
    ctx.fillStyle = game.hint.pin ? '#fff1aa' : '#fbe8f3'; ctx.textAlign = 'center'; ctx.fillText(game.hint.text, W / 2, 242); ctx.globalAlpha = 1;
  }
  // 键位说明（第一关开头；简单难度每关开头都有）
  if (game.keyHintT > 0) {
    ctx.globalAlpha = Math.min(1, game.keyHintT);
    const g = game.keyItems, items = g ? g.items : KEY_ITEMS;
    const ky = g ? 280 : 290, top = g ? 46 : 0;
    panel(W / 2 - 500, ky, 1000, 150 + top, 0.78);
    if (g) { ctx.fillStyle = '#e9a7c9'; ctx.font = `600 26px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(`${g.title} · 怎么过`, W / 2, ky + 36); }
    items.forEach(([k, t], i) => {
      const w = 150, x = (W - w) / 2 + (i - (items.length - 1) / 2) * 240;
      keycap(x, ky + 18 + top, w, k);
      ctx.fillStyle = '#f3dceb'; ctx.font = `500 22px ${FONT}`; ctx.fillText(t, x + w / 2, ky + 118 + top);
    });
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'right'; ctx.font = `400 20px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,0.45)';
  if (!TOUCH) ctx.fillText(`Esc 暂停　M ${audio.muted ? '开声音' : '静音'}`, W - 30, H - 24);
  ctx.textAlign = 'center';
}
function circlePortrait(k, cx, cy, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#1b1526'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  const im = img(k);
  if (im) {
    const scale = im.naturalWidth / 256;
    ctx.drawImage(im, 40 * scale, 30 * scale, 176 * scale, 176 * scale, cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();
}
// 剧情画面。台词可以加这些写法（都写在 story.js 里）：
//   style: 'center' 画面正中的大字 / 'whisper' 下方的小字低语 / 'echo' 一句话重复出现、越来越淡 / 'glitch' 抖动、错位、偶尔乱码
//   fx: 'zoom' 背景慢慢推近 / 'shake' 背景轻微晃动 / 'dim' 背景更暗
//   chat: [{ n: 名字, t: 内容, sys: 系统提示 }] Nightcord 聊天窗口，一条一条出现
//   auto: 秒数   打完字后自动跳到下一句；speed: 每秒几个字（默认 28）
const CHAT_COLOR = { K: '#8fb4ff', '雪': '#b9a3ff', 'えななん': '#ffb98a', Amia: '#ffb7d5' };
function storyBg(line, s) {
  if (line.alt && !img(line.bg)) line = { ...line, bg: line.alt };
  if (line.bg === 'black') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
  if (line.bg === 'white') { ctx.fillStyle = '#f5f1f3'; ctx.fillRect(0, 0, W, H); return; }
  const im = img(line.bg); if (!im) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
  const t = Math.min(s.t, 12);
  const z = line.fx === 'zoom' ? 1 + t * 0.012 : 1;
  const jx = line.fx === 'shake' ? (Math.random() - 0.5) * 6 : 0, jy = line.fx === 'shake' ? (Math.random() - 0.5) * 4 : 0;
  // crop：[左, 上, 宽, 高]，按整张图的比例取一块放大（用来给同一张图做特写）
  const [cx0, cy0, cw, ch] = line.crop ? [line.crop[0] * im.width, line.crop[1] * im.height, line.crop[2] * im.width, line.crop[3] * im.height] : [0, 0, im.width, im.height];
  const sc = Math.max(W / cw, H / ch) * z;
  if (line.soft) ctx.filter = `blur(${line.soft}px)`;
  ctx.drawImage(im, cx0, cy0, cw, ch, (W - cw * sc) / 2 + jx, (H - ch * sc) / 2 + jy, cw * sc, ch * sc);
  ctx.filter = 'none';
  if (line.fx === 'dim') { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H); }
}
function glitchText(t, n) {
  const pool = '▇▆▅▃▂■□◆◇※＃';
  return [...t].map(c => Math.random() < n ? pool[Math.floor(Math.random() * pool.length)] : c).join('');
}
function renderStory() {
  const s = game.story; if (!s) return;
  const line = s.lines[s.i];
  storyBg(line, s);
  if (line.dream) dreamFX(); else if (line.real) realFX();
  // 蒙眼的那几句不叠恐怖滤镜（不然整张图都黑了），只留暗角和一点闪烁
  if (game.storyKind === 'bad') { if (!line.clear) Horror.postFX(ctx, canvas, W, H, performance.now() / 1000); else Horror.drawFlashes(ctx, W, H); }
  else if (line.clear) {
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.75 + 0.1 * Math.sin(game.t * 2)})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    if (Math.random() < 0.04) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H); }
  }
  const shown = (line.text || '').slice(0, Math.floor(s.t * (line.speed || 28)));
  const style = line.style;
  if (line.chat) renderChat(line, s);
  else if (style === 'center' || style === 'glitch' || style === 'echo') {
    ctx.textAlign = 'center';
    if (style === 'echo') {
      ctx.font = `400 46px ${FONT}`;
      for (let k = 3; k >= 0; k--) {
        ctx.fillStyle = `rgba(240,225,235,${k === 0 ? 0.95 : 0.22 / k})`;
        ctx.fillText(shown, W / 2 + k * 14 * Math.sin(game.t * 0.7 + k), H / 2 + k * 30);
      }
    } else if (style === 'glitch') {
      ctx.font = `500 50px ${FONT}`;
      const jit = () => (Math.random() - 0.5) * 8;
      const tt = glitchText(shown, 0.06);
      ctx.fillStyle = 'rgba(255,40,80,0.55)'; ctx.fillText(tt, W / 2 - 4 + jit(), H / 2 + jit());
      ctx.fillStyle = 'rgba(40,220,255,0.45)'; ctx.fillText(tt, W / 2 + 4 + jit(), H / 2 + jit());
      ctx.fillStyle = '#f2e8ef'; ctx.fillText(tt, W / 2, H / 2);
      if (Math.random() < 0.12) { const y = Math.random() * H; ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, y, W, 2 + Math.random() * 10); }
    } else {
      ctx.font = `400 52px ${FONT}`; ctx.fillStyle = line.bg === 'white' ? `rgba(70,60,72,${Math.min(1, s.t * 1.5)})` : `rgba(245,236,242,${Math.min(1, s.t * 1.5)})`;
      ctx.fillText(shown, W / 2, H / 2);
    }
  } else if (style === 'whisper') {
    ctx.textAlign = 'center'; ctx.font = `400 32px ${FONT}`;
    ctx.fillStyle = line.bg === 'white' ? `rgba(90,80,92,${0.55 + 0.2 * Math.sin(game.t * 3)})` : `rgba(220,205,215,${0.45 + 0.2 * Math.sin(game.t * 3)})`;
    ctx.fillText(shown, W / 2 + Math.sin(game.t * 9) * 1.5, H - 150);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, W, H);
    const bx = 160, by = H - 300, bw = W - 320, bh = 240;
    panel(bx, by, bw, bh, 0.86);
    const face = line.face && img(`portrait/${line.who}_${line.face}`) ? `portrait/${line.who}_${line.face}` : 'portrait/' + line.who;
    if (line.who && line.who !== 'mirror' && img(face)) ctx.drawImage(img(face), bx + 10, by + bh - 400, 400, 400);   // 头像是带留白的胸像，放大一点让人物探出对话框   // ？？？ 不露脸
    const tx = line.who && line.who !== 'mirror' ? bx + 400 : bx + 70;
    ctx.textAlign = 'left';
    if (line.who) { ctx.fillStyle = NAME_COLOR[line.who] || '#ffb7d5'; ctx.font = `600 32px ${FONT}`; ctx.fillText(NAMES[line.who], tx, by + 62); }
    ctx.fillStyle = line.who === 'mirror' ? '#c9bfc8' : '#f7ecf3'; ctx.font = `400 40px ${FONT}`;
    wrapText(line.who === 'mirror' ? glitchText(shown, 0.015) : shown, tx, by + (line.who ? 130 : 110), bw - (tx - bx) - 70, 56);
  }
  ctx.textAlign = 'right'; ctx.font = `400 20px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('空格 / Enter 继续　Esc 跳过', W - 40, H - 22);
  ctx.textAlign = 'center';
}
// Nightcord 聊天窗口：消息一条一条出现
function renderChat(line, s) {
  const n = Math.min(line.chat.length, Math.floor(s.t / CHAT_STEP) + 1);
  const bw = 900, rowH = 62, bh = 110 + line.chat.length * rowH, bx = (W - bw) / 2, by = (H - bh) / 2 - 30;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(18,16,26,0.94)'; roundRect(bx, by, bw, bh, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(160,140,190,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(30,27,42,1)'; roundRect(bx, by, bw, 56, 16); ctx.fill(); ctx.fillRect(bx, by + 30, bw, 26);
  ctx.textAlign = 'left'; ctx.font = `600 24px ${FONT}`; ctx.fillStyle = '#c9c0dc'; ctx.fillText(line.title || '# 25時、ナイトコードで。', bx + 26, by + 37);
  for (let k = 0; k < n; k++) {
    const m = line.chat[k], y = by + 100 + k * rowH, a = k === n - 1 ? Math.min(1, (s.t - k * CHAT_STEP) * 4) : 1;
    ctx.globalAlpha = a * (m.fade ? 0.4 : m.ghost ? 0.38 + 0.08 * Math.sin(game.t * 4) : 1);
    if (m.sys) { ctx.font = `400 22px ${FONT}`; ctx.fillStyle = '#8c86a0'; ctx.fillText(m.t, bx + 40, y); }
    else {
      ctx.font = `700 24px ${FONT}`; ctx.fillStyle = CHAT_COLOR[m.n] || '#ddd'; ctx.fillText(m.n, bx + 40, y);
      ctx.font = `400 28px ${FONT}`; ctx.fillStyle = '#ece6f2'; ctx.fillText(m.t, bx + 180, y);
      if (m.ghost) { const tw = ctx.measureText(m.t).width; ctx.globalAlpha = a; ctx.font = `500 20px ${FONT}`; ctx.fillStyle = '#e0607a'; ctx.fillText('！发送失败', bx + 196 + tw, y); }
    }
    ctx.globalAlpha = 1;
  }
}
function wrapText(t, x, y, maxW, lh) {
  let line = '', yy = y;
  for (const ch of t) { if (ctx.measureText(line + ch).width > maxW) { ctx.fillText(line, x, yy); line = ch; yy += lh; } else line += ch; }
  ctx.fillText(line, x, yy);
}
function renderCard() {
  const L = LEVELS[game.cardLevel];
  drawCover('card/' + L.key);
  const a = Math.min(1, game.cardT * 2);
  ctx.fillStyle = `rgba(10,6,16,${0.45 * a})`; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = a; ctx.textAlign = 'center';
  ctx.fillStyle = '#e9a7c9'; ctx.font = `500 34px ${FONT}`; ctx.fillText(`第 ${game.cardLevel + 1} 关`, W / 2, H / 2 - 70);
  ctx.fillStyle = '#fff'; ctx.font = `700 96px ${FONT}`; ctx.fillText(L.name, W / 2, H / 2 + 30);
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = `400 34px ${FONT}`; ctx.fillText(L.sub, W / 2, H / 2 + 95);
  chip(W / 2, H / 2 + 135, DIFF[game.diff].name, DIFF_COLOR[game.diff], 'center');
  ctx.globalAlpha = 1;
}
function renderPause() {
  ctx.fillStyle = 'rgba(8,5,14,0.55)'; ctx.fillRect(0, 0, W, H);
  const pi = img('ui/pause_panel'); ctx.drawImage(pi, W / 2 - pi.width / 2, 300);
  ctx.fillStyle = '#f7ecf3'; ctx.font = `600 44px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('暂停', W / 2, 400);
  for (let i = 0; i < 3; i++) {
    const r = pauseBtnRect(i);
    ctx.globalAlpha = i === game.pause.sel ? 1 : 0.7;
    ctx.drawImage(img('ui/pause_button'), r.x, r.y, r.w, r.h);
    if (i === game.pause.sel) { ctx.strokeStyle = '#ffb7d5'; ctx.lineWidth = 3; roundRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4, 14); ctx.stroke(); }
    ctx.fillStyle = '#f7ecf3'; ctx.font = `500 32px ${FONT}`; ctx.fillText(PAUSE_ITEMS[i], W / 2, r.y + 49);
    ctx.globalAlpha = 1;
  }
  const st = game.stats || newStats();
  ctx.fillStyle = 'rgba(14,9,22,0.78)'; roundRect(W / 2 - 480, 786, 960, 96, 16); ctx.fill();
  ctx.font = `400 24px ${FONT}`; ctx.fillStyle = 'rgba(244,226,238,0.85)';
  ctx.fillText(`${DIFF[game.diff].name} · 第 ${game.level + 1} 关 · 用时 ${fmtTime(st.time)} · 跳晚了 ${st.late} 次 · 撞上了 ${st.hit} 次`, W / 2, 822);
  ctx.font = `400 22px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillText('W / S 选择　Enter 确定　Esc 继续　（换难度请回到标题）', W / 2, 862);
}
// 误会结局开头：周围的学生头上冒出「！」
function renderRumorMarks() {
  const t = game.rumorT || 0;
  ctx.save(); ctx.textAlign = 'center'; ctx.font = `900 64px ${FONT}`;
  for (const o of game.obs) {
    if (o.kind !== 'student') continue;
    const x = o.x - game.camX, y = game.L.lanes[o.lane] - 250 * depthS(game.L.lanes[o.lane]);
    if (x < -100 || x > W + 100) continue;
    const a = Math.min(1, t * 4), bounce = Math.max(0, 1 - t * 3) * 18;
    ctx.globalAlpha = a; ctx.fillStyle = '#ffe066'; ctx.strokeStyle = 'rgba(40,20,10,0.8)'; ctx.lineWidth = 6;
    ctx.strokeText('！', x, y - bounce); ctx.fillText('！', x, y - bounce);
  }
  ctx.restore();
}
// ================================================================ 隐藏结局的画面效果
// 被撞的那一刻：世界定格，画面一下子发白、晃动
function renderCrash() {
  const t = game.crashT;
  ctx.save();
  if (t < 0.5) ctx.translate((Math.random() - 0.5) * 18 * (1 - t * 2), (Math.random() - 0.5) * 10 * (1 - t * 2));
  renderWorld();
  ctx.restore();
  ctx.fillStyle = 'rgba(128,128,128,0.6)'; ctx.globalCompositeOperation = 'saturation'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  const a = t < 0.07 ? 1 : Math.min(1, 0.3 + (t - 0.07) * 0.9);
  ctx.fillStyle = `rgba(246,242,244,${a})`; ctx.fillRect(0, 0, W, H);
}
// 梦：过曝、柔焦、重影、漂浮的光点。看起来很温暖，但哪里都不太对
function dreamFX() {
  const t = game.t;
  ctx.save();
  ctx.globalAlpha = 0.2; ctx.drawImage(canvas, 14 * Math.sin(t * 0.5), 6 * Math.cos(t * 0.4));   // 重影
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.45 + 0.08 * Math.sin(t * 0.8);
  ctx.filter = 'blur(16px)'; ctx.drawImage(canvas, 0, 0); ctx.filter = 'none';                     // 光晕
  ctx.restore();
  ctx.fillStyle = 'rgba(128,128,128,0.35)'; ctx.globalCompositeOperation = 'saturation'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(255,250,252,0.08)'); g.addColorStop(1, `rgba(255,250,252,${0.62 + 0.06 * Math.sin(t * 0.7)})`);   // 边缘发白
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {   // 往上飘的光点
    const x = (i * 337 + Math.sin(t * 0.3 + i) * 60) % W, y = H - ((t * (18 + i % 5 * 7) + i * 97) % (H + 60));
    ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.2 * Math.sin(t * 2 + i)})`;
    ctx.beginPath(); ctx.arc(x, y, 2 + i % 4, 0, Math.PI * 2); ctx.fill();
  }
}
// 现实：冷、褪色、颗粒，信号灯的红光一明一灭
function realFX() {
  ctx.fillStyle = 'rgba(128,128,128,0.45)'; ctx.globalCompositeOperation = 'saturation'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(170,178,200)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const on = Math.floor(game.t * 1.1) % 2 === 0;
  const g = ctx.createRadialGradient(W * 0.12, H * 0.25, 20, W * 0.12, H * 0.25, W * 0.7);
  g.addColorStop(0, `rgba(230,30,40,${on ? 0.32 : 0.06})`); g.addColorStop(1, 'rgba(230,30,40,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
}
function renderEnd() {
  const kind = game.ending, rumor = kind === 'rumor', good = kind === 'good', crash = kind === 'crash', a = Math.min(1, (game.endT || 0) * 1.5);
  drawCover(rumor ? (img('scene/rumor_alone') ? 'scene/rumor_alone' : 'card/kamiyama') : good ? 'scene/good_caught_chibi' : crash ? 'scene/crash_empty_sekai_glow' : 'scene/bad_escaped_03');
  if (crash) dreamFX();
  ctx.fillStyle = good ? 'rgba(20,10,30,0.5)' : crash ? 'rgba(30,24,34,0.35)' : 'rgba(0,0,0,0.62)'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = a; ctx.textAlign = 'center';
  ctx.fillStyle = good ? '#ffd0e4' : crash ? '#f4eef2' : '#c9c2d6'; ctx.font = `500 36px ${FONT}`; ctx.fillText(rumor ? '坏结局 · 误会' : good ? '好结局' : crash ? '隐藏结局' : '坏结局', W / 2, H / 2 - 190);
  ctx.fillStyle = crash ? '#ffffff' : '#fff'; ctx.font = `700 92px ${FONT}`;
  if (crash) { ctx.save(); ctx.shadowColor = 'rgba(80,60,80,0.6)'; ctx.shadowBlur = 20; }
  ctx.fillText(rumor ? '再也追不上了' : good ? '被抓住了' : crash ? '没有到达的 25 时' : '逃走了', W / 2 + (kind === 'bad' ? (Math.random() - 0.5) * 3 : 0), H / 2 - 90);
  if (crash) ctx.restore();
  // 这一局的记录
  const st = game.stats || newStats();
  panel(W / 2 - 380, H / 2 - 40, 760, 190, 0.8);
  const third = rumor ? ['撞到同学', '3 次 · 神山高校的走廊上'] : good ? ['在第几关被抓', `第 ${st.level + 1} 关 · ${LEVELS[st.level].name}`] : crash ? ['最后', `第 ${st.level + 1} 关 · ${LEVELS[st.level].name}的车流里`] : ['身后', '没有人了'];
  const rows = [['难度', DIFF[game.diff].name], ['用时', fmtTime(st.time)], third, ['失误', `跳晚了 ${st.late} 次 · 撞上了 ${st.hit} 次`]];
  rows.forEach(([k, v], i) => {
    const y = H / 2 + 2 + i * 40;
    ctx.textAlign = 'right'; ctx.font = `400 26px ${FONT}`; ctx.fillStyle = 'rgba(244,226,238,0.65)'; ctx.fillText(k, W / 2 - 60, y);
    ctx.textAlign = 'left'; ctx.font = `600 26px ${FONT}`; ctx.fillStyle = i === 0 ? DIFF_COLOR[game.diff] : '#fbe8f3'; ctx.fillText(v, W / 2 - 30, y);
  });
  ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = `400 30px ${FONT}`;
  ctx.fillText('Enter 同难度再来一次　　Esc 回到标题（可换难度）', W / 2, H / 2 + 230);
  if (!crash) {
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = `400 18px ${FONT}`;
    ctx.fillText(`结局音乐：「${good || rumor ? 'Carefree' : 'Darkest Child'}」Kevin MacLeod (incompetech.com) · CC BY 4.0`, W / 2, H - 40);
  }
  ctx.globalAlpha = 1;
}
function renderTitle() {
  drawCover('scene/title');
  // 左侧压暗一点，让菜单看得清
  const g = ctx.createRadialGradient(380, 790, 60, 380, 790, 720);
  g.addColorStop(0, 'rgba(12,8,20,0.66)'); g.addColorStop(0.55, 'rgba(12,8,20,0.45)'); g.addColorStop(1, 'rgba(12,8,20,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // 标题：荆棘之路（带荆棘的标题字）＋ 逃跑计划
  const tl = img('ui/title_logo');
  ctx.save(); ctx.shadowColor = 'rgba(10,4,16,0.7)'; ctx.shadowBlur = 24;
  ctx.drawImage(tl, 84, 196, 646, 187);
  ctx.textAlign = 'left'; ctx.fillStyle = '#f1e6ee'; ctx.font = `700 54px "Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif`;
  ctx.fillText('逃 跑 计 划', 112, 448);
  ctx.restore();
  ctx.fillStyle = 'rgba(170,40,80,0.85)'; ctx.fillRect(112, 468, 300, 2);
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,236,246,0.85)'; ctx.font = `500 26px ${FONT}`;
  ctx.fillText('选择难度', 100, 552);
  for (let i = 0; i < 3; i++) {
    const key = DIFF_ORDER[i], d = DIFF[key], r = titleRect(i), sel = i === game.titleSel, col = DIFF_COLOR[key];
    ctx.fillStyle = sel ? 'rgba(40,26,52,0.9)' : 'rgba(24,16,34,0.62)'; roundRect(r.x, r.y, r.w, r.h, 18); ctx.fill();
    ctx.strokeStyle = sel ? col : 'rgba(255,255,255,0.14)'; ctx.lineWidth = sel ? 3 : 1.5; ctx.stroke();
    if (sel) { ctx.fillStyle = col; roundRect(r.x, r.y + 16, 7, r.h - 32, 4); ctx.fill(); }
    ctx.globalAlpha = sel ? 1 : 0.72;
    ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.font = `700 40px ${FONT}`; ctx.fillText(d.name, r.x + 34, r.y + 60);
    ctx.fillStyle = '#f3dceb'; ctx.font = `400 22px ${FONT}`; ctx.fillText(d.desc, r.x + 150, r.y + 44);
    // 达成过的结局
    const rec = game.records[key] || {};
    ctx.font = `500 19px ${FONT}`;
    ctx.fillStyle = rec.good ? '#ffd0e4' : 'rgba(255,255,255,0.3)'; ctx.fillText(rec.good ? '● 被抓住了' : '○ 被抓住了', r.x + 150, r.y + 78);
    ctx.fillStyle = rec.bad ? '#c9c2d6' : 'rgba(255,255,255,0.3)'; ctx.fillText(rec.bad ? '● 逃走了' : '○ 逃走了', r.x + 290, r.y + 78);
    // 隐藏结局：达成前只显示问号
    ctx.fillStyle = rec.crash ? '#f4eef2' : 'rgba(255,255,255,0.3)'; ctx.fillText(rec.crash ? '● 25 时' : '○ ？？？', r.x + 400, r.y + 78);
    ctx.fillStyle = rec.rumor ? '#a8d8b0' : 'rgba(255,255,255,0.3)'; ctx.fillText(rec.rumor ? '● 误会' : '○ ？？？', r.x + 500, r.y + 78);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = `rgba(255,236,246,${0.6 + 0.4 * Math.sin(game.t * 3)})`; ctx.font = `500 28px ${FONT}`;
  ctx.fillText('W / S 选择　空格 / Enter 开始（也可以直接点击）', 100, 944);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `400 21px ${FONT}`;
  ctx.fillText('游戏中：空格 跳（踩物可借力）　W / S 换道　Shift 冲刺 / 钻箱　Esc 暂停', 100, 984);
}

function renderLoading() {
  ctx.fillStyle = '#0b0910'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e9a7c9'; ctx.font = `500 36px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('载入中……', W / 2, H / 2 - 40);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(W / 2 - 300, H / 2, 600, 8);
  ctx.fillStyle = '#e9a7c9'; ctx.fillRect(W / 2 - 300, H / 2, 600 * (loaded / required), 8);
  if (loadError) { ctx.fillStyle = '#ff8fa8'; ctx.font = `400 26px ${FONT}`; ctx.fillText('有素材没找到：请确认 assets 文件夹和 index.html 放在一起。', W / 2, H / 2 + 80); ctx.fillText(loadError, W / 2, H / 2 + 120); }
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  switch (game.state) {
    case 'loading': renderLoading(); break;
    case 'title': renderTitle(); break;
    case 'story': renderStory(); break;
    case 'card': renderCard(); break;
    case 'play': case 'leaving': renderWorld(); Horror.postFX(ctx, canvas, W, H, performance.now() / 1000); renderDashGates(); renderHud(); break;
    case 'caught': case 'escape': renderWorld(); Horror.postFX(ctx, canvas, W, H, performance.now() / 1000); break;
    case 'crash': renderCrash(); break;
    case 'rumor': renderWorld(); renderRumorMarks(); break;
    case 'rumorFlee': renderWorld(); break;
    case 'paused': renderWorld(); Horror.postFX(ctx, canvas, W, H, performance.now() / 1000); renderDashGates(); renderHud(); renderPause(); break;
    case 'end': renderEnd(); break;
  }
  if (game.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${game.fade})`; ctx.fillRect(0, 0, W, H); }
}

// ================================================================ 载入
let loaded = 0, loadError = null;
const required = imageList.filter(e => !e[2]).length;
for (const [k, path, optional] of imageList) {
  const im = new Image();
  im.onload = () => {
    IMG[k] = im;
    if (optional && k.endsWith('/0')) {   // 差分第一帧存在，接着读其余帧
      const base = k.slice(0, -2);
      for (let i = 1; i < ANIMS[base][0]; i++) { const e = new Image(); e.onload = () => { IMG[`${base}/${i}`] = e; }; e.src = A + `characters/${base}/${String(i).padStart(2, '0')}.png`; }
    }
    if (!optional && ++loaded === required) { game.state = 'title'; playBgm('title'); }
  };
  im.onerror = () => { if (!optional) loadError = path; };   // 可选的表情差分没有也没关系
  im.src = A + path;
}
requestAnimationFrame(frame);

// 调试：控制台里可以用 __game 跳关、改状态
window.__game = { game, keys, pressed, startLevel, showCard, caught, endScreen, startStory, updatePlay, render, laneY, updateHorror, buildLevel, LEVELS, DIFF };
