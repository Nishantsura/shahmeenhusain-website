/* ============================================
   SHAHMEEN HUSAIN — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Header Scroll Behavior ----
  const header = document.getElementById('header');
  if (header) {
    const isTransparent = header.classList.contains('header--transparent');
    window.addEventListener('scroll', () => {
      if (isTransparent) {
        if (window.scrollY > 80) {
          header.classList.add('header--scrolled');
          header.classList.remove('header--transparent');
        } else {
          header.classList.remove('header--scrolled');
          header.classList.add('header--transparent');
        }
      }
    });
  }

  // ---- Mobile Menu ----
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });
    document.querySelectorAll('[data-submenu]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const submenuId = trigger.getAttribute('data-submenu');
        const submenu = document.getElementById(submenuId);
        if (submenu) {
          submenu.classList.toggle('active');
          const chevron = trigger.querySelector('svg');
          if (chevron) {
            chevron.style.transform = submenu.classList.contains('active') ? 'rotate(90deg)' : '';
          }
        }
      });
    });
  }

  // ---- Search Modal ----
  const searchToggle = document.getElementById('searchToggle');
  const searchModal = document.getElementById('searchModal');
  const searchClose = document.getElementById('searchClose');
  if (searchToggle && searchModal) {
    searchToggle.addEventListener('click', () => {
      searchModal.classList.add('active');
      document.body.classList.add('no-scroll');
      const input = searchModal.querySelector('.search-modal__input');
      if (input) setTimeout(() => input.focus(), 200);
    });
    if (searchClose) {
      searchClose.addEventListener('click', () => {
        searchModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    }
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  // ---- Cart Drawer ----
  const cartToggle = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }
  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // ---- Hero Slideshow ----
  const heroSlides = document.querySelectorAll('.hero__slide');
  const heroDots = document.querySelectorAll('.hero__dot');
  const heroTitle = document.querySelector('.hero__title');
  const heroTitles = ['Timeless Elegance', 'Festive Radiance', 'The Wedding Edit'];
  let currentSlide = 0;
  let heroInterval;

  function goToSlide(index) {
    heroSlides.forEach(s => s.classList.remove('active'));
    heroDots.forEach(d => d.classList.remove('active'));
    if (heroSlides[index]) heroSlides[index].classList.add('active');
    if (heroDots[index]) heroDots[index].classList.add('active');
    if (heroTitle && heroTitles[index]) heroTitle.textContent = heroTitles[index];
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % heroSlides.length;
    goToSlide(next);
  }

  if (heroSlides.length > 1) {
    heroInterval = setInterval(nextSlide, 5000);
    heroDots.forEach(dot => {
      dot.addEventListener('click', () => {
        clearInterval(heroInterval);
        goToSlide(parseInt(dot.getAttribute('data-slide')));
        heroInterval = setInterval(nextSlide, 5000);
      });
    });
  }

  // ---- Carousels ----
  document.querySelectorAll('.carousel__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const carouselId = btn.getAttribute('data-carousel');
      const dir = btn.getAttribute('data-dir');
      const track = document.getElementById(carouselId);
      if (!track) return;
      const card = track.querySelector('.product-card');
      if (!card) return;
      const cardWidth = card.offsetWidth + 24;
      const scrollAmount = dir === 'next' ? cardWidth * 2 : -cardWidth * 2;
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  });

  // ---- Product Page: Size Selector ----
  const productSizes = document.getElementById('productSizes');
  const selectedSizeLabel = document.getElementById('selectedSizeLabel');
  if (productSizes) {
    productSizes.querySelectorAll('.product-size').forEach(btn => {
      btn.addEventListener('click', () => {
        productSizes.querySelectorAll('.product-size').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (selectedSizeLabel) selectedSizeLabel.textContent = btn.getAttribute('data-size');
      });
    });
  }

  // ---- Product Page: Quantity ----
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');
  if (qtyMinus && qtyPlus && qtyValue) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyValue.textContent);
      if (val > 1) qtyValue.textContent = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyValue.textContent);
      if (val < 10) qtyValue.textContent = val + 1;
    });
  }

  // ---- Product Page: Thumbnail Gallery ----
  const thumbnails = document.querySelectorAll('.product-thumbnail');
  const mainImageContainer = document.getElementById('productMainImage');
  const imageGradients = [
    'linear-gradient(135deg,#D4C5B2,#BCA98F)',
    'linear-gradient(135deg,#C9B8A5,#A8947D)',
    'linear-gradient(135deg,#DDD0BF,#C4B39E)',
    'linear-gradient(135deg,#E8D9C6,#CEBDA7)',
    'linear-gradient(135deg,#B8A794,#9D8B77)'
  ];
  const imageLabels = ['Front View', 'Back View', 'Detail View', 'With Dupatta', 'Close-up Embroidery'];
  let currentImageIndex = 0;

  function showImage(index) {
    if (!mainImageContainer) return;
    currentImageIndex = index;
    const placeholder = mainImageContainer.querySelector('.placeholder-img');
    if (placeholder) {
      placeholder.style.background = imageGradients[index] || imageGradients[0];
      const labelDiv = placeholder.querySelector('div > div:last-child');
      if (labelDiv) labelDiv.textContent = 'Aria Lehenga Set — ' + (imageLabels[index] || 'View');
    }
    thumbnails.forEach(t => t.classList.remove('active'));
    if (thumbnails[index]) thumbnails[index].classList.add('active');
  }

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      showImage(parseInt(thumb.getAttribute('data-index')));
    });
  });

  const prevImage = document.getElementById('prevImage');
  const nextImage = document.getElementById('nextImage');
  if (prevImage) {
    prevImage.addEventListener('click', () => {
      const prev = (currentImageIndex - 1 + thumbnails.length) % thumbnails.length;
      showImage(prev);
    });
  }
  if (nextImage) {
    nextImage.addEventListener('click', () => {
      const next = (currentImageIndex + 1) % thumbnails.length;
      showImage(next);
    });
  }

  // ---- Product Page: Accordion ----
  document.querySelectorAll('.product-accordion__header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.product-accordion__body');
      const isActive = item.classList.contains('active');

      item.closest('.product-accordion').querySelectorAll('.product-accordion__item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.product-accordion__body').style.maxHeight = '0';
      });

      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // ---- Product Page: Size Chart Modal ----
  const sizeChartToggle = document.getElementById('sizeChartToggle');
  const sizeChartModal = document.getElementById('sizeChartModal');
  const sizeChartClose = document.getElementById('sizeChartClose');
  if (sizeChartToggle && sizeChartModal) {
    sizeChartToggle.addEventListener('click', () => {
      sizeChartModal.classList.add('active');
      document.body.classList.add('no-scroll');
    });
    if (sizeChartClose) {
      sizeChartClose.addEventListener('click', () => {
        sizeChartModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    }
    sizeChartModal.addEventListener('click', (e) => {
      if (e.target === sizeChartModal) {
        sizeChartModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  // ---- Buy Now Button ----
  const buyNowBtn = document.getElementById('buyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      buyNowBtn.textContent = 'ADDED TO CART';
      buyNowBtn.style.background = '#4A7C59';
      setTimeout(() => {
        buyNowBtn.textContent = 'BUY NOW';
        buyNowBtn.style.background = '';
        openCart();
      }, 1200);
    });
  }

  // ---- Collections Page: Filter Tabs ----
  const filterTabs = document.querySelectorAll('.collections-filter__tab');
  const productCards = document.querySelectorAll('.products-grid .product-card');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      productCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ---- Collections Page: Sort ----
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const grid = document.getElementById('productsGrid');
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll('.product-card'));
      const sortVal = sortSelect.value;
      cards.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price') || 0);
        const priceB = parseInt(b.getAttribute('data-price') || 0);
        if (sortVal === 'price-low') return priceA - priceB;
        if (sortVal === 'price-high') return priceB - priceA;
        return 0;
      });
      cards.forEach(card => grid.appendChild(card));
    });
  }

  // ---- Back to Top ----
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Scroll Animations (Intersection Observer) ----
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeElements.forEach(el => observer.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  // ---- Contact Form ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'MESSAGE SENT!';
      btn.style.background = '#4A7C59';
      btn.style.borderColor = '#4A7C59';
      setTimeout(() => {
        btn.textContent = 'SEND MESSAGE';
        btn.style.background = '';
        btn.style.borderColor = '';
        contactForm.reset();
      }, 3000);
    });
  }

  // ---- Newsletter Form ----
  const newsletterForms = document.querySelectorAll('.newsletter__form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.newsletter__submit');
      const input = form.querySelector('.newsletter__input');
      if (btn) {
        btn.textContent = 'Subscribed!';
        setTimeout(() => {
          btn.textContent = 'Subscribe';
          if (input) input.value = '';
        }, 2500);
      }
    });
  });

  // ---- Keyboard: Escape to close modals ----
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (searchModal && searchModal.classList.contains('active')) {
        searchModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
      if (cartDrawer && cartDrawer.classList.contains('active')) {
        closeCart();
      }
      if (sizeChartModal && sizeChartModal.classList.contains('active')) {
        sizeChartModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    }
  });

});
