(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Favicon (uses the same logo file) ---------- */
  (function setFavicon() {
    var href = 'images/Chris%20logo.png';
    $$('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(function (l) {
      l.parentNode.removeChild(l);
    });
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'chris-logo.png.jpeg';
    icon.href = href;
    document.head.appendChild(icon);

    var apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = href;
    document.head.appendChild(apple);
  })();

  /* ---------- Footer year ---------- */
  $$('.year').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---------- Scroll progress bar and back-to-top ---------- */
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  var backTop = document.createElement('button');
  backTop.type = 'button';
  backTop.className = 'back-top';
  backTop.setAttribute('aria-label', 'Back to top');
  backTop.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(backTop);
  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Scroll handler ---------- */
  var header = $('.site-header');
  var parallaxEls = $$('[data-parallax]');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (header) header.classList.toggle('scrolled', y > 10);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    backTop.classList.toggle('show', y > 600);

    if (!reduceMotion) {
      parallaxEls.forEach(function (el) {
        var parent = el.parentElement;
        var rect = parent.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
        var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed * -1;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    }

    highlightNav();
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Mobile menu ---------- */
  var toggle = $('.menu-toggle');
  var nav = $('#site-nav');
  var overlay = $('.nav-overlay');

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('show', open);
    document.body.classList.toggle('menu-open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });
    if (overlay) overlay.addEventListener('click', function () { setMenu(false); });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) setMenu(false);
    });
  }

  /* ---------- Reveal and stagger ---------- */
  var revealTargets = $$('.reveal, .stagger');
  $$('.stagger').forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (child, i) {
      child.style.setProperty('--i', i);
      child.style.transitionDelay = (i * 80) + 'ms';
      child.style.animationDelay = (i * 80) + 'ms';
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Active nav link ---------- */
  var navIds = ['home', 'about', 'services', 'portfolio', 'faq', 'contact'];
  var navLinks = $$('#site-nav a[href^="#"]');

  function highlightNav() {
    var line = 140;
    var current = navIds[0];
    navIds.forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec && sec.getBoundingClientRect().top <= line) current = id;
    });
    navLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + current && !a.classList.contains('nav-cta')) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  /* ---------- Portfolio filters ---------- */
  var pFilters = $$('#portfolio .filter');
  var projects = $$('#portfolio .project');

  pFilters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter') || 'all';
      pFilters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      projects.forEach(function (p) {
        var cats = (p.getAttribute('data-cat') || '').split(/\s+/);
        var show = f === 'all' || cats.indexOf(f) !== -1;
        p.hidden = !show;
        p.style.display = show ? '' : 'none';
        if (show) {
          p.style.animation = 'none';
          void p.offsetWidth;
          p.style.animation = '';
        }
      });
    });
  });

  /* ---------- FAQ ---------- */
  var faqRoot = $('#faq');
  if (faqRoot) {
    var items = $$('.qa-item', faqRoot);
    var groups = $$('.qa-group', faqRoot);
    var search = $('#faq-search');
    var catBtns = $$('.qa-filter', faqRoot);
    var countEl = $('#qa-count');
    var emptyEl = $('#qa-empty');
    var resetBtn = $('#qa-reset');
    var expandAll = $('#expand-all');
    var collapseAll = $('#collapse-all');
    var activeCat = 'all';

    items.forEach(function (item, i) {
      var btn = $('button', item);
      if (!btn) return;
      var panel = btn.nextElementSibling;
      var qid = 'qa-q-' + (i + 1);
      var aid = 'qa-a-' + (i + 1);
      btn.id = btn.id || qid;
      btn.setAttribute('aria-controls', aid);
      btn.setAttribute('aria-expanded', 'false');
      if (panel) {
        panel.id = aid;
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', btn.id);
      }
      btn.addEventListener('click', function () {
        setItem(item, !isOpen(item));
      });
    });

    function isOpen(item) {
      var b = $('button', item);
      return b && b.getAttribute('aria-expanded') === 'true';
    }

    function setItem(item, open) {
      var b = $('button', item);
      if (!b) return;
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      item.classList.toggle('open', open);
      item.classList.toggle('is-open', open);
    }

    function itemCats(item) {
      var g = item.closest('.qa-group');
      var list = [];
      [item, g].forEach(function (el) {
        if (!el) return;
        ['cat', 'group', 'category'].forEach(function (k) {
          if (el.dataset && el.dataset[k]) list.push(el.dataset[k]);
        });
      });
      if (g && g.id) list.push(g.id.replace(/^faq-/, ''));
      return list;
    }

    function applyFaq() {
      var term = search ? search.value.trim().toLowerCase() : '';
      var visible = 0;

      items.forEach(function (item) {
        var matchCat = activeCat === 'all' || itemCats(item).indexOf(activeCat) !== -1;
        var matchText = !term || item.textContent.toLowerCase().indexOf(term) !== -1;
        var show = matchCat && matchText;
        item.hidden = !show;
        item.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      groups.forEach(function (g) {
        var any = $$('.qa-item', g).some(function (it) { return !it.hidden; });
        g.hidden = !any;
        g.style.display = any ? '' : 'none';
      });

      if (countEl) {
        if (visible === items.length) countEl.textContent = 'Showing all ' + items.length + ' questions';
        else if (visible === 1) countEl.textContent = 'Showing 1 question';
        else countEl.textContent = 'Showing ' + visible + ' questions';
      }
      if (emptyEl) {
        emptyEl.hidden = visible !== 0;
        emptyEl.style.display = visible === 0 ? '' : 'none';
      }
    }

    if (search) search.addEventListener('input', applyFaq);

    catBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        activeCat = b.getAttribute('data-filter') || 'all';
        catBtns.forEach(function (x) {
          var on = x === b;
          x.classList.toggle('active', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyFaq();
      });
    });

    function resetFaq() {
      if (search) search.value = '';
      activeCat = 'all';
      catBtns.forEach(function (x) {
        var on = (x.getAttribute('data-filter') || 'all') === 'all';
        x.classList.toggle('active', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyFaq();
    }
    if (resetBtn) resetBtn.addEventListener('click', resetFaq);

    if (expandAll) expandAll.addEventListener('click', function () {
      items.forEach(function (it) { if (!it.hidden) setItem(it, true); });
    });
    if (collapseAll) collapseAll.addEventListener('click', function () {
      items.forEach(function (it) { setItem(it, false); });
    });

    faqRoot.addEventListener('keydown', function (e) {
      var t = e.target;
      if (!t || t.tagName !== 'BUTTON' || !t.closest('.qa-item')) return;
      var btns = items.filter(function (it) { return !it.hidden; })
        .map(function (it) { return $('button', it); });
      var idx = btns.indexOf(t);
      if (idx === -1) return;
      var next = null;
      if (e.key === 'ArrowDown') next = btns[(idx + 1) % btns.length];
      else if (e.key === 'ArrowUp') next = btns[(idx - 1 + btns.length) % btns.length];
      else if (e.key === 'Home') next = btns[0];
      else if (e.key === 'End') next = btns[btns.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });

    applyFaq();
  }

  /* ---------- Contact form (Formspree) ---------- */
  var form = $('#contact-form');
  var statusEl = $('#form-status');

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.remove('success', 'error');
    if (type) statusEl.classList.add(type);
  }

  function markInvalid(field, bad) {
    if (!field) return;
    field.classList.toggle('invalid', bad);
    if (bad) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }

  if (form) {
    ['name', 'email', 'message', 'book_link'].forEach(function (n) {
      var f = form.elements[n];
      if (f) f.addEventListener('input', function () { markInvalid(f, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var trap = form.elements['_gotcha'];
      if (trap && trap.value) return;

      var name = form.elements['name'];
      var email = form.elements['email'];
      var message = form.elements['message'];
      var link = form.elements['book_link'];
      var bad = false;

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (name && !name.value.trim()) { markInvalid(name, true); bad = true; }
      if (email && !emailOk.test(email.value.trim())) { markInvalid(email, true); bad = true; }
      if (message && !message.value.trim()) { markInvalid(message, true); bad = true; }
      if (link && link.value.trim() && !/^https?:\/\/\S+\.\S+/i.test(link.value.trim())) {
        markInvalid(link, true); bad = true;
      }

      if (bad) {
        setStatus('Please check the highlighted fields and try again.', 'error');
        var first = $('.invalid', form);
        if (first) first.focus();
        return;
      }

      var submit = $('button[type="submit"]', form);
      var originalText = submit ? submit.textContent : '';
      if (submit) { submit.disabled = true; submit.textContent = 'Sending...'; }
      setStatus('Sending your enquiry...', '');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus('Thank you! Your enquiry has been sent. I will reply by email within 1 to 2 business days.', 'success');
        } else {
          throw new Error('Request failed');
        }
      }).catch(function () {
        setStatus('Sorry, something went wrong and your message was not sent. Please try again, or email me directly at chrisfavour.authorservices@gmail.com.', 'error');
      }).then(function () {
        if (submit) { submit.disabled = false; submit.textContent = originalText; }
      });
    });
  }

  onScroll();
})();