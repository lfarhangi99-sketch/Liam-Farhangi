(function(){
  var STORAGE_KEY = 'lof_site_edits_v1';
  var NAV_KEY = 'lof_nav_config_v1';
  var PAGE = document.body.getAttribute('data-page-id') || 'page';

  var DEFAULT_NAV = [
    { id:'about', label:'About', href:'index.html', visible:true },
    { id:'experience', label:'Experience', href:'experience.html', visible:true },
    { id:'projects', label:'Projects', href:'projects.html', visible:true },
    { id:'skills', label:'Skills', href:'skills.html', visible:true },
    { id:'contact', label:'Contact', href:'contact.html', visible:true },
    { id:'custom1', label:'Custom Page 1', href:'custom1.html', visible:false },
    { id:'custom2', label:'Custom Page 2', href:'custom2.html', visible:false }
  ];

  function loadNav(){
    try{
      var saved = JSON.parse(localStorage.getItem(NAV_KEY));
      if(saved && saved.length) return saved;
    }catch(e){}
    return DEFAULT_NAV.slice();
  }
  function saveNav(nav){
    localStorage.setItem(NAV_KEY, JSON.stringify(nav));
    flashStatus('Saved');
  }

  function renderNav(){
    var ul = document.querySelector('.nav-links');
    if(!ul) return;
    var nav = loadNav();
    var currentFile = location.pathname.split('/').pop() || 'index.html';
    ul.innerHTML = '';
    nav.filter(function(item){ return item.visible; }).forEach(function(item){
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      if(item.href === currentFile) a.className = 'active';
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  function buildNavManager(){
    var panel = document.createElement('div');
    panel.id = 'nav-manager';
    panel.style.display = 'none';
    document.body.appendChild(panel);

    function redraw(){
      var nav = loadNav();
      var rows = nav.map(function(item, i){
        return '<div class="nav-row" data-i="'+i+'">' +
          '<input type="text" data-f="label" value="'+item.label.replace(/"/g,'&quot;')+'">' +
          '<button data-a="up" title="Move up">\u2191</button>' +
          '<button data-a="down" title="Move down">\u2193</button>' +
          '<button data-a="toggle">'+(item.visible ? 'Hide' : 'Show')+'</button>' +
          '</div>';
      }).join('');
      panel.innerHTML =
        '<div class="nav-manager-head">Manage tabs <button id="nav-manager-close">\u00d7</button></div>' +
        '<div class="nav-manager-body">' + rows + '</div>' +
        '<div class="nav-manager-hint">Hidden pages (Custom Page 1/2) are blank pages you can fill in with text and images once shown.</div>';

      panel.querySelectorAll('input[data-f="label"]').forEach(function(inp){
        inp.addEventListener('input', function(){
          var i = Number(inp.closest('.nav-row').getAttribute('data-i'));
          var nav = loadNav();
          nav[i].label = inp.value;
          saveNav(nav);
          renderNav();
        });
      });
      panel.querySelectorAll('[data-a="up"]').forEach(function(btn){
        btn.addEventListener('click', function(){
          var i = Number(btn.closest('.nav-row').getAttribute('data-i'));
          if(i === 0) return;
          var nav = loadNav();
          var tmp = nav[i-1]; nav[i-1] = nav[i]; nav[i] = tmp;
          saveNav(nav); renderNav(); redraw();
        });
      });
      panel.querySelectorAll('[data-a="down"]').forEach(function(btn){
        btn.addEventListener('click', function(){
          var i = Number(btn.closest('.nav-row').getAttribute('data-i'));
          var nav = loadNav();
          if(i === nav.length - 1) return;
          var tmp = nav[i+1]; nav[i+1] = nav[i]; nav[i] = tmp;
          saveNav(nav); renderNav(); redraw();
        });
      });
      panel.querySelectorAll('[data-a="toggle"]').forEach(function(btn){
        btn.addEventListener('click', function(){
          var i = Number(btn.closest('.nav-row').getAttribute('data-i'));
          var nav = loadNav();
          nav[i].visible = !nav[i].visible;
          saveNav(nav); renderNav(); redraw();
        });
      });
      panel.querySelector('#nav-manager-close').addEventListener('click', function(){
        panel.style.display = 'none';
      });
    }
    redraw();
    panel._redraw = redraw;
    return panel;
  }

  function loadAll(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function saveAll(data){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    flashStatus('Saved');
  }
  function getPageData(){
    var all = loadAll();
    if(!all[PAGE]) all[PAGE] = { texts:{}, blocks:{}, removed:[], added:{} };
    return all[PAGE];
  }
  function setPageData(pd){
    var all = loadAll();
    all[PAGE] = pd;
    saveAll(all);
  }
  function flashStatus(msg){
    var s = document.getElementById('edit-status');
    if(s){ s.textContent = msg; setTimeout(function(){ s.textContent=''; }, 1200); }
  }

  var uid = 0;
  function newId(prefix){ uid++; return prefix + '-' + Date.now() + '-' + uid; }

  // ---------- Apply saved edits on load ----------
  function applyEdits(){
    var pd = getPageData();
    Object.keys(pd.texts || {}).forEach(function(id){
      var el = document.querySelector('[data-edit-text="'+id+'"]');
      if(el) el.innerHTML = pd.texts[id];
    });
    (pd.removed || []).forEach(function(id){
      var el = document.querySelector('[data-block-id="'+id+'"]');
      if(el) el.classList.add('removed');
    });
    Object.keys(pd.blocks || {}).forEach(function(id){
      var el = document.querySelector('[data-block-id="'+id+'"]');
      if(el) applyBlockStyle(el, pd.blocks[id]);
    });
    Object.keys(pd.added || {}).forEach(function(zoneId){
      var zone = document.querySelector('[data-edit-zone="'+zoneId+'"] .zone-items');
      if(!zone) return;
      pd.added[zoneId].forEach(function(block){
        var el = renderBlock(block);
        zone.appendChild(el);
        if(pd.blocks[block.id]) applyBlockStyle(el, pd.blocks[block.id]);
      });
    });
  }

  function applyBlockStyle(el, style){
    if(style.width) el.style.width = style.width + '%';
    var x = style.x || 0, y = style.y || 0;
    el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }

  function renderBlock(block){
    var el = document.createElement('div');
    el.className = 'edit-block is-added';
    el.setAttribute('data-block-id', block.id);
    if(block.type === 'image'){
      el.className += ' is-image';
      var img = document.createElement('img');
      img.src = block.src;
      el.appendChild(img);
    } else {
      el.innerHTML = '<p data-edit-text="'+block.id+'-t" style="color:var(--paper-dim);font-size:15px;">'+(block.text||'Double-click to edit this text.')+'</p>';
    }
    return el;
  }

  // ---------- Text editing ----------
  function wireTextEditing(){
    document.querySelectorAll('[data-edit-text]').forEach(function(el){
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('blur', function(){
        var pd = getPageData();
        pd.texts[el.getAttribute('data-edit-text')] = el.innerHTML;
        setPageData(pd);
      });
    });
  }

  // ---------- Block controls (size / position / remove) ----------
  function wireBlocks(){
    document.querySelectorAll('.edit-block').forEach(function(el){
      if(el.querySelector('.block-controls')) return;
      var id = el.getAttribute('data-block-id');
      if(!id){ id = newId('block'); el.setAttribute('data-block-id', id); }

      var editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = '\u2699';
      editBtn.title = 'Adjust this block';
      editBtn.addEventListener('click', function(ev){
        ev.stopPropagation();
        document.querySelectorAll('.edit-block.active').forEach(function(b){ if(b!==el) b.classList.remove('active'); });
        el.classList.toggle('active');
      });
      el.appendChild(editBtn);

      var panel = document.createElement('div');
      panel.className = 'block-controls';
      panel.innerHTML =
        '<label>Size <input type="range" min="20" max="100" value="100" data-k="width"></label>' +
        '<label>Move X <input type="range" min="-150" max="150" value="0" data-k="x"></label>' +
        '<label>Move Y <input type="range" min="-150" max="150" value="0" data-k="y"></label>' +
        '<div class="row"><button data-act="reset">Reset</button><button class="danger" data-act="remove">Remove</button></div>';
      el.appendChild(panel);

      panel.querySelectorAll('input[type=range]').forEach(function(inp){
        inp.addEventListener('input', function(){
          var pd = getPageData();
          var s = pd.blocks[id] || { width:100, x:0, y:0 };
          s[inp.getAttribute('data-k')] = Number(inp.value);
          pd.blocks[id] = s;
          applyBlockStyle(el, s);
          setPageData(pd);
        });
      });

      panel.querySelector('[data-act="remove"]').addEventListener('click', function(){
        el.classList.add('removed');
        var pd = getPageData();
        if(pd.removed.indexOf(id) === -1) pd.removed.push(id);
        setPageData(pd);
      });
      panel.querySelector('[data-act="reset"]').addEventListener('click', function(){
        var pd = getPageData();
        delete pd.blocks[id];
        el.style.width = '';
        el.style.transform = '';
        setPageData(pd);
      });
    });
  }

  // ---------- Zone add buttons ----------
  function wireZones(){
    document.querySelectorAll('[data-edit-zone]').forEach(function(zone){
      var zoneId = zone.getAttribute('data-edit-zone');
      if(!zone.querySelector('.zone-items')){
        var wrap = document.createElement('div');
        wrap.className = 'zone-items';
        while(zone.firstChild && !zone.firstChild.classList){ zone.removeChild(zone.firstChild); }
        Array.prototype.slice.call(zone.children).forEach(function(child){
          if(!child.classList.contains('zone-add')) wrap.appendChild(child);
        });
        zone.insertBefore(wrap, zone.firstChild);
      }
      if(zone.querySelector('.zone-add')) return;
      var bar = document.createElement('div');
      bar.className = 'zone-add';
      bar.innerHTML =
        '<button data-add="text">+ Add text block</button>' +
        '<button data-add="image">+ Add image</button>' +
        '<input type="file" accept="image/*" style="display:none">';
      zone.appendChild(bar);

      var fileInput = bar.querySelector('input[type=file]');
      bar.querySelector('[data-add="text"]').addEventListener('click', function(){
        addBlock(zoneId, { id:newId('txt'), type:'text', text:'Double-click to edit this text.' });
      });
      bar.querySelector('[data-add="image"]').addEventListener('click', function(){ fileInput.click(); });
      fileInput.addEventListener('change', function(){
        var f = fileInput.files[0];
        if(!f) return;
        var reader = new FileReader();
        reader.onload = function(){
          addBlock(zoneId, { id:newId('img'), type:'image', src:reader.result });
        };
        reader.readAsDataURL(f);
      });
    });
  }

  function addBlock(zoneId, block){
    var pd = getPageData();
    if(!pd.added[zoneId]) pd.added[zoneId] = [];
    pd.added[zoneId].push(block);
    setPageData(pd);
    var zone = document.querySelector('[data-edit-zone="'+zoneId+'"] .zone-items');
    var el = renderBlock(block);
    zone.appendChild(el);
    wireBlocks();
    wireTextEditing();
  }

  // ---------- Toggle + toolbar ----------
  function buildToolbar(){
    var toggle = document.createElement('button');
    toggle.id = 'edit-toggle';
    toggle.textContent = 'Edit page';
    document.body.appendChild(toggle);

    var bar = document.createElement('div');
    bar.id = 'edit-bar';
    bar.innerHTML =
      '<button id="edit-manage-tabs">Manage tabs</button>' +
      '<button id="edit-export">Export backup</button>' +
      '<button id="edit-import">Import backup</button>' +
      '<input type="file" id="edit-import-file" accept="application/json">' +
      '<button id="edit-reset-page">Reset this page</button>' +
      '<span class="status" id="edit-status"></span>';
    document.body.appendChild(bar);

    var navPanel = buildNavManager();
    document.getElementById('edit-manage-tabs').addEventListener('click', function(){
      navPanel.style.display = navPanel.style.display === 'none' ? 'block' : 'none';
      if(navPanel._redraw) navPanel._redraw();
    });

    toggle.addEventListener('click', function(){
      document.body.classList.toggle('edit-mode');
      toggle.classList.toggle('on');
      toggle.textContent = document.body.classList.contains('edit-mode') ? 'Done editing' : 'Edit page';
    });

    document.getElementById('edit-export').addEventListener('click', function(){
      var blob = new Blob([JSON.stringify(loadAll(), null, 2)], {type:'application/json'});
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'liam-site-backup.json';
      a.click();
    });
    document.getElementById('edit-import').addEventListener('click', function(){
      document.getElementById('edit-import-file').click();
    });
    document.getElementById('edit-import-file').addEventListener('change', function(e){
      var f = e.target.files[0];
      if(!f) return;
      var reader = new FileReader();
      reader.onload = function(){
        try{
          var data = JSON.parse(reader.result);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          location.reload();
        }catch(err){ flashStatus('Invalid file'); }
      };
      reader.readAsText(f);
    });
    document.getElementById('edit-reset-page').addEventListener('click', function(){
      var all = loadAll();
      delete all[PAGE];
      saveAll(all);
      location.reload();
    });

    document.addEventListener('click', function(e){
      if(!e.target.closest('.edit-block')){
        document.querySelectorAll('.edit-block.active').forEach(function(b){ b.classList.remove('active'); });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderNav();
    buildToolbar();
    applyEdits();
    wireZones();
    wireTextEditing();
    wireBlocks();
  });
})();
