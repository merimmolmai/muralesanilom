/* =========================================================
   AJUSTES DE LA WEB: aquí se cambian los precios, los datos
   de contacto y los textos de los proyectos.
   ========================================================= */
const CONFIG = {

  /* ---------- CONTACTO ---------- */
  contacto: {
    whatsapp: '34623718154',          // con prefijo, sin + ni espacios
    telefono: '623 71 81 54',
    telefonoLink: '+34623718154',
    email: 'murales.anilom@gmail.com',
    instagram: 'murales.anilom',
    web: 'www.muralesanilom.com',
    webArte: 'www.m-anilom.art'
  },

  /* ---------- LÍMITES DE ALTURA (en metros, desde el suelo) ---------- */
  limites: {
    alturaSinAndamio: 4,    // hasta aquí, sin plus de andamio
    alturaMaxima: 6         // por encima de esta altura no se hace el mural
  },

  /* Importe mínimo por mural (sin IVA). Pon 0 para no usar mínimo. */
  minimoMural: 0,

  /* ---------- PRECIOS POR m² (sin IVA) ----------
     m2  = precio sin materiales
     mat = precio con materiales (orientativo)
     null en "mat" = el material es la plantilla y se presupuesta aparte
     null en pintura / spray = esa técnica no está disponible para ese estilo
     (La web no muestra esta tabla: se usa solo para calcular.) */
  precios: {
    fondo:     { pintura: { m2: 10, mat: 15 }, spray: { m2: 20, mat: 30 } },
    logotipo:  { pintura: { m2: 30, mat: null }, spray: { m2: 30, mat: null } },
    grafico:   { pintura: { m2: 50, mat: 55 }, spray: { m2: 50, mat: 55 } },
    ilustrado: { pintura: { m2: 62, mat: 70 }, spray: { m2: 62, mat: 70 } },
    realista:  { pintura: { m2: 72, mat: 80 }, spray: { m2: 72, mat: 80 } },
    disney:    { pintura: { m2: 45, mat: 55 }, spray: null }
  },

  /* ---------- ESTILOS DE LA CALCULADORA ----------
     "usa" indica qué filas de precios se suman.
     "ejemplo" es la foto que se enseña como ejemplo del estilo.
     "murales" son los murales que enseña el simulador para ese estilo
     (img = recorte del mural en /img/simulador/, nombre = cómo se llama,
     para = 'exterior' o 'interior': en la persiana sale el de exterior y en la pared de casa el de interior;
     sin "para" vale para los dos sitios. Se enseña el primero de la lista que encaje).
     "m2dia" = metros cuadrados que se pintan, más o menos, en un día de trabajo
     (se usa para calcular cuántos días se tarda). */
  estilosCalculadora: [
    { id: 'logo',      nombre: 'Fondo liso + logotipo', usa: ['fondo', 'logotipo'], ejemplo: 'bienpaga',
      desc: 'Un color liso con tu logotipo encima.', m2dia: 8,
      murales: [ { img: 'sim_bienpaga', nombre: 'La BienPagá', para: 'exterior' }, { img: 'sim_roiz', nombre: 'Carnicería Roiz', para: 'exterior' } ] },
    { id: 'grafico',   nombre: 'Gráfico',               usa: ['grafico'],           ejemplo: 'mapa2',
      desc: 'Letras, formas y composiciones.', m2dia: 4,
      murales: [ { img: 'sim_mapa2', nombre: 'Mapamundi', para: 'interior' }, { img: 'sim_malecon7', nombre: 'Un pedacito de Cuba', para: 'interior' } ] },
    { id: 'ilustrado', nombre: 'Ilustrado',             usa: ['ilustrado'],         ejemplo: 'cerezos',
      desc: 'Dibujo con detalle y color.', m2dia: 2.5,
      murales: [ { img: 'sim_gourmet1', nombre: 'Café y olivos', para: 'exterior' }, { img: 'sim_gourmet3', nombre: 'Viñedo', para: 'exterior' }, { img: 'sim_cerezos', nombre: 'Cerezos en flor', para: 'interior' } ] },
    { id: 'realista',  nombre: 'Realista',              usa: ['realista'],          ejemplo: 'malecon1',
      desc: 'Retratos y escenas con volumen.', m2dia: 1.5,
      murales: [ { img: 'sim_malecon1', nombre: 'Retrato cubano' }, { img: 'sim_jaen', nombre: 'Selva con cascada', para: 'exterior' }, { img: 'sim_playa', nombre: 'Ventana a la playa', para: 'interior' } ] },
    { id: 'disney',    nombre: 'Dibujos estilo Disney', usa: ['disney'],            ejemplo: 'enanitos',
      desc: 'Personajes de dibujos animados.', m2dia: 3,
      murales: [ { img: 'sim_enanitos', nombre: 'Los siete enanitos' }, { img: 'sim_dayara', nombre: 'Kiosko Dayara', para: 'exterior' } ] }
  ],

  /* El graffiti (spray) cunde más: los m²/día de arriba se multiplican por esto. */
  rendimientoSpray: 1.3,

  /* ---------- SIMULADOR ----------
     Medidas reales (en metros) de las paredes de ejemplo del simulador. */
  simulador: {
    persiana: { ancho: 3, alto: 2.4 },     // la persiana de la foto local.webp (crece si el mural es más grande)
    interior: { ancho: 3.3, alto: 2.7 }    // la pared del fondo de la foto interior.webp
  },

  /* ---------- ENCUADRE DE LAS FOTOS ----------
     Qué parte de la foto se ve cuando se recorta.
     Formato: 'horizontal vertical' (0% = izquierda/arriba, 100% = derecha/abajo) */
  encuadre: {
    malecon1:'60% 30%', malecon2:'50% 35%', malecon3:'50% 50%', malecon4:'50% 60%', malecon5:'50% 40%',
    malecon6:'50% 50%', malecon7:'25% 50%', malecon_antes1:'50% 55%', malecon_antes2:'50% 50%',
    gourmet1:'50% 65%', gourmet2:'50% 62%', gourmet3:'50% 62%', gourmet4:'35% 50%', gourmet_proceso:'50% 50%',
    dayara:'62% 55%', dayara_antes:'50% 50%', cortijo1:'62% 55%', cortijo2:'62% 60%',
    historia:'30% 50%',
    jaen:'50% 50%', jaen_antes:'50% 40%', jaen_yo:'55% 50%',
    granada2025:'28% 50%', granada2025_antes:'30% 55%', granada2025_yo:'50% 40%',
    playa:'50% 50%', mapa1:'40% 50%', mapa2:'55% 50%', enanitos:'72% 50%',
    cerezos:'50% 45%', cerezos_espejo:'50% 55%', cerezos_yo:'50% 40%',
    bienpaga:'50% 62%', roiz:'50% 50%'
  },

  /* Fotos que se muestran enteras (sin recortar) en la rejilla */
  fotosEnteras: ['roiz'],

  /* ---------- FOTOS DE LA PORTADA (galería de 5 x 2) ---------- */
  galeriaInicio: ['malecon1','gourmet1','granada2025','cerezos','jaen','bienpaga','dayara','mapa2','cortijo1','playa'],

  /* ---------- PROYECTOS ----------
     tipo: 'negocio' o 'particular'
     "destacados" (opcional) lista los murales más importantes del proyecto.
     La primera foto de cada proyecto es el resultado final. */
  proyectos: [
    { anio: 2026, titulo: 'Malecón', lugar: 'Martos, Jaén', tipo: 'negocio',
      texto: 'Un pub con ambiente cubano. Es el mayor proyecto realizado hasta la fecha: diseñé y pinté todo el local, fachada incluida.',
      destacados: ['Retrato de la cubana', 'Coche con palmeras', 'Paisaje marítimo de la barra', 'Cristalera'],
      fotos: [
        { video: true, src: 'video', poster: 'poster', alt: 'Vídeo del mural del pub Malecón en Martos' },
        { img: 'malecon1', alt: 'Retrato de una mujer con pañuelo de la bandera cubana y un puro, junto a un coche clásico azul' },
        { img: 'malecon5', alt: 'Coche clásico azul con palmeras y lettering en la pared del pub' },
        { img: 'malecon3', alt: 'Paisaje marítimo pintado en la barra, con una playa, casas coloniales y el mar' },
        { img: 'malecon6', alt: 'Cristalera del pub pintada con instrumentos, hojas y un pentagrama' },
        { img: 'malecon7', alt: 'Frase “Más que un bar, un pedacito de Cuba en Martos” pintada con una palmera' },
        { img: 'malecon4', alt: 'Coche clásico azul con palmera, en proceso', etiqueta: 'En proceso' },
        { img: 'malecon2', alt: 'Retrato a medio pintar sobre la pared blanca', etiqueta: 'En proceso' },
        { img: 'malecon_antes1', alt: 'El local antes de empezar a pintar', etiqueta: 'Antes' },
        { img: 'malecon_antes2', alt: 'Techo y conductos del local antes de pintar', etiqueta: 'Antes' }
      ] },
    { anio: 2026, titulo: 'Gourmet Sevilla', lugar: 'Mercado del Arenal, Sevilla', tipo: 'negocio',
      texto: 'Persianas de una tienda gourmet pintadas con café, olivos, vino y un viñedo.',
      fotos: [
        { img: 'gourmet1', alt: 'Dos persianas pintadas con granos de café y una taza, y un olivar con aceitunas' },
        { img: 'gourmet2', alt: 'Persiana pintada con una botella, una jarra de vino y uvas' },
        { img: 'gourmet3', alt: 'Persiana doble pintada con un viñedo, colinas y una casa de campo' },
        { img: 'gourmet4', alt: 'Las tres persianas del local, con el café, el olivar y el viñedo, casi terminadas', etiqueta: 'En proceso' },
        { img: 'gourmet_proceso', alt: 'Mano con guante y un bote de spray pintando las colinas del viñedo', etiqueta: 'En proceso' }
      ] },
    { anio: 2026, titulo: 'Kiosko Dayara', lugar: 'Sevilla', tipo: 'negocio',
      texto: 'La fachada de un kiosko de chucherías, con Minnie, Mickey, Pluto y los productos de la tienda.',
      fotos: [
        { img: 'dayara', alt: 'Fachada pintada con Minnie, Mickey y Pluto, y golosinas' },
        { img: 'dayara_antes', alt: 'La fachada blanca antes de pintar el mural', etiqueta: 'Antes' }
      ] },
    { anio: 2026, titulo: 'Mural en un cortijo', lugar: 'Sevilla', tipo: 'particular',
      texto: 'El portón de un cortijo con un gamo y un jabalí entre flores del campo.',
      fotos: [
        { img: 'cortijo1', alt: 'Portón de un cortijo de noche con un gamo, un jabalí y el logotipo de un ciervo' },
        { img: 'cortijo2', alt: 'El gamo y el jabalí a medio pintar sobre el portón marrón', etiqueta: 'En proceso' }
      ] },
    { anio: 2025, titulo: 'La Historia Interminable', lugar: 'Sevilla', tipo: 'particular',
      texto: 'El cabecero de una casa con un paisaje inspirado en una escena de la película La Historia Interminable.',
      fotos: [
        { img: 'historia', alt: 'Pared con un paisaje nocturno de rocas doradas y moradas, un cielo estrellado y dos esfinges doradas delante' }
      ] },
    { anio: 2025, titulo: 'Montañas en tinta', lugar: 'Granada', tipo: 'particular',
      texto: 'El cabecero de un dormitorio con montañas entre la niebla y una pagoda, en blanco y negro.',
      fotos: [
        { img: 'granada2025', alt: 'Dormitorio con montañas y una pagoda pintadas en tinta negra tras el cabecero' },
        { img: 'granada2025_yo', alt: 'María pintando las montañas del cabecero subida a una escalera', etiqueta: 'En proceso' },
        { img: 'granada2025_antes', alt: 'La pared blanca con el boceto a lápiz', etiqueta: 'Antes' }
      ] },
    { anio: 2025, titulo: 'La BienPagá', lugar: 'Sevilla', tipo: 'negocio',
      texto: 'Persiana amarilla con el logotipo de una casa de compra de oro, pintado sobre fondo liso.',
      fotos: [
        { img: 'bienpaga', alt: 'Persiana amarilla con el logotipo de La BienPagá pintado en negro' }
      ] },
    { anio: 2025, titulo: 'Carnicería Roiz', lugar: 'Sevilla', tipo: 'negocio',
      texto: 'Las letras del nombre pintadas en gran tamaño sobre las dos persianas.',
      fotos: [
        { img: 'roiz', alt: 'Persianas de una carnicería con las letras RO e IZ pintadas en grande' }
      ] },
    { anio: 2024, titulo: 'Ventana a la playa', lugar: 'Granada', tipo: 'particular',
      texto: 'Una ventana abierta al mar, pintada en una pared interior.',
      fotos: [
        { img: 'playa', alt: 'Ventana pintada en la pared con una playa, un acantilado verde y nubes rosas' }
      ] },
    { anio: 2024, titulo: 'Mapamundi', lugar: 'Granada', tipo: 'particular',
      texto: 'Un mapa del mundo con monumentos, animales y barcos dibujados, en una habitación.',
      fotos: [
        { img: 'mapa1', alt: 'Habitación con un mapamundi pintado en la pared' },
        { img: 'mapa2', alt: 'Detalle del mapamundi con monumentos y barcos dibujados' }
      ] },
    { anio: 2023, titulo: 'Selva con cascada', lugar: 'Jaén', tipo: 'particular',
      texto: 'El muro de un patio junto a la piscina convertido en una selva con cascada y un tucán.',
      fotos: [
        { img: 'jaen', alt: 'Muro de un patio con piscina pintado como una selva con cascada y un tucán' },
        { img: 'jaen_yo', alt: 'María pintando la selva del muro subida a una escalera', etiqueta: 'En proceso' },
        { img: 'jaen_antes', alt: 'El muro rojo del patio antes de pintar', etiqueta: 'Antes' }
      ] },
    { anio: 2023, titulo: 'Cerezos en flor', lugar: 'Sevilla', tipo: 'particular',
      texto: 'Un recibidor con ramas de cerezo, flores y pájaros azules alrededor de un espejo.',
      fotos: [
        { img: 'cerezos', alt: 'Recibidor con ramas de cerezo en flor y pájaros azules alrededor de un espejo' },
        { img: 'cerezos_espejo', alt: 'Detalle de las flores y un pájaro azul junto al espejo', etiqueta: 'Detalle' },
        { img: 'cerezos_yo', alt: 'María pintando las ramas de cerezo', etiqueta: 'En proceso' }
      ] },
    { anio: 2023, titulo: 'Los siete enanitos', lugar: 'Granada', tipo: 'particular',
      texto: 'Los siete enanitos subiendo por la pared de una escalera.',
      fotos: [
        { img: 'enanitos', alt: 'Los siete enanitos caminando por la pared de una escalera' }
      ] }
  ]
};
