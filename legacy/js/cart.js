/* ============================================
   SHAHMEEN HUSAIN — Live Cart Drawer
   --------------------------------------------
   Renders the cart drawer from the live Shopify
   cart and hands off to Shopify's hosted checkout.
   Requires shopify-config.js + shopify.js first.
   ============================================ */

const SHCart = (() => {
  let current = null;
  let busy = false;

  const $ = (id) => document.getElementById(id);

  function setCount(qty) {
    document.querySelectorAll('#cartCount, .header__cart-count').forEach((el) => {
      el.textContent = qty || 0;
      el.classList.toggle('has-items', (qty || 0) > 0);
    });
  }

  function money(m) {
    if (!m) return '';
    return Shopify.formatMoney(m.amount, m.currencyCode);
  }

  function lineHTML(line) {
    const img = line.image;
    const variant =
      line.variantTitle && line.variantTitle !== 'Default Title'
        ? `<p class="cart-line__variant">${line.variantTitle}</p>`
        : '';
    return `
      <div class="cart-line" data-line-id="${line.id}">
        <div class="cart-line__media">
          ${
            img
              ? `<img src="${img.url}" alt="${(img.altText || line.productTitle).replace(/"/g, '&quot;')}" loading="lazy">`
              : '<div class="cart-line__media-ph"></div>'
          }
        </div>
        <div class="cart-line__info">
          <p class="cart-line__name">${line.productTitle}</p>
          ${variant}
          <p class="cart-line__price">${money(line.price)}</p>
          <div class="cart-line__controls">
            <div class="cart-line__qty">
              <button class="cart-line__qty-btn" data-act="dec" aria-label="Decrease quantity">&minus;</button>
              <span class="cart-line__qty-val">${line.quantity}</span>
              <button class="cart-line__qty-btn" data-act="inc" aria-label="Increase quantity">&plus;</button>
            </div>
            <button class="cart-line__remove" data-act="remove">Remove</button>
          </div>
        </div>
      </div>`;
  }

  function render() {
    const body = document.querySelector('.cart-drawer__body');
    const footer = document.querySelector('.cart-drawer__footer');
    if (!body) return;

    const lines = current ? current.lines : [];
    setCount(current ? current.totalQuantity : 0);

    if (!lines.length) {
      body.innerHTML = `
        <div class="cart-drawer__empty">
          <p>Your cart is empty</p>
          <a href="${collectionsHref()}" class="btn btn--small">Continue Shopping</a>
        </div>`;
      if (footer) footer.innerHTML = '';
      return;
    }

    body.innerHTML = `<div class="cart-lines">${lines.map(lineHTML).join('')}</div>`;
    if (footer) {
      footer.innerHTML = `
        <div class="cart-drawer__subtotal">
          <span>Subtotal</span>
          <span>${money(current.subtotal)}</span>
        </div>
        <p class="cart-drawer__note">Shipping &amp; taxes calculated at checkout.</p>
        <button class="cart-drawer__checkout" id="cartCheckout">Checkout</button>`;
      const checkoutBtn = $('cartCheckout');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
          if (current && current.checkoutUrl) {
            checkoutBtn.textContent = 'Redirecting…';
            window.location.href = current.checkoutUrl;
          }
        });
      }
    }
  }

  function collectionsHref() {
    // Works whether we're at site root or in /pages/.
    return location.pathname.includes('/pages/')
      ? 'collections.html'
      : 'pages/collections.html';
  }

  async function refresh() {
    if (!window.Shopify || !Shopify.isConfigured()) return;
    try {
      current = await Shopify.getCart();
    } catch (e) {
      console.error('[Shahmeen] Cart refresh failed:', e);
      current = null;
    }
    render();
  }

  async function add(variantId, quantity = 1) {
    if (busy) return;
    busy = true;
    try {
      current = await Shopify.addToCart(variantId, quantity);
      render();
      openDrawer();
    } finally {
      busy = false;
    }
  }

  function openDrawer() {
    const drawer = $('cartDrawer');
    const overlay = $('cartOverlay');
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  // Delegated controls for qty / remove.
  function bindDrawerEvents() {
    const drawer = $('cartDrawer');
    if (!drawer) return;
    drawer.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn || busy) return;
      const lineEl = btn.closest('.cart-line');
      if (!lineEl) return;
      const lineId = lineEl.getAttribute('data-line-id');
      const act = btn.getAttribute('data-act');
      const line = current.lines.find((l) => l.id === lineId);
      if (!line) return;

      busy = true;
      lineEl.classList.add('is-updating');
      try {
        if (act === 'remove') {
          current = await Shopify.removeCartLine(lineId);
        } else if (act === 'inc') {
          current = await Shopify.updateCartLine(lineId, line.quantity + 1);
        } else if (act === 'dec') {
          const q = line.quantity - 1;
          current =
            q <= 0
              ? await Shopify.removeCartLine(lineId)
              : await Shopify.updateCartLine(lineId, q);
        }
        render();
      } catch (err) {
        console.error('[Shahmeen] Cart update failed:', err);
        lineEl.classList.remove('is-updating');
      } finally {
        busy = false;
      }
    });
  }

  function init() {
    if (!window.Shopify || !Shopify.isConfigured()) return;
    bindDrawerEvents();
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { refresh, add, render, openDrawer };
})();

window.SHCart = SHCart;
