// Site search: finds words and related subjects, then jumps to the place on the site.
(function(){
var list=document.querySelector('nav .nav-links');if(!list)return;
var LABEL={'index.html':'About','experience.html':'Experience','projects.html':'Projects','skills.html':'Skills','contact.html':'Contact'};
var SYN={cad:['solidworks','fusion','onshape','modeling'],modeling:['solidworks','fusion','cad'],weld:['welding','tig','mig','stick'],welding:['weld','tig','mig'],print:['3d printing','3d printer'],'3d':['3d printing','3d printer'],machine:['machining','mill','lathe','cnc'],machining:['mill','lathe','cnc','machine shop'],mill:['milling','cnc'],lathe:['turning','cnc'],code:['python','c++','arduino','matlab','programming'],programming:['python','c++','arduino','matlab'],teach:['teaching','lecture','labs'],teaching:['teaching assistant','lectures','labs'],ta:['teaching assistant'],research:['metamaterials','roton','vibrational'],car:['baja','vehicle'],baja:['sae','vehicle','racing'],boat:['autonomous','hull'],brake:['brakes','pedals'],laser:['laser cutter','fiber laser'],school:['stevens','university','education'],college:['stevens','university'],gpa:['3.582','dean'],grades:['gpa','dean'],intern:['internship','opportunities','relocate'],job:['opportunities','experience','relocate'],hire:['opportunities','contact','resume'],cv:['resume'],email:['contact','gmail'],phone:['contact','845'],meet:['calendar','week','schedule'],meeting:['calendar','week','schedule'],schedule:['calendar','week','meeting'],calendar:['week','schedule','meet'],time:['calendar','week'],move:['relocate','relocation'],relocate:['relocation','anywhere'],lead:['president','leadership'],leadership:['president','lead'],space:['aerospace','rocket'],aerospace:['rocket','flight'],rocket:['aerospace','model rockets'],scuba:['padi','certification'],hobby:['outside of school','hiking','running','squash'],sports:['squash','running','frisbee','cross-country']};
var E=[],ready=false,ov,inp,res,sel=-1,cur=[];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function add(p,a,t,x){E.push({p:p,a:a,t:t,x:x||''});}
function build(c){var a=c.about||{};
 add('index.html','about','About me',[a.bodyP1,a.school,a.degree,a.gpa].join(' '));
 (a.coursework||[]).forEach(function(t){add('index.html','about','Coursework: '+t,t);});
 (a.timeline||[]).forEach(function(t){add('index.html','timeline',t.title+' ('+t.date+')',t.text+' '+(t.tags||[]).join(' '));});
 (a.statements||[]).forEach(function(s){add('index.html','statements',s.head,s.text);});
 add('index.html','statements','Outside of school',(a.beyond||[]).join(' '));
 (c.experience||[]).forEach(function(x,i){add('experience.html','xp-'+i,x.role+' · '+x.org,(x.bullets||[]).join(' ')+' '+x.dates+' '+(x.group||''));});
 (c.projects||[]).forEach(function(p,i){add('projects.html','proj-'+i,p.title,(p.paragraphs||[]).join(' ')+' '+p.role+' '+(p.stack||''));});
 (c.skills||[]).forEach(function(g){(g.tags||[]).forEach(function(t){add('skills.html','tools',t+' ('+g.head+')',t+' '+g.head);});});
 var k=c.contact||{};
 add('contact.html','touch','Contact',[k.email,k.phone,k.linkedinLabel,k.location,'resume download'].join(' '));
 add('contact.html','week','Find a time to meet','calendar availability schedule meet meeting book time week free busy request');
 add('contact.html','relocation','Willing to relocate',(k.lede||'')+' relocate relocation move anywhere USA');
}
function has(h,v){return v.length<=2?new RegExp('\\b'+v.replace(/[^a-z0-9]/g,'')+'\\b').test(h):h.indexOf(v)>-1;}
function search(q){var toks=q.toLowerCase().split(/\s+/).filter(Boolean);if(!toks.length)return[];var out=[];
 E.forEach(function(e,idx){var hay=(e.t+' '+e.x).toLowerCase(),tl=e.t.toLowerCase(),score=0,hits=[],ok=true;
  for(var i=0;i<toks.length&&ok;i++){var vs=[toks[i]].concat(SYN[toks[i]]||[]),best=0,hit=null;
   vs.forEach(function(v,k){if(has(hay,v)){var sc=(has(tl,v)?6:2)-(k?1:0);if(sc>best){best=sc;hit=v;}}});
   if(!best)ok=false;else{score+=best;hits.push(hit);}}
  if(ok)out.push({e:e,s:score,h:hits,i:idx});});
 out.sort(function(a,b){return b.s-a.s||a.i-b.i;});return out.slice(0,8);}
function snip(e,hits){var x=e.x,low=x.toLowerCase(),p=-1;for(var i=0;i<hits.length&&p<0;i++)p=low.indexOf(hits[i]);
 if(p<0)return esc(x.slice(0,90));var s=Math.max(0,p-40),t=esc((s?'…':'')+x.slice(s,s+110)+(s+110<x.length?'…':''));
 hits.forEach(function(h){t=t.replace(new RegExp('('+h.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>');});return t;}
function render(){var q=inp.value.trim();cur=search(q);sel=cur.length?0:-1;
 if(!q){res.innerHTML='<li class="srch-empty">Try “welding”, “CAD”, “SAE BAJA”, “research”, or “meet”.</li>';return;}
 if(!cur.length){res.innerHTML='<li class="srch-empty">No matches. Try a simpler word.</li>';return;}
 res.innerHTML=cur.map(function(r,i){var href=r.e.p+'?q='+encodeURIComponent(r.h.join(' '))+(r.e.a?'#'+r.e.a:'');
  return '<li><a href="'+href+'" class="'+(i?'':'on')+'"><small>'+LABEL[r.e.p]+'</small><b>'+esc(r.e.t)+'</b><span>'+snip(r.e,r.h)+'</span></a></li>';}).join('');}
function move(d){var a=res.querySelectorAll('a');if(!a.length)return;a[sel]&&a[sel].classList.remove('on');sel=(sel+d+a.length)%a.length;a[sel].classList.add('on');a[sel].scrollIntoView({block:'nearest'});}
function open(){if(!ov)mk();ov.hidden=false;inp.value='';render();inp.focus();}
function close(){if(ov)ov.hidden=true;}
function mk(){ov=document.createElement('div');ov.className='srch';ov.hidden=true;
 ov.innerHTML='<div class="srch-box" role="dialog" aria-label="Search"><input type="search" placeholder="Search the site: skills, projects, experience…" aria-label="Search"><ul class="srch-res"></ul><div class="srch-hint">↑ ↓ to move · Enter to open · Esc to close</div></div>';
 document.body.appendChild(ov);inp=ov.querySelector('input');res=ov.querySelector('.srch-res');
 inp.addEventListener('input',render);
 ov.addEventListener('click',function(e){if(e.target===ov)close();});
 inp.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();move(1);}else if(e.key==='ArrowUp'){e.preventDefault();move(-1);}else if(e.key==='Enter'){var a=res.querySelectorAll('a')[sel];if(a)location.href=a.getAttribute('href');}});}
var li=document.createElement('li');li.innerHTML='<button class="nav-search" type="button" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span>Search</span></button>';
list.appendChild(li);li.firstChild.addEventListener('click',open);
document.addEventListener('keydown',function(e){if(e.key==='Escape')close();else if((e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')){e.preventDefault();open();}});
(window.contentReady||fetch('content.json').then(function(r){return r.json();})).then(function(c){build(c);if(ov&&!ov.hidden)render();});
})();
