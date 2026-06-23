/* ===== CART ===== */
function getCart() {
  try {
    var data = localStorage.getItem('trio_cart');
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem('trio_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id, size, qty) {
  if (!size) { alert('Please select a size.'); return false; }
  var product = findProduct(id);
  if (!product) return false;
  var available = product.stock && product.stock[size] != null ? product.stock[size] : 99;
  if (available < 1) { alert('This size is out of stock.'); return false; }
  var cart = getCart();
  var existing = cart.find(function(item) { return item.id === id && item.size === size; });
  var currentQty = existing ? existing.qty : 0;
  var maxAdd = available - currentQty;
  if (qty > maxAdd) {
    if (maxAdd <= 0) { alert('You already have all available stock in your cart.'); return false; }
    qty = maxAdd;
  }
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: id, size: size, qty: qty });
  }
  saveCart(cart);
  return true;
}

function removeFromCart(id, size) {
  var cart = getCart();
  cart = cart.filter(function(item) { return !(item.id === id && item.size === size); });
  saveCart(cart);
}

function updateQuantity(id, size, delta, stockOverride) {
  var cart = getCart();
  var item = cart.find(function(item) { return item.id === id && item.size === size; });
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) item.qty = 1;
  var product = findProduct(id);
  if (product) {
    var available = stockOverride != null ? stockOverride : (product.stock && product.stock[size] != null ? product.stock[size] : 99);
    if (item.qty > available) item.qty = available;
  }
  saveCart(cart);
}

function changeItemSize(id, oldSize, newSize) {
  if (oldSize === newSize) return;
  var product = findProduct(id);
  if (product && isSizeOutOfStock(product, newSize)) {
    alert('This size is currently out of stock.');
    return;
  }
  var cart = getCart();
  var existing = cart.find(function(item) { return item.id === id && item.size === newSize; });
  var current = cart.find(function(item) { return item.id === id && item.size === oldSize; });
  if (!current) return;
  if (existing) {
    existing.qty += current.qty;
    cart = cart.filter(function(item) { return !(item.id === id && item.size === oldSize); });
  } else {
    current.size = newSize;
  }
  saveCart(cart);
}

function getCartCount() {
  return getCart().reduce(function(sum, item) { return sum + item.qty; }, 0);
}

function updateCartBadge() {
  var badges = document.querySelectorAll('.cart-badge');
  var count = getCartCount();
  badges.forEach(function(badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

/* ===== WISHLIST ===== */
function getWishlist() {
  try {
    var data = localStorage.getItem('trio_wishlist');
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

function saveWishlist(list) {
  localStorage.setItem('trio_wishlist', JSON.stringify(list));
}

function toggleWishlist(id) {
  var list = getWishlist();
  var idx = list.indexOf(id);
  if (idx > -1) { list.splice(idx, 1); } else { list.push(id); }
  saveWishlist(list);
  return idx === -1;
}

function isWishlisted(id) {
  return getWishlist().indexOf(id) > -1;
}

/* ===== FORMAT ===== */
function formatPrice(num) {
  return 'PKR ' + num.toLocaleString('en-PK');
}

function findProduct(id) {
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id === id) return PRODUCTS[i];
  }
  return null;
}

function fetchProductsFromApi(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/products', true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var apiProducts = JSON.parse(xhr.responseText);
        if (apiProducts && apiProducts.length) {
          window.PRODUCTS = apiProducts;
        }
      } catch(e) {}
    }
    if (callback) callback();
  };
  xhr.onerror = function() {
    if (callback) callback();
  };
  xhr.send();
}

/* ===== ADD TO CART FEEDBACK ===== */
function showAddedFeedback(btn) {
  var original = btn.textContent;
  btn.textContent = 'ADDED \u2713';
  btn.style.background = 'var(--success)';
  btn.style.borderColor = 'var(--success)';
  btn.style.color = '#fff';
  setTimeout(function() {
    btn.textContent = original;
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
  }, 1500);
}

/* ===== INTERSECTION OBSERVER ===== */
function initIntersectionObserver() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.fade-in').forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(function(el) { observer.observe(el); });
  } else {
    document.querySelectorAll('.fade-in').forEach(function(el) { el.classList.add('visible'); });
  }
}

/* ===== HEADER ===== */
function initHeader() {
  var header = document.getElementById('site-header');
  if (!header) return;
  header.innerHTML =
    '<div class="header-inner">' +
      '<div class="header-left">' +
        '<button class="hamburger" id="hamburger-btn" aria-label="Menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<a href="index.html" class="logo">' +
          '<span class="logo-main">TRIO</span>' +
          '<span class="logo-sub">JERSEYS</span>' +
        '</a>' +
      '</div>' +
      '<nav class="header-nav">' +
        '<a href="index.html">Home</a>' +
        '<a href="shop.html">Shop</a>' +
        '<a href="about.html">About</a>' +
        '<a href="policies.html">Policies</a>' +
        '<a href="track.html">Track</a>' +
        '<a href="cart.html">Cart</a>' +
      '</nav>' +
      '<div class="header-right">' +
        '<a href="shop.html" class="icon-btn" aria-label="Search">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' +
        '</a>' +
        '<a href="cart.html" class="icon-btn" aria-label="Cart">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>' +
          '<span class="cart-badge">0</span>' +
        '</a>' +
      '</div>' +
    '</div>';

  /* Sidebar */
  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebar-overlay';
  document.body.appendChild(overlay);

  var sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';
  sidebar.innerHTML =
    '<button class="sidebar-close" id="sidebar-close" aria-label="Close menu">\u2715</button>' +
    '<nav class="sidebar-nav">' +
      '<a href="index.html">Home</a>' +
      '<a href="shop.html">Shop</a>' +
      '<a href="about.html">About</a>' +
      '<a href="policies.html">Policies</a>' +
      '<a href="track.html">Track</a>' +
      '<a href="cart.html">Cart</a>' +
    '</nav>';
  document.body.appendChild(sidebar);

  document.getElementById('hamburger-btn').addEventListener('click', function() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
}

/* ===== FOOTER ===== */
function initFooter() {
  var footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML =
    '<div class="footer-grid">' +
      '<div class="footer-col footer-brand">' +
        '<div class="logo">' +
          '<span class="logo-main">TRIO</span>' +
          '<span class="logo-sub">JERSEYS</span>' +
        '</div>' +
        '<p>BUILT FOR MATCHDAY</p>' +
        '<p>Premium player-version football jerseys delivered across Pakistan. Trusted by thousands of fans.</p>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h4>Quick Links</h4>' +
        '<ul>' +
          '<li><a href="shop.html">Shop</a></li>' +
          '<li><a href="about.html">About</a></li>' +
          '<li><a href="cart.html">Cart</a></li>' +
          '<li><a href="checkout.html">Checkout</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h4>Policies</h4>' +
        '<ul>' +
          '<li><a href="policies.html#delivery">Delivery</a></li>' +
          '<li><a href="policies.html#privacy">Privacy</a></li>' +
          '<li><a href="policies.html#terms">Terms</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h4>Contact</h4>' +
        '<ul>' +
          '<li><a href="https://www.instagram.com/thetriojerseys/" target="_blank">Instagram</a></li>' +
          '<li><a href="https://wa.me/923232555116" target="_blank">WhatsApp</a></li>' +
          '<li><a href="mailto:info@thetrioJerseys.pk">info@thetrioJerseys.pk</a></li>' +
        '</ul>' +
        '<div class="payment-badges">' +
          '<span class="payment-badge">COD</span>' +
          '<span class="payment-badge">JazzCash</span>' +
          '<span class="payment-badge">EasyPaisa</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="footer-bottom">' +
      '\u00a9 2025 The Trio Jerseys. All rights reserved.' +
    '</div>';
}

function isSizeOutOfStock(product, size) {
  return product.stock && product.stock[size] != null && product.stock[size] < 1;
}

/* ===== RENDER PRODUCT CARD ===== */
function renderProductCard(product) {
  var wishlisted = isWishlisted(product.id);
  var sizesHTML = '';
  for (var i = 0; i < product.sizes.length; i++) {
    var sz = product.sizes[i];
    var oos = isSizeOutOfStock(product, sz);
    sizesHTML += '<span class="size-chip' + (oos ? ' out-of-stock' : '') + '">' + sz + (oos ? ' (OOS)' : '') + '</span>';
  }
  var card = document.createElement('div');
  card.className = 'product-card fade-in';
  card.innerHTML =
    '<a href="shop.html?id=' + product.id + '" class="img-wrap">' +
      '<img src="' + product.images[0] + '" alt="' + product.name + '" loading="lazy">' +
    '</a>' +
    '<button class="wishlist-btn' + (wishlisted ? ' liked' : '') + '" data-id="' + product.id + '" aria-label="Wishlist">' +
      (wishlisted ? '\u2764' : '\u2661') +
    '</button>' +
    '<div class="card-body">' +
      '<h3>' + product.name + '</h3>' +
      '<div class="card-meta">' + (product.club || product.country) + '</div>' +
      '<div class="card-price">' + formatPrice(product.price) + '</div>' +
      '<div class="size-chips">' + sizesHTML + '</div>' +
      '<div class="card-actions">' +
        '<a href="checkout.html?buy=' + product.id + '" class="btn btn-outline btn-small">BUY NOW</a>' +
        '<button class="btn btn-primary btn-small add-to-cart-btn" data-id="' + product.id + '">ADD TO CART</button>' +
      '</div>' +
    '</div>';
  return card;
}

/* ===== RENDER PRODUCT DETAIL ===== */
function renderProductDetail(product) {
  var mainImg = document.getElementById('detail-main-img');
  var thumbsContainer = document.getElementById('detail-thumbs');
  var info = document.getElementById('detail-info');
  var relatedContainer = document.getElementById('related-products');

  if (!mainImg || !info) return;

  mainImg.src = product.images[0];
  mainImg.alt = product.name;

  thumbsContainer.innerHTML = '';
  for (var i = 0; i < product.images.length; i++) {
    (function(idx) {
      var thumb = document.createElement('div');
      thumb.className = 'thumb' + (idx === 0 ? ' active' : '');
      thumb.innerHTML = '<img src="' + product.images[idx] + '" alt="' + product.name + ' view ' + (idx + 1) + '" loading="lazy">';
      thumb.addEventListener('click', function() {
        mainImg.src = product.images[idx];
        thumbsContainer.querySelectorAll('.thumb').forEach(function(t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });
      thumbsContainer.appendChild(thumb);
    })(i);
  }

  var sizesHTML = '';
  for (var j = 0; j < product.sizes.length; j++) {
    var sz = product.sizes[j];
    var oos = isSizeOutOfStock(product, sz);
    sizesHTML += '<button class="size-option' + (oos ? ' out-of-stock' : '') + '" data-size="' + sz + '"' + (oos ? ' disabled' : '') + '>' + sz + (oos ? ' (OOS)' : '') + '</button>';
  }

  info.innerHTML =
    '<h1>' + product.name + '</h1>' +
    '<div class="card-meta">' + (product.club || product.country) + ' \u00b7 ' + product.category + '</div>' +
    '<div class="detail-price">' + formatPrice(product.price) + '</div>' +
    '<p class="detail-desc">' + product.description + '</p>' +
    '<div class="detail-sizes">' +
      '<label>Size <span style="color:var(--danger)">*</span></label>' +
      '<div class="size-options" id="size-options">' + sizesHTML + '</div>' +
    '</div>' +
    '<div class="detail-sizes">' +
      '<label>Quantity</label>' +
      '<div class="qty-stepper">' +
        '<button id="qty-minus">\u2212</button>' +
        '<span id="qty-display">1</span>' +
        '<button id="qty-plus">+</button>' +
      '</div>' +
    '</div>' +
    '<div class="detail-actions">' +
      '<a href="checkout.html?buy=' + product.id + '" class="btn btn-primary" id="buy-now-detail">BUY NOW</a>' +
      '<button class="btn btn-outline" id="add-to-cart-detail">ADD TO CART</button>' +
    '</div>';

  /* Size selection */
  var selectedSize = null;
  var qty = 1;
  var sizeOptions = document.getElementById('size-options');
  sizeOptions.addEventListener('click', function(e) {
    var btn = e.target.closest('.size-option');
    if (!btn || btn.disabled) {
      if (btn && btn.disabled) alert('This size is currently out of stock.');
      return;
    }
    sizeOptions.querySelectorAll('.size-option').forEach(function(opt) { opt.classList.remove('selected'); });
    btn.classList.add('selected');
    selectedSize = btn.dataset.size;
  });

  document.getElementById('qty-minus').addEventListener('click', function() {
    if (qty > 1) { qty--; document.getElementById('qty-display').textContent = qty; }
  });

  document.getElementById('qty-plus').addEventListener('click', function() {
    qty++; document.getElementById('qty-display').textContent = qty;
  });

  document.getElementById('add-to-cart-detail').addEventListener('click', function() {
    if (!selectedSize) { alert('Please select a size.'); return; }
    addToCart(product.id, selectedSize, qty);
    showAddedFeedback(this);
    updateCartBadge();
  });

  /* Related products */
  if (relatedContainer) {
    relatedContainer.innerHTML = '';
    var related = [];
    for (var k = 0; k < PRODUCTS.length; k++) {
      if (PRODUCTS[k].id !== product.id && PRODUCTS[k].category === product.category) {
        related.push(PRODUCTS[k]);
      }
    }
    related = related.slice(0, 4);
    for (var m = 0; m < related.length; m++) {
      relatedContainer.appendChild(renderProductCard(related[m]));
    }
  }
}

/* ===== WISHLIST EVENT DELEGATION ===== */
function initWishlistButtons() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.wishlist-btn');
    if (!btn) return;
    var id = btn.dataset.id;
    var liked = toggleWishlist(id);
    btn.classList.toggle('liked', liked);
    btn.innerHTML = liked ? '\u2764' : '\u2661';
  });
}

/* ===== ADD TO CART EVENT DELEGATION ===== */
function initAddToCartButtons() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    var id = btn.dataset.id;
    var product = findProduct(id);
    if (!product) return;
    var firstAvail = null;
    for (var i = 0; i < product.sizes.length; i++) {
      if (!isSizeOutOfStock(product, product.sizes[i])) {
        firstAvail = product.sizes[i];
        break;
      }
    }
    if (!firstAvail) { alert('This product is currently out of stock.'); return; }
    addToCart(id, firstAvail, 1);
    showAddedFeedback(btn);
    updateCartBadge();
  });
}

/* ===== SHOP PAGE ===== */
function initShopPage() {
  var params = new URLSearchParams(window.location.search);
  var productId = params.get('id');
  var catalogView = document.getElementById('catalog-view');
  var detailView = document.getElementById('detail-view');

  if (!catalogView || !detailView) return;

  if (productId) {
    var product = findProduct(productId);
    if (product) {
      catalogView.style.display = 'none';
      detailView.style.display = 'block';
      renderProductDetail(product);
      initIntersectionObserver();
      return;
    }
  }

  catalogView.style.display = 'block';
  detailView.style.display = 'none';

  renderShopCatalog();
  initShopFilters();
  initIntersectionObserver();
}

function renderShopCatalog(filter) {
  var grid = document.getElementById('shop-grid');
  if (!grid) return;
  grid.innerHTML = '';

  var items = PRODUCTS;
  if (filter) {
    if (filter.category && filter.category !== 'All') {
      items = items.filter(function(p) { return p.category === filter.category; });
    }
    if (filter.search) {
      var q = filter.search.toLowerCase();
      items = items.filter(function(p) {
        return p.name.toLowerCase().indexOf(q) > -1 ||
               (p.club && p.club.toLowerCase().indexOf(q) > -1) ||
               (p.country && p.country.toLowerCase().indexOf(q) > -1);
      });
    }
  }

  if (items.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:48px 0;color:var(--text-secondary)">No products found.</p>';
    return;
  }

  for (var i = 0; i < items.length; i++) {
    grid.appendChild(renderProductCard(items[i]));
  }
}

function initShopFilters() {
  var pills = document.querySelectorAll('.filter-pill');
  var searchInput = document.getElementById('shop-search');

  var currentFilter = { category: 'All', search: '' };

  function update() {
    renderShopCatalog(currentFilter);
    initIntersectionObserver();
  }

  if (pills) {
    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        pills.forEach(function(p) { p.classList.remove('active'); });
        pill.classList.add('active');
        currentFilter.category = pill.dataset.filter;
        update();
      });
    });
  }

  if (searchInput) {
    var debounceTimer;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        currentFilter.search = searchInput.value;
        update();
      }, 300);
    });
  }
}

/* ===== CART PAGE ===== */
function initCartPage() {
  var cart = getCart();
  var container = document.getElementById('cart-container');
  var emptyEl = document.getElementById('cart-empty');

  if (!container) return;

  if (cart.length === 0) {
    container.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  container.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';

  var tbody = document.getElementById('cart-items');
  var subtotalEl = document.getElementById('cart-subtotal');
  var shippingEl = document.getElementById('cart-shipping');
  var totalEl = document.getElementById('cart-total');

  if (!tbody) return;

  tbody.innerHTML = '';
  var subtotal = 0;

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var product = findProduct(item.id);
    if (!product) continue;
    var lineTotal = product.price * item.qty;
    subtotal += lineTotal;

    var sizeOpts = '';
    for (var s = 0; s < product.sizes.length; s++) {
      var sz = product.sizes[s];
      var oos = isSizeOutOfStock(product, sz);
      if (oos && sz !== item.size) continue;
      sizeOpts += '<option value="' + sz + '"' + (sz === item.size ? ' selected' : '') + (oos ? ' disabled' : '') + '>' + sz + (oos ? ' (OOS)' : '') + '</option>';
    }

    var stockNote = '';
    var availStock = product.stock && product.stock[item.size] != null ? product.stock[item.size] : 99;
    if (availStock < item.qty) {
      stockNote = '<div style="font-size:0.75rem;color:var(--danger);margin-top:4px;">Only ' + availStock + ' in stock (ordered ' + item.qty + ')</div>';
    } else if (availStock <= 3) {
      stockNote = '<div style="font-size:0.75rem;color:var(--danger);margin-top:4px;">Only ' + availStock + ' left in stock</div>';
    }

    var tr = document.createElement('tr');
    var imgSrc = product.images[0];
    tr.innerHTML =
      '<td><img src="' + imgSrc + '" alt="' + product.name + '" class="cart-item-img"></td>' +
      '<td><div class="cart-item-name">' + product.name + '</div>' +
        '<select class="cart-size-select" data-id="' + item.id + '" data-old-size="' + item.size + '">' + sizeOpts + '</select>' + stockNote + '</td>' +
      '<td>' + formatPrice(product.price) + '</td>' +
      '<td>' +
        '<div class="cart-qty">' +
          '<button class="qty-dec" data-id="' + item.id + '" data-size="' + item.size + '">\u2212</button>' +
          '<span>' + item.qty + '</span>' +
          '<button class="qty-inc" data-id="' + item.id + '" data-size="' + item.size + '">+</button>' +
        '</div>' +
      '</td>' +
      '<td>' + formatPrice(lineTotal) + '</td>' +
      '<td><button class="cart-remove" data-id="' + item.id + '" data-size="' + item.size + '" aria-label="Remove">\u2715</button></td>';
    tbody.appendChild(tr);
  }

  /* Update summary */
  subtotalEl.textContent = formatPrice(subtotal);
  var shipping = subtotal >= 5000 ? 0 : 300;
  if (shipping === 0) {
    shippingEl.innerHTML = '<span class="free">FREE</span>';
  } else {
    shippingEl.textContent = formatPrice(shipping);
  }
  totalEl.textContent = formatPrice(subtotal + shipping);

  initIntersectionObserver();

  /* Event delegation for qty, size change, and remove */
  tbody.addEventListener('click', function(e) {
    var target = e.target;
    if (target.classList.contains('qty-dec')) {
      updateQuantity(target.dataset.id, target.dataset.size, -1);
      initCartPage();
      updateCartBadge();
    } else if (target.classList.contains('qty-inc')) {
      updateQuantity(target.dataset.id, target.dataset.size, 1);
      initCartPage();
      updateCartBadge();
    } else if (target.classList.contains('cart-remove')) {
      removeFromCart(target.dataset.id, target.dataset.size);
      initCartPage();
      updateCartBadge();
    }
  });

  tbody.addEventListener('change', function(e) {
    if (e.target.classList.contains('cart-size-select')) {
      var id = e.target.dataset.id;
      var oldSize = e.target.dataset.oldSize;
      var newSize = e.target.value;
      changeItemSize(id, oldSize, newSize);
      initCartPage();
      updateCartBadge();
    }
  });
}

/* ===== CHECKOUT PAGE ===== */
function initCheckoutPage() {
  var cart = getCart();
  var buyId = new URLSearchParams(window.location.search).get('buy');
  var itemsContainer = document.getElementById('checkout-items');
  var subtotalEl = document.getElementById('checkout-subtotal');
  var shippingEl = document.getElementById('checkout-shipping');
  var totalEl = document.getElementById('checkout-total');

  if (buyId) {
    var product = findProduct(buyId);
    if (product) {
      var buySize = product.sizes[0];
      for (var si = 0; si < product.sizes.length; si++) {
        if (!isSizeOutOfStock(product, product.sizes[si])) {
          buySize = product.sizes[si];
          break;
        }
      }
      addToCart(buyId, buySize, 1);
      cart = getCart();
    }
    window.history.replaceState({}, '', 'checkout.html');
    buyId = null;
  }

  if (!itemsContainer) return;

  if (cart.length === 0) {
    document.getElementById('checkout-form-wrap').style.display = 'none';
    document.getElementById('checkout-summary-sidebar').innerHTML =
      '<div style="text-align:center;padding:32px 0;">' +
        '<p style="margin-bottom:16px;">Your cart is empty.</p>' +
        '<a href="shop.html" class="btn btn-primary">BROWSE JERSEYS</a>' +
      '</div>';
    initIntersectionObserver();
    return;
  }

  itemsContainer.innerHTML = '';
  var subtotal = 0;

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var product = findProduct(item.id);
    if (!product) continue;
    var lineTotal = product.price * item.qty;
    subtotal += lineTotal;

    var div = document.createElement('div');
    div.className = 'checkout-item';
    div.innerHTML =
      '<img src="' + product.images[0] + '" alt="' + product.name + '">' +
      '<div class="checkout-item-info">' +
        '<div class="name">' + product.name + '</div>' +
        '<div class="meta">Size: ' + item.size + ' \u00d7 ' + item.qty + '</div>' +
        '<div class="meta">' + formatPrice(lineTotal) + '</div>' +
      '</div>';
    itemsContainer.appendChild(div);
  }

  /* Stock availability check on checkout */
  var stockWarnings = [];
  for (var ci = 0; ci < cart.length; ci++) {
    var cartItem = cart[ci];
    var prod = findProduct(cartItem.id);
    if (prod && prod.stock) {
      var avail = prod.stock[cartItem.size] != null ? prod.stock[cartItem.size] : 99;
      if (avail < cartItem.qty) {
        stockWarnings.push(prod.name + ' size ' + cartItem.size + ': ordered ' + cartItem.qty + ', only ' + avail + ' available');
      }
    }
  }
  if (stockWarnings.length > 0) {
    var warnBox = document.createElement('div');
    warnBox.style.cssText = 'background:#FFF3CD;color:#856404;border:1px solid #FFC107;padding:12px 16px;border-radius:4px;margin-bottom:16px;font-size:0.875rem;';
    warnBox.innerHTML = '<strong>Stock Warning:</strong><br>' + stockWarnings.join('<br>');
    document.getElementById('checkout-form-wrap').insertBefore(warnBox, document.getElementById('checkout-form-wrap').firstChild);
  }

  subtotalEl.textContent = formatPrice(subtotal);
  var shipping = subtotal >= 5000 ? 0 : 300;
  shippingEl.innerHTML = shipping === 0 ? '<span class="free">FREE</span>' : formatPrice(shipping);
  totalEl.textContent = formatPrice(subtotal + shipping);
  initIntersectionObserver();

  /* Payment selection */
  var paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach(function(opt) {
    opt.addEventListener('click', function() {
      paymentOptions.forEach(function(o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      opt.querySelector('input[type="radio"]').checked = true;

      document.querySelectorAll('.payment-instructions').forEach(function(el) { el.classList.remove('open'); });
      var instructions = opt.querySelector('.payment-instructions');
      if (instructions) instructions.classList.add('open');
    });
  });

  /* Form submission */
  var form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var name = document.getElementById('checkout-name').value.trim();
      var phone = document.getElementById('checkout-phone').value.trim();
      var city = document.getElementById('checkout-city').value.trim();
      var address = document.getElementById('checkout-address').value.trim();
      var notes = document.getElementById('checkout-notes').value.trim();

      if (!name || !phone || !city || !address) {
        alert('Please fill in all required fields.');
        return;
      }

      var paymentInput = document.querySelector('input[name="payment"]:checked');
      if (!paymentInput) {
        alert('Please select a payment method.');
        return;
      }
      var paymentMethod = paymentInput.value;

      var cart = getCart();
      if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
      }

      var txnId = '';
      if (paymentMethod === 'jazzcash') {
        txnId = document.getElementById('txn-jazzcash').value.trim();
      } else if (paymentMethod === 'easypaisa') {
        txnId = document.getElementById('txn-easypaisa').value.trim();
      }

      var items = [];
      for (var i = 0; i < cart.length; i++) {
        items.push({
          product_id: cart[i].id,
          size: cart[i].size,
          quantity: cart[i].qty
        });
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'PLACING ORDER...';
      submitBtn.disabled = true;

      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone: phone,
          city: city,
          address: address,
          notes: notes,
          payment_method: paymentMethod,
          transaction_id: txnId,
          items: items
        })
      })
      .then(function(r) {
        if (!r.ok) {
          return r.json().then(function(errData) {
            throw new Error(errData.error || 'Order failed');
          });
        }
        return r.json();
      })
      .then(function(data) {
        localStorage.removeItem('trio_cart');
        updateCartBadge();

        document.getElementById('success-order-id').textContent = 'Order ID: ' + data.orderId;
        document.getElementById('track-order-btn').href = 'track.html?id=' + data.orderId;

        document.getElementById('checkout-form-wrap').style.display = 'none';
        document.getElementById('checkout-summary-sidebar').style.display = 'none';
        document.getElementById('checkout-success').classList.add('show');
      })
      .catch(function(err) {
        alert(err.message || 'Failed to place order. Please try again or contact support.');
        submitBtn.textContent = 'PLACE ORDER';
        submitBtn.disabled = false;
      });
    });
  }
}

/* ===== POLICIES PAGE ===== */
function initPoliciesPage() {
  var links = document.querySelectorAll('.policies-nav a');
  var sections = document.querySelectorAll('.policy-section');

  function setActive(id) {
    links.forEach(function(link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  links.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var id = this.getAttribute('href').substring(1);
      var target = document.getElementById(id);
      if (target) {
        var offset = 100;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        setActive(id);
      }
    });
  });

  /* Update active on scroll */
  window.addEventListener('scroll', function() {
    var current = '';
    sections.forEach(function(section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= 120) current = section.id;
    });
    if (current) setActive(current);
  });
}

/* ===== HOME PAGE ===== */
function initHomePage() {
  var grid = document.getElementById('matchday-grid');
  if (!grid) return;
  grid.innerHTML = '';

  var bestSellers = [];
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].bestSeller) bestSellers.push(PRODUCTS[i]);
  }

  for (var j = 0; j < bestSellers.length; j++) {
    grid.appendChild(renderProductCard(bestSellers[j]));
  }

  initIntersectionObserver();
}

/* ===== ABOUT PAGE ===== */
function initAboutPage() {
  initIntersectionObserver();
}

/* ===== TRACK PAGE ===== */
function initTrackPage() {
  var lookup = document.getElementById('track-lookup');
  if (lookup) initIntersectionObserver();
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initFooter();
  updateCartBadge();
  initWishlistButtons();
  initAddToCartButtons();

  var page = document.body.dataset.page;

  function runPageInit() {
    if (page === 'home') initHomePage();
    else if (page === 'shop') initShopPage();
    else if (page === 'cart') initCartPage();
    else if (page === 'checkout') initCheckoutPage();
    else if (page === 'about') initAboutPage();
    else if (page === 'policies') { initPoliciesPage(); initIntersectionObserver(); }
    else if (page === 'track') initTrackPage();
    else { initIntersectionObserver(); }
  }

  if (page === 'shop' || page === 'home' || page === 'cart') {
    fetchProductsFromApi(runPageInit);
  } else {
    runPageInit();
  }
});
