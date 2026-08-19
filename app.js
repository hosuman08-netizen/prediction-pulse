
(function(){
  var topics=['시장 분위기','팀 생산성','운동 지속','콘텐츠 반응','운세 톤','수면 리듬','집중력','인간관계','카페인 타이밍','브레인스토 운'];
  var root=document.getElementById('app');
  var hist=JSON.parse(localStorage.getItem('pp_hist')||'[]');
  var SHARE_BASE='https://hosuman08-netizen.github.io/prediction-pulse/';
  function dayKey(off){
    var d=new Date(); d.setDate(d.getDate()+(off||0));
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function fomoLeft(){
    var end=new Date(); end.setHours(24,0,0,0);
    var ms=end-Date.now(); if(ms<0)ms=0;
    var h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);
    return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
  }
  function kId(){
    try{
      var id=localStorage.getItem('pp_k_id');
      if(!id){id='p'+Math.random().toString(36).slice(2,8);localStorage.setItem('pp_k_id',id);}
      return id;
    }catch(e){return 'share';}
  }
  function shareUrl(){return SHARE_BASE+'?utm_source=share&utm_medium=app&ref='+encodeURIComponent(kId());}
  function todayN(){try{return +(localStorage.getItem('pp_day_'+dayKey(0))||0);}catch(e){return 0;}}
  function bumpToday(){try{localStorage.setItem('pp_day_'+dayKey(0),String(todayN()+1));}catch(e){}}
  function weekAvg(){
    try{
      var cut=Date.now()-7*86400000;
      var arr=hist.filter(function(h){return (h.ts||0)>=cut;}).map(function(h){return h.score||0;});
      if(!arr.length) return 0;
      return Math.round(arr.reduce(function(a,b){return a+b;},0)/arr.length);
    }catch(e){return 0;}
  }
  function qFor(t){ return t+' — 오늘, 좋게 끝날 확률은?'; }
  function todayTopic(){
    var k=dayKey(0), n=0, i;
    for(i=0;i<k.length;i++) n=(n*33+k.charCodeAt(i))>>>0;
    return topics[n%topics.length];
  }
  function lockKey(){ return 'pp_lock_'+dayKey(0); }
  function lockGet(){ try{ return JSON.parse(localStorage.getItem(lockKey())||'null'); }catch(e){ return null; } }
  function lockSet(obj){ try{ localStorage.setItem(lockKey(), JSON.stringify(obj)); }catch(e){} }
  function resolveKey(off){ return 'pp_res_'+dayKey(off); }
  function resolveGet(off){ try{ return JSON.parse(localStorage.getItem(resolveKey(off))||'null'); }catch(e){ return null; } }
  function resolveSet(off,obj){ try{ localStorage.setItem(resolveKey(off), JSON.stringify(obj)); }catch(e){} }
  function yLock(){ try{ return JSON.parse(localStorage.getItem('pp_lock_'+dayKey(-1))||'null'); }catch(e){ return null; } }
  function pins(){
    var a=[];
    try{
      a=JSON.parse(localStorage.getItem('pp_pins')||'[]');
      if(!Array.isArray(a)) a=[];
    }catch(e){ a=[]; }
    a=a.filter(function(x){ return topics.indexOf(x)>=0; });
    try{
      var old=localStorage.getItem('pp_pin_topic')||'';
      if(old && topics.indexOf(old)>=0 && a.indexOf(old)<0) a.unshift(old);
    }catch(e){}
    return a.slice(0,3);
  }
  function pinSet(arr){
    var a=(arr||[]).filter(function(x){ return topics.indexOf(x)>=0; }).slice(0,3);
    try{ localStorage.setItem('pp_pins',JSON.stringify(a)); }catch(e){}
    return a;
  }
  function pinToggle(t){
    if(topics.indexOf(t)<0) return pins();
    var a=pins();
    var i=a.indexOf(t);
    if(i>=0) a.splice(i,1);
    else { if(a.length>=3) a.pop(); a.unshift(t); }
    return pinSet(a);
  }
  function calib(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calibAdd(hit){
    var c=calib();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib',JSON.stringify(c));}catch(e){}
    return c;
  }
  function bumpStreak(){
    try{
      var s=JSON.parse(localStorage.getItem('pp_streak')||'{}');
      if(!s||typeof s!=='object')s={last:null,count:0};
      var t=dayKey(0);
      if(s.last===t) return s;
      var y=dayKey(-1),y2=dayKey(-2),froze=false;
      if(s.last && s.last!==y && s.last===y2 && (s.count||0)>=3){
        var ready=!s.shieldLast||((new Date(t)-new Date(s.shieldLast))/86400000)>=7;
        if(ready){s.shieldLast=t;s.last=y;froze=true;try{legionTrack('streak_freeze',{count:s.count})}catch(e){}}
      }
      s.count=(s.last===y)?(s.count||0)+1:1;
      s.last=t;
      localStorage.setItem('pp_streak',JSON.stringify(s));
      try{legionTrack('streak',{count:s.count,froze:froze})}catch(e){}
      return s;
    }catch(e){return {count:0};}
  }
  function card(reuse){
    var t, score, tone, locked, lock;
    lock=lockGet();
    if(reuse){ t=reuse.t; score=reuse.score; tone=reuse.tone||''; locked=true; }
    else if(lock){ t=lock.t; score=lock.p; tone=lock.tone||''; locked=true; }
    else {
      var picked=''; try{picked=localStorage.getItem('pp_pick_'+dayKey(0))||'';}catch(e){}
      t=(picked && topics.indexOf(picked)>=0)?picked:todayTopic();
      score=50; tone=''; locked=false;
    }
    var s={}; try{s=JSON.parse(localStorage.getItem('pp_streak')||'{}')||{};}catch(e){s={};}
    var c=s.count||0;
    var ready=!s.shieldLast||((new Date(dayKey(0))-new Date(s.shieldLast))/86400000)>=7;
    var wa=weekAvg();
    var pinList=pins();
    var tn=todayN(), ydn=+(localStorage.getItem('pp_day_'+dayKey(-1))||0);
    var goal=1, gPct=locked?100:0;
    var yL=yLock(), yR=resolveGet(-1), cal=calib();
    var hitPct=cal.n?Math.round(cal.hits/cal.n*100):null;
    var sparkHtml='';
    try{
      var recent=hist.slice(0,7).reverse();
      var maxS=1; recent.forEach(function(h){if((h.score||0)>maxS)maxS=h.score;});
      sparkHtml=recent.map(function(h){
        var ht=Math.max(4,Math.round((h.score||0)/maxS*36));
        var col=(h.score||0)>=75?'#fbbf24':(h.score||0)>=55?'#67e8f9':'#64748b';
        return '<div title="'+h.t+': '+h.score+'%" style="flex:1;height:40px;display:flex;align-items:flex-end"><div style="width:100%;height:'+ht+'px;background:'+col+';border-radius:3px 3px 0 0"></div></div>';
      }).join('');
    }catch(e){}
    var q=qFor(t);
    var body=locked
      ? ('<div class="chip">잠금</div><h2 style="margin:10px 0;color:var(--gold)">'+q+'</h2>'
        +'<div id="pval">'+score+'%</div><p>'+(tone||'')+'</p>'
        +'<p class="sub">오늘 1문 잠금 · 현금/포인트 현금화 없음 · 실투자 아님</p>')
      : ('<h2 style="margin:10px 0;color:var(--gold)">'+q+'</h2>'
        +'<div id="pval">'+score+'%</div>'
        +'<input id="pslider" type="range" min="0" max="100" value="'+score+'"/>'
        +'<p class="sub">0–100 확률 · 잠그면 오늘 고정 · 현금화 없음</p>'
        +'<button id="lockBtn" style="margin-top:8px">잠금</button> ');
    root.innerHTML='<div class="card">'
      +'<div class="chip">가상 엔터</div><div class="chip">오늘 창 '+fomoLeft()+'</div><div class="chip">오늘 '+(locked?1:0)+'/'+goal+'</div>'
      +'<div class="chip">전일 '+(tn-ydn>=0?'+':'')+(tn-ydn)+'</div>'
      +'<div class="chip">기록 '+hist.length+'</div><div class="chip">최고 '+(localStorage.getItem('pp_best')||'-')+'</div>'
      +'<div class="chip">7일 평균 '+(wa||'-')+'</div>'
      +'<div class="chip">🔥 '+c+'일'+(c>=3&&ready?' · 🛡️':'')+'</div>'
      +(pinList.length?'<div class="chip">워치 '+pinList.length+'/3</div>':'')
      +'<div class="chip">적중 '+(hitPct==null?'-':hitPct+'%')+(cal.n?' · '+cal.hits+'/'+cal.n:'')+'</div>'
      +'<div style="height:6px;background:#1c1826;border-radius:4px;margin:8px 0;overflow:hidden"><i style="display:block;height:100%;width:'+gPct+'%;background:linear-gradient(90deg,#e0b552,#fbbf24)"></i></div>'
      +(yL?('<div style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
        +'<div class="chip">어제 해상</div>'
        +'<p style="margin:6px 0;font-size:13px">'+qFor(yL.t)+'</p>'
        +'<p class="sub">잠금 '+yL.p+'% · 교육 시뮬 · 확률 보장 아님 · 현금화 없음</p>'
        +(yR
          ? '<p style="color:var(--'+(yR.hit?'ok':'bad')+');margin:4px 0">어제 '+(yR.hit?'맞음':'틀림')+'</p>'
          : '<div class="row" style="margin-top:6px"><button id="resYes">맞음</button><button class="sec" id="resNo">틀림</button></div>')
        +'</div>'):'')
      +'<div class="row" id="ppDeck" style="margin:8px 0 4px">'+topics.map(function(x){
        return '<button type="button" class="sec" data-deck="'+x+'" style="font-size:11px;padding:6px 8px'+(x===t?';border-color:var(--gold);color:var(--gold)':'')+(locked?';opacity:.55':'')+'">'+x+'</button>';
      }).join('')+'</div>'
      +'<p class="sub">고정 덱 10장 · 골라서 오늘 질문 · 베팅/지갑 없음</p>'
      +'<div class="row" id="ppWatch" style="margin:4px 0 8px">'
      +(pinList.length?pinList.map(function(x){
        return '<button type="button" class="sec" data-watch="'+x+'" style="font-size:11px;padding:6px 8px'+(x===t?';border-color:var(--gold);color:var(--gold)':'')+'">📌 '+x+'</button>';
      }).join(''):'<span class="chip">워치 0/3 · 오늘 창에 다시 뜸</span>')
      +'</div>'
      +'<p class="sub">워치리스트 최대 3 · 탭=오늘 질문 재노출 · 현금화 없음</p>'
      +body
      +(sparkHtml?'<div class="row" style="gap:3px;margin:10px 0;align-items:flex-end;height:44px">'+sparkHtml+'</div><p class="sub">최근 잠금 확률</p>':'')
      +'<button class="sec" id="pinTopic">'+(pinList.indexOf(t)>=0?'핀 해제':'주제 핀')+' · '+pinList.length+'/3</button> '
      +(locked?'<button class="sec" id="undoPred">↩ 잠금 해제</button> ':'')
      +'<button class="sec" id="share">공유 텍스트</button>'
      +(locked?'<div id="sharePeak" style="margin-top:12px;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
        +'<p style="margin:0 0 6px;font-size:13px">✨ 오늘 확률 잠금 — 한 장 공유</p>'
        +'<button class="sec" id="sharePeakBtn">📤 지금 공유</button></div>':'')
      +(hist.length?'<div style="margin-top:12px"><b class="sub">최근</b><div id="histList" class="sub" style="margin-top:6px"></div></div>':'')
      +'<div id="moneyPipe" style="margin-top:10px;padding:10px;border:1px solid #c5a46e44;border-radius:12px;background:#16121c;text-align:center;font-size:12px">'
      +'<div style="color:#e0b552;font-weight:700;margin-bottom:4px">💎 예측 더 깊게</div>'
      +'<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/saju-miniapp/?utm_source=pulse&utm_medium=pipe">🔮 사주</a>'
      +'<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/budget-pulse/?utm_source=pulse&utm_medium=pipe">💓 Budget</a>'
      +'<a style="color:#e0b552;margin:0 6px" href="https://hosuman08-netizen.github.io/legion-hub/?utm_source=pulse&utm_medium=pipe">🎮 Arcade</a>'
      +'</div></div>';
    if(hist.length){
      document.getElementById('histList').innerHTML=hist.slice(0,6).map(function(h,i){
        return '<div data-i="'+i+'" style="padding:4px 0;cursor:pointer;border-bottom:1px solid #2a2438">'+h.t+' · <b>'+h.score+'%</b></div>';
      }).join('');
      Array.prototype.forEach.call(document.querySelectorAll('[data-i]'),function(el){
        el.onclick=function(){ var h=hist[+el.getAttribute('data-i')]; if(h) card({t:h.t,score:h.score,tone:h.tone||''}); };
      });
    }
    var sl=document.getElementById('pslider'), pv=document.getElementById('pval');
    if(sl && pv){
      sl.oninput=function(){ pv.textContent=sl.value+'%'; };
    }
    function doRes(hit){
      if(resolveGet(-1)) return;
      resolveSet(-1,{hit:!!hit,ts:Date.now()});
      calibAdd(!!hit);
      try{legionTrack('resolve',{hit:!!hit})}catch(e){}
      card();
    }
    var ry=document.getElementById('resYes'); if(ry) ry.onclick=function(){doRes(true);};
    var rn=document.getElementById('resNo'); if(rn) rn.onclick=function(){doRes(false);};
    var lb=document.getElementById('lockBtn');
    if(lb) lb.onclick=function(){
      var p=sl?Math.max(0,Math.min(100,+sl.value||0)):50;
      var tone2=p>75?'강한 모멘텀':p>55?'중립 상승':'관망';
      lockSet({t:t,p:p,tone:tone2,ts:Date.now()});
      try{
        hist.unshift({t:t,score:p,tone:tone2,ts:Date.now()});
        localStorage.setItem('pp_hist',JSON.stringify(hist.slice(0,20)));
        var best=Math.max.apply(null,hist.map(function(h){return h.score||0}).concat([0]));
        localStorage.setItem('pp_best',best);
      }catch(e){}
      bumpToday(); bumpStreak();
      try{legionTrack('activate',{p:p})}catch(e){}
      card();
    };
    Array.prototype.forEach.call(document.querySelectorAll('[data-deck]'),function(b){
      b.onclick=function(){
        if(lockGet()) return;
        var x=b.getAttribute('data-deck');
        if(!x || topics.indexOf(x)<0) return;
        try{localStorage.setItem('pp_pick_'+dayKey(0),x);}catch(e){}
        try{legionTrack('deck',{t:x})}catch(e){}
        card();
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-watch]'),function(b){
      b.onclick=function(){
        if(lockGet()) return;
        var x=b.getAttribute('data-watch');
        if(!x || topics.indexOf(x)<0) return;
        try{localStorage.setItem('pp_pick_'+dayKey(0),x);}catch(e){}
        try{legionTrack('watch',{t:x})}catch(e){}
        card();
      };
    });
    document.getElementById('pinTopic').onclick=function(){
      pinToggle(t);
      if(locked) card({t:t,score:score,tone:tone}); else card();
      try{legionTrack('pin',{t:t,n:pins().length})}catch(e){}
    };
    var up=document.getElementById('undoPred');
    if(up) up.onclick=function(){
      try{ localStorage.removeItem(lockKey()); }catch(e){}
      if(hist.length && hist[0] && hist[0].t===t){
        hist.shift();
        try{localStorage.setItem('pp_hist',JSON.stringify(hist)); localStorage.setItem('pp_day_'+dayKey(0),String(Math.max(0,todayN()-1)));
          var best=hist.length?Math.max.apply(null,hist.map(function(h){return h.score||0})):'-';
          localStorage.setItem('pp_best',best);
        }catch(e){}
      }
      card();
      try{legionTrack('undo',{})}catch(e){}
    };
    function doShare(){
      var text='Prediction Pulse '+q+' '+(score!=null?score+'%':'')+' · '+shareUrl()+'\n재미 예측 · 실투자 아님 · 현금화 없음';
      if(navigator.share)navigator.share({text:text,url:shareUrl()}).catch(function(){});
      else if(navigator.clipboard)navigator.clipboard.writeText(text);
      try{legionTrack('share_peak',{score:score})}catch(e){}
    }
    var sh=document.getElementById('share'); if(sh) sh.onclick=doShare;
    var spb=document.getElementById('sharePeakBtn'); if(spb) spb.onclick=doShare;
    if(!reuse){ try{legionTrack('share_peak_shown',{score:score||0})}catch(e){} try{legionTrack('money_pipe_shown',{app:'prediction'})}catch(e){} }
  }
  try{
    var q=new URLSearchParams(location.search||'');
    var ref=q.get('ref');
    if(ref && ref!=='share' && ref!==kId() && !localStorage.getItem('pp_k_from')){
      localStorage.setItem('pp_k_from',ref);
      try{legionTrack('k_link',{from:ref})}catch(e){}
    }
  }catch(e){}
  try{legionTrack('session_start',{})}catch(e){}
  card();
})();

/* LEGION_WAVE_18_pipe_ensure */ /* pipe already present wave 18 */

/* LEGION_WAVE_63_share_counter */
document.addEventListener('click',function(ev){try{var el=ev.target;if(!el)return;var tx=(el.textContent||'')+(el.id||'');if(/share|copy/i.test(tx)||/\uacf5\uc720|\ubcf5\uc0ac/.test(tx)){localStorage.setItem('lw_p26_predicti_share_counter',String((+(localStorage.getItem('lw_p26_predicti_share_counter')||0))+1));}}catch(e){}},true);
