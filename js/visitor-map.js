/* ===================================================================
 * Visitor map - graceful fallback
 *
 * mapmyvisitors.com serves map.png from its own infrastructure, and when
 * that service is down every request returns a 500 HTML page, which the
 * browser renders as a broken-image icon. Swap in a quiet placeholder
 * instead and retry a few times so the card heals itself once the
 * provider recovers - no page reload needed.
 * ------------------------------------------------------------------- */

(function() {

    'use strict';

    const RETRY_DELAYS = [5000, 20000, 60000];

    const buildFallback = function(message) {

        const box = document.createElement('div');
        box.className = 'visitor-map-fallback';
        box.style.cssText = 'display: flex; flex-direction: column; align-items: center; ' +
            'justify-content: center; gap: 0.9rem; width: 100%; height: 100%; ' +
            'border-radius: 4px; background: rgba(0, 30, 80, 0.02); ' +
            'border: 1px dashed rgba(0, 30, 80, 0.12);';

        box.innerHTML =
            '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-1)" ' +
            'stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.22;">' +
            '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line>' +
            '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>' +
            '</svg>' +
            '<span style="font-family: var(--font-1); font-size: 0.78rem; line-height: 1.5; ' +
            'text-align: center; padding: 0 1rem; opacity: 0.45;"></span>';

        box.querySelector('span').textContent = message;

        return box;

    }; // end buildFallback

    const watchMap = function(img) {

        const frame = img.closest('.visitor-map-frame');
        if (!frame) return;

        const holder = img.closest('a') || img;
        const source = img.getAttribute('src');
        const fallback = buildFallback(img.getAttribute('data-fallback-text') || 'Visitor map is temporarily unavailable.');

        fallback.style.display = 'none';
        frame.appendChild(fallback);

        let attempt = 0;

        img.addEventListener('error', function() {

            holder.style.display = 'none';
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
            holder.style.display = '';
        });

        // The image may already have failed before this script ran.
        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }

    }; // end watchMap

    document.querySelectorAll('img[data-visitor-map]').forEach(watchMap);

})();
