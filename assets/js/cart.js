/**
 * SANORE Shopping Cart System
 * Handles localStorage persistence, UI rendering, and WhatsApp checkout.
 */

class ShoppingCart {
  constructor() {
    this.cart = this.loadCart();
    this.whatsappNumber = "6281382885293"; // Updated from existing site links
    this.init();
  }

  init() {
    // Inject Cart HTML if not already present
    this.injectCartHTML();
    
    // Bind Event Listeners
    this.bindEvents();
    
    // Initial Render
    this.render();
  }

  loadCart() {
    const savedCart = localStorage.getItem('sanore_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }

  saveCart() {
    localStorage.setItem('sanore_cart', JSON.stringify(this.cart));
    this.render();
  }

  addToCart(product) {
    // product: { id, name, variant, price, img }
    const existingItem = this.cart.find(item => item.id === product.id && item.variant === product.variant);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...product,
        quantity: 1
      });
    }

    this.saveCart();
    this.openCart();
    this.showAddSuccess(product.id, product.variant);
  }

  updateQuantity(id, variant, delta) {
    const item = this.cart.find(i => i.id === id && i.variant === variant);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(id, variant);
      } else {
        this.saveCart();
      }
    }
  }

  removeFromCart(id, variant) {
    this.cart = this.cart.filter(item => !(item.id === id && item.variant === variant));
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    localStorage.removeItem('sanore_cart');
    this.render();
  }

  getTotal() {
    return this.cart.reduce((sum, item) => {
      const price = parseInt(item.price.replace(/[^0-9]/g, ''));
      return sum + (price * item.quantity);
    }, 0);
  }

  formatPrice(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
  }

  injectCartHTML() {
    if (document.getElementById('cart-sidebar-wrapper')) return;

    const cartHTML = `
      <div id="cart-sidebar-wrapper">
        <div class="cart-overlay" id="cart-overlay"></div>
        <div class="cart-sidebar" id="cart-sidebar">
          <div class="cart-header">
            <h2>Your Cart</h2>
            <button class="close-cart" id="close-cart" aria-label="Close cart">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="cart-items-container" id="cart-items">
            <!-- Items injected via JS -->
          </div>
          <div class="cart-footer">
            <div class="cart-total">
              <span>Total</span>
              <span id="cart-total-value">Rp 0</span>
            </div>
            <button class="checkout-btn" id="whatsapp-checkout">
              PESAN VIA WHATSAPP
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cartHTML);
  }

  bindEvents() {
    // Open cart via navbar buttons
    document.addEventListener('click', (e) => {
      const cartToggle = e.target.closest('.nav-cart-btn');
      if (cartToggle) {
        this.openCart();
      }

      const closeBtn = e.target.closest('#close-cart');
      const overlay = e.target.closest('#cart-overlay');
      if (closeBtn || overlay) {
        this.closeCart();
      }

      // Add to Cart buttons
      const addBtn = e.target.closest('.add-to-cart-btn, .btn-cart');
      if (addBtn) {
        const productData = {
          id: addBtn.dataset.id || addBtn.closest('[id]')?.id || 'product',
          name: addBtn.dataset.name,
          variant: addBtn.dataset.variant || 'Default',
          price: addBtn.dataset.price,
          img: addBtn.dataset.img
        };

        // Special handling for product.html size toggles
        if (!productData.price || !productData.variant) {
          const card = addBtn.closest('.product-info-box') || addBtn.closest('.product-detail-card');
          if (card) {
            const activeSize = card.querySelector('.size-option.active');
            const priceEl = card.querySelector('.product-card-price');
            const nameEl = card.querySelector('.product-card-title');
            const imgEl = card.parentElement.querySelector('img');

            productData.name = nameEl ? nameEl.innerText : productData.name;
            productData.variant = activeSize ? activeSize.innerText : productData.variant;
            productData.price = priceEl ? priceEl.innerText : productData.price;
            productData.img = imgEl ? imgEl.getAttribute('src') : productData.img;
          }
        }
        
        if (productData.name && productData.price) {
            this.addToCart(productData);
        }
      }

      // Checkout
      if (e.target.closest('#whatsapp-checkout')) {
        this.checkout();
      }
    });
  }

  openCart() {
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeCart() {
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
    document.body.style.overflow = '';
  }

  render() {
    const container = document.getElementById('cart-items');
    const badge = document.querySelector('.cart-count-badge');
    const totalEl = document.getElementById('cart-total-value');
    const checkoutBtn = document.getElementById('whatsapp-checkout');

    if (!container) return;

    // Update Badge
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
      badge.innerText = totalItems;
      badge.classList.toggle('visible', totalItems > 0);
    }

    // Update Total
    totalEl.innerText = this.formatPrice(this.getTotal());

    // Enable/Disable Checkout
    checkoutBtn.disabled = this.cart.length === 0;

    if (this.cart.length === 0) {
      container.innerHTML = '<div class="cart-empty-msg">Your cart is empty</div>';
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-main">
          <img src="${item.img}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <div class="cart-item-header">
              <h4 class="cart-item-title">${item.name}</h4>
              <button class="remove-item-btn" onclick="cartSystem.removeFromCart('${item.id}', '${item.variant}')" aria-label="Remove item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            <p class="cart-item-variant">${item.variant}</p>
            <div class="cart-item-footer">
              <div class="qty-control">
                <button class="qty-btn" onclick="cartSystem.updateQuantity('${item.id}', '${item.variant}', -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="cartSystem.updateQuantity('${item.id}', '${item.variant}', 1)">+</button>
              </div>
              <span class="item-price">${item.price}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  showAddSuccess(id, variant) {
    // Optional: add visual feedback to the clicked button
    const btns = document.querySelectorAll(`[data-id="${id}"][data-variant="${variant}"]`);
    btns.forEach(btn => {
      const originalText = btn.innerText;
      btn.classList.add('btn-added');
      btn.innerText = 'Added!';
      setTimeout(() => {
        btn.classList.remove('btn-added');
        btn.innerText = originalText;
      }, 2000);
    });
  }

  checkout() {
    if (this.cart.length === 0) return;

    let message = "Halo SANORE, saya ingin memesan:\n\n";
    this.cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.variant})\n`;
      message += `   Jumlah: ${item.quantity}\n`;
      message += `   Harga: ${item.price}\n\n`;
    });

    message += `Total Pesanan: ${this.formatPrice(this.getTotal())}\n`;
    message += `------------------------------\n`;
    message += `Mohon info untuk kelanjutan pesanannya. Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    // Clear cart after checkout as requested
    setTimeout(() => {
      this.clearCart();
      this.closeCart();
    }, 1000);
  }
}

// Initialize the cart system
const cartSystem = new ShoppingCart();
window.cartSystem = cartSystem; // Expose to window for inline onclicks
