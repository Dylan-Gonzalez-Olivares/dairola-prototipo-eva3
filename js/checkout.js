// js/checkout.js — Fase 4: Checkout Invitado, Marco Legal, Confirmación, Tracking Térmico y Garantía
import { PRODUCTS, SUPPLIER_INFO } from "./data.js";
import { calculateCartTotals } from "./cart.js";

const TRACKING_STEPS = [
  {
    title: "Cámara Fría (16°C)",
    desc: "Pedido verificado y preparado desde cámara climatizada en Reñaca."
  },
  {
    title: "Empaque Térmico",
    desc: "Sellado con bolsa aislante, gel refrigerante y código QR de garantía."
  },
  {
    title: "En Ruta Climatizada",
    desc: "Repartidor en camino con monitoreo de temperatura (sin exposición solar)."
  },
  {
    title: "Entregado",
    desc: "Pedido recibido. Ventana de 30 min activa para Garantía de Reposición."
  }
];

function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML.replace(/"/g, "&" + "quot;");
}

export function renderCheckoutView(state, helpers) {
  const container = document.getElementById("checkout-container");
  container.classList.remove("placeholder-panel");

  const totals = calculateCartTotals(state);
  if (!totals.canProceed) {
    container.innerHTML = `
      <div class="cart-panel empty-state">
        <h2>Completa tu carrito antes de continuar</h2>
        <p class="muted">${totals.blockReason || "Tu carrito está vacío."}</p>
        <button type="button" class="btn-primary" data-view="cart">Volver al carrito</button>
      </div>`;
    return;
  }

  const { deliveryMode, deliverySlot, gift } = state.orderMeta;
  const itemsListHTML = state.cart
    .map((item) => {
      const p = PRODUCTS.find((prod) => prod.id === item.id);
      if (!p) return "";
      return `
        <div class="summary-row">
          <span>${item.qty}× ${p.name}</span>
          <span>${helpers.formatCLP(p.price * item.qty)}</span>
        </div>`;
    })
    .join("");

  container.innerHTML = `
    <div class="checkout-grid">
      <form id="checkout-form" class="cart-panel" novalidate>
        <div>
          <span class="pill-cold" style="margin-bottom:0.4rem;">Compra como invitado · Sin registro obligatorio</span>
          <h2>Datos de contacto y entrega</h2>
          <p class="muted" style="margin-bottom:0;">Solo solicitamos los datos estrictamente necesarios para procesar tu despacho (principio de minimización, Ley N° 19.628).</p>
        </div>

        <div class="form-row-2">
          <div class="form-field">
            <label for="buyer-name">Nombre completo *</label>
            <input type="text" id="buyer-name" required placeholder="Ej. Javiera Rodríguez" />
          </div>
          <div class="form-field">
            <label for="buyer-email">Correo electrónico (para boleta y tracking) *</label>
            <input type="email" id="buyer-email" required placeholder="ejemplo@correo.cl" />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-field">
            <label for="buyer-phone">Teléfono de contacto *</label>
            <input type="tel" id="buyer-phone" required placeholder="+56 9 8765 4321" />
          </div>
          <div class="form-field">
            <label>Bloque horario seleccionado</label>
            <input type="text" value="${escapeHTML(deliverySlot)}" disabled />
          </div>
        </div>

        ${
          deliveryMode === "delivery"
            ? `
          <div class="form-field">
            <label for="buyer-address">Dirección exacta en ${escapeHTML(totals.selectedZone.name)} *</label>
            <input type="text" id="buyer-address" required placeholder="Calle, número, depto/casa y referencia" />
          </div>`
            : `
          <div class="cold-box">
            <strong>Retiro en tienda seleccionado ($0):</strong>
            ${SUPPLIER_INFO.domicilio}. Tu pedido se mantendrá en cámara fría hasta tu llegada.
          </div>`
        }

        <h3>Medio de pago (100% simulado)</h3>
        <div class="sim-warning">
          ⚠ Simulación académica INACAP: No ingreses datos reales de tarjetas bancarias. Ningún cobro será ejecutado.
        </div>

        <div class="payment-options" role="radiogroup" aria-label="Método de pago simulado">
          <label class="payment-card selected">
            <input type="radio" name="paymentMethod" value="Webpay Plus (Simulado)" checked />
            <div>
              <strong>Webpay Plus</strong>
              <div class="cart-item-meta">Débito / Crédito (Transbank)</div>
            </div>
          </label>
          <label class="payment-card">
            <input type="radio" name="paymentMethod" value="Mercado Pago (Simulado)" />
            <div>
              <strong>Mercado Pago</strong>
              <div class="cart-item-meta">Saldo o tarjeta</div>
            </div>
          </label>
          <label class="payment-card">
            <input type="radio" name="paymentMethod" value="Transferencia Electrónica (Simulada)" />
            <div>
              <strong>Transferencia</strong>
              <div class="cart-item-meta">Validación inmediata</div>
            </div>
          </label>
        </div>

        <h3>Consentimientos y Transparencia Legal</h3>
        <div class="legal-checks">
          <label class="check-row">
            <input type="checkbox" id="accept-terms" required />
            <span>
              <strong>(Obligatorio)</strong> He leído y acepto los
              <button type="button" class="link-btn" data-modal="terms">Términos y Condiciones</button> y la
              <button type="button" class="link-btn" data-modal="privacy">Política de Privacidad</button>
              (Ley N° 19.496 y Ley N° 19.628).
            </span>
          </label>

          <label class="check-row">
            <input type="checkbox" id="accept-perishable" required />
            <span>
              <strong>(Obligatorio)</strong> Tomo conocimiento expreso de que, por tratarse de alimentos perecibles,
              <strong>no aplica el derecho a retracto de 10 días (Art. 3 bis Ley N° 19.496)</strong>, manteniéndose
              íntegra la <strong>Garantía Legal de 6 meses</strong> y la <strong>Garantía de Reposición Térmica</strong>
              en caso de fallas de calidad o cadena de frío.
            </span>
          </label>

          <label class="check-row">
            <input type="checkbox" id="accept-marketing" />
            <span>
              <em>(Opcional — desmarcado por defecto)</em> Deseo recibir novedades y ofertas de temporada por correo.
              Puedo revocar este consentimiento en cualquier momento.
            </span>
          </label>

          <p class="law-callout">
            <strong>Actualización normativa (Ley N° 21.719):</strong> Este prototipo implementa consentimiento granular y minimización de datos alineados con la nueva Ley de Protección de Datos Personales (vigencia prevista para 01/12/2026, sujeta al proyecto de postergación al 15/10/2027 en trámite legislativo).
          </p>
        </div>

        <div id="checkout-error" class="alert-inline hidden" role="alert"></div>

        <button type="submit" class="btn-primary" style="padding:0.8rem 1rem; font-size:0.95rem;">
          Simular pago por ${helpers.formatCLP(totals.total)} →
        </button>
      </form>

      <aside class="cart-panel">
        <h2>Resumen de tu orden</h2>
        <div class="summary-rows">
          ${itemsListHTML}
        </div>
        <div class="summary-rows" style="border-top:none; padding-top:0;">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${helpers.formatCLP(totals.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>${deliveryMode === "pickup" ? "Retiro en Reñaca" : `Despacho (${totals.selectedZone.name})`}</span>
            <span>${helpers.formatCLP(totals.shippingCost)}</span>
          </div>
          <div class="summary-row total">
            <span>Total final (IVA inc.)</span>
            <span>${helpers.formatCLP(totals.total)}</span>
          </div>
        </div>

        ${
          gift.enabled
            ? `
          <div class="gift-preview-card">
            <small>🎁 Modo Regalo Activo</small>
            <p><strong>Para:</strong> ${escapeHTML(gift.recipientName || "Destinatario por confirmar")}</p>
            <p>${escapeHTML(gift.message || "Sin dedicatoria escrita")}</p>
            <p style="font-style:normal; font-size:0.78rem; margin-top:0.4rem;">
              ${gift.hidePrice ? "✓ Boleta física sin precios visibles." : "Boleta estándar."}
            </p>
          </div>`
            : ""
        }

        <div class="cold-box">
          <strong>Proveedor identificado (Decreto N° 6):</strong>
          ${SUPPLIER_INFO.razonSocial} · RUT ${SUPPLIER_INFO.rut}
        </div>
      </aside>
    </div>
  `;
}

export function renderConfirmationView(state, helpers) {
  const container = document.getElementById("confirmation-container");
  container.classList.remove("placeholder-panel");

  const order = state.lastOrder;
  if (!order) {
    container.innerHTML = `
      <div class="cart-panel empty-state">
        <h2>No hay una orden confirmada todavía</h2>
        <button type="button" class="btn-primary" data-view="catalog">Ir al catálogo</button>
      </div>`;
    return;
  }

  const currentStep = order.trackingStep ?? 0;
  const stepsHTML = TRACKING_STEPS.map((st, idx) => {
    const cls = idx < currentStep ? "done" : idx === currentStep ? "active" : "";
    const icon = idx < currentStep ? "✓" : idx === currentStep ? "●" : "○";
    return `
      <div class="step-card ${cls}">
        <span class="step-num">${icon} ETAPA ${idx + 1}</span>
        <div><strong>${st.title}</strong></div>
        <p class="card-desc" style="margin-top:0.25rem;">${st.desc}</p>
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="confirm-banner">
      <h2>✓ Pedido simulado confirmado — Orden #${escapeHTML(order.orderId)}</h2>
      <p>
        Gracias, <strong>${escapeHTML(order.buyer.name)}</strong>. Enviamos el comprobante simulado a
        <strong>${escapeHTML(order.buyer.email)}</strong>. Pago: <strong>${escapeHTML(order.paymentMethod)}</strong>
        · Total: <strong>${helpers.formatCLP(order.totals.total)}</strong>.
      </p>
    </div>

    <div class="checkout-grid">
      <!-- Live Tracking de Cadena de Frío -->
      <div class="cart-panel">
        <div class="section-head" style="margin-bottom:0;">
          <h3>❄ Live Tracking de Cadena de Frío</h3>
          <span class="tech-tag">Integración API / Webhooks (Simulación)</span>
        </div>
        <p class="muted" style="margin-bottom:0;">
          Entrega: <strong>${escapeHTML(order.deliverySummary)}</strong> · Bloque: <strong>${escapeHTML(order.deliverySlot)}</strong>
        </p>

        <div class="tracking-stepper">${stepsHTML}</div>

        <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
          <button type="button" class="btn-primary" id="advance-tracking-btn" ${currentStep >= TRACKING_STEPS.length - 1 ? "disabled" : ""}>
            ${currentStep >= TRACKING_STEPS.length - 1 ? "✓ Pedido entregado" : "Simular avance de etapa →"}
          </button>
          <button type="button" class="btn-secondary" id="reset-tracking-btn">Reiniciar demostración</button>
        </div>

        <!-- Módulo Garantía de Reposición Térmica -->
        <div class="warranty-box">
          <div>
            <strong>🛡 Garantía de Reposición Térmica Instantánea</strong>
            <p class="card-desc" style="margin-top:0.2rem;">
              Si tu chocolate presenta alteraciones por calor al recibirlo, repórtalo dentro de los primeros 30 minutos para emitir una reposición automática sin costo.
            </p>
          </div>

          ${
            order.warrantyClaim
              ? `
            <div class="warranty-ticket">
              <strong>✓ Reposición aprobada automáticamente — Ticket #${escapeHTML(order.warrantyClaim.ticketId)}</strong><br />
              Motivo registrado: ${escapeHTML(order.warrantyClaim.reason)} (${escapeHTML(order.warrantyClaim.timestamp)}).<br />
              Se ha generado una orden de reposición sin costo ($0) con despacho prioritario climatizado.
            </div>`
              : `
            <form id="warranty-form" style="display:flex; flex-direction:column; gap:0.65rem;">
              <div class="form-field">
                <label for="warranty-reason">Simular reporte de falla térmica (Evidencia EVA 2 → EVA 3)</label>
                <select id="warranty-reason" required>
                  <option value="">Selecciona una incidencia...</option>
                  <option value="Chocolate derretido o deformado por calor">Chocolate derretido o deformado por calor</option>
                  <option value="Gel refrigerante sin frío al abrir empaque">Gel refrigerante sin frío al abrir empaque</option>
                  <option value="Caja dañada durante el traslado">Caja dañada durante el traslado</option>
                </select>
              </div>
              <button type="submit" class="btn-secondary" style="align-self:flex-start;">
                Activar Garantía de Reposición ($0)
              </button>
            </form>`
          }
        </div>
      </div>

      <!-- Detalle final de la orden -->
      <aside class="cart-panel">
        <h3>Detalle del pedido</h3>
        <div class="summary-rows">
          ${order.items
            .map(
              (i) => `
            <div class="summary-row">
              <span>${i.qty}× ${escapeHTML(i.name)}</span>
              <span>${helpers.formatCLP(i.price * i.qty)}</span>
            </div>`
            )
            .join("")}
        </div>
        <div class="summary-rows" style="border-top:none; padding-top:0;">
          <div class="summary-row">
            <span>Despacho</span>
            <span>${helpers.formatCLP(order.totals.shippingCost)}</span>
          </div>
          <div class="summary-row total">
            <span>Total pagado (simulado)</span>
            <span>${helpers.formatCLP(order.totals.total)}</span>
          </div>
        </div>

        <div class="card-desc">
          <strong>Preferencia de marketing (Ley 19.628):</strong>
          ${order.marketingOptIn ? "Aceptó recibir novedades (revocable)." : "No suscrito a publicidad (respeto de privacidad)."}
        </div>

        ${
          order.gift.enabled
            ? `
          <div class="gift-preview-card">
            <small>🎁 Tarjeta de Regalo Confirmada</small>
            <p><strong>Para:</strong> ${escapeHTML(order.gift.recipientName || "Destinatario")}</p>
            <p>${escapeHTML(order.gift.message || "Sin dedicatoria")}</p>
            <p style="font-style:normal; font-size:0.78rem; margin-top:0.4rem;">
              ${order.gift.hidePrice ? "✓ Guía física sin precios." : "Guía estándar."} · Datos del destinatario marcados para purga post-entrega.
            </p>
          </div>`
            : ""
        }

        <button type="button" class="btn-primary" data-view="catalog">Realizar otra compra simulada</button>
      </aside>
    </div>
  `;
}

export function bindCheckoutEvents(state, helpers) {
  const checkoutContainer = document.getElementById("checkout-container");
  const confirmContainer = document.getElementById("confirmation-container");

  // Resaltar tarjeta de método de pago seleccionada
  checkoutContainer.addEventListener("change", (e) => {
    if (e.target.name === "paymentMethod") {
      checkoutContainer.querySelectorAll(".payment-card").forEach((card) => {
        card.classList.toggle("selected", card.contains(e.target));
      });
    }
  });

  // Envío del formulario de checkout simulado
  checkoutContainer.addEventListener("submit", (e) => {
    if (e.target.id !== "checkout-form") return;
    e.preventDefault();

    const errorBox = document.getElementById("checkout-error");
    const name = document.getElementById("buyer-name").value.trim();
    const email = document.getElementById("buyer-email").value.trim();
    const phone = document.getElementById("buyer-phone").value.trim();
    const addressInput = document.getElementById("buyer-address");
    const address = addressInput ? addressInput.value.trim() : "";
    const acceptTerms = document.getElementById("accept-terms").checked;
    const acceptPerishable = document.getElementById("accept-perishable").checked;
    const marketingOptIn = document.getElementById("accept-marketing").checked;
    const paymentRadio = checkoutContainer.querySelector('input[name="paymentMethod"]:checked');

    const errors = [];
    if (name.length < 3) errors.push("Ingresa tu nombre completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Ingresa un correo electrónico válido.");
    if (phone.length < 8) errors.push("Ingresa un teléfono de contacto válido.");
    if (state.orderMeta.deliveryMode === "delivery" && address.length < 5) {
      errors.push("Ingresa la dirección de entrega para el despacho climatizado.");
    }
    if (!acceptTerms) errors.push("Debes aceptar los Términos y Condiciones y la Política de Privacidad.");
    if (!acceptPerishable) errors.push("Debes confirmar el aviso sobre alimentos perecibles y garantía legal.");

    if (errors.length > 0) {
      errorBox.innerHTML = errors.map((err) => `<div>• ${err}</div>`).join("");
      errorBox.classList.remove("hidden");
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const totals = calculateCartTotals(state);
    const orderItems = state.cart
      .map((item) => {
        const p = PRODUCTS.find((prod) => prod.id === item.id);
        return p ? { id: p.id, name: p.name, price: p.price, qty: item.qty } : null;
      })
      .filter(Boolean);

    const deliverySummary =
      state.orderMeta.deliveryMode === "pickup"
        ? "Retiro en Tienda Reñaca ($0)"
        : `${totals.selectedZone.name} — ${address}`;

    state.lastOrder = {
      orderId: `DA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleString("es-CL"),
      buyer: { name, email, phone, address },
      items: orderItems,
      totals: {
        subtotal: totals.subtotal,
        shippingCost: totals.shippingCost,
        total: totals.total
      },
      deliverySummary,
      deliverySlot: state.orderMeta.deliverySlot,
      gift: structuredClone(state.orderMeta.gift),
      paymentMethod: paymentRadio ? paymentRadio.value : "Webpay Plus (Simulado)",
      marketingOptIn,
      trackingStep: 0,
      warrantyClaim: null
    };

    localStorage.setItem("dairola_last_order", JSON.stringify(state.lastOrder));

    // Limpiar carrito tras confirmar la simulación
    state.cart = [];
    localStorage.setItem("dairola_cart", "[]");
    helpers.updateCartBadge();
    helpers.showToast(`Orden #${state.lastOrder.orderId} confirmada (simulación).`);
    helpers.navigateTo("confirmation");
  });

  // Controles interactivos en Pantalla 5 (Tracking + Garantía)
  confirmContainer.addEventListener("click", (e) => {
    if (!state.lastOrder) return;

    if (e.target.closest("#advance-tracking-btn")) {
      if (state.lastOrder.trackingStep < TRACKING_STEPS.length - 1) {
        state.lastOrder.trackingStep += 1;
        localStorage.setItem("dairola_last_order", JSON.stringify(state.lastOrder));
        renderConfirmationView(state, helpers);
      }
      return;
    }

    if (e.target.closest("#reset-tracking-btn")) {
      state.lastOrder.trackingStep = 0;
      localStorage.setItem("dairola_last_order", JSON.stringify(state.lastOrder));
      renderConfirmationView(state, helpers);
    }
  });

  confirmContainer.addEventListener("submit", (e) => {
    if (e.target.id !== "warranty-form" || !state.lastOrder) return;
    e.preventDefault();

    const reason = document.getElementById("warranty-reason").value;
    if (!reason) return;

    state.lastOrder.warrantyClaim = {
      ticketId: `REPO-${Math.floor(1000 + Math.random() * 9000)}`,
      reason,
      timestamp: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
    };
    localStorage.setItem("dairola_last_order", JSON.stringify(state.lastOrder));
    helpers.showToast("Garantía de Reposición Térmica emitida sin costo.");
    renderConfirmationView(state, helpers);
  });
}