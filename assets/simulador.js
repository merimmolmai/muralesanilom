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

  /* Pared de interior (interior.webp, 1024 × 1020). La pared va de x 82 a 962 y de y 116 a 850.
     Lo que está delante de la pared (sofá, lámpara, mesa...) se vuelve a dibujar encima del mural. */
  const I = {ancho: sp.interior.ancho, alto: sp.interior.alto};
  const ikx = 880 / I.ancho, iky = 734 / I.alto;
  const INTERIOR_FRENTE = [
    '133,735 137,720 150,713 200,713 200,668 320,663 800,663 830,668 830,713 878,713 890,722 893,735 893,1020 133,1020',
    '900,512 1019,512 1019,587 975,587 992,850 920,850 938,587 900,587',
    '958,680 1022,680 1022,1020 895,1020 895,735 958,735',
    '36,728 138,728 138,1020 36,1020',
    '0,760 45,760 52,790 160,785 160,1020 0,1020',
    '865,815 1024,800 1024,1020 865,1020',
    '318,835 706,835 706,1020 318,1020'
  ];
  const PLANTA = {x: 0, y: 380, w: 230, h: 400};   // recorte de la planta, en píxeles de interior.webp
  const salon = () => ({
    W: 1024 / ikx, H: 1020 / iky, pared: {x: 82 / ikx, y: 116 / iky, w: I.ancho, h: I.alto},
    persona: {x: 870 / ikx, suelo: 850 / iky}
  });

  const ESCENAS = {
    persiana: {nombre: 'Persiana de local', lugar: 'exterior', img: IMG.sim_local, tamano: [P.ancho, P.alto], crece: true,
      tex: 'grayscale(1) contrast(1.7) brightness(1.3)', texOp: .55},
    interior: {nombre: 'Pared de interior', lugar: 'interior', img: IMG.sim_interior, tamano: [2.2, 1.3], centro: [I.ancho / 2, 1.34],
      tex: 'grayscale(1) contrast(1.15) brightness(1.55)', texOp: .5}
  };

  /* ---------- Estado ---------- */
  const S = {escena: 'persiana', tecnica: 'pintura', estilo: 'ilustrado', ancho: nf.format(P.ancho), alto: nf.format(P.alto),
    cx: null, cy: null, persona: true, comparar: false, simulador: false};
  const esc_ = () => ESCENAS[S.escena];
  const lugar = () => esc_().lugar;
  const estiloActual = () => estilos.find(x => x.id === S.estilo);
  const muralActual = () => { const e = estiloActual(); return e.murales.find(x => !x.para || x.para === lugar()) || e.murales[0]; };
  /* Geometría actual: en la persiana depende del tamaño del mural */
  const geo = () => S.escena === 'interior' ? salon()
    : persiana(Math.max(num(S.ancho) || 0, P.ancho), Math.max(num(S.alto) || 0, P.alto));

  /* ---------- Vista ---------- */
  const stage = $('#sim-stage');
  stage.innerHTML =
    '<div class="sim-l sim-fondo"></div>' +
    '<div class="sim-l sim-capa"><div class="sim-mural"><img class="sim-boceto" alt=""><img class="sim-color" alt=""><div class="sim-tex"></div></div></div>' +
    '<div class="sim-l sim-frente"></div>' +
    '<div class="sim-persona" title="Persona de 1,70 m"><img src="' + IMG.sim_persona + '" alt=""><span>1,70 m</span></div>' +
    '<div class="sim-guia" tabindex="0" aria-label="Mural: arrástralo para moverlo. Con las flechas también se mueve."><span class="sim-cota sim-cota-w"></span><span class="sim-cota sim-cota-h"></span><span class="sim-asa" aria-hidden="true"></span></div>' +
    '<label class="sim-corte"><span class="sr">Comparar antes y después</span><input type="range" min="0" max="100" value="50"><b>Antes</b><b>Después</b></label>' +
    '<button type="button" class="sim-chip"></button>';
  const el = {
    fondo: $('.sim-fondo', stage), capa: $('.sim-capa', stage), mural: $('.sim-mural', stage), boceto: $('.sim-boceto', stage),
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
    el.frente.innerHTML = id === 'interior'
      ? '<svg viewBox="0 0 1024 1020" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="sim-recorte">' +
        INTERIOR_FRENTE.map(p => '<polygon points="' + p + '"/>').join('') + '</clipPath></defs>' +
        '<image href="' + IMG.sim_interior + '" width="1024" height="1020" preserveAspectRatio="none" clip-path="url(#sim-recorte)"/>' +
        '<image href="' + IMG.sim_interior_planta + '" x="' + PLANTA.x + '" y="' + PLANTA.y + '" width="' + PLANTA.w + '" height="' + PLANTA.h + '" preserveAspectRatio="none"/></svg>'
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
  };

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
  el.chip.addEventListener('click', () => irPaso(4));

  /* ---------- Calculadora o simulador ---------- */
  const modo = $('#sim-modo', document);
  const ponerModo = sim => {
    S.simulador = sim;
    modo.checked = sim;
    root.classList.toggle('modo-calc', !sim);
    pintarMedidas();
    irPaso(sim ? 1 : 4);
    if (sim) { colocar(); pintar(); }
  };
  modo.addEventListener('change', () => ponerModo(modo.checked));

  /* ---------- Pasos ---------- */
  const irPaso = n => {
    $$('.sim-paso').forEach(p => p.hidden = S.simulador && +p.dataset.paso !== n);
    $$('.sim-steps button').forEach(b => {
      const actual = +b.dataset.ir === n;
      b.classList.toggle('actual', actual);
      b.classList.toggle('hecho', +b.dataset.ir < n);
      if (actual) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    if (n === 4) pintarResultado();
  };
  root.addEventListener('click', ev => {
    const b = ev.target.closest('[data-ir]');
    if (b) { irPaso(+b.dataset.ir); if (b.closest('.sim-paso')) $('.sim-steps').scrollIntoView({block: 'nearest', behavior: sinMovimiento ? 'auto' : 'smooth'}); }
  });

  /* ---------- Paso 1: dónde ---------- */
  const contEscenas = $('#sim-escenas');
  Object.keys(ESCENAS).forEach(id => {
    const e = ESCENAS[id];
    const lab = document.createElement('label');
    lab.className = 'sim-escena';
    lab.innerHTML = '<input type="radio" name="escena" value="' + id + '"><span class="se-img"><img src="' + e.img + '" alt="" loading="lazy" decoding="async"></span><strong>' + e.nombre + '</strong><small>' + (e.lugar === 'interior' ? 'Interior' : 'Exterior') + '</small>';
    contEscenas.appendChild(lab);
  });

  /* ---------- Paso 2: estilo ---------- */
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

  const reglas = () => {
    let aviso = '';
    if (lugar() === 'interior' && S.tecnica === 'spray') {
      S.tecnica = 'pintura';
      aviso = 'En interior se pinta siempre con pintura, así que he cambiado la técnica.';
    }
    if (!tarifa(estiloActual(), S.tecnica)) {
      S.estilo = estilos.find(x => tarifa(x, S.tecnica)).id;
      aviso = (aviso ? aviso + ' ' : '') + 'Ese estilo no se hace con esta técnica, así que he elegido otro.';
    }
    $('#notice').textContent = aviso;
  };

  const pintarControles = () => {
    $$('input[name=escena]').forEach(r => r.checked = r.value === S.escena);
    $$('input[name=tecnica]').forEach(r => {
      r.checked = r.value === S.tecnica;
      if (r.value === 'spray') r.disabled = lugar() === 'interior';
    });
    $('#hint-tecnica').textContent = lugar() === 'interior'
      ? 'En interior pinto siempre con pintura.'
      : 'El graffiti (spray) solo se usa en exteriores.';
    $$('.sq', contEstilos).forEach(lab => {
      const e = estilos.find(x => x.id === lab.dataset.id);
      const t = tarifa(e, S.tecnica);
      const inp = $('input', lab);
      inp.checked = S.estilo === e.id;
      inp.disabled = !t;
      $('small', lab).textContent = t ? e.desc : 'Solo con pintura';
    });
    pintarTools();
  };

  /* ---------- Paso 3: tamaño ---------- */
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
      : 'Esta pared mide ' + nf.format(I.ancho) + ' × ' + nf.format(I.alto) + ' m.';
    $('#sim-toda').hidden = !!crece;
    $('#area-out').textContent = a > 0 && h > 0 ? '= ' + nf.format(round2(a * h)) + ' m²' : '';
    $('#sim-aviso-tam').textContent = !crece && (a > p.w + .001 || h > p.h + .001)
      ? 'Tu mural es más grande que esta pared de ejemplo, así que aquí se ve recortado. El precio sí está calculado con tus medidas.' : '';
  };

  /* ---------- Paso 4: presupuesto ---------- */
  const calcular = () => {
    const ancho = num(S.ancho), alto = num(S.alto);
    if (!(ancho > 0) || !(alto > 0)) return {ok:false, msg:'Escribe el ancho y el alto del mural en metros.'};
    if (alto > L.alturaMaxima) return {ok:false, msg:'Por ahora no hago murales de más de ' + L.alturaMaxima + ' m de altura desde el suelo. Escríbeme y vemos si se puede resolver de otra forma.'};
    const area = ancho * alto, e = estiloActual(), t = tarifa(e, S.tecnica);
    let sin = t.m2 * area, con = t.mat * area;
    if (C.minimoMural > 0) { sin = Math.max(sin, C.minimoMural); con = Math.max(con, C.minimoMural); }
    const dias = area / (e.m2dia * (S.tecnica === 'spray' ? C.rendimientoSpray : 1));
    return {ok:true, ancho, alto, area, e, t, sin, con, dias};
  };
  const textoDias = d => {
    if (d <= .6) return 'Menos de un día';
    if (d <= 1.2) return 'Más o menos un día';
    const a = Math.max(1, Math.floor(d * .85)), b = Math.ceil(d * 1.2);
    return 'Unos ' + (a === b ? a : a + '–' + b) + ' días';
  };
  const codigo = () => {
    let h = 0;
    for (const ch of [S.escena, S.estilo, S.ancho, S.alto, S.tecnica].join('|')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return 'MA-' + (h % 46656).toString(36).toUpperCase().padStart(3, '0');
  };

  const pintarResultado = () => {
    const r = calcular(), box = $('#resultado');
    el.chip.innerHTML = r.ok ? '<small>Desde</small> ' + eur(r.sin) + ' <span>· ' + nf.format(round2(r.area)) + ' m²</span>' : 'Calcula tu precio';
    if (!r.ok) {
      box.innerHTML = '<p class="error">' + r.msg + '</p><div class="res-actions"><a class="btn" href="' + wa('Hola María, tengo una consulta sobre un mural.') + '" target="_blank" rel="noopener">Escribir por WhatsApp</a></div>';
      return;
    }
    const mu = muralActual(), dondeTxt = esc_().nombre + ' · ' + (lugar() === 'interior' ? 'interior' : 'exterior');
    const avisos = [];
    if (r.t.plantilla) avisos.push('El coste de la plantilla del logotipo se presupuesta aparte.');
    if (r.alto > L.alturaSinAndamio) avisos.push('Con más de ' + L.alturaSinAndamio + ' m de altura hace falta andamio, que se añade aparte.');
    const msg = [
      'Hola María, he calculado un presupuesto en tu web.',
      '• Dónde: ' + dondeTxt,
      '• Estilo: ' + r.e.nombre + ' (como el mural «' + mu.nombre + '»)',
      '• Técnica: ' + nombreTec[S.tecnica],
      '• Medidas: ' + nf.format(r.ancho) + ' × ' + nf.format(r.alto) + ' m (' + nf.format(round2(r.area)) + ' m²)',
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
          '<div><dt>Trabajo</dt><dd>' + textoDias(r.dias) + '</dd></div>' +
        '</dl>' +
        '<div class="t-tot"><div><span>Sin materiales</span><strong>' + eur(r.sin) + '</strong></div><div><span>Con materiales</span><strong>' + eur(r.con) + '</strong></div></div>' +
        '<p class="iva">IVA no incluido. Cifra orientativa y no vinculante.</p>' +
        (avisos.length ? '<ul class="avisos">' + avisos.map(a => '<li>' + a + '</li>').join('') + '</ul>' : '') +
      '</div>' +
      '<div class="res-actions">' +
        '<a class="btn" href="' + wa(msg) + '" target="_blank" rel="noopener">Enviar este diseño por WhatsApp</a>' +
        (S.simulador ? '<button type="button" class="btn btn-ghost" data-tool-img>Guardar la imagen del simulador</button>'
          : '<button type="button" class="btn btn-ghost" data-ver-sim>Ver cómo queda en el simulador</button>') +
        '<a class="btn btn-ghost" href="' + mailto('Presupuesto de mural', msg) + '">Enviar por correo</a>' +
      '</div>' +
      '<p class="fine">Para darte un presupuesto cerrado necesito fotos, estado de la pared, las medidas exactas y el municipio de realización. El tiempo de trabajo es aproximado.</p>';
    const bImg = $('[data-tool-img]', box), bSim = $('[data-ver-sim]', box);
    if (bImg) bImg.addEventListener('click', ev => compartirImagen(ev.currentTarget));
    if (bSim) bSim.addEventListener('click', () => { ponerModo(true); root.scrollIntoView({behavior: sinMovimiento ? 'auto' : 'smooth'}); });
  };

  /* ---------- Imagen para guardar o compartir ---------- */
  const cargar = src => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
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
    const W = Math.round(Math.min(1800, 1024 * (S.escena === 'persiana' ? g.W / persiana(P.ancho, P.alto).W : 1))), H = Math.round(W * g.H / g.W);
    const k = W / g.W, kH = H / g.H;
    const foto = await cargar(e.img), mural = await cargar(IMG[muralActual().img]);
    const base = document.createElement('canvas');
    base.width = W; base.height = H;
    if (S.escena === 'persiana') dibujarPersiana(base.getContext('2d'), foto, W, H, g); else base.getContext('2d').drawImage(foto, 0, 0, W, H);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H + 56;
    const ctx = cv.getContext('2d');
    ctx.drawImage(base, 0, 0);
    const mx = (p.x + r.x) * k, my = (p.y + r.y) * kH, mw = r.w * k, mh = r.h * kH;
    ctx.save();
    ctx.beginPath(); ctx.rect(mx, my, mw, mh); ctx.clip();
    dibujarCover(ctx, mural, mx, my, mw, mh);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = e.texOp;
    ctx.filter = e.tex;
    ctx.drawImage(base, 0, 0);
    ctx.restore();
    if (S.escena === 'interior') {
      ctx.save();
      ctx.scale(W / 1024, H / 1020);
      ctx.beginPath();
      INTERIOR_FRENTE.forEach(pts => pts.split(' ').forEach((pt, i) => { const [x, y] = pt.split(',').map(Number); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }));
      ctx.clip();
      ctx.drawImage(foto, 0, 0, 1024, 1020);
      ctx.restore();
      ctx.drawImage(await cargar(IMG.sim_interior_planta), PLANTA.x * W / 1024, PLANTA.y * H / 1020, PLANTA.w * W / 1024, PLANTA.h * H / 1020);
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

  reglas(); montarEscena(); pintarControles(); ponerModo(false);
}
initSimulador();
