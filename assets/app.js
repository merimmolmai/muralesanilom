/* Código de la web. No hace falta tocarlo para cambiar precios ni textos (eso está en config.js). */
function init(){
  const C = CONFIG, IMG = IMAGES;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const eur = n => new Intl.NumberFormat('es-ES', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(Math.round(n));
  const nf  = new Intl.NumberFormat('es-ES', {maximumFractionDigits:2});
  const L = C.limites;

  /* ---------- Enlaces de contacto ---------- */
  const c = C.contacto;
  const wa = msg => 'https://wa.me/' + c.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : '');
  const mailto = (subject, body) => 'mailto:' + c.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  const links = {
    whatsapp: wa('Hola María, me gustaría pedir presupuesto para un mural. Te paso fotos de la pared, su estado, las medidas exactas y el municipio:'),
    tel: 'tel:' + c.telefonoLink, mail: 'mailto:' + c.email,
    instagram: 'https://www.instagram.com/' + c.instagram,
    web: 'https://' + c.web, arte: 'https://' + c.webArte
  };
  $$('[data-link]').forEach(a => {
    a.href = links[a.dataset.link];
    if (a.dataset.link === 'arte' && !a.textContent) a.textContent = c.webArte;
  });
  const texts = {telefono:c.telefono, email:c.email, instagramTxt:'@' + c.instagram, web:c.web};
  $$('[data-text]').forEach(a => a.textContent = texts[a.dataset.text]);

  /* ---------- Menú y página activa ---------- */
  const nav = $('#nav'), menuBtn = $('.menu-btn');
  const pagina = document.body.dataset.page;
  $$('[data-nav]').forEach(a => { if (a.dataset.nav === pagina) a.setAttribute('aria-current', 'page'); });
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', e => {
    if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- Fotos ---------- */
  const alt = {}, titulosFoto = {};
  C.proyectos.forEach(p => p.fotos.forEach(f => {
    if (f.img) { alt[f.img] = f.alt; titulosFoto[f.img] = p.titulo + ' · ' + p.anio; }
  }));
  const enteras = new Set(C.fotosEnteras);
  function crearTile(key, texto){
    const fig = document.createElement('figure');
    fig.className = 'tile' + (enteras.has(key) ? ' contain' : '');
    fig.style.setProperty('--pos', C.encuadre[key] || '50% 50%');
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Ampliar foto: ' + (alt[key] || texto || ''));
    const im = document.createElement('img');
    im.src = IMG[key]; im.alt = alt[key] || texto || '';
    im.loading = 'lazy'; im.decoding = 'async';
    b.appendChild(im); fig.appendChild(b);
    return fig;
  }

  /* ---------- Foto ampliada ---------- */
  const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let lista = [], cur = 0, opener = null;
  function mostrar(i){
    cur = (i + lista.length) % lista.length;
    lbImg.src = lista[cur].src; lbImg.alt = lista[cur].alt; lbCap.textContent = lista[cur].cap;
  }
  function abrir(items, i, desde){
    lista = items; opener = desde; mostrar(i); lb.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  }
  function cerrar(){
    lb.hidden = true; document.documentElement.style.overflow = '';
    if (opener) opener.focus();
  }
  $('.lb-close', lb).addEventListener('click', cerrar);
  $('.lb-prev', lb).addEventListener('click', () => mostrar(cur - 1));
  $('.lb-next', lb).addEventListener('click', () => mostrar(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb) cerrar(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowLeft') mostrar(cur - 1);
    if (e.key === 'ArrowRight') mostrar(cur + 1);
  });

  /* ---------- Inicio: galería 5 x 2 ---------- */
  const homeGrid = $('#home-galeria');
  if (homeGrid) {
    const homeItems = C.galeriaInicio.map(k => ({src: IMG[k], alt: alt[k] || '', cap: titulosFoto[k] || ''}));
    C.galeriaInicio.forEach((k, i) => {
      const t = crearTile(k);
      $('button', t).addEventListener('click', e => abrir(homeItems, i, e.currentTarget));
      homeGrid.appendChild(t);
    });
  }

  /* ---------- Proyectos ---------- */
  const lp = $('#proyectos-lista');
  if (lp) {
    const todas = [], articulos = [];
    C.proyectos.forEach(p => {
      const art = document.createElement('article');
      art.className = 'proyecto';
      art.dataset.tipo = p.tipo;
      art.innerHTML = '<header class="proyecto-head"><h3></h3><p class="meta"><span class="lugar"></span><span class="tag"></span></p><p class="texto"></p></header><div class="rejilla"></div>';
      $('h3', art).textContent = p.titulo;
      $('.lugar', art).textContent = (p.lugar ? p.lugar + ' · ' : '') + p.anio;
      $('.tag', art).textContent = p.tipo === 'negocio' ? 'Negocio' : 'Particular';
      $('.texto', art).textContent = p.texto;
      if (p.destacados && p.destacados.length) {
        const d = document.createElement('div');
        d.className = 'destacados';
        d.innerHTML = '<h4>Murales destacados</h4><ul></ul>';
        p.destacados.forEach(t => { const li = document.createElement('li'); li.textContent = t; $('ul', d).appendChild(li); });
        $('.proyecto-head', art).appendChild(d);
      }
      const grid = $('.rejilla', art);
      p.fotos.forEach(f => {
        if (f.video) {
          const fig = document.createElement('figure');
          fig.className = 'tile video';
          const v = document.createElement('video');
          v.controls = true; v.muted = true; v.playsInline = true; v.preload = 'none';
          v.setAttribute('aria-label', f.alt);
          if (IMG[f.poster]) v.poster = IMG[f.poster];
          v.src = IMG[f.src];
          v.addEventListener('error', () => fig.remove());
          fig.appendChild(v); grid.appendChild(fig);
          return;
        }
        const item = {src: IMG[f.img], alt: f.alt, art, cap: p.titulo + (p.lugar ? ' · ' + p.lugar : '') + ' · ' + p.anio + (f.etiqueta ? ' · ' + f.etiqueta : '')};
        todas.push(item);
        const t = crearTile(f.img, f.alt);
        if (f.etiqueta) {
          const chip = document.createElement('span');
          chip.className = 'chip'; chip.textContent = f.etiqueta;
          t.appendChild(chip);
        }
        $('button', t).addEventListener('click', e => {
          const visibles = todas.filter(x => !x.art.hidden);
          abrir(visibles, visibles.indexOf(item), e.currentTarget);
        });
        grid.appendChild(t);
      });
      articulos.push(art);
      lp.appendChild(art);
    });
    $$('.filtros button').forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.f;
      $$('.filtros button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      articulos.forEach(a => { a.hidden = f !== 'todos' && a.dataset.tipo !== f; });
    }));
  }

  /* ---------- Contacto: formulario ---------- */
  const fc = $('#form-contacto');
  if (fc) {
    const mensajeContacto = () => {
      const n = $('#c-nombre').value.trim(), l = $('#c-lugar').value.trim(), m = $('#c-msg').value.trim();
      const partes = ['Hola María' + (n ? ', soy ' + n : '') + '.'];
      if (m) partes.push('Me gustaría pintar: ' + m);
      if (l) partes.push('La pared está en: ' + l + '.');
      partes.push('Te paso fotos de la pared, su estado y las medidas exactas:');
      return partes.join('\n');
    };
    const actualizar = () => {
      $('#c-wa').href = wa(mensajeContacto());
      $('#c-mail').href = mailto('Presupuesto de mural', mensajeContacto());
    };
    fc.addEventListener('input', actualizar);
    fc.addEventListener('submit', e => e.preventDefault());
    actualizar();
  }

  /* ---------- Calculadora ---------- */
  const form = $('#calc-form');
  if (form) {
    const estilos = C.estilosCalculadora;
    const S = {lugar:'exterior', tecnica:'pintura', estilo:'ilustrado', ancho:'3', alto:'2,5'};
    const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : NaN; };
    const nombreTec = {pintura:'Pintura', spray:'Graffiti (spray)'};

    const tarifa = (e, t) => {
      let m2 = 0, mat = 0, plantilla = false;
      for (const k of e.usa) {
        const p = C.precios[k][t];
        if (!p) return null;
        m2 += p.m2;
        if (p.mat == null) { mat += p.m2; plantilla = true; } else mat += p.mat;
      }
      return {m2, mat, plantilla};
    };

    const cont = $('#estilos');
    estilos.forEach(e => {
      const lab = document.createElement('label');
      lab.className = 'sq';
      lab.innerHTML = '<input type="radio" name="estilo"><span class="sq-body"><span class="sq-img"><img alt="" loading="lazy" decoding="async"></span><strong></strong><small></small></span>';
      $('input', lab).value = e.id;
      $('.sq-img', lab).style.setProperty('--pos', C.encuadre[e.ejemplo] || '50% 50%');
      $('img', lab).src = IMG[e.ejemplo];
      $('strong', lab).textContent = e.nombre;
      $('small', lab).textContent = e.desc;
      lab.dataset.id = e.id;
      cont.appendChild(lab);
    });

    const reglas = () => {
      let aviso = '';
      if (S.lugar === 'interior' && S.tecnica === 'spray') {
        S.tecnica = 'pintura';
        aviso = 'En interior se pinta siempre con pintura, así que he cambiado la técnica.';
      }
      const actual = estilos.find(x => x.id === S.estilo);
      if (!actual || !tarifa(actual, S.tecnica)) {
        const ok = estilos.find(x => tarifa(x, S.tecnica));
        S.estilo = ok.id;
        aviso = (aviso ? aviso + ' ' : '') + 'Ese estilo no se hace con esta técnica, así que he elegido otro.';
      }
      $('#notice').textContent = aviso;
    };

    const pintarControles = () => {
      $$('input[name=lugar]').forEach(r => r.checked = r.value === S.lugar);
      $$('input[name=tecnica]').forEach(r => {
        r.checked = r.value === S.tecnica;
        if (r.value === 'spray') r.disabled = S.lugar === 'interior';
      });
      $('#hint-tecnica').textContent = S.lugar === 'interior'
        ? 'En interior pinto siempre con pintura.'
        : 'El graffiti (spray) solo se usa en exteriores.';
      $$('.sq', cont).forEach(lab => {
        const e = estilos.find(x => x.id === lab.dataset.id);
        const t = tarifa(e, S.tecnica);
        const inp = $('input', lab);
        inp.checked = S.estilo === e.id;
        inp.disabled = !t;
        $('small', lab).textContent = t ? e.desc : 'Solo con pintura';
      });
    };

    const calcular = () => {
      const ancho = num(S.ancho), alto = num(S.alto);
      if (!(ancho > 0) || !(alto > 0)) return {ok:false, msg:'Escribe el ancho y el alto del mural en metros.'};
      if (alto > L.alturaMaxima) return {ok:false, msg:'Por ahora no hago murales de más de ' + L.alturaMaxima + ' m de altura desde el suelo. Escríbeme y vemos si se puede resolver de otra forma.'};
      const area = ancho * alto;
      const e = estilos.find(x => x.id === S.estilo);
      const t = tarifa(e, S.tecnica);
      let sin = t.m2 * area, con = t.mat * area;
      if (C.minimoMural > 0) { sin = Math.max(sin, C.minimoMural); con = Math.max(con, C.minimoMural); }
      return {ok:true, ancho, alto, area, e, t, sin, con};
    };

    const pintarResultado = () => {
      const r = calcular(), box = $('#resultado');
      $('#area-out').textContent = r.ok ? '= ' + nf.format(r.area) + ' m²' : '';
      if (!r.ok) {
        box.innerHTML = '<h3>Presupuesto orientativo</h3><p class="error">' + r.msg + '</p>' +
          '<div class="res-actions"><a class="btn" href="' + wa('Hola María, tengo una consulta sobre un mural.') + '" target="_blank" rel="noopener">Escribir por WhatsApp</a></div>';
        return;
      }
      const avisos = [];
      if (r.t.plantilla) avisos.push('El coste de la plantilla del logotipo se presupuesta aparte.');
      if (r.alto > L.alturaSinAndamio) avisos.push('Con más de ' + L.alturaSinAndamio + ' m de altura hace falta andamio, que se añade aparte.');
      const msg = [
        'Hola María, he usado la calculadora de tu web.',
        '• Lugar: ' + (S.lugar === 'interior' ? 'interior' : 'exterior'),
        '• Técnica: ' + nombreTec[S.tecnica],
        '• Estilo: ' + r.e.nombre,
        '• Medidas: ' + nf.format(r.ancho) + ' × ' + nf.format(r.alto) + ' m (' + nf.format(r.area) + ' m²)',
        'Presupuesto orientativo: ' + eur(r.sin) + ' sin materiales / ' + eur(r.con) + ' con materiales (IVA no incluido).',
        'Me gustaría un presupuesto cerrado. Te paso fotos de la pared, su estado, las medidas exactas y el municipio:'
      ].join('\n');
      box.innerHTML =
        '<h3>Presupuesto orientativo</h3>' +
        '<p class="sub">' + r.e.nombre + ' · ' + nombreTec[S.tecnica] + ' · ' + nf.format(r.area) + ' m²</p>' +
        '<div class="totales"><div><span>Sin materiales</span><strong>' + eur(r.sin) + '</strong></div>' +
        '<div><span>Con materiales</span><strong>' + eur(r.con) + '</strong></div></div>' +
        '<p class="iva">IVA no incluido. Cifra orientativa y no vinculante.</p>' +
        (avisos.length ? '<ul class="avisos">' + avisos.map(a => '<li>' + a + '</li>').join('') + '</ul>' : '') +
        '<div class="res-actions">' +
          '<a class="btn" href="' + wa(msg) + '" target="_blank" rel="noopener">Pedir presupuesto por WhatsApp</a>' +
          '<a class="btn btn-ghost" href="' + mailto('Presupuesto de mural', msg) + '">Enviar por correo</a>' +
        '</div>' +
        '<p class="fine">Para darte un presupuesto cerrado necesito fotos, estado de la pared, las medidas exactas y el municipio de realización.</p>';
    };

    form.addEventListener('change', e => {
      const n = e.target.name;
      if (n === 'lugar' || n === 'tecnica' || n === 'estilo') { S[n] = e.target.value; reglas(); pintarControles(); }
      pintarResultado();
    });
    form.addEventListener('input', e => {
      if (e.target.name === 'ancho' || e.target.name === 'alto') { S[e.target.name] = e.target.value; pintarResultado(); }
    });
    form.addEventListener('submit', e => e.preventDefault());
    reglas(); pintarControles(); pintarResultado();
  }

  /* Si se llega con un enlace a una sección (por ejemplo /#precio), se coloca ahora que la página ya está completa */
  if (location.hash.length > 1) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) t.scrollIntoView();
  }
}
init();
