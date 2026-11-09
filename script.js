/* ==========================================================
   Chris Favour | Book Marketing
   script.js
   ========================================================== */
(function () {
  'use strict';

  var doc = document;
  var win = window;
  var body = doc.body;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  var reduceMotion = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  $all('.year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Scroll progress bar & back-to-top button ---------- */
  var progress = doc.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  body.appendChild(progress);

  var backTop = doc.createElement('button');
  backTop.type = 'button';
  backTop.className = 'back-top';
  backTop.setAttribute('aria-label', 'Back to top');
  backTop.innerHTML = '&uarr;';
  body.appendChild(backTop);
  backTop.addEventListener('click', function () {
    win.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Header, progress, parallax, active nav ---------- */
  var header = $('.site-header');
  var parallaxEls = $all('[data-parallax]');
  var navLinks = $all('#site-nav a[href^="#"]').filter(function (a) {
    return !a.classList.contains('nav-cta');
  });
  var navSections = navLinks.map(function (a) {
    var id = a.getAttribute('href').slice(1);
    return { link: a, section: id ? doc.getElementById(id) : null };
  }).filter(function (o) { return o.section; });

  function updateParallax() {
    if (reduceMotion) return;
    var vh = win.innerHeight;
    parallaxEls.forEach(function (el) {
      var bg = $('.parallax-bg', el);
      if (!bg) return;
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      var speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
      var offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      bg.style.transform = 'translate3d(0,' + (-offset).toFixed(1) + 'px,0)';
    });
  }

  function updateActiveNav() {
    if (!navSections.length) return;
    var line = (header ? header.offsetHeight : 72) + 120;
    var current = null;
    navSections.forEach(function (o) {
      if (o.section.getBoundingClientRect().top <= line) current = o;
    });
    var atBottom = (win.innerHeight + win.pageYOffset) >= (doc.documentElement.scrollHeight - 4);
    if (atBottom) {
      var contact = navSections.filter(function (o) { return o.section.id === 'contact'; })[0];
      if (contact) current = contact;
    }
    navSections.forEach(function (o) {
      if (o === current) o.link.setAttribute('aria-current', 'true');
      else o.link.removeAttribute('aria-current');
    });
  }

  var ticking = false;
  function onScroll() {
    var y = win.pageYOffset || doc.documentElement.scrollTop;
    var max = doc.documentElement.scrollHeight - win.innerHeight;

    if (header) header.classList.toggle('scrolled', y > 10);
    progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    backTop.classList.toggle('show', y > 600);

    updateParallax();
    updateActiveNav();
    ticking = false;
  }
  function requestTick() {
    if (!ticking) {
      ticking = true;
      win.requestAnimationFrame(onScroll);
    }
  }
  win.addEventListener('scroll', requestTick, { passive: true });
  win.addEventListener('resize', requestTick);
  win.addEventListener('load', onScroll);
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = $('.menu-toggle');
  var nav = $('#site-nav');
  var overlay = $('.nav-overlay');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('show', open);
    body.classList.toggle('menu-open', open);
  }
  function isMenuOpen() {
    return toggle && toggle.getAttribute('aria-expanded') === 'true';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!isMenuOpen()); });
    if (overlay) overlay.addEventListener('click', function () { setMenu(false); });
    $all('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && isMenuOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });
    win.addEventListener('resize', function () {
      if (win.innerWidth > 980 && isMenuOpen()) setMenu(false);
    });
  }

  /* ---------- Scroll reveal & stagger ---------- */
  var revealTargets = $all('.reveal, .stagger');
  if ('IntersectionObserver' in win) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Image fallback (green placeholder if image is missing) ---------- */
  $all('img[data-fallback]').forEach(function (img) {
    function markMissing() {
      img.classList.add('img-missing');
      var frame = img.closest('.book-frame');
      if (frame) frame.classList.add('img-missing');
    }
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
  });

  /* ---------- Portfolio filters ---------- */
  var filterButtons = $all('.filter');
  var projects = $all('.project');

  filterButtons.forEach(function (btn) {
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterButtons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      projects.forEach(function (p) {
        var cats = (p.getAttribute('data-cat') || '').split(/\s+/);
        var show = f === 'all' || cats.indexOf(f) !== -1;
        p.hidden = !show;
        if (show) {
          p.style.animation = 'none';
          void p.offsetWidth;
          p.style.animation = '';
        }
      });
    });
  });

  /* ---------- FAQ accordion, search, filters ---------- */
  var faqItems = $all('.qa-item');
  var faqGroups = $all('.qa-group');
  var faqFilters = $all('.qa-filter');
  var faqSearch = $('#faq-search');
  var faqCount = $('#qa-count');
  var faqEmpty = $('#qa-empty');
  var faqReset = $('#qa-reset');
  var expandAll = $('#expand-all');
  var collapseAll = $('#collapse-all');
  var activeCat = 'all';

  function setOpen(item, open) {
    var btn = $('.qa-q', item);
    if (!btn) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    item.classList.toggle('open', open);
  }

  faqItems.forEach(function (item) {
    var btn = $('.qa-q', item);
    if (!btn) return;
    btn.addEventListener('click', function () {
      setOpen(item, btn.getAttribute('aria-expanded') !== 'true');
    });
  });

  function visibleQuestions() {
    return faqItems.filter(function (item) { return !item.hidden; })
      .map(function (item) { return $('.qa-q', item); })
      .filter(Boolean);
  }

  function applyFaq() {
    var query = faqSearch ? faqSearch.value.toLowerCase().trim() : '';
    var terms = query ? query.split(/\s+/) : [];
    var shown = 0;

    faqItems.forEach(function (item) {
      var group = item.closest('.qa-group');
      var cat = group ? group.getAttribute('data-cat') : '';
      var catOk = activeCat === 'all' || cat === activeCat;
      var text = item.textContent.toLowerCase();
      var textOk = terms.every(function (t) { return text.indexOf(t) !== -1; });
      var show = catOk && textOk;
      item.hidden = !show;
      if (show) shown++;
    });

    faqGroups.forEach(function (group) {
      var any = $all('.qa-item', group).some(function (i) { return !i.hidden; });
      group.hidden = !any;
    });

    if (faqCount) {
      faqCount.textContent = shown === 0
        ? 'No questions found'
        : 'Showing ' + shown + (shown === 1 ? ' question' : ' questions');
    }
    if (faqEmpty) faqEmpty.hidden = shown !== 0;
  }

  faqFilters.forEach(function (btn) {
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    btn.addEventListener('click', function () {
      activeCat = btn.getAttribute('data-filter') || 'all';
      faqFilters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyFaq();
    });
  });

  if (faqSearch) {
    faqSearch.addEventListener('input', applyFaq);
    faqSearch.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        faqSearch.value = '';
        applyFaq();
      }
    });
  }

  if (faqReset) {
    faqReset.addEventListener('click', function () {
      if (faqSearch) faqSearch.value = '';
      activeCat = 'all';
      faqFilters.forEach(function (b) {
        var on = b.getAttribute('data-filter') === 'all';
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyFaq();
      if (faqSearch) faqSearch.focus();
    });
  }

  if (expandAll) {
    expandAll.addEventListener('click', function () {
      faqItems.forEach(function (item) { if (!item.hidden) setOpen(item, true); });
    });
  }
  if (collapseAll) {
    collapseAll.addEventListener('click', function () {
      faqItems.forEach(function (item) { setOpen(item, false); });
    });
  }

  /* Keyboard navigation between questions */
  doc.addEventListener('keydown', function (e) {
    var target = e.target;
    if (!target || !target.classList || !target.classList.contains('qa-q')) return;
    var list = visibleQuestions();
    var i = list.indexOf(target);
    if (i === -1) return;
    var next = null;
    if (e.key === 'ArrowDown') next = list[(i + 1) % list.length];
    else if (e.key === 'ArrowUp') next = list[(i - 1 + list.length) % list.length];
    else if (e.key === 'Home') next = list[0];
    else if (e.key === 'End') next = list[list.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  });

  applyFaq();

  /* ---------- Contact form (Formspree) ---------- */
  var form = $('#contact-form');
  var statusBox = $('#form-status');

  function showStatus(message, isError) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.classList.toggle('error', !!isError);
  }

  if (form && win.fetch && win.FormData) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = $('button[type="submit"]', form);
      var originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      showStatus('', false);

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          form.reset();
          showStatus('Thank you! Your enquiry has been sent. I will reply by email within 1\u20132 business days.', false);
        } else {
          throw new Error('Request failed');
        }
      }).catch(function () {
        showStatus('Sorry, something went wrong and your message was not sent. Please try again, or email me directly at hello@yourdomain.com.', true);
      }).then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    });
  }
})();