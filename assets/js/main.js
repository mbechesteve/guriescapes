/* Guri Escapes — interactions */
(function () {
  'use strict';
  var header = document.getElementById('header');
  var body = document.body;

  /* Body scroll lock (shared by menu + lightbox) */
  var locks = 0;
  function lock() { if (locks++ === 0) body.style.overflow = 'hidden'; }
  function unlock() { if (locks > 0 && --locks === 0) body.style.overflow = ''; }

  /* Sticky header state */
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    var menuOpen = false;
    var navAnchors = links.querySelectorAll('a'); // capture before injecting the footer

    // email + socials pinned to the bottom of the full-screen menu
    var foot = document.createElement('div');
    foot.className = 'menu-foot';
    foot.innerHTML =
      '<div class="rule"></div>' +
      '<a class="mail" href="mailto:hello@guriescapes.com">hello@guriescapes.com</a>' +
      '<div class="socials">' +
        '<a href="https://instagram.com/guriescapes" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
        '<a href="https://facebook.com/guriescapes" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 8h-2a2 2 0 0 0-2 2v12M8 13h6"/></svg></a>' +
      '</div>';
    links.appendChild(foot);

    function setMenu(open) {
      menuOpen = open;
      links.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) lock(); else unlock();
    }
    toggle.addEventListener('click', function () { setMenu(!menuOpen); });
    navAnchors.forEach(function (a) {
      a.addEventListener('click', function () { if (menuOpen) setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) setMenu(false);
    });
  }

  /* Scroll reveal */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealItems = document.querySelectorAll('.reveal:not(.in)');
  if (reduce || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq');
      var ans = item.querySelector('.ans');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      ans.style.maxHeight = open ? ans.scrollHeight + 'px' : null;
    });
  });

  /* ---------------- Lightbox gallery ---------------- */
  var galleryLinks = Array.prototype.slice.call(document.querySelectorAll('.gallery a'));
  if (galleryLinks.length) {
    var items = galleryLinks.map(function (a) {
      var img = a.querySelector('img');
      return { src: a.getAttribute('href'), alt: img ? img.alt : '' };
    });

    // zoom cue on each thumbnail
    galleryLinks.forEach(function (a) {
      var z = document.createElement('span');
      z.className = 'zoom';
      z.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M11 8v6M8 11h6"/></svg>';
      a.appendChild(z);
    });

    // build overlay
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Close (back)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous image"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="lb-btn lb-next" aria-label="Next image"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
      '<div class="lb-bar"><span class="lb-count"></span><button class="lb-back">&larr; Back to gallery</button></div>';
    body.appendChild(lb);

    var lbImg = lb.querySelector('.lb-img');
    var lbCount = lb.querySelector('.lb-count');
    var current = 0;
    var isOpen = false;

    function show(i) {
      current = (i + items.length) % items.length;
      lbImg.src = items[current].src;
      lbImg.alt = items[current].alt;
      lbCount.textContent = (current + 1) + ' / ' + items.length;
    }
    function open(i) {
      show(i);
      lb.classList.add('open');
      isOpen = true;
      lock();
      lb.querySelector('.lb-close').focus();
      // history entry so the browser/phone Back button closes the viewer
      history.pushState({ guriLightbox: true }, '');
    }
    function close(fromPop) {
      if (!isOpen) return;
      lb.classList.remove('open');
      isOpen = false;
      unlock();
      if (!fromPop && history.state && history.state.guriLightbox) history.back();
    }

    galleryLinks.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', function () { close(); });
    lb.querySelector('.lb-back').addEventListener('click', function () { close(); });
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });

    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'ArrowLeft') show(current - 1);
    });

    // Back button / gesture closes the lightbox instead of leaving the page
    window.addEventListener('popstate', function () { if (isOpen) close(true); });

    // Swipe on touch
    var tx = 0, ty = 0;
    lb.addEventListener('touchstart', function (e) {
      tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      var dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
      else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) close(); // swipe down to dismiss
    }, { passive: true });
  }

  /* Enquiry form (front-end demo handler) */
  window.guriSubmit = function (e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('button[type=submit]');
    if (btn.dataset.busy) return false;
    btn.dataset.busy = '1';
    var original = btn.innerHTML;
    btn.textContent = 'Thank you — we’ll be in touch ✓';
    btn.style.background = 'var(--gold)';
    btn.disabled = true;
    form.reset(); // clear all fields after sending
    setTimeout(function () {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.disabled = false;
      delete btn.dataset.busy;
    }, 3500);
    return false;
  };
})();
