// TROLLKTDTS
(function(){
'use strict';

var isMobile=('ontouchstart' in window)||navigator.maxTouchPoints>0;

// ── AUDIO ──
var A=(function(){
  var ctx=null;
  function gc(){
    if(!ctx){var C=window.AudioContext||window.webkitAudioContext;if(C)ctx=new C();}
    if(ctx&&ctx.state==='suspended')ctx.resume();
    return ctx;
  }
  function key(){
    var c=gc();if(!c)return;
    var t=c.currentTime,o=c.createOscillator(),g=c.createGain();
    o.type='triangle';o.frequency.setValueAtTime(1800+Math.random()*700,t);
    o.frequency.exponentialRampToValueAtTime(300,t+.03);
    g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.05);
  }
  function granted(){
    var c=gc();if(!c)return;
    [523,659,784,1047].forEach(function(f,i){
      var t=c.currentTime+i*.09,o=c.createOscillator(),g=c.createGain();
      o.type='sine';o.frequency.setValueAtTime(f,t);
      g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);
      o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.36);
    });
  }
  function denied(){
    var c=gc();if(!c)return;
    var t=c.currentTime,o=c.createOscillator(),g=c.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(130,t);
    g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.42);
  }
  function glitch(){
    var c=gc();if(!c)return;
    var t=c.currentTime,sz=Math.floor(c.sampleRate*.2),buf=c.createBuffer(1,sz,c.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<sz;i++)d[i]=Math.random()*2-1;
    var n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    n.buffer=buf;f.type='bandpass';f.frequency.setValueAtTime(900,t);
    f.frequency.exponentialRampToValueAtTime(2400,t+.18);
    g.gain.setValueAtTime(.28,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);
    n.connect(f);f.connect(g);g.connect(c.destination);n.start(t);
    var sub=c.createOscillator(),sg=c.createGain();
    sub.type='sawtooth';sub.frequency.setValueAtTime(110,t);sub.frequency.exponentialRampToValueAtTime(35,t+.28);
    sg.gain.setValueAtTime(.28,t);sg.gain.exponentialRampToValueAtTime(.001,t+.28);
    sub.connect(sg);sg.connect(c.destination);sub.start(t);sub.stop(t+.3);
  }
  var sosc=null,sgain=null,stid=null;
  function siren(ms){
    ms=ms||4000;stopSiren();
    var c=gc();if(!c)return;
    sosc=c.createOscillator();sgain=c.createGain();sosc.type='sawtooth';
    var t=c.currentTime;sgain.gain.setValueAtTime(.15,t);
    var hi=true;
    for(var i=0;i<(ms/1000)/.3;i++){sosc.frequency.linearRampToValueAtTime(hi?940:620,t+i*.3);hi=!hi;}
    sosc.connect(sgain);sgain.connect(c.destination);sosc.start(t);
    stid=setTimeout(stopSiren,ms);
  }
  function stopSiren(){
    if(sosc){try{sosc.stop();sosc.disconnect();}catch(e){}sosc=null;}
    if(sgain){try{sgain.disconnect();}catch(e){}sgain=null;}
    if(stid){clearTimeout(stid);stid=null;}
  }
  return{gc:gc,key:key,granted:granted,denied:denied,glitch:glitch,siren:siren,stopSiren:stopSiren};
})();

// ── TYPER ──
var typerText='',typerIdx=0;
var SPEED=isMobile?8:7;
var txt=document.getElementById('txt');
var v2=document.getElementById('v2');

function appendCode(n){
  if(!typerText)return;
  if(typerIdx>=typerText.length)typerIdx=0;
  var chunk=typerText.substr(typerIdx,n||SPEED);
  typerIdx+=n||SPEED;
  chunk=chunk
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>').replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
  txt.insertAdjacentHTML('beforeend',chunk);
  v2.scrollTop=v2.scrollHeight;
}

// Load kernel, fallback to embedded
fetch('kernel.txt')
  .then(function(r){return r.ok?r.text():Promise.reject();})
  .then(function(t){typerText=t;})
  .catch(function(){
    typerText='two_step_auth_command.bui --bypass\nUsername: ag54348\nPassword: ********************\nACCESS TO SYSTEM v3.2.6\nInitializing...\nstruedit.bui -r -s -unauth\nsys_log=false;\nstruct group_info *groups_alloc(int gidsetsize){\n\tstruct group_info *group_info;\n\tint nblocks,i;\n\tnblocks=(gidsetsize+NGROUPS_PER_BLOCK-1)/NGROUPS_PER_BLOCK;\n\tgroup_info=kmalloc(sizeof(*group_info)+nblocks*sizeof(gid_t*),GFP_USER);\n\tif(!group_info)return NULL;\n\tgroup_info->ngroups=gidsetsize;\n\tgroup_info->nblocks=nblocks;\n\tatomic_set(&group_info->usage,1);\n\treturn group_info;\n}\nEXPORT_SYMBOL(groups_alloc);\n';
  });

// ── DRAGGABLE WINDOWS ──
var wins=Array.prototype.slice.call(document.querySelectorAll('.win'));
var topZ=600;

// Position windows: on mobile stack them, on desktop scatter
function placeWins(){
  var W=window.innerWidth,H=window.innerHeight;
  var mobile=W<600;
  wins.forEach(function(w,i){
    var col,row,left,top;
    if(mobile){
      // Mobile: single column, slightly offset each
      left=Math.max(8, Math.min(W-w.offsetWidth-8, 8+(i%2)*12));
      top=Math.max(60, Math.min(H-180, 60+(i%4)*18));
    } else {
      // Desktop: 3 column grid with jitter
      col=i%3; row=Math.floor(i/3);
      left=Math.min(16+col*230+(i%3)*8, W-250);
      top=Math.min(70+row*170+(i%2)*15, H-200);
    }
    w.style.left=left+'px';
    w.style.top=top+'px';
  });
}
placeWins();
window.addEventListener('resize', placeWins);

function showWin(el){
  if(!el)return;
  topZ++;el.style.zIndex=topZ;el.style.display='block';
  el.style.animation='none';
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      el.style.animation='winAppear .2s ease';
    });
  });
}
function hideWin(el){if(el)el.style.display='none';}

// Drag — pointer events (works on both mouse and touch)
function makeDraggable(w){
  var hdr=w.querySelector('.wh');
  if(!hdr)return;
  var dragging=false,sx=0,sy=0,il=0,it=0;

  hdr.addEventListener('pointerdown',function(e){
    if(e.target.classList.contains('wx'))return;
    dragging=true;sx=e.clientX;sy=e.clientY;il=w.offsetLeft;it=w.offsetTop;
    topZ++;w.style.zIndex=topZ;
    try{hdr.setPointerCapture(e.pointerId);}catch(err){}
    e.preventDefault();
  });
  hdr.addEventListener('pointermove',function(e){
    if(!dragging)return;
    var nl=il+(e.clientX-sx);
    var nt=it+(e.clientY-sy);
    nl=Math.max(0,Math.min(nl,window.innerWidth-w.offsetWidth));
    nt=Math.max(0,Math.min(nt,window.innerHeight-40));
    w.style.left=nl+'px';w.style.top=nt+'px';
    e.preventDefault();
  });
  function stop(e){
    if(dragging){dragging=false;try{hdr.releasePointerCapture(e.pointerId);}catch(err){}}
  }
  hdr.addEventListener('pointerup',stop);
  hdr.addEventListener('pointercancel',stop);
}
wins.forEach(makeDraggable);

// Close buttons — handle both click and touchend
document.querySelectorAll('.wx').forEach(function(x){
  function closeIt(e){
    var id=x.dataset.id;
    hideWin(document.getElementById(id));
    e.stopPropagation();
    e.preventDefault();
  }
  x.addEventListener('click',closeIt);
  x.addEventListener('touchend',closeIt,{passive:false});
});

// ── ALERT FLASHES ──
function showFlash(id,ms){
  ms=ms||2200;
  var el=document.getElementById(id);if(!el)return;
  el.style.display='block';
  setTimeout(function(){el.style.display='none';},ms);
}

// ── GLITCH → TERMINAL ──
var inGeek=false;
function goGeek(){
  if(inGeek)return;inGeek=true;
  A.gc();A.glitch();A.siren(2000);
  // Flash white
  var fl=document.getElementById('flash');fl.classList.add('go');
  setTimeout(function(){fl.classList.remove('go');},800);
  // Glitch overlay
  var g=document.getElementById('glitch');
  var fill=document.getElementById('gfill');
  var msg=document.getElementById('glitch-msg');
  var flood=document.getElementById('glitch-flood');
  var msgs=['ĐANG PHÁ MÃ TƯỜNG LỬA...','BYPASSING BIOMETRIC AUTH...','INJECTING ROOTKIT PAYLOAD...','XÂM NHẬP THÀNH CÔNG!'];
  // Matrix rain text
  var rows=[];for(var r=0;r<80;r++)rows.push(Math.random().toString(36).substr(2,32));
  flood.textContent=rows.join('\n');
  g.classList.add('on');fill.style.width='0%';
  var steps=[{w:'30%',m:msgs[0]},{w:'62%',m:msgs[1]},{w:'90%',m:msgs[2]},{w:'100%',m:msgs[3]}];
  var si=0;
  var iv=setInterval(function(){
    if(si>=steps.length){clearInterval(iv);return;}
    fill.style.width=steps[si].w;msg.textContent=steps[si].m;si++;
  },320);
  setTimeout(function(){
    g.classList.remove('on');
    document.getElementById('v1').style.display='none';
    v2.classList.add('on');
    A.stopSiren();A.granted();
    startTerminal();
  },1500);
}

// ── PHOTO TRIGGERS ──
var v1=document.getElementById('v1');
// Unified: tap on mobile, click on desktop
var tapped=false;
v1.addEventListener('touchend',function(e){
  tapped=true;
  A.gc();goGeek();
  e.preventDefault();
},{passive:false});
v1.addEventListener('click',function(){
  if(!tapped){A.gc();goGeek();}
  tapped=false;
});

// ── TERMINAL START ──
function startTerminal(){
  // Auto-type (faster on mobile since no keyboard)
  var autoSpeed=isMobile?10:7;
  setInterval(function(){appendCode(autoSpeed);},55);

  // Keyboard typing on desktop
  document.addEventListener('keydown',function(e){
    if(e.key==='F5'||e.key==='F11'||e.key==='F12')return;
    if(e.key==='Backspace'){
      A.key();
      var h=txt.innerHTML;txt.innerHTML=h.slice(0,Math.max(0,h.length-25));
      e.preventDefault();return;
    }
    appendCode(SPEED);A.key();e.preventDefault();
  });

  // Touch on terminal also types
  v2.addEventListener('touchstart',function(){
    appendCode(SPEED*3);A.key();
  },{passive:true});

  schedulePopups();
}

// ── TROLL SCHEDULE ──
function schedulePopups(){
  var pool=[
    {id:'wDL', t:3000},
    {id:'wHash',t:7500},
    {id:'wRad', t:12000},
    {id:'wTra', t:16000},
    {id:'wCon', t:20000},
    {id:'wSat', t:25000},
    {id:'wEnc', t:30000},
    {id:'wMap', t:36000},
    {id:'wRat', t:42000},
    {id:'wPw',  t:48000},
    {id:'wNeu', t:55000,siren:true},
    {id:'wBr',  t:61000,siren:true},
    {id:'wEv',  t:67000,siren:true},
  ];
  pool.forEach(function(p){
    setTimeout(function(){
      showWin(document.getElementById(p.id));
      if(p.siren)A.siren(2500);
    }, p.t+(Math.random()*1200|0));
  });

  // Intermittent alerts
  setTimeout(function(){A.denied();showFlash('ad');},10000);
  setTimeout(function(){A.denied();showFlash('ad');},38000);
  setTimeout(function(){A.granted();showFlash('ag');},26000);

  // Format bomb ~75s
  setTimeout(startFormat, 75000+(Math.random()*6000|0));

  // Loop light popups after format completes
  setTimeout(loopPopups, 115000);
}

function loopPopups(){
  var ids=['wDL','wHash','wCon','wTra','wRad','wEnc'];
  ids.forEach(function(id,i){
    setTimeout(function(){showWin(document.getElementById(id));},i*9000+(Math.random()*3000|0));
  });
  setTimeout(function(){A.denied();showFlash('ad');},18000);
  setTimeout(function(){A.granted();showFlash('ag');},35000);
  setTimeout(loopPopups, ids.length*9000+45000);
}

// ── FORMAT DISK TROLL ──
function startFormat(){
  var fmt=document.getElementById('fmt');
  var fill=document.getElementById('ffill');
  var ftxt=document.getElementById('ftxt');
  var fmsg=document.getElementById('fmsg');
  fmt.classList.add('on');A.siren(3500);
  var pct=0;fill.style.width='0%';
  var logs=[
    'C:\\Windows\\System32\\... [XÓA]',
    'C:\\Users\\... [XÓA]',
    'C:\\Program Files\\... [XÓA]',
    'NTFS format sector 0x00FA3B... [GHI]',
    'Wiping MBR... [HOÀN TẤT]',
    '! KHÔNG TẮT MÁY TÍNH !',
  ];
  var li=0;
  var iv=setInterval(function(){
    pct+=Math.random()*12+5|0;
    if(pct>=100){
      pct=100;fill.style.width='100%';clearInterval(iv);
      fmsg.innerHTML='<span style="color:#0f0;font-size:clamp(13px,3vw,16px)">🤡 BỊ LỪA RỒI! Không có gì bị xóa!<br>NGHĨ HACK ĐƯỢC ÂY? HAHAHA 🤣</span>';
      ftxt.textContent='';A.stopSiren();A.granted();
      setTimeout(function(){
        fmt.classList.remove('on');
        fill.style.width='0%';
        fmsg.textContent='Phát hiện xâm nhập. Đang xóa dữ liệu...';
        ftxt.textContent='';
      },5000);
      return;
    }
    fill.style.width=pct+'%';
    if(li<logs.length)ftxt.textContent=logs[li++];
  },260);
}

})();
