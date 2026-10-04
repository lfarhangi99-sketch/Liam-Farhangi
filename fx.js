// Scroll animations: reveal on scroll, counting stats, sliding strip, progress bar, hide-on-scroll nav.
(function(){
// Edit these to change the stat numbers on the About page
var STATS=[{n:3.58,d:2,l:'GPA / 4.00'},{n:30,s:'+',l:'3D printers serviced'},{n:100,p:'$',s:'K',l:'Laser cutter deployed'},{n:3,l:'Active roles'}];
var body=document.body,nav=document.querySelector('nav');
var bar=document.createElement('div');bar.id='progress';body.appendChild(bar);
var last=0;
addEventListener('scroll',function(){var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
bar.style.transform='scaleX('+(h>0?y/h:0)+')';document.documentElement.style.setProperty('--sy',y);
if(nav){nav.classList.toggle('nav-hide',y>last&&y>140);}last=y;},{passive:true});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add('in');io.unobserve(el);
if(el.classList.contains('stat'))count(el.querySelector('.n'));
setTimeout(function(){el.classList.remove('rv','in');},1600+(parseFloat(el.style.getPropertyValue('--d'))||0)*1000);});},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
function count(el){var n=+el.dataset.n,d=+el.dataset.d||0,p=el.dataset.p||'',s=el.dataset.s||'',t0=performance.now();
(function f(t){var k=Math.min((t-t0)/1500,1),v=n*(1-Math.pow(1-k,3));el.textContent=p+v.toFixed(d)+s;if(k<1)requestAnimationFrame(f);})(t0);}
var SEL='.sheet-label,h2.head,.lede,.about-text p,.title-block,.coursework,.xp-item,.proj-card,.fcf,.contact-cell,.about-photo,.stat,.tag-row .tag,.fcf-body .tag';
function scan(){document.querySelectorAll(SEL).forEach(function(el){if(el.dataset.rv)return;el.dataset.rv=1;
var sib=Array.prototype.indexOf.call(el.parentNode.children,el);el.style.setProperty('--d',(el.classList.contains('tag')?Math.min(sib*.04,.5):Math.min(sib*.1,.5))+'s');
el.classList.add('rv');io.observe(el);});}
if(body.dataset.page==='about'){var cta=document.querySelector('.hero-cta');
if(cta){var st=document.createElement('div');st.className='stats';st.innerHTML=STATS.map(function(s){return '<div class="stat"><div class="n" data-n="'+s.n+'" data-d="'+(s.d||0)+'" data-p="'+(s.p||'')+'" data-s="'+(s.s||'')+'">'+(s.p||'')+'0'+(s.s||'')+'</div><div class="l">'+s.l+'</div></div>';}).join('');
var mq=document.createElement('div');mq.className='marquee';cta.after(st);st.after(mq);
fetch('content.json').then(function(r){return r.json();}).then(function(c){var t=[];(c.skills||[]).forEach(function(g){t=t.concat(g.tags||[]);});
var h=t.map(function(x){return '<span>'+x+'</span>';}).join('');mq.innerHTML='<div class="marquee-track">'+h+h+'</div>';}).catch(function(){});}}
scan();var m=document.querySelector('main'),tm;
if(m)new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(scan,40);}).observe(m,{childList:true,subtree:true});
})();
