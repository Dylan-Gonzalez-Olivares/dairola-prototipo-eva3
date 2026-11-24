// js/app.js — Versión final integrada (Fases 1 a 4)
import { SUPPLIER_INFO, SHIPPING_ZONES, DELIVERY_SLOTS, PRODUCTS } from "./data.js";
import { renderCartView, bindCartEvents } from "./cart.js";
import {
  renderCheckoutView,
  renderConfirmationView,
  bindCheckoutEvents
} from "./checkout.js";

const DEFAULT_ORDER_META = {
  deliveryMode: "delivery",
  deliverySlot: DELIVERY_SLOTS[0],
  gift: {
    enabled: false,
    hidePrice: true,
    recipientName: "",
    recipientPhone: "",
    message: ""
  }
};

function loadOrderMeta() {
  try {
    const saved = JSON.parse(localStorage.getItem("dairola_order_meta") || "null");
    if (!saved) return structuredClone(DEFAULT_ORDER_META);
    return {
      ...DEFAULT_ORDER_META,
      ...saved,
      gift: { ...DEFAULT_ORDER_META.gift, ...(saved.gift || {}) }
    };
  } catch {
    return structuredClone(DEFAULT_ORDER_META);
  }
}

export const state = {
  currentView: "catalog",
  selectedCategory: "Todos",
  selectedZoneId: localStorage.getItem("dairola_zone") || "",
  activeProductId: null,
  cart: JSON.parse(localStorage.getItem("dairola_cart") || "[]"),
  orderMeta: loadOrderMeta(),
  lastOrder: JSON.parse(localStorage.getItem("dairola_last_order") || "null")
};

export function formatCLP(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(amount);
}

export function buildFallbackImage(product) {
  const safeName = product.name.replace(/&/g, "&").replace(/</g, "<");
  const safeCat = product.category.replace(/&/g, "&");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#ecf4e3"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#g)"/>
      <rect x="24" y="24" width="552" height="402" rx="18" fill="none" stroke="#4a2c1d" stroke-opacity="0.28" stroke-width="2"/>
      <text x="300" y="185" fill="#4e7a27" font-family="system-ui, sans-serif" font-size="20" font-weight="700" text-anchor="middle">${safeCat.toUpperCase()}</text>
      <text x="300" y="230" fill="#4a2c1d" font-family="system-ui, sans-serif" font-size="22" font-weight="700" text-anchor="middle">${safeName.slice(0, 34)}</text>
      <text x="300" y="275" fill="#66554b" font-family="system-ui, sans-serif" font-size="15" text-anchor="middle">Cargar foto real en ${product.image}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

function saveOrderMeta() {
  localStorage.setItem("dairola_order_meta", JSON.stringify(state.orderMeta));
}

function setZone(zoneId) {
  state.selectedZoneId = zoneId;
  localStorage.setItem("dairola_zone", zoneId);
  const headerSelect = document.getElementById("header-zone-select");
  if (headerSelect) headerSelect.value = zoneId;
  renderZoneFeedback(zoneId);
}

function updateCartBadge() {
  const totalQty = state.cart.reduce((acc, item) => acc + item.qty, 0);
  document.getElementById("cart-count").textContent = totalQty;
}

function persistCartAndRender() {
  localStorage.setItem("dairola_cart", JSON.stringify(state.cart));
  updateCartBadge();
  if (state.currentView === "cart") {
    renderCartView(state, sharedHelpers);
  }
}

function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product || product.stock === 0) return;

  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    if (existing.qty >= product.stock) {
      showToast(`Stock máximo alcanzado (${product.stock} unidades disponibles hoy).`);
      return;
    }
    existing.qty += 1;
  } else {
    state.cart.push({ id: productId, qty: 1 });
  }

  localStorage.setItem("dairola_cart", JSON.stringify(state.cart));
  updateCartBadge();
  showToast(`"${product.name}" agregado al carrito.`);
}

export function navigateTo(viewName) {
  state.currentView = viewName;
  document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-link[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  if (viewName === "cart") renderCartView(state, sharedHelpers);
  if (viewName === "checkout") renderCheckoutView(state, sharedHelpers);
  if (viewName === "confirmation") renderConfirmationView(state, sharedHelpers);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

const sharedHelpers = {
  formatCLP,
  buildFallbackImage,
  showToast,
  navigateTo,
  addToCart,
  setZone,
  saveOrderMeta,
  persistCartAndRender,
  updateCartBadge
};

function initChrome() {
  document.getElementById("academic-banner").textContent = SUPPLIER_INFO.bannerAviso;

  document.getElementById("footer-supplier-list").innerHTML = `
    <li><strong>Razón Social:</strong> ${SUPPLIER_INFO.razonSocial}</li>
    <li><strong>RUT:</strong> ${SUPPLIER_INFO.rut}</li>
    <li><strong>Domicilio:</strong> ${SUPPLIER_INFO.domicilio}</li>
    <li><strong>Correo:</strong> ${SUPPLIER_INFO.correo}</li>
  `;

  const waFooter = document.getElementById("footer-whatsapp-link");
  const waMsg = encodeURIComponent("Hola Chocolatería D'Airola, tengo una consulta sobre despacho climatizado (consulta desde prototipo académico INACAP).");
  waFooter.href = `https://wa.me/${SUPPLIER_INFO.whatsappNumero}?text=${waMsg}`;

  const zoneSelect = document.getElementById("header-zone-select");
  SHIPPING_ZONES.forEach((zone) => {
    const opt = document.createElement("option");
    opt.value = zone.id;
    opt.textContent = zone.available
      ? `${zone.name} (${formatCLP(zone.cost)})`
      : `${zone.name} (Solo retiro en Reñaca)`;
    zoneSelect.appendChild(opt);
  });

  if (state.selectedZoneId) {
    zoneSelect.value = state.selectedZoneId;
    renderZoneFeedback(state.selectedZoneId);
  }

  zoneSelect.addEventListener("change", (e) => {
    setZone(e.target.value);
    if (state.currentView === "cart") renderCartView(state, sharedHelpers);
    if (state.currentView === "checkout") renderCheckoutView(state, sharedHelpers);
  });
}

function renderZoneFeedback(zoneId) {
  const bar = document.getElementById("zone-feedback-bar");
  const zone = SHIPPING_ZONES.find((z) => z.id === zoneId);
  if (!zone) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden", "ok", "warn");
  if (zone.available) {
    bar.classList.add("ok");
    bar.textContent = `✓ Llegamos a ${zone.name} — Costo: ${formatCLP(zone.cost)} · Tiempo estimado: ${zone.eta} · ${zone.method}`;
  } else {
    bar.classList.add("warn");
    bar.textContent = `⚠ ${zone.name}: ${zone.method}`;
  }
}

function renderFilters() {
  const categories = ["Todos", ...new Set(PRODUCTS.map((p) => p.category))];
  document.getElementById("category-filters").innerHTML = categories
    .map(
      (cat) => `
      <button type="button" class="filter-btn ${cat === state.selectedCategory ? "active" : ""}" data-category="${cat}">
        ${cat}
      </button>`
    )
    .join("");
}

function getStockBadge(stock) {
  if (stock === 0) return { cls: "out", text: "Agotado hoy" };
  if (stock <= 3) return { cls: "low", text: `Últimas ${stock} un. hoy` };
  return { cls: "ok", text: `Stock disponible (${stock})` };
}

function createProductCardHTML(product) {
  const stockInfo = getStockBadge(product.stock);
  const fallback = buildFallbackImage(product);
  return `
    <article class="product-card ${product.stock === 0 ? "out-of-stock" : ""}">
      <div class="card-media" data-open-product="${product.id}">
        <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='${fallback}';" />
        <span class="stock-pill ${stockInfo.cls}">${stockInfo.text}</span>
      </div>
      <div class="card-body">
        <div class="tag-row">
          ${product.dietaryTags.map((t) => `<span class="mini-tag">${t}</span>`).join("")}
        </div>
        <h3 class="card-title" data-open-product="${product.id}">${product.name}</h3>
        <p class="card-desc">${product.shortDesc}</p>
        <div class="card-meta">
          <span class="price">${formatCLP(product.price)}</span>
          <span class="weight">${product.weight}</span>
        </div>
        <div class="card-actions">
          <button type="button" class="btn-secondary" data-open-product="${product.id}">Ver ficha</button>
          <button type="button" class="btn-primary" data-add-cart="${product.id}" ${product.stock === 0 ? "disabled" : ""}>
            ${product.stock === 0 ? "Sin stock" : "Agregar"}
          </button>
        </div>
      </div>
    </article>`;
}

function renderCatalog() {
  const filtered =
    state.selectedCategory === "Todos"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === state.selectedCategory);

  document.getElementById("catalog-summary").textContent =
    `Mostrando ${filtered.length} de ${PRODUCTS.length} productos artesanales`;

  document.getElementById("catalog-grid").innerHTML = filtered
    .map(createProductCardHTML)
    .join("");
}

function openProductDetail(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  state.activeProductId = productId;
  const stockInfo = getStockBadge(product.stock);
  const fallback = buildFallbackImage(product);
  const shareText = encodeURIComponent(
    `Mira este producto en Chocolatería D'Airola (Reñaca): ${product.name} (${formatCLP(product.price)}) con despacho climatizado. ${window.location.href}`
  );

  document.getElementById("product-detail-container").innerHTML = `
    <div class="detail-grid">
      <div class="detail-media">
        <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='${fallback}';" />
      </div>
      <div class="detail-info">
        <div class="tag-row">
          <span class="mini-tag">${product.category}</span>
          <span class="mini-tag">${product.weight}</span>
          ${product.dietaryTags.map((t) => `<span class="mini-tag">${t}</span>`).join("")}
        </div>
        <h1>${product.name}</h1>
        <div class="detail-price">${formatCLP(product.price)}</div>
        <p>${product.description}</p>
        <p><strong>Disponibilidad real:</strong> <span class="stock-pill ${stockInfo.cls}" style="position:static;">${stockInfo.text}</span></p>
        <div class="cold-box">
          <strong>❄ Protección de Cadena de Frío y Garantía Térmica</strong>
          ${product.storageNote}
        </div>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button type="button" class="btn-primary" data-add-cart="${product.id}" ${product.stock === 0 ? "disabled" : ""}>
            ${product.stock === 0 ? "Agotado — Reposición mañana 10:00" : "Agregar al carrito"}
          </button>
          <button type="button" class="btn-secondary" data-view="cart">Ir al carrito</button>
        </div>
        <div class="share-bar">
          <span>Compartir producto:</span>
          <a class="btn-social wa" href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <button type="button" class="btn-social ig" id="share-ig-btn" data-product-name="${product.name}">
            Instagram (${SUPPLIER_INFO.instagramHandle})
          </button>
        </div>
      </div>
    </div>

    <div class="reviews-block">
      <h3>Reseñas verificadas de clientes (${product.reviews.length})</h3>
      <div class="review-list">
        ${product.reviews
          .map(
            (r) => `
          <div class="review-card">
            <div class="review-head">
              <strong>${r.author}</strong>
              <span class="verified-badge">✓ Compra verificada · ${r.date}</span>
            </div>
            <div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
            <p class="card-desc">${r.comment}</p>
          </div>`
          )
          .join("")}
      </div>
    </div>`;

  const recProducts = product.recommendedIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  document.getElementById("recommendations-grid").innerHTML = recProducts
    .map(createProductCardHTML)
    .join("");

  navigateTo("product");
}

const MODAL_CONTENT = {
  coldchain: {
    title: "Protocolo de Cadena de Frío y Garantía Térmica",
    html: `
      <p>El chocolate artesanal sufre alteraciones de textura sobre los 22°C. Chocolatería D'Airola despacha en Reñaca, Concón, Viña del Mar y Valparaíso con empaque aislante y gel refrigerante.</p>
      <ul>
        <li><strong>Seguimiento en 4 etapas:</strong> Cámara fría → Empaque térmico → En ruta → Entregado.</li>
        <li><strong>Garantía de Reposición Instantánea:</strong> Si el producto llega derretido o deformado, reporta dentro de los primeros 30 minutos y reponemos sin costo.</li>
      </ul>`
  },
  legal: {
    title: "Resumen Marco Legal Chileno Aplicado",
    html: `
      <ul>
        <li><strong>Reglamento de Comercio Electrónico (Decreto N° 6):</strong> Identificación del proveedor, stock real y costo total con despacho informados antes de pagar.</li>
        <li><strong>Ley N° 19.496 (Consumidor):</strong> Aceptación expresa de T&C, excepción legal al retracto de 10 días por alimentos perecibles y garantía legal de 6 meses / idoneidad.</li>
        <li><strong>Ley N° 19.628 y Ley N° 21.719 (Datos):</strong> Consentimiento de publicidad separado y desmarcado por defecto. Nota: la Ley 21.719 tenía vigencia prevista para 01/12/2026 con proyecto aprobado por el Senado para postergarla al 15/10/2027.</li>
      </ul>`
  },
  terms: {
    title: "Términos y Condiciones (Ley N° 19.496)",
    html: `<p>Simulación académica INACAP. Precios en pesos chilenos (CLP) con IVA incluido. Valor del despacho informado según comuna antes de confirmar el pedido. No procesa pagos reales.</p>`
  },
  retracto: {
    title: "Derecho a Retracto (Art. 3 bis) y Garantía Legal",
    html: `
      <p><strong>Derecho a retracto (10 días):</strong> Conforme al Art. 3 bis de la Ley N° 19.496, los productos alimenticios perecibles están excluidos del retracto unilateral una vez despachados.</p>
      <p><strong>Garantía legal (6 meses / calidad e idoneidad):</strong> Si el producto presenta defectos de elaboración o falla en la cadena de frío, rige la garantía legal de reposición o devolución del dinero.</p>`
  },
  privacy: {
    title: "Política de Privacidad (Ley N° 19.628 / Ley N° 21.719)",
    html: `
      <p>Los datos ingresados se utilizan únicamente para gestionar el despacho. En compras para regalo, los datos del destinatario no se incorporan a bases de marketing.</p>
      <p>La suscripción a novedades comerciales es opcional y jamás viene premarcada.</p>`
  }
};

function openModal(key) {
  const data = MODAL_CONTENT[key];
  if (!data) return;
  document.getElementById("modal-title").textContent = data.title;
  document.getElementById("modal-body").innerHTML = data.html;
  document.getElementById("info-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("info-modal").classList.add("hidden");
}

function bindEvents() {
  document.getElementById("brand-home-btn").addEventListener("click", () => navigateTo("catalog"));
  document.getElementById("open-cart-btn").addEventListener("click", () => navigateTo("cart"));

  document.addEventListener("click", (e) => {
    const viewBtn = e.target.closest("[data-view]");
    if (viewBtn) {
      navigateTo(viewBtn.dataset.view);
      return;
    }

    const modalBtn = e.target.closest("[data-modal]");
    if (modalBtn) {
      openModal(modalBtn.dataset.modal);
      return;
    }

    if (e.target.closest("[data-close-modal]")) {
      closeModal();
      return;
    }

    const catBtn = e.target.closest("[data-category]");
    if (catBtn) {
      state.selectedCategory = catBtn.dataset.category;
      renderFilters();
      renderCatalog();
      return;
    }

    const addBtn = e.target.closest("[data-add-cart]");
    if (addBtn) {
      addToCart(addBtn.dataset.addCart);
      return;
    }

    const openProd = e.target.closest("[data-open-product]");
    if (openProd) {
      openProductDetail(openProd.dataset.openProduct);
      return;
    }

    const igBtn = e.target.closest("#share-ig-btn");
    if (igBtn) {
      const text = `Recomendado: ${igBtn.dataset.productName} en ${SUPPLIER_INFO.instagramHandle} (${window.location.href})`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      showToast("Enlace copiado para compartir en tus Historias o DM de Instagram.");
    }
  });
}

initChrome();
renderFilters();
renderCatalog();
updateCartBadge();
bindEvents();
bindCartEvents(state, sharedHelpers);
bindCheckoutEvents(state, sharedHelpers);