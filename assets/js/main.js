'use strict';

/* ============================================================
   MAIN.JS — Scripts communs — Nevers Top Running
   Mobile menu · Smooth scroll · Nav active · Scroll reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Mobile menu ---- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    const mobileLinks = mobileMenu.querySelectorAll('a');
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  /* ---- Smooth scroll easeInOut ---- */
  function smoothScrollTo(targetEl, duration) {
    duration = duration || 900;
    const nav = document.getElementById('nav');
    const navHeight = nav ? nav.offsetHeight : 0;
    const startY = window.scrollY;
    const targetY = Math.max(0, targetEl.getBoundingClientRect().top + startY - navHeight);
    const diff = targetY - startY;
    let startTime = null;
    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diff * easeInOut(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  window._smoothScrollTo = smoothScrollTo; // exposer pour usage page-specific

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        smoothScrollTo(target, 900);
        history.replaceState(null, '', '#' + id);
      }
    });
  });

  /* ---- Navbar scroll style + FAB visibility ---- */
  const nav = document.getElementById('nav');
  const fabTop = document.getElementById('fabTop');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
      if (fabTop) fabTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
  }
  if (fabTop) {
    fabTop.addEventListener('click', function () {
      const top = document.getElementById('accueil') || document.body;
      smoothScrollTo(top, 1200);
    });
  }

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  if (sections.length && navLinks.length) {
    function setActiveLink() {
      let current = '';
      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) current = section.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    }
    window.addEventListener('scroll', setActiveLink, { passive: true });
  }

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

});
