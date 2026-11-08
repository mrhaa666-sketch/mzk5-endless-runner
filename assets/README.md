# 《荆棘之路 逃跑计划》素材包

二次创作，与《世界计划》官方无关。

| 目录 | 内容 |
| --- | --- |
| characters | 瑞希与真冬的透明 PNG 头像和 11 组动作。单帧 256×256，每组附横排 strip.png。 |
| maps | 神山高校、涩谷十字路口、夜巷的 3840×1080 长图与三个视差层，另附教室和校门开场图。 |
| obstacles | 三条跑道版障碍物：全道障碍、单道高墙、走廊学生、横穿马路的行人和车辆，规格与出处见 obstacles/来源清单.md。 |
| ui | 距离条、危险暗角、WASD 键帽、暂停面板和关卡切换图。 |
| scenes | 标题图、两张好结局和三张坏结局，1920×1080。 |
| audio | 6 首原创合成 BGM、12 条合成音效，44.1 kHz、16-bit PCM WAV。 |
| animations.json | 帧数、建议播放速度、循环标记和脚底锚点。 |

## 导入

- 暂停菜单的三个按钮共用 pause_button.png。

- 单帧从 00.png 开始播放。strip.png 从左到右切成 256×256。脚底锚点为 (128, 232)，空中姿势以此为定位基准。部分过渡帧由关键姿势的轻微旋转和位移补间。瑞希各帧已按奔跑帧统一头身比例，切换动作时角色不会忽大忽小。
- 地图按 far.png、mid.png、near.png 从后到前叠放。同一位置叠合等于 composite.png。神山高校地板从 y=760 开始，三条跑道的脚底线为 y=830、930、1030。涩谷和夜巷的基准地线可放在 y=751、864 附近。建议滚动速度：

  | 地图 | far | mid | near |
  | --- | --- | --- | --- |
  | 神山高校（室内走廊） | 1.0 | 1.0 | 1.0 |
  | 涩谷十字路口 | 0.3 | 0.7 | 1.0 |
  | 夜巷 | 0.3 | 1.0 | 1.0 |

  神山高校的墙、天花板和地面相连，三层同速最稳，也可以直接用 composite.png。夜巷的电线杆整根在 near 层，中景房屋和杆子同速才不会错位。涩谷和夜巷的 far 层被遮挡处已补成天空，视差错开时不会露出色块。
- good_caught.png 对应瑞希被真冬抓住，good_caught_chibi.png 是同一结局的 Q 版收尾图，可接在其后。bad_escaped_01.png 至 03.png 对应瑞希逃到底，按编号淡入。
- BGM 01–04 和脚步音效 01–03 可整段循环。三关 BGM 为 160、170、150 BPM。好结局与坏结局的音乐单次播放。

## 来源

- 角色图以用户提供的 PNG 为参考，用内置图像工具重绘表情、侧身和动作。瑞希紧张、窘迫，真冬面无表情。
- 校园走廊、涩谷夜间十字路口和夜巷以游戏原图为参考重构为横版。教室和校门来自游戏原图。以下是 Sekai Viewer 游戏数据镜像。
  - [神山高校普通走廊傍晚 bg_a000502](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a000502/bg_a000502.png)
  - [神山高校教室傍晚](https://sekai.best/asset_viewer/scenario/background/bg_a000302)
  - [神山高校文化祭校门](https://sekai.best/asset_viewer/scenario/background/bg_a000105)
  - [涩谷十字路口夜景](https://sekai.best/asset_viewer/scenario/background/bg_a002303)
  - [夜间住宅街巷](https://sekai.best/asset_viewer/scenario/background/bg_a001303)
- 标题取活动「荊棘の道は何処へ」无 Logo 底图裁切，再加项目标题。 [游戏活动画面文件](https://storage.sekai.best/sekai-jp-assets/event/event_thorns_2024/screen/bg.png)
- 障碍物和两条结局的插画使用内置图像工具生成，坏结局三张在同一张插画上做递进后期。UI 为重新绘制的界面组件。全部音频由合成音色制作。
- good_caught_chibi.png 以用户提供的 Q 版插画为底，去掉左下角被裁切的路人，两侧沿放射集中线延伸到 16:9，人物未改动。

## 最终版修订

- 真冬制服以游戏卡面和 Q 版制服部件为参考重新编辑，保留灰色水手服、白领、红领巾、敞开的深色开衫、灰色百褶裙和黑色裤袜。 动作帧以原来的姿势为底重做制服，并对齐原头像和脚底位置。 [官方卡面](https://storage.sekai.best/sekai-jp-assets/character/member_cutout/res018_no001/normal.png) · [官方 Q 版图集](https://storage.sekai.best/sekai-jp-assets/area_sd/v2_sd_main/v2_sd_18mafuyu_school/sekai_atlas.png)
- 瑞希滑铲为修订后的四帧。涩谷与夜巷的地图和视差层修补限制在左侧 150 列。
- 神山高校普通走廊以 bg_a000502 为底稿，使用内置图像工具重构成侧向长图，并补画窗外景色。远景是不透明的天花板与窗外天空、树影，中景是开有窗洞的墙面，近景是从 y=760 开始的地板。神山高校关卡卡片由这张长图裁切而来。
- 恐惧表情差分：mizuki/run_fear1（惊慌）、run_fear2（崩溃），mafuyu/jog_fear1、jog_fear2（脸上的阴影逐渐加深）。动作、画布和脚底位置与原奔跑帧完全一致，游戏在恐惧值升高时自动切换。


---

# 《荆棘之路 逃跑计划》美术修改清单

本次以所附游戏 ZIP 为底稿。包名、顶层目录与原文件路径均保留。主界面背景、HTML、关卡数据、音频和测试文件按字节保留。显示代码调整了距离条头像裁剪，以及全道障碍的逐道放置和遮挡顺序。跳跃、碰撞和关卡数值沿用原版。完整游戏包包含配套的显示代码。

原包记录的官方素材由第三方资料站镜像提供。查找时核对了剧情背景、区域对话图集和 MYSEKAI 道具的原包链接，直链返回 HTTP 403，其他镜像也未取回原图。本次可复用的官方来源沿用包内衍生底稿，链接保留为上游出处记录。新增绘制和生成部分另列。

## 障碍物

11 种全道障碍重新绘制为独立直立的道具或紧凑组合。每种以 y≈702 为接地锚点，游戏按三条跑道的脚线分别摆放，逐道绘制轮子、桌腿、箱底及接触阴影。单道高墙沿用既有轮廓，底边对齐 y≈702。两类图的画布尺寸都是 512×768。

| 素材路径（相对于 assets） | 上游来源 | 本轮处理 |
| --- | --- | --- |
| `obstacles/kamiyama/cardboard_wall.png` | 官方修改（源包旧图），沿用源包。用教室储物区的纸箱改为两层错位的箱墙。 [神山高校教室储物区](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a000306/bg_a000306.png) | 按源包道具参考重新生成直立外形，前面高度约 138 px，按关卡调色并补接触阴影。 |
| `obstacles/kamiyama/cleaning_barrier.png` | 官方修改（源包旧图），沿用源包。沿用游戏里的蓝色提手桶造型，补画推车和拖把，把两端连成一列。 [MYSEKAI 水桶](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0005_fixture_bucket1_1.png) | 按源包道具参考重新生成直立外形，前面高度约 140 px，按关卡调色并补接触阴影。 |
| `obstacles/kamiyama/desk_row.png` | 官方修改（源包旧图），沿用源包。把教室里的木桌面和金属腿桌椅调整到约 35° 斜俯视，补齐遮挡，沿画面纵深连续排列。 [神山高校教室](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a000302/bg_a000302.png) | 按源包道具参考重新生成直立外形，前面高度约 136 px，按关卡调色并补接触阴影。 |
| `obstacles/kamiyama/gym_mats.png` | 官方修改（源包旧图），沿用源包。用游戏里的垫子改成卷起的厚体育垫，补画跳箱。 [MYSEKAI 垫子](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0012_fixture_mat1_1.png) | 按源包道具参考重新生成直立外形，前面高度约 131 px，按关卡调色并补接触阴影。 |
| `obstacles/kamiyama/student_boy/**/*.png` | 官方修改，沿用源包。用通用学生校服和头身部件改成边走边看手机。 [区域对话通用学生 038](https://storage.sekai.best/sekai-jp-assets/area_sd/sd_mob/sd_mob038/sekai_atlas.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/kamiyama/student_girl/**/*.png` | 官方修改，沿用源包。用通用女学生校服和头身部件改成抱书走路。 [区域对话通用学生 011](https://storage.sekai.best/sekai-jp-assets/area_sd/sd_mob/sd_mob011/sekai_atlas.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/kamiyama/student_pair/**/*.png` | 官方修改，沿用源包。用两套通用学生部件做一前一后走路的组合。 [通用学生 040](https://storage.sekai.best/sekai-jp-assets/area_sd/sd_mob/sd_mob040/sekai_atlas.png) · [通用学生 013](https://storage.sekai.best/sekai-jp-assets/area_sd/sd_mob/sd_mob013/sekai_atlas.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/shibuya/barrier_row.png` | 自行生成（源包旧图），沿用源包。在核对的官方素材里未找到可用的施工路障组合。使用涩谷夜景作配色和光线参考。 [涩谷夜景](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a002303/bg_a002303.png) | 按源包道具参考重新生成直立外形，前面高度约 120 px，按关卡调色并补接触阴影。 |
| `obstacles/shibuya/car_compact/**/*.png` | 官方修改，沿用源包。以游戏内模型车为底，重做圆润的两厢车外形。 [MYSEKAI 模型车](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0007_fixture_minicar1_1.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/shibuya/car_kei/**/*.png` | 官方修改，沿用源包。以方头遥控车为底，重做车身并补齐车轮。 [MYSEKAI 遥控车](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0008_fixture_rccar1_1.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/shibuya/car_taxi/**/*.png` | 官方修改，沿用源包。以车库车为底，重做封闭车顶、车门和无字车顶灯。 [MYSEKAI 车库车](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0013_fixture_car1_1.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/shibuya/car_van/**/*.png` | 官方修改，沿用源包。以游戏内餐车为底，改成压低车顶的面包车。 [MYSEKAI 餐车](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_con0003_fixture_kitchencar1_1.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/shibuya/walker_office/**/*.png` | 官方修改，沿用源包。以通用路人头身部件重组正背视图，改成深色西装和公文包。 [区域对话路人 049](https://storage.sekai.best/sekai-jp-assets/area_sd/sd_mob/sd_mob049/sekai_atlas.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/shibuya/walker_student/**/*.png` | 官方修改，沿用源包。保留通用学生造型，加双肩包并重做正背步态。 [区域对话学生 032](https://storage.sekai.best/sekai-jp-assets/area_sd/sd_mob/sd_mob032/sekai_atlas.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/shibuya/walker_umbrella/**/*.png` | 官方修改，沿用源包。以通用路人造型改成蓝绿色外套和长柄伞。 [区域对话路人 021](https://storage.sekai.best/sekai-jp-assets/area_sd/sd_mob/sd_mob021/sekai_atlas.png) | 逐帧按关卡调色，使用调色后的原帧重排 strip。 |
| `obstacles/alley/ac_platform.png` | 官方修改（源包旧图），沿用源包。以游戏里的换气扇为风扇底稿，补画室外机箱体并排成平顶。 [MYSEKAI 换气扇](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0013_fixture_fan1_1.png) | 按源包道具参考重新生成直立外形，前面高度约 184 px，按关卡调色并补接触阴影。 |
| `obstacles/alley/cabinet_platform.png` | 官方修改（源包旧图），沿用源包。将活动室的储物柜改为横放相接的平顶柜组。 [剧情活动室储物柜](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a004001/bg_a004001.png) | 按源包道具参考重新生成直立外形，前面高度约 180 px，按关卡调色并补接触阴影。 |
| `obstacles/alley/crate_platform.png` | 官方修改（源包旧图），沿用源包。将集市木箱与周转箱堆成可落脚的平顶平台。 [MYSEKAI 集市箱组](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0030_fixture_woodbox1_1.png) | 按源包道具参考重新生成直立外形，前面高度约 185 px，按关卡调色并补接触阴影。 |
| `obstacles/alley/crate_row.png` | 官方修改（源包旧图），沿用源包。以两类游戏箱体为底，改成相接的蓝绿塑料周转箱。 [MYSEKAI 储物箱](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_env0004_fixture_box1_1.png) · [MYSEKAI 集市箱组](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0030_fixture_woodbox1_1.png) | 按源包道具参考重新生成直立外形，前面高度约 121 px，按关卡调色并补接触阴影。 |
| `obstacles/alley/junk_wall_a.png` | 官方修改，沿用源包。将纸箱、自行车改成竖向堆叠组合，补画旧椅。 [神山高校储物区](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a000306/bg_a000306.png) · [MYSEKAI 车库自行车](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0013_fixture_bicycle1_1.png) | 校正底边、加夜巷侧光与接触阴影。 |
| `obstacles/alley/junk_wall_b.png` | 官方修改，沿用源包。用柜子和架子堆高，补画垃圾袋。 [剧情活动室储物柜](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a004001/bg_a004001.png) · [MYSEKAI 车库货架](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0013_fixture_shelf1_1.png) | 校正底边、加夜巷侧光与接触阴影。 |
| `obstacles/alley/junk_wall_gap.png` | 官方修改，沿用源包。用同系列储物柜与货架做成高墙，底部开一个高约110像素、左右贯穿的门洞，冲刺可以钻过去。 [剧情活动室储物柜](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a004001/bg_a004001.png) · [MYSEKAI 车库货架](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0013_fixture_shelf1_1.png) | 校正底边、加夜巷侧光与接触阴影。保留底部可钻通道。 |
| `obstacles/alley/pallet_row.png` | 官方修改（源包旧图），沿用源包。将集市木箱的木条结构改成斜靠并排的托盘。 [MYSEKAI 集市木箱](https://storage.sekai.best/sekai-jp-assets/mysekai/thumbnail/fixture/mdl_ext0030_fixture_woodbox1_1.png) | 按源包道具参考重新生成直立外形，前面高度约 124 px，按关卡调色并补接触阴影。 |
| `obstacles/alley/trash_bag_pile.png` | 自行生成（源包旧图），沿用源包。在核对的官方素材里未找到可用的袋装垃圾堆。使用夜巷背景作配色和光线参考。 [夜巷](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a001303/bg_a001303.png) | 按源包道具参考重新生成直立外形，前面高度约 118 px，按关卡调色并补接触阴影。 |

学生和行人逐帧保留源图脚底 y=240。车辆保留实测源图接地 y=496，现有代码本来把车轮绘制到跑道脚线下 18 px。提示中的 y≈478 与源图及现有绘制偏移冲突，这里以保持现有锚点为准。

## 背景、标题、剧情头像与 UI

| 素材路径（相对于 assets） | 来源及本轮处理 |
| --- | --- |
| `maps/kamiyama/near.png`、`composite.png` | 官方衍生底稿，沿原透视加 y=880/980 的低对比砖缝，重合成全图。[神山走廊 bg_a000502](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a000502/bg_a000502.png) |
| `maps/shibuya/far.png`、`mid.png`、`near.png`、`composite.png`、`ui/level_cards/shibuya.png` | 参考源包构图重新生成手绘夜景，再拆分天空、楼体和路面。弧形无字霓虹屏、十字路口和湿路反光，分道位于 y=860/960 附近。关卡卡片取同一张新版合成图。[涩谷十字路口 bg_a002303](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a002303/bg_a002303.png) |
| `maps/alley/far.png`、`mid.png`、`near.png`、`composite.png` | 官方衍生底稿，将路缘移到 y≈813，让后排 y=840 同样落在路面上。修接缝，重合成全图。[夜巷 bg_a001303](https://storage.sekai.best/sekai-jp-assets/scenario/background/bg_a001303/bg_a001303.png) |
| `scenes/title.png` | 源包主界面图，已抹掉原画面内的旧标题字；新标题「荆棘之路 逃跑计划」由代码用 `ui/title_logo.png` 和文字叠加。[活动「荊棘の道は何処へ」游戏文件](https://storage.sekai.best/sekai-jp-assets/event/event_thorns_2024/screen/bg.png) |
| `characters/mizuki/portrait.png` | 按源包内用户参考衍生的瑞希 Q 版头像高分辨率重绘，沿用原胸像位置，660×660。 |
| `characters/mafuyu/portrait.png` | 按源包内真冬 Q 版头像高分辨率重绘，沿用原胸像位置，660×660。[源包所列真冬制服图集](https://storage.sekai.best/sekai-jp-assets/area_sd/v2_sd_main/v2_sd_18mafuyu_school/sekai_atlas.png) |
| `ui/distance_bar.png` | 按原图尺寸与头像位置重绘。灰紫底、暗玫红荆棘、保留中央距离格的显示区域。 |
| `ui/pause_panel.png`、`ui/pause_button.png` | 按原图尺寸自行绘制灰紫面板、细荆棘边框。 |

## 新增文件与接入状态

| 素材路径（相对于 assets） | 来源、规格与效果 |
| --- | --- |
| `maps/kamiyama/{far,mid,near,composite}_dark.png` | 以同关底图为基础。暗红窗景、部分灯管熄灭、储物柜门半开。 |
| `maps/shibuya/{far,mid,near,composite}_dark.png` | 以新版涩谷底图为基础。屏幕失去信号或显示紫眼，斑马线上投出过长的影子。 |
| `maps/alley/{far,mid,near,composite}_dark.png` | 以同关底图为基础。逐扇压灭窗光，保留单扇暖窗，墙面与路面出现人影。 |
| `ui/title_logo.png` | 自制。760×220 透明 PNG，楷书灰白题字与暗紫荆棘。作为独立素材交付，主界面保留原图。 |
| `ui/distance_bar_dark.png` | 自制。1000×112，与正常版对齐，加密荆棘并压暗底色。 |
| `characters/mafuyu/portrait_cold.png` | 从重绘胸像制作 660×660 差分。虹膜去掉高光，嘴线保持平直。 |
| `characters/mafuyu/portrait_smile.png` | 从同一胸像制作 660×660 差分。嘴角微抬，眼睛沿用原版。 |
| `lighting/kamiyama.png`、`lighting/shibuya.png`、`lighting/alley.png` | 用源包瑞希奔跑与真冬追跑帧制作三张原色与调色对比图。每关各一张。 |

恐怖背景均为 3840×1080，保留与日常版对应的分层和构图。接入时可在同一滚动位置逐层叠加对应的 `*_dark.png`，由恐惧值控制不透明度。`composite_dark.png` 供整图预览。夜巷后段图呈现熄灯后的状态，逐扇熄灭的时间过程需由代码实现。

游戏已装入日常场景、障碍、剧情头像和暂停界面。恐怖后段贴图、距离条差分、真冬新表情和角色分关叠色供后续接入。左下角 Shift 状态提示由现有代码直接绘制。距离条圆形头像已按图宽换算裁剪范围，恢复正常显示。

## 角色调色参数

| 关卡 | 阴影叠色 | 环境叠色 | 轮廓光 |
| --- | --- | --- | --- |
| 神山高校 | `#6D4E84` 22% | `#FFC18D` 16% | `#FFE0AF` 49%，左侧暖橙侧逆光 |
| 涩谷十字路口 | `#43397E` 28% | `#788DEB` 23% | `#F497DC` 45%，右侧洋红霓虹 |
| 夜巷 | `#262C55` 42% | `#566394` 18% | `#F7CA8D` 43%，左侧路灯暖黄 |

参数为最大混合量。以归一化亮度 L 为基准，阴影遮罩用 (1−L)^0.85，环境光遮罩用 0.25+0.75×L。涩谷把环境混合量从角色顶部 100% 平滑降至底部 57%。夜巷在环境混色之后将 RGB 乘以 0.88。轮廓光取朝光源一侧约 2 px 的内缘，强度随原图亮度递增，保留原透明度。

## 按文件核对

同名替换 134 张图，新增 19 张图。下表以实际打包内容为准。

| 路径（相对于 assets） | 状态 |
| --- | --- |
| `characters/mafuyu/portrait.png` | 替换 |
| `characters/mafuyu/portrait_cold.png` | 新增 |
| `characters/mafuyu/portrait_smile.png` | 新增 |
| `characters/mizuki/portrait.png` | 替换 |
| `lighting/alley.png` | 新增 |
| `lighting/kamiyama.png` | 新增 |
| `lighting/shibuya.png` | 新增 |
| `maps/alley/composite.png` | 替换 |
| `maps/alley/composite_dark.png` | 新增 |
| `maps/alley/far.png` | 替换 |
| `maps/alley/far_dark.png` | 新增 |
| `maps/alley/mid.png` | 替换 |
| `maps/alley/mid_dark.png` | 新增 |
| `maps/alley/near.png` | 替换 |
| `maps/alley/near_dark.png` | 新增 |
| `maps/kamiyama/composite.png` | 替换 |
| `maps/kamiyama/composite_dark.png` | 新增 |
| `maps/kamiyama/far_dark.png` | 新增 |
| `maps/kamiyama/mid_dark.png` | 新增 |
| `maps/kamiyama/near.png` | 替换 |
| `maps/kamiyama/near_dark.png` | 新增 |
| `maps/shibuya/composite.png` | 替换 |
| `maps/shibuya/composite_dark.png` | 新增 |
| `maps/shibuya/far.png` | 替换 |
| `maps/shibuya/far_dark.png` | 新增 |
| `maps/shibuya/mid.png` | 替换 |
| `maps/shibuya/mid_dark.png` | 新增 |
| `maps/shibuya/near.png` | 替换 |
| `maps/shibuya/near_dark.png` | 新增 |
| `obstacles/alley/ac_platform.png` | 替换 |
| `obstacles/alley/cabinet_platform.png` | 替换 |
| `obstacles/alley/crate_platform.png` | 替换 |
| `obstacles/alley/crate_row.png` | 替换 |
| `obstacles/alley/junk_wall_a.png` | 替换 |
| `obstacles/alley/junk_wall_b.png` | 替换 |
| `obstacles/alley/junk_wall_gap.png` | 替换 |
| `obstacles/alley/pallet_row.png` | 替换 |
| `obstacles/alley/trash_bag_pile.png` | 替换 |
| `obstacles/kamiyama/cardboard_wall.png` | 替换 |
| `obstacles/kamiyama/cleaning_barrier.png` | 替换 |
| `obstacles/kamiyama/desk_row.png` | 替换 |
| `obstacles/kamiyama/gym_mats.png` | 替换 |
| `obstacles/kamiyama/student_boy/left/00.png` | 替换 |
| `obstacles/kamiyama/student_boy/left/01.png` | 替换 |
| `obstacles/kamiyama/student_boy/left/02.png` | 替换 |
| `obstacles/kamiyama/student_boy/left/03.png` | 替换 |
| `obstacles/kamiyama/student_boy/left/04.png` | 替换 |
| `obstacles/kamiyama/student_boy/left/05.png` | 替换 |
| `obstacles/kamiyama/student_boy/left/strip.png` | 替换 |
| `obstacles/kamiyama/student_boy/right/00.png` | 替换 |
| `obstacles/kamiyama/student_boy/right/01.png` | 替换 |
| `obstacles/kamiyama/student_boy/right/02.png` | 替换 |
| `obstacles/kamiyama/student_boy/right/03.png` | 替换 |
| `obstacles/kamiyama/student_boy/right/04.png` | 替换 |
| `obstacles/kamiyama/student_boy/right/05.png` | 替换 |
| `obstacles/kamiyama/student_boy/right/strip.png` | 替换 |
| `obstacles/kamiyama/student_girl/left/00.png` | 替换 |
| `obstacles/kamiyama/student_girl/left/01.png` | 替换 |
| `obstacles/kamiyama/student_girl/left/02.png` | 替换 |
| `obstacles/kamiyama/student_girl/left/03.png` | 替换 |
| `obstacles/kamiyama/student_girl/left/04.png` | 替换 |
| `obstacles/kamiyama/student_girl/left/05.png` | 替换 |
| `obstacles/kamiyama/student_girl/left/strip.png` | 替换 |
| `obstacles/kamiyama/student_girl/right/00.png` | 替换 |
| `obstacles/kamiyama/student_girl/right/01.png` | 替换 |
| `obstacles/kamiyama/student_girl/right/02.png` | 替换 |
| `obstacles/kamiyama/student_girl/right/03.png` | 替换 |
| `obstacles/kamiyama/student_girl/right/04.png` | 替换 |
| `obstacles/kamiyama/student_girl/right/05.png` | 替换 |
| `obstacles/kamiyama/student_girl/right/strip.png` | 替换 |
| `obstacles/kamiyama/student_pair/left/00.png` | 替换 |
| `obstacles/kamiyama/student_pair/left/01.png` | 替换 |
| `obstacles/kamiyama/student_pair/left/02.png` | 替换 |
| `obstacles/kamiyama/student_pair/left/03.png` | 替换 |
| `obstacles/kamiyama/student_pair/left/04.png` | 替换 |
| `obstacles/kamiyama/student_pair/left/05.png` | 替换 |
| `obstacles/kamiyama/student_pair/left/strip.png` | 替换 |
| `obstacles/kamiyama/student_pair/right/00.png` | 替换 |
| `obstacles/kamiyama/student_pair/right/01.png` | 替换 |
| `obstacles/kamiyama/student_pair/right/02.png` | 替换 |
| `obstacles/kamiyama/student_pair/right/03.png` | 替换 |
| `obstacles/kamiyama/student_pair/right/04.png` | 替换 |
| `obstacles/kamiyama/student_pair/right/05.png` | 替换 |
| `obstacles/kamiyama/student_pair/right/strip.png` | 替换 |
| `obstacles/shibuya/barrier_row.png` | 替换 |
| `obstacles/shibuya/car_compact/00.png` | 替换 |
| `obstacles/shibuya/car_compact/01.png` | 替换 |
| `obstacles/shibuya/car_compact/02.png` | 替换 |
| `obstacles/shibuya/car_compact/03.png` | 替换 |
| `obstacles/shibuya/car_compact/strip.png` | 替换 |
| `obstacles/shibuya/car_kei/00.png` | 替换 |
| `obstacles/shibuya/car_kei/01.png` | 替换 |
| `obstacles/shibuya/car_kei/02.png` | 替换 |
| `obstacles/shibuya/car_kei/03.png` | 替换 |
| `obstacles/shibuya/car_kei/strip.png` | 替换 |
| `obstacles/shibuya/car_taxi/00.png` | 替换 |
| `obstacles/shibuya/car_taxi/01.png` | 替换 |
| `obstacles/shibuya/car_taxi/02.png` | 替换 |
| `obstacles/shibuya/car_taxi/03.png` | 替换 |
| `obstacles/shibuya/car_taxi/strip.png` | 替换 |
| `obstacles/shibuya/car_van/00.png` | 替换 |
| `obstacles/shibuya/car_van/01.png` | 替换 |
| `obstacles/shibuya/car_van/02.png` | 替换 |
| `obstacles/shibuya/car_van/03.png` | 替换 |
| `obstacles/shibuya/car_van/strip.png` | 替换 |
| `obstacles/shibuya/walker_office/back/00.png` | 替换 |
| `obstacles/shibuya/walker_office/back/01.png` | 替换 |
| `obstacles/shibuya/walker_office/back/02.png` | 替换 |
| `obstacles/shibuya/walker_office/back/03.png` | 替换 |
| `obstacles/shibuya/walker_office/back/04.png` | 替换 |
| `obstacles/shibuya/walker_office/back/05.png` | 替换 |
| `obstacles/shibuya/walker_office/back/strip.png` | 替换 |
| `obstacles/shibuya/walker_office/front/00.png` | 替换 |
| `obstacles/shibuya/walker_office/front/01.png` | 替换 |
| `obstacles/shibuya/walker_office/front/02.png` | 替换 |
| `obstacles/shibuya/walker_office/front/03.png` | 替换 |
| `obstacles/shibuya/walker_office/front/04.png` | 替换 |
| `obstacles/shibuya/walker_office/front/05.png` | 替换 |
| `obstacles/shibuya/walker_office/front/strip.png` | 替换 |
| `obstacles/shibuya/walker_student/back/00.png` | 替换 |
| `obstacles/shibuya/walker_student/back/01.png` | 替换 |
| `obstacles/shibuya/walker_student/back/02.png` | 替换 |
| `obstacles/shibuya/walker_student/back/03.png` | 替换 |
| `obstacles/shibuya/walker_student/back/04.png` | 替换 |
| `obstacles/shibuya/walker_student/back/05.png` | 替换 |
| `obstacles/shibuya/walker_student/back/strip.png` | 替换 |
| `obstacles/shibuya/walker_student/front/00.png` | 替换 |
| `obstacles/shibuya/walker_student/front/01.png` | 替换 |
| `obstacles/shibuya/walker_student/front/02.png` | 替换 |
| `obstacles/shibuya/walker_student/front/03.png` | 替换 |
| `obstacles/shibuya/walker_student/front/04.png` | 替换 |
| `obstacles/shibuya/walker_student/front/05.png` | 替换 |
| `obstacles/shibuya/walker_student/front/strip.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/back/00.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/back/01.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/back/02.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/back/03.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/back/04.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/back/05.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/back/strip.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/front/00.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/front/01.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/front/02.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/front/03.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/front/04.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/front/05.png` | 替换 |
| `obstacles/shibuya/walker_umbrella/front/strip.png` | 替换 |
| `ui/distance_bar.png` | 替换 |
| `ui/distance_bar_dark.png` | 新增 |
| `ui/level_cards/shibuya.png` | 替换 |
| `ui/pause_button.png` | 替换 |
| `ui/pause_panel.png` | 替换 |
| `ui/title_logo.png` | 新增 |

## 结局音乐

| 文件 | 曲目 | 来源与授权 |
| --- | --- | --- |
| `audio/bgm/05_good_caught.mp3` | Carefree | Kevin MacLeod (incompetech.com)，CC BY 4.0（http://creativecommons.org/licenses/by/4.0/）。原曲音量偏小，整体提高约 5 dB，其余未改动。 |
| `audio/bgm/06_bad_escaped.mp3` | Darkest Child | Kevin MacLeod (incompetech.com)，CC BY 4.0（http://creativecommons.org/licenses/by/4.0/）。未改动。 |

## 隐藏结局素材

奏、绘名的头像（平常 / 担心）、新的瑞希头像、空无一人的世界背景（普通 / 发白）、十字路口 CG，以及刹车声和远处的警笛声（均为 CC0）。每个文件的来源和处理见同目录下的 `隐藏结局素材来源清单.md`。

## 日语配音

`audio/voice/` 里的 38 句日语配音由作者用 MiniMax 语音合成生成，音色为作者自己设计的音色，不是任何声优的声音。生成后统一了音量；隐藏结局梦里的台词加了混响，坏结局镜子里的两句做了降调、回声和轻微失真。

## 误会结局素材

走廊场景、空荡荡的走廊、同学头像、瑞希慌张和真冬疑惑的表情差分，以及走廊里的窃窃私语声（CC0）。来源见 `误会结局素材来源清单.md`。这个结局的 11 句配音（含同学的 3 句）同样由作者用 MiniMax 生成。
