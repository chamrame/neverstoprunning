/* ============================================================
   INDEX.JS — Scripts spécifiques à la page d'accueil
   Hero carousel · Stats counter · Parallax · Marquee · Sliders
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {


    (function () {
      'use strict';

      /* ---- Random hero image ---- */
      var heroImages = [
        'https://images.unsplash.com/photo-1744706908540-c7450689a30a?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1516398810565-0cb4310bb8ea?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        'https://images.unsplash.com/photo-1699134710640-c2b282ba8e11?q=80&w=1932&auto=format&fit=crop'
      ];
      var heroImg = document.getElementById('heroImg');
      if (heroImg) {
        heroImg.src = heroImages[Math.floor(Math.random() * heroImages.length)];
      }



      /* ---- Testimonials carousel (infinite + autoplay) ---- */
      const track = document.getElementById('testimonialTrack');
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const realCards = track.querySelectorAll('.testimonial-card');
      const totalReal = realCards.length; // 5
      var autoplayInterval;

      // Clone cards at the end AND start for seamless infinite loop
      function setupInfiniteTrack() {
        // Clone all cards to the end
        realCards.forEach(function (card) {
          track.appendChild(card.cloneNode(true));
        });
        // Clone all cards to the start
        for (var i = totalReal - 1; i >= 0; i--) {
          track.insertBefore(realCards[i].cloneNode(true), track.firstChild);
        }
      }
      setupInfiniteTrack();

      var allCards = track.querySelectorAll('.testimonial-card');
      // Start at the first "real" card (after the prepended clones)
      var currentIndex = totalReal;

      function getGap() {
        return parseFloat(window.getComputedStyle(track).gap) || 32;
      }

      function getCardWidth() {
        return allCards[0].offsetWidth + getGap();
      }

      function jumpTo(index, animate) {
        if (!animate) {
          track.style.transition = 'none';
        } else {
          track.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        currentIndex = index;
        track.style.transform = 'translateX(-' + (getCardWidth() * currentIndex) + 'px)';
      }

      // After transition ends, silently reset position if we're in clone territory
      track.addEventListener('transitionend', function () {
        if (currentIndex >= totalReal * 2) {
          jumpTo(currentIndex - totalReal, false);
        } else if (currentIndex < totalReal) {
          jumpTo(currentIndex + totalReal, false);
        }
      });

      function slideNext() {
        jumpTo(currentIndex + 1, true);
      }

      function slidePrev() {
        jumpTo(currentIndex - 1, true);
      }

      // Initial position (no animation)
      jumpTo(totalReal, false);

      // Buttons
      nextBtn.addEventListener('click', function () {
        slideNext();
        resetAutoplay();
      });
      prevBtn.addEventListener('click', function () {
        slidePrev();
        resetAutoplay();
      });

      // Touch swipe
      var startX = 0;
      var isDragging = false;

      track.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        isDragging = true;
      }, { passive: true });

      track.addEventListener('touchend', function (e) {
        if (!isDragging) return;
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? slideNext() : slidePrev();
          resetAutoplay();
        }
        isDragging = false;
      }, { passive: true });

      // Autoplay
      function startAutoplay() {
        autoplayInterval = setInterval(slideNext, 4000);
      }
      function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
      }
      startAutoplay();

      // Pause on hover
      track.closest('.testimonials').addEventListener('mouseenter', function () {
        clearInterval(autoplayInterval);
      });
      track.closest('.testimonials').addEventListener('mouseleave', function () {
        startAutoplay();
      });

      // Recalc on resize
      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          jumpTo(currentIndex, false);
        }, 250);
      });

      /* ---- Stats counter with slot-machine deceleration ---- */
      var statsNumbers = document.querySelectorAll('.stats__number[data-target]');
      var statsTriggered = false;
      var counterDuration = 1800;

      function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
      }

      function animateCounter(el) {
        var target = parseInt(el.dataset.target);
        var suffix = el.dataset.suffix || '';
        var delay = parseInt(el.dataset.delay) || 0;

        setTimeout(function () {
          el.classList.add('counted');

          var startTime = null;
          var maxRandom = Math.max(target * 1.5, 20);

          function tick(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / counterDuration, 1);

            if (progress < 0.6) {
              // Spinning phase: random numbers, heavy blur
              var spinProgress = progress / 0.6;
              var randomVal = Math.round(Math.random() * maxRandom);
              el.textContent = randomVal + suffix;
              el.style.filter = 'blur(' + (8 * (1 - spinProgress * 0.5)) + 'px)';
            } else {
              // Deceleration phase: converge smoothly to target
              var decelProgress = (progress - 0.6) / 0.4;
              var decelEased = easeOutQuart(decelProgress);
              var currentVal = Math.round(target * decelEased);
              // Decreasing jitter
              var jitterRange = Math.round((1 - decelEased) * Math.max(target * 0.15, 2));
              var jitter = jitterRange > 0 ? Math.round((Math.random() - 0.5) * jitterRange) : 0;
              var display = Math.max(0, currentVal + jitter);
              el.textContent = display + suffix;
              el.style.filter = 'blur(' + (4 * (1 - decelEased)) + 'px)';
            }

            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              el.textContent = target + suffix;
              el.style.filter = 'blur(0px)';
            }
          }

          requestAnimationFrame(tick);
        }, delay);
      }

      var statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !statsTriggered) {
            statsTriggered = true;
            statsNumbers.forEach(function (el) {
              animateCounter(el);
            });
            statsObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });

      var statsSection = document.querySelector('.stats');
      if (statsSection) statsObserver.observe(statsSection);

      /* ---- Process banner parallax ---- */
      var processBannerBg = document.getElementById('processBannerBg');
      if (processBannerBg) {
        var processBannerImg = processBannerBg.querySelector('img');
        var processBannerTicking = false;

        function updateProcessParallax() {
          var section = processBannerBg.parentElement;
          var rect = section.getBoundingClientRect();
          var viewH = window.innerHeight;
          if (rect.bottom > 0 && rect.top < viewH) {
            var progress = 1 - (rect.bottom / (viewH + rect.height));
            var offset = (progress - 0.5) * rect.height * 0.5;
            processBannerImg.style.transform = 'translate3d(0,' + offset + 'px,0)';
          }
          processBannerTicking = false;
        }

        window.addEventListener('scroll', function () {
          if (!processBannerTicking) {
            requestAnimationFrame(updateProcessParallax);
            processBannerTicking = true;
          }
        }, { passive: true });
        updateProcessParallax();
      }

      /* ---- Process steps: sequential zoom on scroll ---- */
      var processCards = document.querySelectorAll('.process-card');
      if (processCards.length) {
        var processObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              processCards.forEach(function (card, i) {
                setTimeout(function () {
                  card.classList.add('active-step');
                }, i * 400);
              });
              processObserver.disconnect();
            }
          });
        }, { threshold: 0.3 });
        var processGrid = document.getElementById('processGrid');
        if (processGrid) processObserver.observe(processGrid);
      }

      /* ---- Split floating images parallax ---- */
      var splitFloats = document.querySelectorAll('.split__float[data-float-speed]');
      var splitTicking = false;

      function updateSplitFloats() {
        var scrollY = window.scrollY;
        var viewH = window.innerHeight;
        splitFloats.forEach(function (el) {
          var section = el.closest('.split');
          if (!section) return;
          var rect = section.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < viewH) {
            var speed = parseFloat(el.dataset.floatSpeed) || 0;
            var progress = (viewH - rect.top) / (viewH + rect.height);
            var offset = (progress - 0.5) * viewH * speed;
            el.style.transform = 'translate3d(0,' + offset + 'px,0)';
          }
        });
        splitTicking = false;
      }

      window.addEventListener('scroll', function () {
        if (!splitTicking) {
          requestAnimationFrame(updateSplitFloats);
          splitTicking = true;
        }
      }, { passive: true });
      updateSplitFloats();

      /* ---- Coach gallery: floating parallax columns ---- */
      var galleryCols = document.querySelectorAll('.coach-gallery__col');
      var galleryTicking = false;

      function updateGalleryFloat() {
        var scrollY = window.scrollY;
        galleryCols.forEach(function (col) {
          var section = col.closest('.coach-gallery');
          if (!section) return;
          var rect = section.getBoundingClientRect();
          var viewH = window.innerHeight;
          if (rect.bottom > 0 && rect.top < viewH) {
            var speed = parseFloat(col.dataset.speed) || 0;
            var progress = (viewH - rect.top) / (viewH + rect.height);
            var offset = (progress - 0.5) * viewH * speed;
            col.style.transform = 'translate3d(0,' + offset + 'px,0)';
          }
        });
        galleryTicking = false;
      }

      window.addEventListener('scroll', function () {
        if (!galleryTicking) {
          requestAnimationFrame(updateGalleryFloat);
          galleryTicking = true;
        }
      }, { passive: true });
      updateGalleryFloat();

      /* ---- Coach gallery: image crossfade per slot ---- */
      var gallerySlots = document.querySelectorAll('.coach-gallery__slot');
      gallerySlots.forEach(function (slot) {
        var imgs = slot.querySelectorAll('img');
        if (imgs.length < 2) return;
        var current = 0;
        var interval = parseInt(slot.dataset.interval) || 4000;

        setInterval(function () {
          imgs[current].classList.remove('active');
          current = (current + 1) % imgs.length;
          imgs[current].classList.add('active');
        }, interval);
      });

      /* ---- Grid line inner parallax ---- */
      var gridInners = document.querySelectorAll('.hero__gridline-inner');
      var gridTicking = false;

      function updateGridInners() {
        var scrollY = window.scrollY;
        gridInners.forEach(function (inner) {
          var section = inner.closest('section');
          if (!section) return;
          var rect = section.getBoundingClientRect();
          var viewH = window.innerHeight;
          if (rect.bottom > 0 && rect.top < viewH) {
            var speed = parseFloat(inner.dataset.speed) || 0.4;
            var offset = parseFloat(inner.dataset.offset) || 0;
            var sectionTop = scrollY + rect.top;
            var progress = (scrollY - sectionTop + viewH) / (viewH + rect.height);
            var travel = rect.height * 1.2;
            var y = (progress * travel * speed) + (offset / 100 * rect.height) - 40;
            inner.style.transform = 'translate3d(0,' + y + 'px,0)';
          }
        });
        gridTicking = false;
      }

      window.addEventListener('scroll', function () {
        if (!gridTicking) {
          requestAnimationFrame(updateGridInners);
          gridTicking = true;
        }
      }, { passive: true });
      updateGridInners();

      /* ---- Scroll-driven marquees (both directions) ---- */
      function setupMarquee(trackEl, direction) {
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
            if (direction === 'right') {
              trackEl.style.transform = 'translate3d(' + (offset - totalWidth * 0.4) + 'px, 0, 0)';
            } else {
              trackEl.style.transform = 'translate3d(-' + offset + 'px, 0, 0)';
            }
          }
        };
      }

      var updateMarqueeLeft = setupMarquee(document.getElementById('marqueeTrack'), 'left');
      var updateMarqueeRight = setupMarquee(document.getElementById('marqueeTrackReverse'), 'right');

      var marqueeTickingScroll = false;
      window.addEventListener('scroll', function () {
        if (!marqueeTickingScroll) {
          requestAnimationFrame(function () {
            if (updateMarqueeLeft) updateMarqueeLeft();
            if (updateMarqueeRight) updateMarqueeRight();
            marqueeTickingScroll = false;
          });
          marqueeTickingScroll = true;
        }
      }, { passive: true });
      if (updateMarqueeLeft) updateMarqueeLeft();
      if (updateMarqueeRight) updateMarqueeRight();

      /* ---- Coach gallery fade-in on scroll ---- */
      var gallerySlotEls = document.querySelectorAll('.coach-gallery__slot');
      var galleryObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            galleryObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
      gallerySlotEls.forEach(function (slot) { galleryObserver.observe(slot); });

      /* ---- Parallax effect ---- */
      const parallaxBg = document.getElementById('parallaxBg');
      if (parallaxBg) {
        const img = parallaxBg.querySelector('img');
        let ticking = false;

        function updateParallax() {
          const section = parallaxBg.parentElement;
          const rect = section.getBoundingClientRect();
          const viewH = window.innerHeight;

          if (rect.bottom > 0 && rect.top < viewH) {
            // 0 when section enters bottom, 1 when it leaves top
            const progress = 1 - (rect.bottom / (viewH + rect.height));
            // Shift image from -25% to +25% of section height
            const offset = (progress - 0.5) * rect.height * 0.5;
            img.style.transform = 'translate3d(0,' + offset + 'px,0)';
          }
          ticking = false;
        }

        window.addEventListener('scroll', function () {
          if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
          }
        }, { passive: true });

        updateParallax();
      }

    })();
  
});