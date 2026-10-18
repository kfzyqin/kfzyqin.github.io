/* ===================================================================
 * Spurgeon 1.0.0 - Main JS
 *
 * ------------------------------------------------------------------- */

(function(html) {

    'use strict';


   /* preloader
    * Lifted as soon as the first screen can be shown, not on window load.
    * Load waits for everything on the page -- every hero slide, the third-
    * party visitor counters, all fonts -- none of which the visitor needs in
    * order to start reading.
    * -------------------------------------------------- */
    let revealed = false;
    const revealQueue = [];

    // Run fn when the preloader starts to lift (at once if it already has).
    const whenRevealed = function(fn) {
        if (revealed) fn();
        else revealQueue.push(fn);
    };

    const ssPreloader = function() {

        const preloader = document.querySelector('#preloader');

        const reveal = function() {
            if (revealed) return;
            revealed = true;

            html.classList.add('ss-loaded');

            if (preloader) {
                preloader.addEventListener('transitionend', function afterTransition(e) {
                    if (e.target.matches('#preloader'))  {
                        e.target.style.display = 'none';
                        preloader.removeEventListener(e.type, afterTransition);
                    }
                });
            }

            revealQueue.splice(0).forEach(function(fn) { fn(); });
        };

        if (!preloader) {
            reveal();
            return;
        }

        // On the home page the first hero photo is the first screen, so wait
        // for that one image -- but never longer than 1.5s. Other pages are
        // text and lazy images: lift on the next frame.
        const heroImage = document.querySelector('.hero__entry-image');
        const match = heroImage && /url\((['"]?)(.*?)\1\)/.exec(heroImage.style.backgroundImage);

        if (match) {
            const probe = new Image();
            probe.onload = probe.onerror = reveal;
            probe.src = match[2];
            setTimeout(reveal, 1500);
        } else {
            requestAnimationFrame(reveal);
        }

        window.addEventListener('load', reveal);

    }; // end ssPreloader


   /* mobile menu
    * ---------------------------------------------------- */ 
    const ssMobileMenu = function() {

        const toggleButton = document.querySelector('.s-header__menu-toggle');
        const mainNavWrap = document.querySelector('.s-header__nav-wrap');
        const mainNav = document.querySelector('.s-header__nav');
        const siteBody = document.querySelector('body');

        if (!(toggleButton && mainNavWrap && mainNav)) return;

        const parentMenus = mainNav.querySelectorAll('.has-children');

        // Below 1201px the nav is the full-screen panel and "About" is an
        // accordion header; above it the sub-menu opens on hover/focus and
        // "About" is an ordinary link. The click handling below must only
        // apply in the first case, or the About link never navigates.
        const isMobileMenu = function() {
            return !window.matchMedia('(min-width: 1201px)').matches;
        };

        const setOpen = function(open) {
            toggleButton.classList.toggle('is-clicked', open);
            siteBody.classList.toggle('menu-is-open', open);
            toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            const open = !toggleButton.classList.contains('is-clicked');
            setOpen(open);
            if (typeof scrollLock !== 'undefined') {
                if (open) scrollLock.disablePageScroll(mainNavWrap);
                else scrollLock.enablePageScroll(mainNavWrap);
            }
        });

        // open (or close) submenu items in mobile view menu.
        // close all the other open submenu items.
        mainNav.addEventListener('click', function(e) {

            if (!isMobileMenu()) return;

            const parent = e.target.closest('.has-children');
            if (!parent) return;

            const clickedA = e.target.closest('a');

            // A sub-menu link navigates; the parent link toggles the accordion.
            if (clickedA && !clickedA.parentElement.classList.contains('has-children')) return;
            if (clickedA) e.preventDefault();

            const open = !parent.classList.contains('sub-menu-is-open');
            parentMenus.forEach(function(current) {
                current.classList.remove('sub-menu-is-open');
            });
            if (open) parent.classList.add('sub-menu-is-open');
        });

        window.addEventListener('resize', function() {

            // above 1200px
            if (!isMobileMenu()) {
                if (siteBody.classList.contains('menu-is-open')) setOpen(false);
                if (typeof scrollLock !== 'undefined' && !scrollLock.getScrollState()) scrollLock.enablePageScroll();

                parentMenus.forEach(function(current) {
                    current.classList.remove('sub-menu-is-open');
                });
            }
        });

    }; // end ssMobileMenu


 

 

   /* animate masonry elements if in viewport
    * ------------------------------------------------------ */
    const ssAnimateBricks = function() {

        const animateBlocks = document.querySelectorAll('[data-animate-block]');
        const pageWrap = document.querySelector('.s-pagewrap');
        if (!(pageWrap && animateBlocks)) return;

        // on homepage do animate on scroll
        if (pageWrap.classList.contains('ss-home')) {
            window.addEventListener('scroll', animateOnScroll);
            animateOnScroll();
        }
        // animate on load
        else {
            whenRevealed(function(){
                if (animateBlocks.length) doAnimate(animateBlocks[0]);
            });
        }

        // do animate
        function doAnimate(current) {
            const els = current.querySelectorAll('[data-animate-el]');
            const p = new Promise(function(resolve, reject) {

                els.forEach(function(el, index, array) {
                    // Capped: an uncapped 200ms step left the twelfth
                    // card waiting 2.2s before it even started to move.
                    const dly = Math.min(index, 6) * 70;

                    el.style.setProperty('--transition-delay', dly + 'ms');
                    if (index === array.length -1) resolve();
                });

            });
            
            p.then(function() {
                current.classList.add('ss-animated');
            });
        }

        // animate on scroll 
        function animateOnScroll() {

            let scrollY = window.pageYOffset;

            animateBlocks.forEach(function(current) {

                const viewportHeight = window.innerHeight;
                const triggerTop = (current.offsetTop + (viewportHeight * .1)) - viewportHeight;
                const isAnimated = current.classList.contains('ss-animated');

                if (scrollY > triggerTop && !isAnimated) {
                    doAnimate(current);
                }

            });
        }

    }; // end ssAnimateOnScroll


   /* swiper
    * ------------------------------------------------------ */ 
    const ssSwiper = function() {

        // Only the home page has a slider, and swiper.js is only loaded there.
        if (typeof Swiper === 'undefined' || !document.querySelector('.swiper-container')) return;

        // Only the first slide is on screen at arrival and the slider never
        // advances by itself, so the other slides carry their photo in
        // data-bg and fetch it once the page is showing rather than
        // competing with the first one.
        whenRevealed(function() {
            document.querySelectorAll('.hero__entry-image[data-bg]').forEach(function(el) {
                el.style.backgroundImage = "url('" + el.getAttribute('data-bg') + "')";
                el.removeAttribute('data-bg');
            });
        });

        const mySwiper = new Swiper('.swiper-container', {

            slidesPerView: 1,
            effect: 'fade',
            speed: 1000,
            pagination: {
                el: '.swiper-pagination',
                clickable: true, 
                // Custom bullets lose Swiper's own a11y attributes, so add them back.
                renderBullet: function (index, className) {
                    return '<span class="' + className + '" role="button" tabindex="0" aria-label="Go to slide ' + (index + 1) + '">' + (index + 1) + '</span>';
                }
            }

        });

        // Swiper 6's a11y module activates bullets on Enter only; a
        // role="button" must also answer to Space, without scrolling the page.
        const paginationEl = document.querySelector('.swiper-pagination');
        if (paginationEl) {
            paginationEl.addEventListener('keydown', function(e) {
                if ((e.key === ' ' || e.key === 'Spacebar') && e.target.classList.contains('swiper-pagination-bullet')) {
                    e.preventDefault();
                    e.target.click();
                }
            });
        }

    }; // end ssSwiper


    /* Back to Top
    * ------------------------------------------------------ */
    const ssBackToTop = function() {

        const pxShow = 900;
        const goTopButton = document.querySelector(".ss-go-top");

        if (!goTopButton) return;

        // Show or hide the button
        if (window.scrollY >= pxShow) goTopButton.classList.add("link-is-visible");

        window.addEventListener('scroll', function() {
            if (window.scrollY >= pxShow) {
                if(!goTopButton.classList.contains('link-is-visible')) goTopButton.classList.add("link-is-visible")
            } else {
                goTopButton.classList.remove("link-is-visible")
            }
        });

    }; // end ssBackToTop


   /* smoothscroll
    * ------------------------------------------------------ */
    const ssMoveTo = function(){

        const easeFunctions = {
            easeInQuad: function (t, b, c, d) {
                t /= d;
                return c * t * t + b;
            },
            easeOutQuad: function (t, b, c, d) {
                t /= d;
                return -c * t* (t - 2) + b;
            },
            easeInOutQuad: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            },
            easeInOutCubic: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t*t + b;
                t -= 2;
                return c/2*(t*t*t + 2) + b;
            }
        }

        const triggers = document.querySelectorAll('.smoothscroll');

        // With reduced motion the links fall back to plain anchor jumps.
        if (typeof MoveTo === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const moveTo = new MoveTo({
            tolerance: 0,
            duration: 1200,
            easing: 'easeInOutCubic',
            container: window
        }, easeFunctions);

        triggers.forEach(function(trigger) {
            moveTo.registerTrigger(trigger);
        });

    }; // end ssMoveTo


   /* theme toggle
    * The inline script in each page head has already set <html data-theme>
    * before first paint. This wires up the header button and keeps following
    * the OS for as long as the visitor has not chosen otherwise.
    * ------------------------------------------------------ */
    const ssThemeToggle = function() {

        const KEY = 'theme';
        const button = document.querySelector('.s-header__theme-toggle');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const isChinese = (html.lang || '').toLowerCase().indexOf('zh') === 0;
        let fadeTimer;

        const systemTheme = function() {
            return systemDark.matches ? 'dark' : 'light';
        };

        // localStorage throws in some private modes; the toggle still works
        // for the current page, it just is not remembered.
        const stored = function() {
            try {
                const value = localStorage.getItem(KEY);
                return (value === 'light' || value === 'dark') ? value : null;
            } catch (e) {
                return null;
            }
        };

        const store = function(value) {
            try {
                if (value) localStorage.setItem(KEY, value);
                else localStorage.removeItem(KEY);
            } catch (e) {}
        };

        const apply = function(theme, animate) {
            if (animate && !reducedMotion.matches) {
                html.classList.add('theme-switching');
                clearTimeout(fadeTimer);
                fadeTimer = setTimeout(function() {
                    html.classList.remove('theme-switching');
                }, 300);
            }

            html.setAttribute('data-theme', theme);

            const themeColor = document.querySelector('meta[name="theme-color"]');
            if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#0d1420' : '#00356B');

            if (button) {
                const toDark = theme !== 'dark';
                const label = isChinese
                    ? (toDark ? '切换到深色模式' : '切换到浅色模式')
                    : (toDark ? 'Switch to dark theme' : 'Switch to light theme');
                button.setAttribute('aria-label', label);
                button.setAttribute('title', label);
            }
        };

        apply(html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

        if (button) {
            button.addEventListener('click', function() {
                const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                // Choosing what the OS already asks for is the same as having
                // no preference, so drop the override and go back to following.
                store(next === systemTheme() ? null : next);
                apply(next, true);
            });
        }

        const onSystemChange = function() {
            if (!stored()) apply(systemTheme(), true);
        };

        if (systemDark.addEventListener) systemDark.addEventListener('change', onSystemChange);
        else if (systemDark.addListener) systemDark.addListener(onSystemChange);

        // A switch made in another tab reaches this one too.
        window.addEventListener('storage', function(e) {
            if (e.key === KEY || e.key === null) apply(stored() || systemTheme(), true);
        });

    }; // end ssThemeToggle


   /* cards: open the full text in place, over the grid
    * The card keeps its slot (its height is pinned while open); the inner
    * panel goes absolute and its height is tweened from the card height to
    * the content height, so nothing below it moves.
    * ------------------------------------------------------ */
    const ssCardToggles = function() {

        const cards = Array.prototype.slice.call(document.querySelectorAll('.bricks-wrapper .brick'));
        if (!cards.length) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        let openCard = null;

        const onEnd = function(panel, fn) {
            let done = false;
            const finish = function() {
                if (done) return;
                done = true;
                panel.removeEventListener('transitionend', handler);
                fn();
            };
            const handler = function(e) { if (e.propertyName === 'height') finish(); };
            panel.addEventListener('transitionend', handler);
            setTimeout(finish, reduced.matches ? 0 : 520);
        };

        const open = function(card) {
            const panel = card.querySelector('.entry__panel');
            const btn = card.querySelector('.entry__toggle');
            if (!panel || card.classList.contains('is-open')) return;
            if (openCard && openCard !== card) close(openCard);

            const h0 = card.offsetHeight;
            card.style.height = h0 + 'px';          // keep the grid slot as it is
            card.classList.add('is-open', 'is-expanded');
            panel.style.height = h0 + 'px';
            void panel.offsetHeight;                 // commit the start height
            panel.style.height = panel.scrollHeight + 'px';
            if (btn) btn.setAttribute('aria-expanded', 'true');
            openCard = card;
            onEnd(panel, function() { if (card.classList.contains('is-open')) panel.style.height = 'auto'; });
        };

        const close = function(card) {
            const panel = card.querySelector('.entry__panel');
            const btn = card.querySelector('.entry__toggle');
            if (!panel || !card.classList.contains('is-open')) return;

            panel.style.height = panel.offsetHeight + 'px';
            void panel.offsetHeight;
            panel.style.height = card.offsetHeight + 'px';
            card.classList.remove('is-expanded');
            if (btn) btn.setAttribute('aria-expanded', 'false');
            if (openCard === card) openCard = null;
            onEnd(panel, function() {
                card.classList.remove('is-open');
                panel.style.height = '';
                card.style.height = '';
            });
        };

        cards.forEach(function(card) {
            const btn = card.querySelector('.entry__toggle');
            if (!btn) return;
            btn.addEventListener('click', function() {
                if (card.classList.contains('is-open')) close(card);
                else open(card);
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && openCard) {
                const btn = openCard.querySelector('.entry__toggle');
                close(openCard);
                if (btn) btn.focus();
            }
        });

        document.addEventListener('click', function(e) {
            if (openCard && !openCard.contains(e.target)) close(openCard);
        });

        // Show the chevron only where something is actually clamped.
        const measure = function() {
            cards.forEach(function(card) {
                if (card.classList.contains('is-open')) return;
                // Venue: a tooltip with the full name only where the line was cut.
                const venue = card.querySelector('.entry__meta .byline');
                const venueText = venue && venue.querySelector('.byline__text');
                if (venue && venueText) venue.classList.toggle('is-truncated', venueText.scrollWidth > venueText.clientWidth + 1);
                const btn = card.querySelector('.entry__toggle');
                if (!btn) return;
                // Authors: measure the full list, fall back to the short form if it clips.
                const full = card.querySelector('.entry__authors--full');
                if (full) {
                    card.classList.remove('has-long-authors');
                    if (full.scrollHeight > full.clientHeight + 1) card.classList.add('has-long-authors');
                }
                const clamped = Array.prototype.slice.call(card.querySelectorAll('.entry__title, .entry__authors--full, .entry__excerpt p'));
                btn.hidden = !clamped.some(function(el) { return el.scrollHeight > el.clientHeight + 1; });
            });
        };

        measure();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
        window.addEventListener('load', measure);

        let timer;
        window.addEventListener('resize', function() {
            clearTimeout(timer);
            timer = setTimeout(measure, 150);
        });

    }; // end ssCardToggles


   /* cards: full text of a clipped title or venue, on hover/focus
    * A small surface card rises in above the clipped element. Only wired
    * where js found an ellipsis; the open panel shows everything anyway.
    * ------------------------------------------------------ */
    const ssCardTips = function() {

        const cards = Array.prototype.slice.call(document.querySelectorAll('.bricks-wrapper .brick'));
        if (!cards.length) return;

        cards.forEach(function(card) {
            const header = card.querySelector('.entry__header');
            if (!header) return;

            const tip = document.createElement('div');
            tip.className = 'entry__tip';
            tip.setAttribute('aria-hidden', 'true');
            header.appendChild(tip);

            const title = header.querySelector('.entry__title');
            const venue = header.querySelector('.byline');
            const venueText = venue && venue.querySelector('.byline__text');

            const targets = [];
            if (title) targets.push({
                el: title, cls: 'entry__tip--title',
                text: function() { return title.textContent.replace(/\s+/g, ' ').trim(); },
                clipped: function() { return title.scrollHeight > title.clientHeight + 1; }
            });
            if (venue && venueText) targets.push({
                el: venue, cls: 'entry__tip--venue',
                text: function() { return venue.getAttribute('data-venue') || venueText.textContent.trim(); },
                clipped: function() { return venueText.scrollWidth > venueText.clientWidth + 1; }
            });

            let timer;

            const hide = function() {
                clearTimeout(timer);
                tip.classList.remove('is-visible');
                card.classList.remove('has-tip');
            };

            const show = function(t) {
                if (card.classList.contains('is-open') || !t.clipped()) return;
                tip.textContent = t.text();
                tip.className = 'entry__tip ' + t.cls;
                // Place it just above the element, measured before it is shown.
                tip.style.top = Math.round(t.el.offsetTop - tip.offsetHeight - 8) + 'px';
                card.classList.add('has-tip');
                tip.classList.add('is-visible');
            };

            targets.forEach(function(t) {
                t.el.addEventListener('mouseenter', function() {
                    clearTimeout(timer);
                    timer = setTimeout(function() { show(t); }, 120);
                });
                t.el.addEventListener('mouseleave', hide);
                t.el.addEventListener('focusin', function() { show(t); });
                t.el.addEventListener('focusout', hide);
            });

            card.addEventListener('click', hide);
        });

    }; // end ssCardTips


   /* Initialize
    * ------------------------------------------------------ */
    (function ssInit() {

        // Each module runs on its own: an error in one (a missing library, an
        // unexpected page) must not stop the preloader lifting or the theme
        // toggle working.
        [ssPreloader, ssThemeToggle, ssMobileMenu, ssAnimateBricks, ssCardToggles, ssCardTips, ssSwiper, ssBackToTop, ssMoveTo].forEach(function(mod) {
            try {
                mod();
            } catch (err) {
                if (window.console) console.error(err);
            }
        });

    })();

})(document.documentElement);