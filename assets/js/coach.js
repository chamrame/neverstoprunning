/* ============================================================
   COACH.JS — Scripts spécifiques à la page coach-running
   Accordion · Parallax quote · Marquee · Gallery · Carousel
   ============================================================ */

function toggleMoment(btn) {
  var item = btn.closest('.moment-item');
  var wasOpen = item.classList.contains('open');
  document.querySelectorAll('.moment-item').forEach(function (el) {
    el.classList.remove('open');
  });
  if (!wasOpen) item.classList.add('open');
}

document.addEventListener('DOMContentLoaded', function () {

    /* Scroll fade-in — .coach-intro__grid */
    var grids = document.querySelectorAll('.coach-intro__grid');
    if (grids.length && 'IntersectionObserver' in window) {
      var gridObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            gridObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      grids.forEach(function (el) { gridObserver.observe(el); });
    } else {
      /* Fallback : tout afficher si IntersectionObserver absent */
      grids.forEach(function (el) { el.classList.add('is-visible'); });
    }


    /* Parallax quote */
    var quoteParallaxBg = document.getElementById('quoteParallaxBg');
    if (quoteParallaxBg) {
      var quoteImg = quoteParallaxBg.querySelector('img');
      var quoteTicking = false;
      function updateQuoteParallax() {
        var section = quoteParallaxBg.parentElement;
        var rect = section.getBoundingClientRect();
        var viewH = window.innerHeight;
        if (rect.bottom > 0 && rect.top < viewH) {
          var progress = 1 - (rect.bottom / (viewH + rect.height));
          var offset = (progress - 0.5) * rect.height * 0.5;
          quoteImg.style.transform = 'translate3d(0,' + offset + 'px,0)';
        }
        quoteTicking = false;
      }
      window.addEventListener('scroll', function () {
        if (!quoteTicking) {
          requestAnimationFrame(updateQuoteParallax);
          quoteTicking = true;
        }
      }, { passive: true });
      updateQuoteParallax();
    }

    /* Scroll-driven marquees */
    function setupCoachMarquee(trackEl, direction) {
      if (!trackEl) return;
      var original = trackEl.innerHTML;
      trackEl.innerHTML = original + original + original;
      return function () {
        var rect = trackEl.parentElement.getBoundingClientRect();
        var viewH = window.innerHeight;
        if (rect.bottom > 0 && rect.top < viewH) {
          var progress = (viewH - rect.top) / (viewH + rect.height);
          var totalWidth = trackEl.scrollWidth / 3;
          var offset = progress * totalWidth * 0.4;
          if (direction === 'ltr') {
            trackEl.style.transform = 'translate3d(' + (offset - totalWidth * 0.4) + 'px,0,0)';
          } else {
            trackEl.style.transform = 'translate3d(-' + offset + 'px,0,0)';
          }
        }
      };
    }
    var updateRTL = setupCoachMarquee(document.getElementById('coachMarqueeRTL'), 'rtl');
    var updateLTR = setupCoachMarquee(document.getElementById('coachMarqueeLTR'), 'ltr');
    var marqueeTicking = false;
    window.addEventListener('scroll', function () {
      if (!marqueeTicking) {
        requestAnimationFrame(function () {
          if (updateRTL) updateRTL();
          if (updateLTR) updateLTR();
          marqueeTicking = false;
        });
        marqueeTicking = true;
      }
    }, { passive: true });
    if (updateRTL) updateRTL();
    if (updateLTR) updateLTR();

    /* Random gallery images (no duplicates) */
    var allFocusImages = [
      'assets/img/photos/focus_1.jpeg', 'assets/img/photos/focus_2.jpeg',
      'assets/img/photos/focus_3.jpeg', 'assets/img/photos/focus_4.jpeg',
      'assets/img/photos/focus_5.jpeg', 'assets/img/photos/focus_6.jpeg',
      'assets/img/photos/focus_7.jpeg', 'assets/img/photos/focus_8.jpeg',
      'assets/img/photos/focus_9.jpeg', 'assets/img/photos/focus_10.jpeg'
    ];
    var gallerySlots = document.querySelectorAll('#coachGalleryStrip .coach-gallery-strip__item img');
    if (gallerySlots.length) {
      // Shuffle and pick unique images
      var shuffled = allFocusImages.slice().sort(function () { return Math.random() - 0.5; });
      gallerySlots.forEach(function (img, i) {
        img.src = shuffled[i % shuffled.length];
      });
    }

    /* Gallery strip parallax float */
    var galleryItems = document.querySelectorAll('#coachGalleryStrip .coach-gallery-strip__item[data-float-speed]');
    var galleryStripTicking = false;

    function updateGalleryStripFloat() {
      var viewH = window.innerHeight;
      galleryItems.forEach(function (item) {
        var section = item.closest('.coach-gallery-strip');
        if (!section) return;
        var rect = section.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < viewH) {
          var speed = parseFloat(item.dataset.floatSpeed) || 0;
          var progress = (viewH - rect.top) / (viewH + rect.height);
          var offset = (progress - 0.5) * viewH * speed;
          item.style.transform = 'translate3d(0,' + offset + 'px,0)';
        }
      });
      galleryStripTicking = false;
    }

    window.addEventListener('scroll', function () {
      if (!galleryStripTicking) {
        requestAnimationFrame(updateGalleryStripFloat);
        galleryStripTicking = true;
      }
    }, { passive: true });
    updateGalleryStripFloat();

    /* Devices carousel — step-by-step auto-scroll infini */
    (function () {
      var wrapper = document.getElementById('devicesWrapper');
      var track   = document.getElementById('devicesTrack');
      if (!wrapper || !track) return;

      var GAP          = 20;    /* px — doit correspondre au gap CSS (1.25rem ≈ 20px) */
      var STEP_INTERVAL = 2200; /* ms entre chaque avance */
      var TRANSITION    = 520;  /* ms de la transition CSS */

      /* 1. Dupliquer les items pour la boucle infinie */
      var origItems = Array.from(track.children);
      var N = origItems.length;
      origItems.forEach(function (el) {
        track.appendChild(el.cloneNode(true));
      });

      /* 2. Appliquer la transition CSS via JS (pas d'animation CSS) */
      track.style.transition = 'transform ' + TRANSITION + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
      track.style.display    = 'flex';

      var currentStep = 0;
      var isTransitioning = false;

      function getItemWidth() {
        var item = track.children[0];
        return item ? item.offsetWidth + GAP : 148 + GAP;
      }

      function stepForward() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentStep++;

        var offset = currentStep * getItemWidth();
        track.style.transform = 'translateX(-' + offset + 'px)';

        /* Quand on atteint la copie (step N), on reset silencieusement */
        setTimeout(function () {
          if (currentStep >= N) {
            track.style.transition = 'none';
            currentStep = 0;
            track.style.transform = 'translateX(0)';
            /* Forcer reflow avant de réactiver la transition */
            void track.offsetWidth;
            track.style.transition = 'transform ' + TRANSITION + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
          }
          isTransitioning = false;
        }, TRANSITION + 20);
      }

      /* 3. Lancer l'autoplay */
      var autoplay = setInterval(stepForward, STEP_INTERVAL);

      /* 4. Pause au survol */
      wrapper.addEventListener('mouseenter', function () { clearInterval(autoplay); });
      wrapper.addEventListener('mouseleave', function () {
        autoplay = setInterval(stepForward, STEP_INTERVAL);
      });
    })();

});