
(function(){
  var topics=['시장 분위기','팀 생산성','운동 지속','콘텐츠 반응','운세 톤'];
  var root=document.getElementById('app');
  function card(){
    var t=topics[Math.floor(Math.random()*topics.length)];
    var score=40+Math.floor(Math.random()*55);
    var tone=score>75?'강한 모멘텀':score>55?'중립 상승':'관망';
    root.innerHTML='<div class="card"><div class="chip">가상 엔터</div><h2 style="margin:10px 0;color:var(--gold)">'+t+'</h2><div style="font-size:42px;font-weight:800">'+score+'</div><p>'+tone+'</p><p class="sub">재미 예측 · 실투자/실결정 근거 아님</p><button id="again" style="margin-top:12px">다시 뽑기</button> <button class="sec" id="share">공유 텍스트</button></div>';
    document.getElementById('again').onclick=function(){card();try{legionTrack('activate',{})}catch(e){}};
    document.getElementById('share').onclick=function(){
      var text='Prediction Pulse '+t+' '+score+' · https://hosuman08-netizen.github.io/prediction-pulse/';
      if(navigator.share)navigator.share({text:text}).catch(function(){});
      else if(navigator.clipboard)navigator.clipboard.writeText(text);
      try{legionTrack('share_peak',{})}catch(e){}
    };
  }
  try{legionTrack('session_start',{})}catch(e){}
  card();
})();
