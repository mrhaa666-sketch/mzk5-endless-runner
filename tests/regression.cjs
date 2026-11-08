// Run: npm install --no-save playwright && node tests/regression.cjs
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 const page = await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 await page.waitForFunction(()=>window.__game?.game.state==='title');
 await page.evaluate(()=>{requestAnimationFrame=()=>0});
 await page.waitForTimeout(100);
 await page.keyboard.press('KeyM'); // real user gesture also unlocks audio
 const results=await page.evaluate(()=>{
  const out=[];
  const test=(name,fn)=>{try{fn();out.push({name,pass:true})}catch(e){out.push({name,pass:false,error:e.message})}};
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
  const clear=()=>{for(const k in keys)delete keys[k];for(const k in pressed)delete pressed[k];game.click=null};
  const reset=(i=0)=>{clear();game.fade=0;game.fadeTo=null;game.units=5;game.invincible=false;game.hintsShown={};startLevel(i);game.obs=[]};
  const step=(n=1,dt=1/60)=>{for(let i=0;i<n;i++){updatePlay(dt);clear()}};
  const tick=(n=1)=>{for(let i=0;i<n;i++){update(1/60);clear()}};
  const wall=(gap=false,lane=1)=>({kind:'wall',type:gap?'junk_wall_gap':'junk_wall_a',x:1000,w:gap?280:272,h:999,lane,gap});
  const desk=()=>({kind:'full',type:'desk_row',x:1000,w:196,h:136,lane:null});
  const car=()=>({kind:'car',type:'car_taxi',x:1000,w:360,h:137,lane:1,active:true,animT:0});
  test('All required images load',()=>assert(loaded===required,`${loaded}/${required}`));
  test('All optional fear animations load completely',()=>{for(const k in ANIMS)for(let i=0;i<ANIMS[k][0];i++)assert(IMG[`${k}/${i}`],`${k}/${i}`)});
  test('An incomplete fear animation uses a complete animation instead',()=>{
    const key='mizuki/run_fear2/3', frame=IMG[key], oldFear=Horror.fear;
    try {
      delete IMG[key];
      Horror.fear=0.9;
      assert(fearKey('mizuki/run')==='mizuki/run_fear1','selected an animation with a missing frame');
    } finally {
      IMG[key]=frame;
      Horror.fear=oldFear;
    }
  });
  for(let i=0;i<3;i++)test(`Level ${i+1} builds and renders every obstacle`,()=>{reset(i);game.obs=buildLevel(game.L);for(const o of game.obs){game.p.x=o.x-500;game.camX=game.p.x-700;render()}assert(game.obs.length>0,'empty level')});
  test('Hold jump launches and lands',()=>{reset();keys.JUMP=true;pressed.JUMP=true;updatePlay(1/60);clear();assert(!game.p.grounded,'no jump');step(100);assert(game.p.grounded&&game.p.z===0,'not landed')});
  test('Pressing jump in midair cannot add upward velocity',()=>{
    reset();
    Object.assign(game.p,{z:155,vz:-200,grounded:false});
    pressed.JUMP=true;
    keys.JUMP=true;
    step();
    assert(game.p.vz<-200&&!game.p.grounded,'an extra air jump occurred');
  });
  test('Rising jump cannot become a platform landing',()=>{
    reset(2);
    game.obs=[{kind:'full',type:'crate_platform',x:1000,w:234,h:185}];
    Object.assign(game.p,{x:950,z:181.5,vz:100,grounded:false});
    step();
    assert(!game.p.grounded&&game.p.vz>0,'upward jump snapped onto platform');
  });
  test('Shift just before landing buffers the dash',()=>{
    reset(2);
    Object.assign(game.p,{z:10,vz:-650,grounded:false});
    pressed.DASH=true;
    step(2);
    assert(game.p.dashT>0&&game.p.grounded,'dash input lost on landing');
  });
  test('Early jump release lowers jump height',()=>{const apex=hold=>{reset();pressed.JUMP=true;keys.JUMP=true;let z=0;for(let i=0;i<90;i++){if(!hold&&i>0)keys.JUMP=false;updatePlay(1/60);delete pressed.JUMP;z=Math.max(z,game.p.z)}return z};const full=apex(true),short=apex(false);assert(short<full*.7,`${short} vs ${full}`)});
  test('Full obstacle collision costs two units once',()=>{reset();game.obs=[desk()];game.p.x=870;step(100);assert(game.units===3,`units=${game.units}`);assert(game.p.x<877,'walked through')});
  test('Air collision costs one unit',()=>{reset();game.obs=[desk()];Object.assign(game.p,{x:875,z:60,vz:0,grounded:false});step(3);assert(game.units===4,`units=${game.units}`)});
  test('Jump above a desk has no penalty',()=>{reset();game.obs=[desk()];Object.assign(game.p,{x:870,z:210,vz:200,grounded:false});step(30);assert(game.units===5,`units=${game.units}`)});
  test('Rising above a desk before reaching its edge has no penalty',()=>{reset();game.obs=[desk()];Object.assign(game.p,{x:880,z:125,vz:1000,grounded:false});keys.JUMP=true;step();assert(game.units===5,`units=${game.units}, z=${game.p.z}`)});
  test('Rising too late to clear a desk still costs one unit',()=>{reset();game.obs=[desk()];Object.assign(game.p,{x:885,z:125,vz:1000,grounded:false});keys.JUMP=true;step();assert(game.units===4,`units=${game.units}, z=${game.p.z}`)});
  test('Falling onto a platform lands on top',()=>{reset();game.obs=[desk()];Object.assign(game.p,{x:1000,z:240,vz:-1000,grounded:false});step(8);assert(game.p.z===136&&game.p.support===game.obs[0]&&game.units===5,'platform landing failed')});
  test('Leaving a platform falls to the floor',()=>{reset();game.obs=[desk()];Object.assign(game.p,{x:1080,z:136,grounded:true,support:game.obs[0]});step(50);assert(game.p.z===0&&game.p.grounded,'did not fall')});
  test('Jumping from a platform gives more lift than a ground jump',()=>{
    reset();
    pressed.JUMP=true;
    keys.JUMP=true;
    step();
    const groundLift=game.p.vz;
    reset();
    game.obs=[desk()];
    Object.assign(game.p,{x:1000,z:136,support:game.obs[0]});
    pressed.JUMP=true;
    keys.JUMP=true;
    step();
    assert(!game.p.grounded&&game.p.vz>groundLift&&game.p.z>136,'platform jump lacked lift');
  });
  test('Student cannot be cleared by a ground jump',()=>{reset();game.obs=[{kind:'student',type:'student_boy',x:1000,w:70,h:200,lane:1,vx:-140,active:true,animT:0}];Object.assign(game.p,{x:940,z:260,vz:100,grounded:false});step(15);assert(game.units===3,`units=${game.units}`)});
  test('Student can be cleared by a jump launched from a platform',()=>{reset();game.obs=[{kind:'student',type:'student_boy',x:1000,w:70,h:200,lane:1,vx:-140,active:true,animT:0}];Object.assign(game.p,{x:940,z:260,vz:100,grounded:false,jumpFrom:desk()});step(15);assert(game.units===5,`units=${game.units}`)});
  test('Student wall walks in and is crossed by landing on its obstacle and jumping again',()=>{reset();game.obs=buildLevel({items:[['student_wall',1800]]});game.p.x=200;let walking=null;
    for(let i=0;i<360;i++){clear();if(i===122||i===156)pressed.JUMP=true;if((i>=122&&i<157)||(i>=156&&i<191))keys.JUMP=true;updatePlay(1/60);const st=game.obs.find(o=>o.kind==='student'&&o.lane===1);if(walking===null&&game.p.x>st.x)walking=!st.stopped}clear();
    assert(game.units===5&&game.p.x>2000&&walking===true,`units=${game.units}, x=${game.p.x}, walking=${walking}`)});
  test('Student wall always has an obstacle in front of it',()=>{for(const L of LEVELS)for(const d of ['easy','normal','hard']){game.diff=d;const o=buildLevel(L);for(const s of o.filter(o=>o.wall!==undefined))assert(o.some(f=>f.kind==='full'&&s.stopX-right(f)>20&&s.stopX-right(f)<120),`${L.key} ${d} wall at ${s.x}`)}game.diff='normal'});
  test('Student ground hit costs two units once',()=>{reset();game.obs=[{kind:'student',type:'student_boy',x:1000,w:70,h:200,lane:1,vx:-140,active:true,animT:0}];game.p.x=930;step(40);assert(game.units===3,`units=${game.units}`)});
  test('Lane change avoids a student',()=>{reset();game.obs=[{kind:'student',type:'student_boy',x:1100,w:70,h:200,lane:1,vx:-140,active:true,animT:0}];game.p.x=800;pressed.UP=true;step(50);assert(game.units===5&&game.p.lane===0,'lane avoidance failed')});
  test('Car hit costs two units once',()=>{reset(1);game.obs=[{kind:'car',type:'car_taxi',x:1000,w:360,h:137,lane:1,active:true,animT:0}];game.p.x=780;step(50);assert(game.units===3,`units=${game.units}`)});
  test('Feet above the taxi hood avoid an invisible roof hit',()=>{
    reset(1);
    game.obs=[car()];
    Object.assign(game.p,{x:808,z:95,vz:110,grounded:false});
    step(2);
    assert(game.units===5,`hood clearance was penalized: ${game.units}`);
  });
  test('Descending onto a moving car roof lands and costs one unit',()=>{
    reset(1);
    game.obs=[car()];
    Object.assign(game.p,{x:1000,z:126,vz:-650,grounded:false});
    step();
    assert(game.p.support===game.obs[0]&&game.p.grounded&&game.p.z===119&&game.units===4,`failed to land on car: ${game.units}`);
  });
  test('Touching the roof from above near its rear edge is a landing',()=>{
    reset(1);
    game.obs=[car()];
    Object.assign(game.p,{x:1130,z:132,vz:-1650,grounded:false});
    step();
    assert(game.p.grounded&&game.p.support===game.obs[0]&&game.units===4,'rear edge contact was not a landing');
  });
  test('Jumping too low at the taxi roof is a full car hit',()=>{
    reset(1);
    game.obs=[car()];
    Object.assign(game.p,{x:940,z:92,vz:0,grounded:false});
    step();
    assert(game.units===3&&game.p.support===game.obs[0],`roof contact did not mount car: ${game.units}`);
  });
  test('A car hit carries the player backward, then the player runs off the car',()=>{
    reset(1);
    const taxi=car();
    game.obs=[taxi];
    game.p.x=797;
    step();
    const x=game.p.x;
    assert(game.units===3&&game.p.support===taxi,'ground impact did not mount the car');
    step(4);
    assert(game.p.x<x&&game.p.support===taxi,'car did not carry player backward');
    step(95);
    assert(game.p.support===null&&game.p.grounded&&game.p.z===0&&game.units===3,'failed to run off the car');
  });
  test('Jumping from a car launches from the roof and clears the support',()=>{
    reset(1);
    const taxi=car();
    game.obs=[taxi];
    Object.assign(game.p,{x:1000,z:119,support:taxi});
    pressed.JUMP=true;
    keys.JUMP=true;
    step();
    assert(game.p.support===null&&game.p.z>119&&game.p.vz>1200&&game.units===5,'car jump failed');
  });
  test('Switching lanes between parallel cars cannot charge twice in one frame',()=>{
    reset(1);
    game.obs=[{...car(),wave:1000},{...car(),lane:0,wave:1000}];
    Object.assign(game.p,{x:815,z:60,vz:-20,grounded:false,lane:0,laneF:0.5+7/60});
    step(8);
    assert(game.units===3,`two hits while between lanes: ${game.units}`);
  });
  test('Jumping clean over a car still costs one unit',()=>{reset(1);game.obs=[car()];Object.assign(game.p,{x:700,z:2000,vz:0,grounded:false});step(90);assert(game.units===4&&game.p.support!==game.obs[0],`units=${game.units}`)});
  test('Ground jump clears platforms but not walker height',()=>{reset();pressed.JUMP=true;keys.JUMP=true;let top=0;for(let i=0;i<60;i++){step();keys.JUMP=true;top=Math.max(top,game.p.z)}assert(top>190&&top<240,`jump top=${top}`)});
  test('Walkers cannot be jumped over',()=>{reset(1);game.obs=buildLevel({items:[['walker_office',1000,1,1]]});game.obs[0].active=true;Object.assign(game.p,{x:900,z:300,vz:0,grounded:false});step(30);assert(game.units===3,`units=${game.units}`)});
  for(const fps of [20,30,60,120])test(`Both walker dash windows work in the hard Shibuya opener at ${fps} fps`,()=>{
    reset(1);
    game.obs=buildLevel({items:LEVELS[1].items.hard.slice(1,3)});
    const attempted=new Set();
    for(let i=0;i<fps*5&&game.p.x<2200;i++){
      const walker=game.obs.find(o=>!attempted.has(o)&&game.p.x>=o.x-268&&game.p.x<=o.x-68);
      if(walker){attempted.add(walker);pressed.DASH=true}
      step(1,1/fps);
    }
    assert(attempted.size===2&&game.p.x>=2200&&game.units===5,`lost ${5-game.units} units after two timed dashes`);
  });
  test('Approaching a Shibuya walker shows no obstacle-specific dash prompt',()=>{
    reset(1);
    game.obs=buildLevel({items:[['walker_office',1000,0,2]]});
    game.p.x=800;
    step();
    assert(dashSpots().length===0&&!game.hint,'an approaching walker showed a dash prompt');
  });
  test('Shibuya shows no dash instructions or cooldown during play or pause',()=>{
    reset(1);
    const drawText=ctx.fillText;
    const labels=[];
    try {
      ctx.fillText=text=>labels.push(text);
      render();
      game.keyHintT=0;
      render();
      openPause();
      render();
    } finally {
      ctx.fillText=drawText;
    }
    assert(labels.includes('涩谷十字路口 · 怎么过')&&labels.includes('暂停'),'missing guide or pause menu');
    assert(!labels.some(text=>/shift|冲刺|冷却/i.test(text)),'Shibuya showed a dash instruction or cooldown');
  });
  test('The same walker does not repeatedly reset a dash cooldown',()=>{
    reset(1);
    game.obs=buildLevel({items:[['walker_office',1000,0,2]]});
    game.p.x=800;
    pressed.DASH=true;
    step(2);
    const cooldown=game.p.dashCD;
    pressed.DASH=true;
    step();
    assert(game.p.dashCD<cooldown,'one walker granted another dash');
  });
  test('Random layouts stay passable and vary between runs',()=>{
    const sigs=new Set();
    for(const d of ['easy','normal','hard'])for(let seed=1;seed<=30;seed++)for(let i=0;i<3;i++){
      game.diff=d;game.seed=seed;game.units=5;startLevel(i);
      const walls=game.obs.filter(o=>o.kind==='wall');
      for(const w of walls){const grp=walls.filter(v=>Math.abs(v.x-w.x)<40);assert(grp.some(v=>v.gap)||grp.length<3,`${d} ${seed} L${i} wall group at ${w.x} has no way through`)}
      const waves={};for(const c of game.obs.filter(o=>o.kind==='car'&&o.wave!==undefined))(waves[c.wave]=waves[c.wave]||[]).push(c.lane);
      for(const k in waves)assert(new Set(waves[k]).size<3,`${d} ${seed} L${i} full car wave`);
      for(const o of game.obs)assert(o.x<game.L.length,`${d} ${seed} L${i} obstacle past the finish`);
      if(i===0)sigs.add(game.obs.map(o=>o.type+o.lane+Math.round(o.x)).join());
      const sig=game.obs.map(o=>o.type+o.lane+Math.round(o.x)).join();startLevel(i);
      assert(sig===game.obs.map(o=>o.type+o.lane+Math.round(o.x)).join(),'restarting a level changed its layout');
    }
    assert(sigs.size>40,`too little variety: ${sigs.size}`);game.diff='normal';
  });
  test('Dash crosses an active walker',()=>{reset(1);game.obs=[{kind:'walker',type:'walker_office',x:1000,w:64,h:200,from:0,to:2,laneF:1,active:true,done:false,animT:0}];game.p.x=940;pressed.DASH=true;step(15);assert(game.units===5,`units=${game.units}`)});
  test('Direct high-wall hit costs two units even in air',()=>{reset(2);game.obs=[wall()];Object.assign(game.p,{x:830,z:280,vz:0,grounded:false});step(12);assert(game.units===3,`units=${game.units}`);assert(game.p.x<850,'passed wall')});
  for(const dt of [1/120,1/60,1/30,1/20])test(`Changing lanes at a wall cannot phase through (${Math.round(1/dt)}fps)`,()=>{reset(2);game.obs=[wall(false,0)];game.p.x=830;pressed.UP=true;updatePlay(dt);clear();for(let i=0;i<Math.ceil(1/dt);i++)updatePlay(dt);assert(game.p.laneF>.55||game.units===3,`phased through: x=${game.p.x}, lane=${game.p.laneF}, units=${game.units}`)});
  test('Dash timed at a doorway crosses safely',()=>{reset(2);game.obs=[wall(true)];game.p.x=837;pressed.DASH=true;step(35);assert(game.p.x>1166&&game.units===5,`x=${game.p.x}, units=${game.units}`)});
  test('Dash shortly before the doorway crosses without pixel-perfect timing',()=>{reset(2);game.obs=[wall(true)];game.p.x=755;pressed.DASH=true;step(60);assert(game.p.x>1166&&game.units===5,`x=${game.p.x}, units=${game.units}`)});
  test('Dash expiring before reaching the doorway does not allow entry',()=>{reset(2);game.obs=[wall(true)];game.p.x=400;pressed.DASH=true;step(85);assert(game.units===3&&game.p.x<1166,`x=${game.p.x}, units=${game.units}`)});
  test('A slide that is still active at entry completes even with little time left',()=>{
    reset(2);
    game.obs=[wall(true)];
    game.p.x=650;
    pressed.DASH=true;
    step(85);
    assert(game.units===5&&game.p.x>1260,'active slide was rejected or trapped at entry');
  });
  test('Pressing jump and changing lanes inside the tunnel cannot trap the player',()=>{
    reset(2);
    game.obs=[wall(true),wall(false,0),wall(false,2)];
    game.p.x=837;
    pressed.DASH=true;
    step(9);
    pressed.JUMP=true;
    keys.JUMP=true;
    pressed.UP=true;
    step(90);
    assert(game.units===5&&game.p.x>1260&&game.p.lane===1,'tunnel traversal was interrupted by input');
  });
  test('The dash timer ending inside a tunnel cannot restore solid collision',()=>{
    reset(2);
    game.obs=[wall(true)];
    game.p.x=837;
    pressed.DASH=true;
    step(8);
    game.p.dashT=0.001;
    step(90);
    assert(game.units===5&&game.p.x>1260,'dash expiry trapped the player in the box');
  });
  test('Pausing inside a tunnel then continuing completes the same traversal',()=>{
    reset(2);
    game.obs=[wall(true)];
    game.p.x=837;
    pressed.DASH=true;
    step(8);
    openPause();
    const x=game.p.x;
    tick(30);
    assert(game.p.x===x,'pause moved the player');
    closePause();
    step(90);
    assert(game.units===5&&game.p.x>1260,'resume lost tunnel state');
  });
  for (const fps of [20,30,60,120]) test(`Tunnel slide stays inside its lane and exits at ${fps} fps`,()=>{
    reset(2);
    game.obs=[wall(true),wall(false,0),wall(false,2)];
    game.p.x=755;
    pressed.DASH=true;
    updatePlay(1/fps);
    clear();
    for(let frame=0;frame<fps*2;frame++) {
      if(game.p.tunnel) {
        pressed.UP=true;
        pressed.JUMP=true;
        keys.JUMP=true;
        assert(mizukiFrame(game.p)[0]==='mizuki/slide','tunnel restored the standing pose');
      }
      updatePlay(1/fps);
      clear();
    }
    assert(game.p.x>1260&&game.units===5&&game.p.lane===1&&!game.p.tunnel,'tunnel slide failed');
  });
  test('Restarting during a tunnel clears the old box reference',()=>{
    reset(2);
    game.obs=[wall(true)];
    game.p.x=837;
    pressed.DASH=true;
    step(8);
    assert(game.p.tunnel,'never entered tunnel');
    startLevel(2);
    assert(!game.p.tunnel&&game.p.x===400,'stale tunnel survived restart');
  });
  for(const fps of [20,30,60,120])test(`Held Shift can recover from the wrong wall at ${fps} fps`,()=>{
    reset(2);
    game.obs=buildLevel({items:[['junk_wall_a',1000,0],['junk_wall_gap',1000,1],['junk_wall_b',1000,2]]});
    Object.assign(game.p,{x:780,lane:0,laneF:0});
    step(fps,1/fps);
    assert(game.units===3,'never hit the first wall');
    for(let i=0;i<fps*2;i++){
      keys.DASH=true;
      if(i===0)pressed.DOWN=true;
      step(1,1/fps);
    }
    assert(game.units===3&&game.p.x>1260&&!game.p.tunnel,'failed to switch and slide through');
  });
  function dashLabels(){
    const drawText=ctx.fillText;
    const labels=[];
    try {
      ctx.fillText=function(text,x,y){labels.push({text,x,width:this.measureText(text).width})};
      renderDashGates();
    } finally {
      ctx.fillText=drawText;
    }
    return labels;
  }
  test('The tunnel prompt appears inside the viewport as the box enters from the right',()=>{
    reset(2);
    game.obs=[{...wall(true),x:2600}];
    game.p.x=1239;
    game.camX=539;
    assert(dashLabels().length===0,'the box is still outside the viewport');
    game.p.x+=2;
    game.camX+=2;
    const hint=dashLabels()[0];
    assert(hint?.text.includes('Shift')&&hint.x+hint.width/2<W,'the hint was missing or clipped when the box entered');
    assert(!hint.text.includes('现在按'),'the hint signaled a dash too early');
  });
  test('The tunnel prompt stays visible while changing lanes',()=>{
    reset(2);
    game.obs=[wall(true)];
    Object.assign(game.p,{x:740,lane:0,laneF:0});
    game.camX=40;
    assert(dashLabels()[0]?.text.includes('换到'),'no prompt in the neighboring lane');
    pressed.DOWN=true;
    step(12);
    assert(dashLabels()[0]?.text.includes('现在按'),'no dash cue after changing lanes into the yellow zone');
  });
  test('The tunnel prompt stays visible until the slide exits the box',()=>{
    reset(2);
    game.obs=[wall(true)];
    game.p.x=837;
    pressed.DASH=true;
    step();
    let sawTrailingSlide=false;
    for(let i=0;i<60&&game.p.tunnel;i++){
      if(game.p.x>1140)sawTrailingSlide=true;
      assert(dashLabels()[0]?.text==='钻行中',`no slide prompt at x=${game.p.x}`);
      step();
    }
    assert(sawTrailingSlide&&!game.p.tunnel&&dashLabels().length===0,'slide prompt did not end with the slide');
  });
  test('Dash cooldown prevents immediate repeated activation',()=>{reset();pressed.DASH=true;step();step(25);pressed.DASH=true;step();assert(game.p.dashT<=0,'cooldown bypassed')});
  test('Wall in another lane does not block forward movement',()=>{reset(2);game.obs=[wall(false,0)];game.p.x=800;step(60);assert(game.p.x>1162&&game.units===5,'other lane blocked')});
  test('Switching out of a blocked lane lets the player escape',()=>{reset(2);game.obs=[wall()];game.p.x=830;step(50);pressed.UP=true;step(75);assert(game.p.x>1162&&game.units===3,'stuck after lane change')});
  test('Jumping after hitting a desk allows recovery',()=>{reset();game.obs=[desk()];game.p.x=870;step(50);pressed.JUMP=true;keys.JUMP=true;updatePlay(1/60);delete pressed.JUMP;for(let i=0;i<80;i++)updatePlay(1/60);clear();assert(game.p.x>1124&&game.units===3,'cannot recover from desk hit')});
  test('Lane input is bounded at outer lanes',()=>{reset();for(let i=0;i<10;i++){pressed.UP=true;step()}assert(game.p.lane===0,'lane below zero');for(let i=0;i<10;i++){pressed.DOWN=true;step()}assert(game.p.lane===2,'lane above two')});
  test('Mute silences background music',()=>{reset();setMuted(true);updateHorror(1/60);assert(audio.bgm.volume===0,'BGM not muted');setMuted(false);updateHorror(1/60);assert(audio.bgm.volume>0,'BGM remains muted')});
  test('Pause freezes player and obstacle movement',()=>{reset(1);game.obs=buildLevel(game.L);openPause();const x=game.p.x,ox=game.obs.map(o=>o.x).join();tick(100);assert(game.p.x===x&&game.obs.map(o=>o.x).join()===ox,'movement during pause')});
  test('Pause continue resumes background music',()=>{reset();openPause();closePause();assert(game.state==='play'&&!audio.bgm.paused,'resume failed')});
  test('Restart restores distance at level entry',()=>{reset(1);game.units=1;openPause();game.pause.sel=1;pressed.OK=true;tick(100);assert(game.state==='play'&&game.units===5&&game.unitsAtLevel===5,'distance not restored')});
  test('Pause can return to title',()=>{reset();openPause();game.pause.sel=2;pressed.OK=true;tick(70);assert(game.state==='title'&&!audio.bgm.paused,'title or audio did not resume')});
  test('Window blur pauses and clears held inputs',()=>{reset();keys.JUMP=true;dispatchEvent(new Event('blur'));assert(game.state==='paused'&&!keys.JUMP,'blur handling failed')});
  test('Window blur discards queued input before opening the pause menu',()=>{
    reset();
    pressed.ESC=true;
    dispatchEvent(new Event('blur'));
    tick();
    assert(game.state==='paused','a queued Escape resumed gameplay after focus was lost');
  });
  test('Zero distance reaches good ending',()=>{reset();game.units=1;game.obs=[desk()];game.p.x=870;step(45);assert(game.state==='caught','not caught');tick(180);assert(game.state==='story'&&game.storyKind==='good','good story missing');pressed.ESC=true;tick();assert(game.state==='end'&&game.ending==='good','good ending missing')});
  test('F2 toggles invincibility without skipping the collision or mounting',()=>{
    reset(1);
    const taxi=car();
    game.obs=[taxi];
    game.p.x=797;
    dispatchEvent(new KeyboardEvent('keydown',{code:'F2'}));
    tick();
    assert(game.invincible&&game.units===5&&game.p.support===taxi,'F2 did not preserve car impact in test mode');
    dispatchEvent(new KeyboardEvent('keyup',{code:'F2'}));
    dispatchEvent(new KeyboardEvent('keydown',{code:'F2'}));
    tick();
    assert(!game.invincible,'F2 did not exit test mode');
  });
  for(let i=0;i<2;i++)test(`Level ${i+1} finish enters the next level`,()=>{reset(i);game.p.x=game.L.length;step();tick(70);assert(game.state==='story'&&game.storyKind===LEVELS[i+1].key,'transition story missing');pressed.ESC=true;tick(250);assert(game.level===i+1&&game.state==='play'&&game.units===5,'next level missing')});
  test('Final level finish reaches bad ending',()=>{reset(2);game.p.x=game.L.length;step();tick(180);assert(game.state==='story'&&game.storyKind==='bad','bad story missing');pressed.ESC=true;tick();assert(game.state==='end'&&game.ending==='bad','bad ending missing')});
  test('Ending ignores input for a moment so mashed keys do not skip the result',()=>{reset(2);game.units=0;endScreen('bad');pressed.JUMP=true;tick(1);assert(game.state==='end'&&!game.fadeTo,'ending was skipped immediately')});
  test('Mafuyu takes the crawlable lane when all three lanes are walled',()=>{reset(2);game.obs=[0,1,2].map(l=>wall(l===2,l));game.m.x=1000-200;game.m.lane=game.m.laneF=0;assert(mafuyuLane(game.m,game.p)===2,'did not pick the gap lane')});
  test('Final hit by a car opens the hidden crash ending',()=>{reset(1);game.stats=newStats();game.units=2;game.obs=[car()];game.p.x=780;step(50);assert(game.state==='crash',`state=${game.state}`);tick(200);assert(game.state==='story'&&game.storyKind==='crash',`story=${game.storyKind}`);finishStory();assert(game.state==='end'&&game.ending==='crash','crash ending not reached')});
  test('Final hit by something else still ends in being caught',()=>{reset(0);game.units=2;game.obs=[desk()];game.p.x=780;step(60);tick(200);assert(game.storyKind==='good',`story=${game.storyKind}`)});
  test('Story lines play their voice and stop when skipped',()=>{audio.unlocked=true;startStory(STORY.crash,()=>{});game.story.i=7;game.story.t=99;pressed.OK=true;updateStory(1/60);const v=audio.voice;assert(v&&/crash_08\.mp3$/.test(v.src),'voice not started: '+(v&&v.src));finishStory();assert(!audio.voice,'voice not stopped')});
  test('Third student hit at Kamiyama opens the rumor ending',()=>{reset(0);game.stats=newStats();game.units=5;game.studentHits=2;const st={kind:'student',type:'student_boy',x:1000,w:70,h:200,lane:1,vx:0,active:true,animT:0};game.obs=[st];game.p.x=900;step(30);assert(game.state==='rumor',`state=${game.state}`);tick(200);assert(game.state==='story'&&game.storyKind==='rumor',`story=${game.storyKind}`);finishStory();tick(60);assert(game.state==='rumorFlee',`flee state=${game.state}`);tick(260);assert(game.state==='story'&&game.storyKind==='rumor2',`story2=${game.storyKind}`);finishStory();assert(game.state==='end'&&game.ending==='rumor','rumor ending not reached')});
  test('Student hits outside Kamiyama do not count toward the rumor ending',()=>{reset(1);game.units=5;game.studentHits=2;game.obs=[{kind:'student',type:'student_boy',x:1000,w:70,h:200,lane:1,vx:0,active:true,animT:0}];game.p.x=900;step(30);assert(game.state==='play','rumor triggered outside Kamiyama')});
  test('Ending replay resets distance',()=>{reset(2);game.units=0;endScreen('bad');game.endT=1;pressed.OK=true;tick(240);assert(game.level===0&&game.units===5&&game.state==='play','replay did not reset')});
  return out;
 });
 if(errors.length)results.push({name:'No browser runtime or resource errors',pass:false,error:errors.join('\n')});
 else results.push({name:'No browser runtime or resource errors',pass:true});
 for(const r of results)console.log(`${r.pass?'PASS':'FAIL'} ${r.name}${r.error?' — '+r.error:''}`);
 console.log(`${results.filter(r=>r.pass).length}/${results.length} passed`);
 if(process.env.REPORT_PATH)fs.writeFileSync(process.env.REPORT_PATH,JSON.stringify(results,null,2));
 await browser.close();
 if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
