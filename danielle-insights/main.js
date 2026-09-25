/* ============================================================
   Danielle Insights - Shared Application Logic
   - Scroll fade-up (unified animation)
   - Card touch/tint for mobile (Req 3)
   - Accessible hamburger overlay menu (Req 4)
   - Counter animation on the About page
   ============================================================ */
(function () {
    'use strict';

    /* ---- Scroll fade-up ---- */
    (function () {
        var els = document.querySelectorAll('.fade-up');
        if (!els.length) return;
        if (!('IntersectionObserver' in window)) {
            els.forEach(function (el) { el.classList.add('visible'); });
            return;
        }
        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach(function (el) { io.observe(el); });
    })();

    /* ---- Req 3: card touch tint (mirrors :hover) on mobile ---- */
    (function () {
        var cards = document.querySelectorAll('.card');
        if (!cards.length) return;
        cards.forEach(function (card) {
            card.addEventListener('touchstart', function () { card.classList.add('touched'); }, { passive: true });
            card.addEventListener('touchend', function () { card.classList.remove('touched'); });
            card.addEventListener('touchmove', function () { card.classList.remove('touched'); }, { passive: true });
        });
    })();

    /* ---- Req 4: accessible hamburger overlay menu ---- */
    (function () {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.getElementById('mobile-menu');
        if (!toggle || !menu) return;

        var links = menu.querySelectorAll('a');

        function openMenu() {
            menu.classList.add('active');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            menu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            // Move focus into the menu for keyboard users (after stagger animation starts)
            setTimeout(function () { if (links[0]) links[0].focus(); }, 80);
        }
        function closeMenu() {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            menu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
        function toggleMenu() {
            if (menu.classList.contains('active')) { closeMenu(); } else { openMenu(); }
        }

        // Morphing hamburger button toggles the menu
        toggle.addEventListener('click', toggleMenu);
        toggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
        });

        // ESC to close + basic focus trap (Tab cycles within menu links)
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                closeMenu();
                toggle.focus();
            } else if (e.key === 'Tab' && menu.classList.contains('active')) {
                var first = links[0], last = links[links.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        });

        // Close the menu when a link is chosen
        links.forEach(function (link) { link.addEventListener('click', closeMenu); });
    })();

    /* ---- Counter animation (only on pages that have counters, e.g. About) ---- */
    (function () {
        function animateCounter(counter) {
            var target = parseInt(counter.getAttribute('data-target'), 10);
            if (isNaN(target)) return;
            var duration = 1500, start = 0, startTime = null;
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                counter.textContent = Math.floor(progress * target) + (target >= 10 ? '+' : '');
                if (progress < 1) { requestAnimationFrame(step); }
                else { counter.textContent = target + (target >= 10 ? '+' : ''); }
            }
            requestAnimationFrame(step);
        }
        function initCounters() {
            var counters = document.querySelectorAll('.counter');
            if (!counters.length) return;
            if (!('IntersectionObserver' in window)) {
                counters.forEach(animateCounter); return;
            }
            var observer = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
                });
            }, { threshold: 0.3 });
            counters.forEach(function (c) { observer.observe(c); });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCounters);
        } else { initCounters(); }
    })();
})();