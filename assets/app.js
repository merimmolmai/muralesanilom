/* Código de la web. No hace falta tocarlo para cambiar precios ni textos (eso está en config.js). */
function init(){
  const C = CONFIG, IMG = IMAGES;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

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

  /* ---------- Vídeo de portada ---------- */
  const heroVideo = $('.hero-img video');
  if (heroVideo && matchMedia('(prefers-reduced-motion: reduce)').matches) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }

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

  /* Si se llega con un enlace a una sección (por ejemplo /#precio), se coloca ahora que la página ya está completa */
  if (location.hash.length > 1) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) t.scrollIntoView();
  }
}
init();
