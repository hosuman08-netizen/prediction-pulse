
(function(){
  var topics=['시장 분위기','팀 생산성','운동 지속','콘텐츠 반응','운세 톤','수면 리듬','집중력','인간관계','카페인 타이밍','브레인스토 운'];;
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
  function card(){
    var t=topics[Math.floor(Math.random()*topics.length)];
    var score=40+Math.floor(Math.random()*55);
    var tone=score>75?'강한 모멘텀':score>55?'중립 상승':'관망';
    try{hist.unshift({t:t,score:score,ts:Date.now()});localStorage.setItem('pp_hist',JSON.stringify(hist.slice(0,12)));}catch(e){}
    var s=bumpStreak();
    var c=s.count||0;
    var ready=!s.shieldLast||((new Date(dayKey(0))-new Date(s.shieldLast))/86400000)>=7;
    root.innerHTML='<div class="card">'
      +'<div class="chip">가상 엔터</div><div class="chip">오늘 창 '+fomoLeft()+'</div><div class="chip">기록 '+hist.length+'</div>'
      +'<div class="chip">🔥 '+c+'일'+(c>=3&&ready?' · 🛡️':'')+'</div>'
      +'<h2 style="margin:10px 0;color:var(--gold)">'+t+'</h2>'
      +'<div style="font-size:42px;font-weight:800">'+score+'</div><p>'+tone+'</p>'
      +'<p class="sub">재미 예측 · 실투자/실결정 근거 아님</p>'
      +'<button id="again" style="margin-top:12px">다시 뽑기</button> '
      +'<button class="sec" id="share">공유 텍스트</button>'
      +'<div id="sharePeak" style="margin-top:12px;padding:10px;border:1px solid #e0b55244;border-radius:12px">'
      +'<p style="margin:0 0 6px;font-size:13px">✨ '+(score>=80?'강한 모멘텀 직후 — 지금 공유':'결과 나옴 — 한 장 공유')+'</p>'
      +'<button class="sec" id="sharePeakBtn">📤 지금 공유</button></div>'
      +'<div id="moneyPipe" style="margin-top:10px;padding:10px;border:1px solid #c5a46e44;border-radius:12px;background:#16121c;text-align:center;font-size:12px">'
      +'<div style="color:#e0b552;font-weight:700;margin-bottom:4px">💎 예측 더 깊게</div>'
      +'<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/saju-miniapp/?utm_source=pulse&utm_medium=pipe">🔮 사주</a>'
      +'<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/budget-pulse/?utm_source=pulse&utm_medium=pipe">💓 Budget</a>'
      +'<a style="color:#e0b552;margin:0 6px" href="https://hosuman08-netizen.github.io/legion-hub/?utm_source=pulse&utm_medium=pipe">🎮 Arcade</a>'
      +'</div></div>';
    document.getElementById('again').onclick=function(){card();try{legionTrack('activate',{})}catch(e){}};
    function doShare(){
      var text='Prediction Pulse '+t+' '+score+' · '+shareUrl()+'\n재미 예측 · 실투자 아님';
      if(navigator.share)navigator.share({text:text,url:shareUrl()}).catch(function(){});
      else if(navigator.clipboard)navigator.clipboard.writeText(text);
      try{legionTrack('share_peak',{score:score})}catch(e){}
    }
    document.getElementById('share').onclick=doShare;
    document.getElementById('sharePeakBtn').onclick=doShare;
    try{legionTrack('share_peak_shown',{score:score})}catch(e){}
    try{legionTrack('money_pipe_shown',{app:'prediction'})}catch(e){}
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
