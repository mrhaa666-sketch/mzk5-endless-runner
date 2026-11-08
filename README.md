# 荆棘之路 逃跑计划

《世界计划 彩色舞台 feat. 初音未来》同人横版跑酷游戏，与官方无关。

补习结束后，瑞希想悄悄溜回家，却被早就等在走廊里的真冬撞见。从神山高校跑到涩谷，再拐进夜巷。跑得越久，周围越不对劲。

- 三张地图，三种难度，每局布局随机变化，但一定能过
- 剧情台词全程日语配音，字幕为中文
- 心理恐怖氛围会随追逐逐渐加重
- 多个结局，有的需要自己摸索

## 怎么玩

下载或克隆本仓库，双击 `index.html`，用 Chrome 或 Edge 打开即可。`assets` 文件夹要和 `index.html` 放在一起。

| 按键 | 作用 |
| --- | --- |
| 空格 | 跳（按住跳得更高，可以踩着杂物借力） |
| W / S | 换道 |
| Shift | 冲刺 / 钻过杂物堆 |
| Esc | 暂停 |
| M | 静音 |

手机和平板上打开会自动换成触屏按钮：右手「跳」「冲刺」，左手 ▲ ▼ 换道。

更详细的规则、关卡和修改方法见 [玩法说明.md](玩法说明.md)。

## 文件

| 文件 | 内容 |
| --- | --- |
| `index.html` | 入口 |
| `game.js` | 主循环、操作手感、角色和镜头 |
| `levels.js` | 三关的障碍布局和难度 |
| `story.js` | 剧情台词 |
| `horror.js` | 恐怖效果 |
| `touch.js` | 触屏操作（只在触屏设备上启用） |
| `assets/` | 图片、背景音乐、音效和配音 |
| `tests/regression.cjs` | Playwright 回归测试 |

## 致谢

- 角色与世界观来自《世界计划 彩色舞台 feat. 初音未来》（SEGA / Colorful Palette / Crypton Future Media），本作为非商业同人作品。
- 结局音乐：Kevin MacLeod「Carefree」「Darkest Child」（incompetech.com），以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权使用。
