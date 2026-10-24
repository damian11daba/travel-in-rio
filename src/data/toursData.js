// src/data/toursData.js

export const CATEGORIAS_TOURS = [
  {
    categoria: "Tours Clásicos Río de Janeiro",
    items: [
      { id: "R3", nombre: "Full Day Rio", neto: 395, venta: 550, comision: 50 },
      { id: "CT", nombre: "City Tour", neto: 320, venta: 430, comision: 50 },
      { id: "CM", nombre: "Cristo + Maracanã", neto: 320, venta: 450, comision: 50 },
      { id: "CA", nombre: "Cristo + AquaRio", neto: 395, venta: 450, comision: 50 },
      { id: "PI", nombre: "Petrópolis Imperial", neto: 200, venta: 295, comision: 50 },
      { id: "CR", nombre: "Cascadas Ruta", neto: 120, venta: 250, comision: 50 },
    ]
  },
  {
    categoria: "Playas Paradisíacas desde Río",
    items: [
      { id: "BZ", nombre: "Búzios (Catamarán)", neto: 199, venta: 290, comision: 50 },
      { id: "AR", nombre: "Angra dos Reis (+ tasa local)", neto: 110, venta: 250, comision: 50 },
      { id: "AC", nombre: "Arraial do Cabo (+ tasa local)", neto: 190, venta: 290, comision: 50 },
    ]
  },
  {
    categoria: "Tours desde Búzios",
    items: [
      { id: "BZ_AC", nombre: "Arraial do Cabo (desde Búzios)", neto: 140, venta: 260, comision: 50 },
      { id: "BZ_CF", nombre: "Cabo Frío (desde Búzios)", neto: 140, venta: 260, comision: 50 },
      { id: "BZ_CAT", nombre: "Catamarán (Búzios)", neto: 0, venta: 180, comision: 50 },
      { id: "BZ_RCT", nombre: "Río City Tour (desde Búzios)", neto: 320, venta: 375, comision: 50 },
      { id: "BZ_ARU", nombre: "Arubinha", neto: 290, venta: 375, comision: 50 },
      { id: "BZ_RIO_TR", nombre: "Búzios x Río (transporte)", neto: 320, venta: 375, comision: 50 },
      { id: "BZ_ARU_CF", nombre: "Búzios x Arubinha o Cabo Frío x Arubinha", neto: 290, venta: 375, comision: 50 },
      { id: "BZ_CF_TR", nombre: "Búzios x Cabo Frío (transporte)", neto: 150, venta: 260, comision: 50 },
    ]
  },
  {
    categoria: "Trekking & Naturaleza",
    items: [
      { id: "TR_TEL", nombre: "Pedra do Telégrafo", neto: 130, venta: 250, comision: 50 },
      { id: "TR_COR", nombre: "Corcovado Trek Experience", neto: 230, venta: 330, comision: 50 },
      { id: "TR_GAV", nombre: "Pedra da Gávea", neto: 230, venta: 330, comision: 50 },
      { id: "TR_2IRM", nombre: "Dois Irmãos Experience", neto: 120, venta: 250, comision: 50 },
      { id: "TR_JB", nombre: "Jardín Botánico Experience", neto: 120, venta: 250, comision: 50 },
      { id: "TR_PS", nombre: "Playas Salvajes", neto: 160, venta: 250, comision: 50 },
    ]
  },
  {
    categoria: "Helicopter Experiences",
    items: [
      { id: "HL_STD", nombre: "Helicopter Flight (mín. 3 personas)", neto: 850, venta: 990, comision: 50 },
      { id: "HL_OPN", nombre: "Open Door Helicopter Experience", neto: 1499, venta: 1590, comision: 50 },
    ]
  },
  {
    categoria: "Air · Sea · Action",
    items: [
      { id: "ACT_PAR", nombre: "Parapente Experience", neto: 700, venta: 850, comision: 50 },
      { id: "ACT_DEL", nombre: "Ala Delta Experience", neto: 990, venta: 1500, comision: 50 },
      { id: "ACT_PSL", nombre: "Parasail Experience", neto: 390, venta: 500, comision: 50 },
      { id: "ACT_PAD", nombre: "Paddle Amanecer Experiencia", neto: 150, venta: 270, comision: 50 },
      { id: "ACT_CLM", nombre: "Climbing Experience", neto: 400, venta: 450, comision: 50 },
      { id: "ACT_SPD", nombre: "Speedboat Experience", neto: 299, venta: 390, comision: 50 },
      { id: "ACT_JSK", nombre: "Jetski Experience", neto: 350, venta: 450, comision: 50 },
      { id: "ACT_WKB", nombre: "Wakeboard Experience", neto: 350, venta: 570, comision: 50 },
    ]
  },
  {
    categoria: "Experiencias Curadas",
    items: [
      { id: "EXP_INS", nombre: "Insta Experience (fotográfica)", neto: 300, venta: 450, comision: 50 },
      { id: "EXP_MAR", nombre: "Maracanã Experience (estadio + museo)", neto: 230, venta: 450, comision: 50 },
      { id: "EXP_BIO", nombre: "BioParque Experience", neto: 100, venta: 250, comision: 50 },
      { id: "EXP_AQU", nombre: "AquaRio & Boulevard Olímpico", neto: 200, venta: 250, comision: 50 },
      { id: "EXP_CRN", nombre: "Carnaval Experience", neto: 150, venta: 350, comision: 50 },
    ]
  },
  {
    categoria: "Selección Especial",
    items: [
      { id: "ESP_AMN", nombre: "Amanecer Pan de Azúcar (café da manhã)", neto: 450, venta: 650, comision: 50 },
      { id: "ESP_ROX", nombre: "Show Roxy & Cena Night", neto: 850, venta: 1019, comision: 50 },
      { id: "ESP_CUL", nombre: "Río Arte & Cultura (ruta de museos)", neto: 300, venta: 480, comision: 50 },
      { id: "ESP_SHP", nombre: "Shopping Experience", neto: 150, venta: 420, comision: 50 },
    ]
  }
];

export const RUTAS_TRASLADOS = [
  {
    id: "TR_GIG_CEN",
    ruta: "GIG ⇄ Centro",
    capacidad: [
      { tipo: "4 PAX", neto: 70, venta: 130, comision: 25 },
      { tipo: "5-6 PAX", neto: 90, venta: 150, comision: 25 },
      { tipo: "7 PAX", neto: 100, venta: 160, comision: 25 },
      { tipo: "VAN 15-20", neto: 400, venta: 460, comision: 25 },
      { tipo: "BUS 42-46", neto: 850, venta: 910, comision: 25 },
    ]
  },
  {
    id: "TR_GIG_COP",
    ruta: "GIG ⇄ Copacabana / Ipanema",
    capacidad: [
      { tipo: "4 PAX", neto: 90, venta: 150, comision: 25 },
      { tipo: "5-6 PAX", neto: 130, venta: 190, comision: 25 },
      { tipo: "7 PAX", neto: 150, venta: 210, comision: 25 },
      { tipo: "VAN 15-20", neto: 550, venta: 610, comision: 25 },
      { tipo: "BUS 42-46", neto: 1000, venta: 1060, comision: 25 },
    ]
  },
  {
    id: "TR_GIG_BAR",
    ruta: "GIG ⇄ Barra da Tijuca",
    capacidad: [
      { tipo: "4 PAX", neto: 120, venta: 180, comision: 25 },
      { tipo: "5-6 PAX", neto: 150, venta: 210, comision: 25 },
      { tipo: "7 PAX", neto: 180, venta: 240, comision: 25 },
      { tipo: "VAN 15-20", neto: 550, venta: 610, comision: 25 },
      { tipo: "BUS 42-46", neto: 1300, venta: 1360, comision: 25 },
    ]
  },
  {
    id: "TR_GIG_BUZ",
    ruta: "GIG ⇄ Búzios / Arraial / Cabo Frio",
    capacidad: [
      { tipo: "4 PAX", neto: 400, venta: 460, comision: 25 },
      { tipo: "5-6 PAX", neto: 500, venta: 560, comision: 25 },
      { tipo: "7 PAX", neto: 600, venta: 660, comision: 25 },
      { tipo: "VAN 15-20", neto: 1000, venta: 1060, comision: 25 },
      { tipo: "BUS 42-46", neto: 1800, venta: 1860, comision: 25 },
    ]
  }
];
