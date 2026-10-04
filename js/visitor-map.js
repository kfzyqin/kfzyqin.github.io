/* ===================================================================
 * Visitor widgets - graceful fallback
 *
 * The map and the country flag grid are both remote images rendered by
 * Flag Counter. When that service is down a request returns an error page
 * rather than an image, which the browser draws as a broken-image icon.
 * Swap in a quiet placeholder instead and retry a few times so the card
 * heals itself once the provider recovers - no page reload needed.
 *
 * Flag Counter can also be slow rather than down -- several seconds per
 * image -- and the page no longer waits for it before showing. So until an
 * image arrives its card shows a "loading" placeholder instead of an empty
 * box that reads as broken.
 *
 * Applies to every img[data-visitor-map] inside a .visitor-map-frame.
 * Presentation lives in css/styles.css under "# Visitor Analytics";
 * this file only toggles visibility.
 * ------------------------------------------------------------------- */

(function() {

    'use strict';

    const RETRY_DELAYS = [5000, 20000, 60000];

    const buildFallback = function(message) {

        const box = document.createElement('div');
        box.className = 'visitor-map-fallback';
        box.innerHTML =
            '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" ' +
            'stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line>' +
            '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>' +
            '</svg><span></span>';

        box.querySelector('span').textContent = message;

        return box;

    }; // end buildFallback

    // Same three-dot motif as the page preloader.
    const buildLoading = function(message) {

        const box = document.createElement('div');
        box.className = 'visitor-map-loading';
        box.innerHTML = '<div class="visitor-map-loading__dots"><i></i><i></i><i></i></div><span></span>';
        box.querySelector('span').textContent = message;
        return box;

    }; // end buildLoading

    const watchMap = function(img) {

        const frame = img.closest('.visitor-map-frame');
        if (!frame) return;

        const holder = img.closest('a') || img;
        const source = img.getAttribute('src');
        const fallback = buildFallback(img.getAttribute('data-fallback-text') || 'Visitor map is temporarily unavailable.');

        fallback.style.display = 'none';
        frame.appendChild(fallback);

        const loading = buildLoading(img.getAttribute('data-loading-text') || 'Loading from Flag Counter…');
        loading.style.display = 'none';
        frame.appendChild(loading);

        // Not yet arrived: stand the placeholder in for the image. The image
        // is not lazy, so hiding its link does not stop it from loading.
        if (!img.complete) {
            holder.style.display = 'none';
            loading.style.display = 'flex';
        }

        let attempt = 0;

        img.addEventListener('error', function() {

            holder.style.display = 'none';
            loading.style.display = 'none';
            fallback.style.display = 'flex';

            if (attempt >= RETRY_DELAYS.length) return;

            const delay = RETRY_DELAYS[attempt];
            attempt++;

            window.setTimeout(function() {
                img.src = source + (source.indexOf('?') === -1 ? '?' : '&') + 'retry=' + Date.now();
            }, delay);

        });

        img.addEventListener('load', function() {
            fallback.style.display = 'none';
            loading.style.display = 'none';
            holder.style.display = '';
        });

        // The image may already have failed before this script ran.
        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }

    }; // end watchMap

    document.querySelectorAll('img[data-visitor-map]').forEach(watchMap);

})();
