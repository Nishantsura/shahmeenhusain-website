/* ============================================
   SHAHMEEN HUSAIN — Product Page Loader
   --------------------------------------------
   Loads a single product live from Shopify by
   ?handle= and wires Buy Now to the live cart.
   Falls back to the static demo when no token /
   no handle is present.
   ============================================ */

(function () {
  let product = null;
  let selectedVariant = null;
  let images = [];
  let currentImage = 0;

  const q = (sel) => document.querySelector(sel);
  const esc = (s) => (s || '').replace(/"/g, '&quot;');

  function getSizeOption(p) {
    return p.options.find((o) => /size/i.test(o.name)) || null;
  }

  function variantForSize(sizeValue) {
    return product.variants.edges
      .map((e) => e.node)
      .find((v) =>
        v.selectedOptions.some(
          (o) => /size/i.test(o.name) && o.value === sizeValue
        )
      );
  }

  function setPrice() {
    const el = q('.product-info__price');
    if (!el) return;
    const price = selectedVariant
      ? selectedVariant.price
      : product.priceRange.minVariantPrice;
    const compare =
      product.compareAtPriceRange &&
      product.compareAtPriceRange.minVariantPrice &&
      Number(product.compareAtPriceRange.minVariantPrice.amount) >
        Number(price.amount)
        ? product.compareAtPriceRange.minVariantPrice
        : null;
    el.innerHTML =
      Shopify.formatMoney(price.amount, price.currencyCode) +
      (compare
        ? ` <span class="product-info__price-compare">${Shopify.formatMoney(
            compare.amount,
            compare.currencyCode
          )}</span>`
        : '');
  }

  function renderImages() {
    const main = document.getElementById('productMainImage');
    const thumbs = document.getElementById('productThumbnails');
    if (!images.length) return;

    if (main) {
      const navHTML = main.querySelector('.product-main-image__nav');
      main.innerHTML =
        `<img src="${images[0].url}" alt="${esc(
          images[0].altText || product.title
        )}" class="product-main-image__img" id="productMainImg">` +
        (navHTML ? navHTML.outerHTML : '');
      wireImageNav();
    }
    if (thumbs) {
      thumbs.innerHTML = images
        .map(
          (img, i) => `
        <div class="product-thumbnail${i === 0 ? ' active' : ''}" data-index="${i}">
          <img src="${img.url}" alt="${esc(img.altText || product.title)}" loading="lazy">
        </div>`
        )
        .join('');
      thumbs.querySelectorAll('.product-thumbnail').forEach((t) => {
        t.addEventListener('click', () =>
          showImage(parseInt(t.getAttribute('data-index'), 10))
        );
      });
    }
  }

  function showImage(i) {
    if (!images[i]) return;
    currentImage = i;
    const img = document.getElementById('productMainImg');
    if (img) {
      img.src = images[i].url;
      img.alt = images[i].altText || product.title;
    }
    document
      .querySelectorAll('#productThumbnails .product-thumbnail')
      .forEach((t, idx) => t.classList.toggle('active', idx === i));
  }

  function wireImageNav() {
    const prev = document.getElementById('prevImage');
    const next = document.getElementById('nextImage');
    if (prev)
      prev.addEventListener('click', () =>
        showImage((currentImage - 1 + images.length) % images.length)
      );
    if (next)
      next.addEventListener('click', () =>
        showImage((currentImage + 1) % images.length)
      );
  }

  function renderSizes() {
    const wrap = document.getElementById('productSizes');
    const label = document.getElementById('selectedSizeLabel');
    const sizeOpt = getSizeOption(product);

    if (!wrap) return;

    if (!sizeOpt) {
      // Single-variant product — no size picker needed.
      wrap.innerHTML = '';
      const labelP = wrap.previousElementSibling;
      if (labelP && labelP.classList.contains('product-info__label'))
        labelP.style.display = 'none';
      selectedVariant = product.variants.edges[0].node;
      return;
    }

    wrap.innerHTML = sizeOpt.values
      .map((val) => {
        const v = variantForSize(val);
        const soldOut = v && !v.availableForSale;
        return `<button class="product-size${soldOut ? ' is-soldout' : ''}" data-size="${esc(
          val
        )}"${soldOut ? ' disabled' : ''}>${val}</button>`;
      })
      .join('');

    wrap.querySelectorAll('.product-size').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.hasAttribute('disabled')) return;
        wrap
          .querySelectorAll('.product-size')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.getAttribute('data-size');
        if (label) label.textContent = size;
        selectedVariant = variantForSize(size);
        setPrice();
      });
    });

    // Preselect first available size.
    const firstAvailable = Array.from(
      wrap.querySelectorAll('.product-size:not([disabled])')
    )[0];
    if (firstAvailable) firstAvailable.click();
  }

  function renderText() {
    const nameEl = q('.product-info__name');
    if (nameEl) nameEl.textContent = product.title;

    document.title = `${product.title} — Shahmeen Husain`;

    const crumb = q('.breadcrumb span:last-child');
    if (crumb) crumb.textContent = product.title;

    // Description accordion (first item).
    const descBody = q('.product-accordion__body-inner');
    if (descBody && product.descriptionHtml) {
      descBody.innerHTML = product.descriptionHtml;
      const openBody = descBody.closest('.product-accordion__body');
      if (openBody) openBody.style.maxHeight = openBody.scrollHeight + 'px';
    }

    // WhatsApp enquiry text.
    const wa = q('.product-whatsapp');
    if (wa) {
      const base = wa.getAttribute('href').split('?')[0];
      wa.setAttribute(
        'href',
        `${base}?text=${encodeURIComponent(
          'Hi, I am interested in the ' + product.title
        )}`
      );
    }
  }

  function wireBuy() {
    const btn = document.getElementById('buyNowBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      if (!selectedVariant) {
        const sizes = document.getElementById('productSizes');
        if (sizes) {
          sizes.classList.add('needs-selection');
          setTimeout(() => sizes.classList.remove('needs-selection'), 1200);
        }
        return;
      }
      const qtyEl = document.getElementById('qtyValue');
      const qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'ADDING…';
      try {
        await window.SHCart.add(selectedVariant.id, qty);
        btn.textContent = 'ADDED TO CART';
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 1400);
      } catch (err) {
        console.error('[Shahmeen] Add to cart failed:', err);
        btn.textContent = 'TRY AGAIN';
        btn.disabled = false;
        setTimeout(() => (btn.textContent = original), 1600);
      }
    });
  }

  async function renderRelated() {
    const track = document.getElementById('relatedCarousel');
    if (!track) return;
    try {
      const items = (await Shopify.getProducts({ first: 8 }))
        .filter((p) => p.handle !== product.handle)
        .slice(0, 6);
      if (items.length)
        track.innerHTML = items.map((p) => Shopify.productCardHTML(p)).join('');
    } catch (e) {
      /* keep demo related items on failure */
    }
  }

  async function init() {
    if (!window.Shopify || !Shopify.isConfigured()) return;
    const handle = new URLSearchParams(location.search).get('handle');
    if (!handle) {
      console.info(
        '[Shahmeen] No ?handle= on product page — showing demo product.'
      );
      return;
    }
    try {
      product = await Shopify.getProduct(handle);
      if (!product) {
        console.warn('[Shahmeen] Product not found:', handle);
        return;
      }
      images = product.images.edges.map((e) => e.node);
      if (!images.length && product.featuredImage)
        images = [product.featuredImage];

      renderText();
      renderImages();
      renderSizes();
      setPrice();
      wireBuy();
      renderRelated();
    } catch (err) {
      console.error('[Shahmeen] Failed to load product:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-bind scroll reveals once live product content has rendered.
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (window.Motion && window.Motion.refresh) window.Motion.refresh();
    }, 600);
  });
})();
