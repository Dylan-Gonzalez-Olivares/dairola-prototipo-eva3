// js/cart.js — Fase 3: Carrito, Despacho/Retiro, Bloque Horario y Modo Regalo
import { PRODUCTS, SHIPPING_ZONES, DELIVERY_SLOTS } from "./data.js";

function escapeText(str = "") {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

export function calculateCartTotals(state) {
  const subtotal = state.cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);

  const selectedZone = SHIPPING_ZONES.find((z) => z.id === state.selectedZoneId) || null;
  let shippingCost = 0;
  let canProceed = state.cart.length > 0;
  let blockReason = "";

  if (state.orderMeta.deliveryMode === "delivery") {
    if (!selectedZone) {
      canProceed = false;
      blockReason = "Selecciona tu comuna para calcular el despacho climatizado antes de pagar (Decreto N° 6).";
    } else if (!selectedZone.available) {
      canProceed = false;
      blockReason = `No contamos con despacho térmico diurno a ${selectedZone.name}. Puedes cambiar a Retiro en Tienda Reñaca ($0).`;
    } else {
      shippingCost = selectedZone.cost;
    }
  }

  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    selectedZone,
    canProceed,
    blockReason
  };
}

export function renderCartView(state, helpers) {
  const container = document.getElementById("cart-container");
  container.classList.remove("placeholder-panel");

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-panel empty-state">
        <h2>Tu carrito está vacío</h2>
        <p class="muted">Agrega productos artesanales del catálogo para simular tu despacho climatizado o compra de regalo.</p>
        <button type="button" class="btn-primary" data-view="catalog">Explorar catálogo</button>
      </div>`;
    return;
  }

  const { subtotal, shippingCost, total, selectedZone, canProceed, blockReason } = calculateCartTotals(state);
  const { deliveryMode, deliverySlot, gift } = state.orderMeta;

  const inCartIds = new Set(state.cart.map((i) => i.id));
  const crossSell = PRODUCTS.filter((p) => p.stock > 0 && !inCartIds.has(p.id)).slice(0, 2);

  const itemsHTML = state.cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) return "";
      const fallback = helpers.buildFallbackImage(product);
      return `
        <div class="cart-item">
          <img class="cart-item-img" src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='${fallback}';" />
          <div class="cart-item-info">
            <h4>${product.name}</h4>
            <div class="cart-item-meta">${helpers.formatCLP(product.price)} c/u · ${product.weight} · Stock hoy: ${product.stock}</div>
          </div>
          <div class="cart-item-right">
            <strong>${helpers.formatCLP(product.price * item.qty)}</strong>
            <div class="qty-controls">
              <button type="button" class="qty-btn" data-cart-dec="${product.id}" aria-label="Disminuir cantidad">-</button>
              <span>${item.qty}</span>
              <button type="button" class="qty-btn" data-cart-inc="${product.id}" ${item.qty >= product.stock ? "disabled" : ""} aria-label="Aumentar cantidad">+</button>
            </div>
            <button type="button" class="btn-remove" data-cart-remove="${product.id}">Eliminar</button>
          </div>
        </div>`;
    })
    .join("");

  container.innerHTML = `
    <div class="cart-layout">
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="cart-panel">
          <h2>Tu pedido (${state.cart.reduce((a, b) => a + b.qty, 0)} productos)</h2>
          <div>${itemsHTML}</div>
        </div>

        <div class="cart-panel">
          <h3>Personalización y Regalos</h3>
          <div class="gift-box">
            <label class="switch-row">
              <span>¿Es para un regalo? (Sin costo adicional)</span>
              <input type="checkbox" id="gift-toggle" ${gift.enabled ? "checked" : ""} />
            </label>

            <div id="gift-fields" class="gift-fields ${gift.enabled ? "" : "hidden"}">
              <label class="switch-row" style="font-size:0.86rem; font-weight:500;">
                <span>Ocultar precios en la boleta/guía física del destinatario</span>
                <input type="checkbox" id="gift-hide-price" ${gift.hidePrice ? "checked" : ""} />
              </label>

              <div class="form-field">
                <label for="gift-recipient-name">Nombre de quien recibe</label>
                <input type="text" id="gift-recipient-name" maxlength="60" placeholder="Ej. Patricia Olivares" value="${escapeText(gift.recipientName)}" />
              </div>

              <div class="form-field">
                <label for="gift-recipient-phone">Teléfono discreto del destinatario (opcional, solo para coordinar entrega)</label>
                <input type="tel" id="gift-recipient-phone" maxlength="16" placeholder="+56 9 1234 5678" value="${escapeText(gift.recipientPhone)}" />
              </div>

              <div class="form-field">
                <label for="gift-message">Mensaje para la tarjeta impresa (<span id="gift-char-count">${gift.message.length}</span>/250)</label>
                <textarea id="gift-message" rows="3" maxlength="250" placeholder="Escribe tu dedicatoria aquí...">${escapeText(gift.message)}</textarea>
              </div>

              <div class="gift-preview-card">
                <small>Vista previa de tarjeta impresa D'Airola</small>
                <p id="gift-preview-text">${gift.message ? escapeText(gift.message) : "Tu dedicatoria aparecerá impresa aquí en papel algodón..."}</p>
              </div>

              <div class="privacy-note">
                <strong>Privacidad por diseño (Ley N° 19.628):</strong> Los datos del destinatario se utilizan exclusivamente para coordinar esta entrega y se purgan del sistema operativo tras el despacho. Nunca se inscriben en campañas de marketing.
              </div>
            </div>
          </div>
        </div>

        ${
          crossSell.length > 0
            ? `
          <div class="cart-panel">
            <h3>Complementa tu pedido</h3>
            <div class="cross-sell-list">
              ${crossSell
                .map(
                  (p) => `
                <div class="cross-sell-card">
                  <div>
                    <strong>${p.name}</strong>
                    <div class="cart-item-meta">${helpers.formatCLP(p.price)}</div>
                  </div>
                  <button type="button" class="btn-secondary" data-cart-cross="${p.id}">+ Agregar</button>
                </div>`
                )
                .join("")}
            </div>
          </div>`
            : ""
        }
      </div>

      <aside class="cart-panel">
        <h2>Entrega y Resumen</h2>

        <div class="delivery-toggle" role="group" aria-label="Tipo de entrega">
          <button type="button" class="mode-btn ${deliveryMode === "delivery" ? "active" : ""}" data-delivery-mode="delivery">
            ❄ Despacho Climatizado
          </button>
          <button type="button" class="mode-btn ${deliveryMode === "pickup" ? "active" : ""}" data-delivery-mode="pickup">
            🏪 Retiro en Reñaca ($0)
          </button>
        </div>

        ${
          deliveryMode === "delivery"
            ? `
          <div class="form-field">
            <label for="cart-zone-select">Comuna de destino (V Región)</label>
            <select id="cart-zone-select">
              <option value="">Selecciona tu comuna...</option>
              ${SHIPPING_ZONES.map(
                (z) =>
                  `<option value="${z.id}" ${z.id === state.selectedZoneId ? "selected" : ""}>
                    ${z.available ? `${z.name} — ${helpers.formatCLP(z.cost)} (${z.eta})` : `${z.name} — Sin despacho térmico`}
                  </option>`
              ).join("")}
            </select>
          </div>
          ${
            selectedZone && selectedZone.available
              ? `<div class="cold-box"><strong>Protocolo asignado:</strong> ${selectedZone.method} · Tiempo estimado: ${selectedZone.eta}.</div>`
              : ""
          }`
            : `
          <div class="cold-box">
            <strong>Retiro en Local Reñaca ($0):</strong>
            Av. Edmundo Eluchans 1850, Local 2. Conservación en cámara fría hasta que retires tu pedido.
          </div>`
        }

        <div class="form-field">
          <label for="delivery-slot-select">Bloque horario disponible</label>
          <select id="delivery-slot-select">
            ${DELIVERY_SLOTS.map(
              (slot) => `<option value="${slot}" ${slot === deliverySlot ? "selected" : ""}>${slot}</option>`
            ).join("")}
          </select>
        </div>

        <div class="summary-rows">
          <div class="summary-row">
            <span>Subtotal productos</span>
            <span>${helpers.formatCLP(subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>${deliveryMode === "pickup" ? "Retiro en tienda" : "Despacho climatizado"}</span>
            <span>${deliveryMode === "delivery" && (!selectedZone || !selectedZone.available) ? "Por definir" : helpers.formatCLP(shippingCost)}</span>
          </div>
          ${
            gift.enabled
              ? `<div class="summary-row"><span>Empaque y tarjeta de regalo</span><span style="color:var(--success);">Gratis ($0)</span></div>`
              : ""
          }
          <div class="summary-row total">
            <span>Total a pagar (IVA inc.)</span>
            <span>${helpers.formatCLP(total)}</span>
          </div>
        </div>

        ${
          blockReason
            ? `
          <div class="alert-inline">
            <span>${blockReason}</span>
            ${
              selectedZone && !selectedZone.available
                ? `<button type="button" class="btn-secondary" data-delivery-mode="pickup">Cambiar a Retiro en Reñaca ($0)</button>`
                : ""
            }
          </div>`
            : ""
        }

        <button type="button" class="btn-primary" id="proceed-checkout-btn" ${canProceed ? "" : "disabled"}>
          Continuar como invitado (sin crear cuenta) →
        </button>
        <p class="muted" style="text-align:center; margin-bottom:0; font-size:0.78rem;">
          Precio final transparente antes de simular el pago. Sin cargos ocultos.
        </p>
      </aside>
    </div>
  `;
}

export function bindCartEvents(state, helpers) {
  const cartContainer = document.getElementById("cart-container");

  cartContainer.addEventListener("click", (e) => {
    const incBtn = e.target.closest("[data-cart-inc]");
    if (incBtn) {
      const id = incBtn.dataset.cartInc;
      const item = state.cart.find((i) => i.id === id);
      const product = PRODUCTS.find((p) => p.id === id);
      if (item && product && item.qty < product.stock) {
        item.qty += 1;
        helpers.persistCartAndRender();
      }
      return;
    }

    const decBtn = e.target.closest("[data-cart-dec]");
    if (decBtn) {
      const id = decBtn.dataset.cartDec;
      const item = state.cart.find((i) => i.id === id);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) {
          state.cart = state.cart.filter((i) => i.id !== id);
        }
        helpers.persistCartAndRender();
      }
      return;
    }

    const remBtn = e.target.closest("[data-cart-remove]");
    if (remBtn) {
      state.cart = state.cart.filter((i) => i.id !== remBtn.dataset.cartRemove);
      helpers.persistCartAndRender();
      helpers.showToast("Producto eliminado del carrito.");
      return;
    }

    const crossBtn = e.target.closest("[data-cart-cross]");
    if (crossBtn) {
      helpers.addToCart(crossBtn.dataset.cartCross);
      renderCartView(state, helpers);
      return;
    }

    const modeBtn = e.target.closest("[data-delivery-mode]");
    if (modeBtn) {
      state.orderMeta.deliveryMode = modeBtn.dataset.deliveryMode;
      helpers.saveOrderMeta();
      renderCartView(state, helpers);
      return;
    }

    if (e.target.closest("#proceed-checkout-btn")) {
      const totals = calculateCartTotals(state);
      if (!totals.canProceed) return;
      helpers.navigateTo("checkout");
    }
  });

  cartContainer.addEventListener("change", (e) => {
    if (e.target.id === "cart-zone-select") {
      helpers.setZone(e.target.value);
      renderCartView(state, helpers);
      return;
    }

    if (e.target.id === "delivery-slot-select") {
      state.orderMeta.deliverySlot = e.target.value;
      helpers.saveOrderMeta();
      return;
    }

    if (e.target.id === "gift-toggle") {
      state.orderMeta.gift.enabled = e.target.checked;
      helpers.saveOrderMeta();
      renderCartView(state, helpers);
      return;
    }

    if (e.target.id === "gift-hide-price") {
      state.orderMeta.gift.hidePrice = e.target.checked;
      helpers.saveOrderMeta();
    }
  });

  cartContainer.addEventListener("input", (e) => {
    if (e.target.id === "gift-recipient-name") {
      state.orderMeta.gift.recipientName = e.target.value;
      helpers.saveOrderMeta();
      return;
    }

    if (e.target.id === "gift-recipient-phone") {
      state.orderMeta.gift.recipientPhone = e.target.value;
      helpers.saveOrderMeta();
      return;
    }

    if (e.target.id === "gift-message") {
      const msg = e.target.value;
      state.orderMeta.gift.message = msg;
      helpers.saveOrderMeta();
      const counter = document.getElementById("gift-char-count");
      const preview = document.getElementById("gift-preview-text");
      if (counter) counter.textContent = msg.length;
      if (preview) {
        preview.textContent = msg.trim()
          ? msg
          : "Tu dedicatoria aparecerá impresa aquí en papel algodón...";
      }
    }
  });
}