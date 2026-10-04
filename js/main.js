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

            html.classList.remove('ss-preload');
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

        html.classList.add('ss-preload');

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
        const parentMenus = mainNav.querySelectorAll('.has-children');
        const siteBody = document.querySelector('body');

        if (!(toggleButton && mainNavWrap)) return;

        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleButton.classList.toggle('is-clicked');
            siteBody.classList.toggle('menu-is-open');

            scrollLock.getScrollState() ? scrollLock.disablePageScroll(mainNavWrap) : scrollLock.enablePageScroll(mainNavWrap);
        });

        // open (or close) submenu items in mobile view menu. 
        // close all the other open submenu items.
        mainNav.addEventListener('click', function(e) {

            //check if the right element clicked
            if (!e.target.closest('.has-children')) return;
            
            let clickedA = e.target.closest('a');
            
            // If they clicked a submenu link, let it navigate.
            if (clickedA && !clickedA.parentElement.classList.contains('has-children')) {
                return;
            }

            // If they clicked the main parent link (like About), prevent navigation.
            if (clickedA && clickedA.parentElement.classList.contains('has-children')) {
                e.preventDefault();
            }

                //check if element contains active class
                if (!e.target.closest('.has-children').classList.contains('sub-menu-is-open')) {

                    parentMenus.forEach(function(current) {
                        current.classList.remove('sub-menu-is-open');
                    });

                    // add is-active class on cliked accordion
                    e.target.closest('.has-children').classList.add('sub-menu-is-open');

                } else {

                    // remove is-active class on cliked accordion
                    e.target.closest('.has-children').classList.remove('sub-menu-is-open');
                }
        });

        window.addEventListener('resize', function() {

            // above 1200px
            if (window.matchMedia('(min-width: 1201px)').matches) {
                if (siteBody.classList.contains('menu-is-open')) siteBody.classList.remove('menu-is-open');
                if (toggleButton.classList.contains('is-clicked')) toggleButton.classList.remove('is-clicked');
                if (!scrollLock.getScrollState()) scrollLock.enablePageScroll();

                parentMenus.forEach(function(current) {
                    current.classList.remove('sub-menu-is-open');
                });
            }
        });

    }; // end ssMobileMenu


    /* search
    * ------------------------------------------------------ */
    const ssSearch = function() {

        const searchWrap = document.querySelector('.s-header__search');
        const searchTrigger = document.querySelector('.s-header__search-trigger');

        if (!(searchWrap && searchTrigger)) return;

        const searchField = searchWrap.querySelector('.s-header__search-field');
        const closeSearch = searchWrap.querySelector('.s-header__search-close');
        const siteBody = document.querySelector('body');

        searchTrigger.addEventListener('click', function(e) {

            e.preventDefault();
            e.stopPropagation();
            siteBody.classList.add('search-is-visible');

            scrollLock.getScrollState() ? scrollLock.disablePageScroll(searchWrap) : scrollLock.enablePageScroll(searchWrap);

            setTimeout(function(){
                searchWrap.querySelector('.s-header__search-field').focus();
            }, 100);
        });

        closeSearch.addEventListener('click', function(e) {

            e.stopPropagation();

            if(siteBody.classList.contains('search-is-visible')) {

                siteBody.classList.remove('search-is-visible');
                setTimeout(function(){
                    searchWrap.querySelector('.s-header__search-field').blur();
                }, 100);

                scrollLock.getScrollState() ? scrollLock.disablePageScroll(searchWrap) : scrollLock.enablePageScroll(searchWrap);
            }
        });

        searchWrap.addEventListener('click', function(e) {
            if( !(e.target.matches('.s-header__search-inner')) ) {
                closeSearch.dispatchEvent(new Event('click'));
            }
        });

        searchField.addEventListener('click', function(e) {
            e.stopPropagation();
        })

        searchField.setAttribute('placeholder', 'Search for...');
        searchField.setAttribute('autocomplete', 'off');

    }; // end ssSearch


    /* masonry
    * ------------------------------------------------------ */
    const ssMasonry = function() {

        // Disable Masonry layout - using CSS Grid instead
        // const containerBricks = document.querySelector('.bricks-wrapper');
        // if (!containerBricks) return;

        // imagesLoaded(containerBricks, function() {

        //     const msnry = new Masonry(containerBricks, {
        //         itemSelector: '.entry',
        //         columnWidth: '.grid-sizer',
        //         percentPosition: true,
        //         resize: true
        //     });

        // });

    }; // end ssMasonry


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
                renderBullet: function (index, className) {
                    return '<span class="' + className + '">' + (index + 1) + '</span>';
                }
            }

        });

    }; // end ssSwiper


   /* alert boxes
    * ------------------------------------------------------ */
    const ssAlertBoxes = function() {

        const boxes = document.querySelectorAll('.alert-box');
  
        boxes.forEach(function(box){

            box.addEventListener('click', function(event) {
                if (event.target.matches('.alert-box__close')) {
                    event.stopPropagation();
                    event.target.parentElement.classList.add('hideit');

                    setTimeout(function(){
                        box.style.display = 'none';
                    }, 500)
                }
            });
        })

    }; // end ssAlertBoxes


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


   /* Initialize
    * ------------------------------------------------------ */
    (function ssInit() {

        ssPreloader();
        ssThemeToggle();
        ssMobileMenu();
        ssSearch();
        ssMasonry();
        ssAnimateBricks();
        ssSwiper();
        ssAlertBoxes();
        ssBackToTop();
        ssMoveTo();

    })();

})(document.documentElement);