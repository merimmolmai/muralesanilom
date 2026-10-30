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
    alturaMaxima: 6         // por encima de esta altura no se hace el mural
  },

  /* ---------- REGLAS DEL PRESUPUESTO (sin IVA) ---------- */
  presupuesto: {
    minimo: 100,              // importe mínimo de un mural sin materiales
    materiales: 0.30,         // con materiales = precio sin materiales + 30 %
    descuento: { desdeM2: 20, porcentaje: 0.10 },              // más de 20 m²: 10 % de descuento
    altura: { desde: 3, sinMateriales: 50, conMateriales: 300 }, // más de 3 m de alto: suplemento (no se enseña, va dentro del precio)
    cristal: { m2: 40 }       // en la localización "Cristales": precio por m², sea cual sea el estilo (con el mismo mínimo)
  },

  /* ---------- UBICACIÓN ----------
     plus = lo que se suma al precio por desplazamiento (no se enseña en el selector, solo va dentro del precio final).
     Por provincia:
       sinPlus = municipios sin desplazamiento (la capital y los pueblos a menos de 50 km de Sevilla o Granada)
       conPlus = municipios con desplazamiento (pueblos a más de 50 km, y toda Jaén y Málaga)
     El primero de "sinPlus" o "conPlus" que coincida con el nombre de la provincia es la capital y sale el primero.
     Si eligen "Otro municipio" en Granada o Sevilla, se pregunta si está a más o menos de 50 km.
     "Otra provincia" lleva siempre el plus. */
  ubicaciones: {
    plus: 30,
    provincias: [
      { id: 'granada', nombre: 'Granada',
        sinPlus: ['Granada', 'Albolote', 'Alfacar', 'Alhendín', 'Armilla', 'Atarfe', 'Cájar', 'Cenes de la Vega', 'Chauchina', 'Churriana de la Vega',
          'Cijuela', 'Cúllar Vega', 'Dúrcal', 'Escúzar', 'Fuente Vaqueros', 'Gójar', 'Güéjar Sierra', 'Huétor Santillán', 'Huétor Tájar', 'Huétor Vega',
          'Íllora', 'Iznalloz', 'Jun', 'La Malahá', 'La Zubia', 'Láchar', 'Lanjarón', 'Las Gabias', 'Lecrín', 'Maracena', 'Moclín', 'Monachil',
          'Nigüelas', 'Ogíjares', 'Otura', 'Padul', 'Peligros', 'Pinos Genil', 'Pinos Puente', 'Pulianas', 'Quéntar', 'Santa Fe', 'Valderrubio',
          'Vegas del Genil', 'Ventas de Huelma', 'Víznar'],
        conPlus: ['Albuñol', 'Alhama de Granada', 'Almuñécar', 'Baza', 'Castell de Ferro', 'Cúllar', 'Guadix', 'Huéscar', 'La Herradura', 'Loja',
          'Montefrío', 'Motril', 'Órgiva', 'Pampaneira', 'Salobreña', 'Trevélez', 'Ugíjar'] },
      { id: 'sevilla', nombre: 'Sevilla',
        sinPlus: ['Sevilla', 'Alcalá de Guadaíra', 'Alcalá del Río', 'Arahal', 'Aznalcázar', 'Aznalcóllar', 'Benacazón', 'Bollullos de la Mitación',
          'Bormujos', 'Brenes', 'Camas', 'Cantillana', 'Carmona', 'Castilleja de la Cuesta', 'Coria del Río', 'Dos Hermanas', 'El Viso del Alcor',
          'Espartinas', 'Gelves', 'Gerena', 'Gines', 'Guillena', 'La Algaba', 'La Puebla del Río', 'La Rinconada', 'Los Palacios y Villafranca',
          'Mairena del Alcor', 'Mairena del Aljarafe', 'Olivares', 'Palomares del Río', 'Pilas', 'Salteras', 'San Juan de Aznalfarache',
          'Sanlúcar la Mayor', 'Santiponce', 'Tomares', 'Umbrete', 'Utrera', 'Valencina de la Concepción', 'Villamanrique de la Condesa'],
        conPlus: ['Cazalla de la Sierra', 'Constantina', 'Écija', 'El Coronil', 'Estepa', 'Fuentes de Andalucía', 'Lebrija', 'Lora del Río',
          'Marchena', 'Morón de la Frontera', 'Osuna', 'Paradas', 'Puebla de Cazalla'] },
      { id: 'jaen', nombre: 'Jaén', sinPlus: [],
        conPlus: ['Jaén', 'Alcalá la Real', 'Alcaudete', 'Andújar', 'Baeza', 'Bailén', 'Cazorla', 'Huelma', 'Jódar', 'La Carolina', 'Linares',
          'Mancha Real', 'Martos', 'Mengíbar', 'Porcuna', 'Torredelcampo', 'Torredonjimeno', 'Úbeda', 'Villacarrillo'] },
      { id: 'malaga', nombre: 'Málaga', sinPlus: [],
        conPlus: ['Málaga', 'Alhaurín de la Torre', 'Alhaurín el Grande', 'Álora', 'Antequera', 'Archidona', 'Benalmádena', 'Cártama', 'Coín',
          'Estepona', 'Fuengirola', 'Manilva', 'Marbella', 'Mijas', 'Nerja', 'Rincón de la Victoria', 'Ronda', 'Torremolinos', 'Torrox', 'Vélez-Málaga'] }
    ]
  },

  /* ---------- PRECIOS POR m² SIN MATERIALES (sin IVA) ----------
     null = esa técnica no está disponible para ese estilo
     (La web no muestra esta tabla: se usa solo para calcular.) */
  precios: {
    fondo:     { pintura: 10, spray: 20 },
    logotipo:  { pintura: 30, spray: 30 },
    grafico:   { pintura: 50, spray: 50 },
    ilustrado: { pintura: 62, spray: 62 },
    realista:  { pintura: 72, spray: 72 },
    disney:    { pintura: 45, spray: null },
    cristal:   { pintura: 40, spray: null }
  },

  /* ---------- ESTILOS DE LA CALCULADORA ----------
     "usa" indica qué filas de precios se suman.
     "ejemplo" es la foto que se enseña como ejemplo del estilo.
     "murales" son los murales que enseña el simulador para ese estilo
     (img = recorte del mural en /img/simulador/, nombre = cómo se llama,
     para = dónde se enseña: 'persiana', 'exterior' (persiana y pared exterior), 'interior' o 'cristal';
     sin "para" vale para todos los sitios. Se enseña el primero de la lista que encaje).
     */
  estilosCalculadora: [
    { id: 'logo',      nombre: 'Fondo liso + logotipo', usa: ['fondo', 'logotipo'], ejemplo: 'bienpaga',
      desc: 'Un color liso con tu logotipo encima.',
      murales: [ { img: 'sim_bienpaga', nombre: 'La BienPagá', para: 'exterior' }, { img: 'sim_roiz', nombre: 'Carnicería Roiz', para: 'exterior' } ] },
    { id: 'grafico',   nombre: 'Gráfico',               usa: ['grafico'],           ejemplo: 'mapa2',
      desc: 'Letras, formas y composiciones.',
      murales: [ { img: 'sim_mapa2', nombre: 'Mapamundi', para: 'interior' }, { img: 'sim_malecon7', nombre: 'Un pedacito de Cuba', para: 'interior' } ] },
    { id: 'ilustrado', nombre: 'Ilustrado',             usa: ['ilustrado'],         ejemplo: 'cerezos',
      desc: 'Dibujo con detalle y color.',
      murales: [ { img: 'sim_cerezos', nombre: 'Cerezos en flor', para: 'interior' }, { img: 'sim_gourmet2', nombre: 'Gourmet Sevilla: el vino', para: 'persiana' }, { img: 'sim_gourmet1', nombre: 'Café y olivos', para: 'exterior' } ] },
    { id: 'realista',  nombre: 'Realista',              usa: ['realista'],          ejemplo: 'malecon1',
      desc: 'Retratos y escenas con volumen.',
      murales: [ { img: 'sim_malecon1', nombre: 'Retrato cubano' }, { img: 'sim_jaen', nombre: 'Selva con cascada', para: 'exterior' }, { img: 'sim_playa', nombre: 'Ventana a la playa', para: 'interior' } ] },
    { id: 'disney',    nombre: 'Dibujos estilo Disney', usa: ['disney'],            ejemplo: 'enanitos',
      desc: 'Personajes de dibujos animados.',
      murales: [ { img: 'sim_enanitos', nombre: 'Los siete enanitos' }, { img: 'sim_dayara', nombre: 'Kiosko Dayara', para: 'exterior' } ] },
    { id: 'cristal',   nombre: 'Pintura en cristal',    usa: ['cristal'],           ejemplo: 'cristal_navidad',
      desc: 'Dibujos pintados sobre vidrio.',
      murales: [ { img: 'sim_cristal_navidad', nombre: 'Escaparate de Navidad' } ] }
  ],

  /* ---------- SIMULADOR ----------
     Medidas reales (en metros) de las paredes de ejemplo del simulador. */
  simulador: {
    persiana: { ancho: 3, alto: 2.4 },     // la persiana de la foto local.webp (crece si el mural es más grande)
    exterior: { ancho: 4.75, alto: 5.25 }, // la fachada de la foto pared-exterior.webp
    interior: { ancho: 3.3, alto: 2.7 },   // la pared del fondo de la foto interior.webp
    cristal:  { ancho: 3.16, alto: 2.11 }  // el escaparate del dibujo cristal.svg
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
    bienpaga:'50% 62%', roiz:'50% 50%', cristal_navidad:'50% 32%', cristales1:'50% 35%', cristales_yo:'60% 40%',
    malecon_aseos:'50% 40%', dayara3:'50% 40%', granada2025_yo2:'55% 35%'
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
        { img: 'malecon_aseos', alt: 'Entrada a los aseos pintada con la bandera cubana y un espejo con una palmera reflejada' },
        { img: 'malecon4', alt: 'Coche clásico azul con palmera, en proceso', etiqueta: 'En proceso' },
        { img: 'malecon_barra', alt: 'La barra del pub con el paisaje marítimo a medio pintar y los botes de pintura en el suelo', etiqueta: 'En proceso' },
        { img: 'malecon2', alt: 'Retrato a medio pintar sobre la pared blanca', etiqueta: 'En proceso' },
        { img: 'malecon_antes1', alt: 'El local antes de empezar a pintar', etiqueta: 'Antes' },
        { img: 'malecon_antes2', alt: 'Techo y conductos del local antes de pintar', etiqueta: 'Antes' }
      ] },
    { anio: 2026, titulo: 'Gourmet Sevilla', lugar: 'Mercado del Arenal, Sevilla', tipo: 'negocio',
      texto: 'Persianas de una tienda gourmet pintadas con café, olivos, vino y un viñedo.',
      fotos: [
        { img: 'gourmet1', alt: 'Dos persianas pintadas con granos de café y una taza, y un olivar con aceitunas' },
        { video: true, src: 'v_gourmet', poster: 'poster_gourmet', alt: 'Vídeo de las persianas pintadas de Gourmet Sevilla' },
        { img: 'gourmet2', alt: 'Persiana pintada con una botella, una jarra de vino y uvas' },
        { img: 'gourmet3', alt: 'Persiana doble pintada con un viñedo, colinas y una casa de campo' },
        { img: 'gourmet4', alt: 'Las tres persianas del local, con el café, el olivar y el viñedo, casi terminadas', etiqueta: 'En proceso' },
        { img: 'gourmet_proceso', alt: 'Mano con guante y un bote de spray pintando las colinas del viñedo', etiqueta: 'En proceso' },
        { img: 'gourmet_proceso2', alt: 'La persiana del vino a medio pintar, con la botella y la jarra esbozadas', etiqueta: 'En proceso' },
        { img: 'gourmet_proceso3', alt: 'Las primeras capas del viñedo sobre la persiana doble', etiqueta: 'En proceso' },
        { img: 'gourmet_proceso4', alt: 'El viñedo con las hileras de vides y la casa de campo, casi terminado', etiqueta: 'En proceso' }
      ] },
    { anio: 2026, titulo: 'Kiosko Dayara', lugar: 'Sevilla', tipo: 'negocio',
      texto: 'La fachada de un kiosko de chucherías, con Minnie, Mickey, Pluto y los productos de la tienda.',
      fotos: [
        { img: 'dayara', alt: 'Fachada pintada con Minnie, Mickey y Pluto, y golosinas' },
        { video: true, src: 'v_dayara', poster: 'poster_dayara', alt: 'Vídeo de la fachada del Kiosko Dayara' },
        { img: 'dayara2', alt: 'La fachada del kiosko vista desde la ventana, con el nombre Dayara y Minnie' },
        { img: 'dayara3', alt: 'Minnie Mouse con el nombre del kiosko pintado encima', etiqueta: 'Detalle' },
        { img: 'dayara_antes2', alt: 'La fachada roja del kiosko antes de empezar', etiqueta: 'Antes' },
        { img: 'dayara_antes', alt: 'La fachada blanca antes de pintar el mural', etiqueta: 'Antes' }
      ] },
    { anio: 2026, titulo: 'Mural en un cortijo', lugar: 'Sevilla', tipo: 'particular',
      texto: 'El portón de un cortijo con un gamo y un jabalí entre flores del campo.',
      fotos: [
        { img: 'cortijo1', alt: 'Portón de un cortijo de noche con un gamo, un jabalí y el logotipo de un ciervo' },
        { video: true, src: 'v_cortijo', poster: 'poster_cortijo', alt: 'Vídeo del portón del cortijo de noche' },
        { img: 'cortijo2', alt: 'El gamo y el jabalí a medio pintar sobre el portón marrón', etiqueta: 'En proceso' }
      ] },
    { anio: 2025, titulo: 'La Historia Interminable', lugar: 'Sevilla', tipo: 'particular',
      texto: 'El cabecero de una casa con un paisaje inspirado en una escena de la película La Historia Interminable.',
      fotos: [
        { img: 'historia', alt: 'Pared con un paisaje nocturno de rocas doradas y moradas, un cielo estrellado y dos esfinges doradas delante' },
        { video: true, src: 'v_historia', poster: 'poster_historia', alt: 'Vídeo del mural de La Historia Interminable' },
        { img: 'historia_proceso1', alt: 'El paisaje de rocas doradas y el cielo nocturno casi terminados', etiqueta: 'En proceso' },
        { img: 'historia_proceso3', alt: 'Las rocas de la derecha a medio pintar', etiqueta: 'En proceso' },
        { img: 'historia_proceso4', alt: 'Las rocas de la izquierda ya con luz y sombra', etiqueta: 'En proceso' },
        { img: 'historia_proceso2', alt: 'Las primeras manchas de color: el cielo azul y la silueta de las rocas', etiqueta: 'En proceso' }
      ] },
    { anio: 2025, titulo: 'Montañas en tinta', lugar: 'Granada', tipo: 'particular',
      texto: 'El cabecero de un dormitorio con montañas entre la niebla y una pagoda, en blanco y negro.',
      fotos: [
        { img: 'granada2025', alt: 'Dormitorio con montañas y una pagoda pintadas en tinta negra tras el cabecero' },
        { img: 'granada2025_2', alt: 'El dormitorio completo con el mural de montañas detrás de la cama' },
        { img: 'granada2025_yo2', alt: 'María pintando con pincel las montañas entre la niebla', etiqueta: 'En proceso' },
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
    { anio: 2024, titulo: 'Cristales de Navidad', lugar: 'Granada', tipo: 'negocio',
      texto: 'El escaparate de una academia de inglés decorado para Navidad: bolas colgando, un “Merry Christmas”, abetos y el belén, pintados sobre el cristal.',
      fotos: [
        { img: 'cristales1', alt: 'Escaparate pintado con bolas de Navidad doradas, “Merry Christmas” en rosa y un belén blanco' },
        { img: 'cristales2', alt: 'La fachada de la academia con los dos escaparates decorados para Navidad' },
        { img: 'cristales_yo', alt: 'María pintando las bolas de Navidad sobre el cristal del escaparate', etiqueta: 'En proceso' }
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
        { img: 'mapa2', alt: 'Detalle del mapamundi con monumentos y barcos dibujados' },
        { video: true, src: 'v_mapamundi', poster: 'poster_mapamundi', alt: 'Vídeo del mapamundi pintado en la habitación' },
        { img: 'mapa3', alt: 'Europa y África con barcos antiguos y una rosa de los vientos sobre fondo envejecido', etiqueta: 'Detalle' }
      ] },
    { anio: 2023, titulo: 'Selva con cascada', lugar: 'Jaén', tipo: 'particular',
      texto: 'El muro de un patio junto a la piscina convertido en una selva con cascada y un tucán.',
      fotos: [
        { img: 'jaen', alt: 'Muro de un patio con piscina pintado como una selva con cascada y un tucán' },
        { video: true, src: 'v_selva', poster: 'poster_selva', alt: 'Vídeo del muro del patio con la selva y la cascada' },
        { video: true, src: 'v_selva_proceso', poster: 'poster_selva_proceso', alt: 'Vídeo de María pintando la cascada subida a una escalera', horizontal: true },
        { img: 'jaen_yo', alt: 'María pintando la selva del muro subida a una escalera', etiqueta: 'En proceso' },
        { img: 'jaen_antes', alt: 'El muro rojo del patio antes de pintar', etiqueta: 'Antes' }
      ] },
    { anio: 2023, titulo: 'Cerezos en flor', lugar: 'Sevilla', tipo: 'particular',
      texto: 'Un recibidor con ramas de cerezo, flores y pájaros azules alrededor de un espejo.',
      fotos: [
        { img: 'cerezos', alt: 'Recibidor con ramas de cerezo en flor y pájaros azules alrededor de un espejo' },
        { video: true, src: 'v_cerezos', poster: 'poster_cerezos', alt: 'Vídeo del recibidor con las ramas de cerezo' },
        { img: 'cerezos_pared', alt: 'La pared entera con ramas de cerezo en flor y dos pájaros azules' },
        { img: 'cerezos_pajaro', alt: 'Un pájaro azul posado en una rama con flores rosas', etiqueta: 'Detalle' },
        { img: 'cerezos_espejo', alt: 'Detalle de las flores y un pájaro azul junto al espejo', etiqueta: 'Detalle' },
        { img: 'cerezos_yo', alt: 'María pintando las ramas de cerezo', etiqueta: 'En proceso' }
      ] },
    { anio: 2023, titulo: 'Los siete enanitos', lugar: 'Granada', tipo: 'particular',
      texto: 'Los siete enanitos subiendo por la pared de una escalera.',
      fotos: [
        { img: 'enanitos', alt: 'Los siete enanitos caminando por la pared de una escalera' },
        { img: 'enanitos2', alt: 'Tres de los enanitos con su farol y sus picos', etiqueta: 'Detalle' },
        { img: 'enanitos3', alt: 'Los otros cuatro enanitos subiendo la escalera', etiqueta: 'Detalle' }
      ] }
  ]
};
