/**
 * AJ LEAR GILLACO — Portfolio JavaScript
 * Handles: Custom Cursor, Sticky Navbar, Mobile Menu,
 *          Scroll Reveal, Gallery Filter, Typewriter,
 *          Skill Bar Animation, Form, Copyright Year
 */

'use strict';

/* ============================================================
   1. UTILITY HELPERS
   ============================================================ */

/**
 * Throttle a function — limits how often it can be called.
 * @param {Function} fn  - Function to throttle
 * @param {number}   ms  - Minimum milliseconds between calls
 */
function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/* ============================================================
   2. CUSTOM CURSOR (desktop only)
   ============================================================ */
(function initCursor() {
  // Only activate on pointer-fine devices (mice, not touch)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId  = null;

  // Track raw mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot follows instantly
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring follows with lerp for smoothness
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Grow ring on interactive elements
  const interactives = 'a, button, .gallery-card, .filter-btn, .skill-badge, .contact-link-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      ring.style.width  = '56px';
      ring.style.height = '56px';
      ring.style.opacity = '0.4';
      dot.style.width  = '12px';
      dot.style.height = '12px';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.opacity = '0.6';
      dot.style.width  = '8px';
      dot.style.height = '8px';
    }
  });
})();


/* ============================================================
   3. STICKY NAVBAR — add class on scroll
   ============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = throttle(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ============================================================
   4. ACTIVE NAV LINK — highlight current section
   ============================================================ */
(function initActiveNav() {
  const navLinks    = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const allLinks    = [...navLinks, ...mobileLinks];
  const sections    = document.querySelectorAll('section[id]');

  if (!sections.length) return;

  const onScroll = throttle(() => {
    let currentId = '';

    sections.forEach((section) => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        currentId = section.getAttribute('id');
      }
    });

    allLinks.forEach((link) => {
      const section = link.getAttribute('data-section');
      link.classList.toggle('active', section === currentId);
    });
  }, 120);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ============================================================
   5. MOBILE HAMBURGER MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function toggleMenu(open) {
    isOpen = open;
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu(!isOpen));

  // Close on mobile link click
  mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-cta').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggleMenu(false);
  });
})();


/* ============================================================
   6. SCROLL REVEAL — animate elements as they enter viewport
   ============================================================ */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach((el) => observer.observe(el));
})();


/* ============================================================
   7. SKILL BAR ANIMATION
   Trigger bar fill animation when the skills section is visible
   ============================================================ */
(function initSkillBars() {
  const skillCategories = document.querySelectorAll('.skill-category');
  if (!skillCategories.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillCategories.forEach((cat) => observer.observe(cat));
})();


/* ============================================================
   8. TYPEWRITER EFFECT (Hero Heading)
   ============================================================ */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const words = [
    'Experiences.',
    'Interfaces.',
    'Designs.',
    'Solutions.',
    'Visuals.',
  ];

  let wordIndex   = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let typingSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];

    if (!isDeleting) {
      // Typing forward
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentWord.length) {
        // Pause at end of word
        typingSpeed = 2000;
        isDeleting  = true;
      } else {
        typingSpeed = 90 + Math.random() * 40;
      }
    } else {
      // Deleting
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;

      if (charIndex === 0) {
        isDeleting  = false;
        wordIndex   = (wordIndex + 1) % words.length;
        typingSpeed = 350;
      }
    }

    setTimeout(type, typingSpeed);
  }

  // Initial delay before starting
  setTimeout(type, 800);
})();


/* ============================================================
   9. GALLERY FILTER
   Filters cards by data-category attribute
   ============================================================ */
(function initGalleryFilter() {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const galleryGrid = document.getElementById('galleryGrid');
  const noResults   = document.getElementById('noResults');

  if (!filterBtns.length || !galleryGrid) return;

  const allCards = galleryGrid.querySelectorAll('.gallery-card');

  function filterCards(filter) {
    let visibleCount = 0;

    allCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      const show     = filter === 'all' || category === filter;

      if (show) {
        card.classList.remove('hidden');
        card.style.display = '';
        visibleCount++;
      } else {
        card.classList.add('hidden');
        // Use a slight delay so opacity transition plays before display:none
        setTimeout(() => {
          if (card.classList.contains('hidden')) {
            card.style.display = 'none';
          }
        }, 400);
      }
    });

    // Show/hide "no results" message
    if (noResults) {
      noResults.hidden = visibleCount > 0;
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter
      filterCards(btn.getAttribute('data-filter') || 'all');
    });
  });

  // Initialize — show all on page load
  filterCards('all');
})();


/* ============================================================
   10. VIDEO HOVER PLAY (Animation Cards)
   Plays embedded videos when user hovers over the card
   ============================================================ */
(function initVideoHover() {
  document.querySelectorAll('.animation-card').forEach((card) => {
    const video = card.querySelector('.card-video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.play().catch(() => {}); // catch autoplay policy errors
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
})();


/* ============================================================
   11. CONTACT FORM (UI Demo)
   Shows a success message on submit button click.
   Replace with a real form handler (e.g., Formspree) for prod.
   ============================================================ */
(function initContactForm() {
  const submitBtn    = document.getElementById('formSubmitBtn');
  const formSuccess  = document.getElementById('formSuccess');

  const nameInput    = document.getElementById('contactName');
  const emailInput   = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');

  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    // Simple client-side validation
    const name    = nameInput?.value.trim();
    const email   = emailInput?.value.trim();
    const message = messageInput?.value.trim();

    if (!name || !email || !message) {
      // Shake animation on empty required fields
      [nameInput, emailInput, messageInput].forEach((input) => {
        if (input && !input.value.trim()) {
          input.style.borderColor = '#EF4444';
          input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.15)';
          setTimeout(() => {
            input.style.borderColor = '';
            input.style.boxShadow   = '';
          }, 2000);
        }
      });
      return;
    }

    // Simulate sending
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      // Reset form
      if (nameInput)    nameInput.value    = '';
      if (emailInput)   emailInput.value   = '';
      if (subjectInput) subjectInput.value = '';
      if (messageInput) messageInput.value = '';

      // Show success
      if (formSuccess) {
        formSuccess.hidden = false;
        setTimeout(() => { formSuccess.hidden = true; }, 5000);
      }

      // Reset button
      submitBtn.textContent = 'Send Message ✦';
      submitBtn.disabled    = false;
      submitBtn.style.opacity = '';
    }, 1500);
  });
})();


/* ============================================================
   12. COPYRIGHT YEAR — auto-update
   ============================================================ */
(function initCopyrightYear() {
  const el = document.getElementById('copyrightYear');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ============================================================
   13. SMOOTH CLOSE: close mobile menu on outside click
   ============================================================ */
(function initOutsideClick() {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger  = document.getElementById('hamburger');
  if (!mobileMenu || !hamburger) return;

  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      hamburger.click();
    }
  });
})();


/* ============================================================
   14. SMOOTH ANCHOR SCROLL (fallback for older browsers)
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ============================================================
   15. PAGE LOAD — trigger initial reveals for above-the-fold
   ============================================================ */
window.addEventListener('load', () => {
  // Force-reveal hero elements immediately
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
});

/* ============================================================
   16. LIGHTBOX
   Opens design images in a fullscreen overlay with
   prev/next navigation between all design cards.
   ============================================================ */
(function initLightbox() {
  const overlay   = document.getElementById('lightboxOverlay');
  const img       = document.getElementById('lightboxImg');
  const caption   = document.getElementById('lightboxCaption');
  const closeBtn  = document.getElementById('lightboxClose');
  const prevBtn   = document.getElementById('lightboxPrev');
  const nextBtn   = document.getElementById('lightboxNext');

  if (!overlay) return;

  // Collect all triggers in DOM order
  const triggers = [...document.querySelectorAll('.lightbox-trigger')];
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const trigger = triggers[currentIndex];

    img.src            = trigger.getAttribute('data-img');
    img.alt            = trigger.getAttribute('data-caption') || '';
    caption.textContent = trigger.getAttribute('data-caption') || '';

    // Hide arrows if only one image
    overlay.classList.toggle('single', triggers.length === 1);

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    // Focus the close button for accessibility
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeLightbox() {
    overlay.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src            = triggers[currentIndex].getAttribute('data-img');
      img.alt            = triggers[currentIndex].getAttribute('data-caption') || '';
      caption.textContent = triggers[currentIndex].getAttribute('data-caption') || '';
      img.style.opacity  = '1';
    }, 150);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % triggers.length;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src            = triggers[currentIndex].getAttribute('data-img');
      img.alt            = triggers[currentIndex].getAttribute('data-caption') || '';
      caption.textContent = triggers[currentIndex].getAttribute('data-caption') || '';
      img.style.opacity  = '1';
    }, 150);
  }

  // Smooth image swap transition
  img.style.transition = 'opacity 0.15s ease';

  // Open on trigger click
  triggers.forEach((trigger, i) => {
    trigger.addEventListener('click', () => openLightbox(i));
  });

  // Close button
  closeBtn.addEventListener('click', closeLightbox);

  // Prev / Next buttons
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Click outside image to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  // Keyboard: ESC to close, arrows to navigate
  document.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
})();