// 《荆棘之路 逃跑计划》关卡数据
// 改这里就能调整关卡和难度，不用动 game.js。
//
// 跑道：0 = 后排（画面靠上），1 = 中间，2 = 前排（画面靠下）
// lanes：三条跑道在画面上的脚底高度（像素），换背景后按新地面位置调整
// x：障碍物在关卡里的位置（像素），瑞希从 x = 400 起跑，速度约 480 像素/秒
//
// 条目写法：
//   ['desk_row', x]                         全道障碍，三条跑道都挡住，必须跳过（也能站上去）
//   ['junk_wall_a', x, 跑道]                 单道高墙，跳不过去，只能换道
//   ['junk_wall_gap', x, 跑道]               能钻的杂物堆，站在这条道上会提示，按 Shift 冲刺钻过去
//   ['student_boy', x, 跑道, 速度]           走廊里的学生，跳不过去，只能换道躲开；速度为负表示迎面走来
//   ['student_wall', x, 障碍种类]            人墙：三条道都站着学生，x - 260 处自动放一个全道障碍（不写就是 desk_row），
//                                            踩上去再按空格借力跳，才能越过人墙
//   ['walker_office', x, 起点跑道, 终点跑道]  横穿马路的行人，跳不过去，按 Shift 冲刺抢过去
//   ['car_taxi', x, 跑道]                    单辆车，换道躲开
//   ['cars', x, [跑道, 跑道, ...]]            并排的车；车只能换道躲（撞上 -2，跳上车顶或跳过 -1），所以最多并排两辆，一定要留一条空道
//
// 位置小贴士（x 是障碍出现的位置，真正和瑞希相遇的地方会提前一些）：
//   迎面走来的学生（速度约 -120）大约在 x - 300 处相遇
//   车大约在 x - 620 处相遇，所以车的 x 要比想让它出现的位置多写 620
//   行人基本就在 x 处横穿

// 三种难度：units 是开局距离（失误机会）；fear 会给心理恐怖整体加减一点
window.DIFFICULTY = {
  easy: { name: '简单', units: 7, fear: -0.08, desc: '能多失误几次，障碍少、间隔宽，提示更多' },
  normal: { name: '普通', units: 5, fear: 0, desc: '标准的追逐' },
  hard: { name: '困难', units: 4, fear: 0.08, desc: '能失误的次数更少，障碍密集，连续组合更多' },
};
window.DIFFICULTY_ORDER = ['easy', 'normal', 'hard'];

window.LEVELS = [
  {
    key: 'kamiyama', name: '神山高校', sub: '补习结束后的走廊',
    map: 'kamiyama', speeds: [1, 1, 1], lanes: [830, 930, 1030], surface: 'tile',
    length: { easy: 8600, normal: 9900, hard: 10700 },
    items: {
      // 简单：一样一样地学——跳、换道，最后一个人墙教「踩上杂物再借力跳」
      easy: [
        ['desk_row', 1300],
        ['student_boy', 2400, 1, -100],
        ['cardboard_wall', 3300],
        ['student_girl', 4300, 0, -100], ['student_pair', 4300, 1, -90],
        ['student_wall', 5800, 'gym_mats'],
        ['student_boy', 6900, 2, -100], ['student_girl', 6900, 1, -100],
        ['cleaning_barrier', 7800],
      ],
      // 普通：先教跳和换道，中段两人一组堵路，中后段两道人墙
      normal: [
        ['desk_row', 1300],
        ['student_boy', 2200, 1, -130],
        ['student_girl', 2900, 0, -110], ['student_pair', 3100, 2, -100],
        ['cardboard_wall', 3900],
        ['student_boy', 4700, 1, -120], ['student_girl', 4800, 0, -120],
        ['student_wall', 5800, 'gym_mats'],
        ['student_pair', 6700, 2, -90], ['student_boy', 6800, 1, 80],
        ['cleaning_barrier', 7500],
        ['student_girl', 8100, 0, -140], ['student_boy', 8300, 2, -140],
        ['student_wall', 9200, 'desk_row'],
      ],
      // 困难：障碍更密，三道人墙，落地马上要换道
      hard: [
        ['desk_row', 1200],
        ['student_boy', 1900, 1, -150],
        ['student_girl', 2500, 0, -130], ['student_pair', 2650, 2, -130],
        ['student_wall', 3500, 'cardboard_wall'],
        ['student_boy', 4300, 1, -140], ['student_girl', 4450, 2, -140],
        ['gym_mats', 5000], ['cleaning_barrier', 5550],
        ['student_boy', 6200, 0, -90], ['student_pair', 6250, 2, -90],
        ['student_wall', 7100, 'desk_row'],
        ['student_pair', 7900, 1, -100], ['student_boy', 8050, 0, -140],
        ['cardboard_wall', 8600],
        ['student_wall', 9500, 'gym_mats'],
        ['cleaning_barrier', 10200],
      ],
    },
  },
  {
    key: 'shibuya', name: '涩谷十字路口', sub: '入夜的人潮', map: 'shibuya',
    speeds: [0.3, 0.7, 1], lanes: [810, 910, 1010], surface: 'asphalt',
    length: { easy: 9800, normal: 11200, hard: 12400 },
    items: {
      easy: [
        ['barrier_row', 1300],
        ['walker_office', 2200, 0, 2],
        ['car_taxi', 3720, 1],
        ['barrier_row', 4000],
        ['cars', 5520, [0, 1]],
        ['walker_student', 5800, 2, 0],
        ['cars', 7320, [0, 2]],
        ['barrier_row', 7600],
        ['car_compact', 9120, 2],
        ['walker_umbrella', 9100, 0, 2],
      ],
      // 普通：路障、行人、车轮流出现；中后段有两辆并排的车和「之」字形的车流
      normal: [
        ['barrier_row', 1300],
        ['walker_office', 2000, 0, 2],
        ['car_taxi', 3320, 1],
        ['walker_student', 3400, 2, 0],
        ['cars', 4720, [0, 1]],
        ['barrier_row', 4800],
        ['walker_umbrella', 5500, 0, 2], ['walker_office', 5700, 2, 0],
        ['cars', 7020, [0, 1]],
        ['car_compact', 7820, 1], ['car_kei', 8120, 0],
        ['walker_student', 8200, 0, 2],
        ['cars', 9520, [0, 1]],
        ['barrier_row', 9600],
        ['cars', 10820, [1, 2]],
        ['walker_umbrella', 10700, 2, 0],
      ],
      // 困难：两拨并排车连着来，空道一左一右，要连续换道；之字形车流更长
      hard: [
        ['barrier_row', 1200],
        ['walker_office', 1800, 0, 2], ['walker_student', 1950, 2, 0],
        ['cars', 3220, [0, 1]],
        ['car_van', 3720, 2],
        ['barrier_row', 3700],
        ['cars', 5020, [0, 2]],
        ['walker_umbrella', 5100, 0, 2],
        ['cars', 6420, [0, 1]], ['cars', 7220, [1, 2]],
        ['barrier_row', 7500],
        ['walker_office', 7800, 2, 0], ['walker_umbrella', 7950, 0, 2],
        ['car_compact', 9120, 1], ['car_kei', 9520, 0], ['car_taxi', 9920, 2],
        ['barrier_row', 10100],
        ['cars', 11320, [0, 1]],
        ['walker_student', 11300, 0, 2],
        ['barrier_row', 11900],
      ],
    },
  },
  {
    key: 'alley', name: '夜巷', sub: '没有尽头的小巷', map: 'alley',
    speeds: [0.3, 1, 1], lanes: [840, 940, 1040], surface: 'puddles',
    length: { easy: 10000, normal: 11400, hard: 12400 },
    items: {
      // 简单：第一次遇到木箱时旁边还留着一条空道，可以钻也可以绕
      easy: [
        ['trash_bag_pile', 1300],
        ['junk_wall_a', 2200, 0], ['junk_wall_b', 2200, 1],
        ['crate_row', 3100],
        ['crate_platform', 4000],
        ['junk_wall_a', 4900, 0], ['junk_wall_gap', 4900, 1],
        ['pallet_row', 5900],
        ['junk_wall_b', 6800, 1], ['junk_wall_a', 6800, 2],
        ['ac_platform', 7700],
        ['junk_wall_a', 8600, 0], ['junk_wall_gap', 8600, 1], ['junk_wall_b', 8600, 2],
        ['trash_bag_pile', 9400],
      ],
      normal: [
        ['trash_bag_pile', 1300],
        ['junk_wall_a', 2100, 0], ['junk_wall_b', 2100, 1],
        ['crate_row', 2800],
        ['crate_platform', 3500],
        ['junk_wall_a', 4200, 0], ['junk_wall_gap', 4200, 1], ['junk_wall_b', 4200, 2],
        ['pallet_row', 4900],
        ['ac_platform', 5500],
        ['junk_wall_b', 6200, 1], ['junk_wall_a', 6200, 2],
        ['trash_bag_pile', 6800],
        ['cabinet_platform', 7400],
        ['junk_wall_a', 8100, 0], ['junk_wall_b', 8100, 1], ['junk_wall_gap', 8100, 2],
        ['crate_row', 8800],
        ['junk_wall_b', 9500, 0], ['junk_wall_gap', 9500, 1], ['junk_wall_a', 9500, 2],
        ['pallet_row', 10200],
        ['crate_platform', 10800],
      ],
      // 困难：连续换道的高墙、钻出木箱马上要跳、踩平台借力连跳
      hard: [
        ['trash_bag_pile', 1200],
        ['junk_wall_a', 1800, 0], ['junk_wall_b', 1800, 1],
        ['junk_wall_b', 2500, 1], ['junk_wall_a', 2500, 2],
        ['crate_row', 3100],
        ['crate_platform', 3600], ['pallet_row', 4100],
        ['junk_wall_a', 4800, 0], ['junk_wall_gap', 4800, 1], ['junk_wall_b', 4800, 2],
        ['trash_bag_pile', 5450],
        ['ac_platform', 6050],
        ['junk_wall_a', 6700, 0], ['junk_wall_b', 6700, 1], ['junk_wall_gap', 6700, 2],
        ['crate_row', 7350], ['cabinet_platform', 7850],
        ['junk_wall_a', 8450, 1], ['junk_wall_b', 8450, 2],
        ['junk_wall_b', 9000, 0], ['junk_wall_gap', 9000, 1], ['junk_wall_a', 9000, 2],
        ['pallet_row', 9600],
        ['crate_platform', 10150], ['trash_bag_pile', 10600],
        ['junk_wall_b', 11200, 0], ['junk_wall_a', 11200, 1], ['junk_wall_gap', 11200, 2],
        ['crate_row', 11850],
      ],
    },
  },
];
