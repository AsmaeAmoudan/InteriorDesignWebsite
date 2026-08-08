/* ============================================================
   ATELIER BAHAJ — Script principal
   Vanilla JavaScript — aucune dépendance externe
   ============================================================
   Fonctionnalités :
   1.  Configuration centrale (numéro WhatsApp, etc.)
   2.  Menu mobile (ouverture / fermeture / overlay)
   3.  État du header au scroll
   4.  Validation du formulaire de contact
   5.  Galerie produit (thumbnails)
   6.  Filtres produits (category pages)
   7.  Accordéon FAQ
   8.  Pré-remplissage WhatsApp depuis les boutons produit
   9.  Support prefers-reduced-motion
   10. Active nav link selon la page courante
   ============================================================ */

(function () {
  'use strict';

  /* =========================================================
     1. CONFIGURATION CENTRALE
     ---------------------------------------------------------
     👉 REMPLACEZ les valeurs ci-dessous par les informations
     réelles de Atelier Bahaj avant la mise en ligne.
     ========================================================= */
  const CONFIG = {
    // Numéro WhatsApp au format international, sans "+" ni espaces
    // Exemple : 212600000000  (Maroc)
    whatsappNumber: '212600000000',
    phoneDisplay: '+212 6 00 00 00 00',
    email: 'contact@atelierbahaj.ma',
    showroomAddress: 'Adresse du showroom — à compléter',
    citiesServed: 'Villes desservies — à compléter',
  };

  /* =========================================================
     2. MENU MOBILE
     ========================================================= */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const menuOverlay = document.querySelector('.menu-overlay');
  const body = document.body;

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    if (menuOverlay) menuOverlay.classList.add('open');
    body.classList.add('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    if (menuOverlay) menuOverlay.classList.remove('open');
    body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', openMobileMenu);
  }
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }
  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMobileMenu);
  }

  // Fermer le menu mobile lors du clic sur un lien
  document.querySelectorAll('.mobile-nav a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // Fermer avec Échap
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  /* =========================================================
     3. ÉTAT DU HEADER AU SCROLL
     ========================================================= */
  const siteHeader = document.querySelector('.site-header');
  let lastScrollY = 0;

  function handleScroll() {
    const scrollY = window.scrollY;
    if (siteHeader) {
      if (scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }
    lastScrollY = scrollY;
  }

  // Throttle simple pour le scroll
  let scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        handleScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  handleScroll();

  /* =========================================================
     4. VALIDATION DU FORMULAIRE DE CONTACT
     ========================================================= */
  const contactForm = document.querySelector('#contact-form');

  if (contactForm) {
    const formMessage = contactForm.querySelector('.form-message');

    function showError(field, message) {
      const group = field.closest('.form-group');
      if (!group) return;
      group.classList.add('error');
      const errorEl = group.querySelector('.form-error');
      if (errorEl) errorEl.textContent = message;
    }

    function clearError(field) {
      const group = field.closest('.form-group');
      if (!group) return;
      group.classList.remove('error');
    }

    function validateEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validatePhone(value) {
      // Accepte les formats marocains et internationaux courants
      const cleaned = value.replace(/[\s\-().]/g, '');
      return /^[+]?[0-9]{8,15}$/.test(cleaned);
    }

    function validateField(field) {
      const value = field.value.trim();
      const isRequired = field.hasAttribute('required');

      if (isRequired && value === '') {
        showError(field, 'Ce champ est obligatoire.');
        return false;
      }

      if (field.type === 'email' && value !== '' && !validateEmail(value)) {
        showError(field, 'Veuillez saisir une adresse e-mail valide.');
        return false;
      }

      if (field.type === 'tel' && value !== '' && !validatePhone(value)) {
        showError(field, 'Veuillez saisir un numéro de téléphone valide.');
        return false;
      }

      if (field.type === 'checkbox' && isRequired && !field.checked) {
        showError(field, 'Vous devez accepter pour continuer.');
        return false;
      }

      clearError(field);
      return true;
    }

    // Validation en temps réel (au blur)
    contactForm.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(field);
      });
      field.addEventListener('input', function () {
        const group = field.closest('.form-group');
        if (group && group.classList.contains('error')) {
          validateField(field);
        }
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Réinitialiser le message
      if (formMessage) {
        formMessage.className = 'form-message';
        formMessage.textContent = '';
      }

      let isValid = true;
      const fields = contactForm.querySelectorAll('input[required], textarea[required], select[required], input[type="checkbox"][required]');

      fields.forEach(function (field) {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      // Validation de l'email même s'il n'est pas required mais rempli
      const emailField = contactForm.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim() !== '' && !validateEmail(emailField.value.trim())) {
        showError(emailField, 'Veuillez saisir une adresse e-mail valide.');
        isValid = false;
      }

      if (!isValid) {
        if (formMessage) {
          formMessage.className = 'form-message error';
          formMessage.textContent = 'Veuillez corriger les champs en erreur avant d’envoyer votre message.';
        }
        // Focus sur le premier champ en erreur
        const firstError = contactForm.querySelector('.form-group.error .form-control, .form-group.error input[type="checkbox"]');
        if (firstError) firstError.focus();
        return;
      }

      // Succès — aucun backend connecté
      // Le formulaire est prêt pour une future intégration backend
      if (formMessage) {
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Merci pour votre message ! Il n’y a pas encore de backend connecté, mais votre demande a bien été validée. Nous vous répondrons dès que possible.';
      }

      contactForm.reset();

      // Scroll vers le message
      if (formMessage) {
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* =========================================================
     5. GALERIE PRODUIT (thumbnails)
     ========================================================= */
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  const galleryMain = document.querySelector('.gallery-main img');

  if (galleryThumbs.length && galleryMain) {
    galleryThumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        const thumbImg = thumb.querySelector('img');
        if (!thumbImg) return;

        // Échanger l'image principale
        const mainSrc = galleryMain.src;
        const mainAlt = galleryMain.alt;
        galleryMain.src = thumbImg.src;
        galleryMain.alt = thumbImg.alt;
        thumbImg.src = mainSrc;
        thumbImg.alt = mainAlt;

        // État actif
        galleryThumbs.forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });

      // Navigation clavier
      thumb.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          thumb.click();
        }
      });
    });
  }

  /* =========================================================
     6. FILTRES PRODUITS (category pages)
     ========================================================= */
  const filterTags = document.querySelectorAll('.filter-tag');
  const productCards = document.querySelectorAll('.product-grid .product-card');
  const filterCount = document.querySelector('.filter-count');

  if (filterTags.length && productCards.length) {
    filterTags.forEach(function (tag) {
      tag.addEventListener('click', function () {
        const filter = tag.getAttribute('data-filter');

        // État actif
        filterTags.forEach(function (t) { t.classList.remove('active'); });
        tag.classList.add('active');

        let visibleCount = 0;

        productCards.forEach(function (card) {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category === filter) {
            card.style.display = '';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        if (filterCount) {
          filterCount.textContent = visibleCount + ' produit' + (visibleCount > 1 ? 's' : '');
        }
      });
    });
  }

  /* =========================================================
     7. ACCORDÉON FAQ
     ========================================================= */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      const item = header.closest('.accordion-item');
      const content = item?.querySelector('.accordion-content');
      if (!content) return;

      const isOpen = item.classList.contains('open');

      // Fermer tous les autres (optionnel — un seul ouvert à la fois)
      document.querySelectorAll('.accordion-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-content').style.maxHeight = '0';
          openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        content.style.maxHeight = '0';
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* =========================================================
     8. PRÉ-REMPLISSAGE WHATSAPP
     ---------------------------------------------------------
     Les boutons avec la classe .wa-product et un attribut
     data-product-name construiront automatiquement le lien
     WhatsApp avec un message pré-rempli.
     ========================================================= */
  document.querySelectorAll('.wa-product').forEach(function (btn) {
    const productName = btn.getAttribute('data-product-name') || 'ce produit';
    const message = 'Bonjour, je souhaite obtenir plus d’informations sur le produit ' + productName + ' proposé par Atelier Bahaj.';
    const encoded = encodeURIComponent(message);
    btn.href = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encoded;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
  });

  // Bouton WhatsApp générique dans le header / footer
  document.querySelectorAll('.wa-general').forEach(function (link) {
    const message = 'Bonjour Atelier Bahaj, je souhaite obtenir plus d’informations sur vos collections de mobilier.';
    const encoded = encodeURIComponent(message);
    link.href = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encoded;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  /* =========================================================
     9. SUPPORT prefers-reduced-motion
     ========================================================= */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function applyMotionPreference() {
    if (prefersReducedMotion.matches) {
      document.documentElement.style.scrollBehavior = 'auto';
    } else {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }

  applyMotionPreference();
  prefersReducedMotion.addEventListener('change', applyMotionPreference);

  /* =========================================================
     10. LIEN DE NAVIGATION ACTIF
     ========================================================= */
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    document.querySelectorAll('.nav-list a, .mobile-nav a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      // Normaliser
      const linkFile = href.split('#')[0].split('?')[0];
      const cleanHref = linkFile.substring(linkFile.lastIndexOf('/') + 1) || 'index.html';

      if (cleanHref === fileName) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }

      // Gérer les pages catégorie — mettre "Collections" actif
      const categoryPages = ['salons.html', 'canapes.html', 'salle-a-manger.html', 'chambres.html', 'chaises.html', 'mobilier-exterieur.html', 'produit.html'];
      if (categoryPages.indexOf(fileName) !== -1 && (cleanHref === 'collections.html' || cleanHref === fileName)) {
        link.classList.add('active');
      }
    });
  }

  setActiveNavLink();

  /* =========================================================
     INIT: log de démarrage (retirable)
     ========================================================= */
  console.log('Atelier Bahaj — site initialisé. Remplacez les variables dans CONFIG (script.js) par vos informations réelles.');

})();
