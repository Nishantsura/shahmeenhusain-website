/* ============================================
   SHAHMEEN HUSAIN — Collections Page Loader
   --------------------------------------------
   When the Storefront token is configured, this
   replaces the mock product grid with LIVE products
   from the client's Shopify store. Until then, the
   existing static demo cards remain visible.
   ============================================ */

(function () {
  // Map the site's ?cat= / ?sil= links to real Shopify collection handles.
  const HANDLE_ALIASES = {
    lehenga: 'lehengas',
    lehengas: 'lehengas',
    saree: 'sarees',
    sarees: 'sarees',
    gowns: 'dresses',
    dress: 'dresses',
    dresses: 'dresses',
    anarkali: 'anarkalis',
    anarkalis: 'anarkalis',
    sets: 'co-ords',
    'co-ords': 'co-ords',
    sharara: 'shararas',
    shararas: 'shararas',
    bridal: 'lehengas',
    wedding: 'lehengas',
    festive: 'luxury-pret',
    'luxury-pret': 'luxury-pret',
    'ready-to-ship': 'ready-to-ship',
    sale: 'sale',
    new: 'new-arrival',
    'new-arrival': 'new-arrival'
  };

  async function init() {
    const grid = document.getElementById('productsGrid');
    if (!grid || !window.Shopify) return;

    if (!Shopify.isConfigured()) {
      console.info(
        '[Shahmeen] Shopify Storefront token not set — showing demo products. ' +
          'Add the token in js/shopify-config.js to load the live catalog.'
      );
      return;
    }

    const params = new URLSearchParams(location.search);
    const raw = params.get('collection') || params.get('cat') || params.get('sil');
    const handle = raw ? HANDLE_ALIASES[raw.toLowerCase()] || raw.toLowerCase() : null;

    grid.setAttribute('aria-busy', 'true');
    grid.innerHTML =
      '<p class="products-grid__status">Loading the collection…</p>';

    try {
      let products;
      let heading = null;

      if (handle) {
        const col = await Shopify.getCollectionProducts(handle, { first: 48 });
        if (col) {
          products = col.products;
          heading = col.title;
        }
      }
      if (!products) {
        products = await Shopify.getProducts({ first: 48, sortKey: 'BEST_SELLING' });
      }

      if (!products.length) {
        grid.innerHTML =
          '<p class="products-grid__status">No products found in this collection.</p>';
        return;
      }

      grid.innerHTML = products.map((p) => Shopify.productCardHTML(p)).join('');

      // Update the page heading if we loaded a named collection.
      if (heading) {
        const titleEl = document.querySelector(
          '#collectionTitle, .page-head__title, .collections-hero__title, .page-hero__title'
        );
        if (titleEl) {
          // Reset the split-text state so the reveal re-runs on new copy.
          titleEl.textContent = heading;
          delete titleEl.dataset.split;
          titleEl.classList.remove('is-revealed');
        }
      }

      // Bind scroll reveals to the freshly injected cards.
      if (window.Motion && window.Motion.refresh) window.Motion.refresh();
    } catch (err) {
      console.error('[Shahmeen] Failed to load products:', err);
      grid.innerHTML =
        '<p class="products-grid__status">Couldn\'t load the catalog right now. Please refresh.</p>';
    } finally {
      grid.removeAttribute('aria-busy');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
