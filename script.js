/* ==========================================================================
   NT NEXTIME — Interactions 2026
   Sem dependências externas.
   ========================================================================== */
(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var progress = document.getElementById('scrollProgress');
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll: header + progress ---------- */
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 10);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle('open', open);
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);

    if (open) {
      window.setTimeout(function () {
        var firstLink = mobileMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      }, 80);
    } else if (mobileMenu.contains(document.activeElement)) {
      menuBtn.focus();
    }
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('open'));
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (!mobileMenu.classList.contains('open')) return;

      if (event.key === 'Escape') {
        setMenu(false);
        menuBtn.focus();
        return;
      }

      if (event.key === 'Tab') {
        var focusables = [menuBtn].concat(
          Array.prototype.slice.call(mobileMenu.querySelectorAll('a, button'))
        );
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && mobileMenu.classList.contains('open')) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -28px 0px' });

    var heroItems = [];

    revealItems.forEach(function (el) {
      if (el.closest('.hero')) {
        heroItems.push(el);
      } else {
        revealObserver.observe(el);
      }
    });

    /* Hero entra junto com o primeiro paint (já está no viewport inicial) */
    requestAnimationFrame(function () {
      heroItems.forEach(function (el) { el.classList.add('in'); });
    });
  } else {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-counter]');

  function formatCounter(value, decimals) {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = reduceMotion ? 0 : 1400;
    var start = null;

    if (isNaN(target)) return;

    function frame(now) {
      if (start === null) start = now;
      var t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + formatCounter(target * eased, decimals);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
      counters.forEach(function (el) {
        el.textContent = (el.getAttribute('data-prefix') || '') +
          formatCounter(parseFloat(el.getAttribute('data-counter')),
            parseInt(el.getAttribute('data-decimals') || '0', 10));
      });
    }
  }

  /* ---------- FAQ accordion ---------- */
  var faqButtons = document.querySelectorAll('.faq-question');

  faqButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.faq-item');
      var isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('open');
        var q = other.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var activeLink = navLinks.filter(function (link) {
          return link.getAttribute('href') === '#' + entry.target.id;
        })[0];

        navLinks.forEach(function (link) { link.classList.remove('active'); });
        if (activeLink) activeLink.classList.add('active');
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Current year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
