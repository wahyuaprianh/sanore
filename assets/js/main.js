// LUMIÈRE — main.js

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAVBAR SCROLL ----
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ---- SMOOTH REVEAL ON SCROLL ----
  const revealElements = document.querySelectorAll(
    '.product-card, .feature-card, .process-step, .team-card, .value-item, .editorial-item, .story-intro-inner > *'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, (entry.target.dataset.delay || 0) * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });

  // ---- ADD TO CART BUTTON FEEDBACK ----
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function () {
      const original = this.textContent;
      this.textContent = '✓ Added';
      this.style.background = 'var(--blue-mid)';
      this.style.color = 'white';
      this.style.borderColor = 'var(--blue-mid)';
      setTimeout(() => {
        this.textContent = original;
        this.style.background = '';
        this.style.color = '';
        this.style.borderColor = '';
      }, 1800);
    });
  });

  // ---- NEWSLETTER FORM ----
  document.querySelectorAll('.newsletter-row').forEach(form => {
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    btn.addEventListener('click', () => {
      if (input.value && input.value.includes('@')) {
        btn.textContent = '✓';
        btn.style.background = '#27ae60';
        input.value = '';
        input.placeholder = 'Thank you!';
        setTimeout(() => {
          btn.textContent = '→';
          btn.style.background = '';
          input.placeholder = 'Email address';
        }, 3000);
      } else {
        input.style.borderColor = 'rgba(255,100,100,0.5)';
        setTimeout(() => { input.style.borderColor = ''; }, 1500);
      }
    });
  });

  // ---- PARALLAX HERO BOTTLE ----
  const heroBotlle = document.querySelector('.hero-bottle');
  if (heroBotlle) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBotlle.style.transform = `translateY(calc(-18px + ${scrollY * 0.08}px))`;
      }
    });
  }

  // ---- CURSOR GLOW ----
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed; width: 300px; height: 300px;
    border-radius: 50%; pointer-events: none; z-index: 0;
    background: radial-gradient(circle, rgba(37,99,168,0.04) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.8s ease, top 0.8s ease;
  `;
  document.body.appendChild(cursor);
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

});