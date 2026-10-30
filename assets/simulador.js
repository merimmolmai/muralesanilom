/* Simulador de murales y presupuesto. Los precios, estilos y murales están en config.js. */
function initSimulador(){
  const root = document.getElementById('simulador');
  if (!root) return;
  const C = CONFIG, IMG = IMAGES, L = C.limites;
  const $  = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const eur = n => new Intl.NumberFormat('es-ES', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(Math.round(n));
  const nf  = new Intl.NumberFormat('es-ES', {maximumFractionDigits:2});
  const m   = n => nf.format(n) + ' m';
  const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : NaN; };
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const round2 = v => Math.round(v * 100) / 100;
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = C.contacto;
  const wa = msg => 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(msg);
  const mailto = (subject, body) => 'mailto:' + c.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  const nombreTec = {pintura:'Pintura', spray:'Graffiti (spray)'};
  const estilos = C.estilosCalculadora;

  const PR = C.presupuesto;
  /* Precio por m² sin materiales de un estilo con una técnica (null si no se hace) */
  const tarifa = (e, t) => {
    let m2 = 0;
    for (const k of e.usa) {
      const p = C.precios[k][t];
      if (p == null) return null;
      m2 += p;
    }
    return m2;
  };

  /* ---------- Escenas (todas las medidas en metros) ---------- */
  const PERSONA_PROP = 208 / 640;   // ancho / alto de persona.webp
  const sp = C.simulador;

  /* Persiana (local.webp, 1024 × 1024). La persiana va de x 113 a 912 y de y 214 a 850.
     Si el mural es más grande, la persiana crece: los bordes se quedan y el centro se repite. */
  const P = {ancho: sp.persiana.ancho, alto: sp.persiana.alto};
  const pkx = 799 / P.ancho, pky = 636 / P.alto;
  const borde = {l: 113 / pkx, r: 112 / pkx, t: 214 / pky, b: 174 / pky};
  const persiana = (w, h) => {
    const W = borde.l + w + borde.r, H = borde.t + h + borde.b;
    return {
      W, H, pared: {x: borde.l, y: borde.t, w, h},
      persona: {x: borde.l + w - .55, suelo: borde.t + h}
    };
  };

  /* Escenas hechas con una foto: medidas de la foto en píxeles, dónde está la pared y cuánto mide de verdad.
     Lo que está delante de la pared se vuelve a dibujar encima del mural: con polígonos sobre la propia foto
     y con recortes (plantas, árboles...) que ya tienen el fondo transparente. */
  const FOTOS = {
    interior: {   // interior.webp: la pared va de x 82 a 962 y de y 116 a 850
      img: IMG.sim_interior, w: 1024, h: 1020, pared: [82, 116, 962, 850], ancho: sp.interior.ancho, alto: sp.interior.alto, persona: [870, 850],
      poligonos: [
        '133,735 137,720 150,713 200,713 200,668 320,663 800,663 830,668 830,713 878,713 890,722 893,735 893,1020 133,1020',
        '900,512 1019,512 1019,587 975,587 992,850 920,850 938,587 900,587',
        '958,680 1022,680 1022,1020 895,1020 895,735 958,735',
        '36,728 138,728 138,1020 36,1020',
        '0,760 45,760 52,790 160,785 160,1020 0,1020',
        '865,815 1024,800 1024,1020 865,1020',
        '318,835 706,835 706,1020 318,1020'
      ],
      recortes: [{img: IMG.sim_interior_planta, x: 0, y: 380, w: 230, h: 400}]
    },
    exterior: {   // pared-exterior.webp: la pared va de x 160 a 1024 y de y 0 a 960 (la puerta de 2,2 m sirve de medida)
      img: IMG.sim_exterior, w: 1024, h: 1236, pared: [160, 0, 1024, 960], ancho: sp.exterior.ancho, alto: sp.exterior.alto, persona: [250, 1020],
      poligonos: [],
      recortes: [{img: IMG.sim_exterior_arbol, x: 840, y: 0, w: 184, h: 600}, {img: IMG.sim_exterior_setos, x: 160, y: 820, w: 864, h: 220}]
    },
    cristal: {    // cristal.svg: el cristal del escaparate va de x 104 a 736 y de y 194 a 616; los reflejos van por delante
      img: IMG.sim_cristal, w: 1024, h: 760, pared: [104, 194, 736, 616], ancho: sp.cristal.ancho, alto: sp.cristal.alto, persona: [880, 700],
      poligonos: [],
      recortes: [{img: IMG.sim_cristal_reflejo, x: 104, y: 194, w: 632, h: 422}]
    }
  };
  const fotoGeo = f => {
    const kx = (f.pared[2] - f.pared[0]) / f.ancho, ky = (f.pared[3] - f.pared[1]) / f.alto;
    return {W: f.w / kx, H: f.h / ky, pared: {x: f.pared[0] / kx, y: f.pared[1] / ky, w: f.ancho, h: f.alto}, persona: {x: f.persona[0] / kx, suelo: f.persona[1] / ky}};
  };

  const ESCENAS = {
    /* ajuste: 'cubrir' = el mural llena el hueco (persiana); 'entero' = el mural se ve completo, con un fondo
       pintado alrededor y los bordes difuminados, sea cual sea la proporción del hueco */
    persiana: {nombre: 'Persiana de local', lugar: 'exterior', img: IMG.sim_local, tamano: [P.ancho, P.alto], crece: true, ajuste: 'cubrir',
      tex: 'grayscale(1) contrast(1.7) brightness(1.3)', texOp: .55},
    exterior: {nombre: 'Pared exterior', lugar: 'exterior', img: IMG.sim_exterior, foto: FOTOS.exterior, tamano: [3, 2], centro: [2.1, 3.15], ajuste: 'entero',
      tex: 'grayscale(1) contrast(1.2) brightness(1.45)', texOp: .55},
    interior: {nombre: 'Pared de interior', lugar: 'interior', img: IMG.sim_interior, foto: FOTOS.interior, tamano: [1.6, 2.2], centro: [sp.interior.ancho / 2, 1.3], ajuste: 'entero',
      tex: 'grayscale(1) contrast(1.15) brightness(1.55)', texOp: .5},
    cristal: {nombre: 'Cristales', lugar: 'cristal', img: IMG.sim_cristal, foto: FOTOS.cristal, tamano: [2, 1.5], centro: [sp.cristal.ancho / 2, sp.cristal.alto / 2], ajuste: 'entero',
      tex: 'grayscale(1) brightness(2)', texOp: .1}
  };
  const nombreLugar = {exterior: 'Exterior', interior: 'Interior', cristal: 'Sobre vidrio'};

  /* ---------- Estado ---------- */
  const S = {escena: 'persiana', tecnica: 'pintura', estilo: 'ilustrado', provincia: 'sevilla', municipio: 'Sevilla', distancia: 'cerca', ancho: nf.format(P.ancho), alto: nf.format(P.alto),
    cx: null, cy: null, persona: true, comparar: false, simulador: false};
  const esc_ = () => ESCENAS[S.escena];
  const lugar = () => esc_().lugar;
  const estiloActual = () => estilos.find(x => x.id === S.estilo);
  const muralActual = () => { const e = estiloActual(); return e.murales.find(x => !x.para || x.para === S.escena || x.para === lugar()) || e.murales[0]; };
  /* Ubicación: provincia, municipio y, si es "otro" en Granada o Sevilla, la distancia a la capital */
  const U = C.ubicaciones, OTRO = '', OTRA = 'otra';
  const provinciaActual = () => U.provincias.find(x => x.id === S.provincia);
  const ubicacionActual = () => {
    const pr = provinciaActual();
    if (!pr) return {nombre: 'Otra provincia', plus: U.plus};
    if (S.municipio === OTRO) return {nombre: 'Otro municipio de ' + pr.nombre, plus: pr.sinPlus.length && S.distancia === 'cerca' ? 0 : U.plus};
    return {nombre: S.municipio + (S.municipio === pr.nombre ? ' (capital)' : ' (' + pr.nombre + ')'), plus: pr.sinPlus.includes(S.municipio) ? 0 : U.plus};
  };
  /* Geometría actual: en la persiana depende del tamaño del mural */
  const geo = () => esc_().foto ? fotoGeo(esc_().foto)
    : persiana(Math.max(num(S.ancho) || 0, P.ancho), Math.max(num(S.alto) || 0, P.alto));

  /* ---------- Vista ---------- */
  const stage = $('#sim-stage');
  stage.innerHTML =
    '<div class="sim-l sim-fondo"></div>' +
    '<div class="sim-l sim-capa"><div class="sim-mural"><div class="sim-relleno"></div><div class="sim-dentro"><img class="sim-boceto" alt=""><img class="sim-color" alt=""></div><div class="sim-tex"></div></div></div>' +
    '<div class="sim-l sim-frente"></div>' +
    '<div class="sim-persona" title="Persona de 1,70 m"><img src="' + IMG.sim_persona + '" alt=""><span>1,70 m</span></div>' +
    '<div class="sim-guia" tabindex="0" aria-label="Mural: arrástralo para moverlo. Con las flechas también se mueve."><span class="sim-cota sim-cota-w"></span><span class="sim-cota sim-cota-h"></span><span class="sim-asa" aria-hidden="true"></span></div>' +
    '<label class="sim-corte"><span class="sr">Comparar antes y después</span><input type="range" min="0" max="100" value="50"><b>Antes</b><b>Después</b></label>' +
    '<button type="button" class="sim-chip"></button>';
  const el = {
    fondo: $('.sim-fondo', stage), capa: $('.sim-capa', stage), mural: $('.sim-mural', stage), relleno: $('.sim-relleno', stage), dentro: $('.sim-dentro', stage), boceto: $('.sim-boceto', stage),
    color: $('.sim-color', stage), tex: $('.sim-tex', stage), frente: $('.sim-frente', stage),
    persona: $('.sim-persona', stage), guia: $('.sim-guia', stage), corte: $('.sim-corte input', stage), chip: $('.sim-chip', stage)
  };

  /* Imagen de fondo: la persiana se monta en 9 trozos (border-image) para que pueda crecer */
  const fondoCss = (node, g) => {
    if (S.escena === 'persiana') {
      Object.assign(node.style, {
        backgroundImage: 'none', borderImageSource: 'url("' + IMG.sim_local + '")',
        borderImageWidth: [borde.t / g.H, borde.r / g.W, borde.b / g.H, borde.l / g.W].map(v => v * 100 + '%').join(' ')
      });
    } else {
      Object.assign(node.style, {borderImageSource: 'none', backgroundImage: 'url("' + esc_().img + '")'});
    }
  };

  const montarEscena = () => {
    const id = S.escena;
    stage.dataset.escena = id;
    stage.dataset.ajuste = esc_().ajuste;
    const f = esc_().foto;
    el.frente.innerHTML = f
      ? '<svg viewBox="0 0 ' + f.w + ' ' + f.h + '" preserveAspectRatio="none" aria-hidden="true">' +
        (f.poligonos.length ? '<defs><clipPath id="sim-recorte">' + f.poligonos.map(p => '<polygon points="' + p + '"/>').join('') + '</clipPath></defs>' +
          '<image href="' + f.img + '" width="' + f.w + '" height="' + f.h + '" preserveAspectRatio="none" clip-path="url(#sim-recorte)"/>' : '') +
        f.recortes.map(c => '<image href="' + c.img + '" x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" preserveAspectRatio="none"/>').join('') + '</svg>'
      : '';
    el.tex.style.filter = esc_().tex;
    el.tex.style.opacity = esc_().texOp;
    colocar();
  };

  /* Medidas visibles del mural: lo que cabe en la pared */
  const medidas = g => {
    const p = g.pared;
    const w = clamp(num(S.ancho) || 0, .3, p.w), h = clamp(num(S.alto) || 0, .3, p.h);
    if (S.cx == null) [S.cx, S.cy] = esc_().centro || [p.w / 2, p.h / 2];
    const x = clamp(S.cx - w / 2, 0, p.w - w), y = clamp(S.cy - h / 2, 0, p.h - h);
    return {x, y, w, h};
  };

  /* Solo se ve el mural dentro de la pared; en "antes y después", además, solo a la derecha de la barra */
  const recortarCapa = (g = geo()) => {
    const p = g.pared, izq = Math.max(p.x / g.W * 100, S.comparar ? +el.corte.value : 0);
    el.capa.style.clipPath = 'inset(' + p.y / g.H * 100 + '% ' + (g.W - p.x - p.w) / g.W * 100 + '% ' + (g.H - p.y - p.h) / g.H * 100 + '% ' + izq + '%)';
  };

  let ultimoMural = '';
  const colocar = animar => {
    const g = geo(), p = g.pared, r = medidas(g);
    const px = v => v / g.W * 100 + '%', py = v => v / g.H * 100 + '%';
    const rect = (node, x, y, w, h) => Object.assign(node.style, {left: px(x), top: py(y), width: px(w), height: py(h)});
    stage.style.aspectRatio = g.W + ' / ' + g.H;
    stage.style.setProperty('--ar', g.W / g.H);
    fondoCss(el.fondo, g);
    recortarCapa(g);
    rect(el.mural, p.x + r.x, p.y + r.y, r.w, r.h);
    rect(el.guia, p.x + r.x, p.y + r.y, r.w, r.h);
    // la textura ocupa toda la vista, desplazada para coincidir con el fondo
    Object.assign(el.tex.style, {left: -(p.x + r.x) / r.w * 100 + '%', top: -(p.y + r.y) / r.h * 100 + '%', width: g.W / r.w * 100 + '%', height: g.H / r.h * 100 + '%'});
    fondoCss(el.tex, g);
    $('.sim-cota-w', el.guia).textContent = m(round2(num(S.ancho)) || r.w);
    $('.sim-cota-h', el.guia).textContent = m(round2(num(S.alto)) || r.h);
    el.persona.hidden = !S.persona;
    el.persona.style.height = py(1.7);
    el.persona.style.left = px(g.persona.x - 1.7 * PERSONA_PROP / 2);
    el.persona.style.top = py(g.persona.suelo - 1.7);
    const src = IMG[muralActual().img];
    if (src !== ultimoMural) {
      ultimoMural = src;
      el.boceto.src = el.color.src = src;
      el.boceto.alt = 'Mural «' + muralActual().nombre + '» de Murales Anilom';
      if (animar) pintar();
    }
    // mural entero: la imagen completa, centrada en el hueco
    const d = esc_().ajuste === 'entero' && dentro(r, el.color);
    Object.assign(el.dentro.style, d ? {left: d.x / r.w * 100 + '%', top: d.y / r.h * 100 + '%', width: d.w / r.w * 100 + '%', height: d.h / r.h * 100 + '%'}
      : {left: '0', top: '0', width: '100%', height: '100%'});
  };
  /* Hueco que ocupa la imagen completa del mural dentro del rectángulo r (misma unidad que r) */
  const dentro = (r, img) => {
    if (!img.naturalWidth) return null;
    const a = img.naturalWidth / img.naturalHeight;
    const w = Math.min(r.w, r.h * a), h = w / a;
    return {x: (r.w - w) / 2, y: (r.h - h) / 2, w, h};
  };
  /* Color medio del mural: se usa como fondo pintado alrededor cuando el mural se ve entero */
  const colorMedio = img => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    const x = cv.getContext('2d');
    x.drawImage(img, 0, 0, 1, 1);
    try {
      const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } catch (err) { return '#e9e4dc'; }   // abriendo los archivos en el ordenador el navegador no deja leer la foto
  };
  el.color.addEventListener('load', () => { el.relleno.style.backgroundColor = colorMedio(el.color); colocar(); });

  /* El mural se "pinta" con un barrido al elegir otro estilo */
  const pintar = () => {
    if (sinMovimiento) return;
    el.color.classList.remove('pintando');
    void el.color.offsetWidth;
    el.color.classList.add('pintando');
  };

  /* ---------- Mover y cambiar de tamaño con el dedo o el ratón ---------- */
  let arrastre = null;
  el.guia.addEventListener('pointerdown', ev => {
    if (S.comparar) return;
    const g = geo();
    arrastre = {x: ev.clientX, y: ev.clientY, g, r: medidas(g), cx: S.cx, cy: S.cy, asa: ev.target.classList.contains('sim-asa')};
    el.guia.setPointerCapture(ev.pointerId);
    el.guia.classList.add('activa');
    ev.preventDefault();
  });
  el.guia.addEventListener('pointermove', ev => {
    if (!arrastre) return;
    const {g, r} = arrastre, p = g.pared;
    const dx = (ev.clientX - arrastre.x) * g.W / stage.clientWidth, dy = (ev.clientY - arrastre.y) * g.H / stage.clientHeight;
    if (arrastre.asa) {
      const paso = v => Math.round(v * 20) / 20;
      const w = clamp(paso(r.w + dx), .3, p.w - r.x), h = clamp(paso(r.h + dy), .3, p.h - r.y);
      S.ancho = nf.format(w); S.alto = nf.format(h);
      S.cx = r.x + w / 2; S.cy = r.y + h / 2;
      pintarMedidas();
    } else {
      S.cx = clamp(arrastre.cx + dx, r.w / 2, p.w - r.w / 2);
      S.cy = clamp(arrastre.cy + dy, r.h / 2, p.h - r.h / 2);
    }
    colocar();
  });
  const soltar = () => { if (arrastre) { arrastre = null; el.guia.classList.remove('activa'); pintarResultado(); } };
  el.guia.addEventListener('pointerup', soltar);
  el.guia.addEventListener('pointercancel', soltar);
  el.guia.addEventListener('keydown', ev => {
    const d = {ArrowLeft: [-.1, 0], ArrowRight: [.1, 0], ArrowUp: [0, -.1], ArrowDown: [0, .1]}[ev.key];
    if (!d) return;
    const g = geo(), p = g.pared, r = medidas(g);
    S.cx = clamp(r.x + r.w / 2 + d[0], r.w / 2, p.w - r.w / 2);
    S.cy = clamp(r.y + r.h / 2 + d[1], r.h / 2, p.h - r.h / 2);
    colocar();
    ev.preventDefault();
  });

  /* ---------- Herramientas ---------- */
  const tools = $('#sim-tools');
  const pintarTools = () => {
    stage.classList.toggle('comparando', S.comparar);
    recortarCapa();
    $$('[data-tool]', tools).forEach(b => { if (b.dataset.tool in S) b.setAttribute('aria-pressed', S[b.dataset.tool]); });
    el.persona.hidden = !S.persona;
  };
  tools.addEventListener('click', ev => {
    const b = ev.target.closest('[data-tool]');
    if (!b) return;
    const t = b.dataset.tool;
    if (t === 'imagen') { compartirImagen(b); return; }
    S[t] = !S[t];
    if (t === 'comparar' && S.comparar) { el.corte.value = 50; stage.style.setProperty('--corte', '50%'); }
    pintarTools();
  });
  el.corte.addEventListener('input', () => { stage.style.setProperty('--corte', el.corte.value + '%'); recortarCapa(); });
  el.chip.addEventListener('click', () => $('#resultado').scrollIntoView({block: 'nearest', behavior: sinMovimiento ? 'auto' : 'smooth'}));

  /* ---------- Calculadora o simulador ---------- */
  const modo = $('#sim-modo', document);
  const ponerModo = sim => {
    S.simulador = sim;
    modo.checked = sim;
    root.classList.toggle('modo-calc', !sim);
    pintarMedidas();
    pintarResultado();
    if (sim) { colocar(); pintar(); }
  };
  modo.addEventListener('change', () => ponerModo(modo.checked));

  /* ---------- Pasos ---------- */
  const PASOS = 3, siguiente = {1: 'Siguiente: Tamaño', 2: 'Siguiente: Ubicación', 3: 'Enviar mi presupuesto'};
  let paso = 1;
  const irPaso = n => {
    paso = n;
    $$('.sim-paso').forEach(p => p.hidden = +p.dataset.paso !== n);
    $$('.sim-steps button').forEach(b => {
      const actual = +b.dataset.ir === n;
      b.classList.toggle('actual', actual);
      b.classList.toggle('hecho', +b.dataset.ir < n);
      if (actual) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $('#sim-ant').disabled = n === 1;
    $('#sim-sig').textContent = siguiente[n];
  };
  const cambiarPaso = n => { irPaso(n); $('.sim-steps').scrollIntoView({block: 'nearest', behavior: sinMovimiento ? 'auto' : 'smooth'}); };
  root.addEventListener('click', ev => { const b = ev.target.closest('[data-ir]'); if (b) irPaso(+b.dataset.ir); });
  $('#sim-ant').addEventListener('click', () => cambiarPaso(Math.max(1, paso - 1)));
  $('#sim-sig').addEventListener('click', () => {
    if (paso < PASOS) cambiarPaso(paso + 1);
    else { const d = $('#sim-enviar', document); if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  });
  $('#sim-res-btn').addEventListener('click', ev => {
    if (S.simulador) compartirImagen(ev.currentTarget);
    else { ponerModo(true); root.scrollIntoView({behavior: sinMovimiento ? 'auto' : 'smooth'}); }
  });

  /* ---------- Paso 2: tamaño y localización ---------- */
  const contEscenas = $('#sim-escenas');
  Object.keys(ESCENAS).forEach(id => {
    const e = ESCENAS[id];
    const lab = document.createElement('label');
    lab.className = 'sim-escena';
    lab.innerHTML = '<input type="radio" name="escena" value="' + id + '"><span class="se-img"><img src="' + e.img + '" alt="" loading="lazy" decoding="async"></span><strong>' + e.nombre + '</strong><small>' + nombreLugar[e.lugar] + '</small>';
    contEscenas.appendChild(lab);
  });

  /* ---------- Paso 1: estilo ---------- */
  const contEstilos = $('#estilos');
  estilos.forEach(e => {
    const lab = document.createElement('label');
    lab.className = 'sq';
    lab.innerHTML = '<input type="radio" name="estilo"><span class="sq-body"><span class="sq-img"><img alt="" loading="lazy" decoding="async"></span><strong></strong><small></small></span>';
    $('input', lab).value = e.id;
    $('.sq-img', lab).style.setProperty('--pos', C.encuadre[e.ejemplo] || '50% 50%');
    $('img', lab).src = IMG[e.ejemplo];
    $('strong', lab).textContent = e.nombre;
    lab.dataset.id = e.id;
    contEstilos.appendChild(lab);
  });

  /* El graffiti solo se usa en exterior y no en todos los estilos: si no se puede, se pasa a pintura */
  const sinSpray = () => lugar() !== 'exterior' || tarifa(estiloActual(), 'spray') == null;
  const reglas = () => {
    if (sinSpray() && S.tecnica === 'spray') S.tecnica = 'pintura';
  };

  const pintarControles = () => {
    $$('input[name=escena]').forEach(r => r.checked = r.value === S.escena);
    $$('input[name=tecnica]').forEach(r => {
      r.checked = r.value === S.tecnica;
      if (r.value === 'spray') r.disabled = sinSpray();
    });
    $('#hint-tecnica').textContent = {interior: 'En interior pinto siempre con pintura.', cristal: 'En cristales pinto siempre con pintura.'}[lugar()]
      || (sinSpray() ? 'El estilo «' + estiloActual().nombre + '» se pinta siempre con pintura.' : 'El graffiti (spray) solo se usa en exteriores.');
    $$('.sq', contEstilos).forEach(lab => {
      const e = estilos.find(x => x.id === lab.dataset.id);
      $('input', lab).checked = S.estilo === e.id;
      $('small', lab).textContent = e.desc;
    });
    pintarTools();
  };

  /* ---------- Paso 3: ubicación ---------- */
  const selProv = $('#sim-prov'), selMuni = $('#sim-muni');
  const opcion = (sel, valor, texto) => { const o = document.createElement('option'); o.value = valor; o.textContent = texto; sel.appendChild(o); };
  U.provincias.forEach(pr => opcion(selProv, pr.id, pr.nombre));
  opcion(selProv, OTRA, 'Otra provincia');
  /* Municipios de la provincia: la capital primero, luego por orden alfabético y al final "Otro municipio" */
  const pintarMunicipios = () => {
    const pr = provinciaActual();
    selMuni.innerHTML = '';
    $('#sim-muni-f').hidden = !pr;
    if (pr) {
      const resto = pr.sinPlus.concat(pr.conPlus).filter(n => n !== pr.nombre).sort((a, b) => a.localeCompare(b, 'es'));
      [pr.nombre].concat(resto).forEach(n => opcion(selMuni, n, n === pr.nombre ? pr.nombre + ' (capital)' : n));
      opcion(selMuni, OTRO, 'Otro municipio');
    }
    pintarUbicacion();
  };
  const pintarUbicacion = () => {
    const pr = provinciaActual();
    selProv.value = S.provincia;
    if (pr) selMuni.value = S.municipio;
    $('#sim-dist').value = S.distancia;
    $('#sim-dist-f').hidden = !(pr && S.municipio === OTRO && pr.sinPlus.length);
  };
  pintarMunicipios();

  /* ---------- Medidas ---------- */
  const pintarMedidas = () => {
    const crece = esc_().crece, p = geo().pared, a = num(S.ancho), h = num(S.alto);
    const maxW = crece ? 12 : p.w, maxH = crece ? L.alturaMaxima : p.h;
    const rw = $('#sim-rango-ancho'), rh = $('#sim-rango-alto');
    rw.max = maxW; rh.max = maxH;
    if (document.activeElement !== rw) rw.value = clamp(a || 0, +rw.min, maxW);
    if (document.activeElement !== rh) rh.value = clamp(h || 0, +rh.min, maxH);
    const ia = $('#ancho'), ih = $('#alto');
    if (document.activeElement !== ia) ia.value = S.ancho;
    if (document.activeElement !== ih) ih.value = S.alto;
    $('#sim-max').textContent = crece
      ? 'La persiana se adapta a las medidas que pongas.'
      : 'Esta pared mide ' + nf.format(p.w) + ' × ' + nf.format(p.h) + ' m.';
    $('#sim-toda').hidden = !!crece;
    $('#area-out').textContent = a > 0 && h > 0 ? '= ' + nf.format(round2(a * h)) + ' m²' : '';
    $('#sim-aviso-tam').textContent = !crece && (a > p.w + .001 || h > p.h + .001)
      ? 'Tu mural es más grande que esta pared de ejemplo, así que aquí se ve recortado. El precio sí está calculado con tus medidas.' : '';
  };

  /* ---------- Paso 4: presupuesto ----------
     sin materiales = m² × precio (en cristales, m² × precio del cristal), con un mínimo;
     más de 20 m²: descuento; con materiales = sin materiales + 30 %;
     el suplemento por altura y el plus por desplazamiento van dentro del precio sin decirlo */
  const calcular = () => {
    const ancho = num(S.ancho), alto = num(S.alto);
    if (!(ancho > 0) || !(alto > 0)) return {ok:false, msg:'Escribe el ancho y el alto del mural en metros.'};
    if (alto > L.alturaMaxima) return {ok:false, msg:'Por ahora no hago murales de más de ' + L.alturaMaxima + ' m de altura desde el suelo. Escríbeme y vemos si se puede resolver de otra forma.'};
    const area = ancho * alto, e = estiloActual();
    let sin = Math.max(area * (lugar() === 'cristal' ? PR.cristal.m2 : tarifa(e, S.tecnica)), PR.minimo);
    const descuento = area > PR.descuento.desdeM2;
    if (descuento) sin *= 1 - PR.descuento.porcentaje;
    let con = sin * (1 + PR.materiales);
    if (alto > PR.altura.desde) { sin += PR.altura.sinMateriales; con += PR.altura.conMateriales; }
    const plus = ubicacionActual().plus;
    sin += plus; con += plus;
    return {ok:true, ancho, alto, area, e, sin, con, descuento};
  };
  const codigo = () => {
    let h = 0;
    for (const ch of [S.escena, S.estilo, S.ancho, S.alto, S.tecnica, S.provincia, S.municipio].join('|')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return 'MA-' + (h % 46656).toString(36).toUpperCase().padStart(3, '0');
  };

  const pintarResultado = () => {
    const r = calcular(), box = $('#resultado');
    el.chip.innerHTML = r.ok ? '<small>Desde</small> ' + eur(r.sin) + ' <span>· ' + nf.format(round2(r.area)) + ' m²</span>' : 'Calcula tu precio';
    $('#sim-res-btn').textContent = S.simulador ? 'Guardar la imagen del simulador' : 'Ver cómo queda en el simulador';
    if (!r.ok) {
      box.innerHTML = '<div class="ticket"><p class="error">' + r.msg + '</p></div>';
      $('#sim-enviar-wa', document).href = wa('Hola María, tengo una consulta sobre un mural.');
      $('#sim-enviar-mail', document).href = mailto('Consulta sobre un mural', 'Hola María, tengo una consulta sobre un mural.');
      return;
    }
    const mu = muralActual(), dondeTxt = esc_().nombre, ubic = ubicacionActual().nombre;
    const dto = 'Más de ' + PR.descuento.desdeM2 + ' m²: ' + Math.round(PR.descuento.porcentaje * 100) + ' % de descuento aplicado';
    const avisos = r.descuento ? [dto + '.'] : [];
    const msg = [
      'Hola María, he calculado un presupuesto en tu web.',
      '• Dónde: ' + dondeTxt,
      '• Ubicación: ' + ubic,
      '• Estilo: ' + r.e.nombre + ' (como el mural «' + mu.nombre + '»)',
      '• Técnica: ' + nombreTec[S.tecnica],
      '• Medidas: ' + nf.format(r.ancho) + ' × ' + nf.format(r.alto) + ' m (' + nf.format(round2(r.area)) + ' m²)' + (r.descuento ? ' · ' + dto.toLowerCase() : ''),
      'Presupuesto orientativo: ' + eur(r.sin) + ' sin materiales / ' + eur(r.con) + ' con materiales (IVA no incluido). Diseño ' + codigo() + '.',
      'Me gustaría un presupuesto cerrado. Te paso fotos de la pared, su estado, las medidas exactas y el municipio:'
    ].join('\n');
    const fecha = new Date().toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric'});
    box.innerHTML =
      '<div class="ticket">' +
        '<div class="t-head"><h3>Presupuesto orientativo</h3><small>Diseño ' + codigo() + ' · ' + fecha + '</small></div>' +
        '<dl>' +
          '<div><dt>Dónde</dt><dd>' + dondeTxt + '</dd></div>' +
          '<div><dt>Estilo</dt><dd>' + r.e.nombre + '<br><small>como «' + mu.nombre + '»</small></dd></div>' +
          '<div><dt>Técnica</dt><dd>' + nombreTec[S.tecnica] + '</dd></div>' +
          '<div><dt>Medidas</dt><dd>' + nf.format(r.ancho) + ' × ' + nf.format(r.alto) + ' m = ' + nf.format(round2(r.area)) + ' m²</dd></div>' +
          '<div><dt>Ubicación</dt><dd>' + ubic + '</dd></div>' +
        '</dl>' +
        '<div class="t-tot"><div><span>Sin materiales</span><strong>' + eur(r.sin) + '</strong></div><div><span>Con materiales</span><strong>' + eur(r.con) + '</strong></div></div>' +
        '<p class="iva">IVA no incluido. Cifra orientativa y no vinculante.</p>' +
        (avisos.length ? '<ul class="avisos">' + avisos.map(a => '<li>' + a + '</li>').join('') + '</ul>' : '') +
      '</div>';
    $('#sim-enviar-wa', document).href = wa(msg);
    $('#sim-enviar-mail', document).href = mailto('Presupuesto de mural', msg);
  };

  /* ---------- Imagen para guardar o compartir ---------- */
  const cargar = src => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
  /* Bordes que se desvanecen: f = parte del ancho y del alto que se difumina en cada lado */
  const difuminar = (cv, f) => {
    const x = cv.getContext('2d');
    x.save();
    x.globalCompositeOperation = 'destination-in'; x.globalAlpha = 1; x.filter = 'none';
    [[cv.width, 0], [0, cv.height]].forEach(([gx, gy]) => {
      const g = x.createLinearGradient(0, 0, gx, gy);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(f, '#000'); g.addColorStop(1 - f, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, cv.width, cv.height);
    });
    x.restore();
  };
  const dibujarCover = (ctx, img, x, y, w, h) => {
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight), sw = w / s, sh = h / s;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  };
  /* La persiana en 9 trozos, como en pantalla (el centro y los bordes de arriba y abajo se repiten a lo ancho) */
  const dibujarPersiana = (ctx, img, W, H, g) => {
    const s = {l: 113, r: 112, t: 214, b: 174}, sw = 1024 - s.l - s.r, sh = 1024 - s.t - s.b;
    const d = {l: borde.l / g.W * W, r: borde.r / g.W * W, t: borde.t / g.H * H, b: borde.b / g.H * H};
    const cw = W - d.l - d.r, ch = H - d.t - d.b;
    const n = Math.max(1, Math.round(cw / (sw * d.t / s.t)));
    [[0, s.t, 0, d.t], [s.t, sh, d.t, ch], [1024 - s.b, s.b, H - d.b, d.b]].forEach(([sy, shh, dy, dh]) => {
      ctx.drawImage(img, 0, sy, s.l, shh, 0, dy, d.l, dh);
      ctx.drawImage(img, 1024 - s.r, sy, s.r, shh, W - d.r, dy, d.r, dh);
      for (let i = 0; i < n; i++) ctx.drawImage(img, s.l, sy, sw, shh, d.l + i * cw / n, dy, cw / n + .5, dh);
    });
  };
  const generarImagen = async () => {
    const g = geo(), p = g.pared, r = medidas(g), e = esc_();
    const W = Math.round(Math.min(1800, 1024 * (e.foto ? 1 : g.W / persiana(P.ancho, P.alto).W))), H = Math.round(W * g.H / g.W);
    const k = W / g.W, kH = H / g.H;
    const foto = await cargar(e.img), mural = await cargar(IMG[muralActual().img]);
    const base = document.createElement('canvas');
    base.width = W; base.height = H;
    if (S.escena === 'persiana') dibujarPersiana(base.getContext('2d'), foto, W, H, g); else base.getContext('2d').drawImage(foto, 0, 0, W, H);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H + 56;
    const ctx = cv.getContext('2d');
    ctx.drawImage(base, 0, 0);
    const mx = (p.x + r.x) * k, my = (p.y + r.y) * kH, mw = Math.round(r.w * k), mh = Math.round(r.h * kH);
    const mc = document.createElement('canvas');
    mc.width = mw; mc.height = mh;
    const m2 = mc.getContext('2d');
    if (e.ajuste === 'entero') {
      // fondo pintado del color medio del mural y encima el mural completo con los bordes suaves
      if (e.lugar !== 'cristal') {   // en el cristal no hay fondo pintado: alrededor se ve el vidrio
        m2.globalAlpha = .45;
        m2.fillStyle = colorMedio(mural);
        m2.fillRect(0, 0, mw, mh);
        m2.globalAlpha = 1;
      }
      const d = dentro({w: mw, h: mh}, mural), ic = document.createElement('canvas');
      ic.width = Math.round(d.w); ic.height = Math.round(d.h);
      ic.getContext('2d').drawImage(mural, 0, 0, ic.width, ic.height);
      difuminar(ic, .12);
      m2.drawImage(ic, d.x, d.y);
    } else dibujarCover(m2, mural, 0, 0, mw, mh);
    m2.globalCompositeOperation = 'multiply';
    m2.globalAlpha = e.texOp;
    m2.filter = e.tex;
    m2.drawImage(base, -mx, -my);
    if (e.ajuste === 'entero') difuminar(mc, .06);
    ctx.drawImage(mc, mx, my);
    if (e.foto) {
      const f = e.foto;
      ctx.save();
      ctx.scale(W / f.w, H / f.h);
      if (f.poligonos.length) {
        ctx.save();
        ctx.beginPath();
        f.poligonos.forEach(pts => pts.split(' ').forEach((pt, i) => { const [x, y] = pt.split(',').map(Number); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }));
        ctx.clip();
        ctx.drawImage(foto, 0, 0, f.w, f.h);
        ctx.restore();
      }
      for (const c of f.recortes) ctx.drawImage(await cargar(c.img), c.x, c.y, c.w, c.h);
      ctx.restore();
    }
    if (S.persona) {
      const per = await cargar(IMG.sim_persona), ph = 1.7 * kH, pw = 1.7 * PERSONA_PROP * k;
      ctx.globalAlpha = .85;
      ctx.drawImage(per, g.persona.x * k - pw / 2, (g.persona.suelo - 1.7) * kH, pw, ph);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#4d4d4d'; ctx.fillRect(0, H, W, 56);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = '500 22px Jost, system-ui, sans-serif';
    ctx.fillText('Murales Anilom · ' + c.web, 20, H + 28);
    ctx.textAlign = 'right'; ctx.font = '400 18px Jost, system-ui, sans-serif';
    ctx.fillText(nf.format(num(S.ancho)) + ' × ' + nf.format(num(S.alto)) + ' m · simulación orientativa', W - 20, H + 28);
    return new Promise(ok => cv.toBlob(ok, 'image/jpeg', .9));
  };
  const compartirImagen = async boton => {
    boton.disabled = true;
    try {
      const blob = await generarImagen();
      const file = new File([blob], 'mural-' + codigo() + '.jpg', {type: 'image/jpeg'});
      if (navigator.canShare && navigator.canShare({files: [file]})) {
        await navigator.share({files: [file], title: 'Mi mural de Murales Anilom', text: 'Así quedaría mi mural (' + codigo() + ')'});
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') console.warn('[simulador]', err);
    } finally { boton.disabled = false; }
  };

  /* ---------- Eventos del formulario ---------- */
  const form = $('#sim-form');
  form.addEventListener('change', ev => {
    const t = ev.target, n = t.name;
    if (n === 'escena') {
      S.escena = t.value; S.comparar = false; S.cx = null;
      const [a, h] = esc_().tamano;
      S.ancho = nf.format(a); S.alto = nf.format(h);
      reglas(); montarEscena(); pintarControles(); pintarMedidas(); colocar(true);
    } else if (n === 'tecnica' || n === 'estilo') {
      S[n] = t.value; reglas(); pintarControles(); colocar(true);
    } else if (n === 'provincia') {
      S.provincia = t.value;
      const pr = provinciaActual();
      S.municipio = pr ? pr.nombre : OTRO;
      pintarMunicipios();
    } else if (n === 'municipio' || n === 'distancia') {
      S[n] = t.value; pintarUbicacion();
    }
    pintarResultado();
  });
  form.addEventListener('input', ev => {
    const t = ev.target;
    if (t.name === 'ancho' || t.name === 'alto') S[t.name] = t.value;
    else if (t.id === 'sim-rango-ancho') S.ancho = nf.format(+t.value);
    else if (t.id === 'sim-rango-alto') S.alto = nf.format(+t.value);
    else return;
    pintarMedidas(); colocar(); pintarResultado();
  });
  $('#sim-toda').addEventListener('click', () => {
    const p = geo().pared;
    S.ancho = nf.format(round2(p.w)); S.alto = nf.format(round2(p.h)); S.cx = p.w / 2; S.cy = p.h / 2;
    pintarMedidas(); colocar(); pintarResultado();
  });
  form.addEventListener('submit', ev => ev.preventDefault());

  reglas(); montarEscena(); pintarControles(); irPaso(1); ponerModo(false);
}
initSimulador();
