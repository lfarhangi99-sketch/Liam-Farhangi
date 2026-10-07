// Scroll effects: reveal on scroll, counting stats, sliding strip, progress bar, hide-on-scroll nav, mobile menu.
(function(){
// Edit these to change the stat numbers on the About page
var STATS=[{n:3.58,d:2,l:'GPA / 4.00'},{t:'Junior',l:'Mechanical Engineering'},{n:3,l:'Active roles'}];
var hn=document.querySelector('h1.name'),body=document.body,nav=document.querySelector('nav'),root=document.documentElement;
var bar=document.createElement('div');bar.id='progress';body.appendChild(bar);
var dd=nav&&nav.querySelector('.has-sub');
if(dd){var tr=dd.querySelector('.menu-trigger'),shut=function(){dd.classList.remove('open');tr.setAttribute('aria-expanded','false');};
tr.addEventListener('click',function(e){e.stopPropagation();var op=dd.classList.toggle('open');tr.setAttribute('aria-expanded',op);});
dd.addEventListener('click',function(e){if(e.target.closest('.sub a'))shut();});
document.addEventListener('click',function(e){if(!dd.contains(e.target))shut();});}
var last=0,tick=false;
function onScroll(){tick=false;var y=scrollY,h=root.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?y/h:0)+')';if(hn&&y<1100)hn.style.translate='0 '+(-y*.08)+'px';
if(nav&&!nav.querySelector('.has-sub.open'))nav.classList.toggle('nav-hide',y>last&&y>140);last=y;}
addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll);}},{passive:true});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add('in');io.unobserve(el);
if(el.classList.contains('stat'))count(el.querySelector('.n'));
setTimeout(function(){el.classList.remove('rv','in');},1600+(parseFloat(el.style.getPropertyValue('--d'))||0)*1000);});},{threshold:0,rootMargin:'0px'});
function count(el){if(!el.dataset.n)return;var n=+el.dataset.n,d=+el.dataset.d||0,p=el.dataset.p||'',s=el.dataset.s||'',t0=performance.now();
(function f(t){var k=Math.min((t-t0)/1500,1),v=n*(1-Math.pow(1-k,3));el.textContent=p+v.toFixed(d)+s;if(k<1)requestAnimationFrame(f);})(t0);}
var SEL='.sheet-label,h2.head,.lede,.about-text p,.title-block,.coursework,.xp-item,.proj-card,.fcf,.contact-cell,.about-photo,.stat,.tl-item,.fcf-text,.tag-row .tag';
function scan(){document.querySelectorAll(SEL).forEach(function(el){if(el.dataset.rv)return;el.dataset.rv=1;
var sib=Array.prototype.indexOf.call(el.parentNode.children,el);el.style.setProperty('--d',(el.classList.contains('tag')?Math.min(sib*.04,.5):Math.min(sib*.1,.5))+'s');
el.classList.add('rv');io.observe(el);});}
if(body.dataset.page==='about'){var cta=document.querySelector('.hero-cta');
if(cta){var st=document.createElement('div');st.className='stats';st.innerHTML=STATS.map(function(s){var n=s.t?'<div class="n">'+s.t+'</div>':'<div class="n" data-n="'+s.n+'" data-d="'+(s.d||0)+'" data-p="'+(s.p||'')+'" data-s="'+(s.s||'')+'">'+(s.p||'')+'0'+(s.s||'')+'</div>';return '<div class="stat">'+n+'<div class="l">'+s.l+'</div></div>';}).join('');
cta.after(st);}}
scan();var m=document.querySelector('main'),tm;
if(m)new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(scan,40);}).observe(m,{childList:true,subtree:true});
})();
