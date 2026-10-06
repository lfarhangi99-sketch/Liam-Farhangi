// "My schedule this week": Google-Calendar-style week view of my busy times, drawn in the site's colors.
// Data comes from schedule.json (busy blocks only, no event names), refreshed automatically by the GitHub Action.
(function(){
var sec=document.getElementById('week');if(!sec)return;
var TZ='America/New_York',PX=48,$=function(s){return sec.querySelector(s);};
function ymd(d){return d.toLocaleDateString('en-CA',{timeZone:TZ});}
function utc(s){var p=s.split('-');return new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));}
function addDays(s,n){var d=utc(s);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function monday(s){return addDays(s,-((utc(s).getUTCDay()+6)%7));}
function mins(iso){var p=new Date(iso).toLocaleTimeString('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:false}).split(':');return (+p[0]%24)*60+(+p[1]);}
function fmt(m){var h=Math.floor(m/60)%24,mm=m%60,ap=h<12?'am':'pm';h=h%12||12;return h+(mm?':'+('0'+mm).slice(-2):'')+ap;}
function hl(h){return h===12?'Noon':(h%12||12)+(h<12?' AM':' PM');}
function fail(){$('.gcal-inner').innerHTML='<p class="cal-none" style="padding:24px">The schedule is not available right now.</p>';}
function draw(days,by,all){var today=ymd(new Date()),nowM=mins(new Date().toISOString()),lo=7*60,hi=21*60,anyAll=false;
 days.forEach(function(d){by[d].forEach(function(e){lo=Math.min(lo,Math.floor(e.a/60)*60);hi=Math.max(hi,Math.ceil(e.b/60)*60);});if(all[d])anyAll=true;});
 var rows=(hi-lo)/60,u=function(d,o){return utc(d).toLocaleDateString('en-US',Object.assign({timeZone:'UTC'},o));};
 $('.gcal-title').textContent='Week of '+u(days[0],{month:'long',day:'numeric'})+' – '+u(days[6],{month:'long',day:'numeric'});
 var html='<div class="gc-row gc-head"><div></div>'+days.map(function(d){return '<div class="'+(d===today?'today':'')+'"><span>'+u(d,{weekday:'short'})+'</span><b class="dn">'+utc(d).getUTCDate()+'</b></div>';}).join('')+'</div>';
 if(anyAll)html+='<div class="gc-row gc-all"><div>all-day</div>'+days.map(function(d){return '<div>'+(all[d]?'<div class="gev ad">Busy</div>':'')+'</div>';}).join('')+'</div>';
 html+='<div class="gc-row gc-body" style="height:'+rows*PX+'px"><div class="gc-times">'+Array.apply(null,Array(rows-1)).map(function(_,i){return '<span style="top:'+(i+1)*PX+'px">'+hl(lo/60+i+1)+'</span>';}).join('')+'</div>'+
 days.map(function(d){return '<div class="gc-col'+(d===today?' today':'')+'">'+by[d].map(function(e){var h=Math.max((e.b-e.a)/60*PX-2,20);return '<div class="gev" style="top:'+(e.a-lo)/60*PX+'px;height:'+h+'px;left:2px;right:2px"><b>Busy</b>'+(h>34?'<span>'+fmt(e.a)+' – '+fmt(e.b)+'</span>':'')+'</div>';}).join('')+(d===today&&nowM>=lo&&nowM<=hi?'<div class="gnow" style="top:'+(nowM-lo)/60*PX+'px"></div>':'')+'</div>';}).join('')+'</div>';
 $('.gcal-inner').innerHTML=html;}
fetch('schedule.json?v='+Math.floor(Date.now()/300000)).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(j){
 var mon=monday(ymd(new Date())),days=[0,1,2,3,4,5,6].map(function(i){return addDays(mon,i);}),by={},all={};days.forEach(function(d){by[d]=[];});
 (j.busy||[]).forEach(function(b){var ds=ymd(new Date(b.s)),de=ymd(new Date(b.e)),a=mins(b.s),z=mins(b.e);
  if(ds===de){if(by[ds]&&z>a)by[ds].push({a:a,b:z});}
  else{if(by[ds])by[ds].push({a:a,b:1440});for(var d=addDays(ds,1);d<de;d=addDays(d,1))if(by[d])by[d].push({a:0,b:1440});if(by[de]&&z>0)by[de].push({a:0,b:z});}});
 (j.allday||[]).forEach(function(e){for(var d=e.s;d<e.e;d=addDays(d,1))if(by[d])all[d]=1;});
 draw(days,by,all);
 if(j.updated)$('.cal-note').textContent='Times shown in Eastern Time. Last updated '+new Date(j.updated).toLocaleString('en-US',{timeZone:TZ,month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET.';
}).catch(fail);
})();
