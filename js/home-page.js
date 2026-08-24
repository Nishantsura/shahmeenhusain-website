/* ============================================
   SHAHMEEN HUSAIN — Homepage Live Loader
   --------------------------------------------
   Replaces the homepage's placeholder hero,
   featured carousels, and editorial banners with
   REAL products/images from the live Shopify store.
   Runs only when the Storefront token is configured;
   otherwise the static design placeholders remain.
   Requires shopify-config.js + shopify.js first.
   ============================================ */

(function () {
  if (!window.Shopify || !Shopify.isConfigured()) return;

  // Homepage lives at site root, so product links need the pages/ prefix.
  const HREF_BASE = 'pages/product.html';

  function sized(url, w) {
    if (!url) return url;
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'width=' + w;
  }

  function featured(p) {
    return (p && p.featuredImage && p.featuredImage.url) || null;
  }

  // Fetch a collection's products, falling back to a global sort if empty.
  async function load(handle, fallbackSort) {
    try {
      if (handle) {
        const col = await Shopify.getCollectionProducts(handle, { first: 12 });
        if (col && col.products && col.products.length) return col.products;
      }
    } catch (e) {
      console.warn('[Shahmeen] collection load failed:', handle, e);
    }
    try {
      return await Shopify.getProducts({ first: 12, sortKey: fallbackSort || 'BEST_SELLING' });
    } catch (e) {
      console.error('[Shahmeen] products load failed:', e);
      return [];
    }
  }

  function fillCarousel(id, products) {
    const track = document.getElementById(id);
    if (!track || !products.length) return;
    track.innerHTML = products
      .map((p) => Shopify.productCardHTML(p, HREF_BASE))
      .join('');
  }

  // Swap the 3 placeholder hero slides for real product photography.
  function fillHero(products) {
    const slides = document.querySelectorAll('.hero .hero__image');
    slides.forEach((el, i) => {
      const url = featured(products[i]);
      if (!url) return;
      el.style.background = 'none';
      el.style.backgroundImage = 'url("' + sized(url, 1800) + '")';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center top';
      el.innerHTML = ''; // drop the "Hero Image — …" caption
    });
  }

  // Fill the large editorial/runway banners.
  function fillEditorials(products) {
    const banners = document.querySelectorAll('.editorial__image .placeholder-img');
    banners.forEach((el, i) => {
      const url = featured(products[i]);
      if (!url) return;
      el.style.background = 'none';
      el.style.backgroundImage = 'url("' + sized(url, 1400) + '")';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center top';
      el.innerHTML = '';
    });
  }

  async function init() {
    // Two visually distinct edits: bridal lehengas + luxury pret.
    const [bridal, festive] = await Promise.all([
      load('lehengas', 'BEST_SELLING'),
      load('luxury-pret', 'CREATED')
    ]);

    fillCarousel('bridalCarousel', bridal);
    fillCarousel('festiveCarousel', festive);

    // Hero: three strong bridal shots; editorials: a bridal + a pret piece.
    fillHero(bridal.length >= 3 ? bridal : bridal.concat(festive));
    fillEditorials([bridal[3] || bridal[0], festive[0] || festive[1]].filter(Boolean));

    // Re-bind scroll reveals / counters to the freshly injected cards.
    if (window.Motion && window.Motion.refresh) window.Motion.refresh();

    console.info('[Shahmeen] Homepage wired to live products.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
