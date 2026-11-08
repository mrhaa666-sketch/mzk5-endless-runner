// 《荆棘之路 逃跑计划》剧情台词
// 改这里就能调整台词，不用动 game.js。
// bg：背景图（'black' 是纯黑；alt 是这张图还没放进来时先用的图）；who：说话的人（mizuki 瑞希 / mafuyu 真冬 / kanade 奏 / ena 绘名 / classmate 同学 / mirror 蒙着眼的「？？？」/ null 旁白）
// face：表情差分，比如 'worried' 会用 portrait_worried.png（没有这张图就用平常的）
// sfx：这句出现时播放的音效（可省略）
// style：'center' 正中大字 / 'whisper' 下方低语 / 'echo' 重复回响 / 'glitch' 抖动乱码（不写就是普通对话框）
// fx：'zoom' 背景慢慢推近 / 'shake' 晃动 / 'dim' 压暗；chat：Nightcord 聊天记录，一条一条出现
// auto：打完字后几秒自动跳下一句；speed：每秒打几个字（默认 28）；clear：这句不叠恐怖滤镜，只留暗角
// crop：[左, 上, 宽, 高]（按整张图的比例）只取图的一块放大做特写；soft：柔焦程度（像素）
// dream：梦一样的不真实感（过曝、柔焦、重影、漂浮的光点）；real：现实的冷色、褪色和信号灯的红光（音乐会压得很低）
// bgm：这句开始时换背景音乐（'stop' 是停掉）
// 聊天里 ghost: true 的消息是发不出去的（变淡，后面标「发送失败」）；bg 写 'white' 是一片白

window.STORY = {
  // 开场：补习结束，被蹲点的真冬撞见
  intro: [
    { bg: 'bg/classroom', who: null, text: '放学后，补习教室。' },
    { bg: 'bg/classroom', who: 'mizuki', text: '（总算熬到补习结束了……今天就悄悄溜回家吧。）' },
    { bg: 'bg/classroom', who: null, text: '走廊尽头，有人靠着窗边站着。' },
    { bg: 'bg/classroom', who: 'mafuyu', text: '……瑞希。' },
    { bg: 'bg/classroom', who: 'mizuki', text: '真、真冬？你怎么会在这里——' },
    { bg: 'bg/classroom', who: 'mafuyu', text: '等你很久了。' },
    { bg: 'bg/classroom', who: 'mizuki', text: '（在这里蹲我吗……不行，现在被抓到就完了！）' },
    { bg: 'bg/classroom', who: null, text: '——跑。' },
  ],
  // 第 2 关开始前
  shibuya: [
    { bg: 'card/shibuya', who: 'mizuki', text: '（冲出校门了……混进涩谷的人群里，应该能甩掉吧。）' },
    { bg: 'card/shibuya', who: 'mafuyu', text: '瑞希，别跑。' },
  ],
  // 第 3 关开始前
  alley: [
    { bg: 'card/alley', who: 'mizuki', text: '（拐进这条巷子……杂物这么多，总追不过来了吧。）' },
    { bg: 'card/alley', who: 'mafuyu', text: '……' },
  ],
  // 好结局：被抓住，拉去找绘名和奏
  good: [
    { bg: 'scene/good_caught', who: 'mafuyu', text: '……抓到了。' },
    { bg: 'scene/good_caught', who: 'mizuki', text: '哈哈……被抓到了呢。' },
    { bg: 'scene/good_caught', who: 'mafuyu', text: '走吧。绘名和奏还在等。' },
    { bg: 'scene/good_caught', who: 'mizuki', text: '诶？等、等一下，你要带我去哪——' },
    { bg: 'scene/good_caught', who: 'mafuyu', text: '……你跑掉的话，我会找不到你。' },
    { bg: 'scene/good_caught', who: 'mizuki', text: '（……真冬的手，好用力。）' },
    { bg: 'scene/good_caught', chat: [
      { n: 'えななん', t: '抓到了没？' },
      { n: '雪', t: '抓到了。现在过去。' },
      { n: 'K', t: '太好了。瑞希，曲子还差你那部分。' },
      { n: 'えななん', t: '真是的，下次再跑我就把你画进背景里当路人。' },
      { n: 'Amia', t: '……好啦好啦，我投降。' },
    ] },
    { bg: 'scene/good_caught_chibi', who: null, text: '就这样，瑞希被一路拉去见了绘名和奏。' },
    { bg: 'scene/good_caught_chibi', who: 'mizuki', text: '（被抓住了。……也没那么讨厌嘛。）' },
  ],
  // 坏结局：逃走了。意识流的心理恐怖——甩掉了所有人，才发现身边已经没有人了
  // 后半段的房间用的是瑞希蒙眼的卡面（scene/bad_blindfold），crop 是在这张图上取的特写
  bad: [
    { bg: 'scene/bad_escaped_01', who: null, text: '身后，没有脚步声了。' },
    { bg: 'scene/bad_escaped_01', who: 'mizuki', text: '……甩掉了？' },
    { bg: 'scene/bad_escaped_01', who: 'mizuki', text: '（太好了。今天也平安无事地逃掉了。）' },
    { bg: 'scene/bad_escaped_02', who: null, text: '路灯一盏接一盏地熄灭。', sfx: 'lightcut' },
    { bg: 'scene/bad_escaped_02', who: 'mizuki', text: '真冬……？' },
    { bg: 'scene/bad_escaped_02', style: 'whisper', text: '没有回答。', auto: 1.2 },
    { bg: 'scene/bad_escaped_02', fx: 'dim', chat: [
      { sys: true, t: '25:00' },
      { n: 'Amia', t: '大家在吗？' },
      { sys: true, t: '「K」已离线' },
      { sys: true, t: '「雪」已离线' },
      { sys: true, t: '「えななん」已离线' },
      { n: 'Amia', t: '……今天，有人来找过我吗？' },
    ] },
    { bg: 'scene/bad_escaped_02', fx: 'dim', who: 'mizuki', text: '（明明是我自己说的。"别来找我"。）' },
    { bg: 'black', style: 'echo', text: '别来找我。', speed: 10 },
    { bg: 'black', style: 'whisper', text: '——那就如你所愿。', auto: 1.4 },

    // 回过神来，站在一间放满人台的房间里
    { bg: 'black', style: 'center', text: '回过神来的时候，脚下已经不是巷子了。', speed: 18 },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', who: null, text: '一排一排的人台。每一个，都穿着我做的衣服。' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', crop: [0, 0.08, 0.5, 0.5], soft: 0.6, who: 'mizuki', text: '（这件是……第一次在 Nightcord 说话那天穿的。）' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', crop: [0, 0.08, 0.5, 0.5], soft: 0.6, style: 'echo', text: '很可爱哦。', speed: 12 },
    { bg: 'scene/bad_blindfold', clear: true, crop: [0, 0.08, 0.5, 0.5], soft: 0.6, who: null, text: '每一件都很可爱。每一个，都没有脸。' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', crop: [0.56, 0.22, 0.34, 0.34], soft: 0.8, who: null, text: '人台的肩上挂着小小的名牌。「K」。「雪」。「えななん」。' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'shake', crop: [0.56, 0.22, 0.34, 0.34], soft: 0.8, style: 'glitch', text: '大家，是什么时候变成这样的？', auto: 1.8 },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', crop: [0.6, 0.25, 0.25, 0.25], soft: 1, who: null, text: '角落里的镜子裂开了。镜子里照不出任何人。' },
    { bg: 'black', style: 'whisper', text: '……那我呢？', auto: 1.2 },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', crop: [0.36, 0.13, 0.28, 0.28], soft: 1, who: null, text: '伸手去摸自己的脸。指尖碰到的，是一条蕾丝。' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', crop: [0.36, 0.13, 0.28, 0.28], soft: 1, who: 'mizuki', text: '……原来，蒙着眼睛的是我。' },
    { bg: 'scene/bad_blindfold', clear: true, crop: [0.36, 0.13, 0.28, 0.28], soft: 1, who: 'mirror', text: '「只要看不见，就不会知道大家有没有在找我。」' },
    { bg: 'scene/bad_blindfold', clear: true, crop: [0.36, 0.13, 0.28, 0.28], soft: 1, who: 'mirror', text: '「也不会知道——自己是不是被讨厌了。」' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', crop: [0.3, 0.55, 0.45, 0.45], soft: 0.8, who: null, text: '手腕上垂着一根线。线的另一头，什么都没有连着。' },
    { bg: 'scene/bad_blindfold', clear: true, crop: [0.3, 0.55, 0.45, 0.45], soft: 0.8, who: 'mizuki', text: '真冬……刚才，是不是一直拉着这一头？' },
    { bg: 'black', style: 'whisper', text: '……', speed: 3, auto: 1 },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', who: null, text: '她把眼罩又系紧了一点。' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'shake', style: 'glitch', text: '这样就好。这样，谁都找不到我了。' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', style: 'center', text: '房间里，又多了一个人台。' },
    { bg: 'scene/bad_blindfold', clear: true, fx: 'zoom', crop: [0.36, 0.13, 0.28, 0.28], soft: 1.4, style: 'whisper', text: '它穿着黑白的裙子，眼睛蒙着。没有人会发现它少了什么。' },
    { bg: 'black', style: 'center', text: '25:00　Nightcord　在线：0' },
  ],

  // 误会结局（坏结局）：在神山高校撞到同学三次时触发。前半段是误会，真冬露出疑惑的那一刻，瑞希以为真冬也觉得自己奇怪
  rumor: [
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', who: null, text: '第三次撞上同学的时候，走廊里终于有人叫住了瑞希。', sfx: 'crowd' },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', who: 'classmate', text: '喂，晓山！你今天都撞了我们三次了吧！' },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', who: 'mizuki', face: 'panic', text: '抱、抱歉抱歉！我在赶时间——' },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', who: 'classmate', text: '……话说，后面一直追着你跑的那个，是朝比奈同学吧？' },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', who: 'classmate', text: '朝比奈同学她……难道「也」是男的？' },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', style: 'center', text: '走廊里安静了一秒。', auto: 1.2 },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', who: 'mafuyu', face: 'puzzled', text: '……「也」？' },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', who: 'mafuyu', face: 'puzzled', text: '瑞希，「也」是什么意思？' },
    // 音乐在这里断掉
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', fx: 'dim', bgm: 'stop', who: 'mizuki', text: '（……真冬也露出了那种表情。）' },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', fx: 'dim', who: 'mizuki', text: '（和大家一样的、看着「奇怪的东西」的表情。）' },
    { bg: 'scene/rumor_hallway', alt: 'card/kamiyama', fx: 'dim', who: 'mizuki', text: '……对不起，真冬。' },
  ],
  // 瑞希冲出走廊之后（中间是一段瑞希跑出画面、真冬伸手没抓住的动画）
  rumor2: [
    { bg: 'scene/rumor_alone', alt: 'card/kamiyama', bgm: 'rumorSad', who: null, text: '瑞希跑得比任何时候都快。走廊、楼梯、校门，一次也没有回头。' },
    { bg: 'scene/rumor_alone', alt: 'card/kamiyama', who: 'mafuyu', face: 'puzzled', text: '……瑞希，等一下。' },
    { bg: 'scene/rumor_alone', alt: 'card/kamiyama', who: 'mafuyu', text: '（我只是……想知道「也」是什么意思而已。）' },
    { bg: 'scene/rumor_alone', alt: 'card/kamiyama', who: null, text: '伸出去的那只手，第一次什么都没有抓住。' },
    { bg: 'scene/rumor_alone', alt: 'card/kamiyama', fx: 'dim', chat: [
      { sys: true, t: '25:00' },
      { n: '雪', t: 'Amia，今天的事……' },
      { n: '雪', t: '我没有觉得奇怪。' },
      { sys: true, t: '「Amia」已离线' },
      { n: '雪', t: '……' },
    ] },
    { bg: 'black', style: 'center', text: '从那天起，真冬再也没有追上过瑞希。', speed: 14 },
  ],

  // 隐藏结局：最后一下是被车撞上的时候触发
  crash: [
    { bg: 'white', style: 'center', text: '……', speed: 4, auto: 0.6 },
    { bg: 'white', style: 'whisper', text: '耳朵里只剩下很长、很长的一声。', auto: 1.2 },

    // 幻想：一切都好好的
    { bg: 'bg/classroom', dream: true, who: null, text: '睁开眼睛的时候，是熟悉的补习教室。' },
    { bg: 'bg/classroom', dream: true, who: 'mizuki', text: '（……咦？刚才，我不是在十字路口吗？）' },
    { bg: 'bg/classroom', dream: true, who: 'mafuyu', text: '瑞希，你回来了。' },
    { bg: 'bg/classroom', dream: true, who: 'mizuki', text: '啊哈哈……抱歉抱歉，今天就不跑了。' },
    { bg: 'bg/classroom', dream: true, who: 'mafuyu', text: '嗯。走吧，大家在等。' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: null, text: '推开门，是那个熟悉的、什么都没有的世界。' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'kanade', text: '瑞希，你来了。新曲的 MV，拜托你了。' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'ena', text: '分镜我看过了哦。……还挺好看的嘛。' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'mafuyu', text: '……大家都在。' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'mizuki', text: '嗯！今天也要做到天亮吧？' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'mizuki', text: '（好安心。大家都在，真冬也没有生气。）' },

    // 不对劲：大家看着瑞希站的地方，却像什么都没看见
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'kanade', face: 'worried', text: '……瑞希？' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'ena', face: 'worried', text: '喂，Amia。听得到吗？' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'mizuki', text: '我在啊，就在你们面前——' },
    { bg: 'scene/crash_empty_sekai', dream: true, who: 'mafuyu', text: '瑞希。' },
    { bg: 'scene/crash_empty_sekai', dream: true, chat: [
      { n: 'K', t: 'Amia，听得到吗？' },
      { n: 'えななん', t: '……Amia？' },
      { n: 'Amia', t: '我在啊，我一直都在回你们——', ghost: true },
      { n: '雪', t: '瑞希。' },
      { n: 'Amia', t: '真冬？我在这里啊。', ghost: true },
    ] },
    { bg: 'scene/crash_empty_sekai', dream: true, fx: 'shake', style: 'glitch', text: '为什么，大家都听不见？', auto: 1.6 },

    // 现实：只闪回一下
    { bg: 'scene/crash_crossing', real: true, style: 'center', text: '十字路口的信号灯，还在一明一灭。', speed: 16, sfx: 'siren' },
    { bg: 'scene/crash_crossing', real: true, style: 'center', text: '人群围成了一圈。有人在喊救护车。' },
    { bg: 'scene/crash_crossing', real: true, style: 'center', text: '斑马线上，落着一个蝴蝶结。' },
    { bg: 'scene/crash_crossing', real: true, style: 'center', text: '有一只手还伸在半空。差一点，就能拉住。' },
    { bg: 'black', style: 'echo', text: '瑞希。', speed: 6 },

    // 又回到梦里
    { bg: 'scene/crash_empty_sekai', dream: true, chat: [
      { n: 'K', t: '……还是联系不上。' },
      { n: 'えななん', t: '电话一直没有人接。' },
      { n: '雪', t: '我明明，拉住了的。' },
      { n: 'Amia', t: '别担心啦，我马上就上线。', ghost: true },
      { sys: true, t: '「Amia」最后上线时间：17:42' },
    ] },
    { bg: 'scene/crash_empty_sekai_glow', dream: true, who: 'mizuki', text: '（明天的 25 时，也要一起做曲子哦。）' },
    { bg: 'scene/crash_empty_sekai_glow', dream: true, style: 'whisper', text: '……大家，等等我。', auto: 1.6 },
    { bg: 'white', style: 'center', text: '25:00　Nightcord　「Amia」已离线', speed: 12 },
  ],
};
