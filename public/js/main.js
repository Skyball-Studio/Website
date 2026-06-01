/* ==========================================================================
   SKYBALL STUDIO - INTERACTIVE ARCHITECTURAL DYNAMICS
   Interactive Aura Blobs, 3D Transforms, Lightbox, AJAX Form validation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize dynamic aura tracker
  initAmbientAura();

  // Initialize interactive header scrolling
  initHeaderScroll();

  // Initialize mobile menu toggle
  initMobileMenu();

  // Initialize theme switcher (Creativa vs Celeste)
  initThemeSwitcher();

  // Initialize 3D cursor tracking for School Buddies Card
  init3DCharacterCard();

  // Initialize custom video player controls for Forgetful
  initCustomVideoPlayer();

  // Initialize filterable gallery grid
  initGalleryFilter();

  // Initialize custom lightbox modal
  initLightbox();

  // Initialize 3D flip card and contact details flip
  init3DCardFlip();

  // Initialize AJAX contact form validation
  initContactForm();

  // Initialize dynamic image-dependent ambient colors per section for Lee Rang
  initLeeAmbientColors();
});

const CONTACT_EMAIL = 'skyballstudio@gmail.com';

function getContactMailtoUrl({ name, email, message, intendedArtist }) {
  const recipient = intendedArtist || 'Skyball Studio Core Team';
  const subject = encodeURIComponent(`Portfolio inquiry for ${recipient}`);
  const body = encodeURIComponent(
    [
      `Name: ${name}`,
      `Email: ${email}`,
      `Intended recipient: ${recipient}`,
      '',
      message
    ].join('\n')
  );

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

async function submitSkyballContact(payload) {
  if (window.SKYBALL_STATIC_SITE) {
    if (window.SKYBALL_CONTACT_WEBHOOK_URL) {
      const response = await fetch(window.SKYBALL_CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: 'skyball-studio-portfolio',
          timestamp: new Date().toISOString(),
          ...payload
        })
      });

      if (!response.ok) {
        throw new Error('Message webhook failed. Please email us directly.');
      }

      return {
        success: true,
        message: 'Thank you. Your message has been sent.'
      };
    }

    window.location.href = getContactMailtoUrl(payload);
    const recipient = payload.intendedArtist || 'Skyball Studio';
    return {
      success: true,
      message: `Your email app is opening with a prepared message for ${recipient}.`
    };
  }

  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

/* ==========================================================================
   1. INTERACTIVE AMBIENT AURA TRACKING
   ========================================================================== */
function initAmbientAura() {
  const container = document.querySelector('.aura-container');
  if (!container) return;

  // Add an interactive glowing spotlight that follows the user's mouse
  const spotlight = document.createElement('div');
  spotlight.className = 'aura-blob';
  spotlight.style.width = '350px';
  spotlight.style.height = '350px';
  spotlight.style.background = 'radial-gradient(circle, rgba(var(--neon-blue-rgb), 0.08) 0%, transparent 70%)';
  spotlight.style.top = '0';
  spotlight.style.left = '0';
  spotlight.style.filter = 'blur(100px)';
  spotlight.style.transform = 'translate(-50%, -50%)';
  spotlight.style.opacity = '0';
  spotlight.style.pointerEvents = 'none';
  spotlight.style.zIndex = '-2';
  spotlight.style.transition = 'opacity 1s ease';
  
  container.appendChild(spotlight);

  document.addEventListener('mousemove', (e) => {
    spotlight.style.opacity = '1';
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY + window.scrollY}px`;
  });

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
}

/* ==========================================================================
   2. HEADER NAVIGATION & SMOOTH SCROLLS
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.height = '70px';
      header.style.background = 'rgba(5, 5, 8, 0.9)';
    } else {
      header.style.height = '80px';
      header.style.background = 'rgba(5, 5, 8, 0.6)';
    }
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });
}

/* ==========================================================================
   3. CREATIVA VS CELESTE SWITCHER
   ========================================================================== */
function initThemeSwitcher() {
  const body = document.body;
  const creativaCard = document.querySelector('.phil-card.creativa');
  const celesteCard = document.querySelector('.phil-card.celeste');

  if (!creativaCard || !celesteCard) return;

  creativaCard.addEventListener('click', () => {
    body.setAttribute('data-theme', 'creativa');
    creativaCard.classList.add('active');
    celesteCard.classList.remove('active');
    updateThemeElements('creativa');
  });

  celesteCard.addEventListener('click', () => {
    body.setAttribute('data-theme', 'celeste');
    celesteCard.classList.add('active');
    creativaCard.classList.remove('active');
    updateThemeElements('celeste');
  });
}

function updateThemeElements(theme) {
  // Smoothly update standard theme colors in active CSS components
  const formLabels = document.querySelectorAll('.form-label');
  formLabels.forEach(label => {
    label.style.transition = 'color 0.4s ease';
  });
}

/* ==========================================================================
   4. 3D CURSOR-TRACKING FOR SCHOOL BUDDIES CARD
   ========================================================================== */
function init3DCharacterCard() {
  const container = document.querySelector('.sb-character-container');
  const card = document.querySelector('.sb-character-card');
  const glow = document.querySelector('.character-card-glow');

  if (!container || !card || !glow) return;

  container.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Subtle premium rotation (-15 to 15 degrees)
    const rotateY = ((x / rect.width) - 0.5) * 22;
    const rotateX = -(((y / rect.height) - 0.5) * 22);

    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    card.style.transition = 'none';

    // Move Card Glow spot
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
    glow.style.opacity = '1';
  });

  container.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';
    glow.style.opacity = '0';
  });
}

/* ==========================================================================
   5. CUSTOM VIDEO PLAYER (Forgetful Gameplay Trailer)
   ========================================================================== */
function initCustomVideoPlayer() {
  const video = document.querySelector('.custom-video');
  const overlay = document.querySelector('.video-overlay-play');

  if (!video || !overlay) return;

  overlay.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      overlay.classList.add('playing');
      video.setAttribute('controls', 'true');
    } else {
      video.pause();
      overlay.classList.remove('playing');
    }
  });

  video.addEventListener('pause', () => {
    overlay.classList.remove('playing');
  });

  video.addEventListener('ended', () => {
    overlay.classList.remove('playing');
    video.removeAttribute('controls');
    video.load();
  });
}

/* ==========================================================================
   6. FILTERABLE PORTFOLIO SHOWCASE
   ========================================================================== */
function initGalleryFilter() {
  const filters = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');

  if (!filters.length || !items.length) return;

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');

      const target = filter.getAttribute('data-filter');

      items.forEach(item => {
        const categories = item.getAttribute('data-category').split(' ');

        if (target === 'all' || categories.includes(target)) {
          item.classList.remove('hide');
          item.style.animation = 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        } else {
          item.classList.add('hide');
        }
      });
    });
  });
}

/* ==========================================================================
   7. PORTFOLIO GRID LIGHTBOX MODAL
   ========================================================================== */
function initLightbox() {
  const modal = document.querySelector('.lightbox-modal');
  const items = document.querySelectorAll('.gallery-item');
  const closeBtn = document.querySelector('.lightbox-close');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxTitle = document.querySelector('.lightbox-title');
  const lightboxAuthor = document.querySelector('.lightbox-author');

  if (!modal || !items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const title = item.getAttribute('data-title');
      const author = item.getAttribute('data-author');

      if (src) {
        lightboxImg.src = src;
        lightboxTitle.textContent = title || 'Artwork';
        lightboxAuthor.textContent = author ? `By ${author}` : 'Skyball Studio';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImg.src = '';
    }, 500);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   8. 3D BUSINESS CARD FLIP ANIMATION
   ========================================================================== */
function init3DCardFlip() {
  const card = document.querySelector('.business-card-container');
  if (!card) return;

  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  card.addEventListener('mousemove', (e) => {
    if (card.classList.contains('flipped')) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 20;
    const rotateX = -(((y / rect.height) - 0.5) * 20);

    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    card.style.transition = 'none';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    if (card.classList.contains('flipped')) {
      card.style.transform = 'rotateY(180deg)';
    } else {
      card.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
  });
}

/* ==========================================================================
   9. AJAX FORM SUBMISSION & VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('skyball-contact-form');
  const statusDiv = document.querySelector('.form-status');
  const submitBtn = document.querySelector('.form-submit-btn');

  if (!form || !statusDiv || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();

    statusDiv.style.display = 'none';
    statusDiv.className = 'form-status';
    statusDiv.textContent = '';

    if (!name || !email || !message) {
      showFormStatus('error', 'Please fill in all fields before sending.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormStatus('error', 'Please enter a valid email address.');
      return;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    try {
      const data = await submitSkyballContact({ name, email, message });
      showFormStatus('success', data.message);
      form.reset();

      // Flip business card to back details as interactive reward
      const card = document.querySelector('.business-card-container');
      if (card) {
        card.classList.add('flipped');
      }
    } catch (err) {
      console.error('Contact Form error:', err);
      showFormStatus('error', err.message || 'Failed to send message. Please check your network connection.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function showFormStatus(type, msg) {
    statusDiv.style.display = 'block';
    statusDiv.classList.add(type);
    statusDiv.textContent = msg;
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ==========================================================================
   10. DYNAMIC DUAL-GRADIENT & GLOBAL SCROLLING AURA SYNCHRONIZATION
   ========================================================================== */
function initLeeAmbientColors() {
  const sections = document.querySelectorAll('.lee-section');
  if (!sections.length) return;

  const aura1 = document.querySelector('.aura-container .aura-1');
  const aura2 = document.querySelector('.aura-container .aura-2');

  // Cache to store extracted colors per section ID
  const sectionColors = {};

  // Hidden canvas for quick average color extraction
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 10;
  canvas.height = 10;

  // Extract vibrant dominant color from an image URL
  function extractVibrantColor(imgSrc, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      ctx.drawImage(img, 0, 0, 10, 10);
      const imgData = ctx.getImageData(0, 0, 10, 10).data;

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      let vibrantR = 0, vibrantG = 0, vibrantB = 0, maxSat = -1;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        if (a < 200) continue; // Skip semi-transparent pixels

        rSum += r;
        gSum += g;
        bSum += b;
        count++;

        // Convert RGB to HSL-like saturation to find the most vibrant tone
        const maxVal = Math.max(r, g, b);
        const minVal = Math.min(r, g, b);
        const delta = maxVal - minVal;
        const saturation = maxVal === 0 ? 0 : delta / maxVal;

        // Ideal lightness range for background aesthetic glows
        const lightness = (maxVal + minVal) / 510;
        const isGoodLightness = lightness > 0.15 && lightness < 0.85;

        if (isGoodLightness && saturation > maxSat) {
          maxSat = saturation;
          vibrantR = r;
          vibrantG = g;
          vibrantB = b;
        }
      }

      // Fallback if no vibrant color found
      if (maxSat < 0.12 && count > 0) {
        vibrantR = Math.round(rSum / count);
        vibrantG = Math.round(gSum / count);
        vibrantB = Math.round(bSum / count);
      }

      callback({ r: vibrantR, g: vibrantG, b: vibrantB });
    };

    img.onerror = function () {
      console.warn('Could not extract color from: ' + imgSrc);
    };

    img.src = imgSrc;
  }

  // Loop sections to extract colors and configure dynamic background
  sections.forEach((section) => {
    const imgSrc = section.getAttribute('data-ambient-src');
    if (!imgSrc) return;

    extractVibrantColor(imgSrc, (color) => {
      const rgbStr = `${color.r}, ${color.g}, ${color.b}`;
      sectionColors[section.id] = rgbStr;
      
      // Store custom CSS property on section element
      section.style.setProperty('--ambient-color-rgb', rgbStr);

      // Smooth background gradient transition (Radial top-right ambient + linear base)
      section.style.transition = 'background 1.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
      section.style.background = `radial-gradient(circle at 80% 20%, rgba(${rgbStr}, 0.14) 0%, rgba(5, 5, 8, 0) 70%), linear-gradient(135deg, rgba(${rgbStr}, 0.05) 0%, #050508 100%)`;
      section.style.borderBottomColor = `rgba(${rgbStr}, 0.08)`;
    });
  });

  // IntersectionObserver to synchronize global drifting viewport aura-blobs with the active section
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px', // Trigger when section occupies the central viewport
    threshold: 0.25
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        const rgbStr = sectionColors[sectionId];
        
        if (rgbStr && aura1 && aura2) {
          // Smooth transition for global viewport ambient aura blobs
          aura1.style.background = `rgba(${rgbStr}, 0.16)`;
          aura2.style.background = `rgba(${rgbStr}, 0.12)`;
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}
