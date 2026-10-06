// "Find a time to meet": Google-Calendar-style week view, drawn in the site's colors.
// Real data comes from Google Calendar (Admin -> Weekly Calendar). Add ?preview to the URL to see sample events.
(function(){
var sec=document.getElementById('week');if(!sec)return;
var TZ='America/New_York',off=0,cfg=null,preview=/[?&]preview/.test(location.search),PX=48;
var $=function(s){return sec.querySelector(s);};
function ymd(d){return d.toLocaleDateString('en-CA',{timeZone:TZ});}
function utc(s){var p=s.split('-');return new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));}
function addDays(s,n){var d=utc(s);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function monday(s){return addDays(s,-((utc(s).getUTCDay()+6)%7));}
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function mins(iso){var p=new Date(iso).toLocaleTimeString('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:false}).split(':');return (+p[0]%24)*60+(+p[1]);}
function fmt(m){var h=Math.floor(m/60)%24,mm=m%60,ap=h<12?'am':'pm';h=h%12||12;return h+(mm?':'+('0'+mm).slice(-2):'')+ap;}
function hl(h){return h===0||h===24?'12 AM':h===12?'Noon':(h%12)+(h<12?' AM':' PM');}
function fail(){$('.gcal-inner').innerHTML='<p class="cal-none" style="padding:24px">The calendar could not be loaded right now.</p>';}
function lanes(ev){ev.sort(function(x,y){return x.a-y.a||y.b-x.b;});var le=[],cl=[],ce=0;
 ev.forEach(function(e){if(cl.length&&e.a>=ce){var n=le.length;cl.forEach(function(x){x.n=n;});cl=[];le=[];ce=0;}
  var l=0;while(le[l]>e.a)l++;le[l]=e.b;e.l=l;cl.push(e);ce=Math.max(ce,e.b);});
 var n=le.length;cl.forEach(function(x){x.n=n;});}
function draw(days,by,all){var today=ymd(new Date()),nowM=mins(new Date().toISOString()),lo=7*60,hi=21*60,anyAll=false;
 days.forEach(function(d){by[d].forEach(function(e){lo=Math.min(lo,Math.floor(e.a/60)*60);hi=Math.max(hi,Math.ceil(e.b/60)*60);});if(all[d].length)anyAll=true;});
 var rows=(hi-lo)/60,m0=utc(days[0]).toLocaleDateString('en-US',{timeZone:'UTC',month:'long',year:'numeric'}),m1=utc(days[6]).toLocaleDateString('en-US',{timeZone:'UTC',month:'long',year:'numeric'});
 $('.gcal-title').textContent=m0===m1?m0:m0.split(' ')[0].slice(0,3)+' – '+m1.slice(0,3)+' '+m1.split(' ')[1];
 var html='<div class="gc-row gc-head"><div></div>'+days.map(function(d){return '<div class="'+(d===today?'today':'')+'"><span>'+utc(d).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short'})+'</span><b class="dn">'+utc(d).getUTCDate()+'</b></div>';}).join('')+'</div>';
 if(anyAll)html+='<div class="gc-row gc-all"><div>all-day</div>'+days.map(function(d){return '<div>'+all[d].map(function(t){return '<div class="gev ad">'+esc(t)+'</div>';}).join('')+'</div>';}).join('')+'</div>';
 html+='<div class="gc-row gc-body" style="height:'+rows*PX+'px"><div class="gc-times">'+Array.apply(null,Array(rows-1)).map(function(_,i){return '<span style="top:'+(i+1)*PX+'px">'+hl(lo/60+i+1)+'</span>';}).join('')+'</div>'+
 days.map(function(d){var ev=by[d];lanes(ev);return '<div class="gc-col'+(d===today?' today':'')+'">'+ev.map(function(e){var h=Math.max((e.b-e.a)/60*PX-2,20);return '<div class="gev" style="top:'+(e.a-lo)/60*PX+'px;height:'+h+'px;left:calc('+e.l/e.n*100+'% + 2px);width:calc('+100/e.n+'% - 4px)"><b>'+esc(e.t)+'</b>'+(h>34?'<span>'+fmt(e.a)+' – '+fmt(e.b)+'</span>':'')+'</div>';}).join('')+(d===today&&nowM>=lo&&nowM<=hi?'<div class="gnow" style="top:'+(nowM-lo)/60*PX+'px"></div>':'')+'</div>';}).join('')+'</div>';
 $('.gcal-inner').innerHTML=html;}
var DEMO=[[0,9*60,10.5*60,'Class'],[1,14*60,16*60,'Machine shop shift'],[2,10*60,11*60,'Office hours'],[2,13*60,14*60,'Class'],[3,18*60,20*60,'SAE BAJA meeting'],[4,13*60,17*60,'Machine shop shift']];
function load(){var mon=addDays(monday(ymd(new Date())),off*7),days=[0,1,2,3,4,5,6].map(function(i){return addDays(mon,i);}),by={},all={};
 days.forEach(function(d){by[d]=[];all[d]=[];});
 if(!cfg){DEMO.forEach(function(e){by[days[e[0]]].push({t:e[3],a:e[1],b:e[2]});});all[days[5]].push('Competition');draw(days,by,all);return Promise.resolve();}
 var url='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(cfg.id)+'/events?singleEvents=true&orderBy=startTime&maxResults=250&timeZone='+encodeURIComponent(TZ)+'&timeMin='+utc(addDays(mon,-1)).toISOString()+'&timeMax='+utc(addDays(mon,8)).toISOString()+'&key='+encodeURIComponent(cfg.apiKey);
 return fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(j){
  (j.items||[]).forEach(function(e){if(e.status==='cancelled'||!e.start)return;var t=cfg.labels==='busy'?'Busy':(e.summary||'Busy');
   if(e.start.date){var d=e.start.date;while(d<e.end.date){if(all[d])all[d].push(t);d=addDays(d,1);}}
   else{var d2=ymd(new Date(e.start.dateTime));if(by[d2]){var a=mins(e.start.dateTime),b=mins(e.end.dateTime);if(ymd(new Date(e.end.dateTime))!==d2||b<=a)b=1440;by[d2].push({t:t,a:a,b:b});}}});
  draw(days,by,all);});}
(window.contentReady||fetch('content.json').then(function(r){return r.json();})).then(function(c){
 var k=c.calendar;cfg=k&&k.id&&k.apiKey?k:null;if(!cfg&&!preview)return;sec.hidden=false;
 var em=(c.contact||{}).email,rq=$('#req');if(em)rq.href='mailto:'+em+'?subject='+encodeURIComponent('Meeting request');else rq.hidden=true;
 if(!cfg)$('.cal-note').textContent='Preview with sample events. Add your Google key in Admin to show your real calendar.';
 sec.querySelectorAll('.cal-nav button').forEach(function(b){b.addEventListener('click',function(){off=b.dataset.d==='0'?0:off+(+b.dataset.d);load().catch(fail);});});
 load().catch(fail);});
})();
