// Weekly calendar block (Google Calendar API, styled to match the site).
// Turned on from the Admin page: Weekly Calendar panel -> Calendar ID + API key.
(function(){
var sec=document.getElementById('week');if(!sec)return;
var TZ='America/New_York',off=0,cfg=null;
function ymd(d){return d.toLocaleDateString('en-CA',{timeZone:TZ});}
function addDays(s,n){var p=s.split('-'),d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]+n));return d.toISOString().slice(0,10);}
function monday(s){var p=s.split('-'),d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2])),w=(d.getUTCDay()+6)%7;return addDays(s,-w);}
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function utc(s){var p=s.split('-');return new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));}
function label(s){return utc(s).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric'});}
function dow(s){return utc(s).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short'});}
function tm(iso){return new Date(iso).toLocaleTimeString('en-US',{timeZone:TZ,hour:'numeric',minute:'2-digit'}).replace(':00','').replace(' ','').toLowerCase();}
function fail(){sec.querySelector('.cal-grid').innerHTML='<p class="cal-none" style="grid-column:1/-1">The calendar could not be loaded right now.</p>';}
function load(){
 var mon=addDays(monday(ymd(new Date())),off*7),days=[0,1,2,3,4,5,6].map(function(i){return addDays(mon,i);});
 var min=utc(addDays(mon,-1)),max=utc(addDays(mon,8));
 var url='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(cfg.id)+'/events?singleEvents=true&orderBy=startTime&maxResults=250&timeZone='+encodeURIComponent(TZ)+'&timeMin='+min.toISOString()+'&timeMax='+max.toISOString()+'&key='+encodeURIComponent(cfg.apiKey);
 return fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(j){
  var by={};days.forEach(function(d){by[d]=[];});
  (j.items||[]).forEach(function(e){if(e.status==='cancelled'||!e.start)return;var t=cfg.labels==='busy'?'Busy':(e.summary||'Busy');
   if(e.start.date){var d=e.start.date;while(d<e.end.date){if(by[d])by[d].push({t:t,all:1});d=addDays(d,1);}}
   else{var d2=ymd(new Date(e.start.dateTime));if(by[d2])by[d2].push({t:t,s:e.start.dateTime,e:e.end.dateTime});}});
  var today=ymd(new Date());
  sec.querySelector('.cal-range').textContent=label(days[0])+' – '+label(days[6]);
  sec.querySelector('.cal-grid').innerHTML=days.map(function(d){var ev=by[d];return '<div class="cal-day'+(d===today?' today':'')+'"><div class="cal-dh"><b>'+dow(d)+'</b><span>'+label(d)+'</span></div>'+(ev.length?ev.map(function(e){return '<div class="cal-ev"><span>'+(e.all?'All day':tm(e.s)+' – '+tm(e.e))+'</span>'+esc(e.t)+'</div>';}).join(''):'<div class="cal-none">Free</div>')+'</div>';}).join('');
 });
}
(window.contentReady||fetch('content.json').then(function(r){return r.json();})).then(function(c){
 cfg=c.calendar;if(!cfg||!cfg.id||!cfg.apiKey)return;sec.hidden=false;
 sec.querySelectorAll('.cal-nav button').forEach(function(b){b.addEventListener('click',function(){off=b.dataset.d==='0'?0:off+(+b.dataset.d);load().catch(fail);});});
 load().catch(fail);
});
})();
