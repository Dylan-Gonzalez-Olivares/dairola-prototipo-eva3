// js/data.js
// Capa de datos del prototipo académico - Chocolatería D'Airola (EVA 3 TIEL25)

export const SUPPLIER_INFO = {
  bannerAviso: "Sitio académico ficticio - INACAP Valparaíso (Simulación sin transacciones reales)",
  razonSocial: "Chocolatería Artesanal D'Airola SpA (Datos ficticios para fines académicos)",
  rut: "76.543.210-K (Ficticio)",
  domicilio: "Av. Edmundo Eluchans 1850, Local 2, Reñaca, Viña del Mar, Región de Valparaíso",
  correo: "contacto.academico@dairola-simulacion.cl",
  whatsappNumero: "56976689327",
  instagramHandle: "@chocolateriadairola"
};

// Zonas de despacho reales V Región con control de cadena de frío
export const SHIPPING_ZONES = [
  {
    id: "renaca",
    name: "Reñaca",
    available: true,
    cost: 2500,
    eta: "30 - 40 min",
    method: "Furgón climatizado propio (16°C - 18°C)"
  },
  {
    id: "concon",
    name: "Concón",
    available: true,
    cost: 3200,
    eta: "40 - 50 min",
    method: "Furgón climatizado propio + gel térmico"
  },
  {
    id: "vina_centro",
    name: "Viña del Mar (Centro / Poniente / Miraflores)",
    available: true,
    cost: 3500,
    eta: "45 - 60 min",
    method: "Despacho térmico controlado con tracking GPS"
  },
  {
    id: "valparaiso",
    name: "Valparaíso (Plan y Cerros turísticos)",
    available: true,
    cost: 4500,
    eta: "60 - 75 min",
    method: "Despacho térmico controlado con gel refrigerante"
  },
  {
    id: "quilpue_villa_alemana",
    name: "Quilpué / Villa Alemana",
    available: false,
    cost: 0,
    eta: "No disponible temporalmente",
    method: "Fuera de radio térmico garantizado en horario diurno (retiro en tienda Reñaca disponible)"
  }
];

export const DELIVERY_SLOTS = [
  "Hoy — Bloque Tarde (15:00 - 17:30)",
  "Hoy — Bloque Vespertino (17:30 - 19:30)",
  "Mañana — Bloque Mañana (10:30 - 13:00)",
  "Mañana — Bloque Tarde (15:00 - 18:00)"
];

// Catálogo: 6 productos con stock disponible + 1 agotado para validar control de stock (Indicador A)
export const PRODUCTS = [
  {
    id: "prod-01",
    name: "Caja 12 Bombones Rellenos Premium",
    category: "Bombones",
    price: 11900,
    weight: "160g",
    stock: 8,
    coldChainRequired: true,
    dietaryTags: ["Artesanal", "Regalo"],
    image: "./assets/img/bombones-12.jpg",
    shortDesc: "Surtido de 12 bombones belgas con rellenos de ganache, praliné y frutos rojos.",
    description: "Elaborados diariamente en nuestro taller de Reñaca con cobertura 56% y 70% cacao. Incluye empaque rígido de regalo y aislante térmico para el traslado.",
    storageNote: "Conservar entre 15°C y 20°C. Producto perecible excluido de derecho a retracto (Art. 3 bis Ley 19.496), pero cubierto 100% por nuestra Garantía de Reposición Térmica.",
    recommendedIds: ["prod-03", "prod-05", "prod-02"],
    reviews: [
      { author: "Camila R. (Reñaca)", rating: 5, verified: true, date: "14-11-2026", comment: "Llegó heladito y perfecto para el cumpleaños de mi mamá. El gel térmico funciona excelente." },
      { author: "Matías V. (Viña del Mar)", rating: 5, verified: true, date: "08-11-2026", comment: "Muy buena presentación para regalo, se agradece poder ocultar el precio en la boleta." }
    ]
  },
  {
    id: "prod-02",
    name: "Caja 12 Bombones Macizos Zero Azúcar",
    category: "Sin Azúcar",
    price: 14200,
    weight: "150g",
    stock: 5,
    coldChainRequired: true,
    dietaryTags: ["Zero Azúcar", "Sin Gluten"],
    image: "./assets/img/bombones-zero.jpg",
    shortDesc: "Bombones macizos de cacao 70% endulzados con maltitol, aptos para dieta controlada.",
    description: "Selección libre de azúcar añadida y certificada libre de gluten. Mantiene el temperado brillante y el quiebre característico del chocolate fino.",
    storageNote: "Conservar en lugar fresco (máx. 20°C). Despacho protegido con cadena de frío.",
    recommendedIds: ["prod-01", "prod-05", "prod-04"],
    reviews: [
      { author: "Andrea M. (Concón)", rating: 5, verified: true, date: "11-11-2026", comment: "Por fin un chocolate sin azúcar que no pierde textura. Llegó en 45 minutos." }
    ]
  },
  {
    id: "prod-03",
    name: "Barra Dubai Premium 220g",
    category: "Barras",
    price: 20900,
    weight: "220g",
    stock: 3, // Stock bajo real para persuasión ética
    coldChainRequired: true,
    dietaryTags: ["Edición Limitada", "Alta Demanda"],
    image: "./assets/img/barra-dubai.jpg",
    shortDesc: "Chocolate de leche relleno con crema de pistacho tostado y masa kataifi crujiente.",
    description: "Nuestra barra estrella de producción acotada diaria. Relleno cremoso de pistacho 100% natural con hebras crujientes de kataifi artesanal.",
    storageNote: "Alta sensibilidad al calor debido al relleno de pistacho. Se despacha exclusivamente con bolsa térmica y gel frío.",
    recommendedIds: ["prod-01", "prod-04", "prod-06"],
    reviews: [
      { author: "Sebastián L. (Viña del Mar)", rating: 5, verified: true, date: "18-11-2026", comment: "El relleno es espectacular y llegó intacta pese al calor del mediodía." },
      { author: "Fernanda P. (Reñaca)", rating: 4, verified: true, date: "12-11-2026", comment: "Muy rica, conviene pedir temprano porque se agota rápido." }
    ]
  },
  {
    id: "prod-04",
    name: "Caja 30 Bombones Rellenos Gran Reserva",
    category: "Bombones",
    price: 24900,
    weight: "400g",
    stock: 4,
    coldChainRequired: true,
    dietaryTags: ["Regalo Corporativo", "Premium"],
    image: "./assets/img/bombones-30.jpg",
    shortDesc: "Presentación de lujo con 30 bombones surtidos ideal para celebraciones o regalos corporativos.",
    description: "Incluye carta de sabores impresa, cinta de tela y opción de tarjeta personalizada sin costo adicional en el carrito.",
    storageNote: "Mantener bajo 20°C. Incluye código QR de Garantía de Reposición inmediata en la caja.",
    recommendedIds: ["prod-03", "prod-05", "prod-02"],
    reviews: [
      { author: "Rodrigo S. (Valparaíso)", rating: 5, verified: true, date: "15-11-2026", comment: "La pedimos para un aniversario en la oficina y la entrega programada fue puntual." }
    ]
  },
  {
    id: "prod-05",
    name: "Caja 6 Alfajores Artesanales de Manjar",
    category: "Alfajores y Repostería",
    price: 9500,
    weight: "330g",
    stock: 10,
    coldChainRequired: true,
    dietaryTags: ["Artesanal", "Favorito"],
    image: "./assets/img/alfajores-6.jpg",
    shortDesc: "Galleta suave de mantequilla rellena de manjar de campo y bañada en chocolate bitter.",
    description: "Bañados a mano en chocolate semi-amargo que equilibra el dulzor del manjar artesanal. Ideal para complementar una caja de bombones.",
    storageNote: "Consumir preferentemente dentro de 7 días. Almacenar en lugar fresco.",
    recommendedIds: ["prod-01", "prod-06", "prod-03"],
    reviews: [
      { author: "Valentina C. (Reñaca)", rating: 5, verified: true, date: "16-11-2026", comment: "El baño de chocolate es grueso y crujiente, nunca decepcionan." }
    ]
  },
  {
    id: "prod-06",
    name: "Caja Degustación Trufas al Cacao (10 un.)",
    category: "Bombones",
    price: 10800,
    weight: "140g",
    stock: 6,
    coldChainRequired: true,
    dietaryTags: ["Cacao 70%", "Regalo"],
    image: "./assets/img/trufas-10.jpg",
    shortDesc: "Trufas fundentes de ganache oscuro espolvoreadas en cacao amargo holandés.",
    description: "Textura ultra cremosa diseñada para fundirse al paladar. Recomendada para maridaje con café de especialidad o vino tinto.",
    storageNote: "Requiere refrigeración moderada (14°C - 18°C) por su base de crema fresca.",
    recommendedIds: ["prod-04", "prod-05", "prod-02"],
    reviews: [
      { author: "Ignacio T. (Viña del Mar)", rating: 5, verified: true, date: "10-11-2026", comment: "Sabor intenso y llegaron firmes, nada derretidas." }
    ]
  },
  {
    id: "prod-07",
    name: "Tacón de Chocolate Esculpido y 3 Bombones",
    category: "Edición Especial",
    price: 12500,
    weight: "180g",
    stock: 0, // Intencionalmente en 0 para demostrar bloqueo de compra sin stock
    coldChainRequired: true,
    dietaryTags: ["Agotado Hoy", "Bajo Pedido"],
    image: "./assets/img/tacon-chocolate.jpg",
    shortDesc: "Figura artesanal de chocolate moldeado a mano acompañada de 3 bombones rellenos.",
    description: "Pieza escultórica de chocolatería fina. Al agotarse el stock diario, el sistema bloquea automáticamente la compra para evitar quiebres de inventario.",
    storageNote: "Producto frágil y termosensible. Reposición estimada: mañana 10:00 hrs.",
    recommendedIds: ["prod-01", "prod-04", "prod-03"],
    reviews: [
      { author: "Daniela G. (Concón)", rating: 5, verified: true, date: "02-11-2026", comment: "Precioso para regalo, pero hay que encargarlo con tiempo." }
    ]
  }
];