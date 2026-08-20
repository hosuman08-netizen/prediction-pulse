
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
  /* WAVE53 GOLD50 #5: 70% bin (65–75). Metaculus/GJ track-record bar. No stake. */
  function in70(p){ p=+p; return p>=65 && p<=75; }
  function calib70(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib70')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib70Add(hit){
    var c=calib70();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib70',JSON.stringify(c));}catch(e){}
    return c;
  }
  /* WAVE59 GOLD50 #5 next: 50% bin (45–55). No stake. No betting. */
  function in50(p){ p=+p; return p>=45 && p<=55; }
  function calib50(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib50')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib50Add(hit){
    var c=calib50();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib50',JSON.stringify(c));}catch(e){}
    return c;
  }
  /* WAVE65: 90% bin (85–95). No stake. No betting. */
  function in90(p){ p=+p; return p>=85 && p<=95; }
  function calib90(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib90')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib90Add(hit){
    var c=calib90();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib90',JSON.stringify(c));}catch(e){}
    return c;
  }
  /* WAVE71: 30% bin (25–35). No stake. No betting. */
  function in30(p){ p=+p; return p>=25 && p<=35; }
  function calib30(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib30')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib30Add(hit){
    var c=calib30();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib30',JSON.stringify(c));}catch(e){}
    return c;
  }
  /* WAVE76: 10% bin (5–15). No stake. No betting. */
  function in10(p){ p=+p; return p>=5 && p<=15; }
  function calib10(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib10')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib10Add(hit){
    var c=calib10();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib10',JSON.stringify(c));}catch(e){}
    return c;
  }
  /* WAVE83: 80% bin (75–85). No stake. No betting. */
  function in80(p){ p=+p; return p>=75 && p<=85; }
  function calib80(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib80')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib80Add(hit){
    var c=calib80();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib80',JSON.stringify(c));}catch(e){}
    return c;
  }
  /* WAVE91: 20% bin (15–25). No stake. No betting. */
  function in20(p){ p=+p; return p>=15 && p<=25; }
  function calib20(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib20')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib20Add(hit){
    var c=calib20();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib20',JSON.stringify(c));}catch(e){}
    return c;
  }
  /* WAVE99: 40% bin (35–45). No stake. No betting. */
  function in40(p){ p=+p; return p>=35 && p<=45; }
  function calib40(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib40')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib40Add(hit){
    var c=calib40();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib40',JSON.stringify(c));}catch(e){}
    return c;
  }
  /* WAVE106: 60% bin (55–65). No stake. No betting. */
  function in60(p){ p=+p; return p>=55 && p<=65; }
  function calib60(){
    try{
      var c=JSON.parse(localStorage.getItem('pp_calib60')||'{"n":0,"hits":0}');
      if(!c||typeof c!=='object') c={n:0,hits:0};
      return {n:+c.n||0,hits:+c.hits||0};
    }catch(e){return {n:0,hits:0};}
  }
  function calib60Add(hit){
    var c=calib60();
    c.n+=1; if(hit) c.hits+=1;
    try{localStorage.setItem('pp_calib60',JSON.stringify(c));}catch(e){}
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
    var yL=yLock(), yR=resolveGet(-1), cal=calib(), c70=calib70(), c50=calib50(), c90=calib90(), c30=calib30(), c10=calib10(), c80=calib80(), c20=calib20(), c40=calib40(), c60=calib60();
    var hitPct=cal.n?Math.round(cal.hits/cal.n*100):null;
    var pct70=c70.n?Math.round(c70.hits/c70.n*100):null;
    var pct50=c50.n?Math.round(c50.hits/c50.n*100):null;
    var pct90=c90.n?Math.round(c90.hits/c90.n*100):null;
    var pct30=c30.n?Math.round(c30.hits/c30.n*100):null;
    var pct10=c10.n?Math.round(c10.hits/c10.n*100):null;
    var pct80=c80.n?Math.round(c80.hits/c80.n*100):null;
    var pct20=c20.n?Math.round(c20.hits/c20.n*100):null;
    var pct40=c40.n?Math.round(c40.hits/c40.n*100):null;
    var pct60=c60.n?Math.round(c60.hits/c60.n*100):null;
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
      +'<div id="ppCalib70" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">70% 캘리브</div>'
      +(c70.n
        ? '<p class="sub">내가 70% 했을 때 실제 적중 <b>'+pct70+'%</b> · '+c70.hits+'/'+c70.n+' · 기대 70% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 70%"><i style="width:'+pct70+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 70%"><i style="width:70%"></i></div>'
        : '<p class="sub">70% 근처(65–75) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
      +'<div id="ppCalib50" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">50% 캘리브</div>'
      +(c50.n
        ? '<p class="sub">내가 50% 했을 때 실제 적중 <b>'+pct50+'%</b> · '+c50.hits+'/'+c50.n+' · 기대 50% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 50%"><i style="width:'+pct50+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 50%"><i style="width:50%"></i></div>'
        : '<p class="sub">50% 근처(45–55) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
      +'<div id="ppCalib90" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">90% 캘리브</div>'
      +(c90.n
        ? '<p class="sub">내가 90% 했을 때 실제 적중 <b>'+pct90+'%</b> · '+c90.hits+'/'+c90.n+' · 기대 90% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 90%"><i style="width:'+pct90+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 90%"><i style="width:90%"></i></div>'
        : '<p class="sub">90% 근처(85–95) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
      +'<div id="ppCalib30" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">30% 캘리브</div>'
      +(c30.n
        ? '<p class="sub">내가 30% 했을 때 실제 적중 <b>'+pct30+'%</b> · '+c30.hits+'/'+c30.n+' · 기대 30% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 30%"><i style="width:'+pct30+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 30%"><i style="width:30%"></i></div>'
        : '<p class="sub">30% 근처(25–35) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
      +'<div id="ppCalib10" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">10% 캘리브</div>'
      +(c10.n
        ? '<p class="sub">내가 10% 했을 때 실제 적중 <b>'+pct10+'%</b> · '+c10.hits+'/'+c10.n+' · 기대 10% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 10%"><i style="width:'+pct10+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 10%"><i style="width:10%"></i></div>'
        : '<p class="sub">10% 근처(5–15) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
      +'<div id="ppCalib80" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">80% 캘리브</div>'
      +(c80.n
        ? '<p class="sub">내가 80% 했을 때 실제 적중 <b>'+pct80+'%</b> · '+c80.hits+'/'+c80.n+' · 기대 80% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 80%"><i style="width:'+pct80+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 80%"><i style="width:80%"></i></div>'
        : '<p class="sub">80% 근처(75–85) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
      +'<div id="ppCalib20" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">20% 캘리브</div>'
      +(c20.n
        ? '<p class="sub">내가 20% 했을 때 실제 적중 <b>'+pct20+'%</b> · '+c20.hits+'/'+c20.n+' · 기대 20% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 20%"><i style="width:'+pct20+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 20%"><i style="width:20%"></i></div>'
        : '<p class="sub">20% 근처(15–25) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
      +'<div id="ppCalib40" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">40% 캘리브</div>'
      +(c40.n
        ? '<p class="sub">내가 40% 했을 때 실제 적중 <b>'+pct40+'%</b> · '+c40.hits+'/'+c40.n+' · 기대 40% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 40%"><i style="width:'+pct40+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 40%"><i style="width:40%"></i></div>'
        : '<p class="sub">40% 근처(35–45) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
      +'<div id="ppCalib60" style="margin:8px 0;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<div class="chip">60% 캘리브</div>'
      +(c60.n
        ? '<p class="sub">내가 60% 했을 때 실제 적중 <b>'+pct60+'%</b> · '+c60.hits+'/'+c60.n+' · 기대 60% · 베팅 없음</p>'
          +'<div class="bar" aria-label="actual hit rate when said 60%"><i style="width:'+pct60+'%"></i></div>'
          +'<div class="bar" style="opacity:.35;margin-top:4px" aria-label="expected 60%"><i style="width:60%"></i></div>'
        : '<p class="sub">60% 근처(55–65) 잠금 후 어제 해상하면 막대가 쌓임 · 현금화 없음</p>'
          +'<div class="bar"><i style="width:0"></i></div>')
      +'</div>'
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
      +''
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
      var y=yLock();
      resolveSet(-1,{hit:!!hit,ts:Date.now(),p:y?y.p:null});
      calibAdd(!!hit);
      if(y && in70(y.p)) calib70Add(!!hit);
      if(y && in50(y.p)) calib50Add(!!hit);
      if(y && in90(y.p)) calib90Add(!!hit);
      if(y && in30(y.p)) calib30Add(!!hit);
      if(y && in10(y.p)) calib10Add(!!hit);
      if(y && in80(y.p)) calib80Add(!!hit);
      if(y && in20(y.p)) calib20Add(!!hit);
      if(y && in40(y.p)) calib40Add(!!hit);
      if(y && in60(y.p)) calib60Add(!!hit);
      try{legionTrack('resolve',{hit:!!hit,bin70:!!(y&&in70(y.p)),bin50:!!(y&&in50(y.p)),bin90:!!(y&&in90(y.p)),bin30:!!(y&&in30(y.p)),bin10:!!(y&&in10(y.p)),bin80:!!(y&&in80(y.p)),bin20:!!(y&&in20(y.p)),bin40:!!(y&&in40(y.p)),bin60:!!(y&&in60(y.p))})}catch(e){}
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
