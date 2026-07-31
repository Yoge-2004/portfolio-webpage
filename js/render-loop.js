/* ============================================
   SHARED RENDER LOOP
   All WebGL scenes (currently hero3d, scroll3d) register a
   per-frame callback here instead of each running its own
   requestAnimationFrame chain. Multiple independent rAF
   loops means multiple separate browser-scheduled callbacks
   competing for the same 16ms frame budget that Lenis's
   eased scroll depends on — that's a direct cause of scroll
   jank. One loop, N cheap function calls inside it, is much
   lighter.

   Must load before hero3d.js / scroll3d.js.
   Falls back gracefully: if a scene loads before this
   script for any reason, it just runs its own rAF loop
   (see the `window.RenderLoop &&` guards in each file).
   ============================================ */
(function () {
    'use strict';

    const callbacks = [];
    let running = false;

    function frame(time) {
        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i](time);
        }
        requestAnimationFrame(frame);
    }

    function register(fn) {
        callbacks.push(fn);
        if (!running) {
            running = true;
            requestAnimationFrame(frame);
        }
        return function unregister() {
            const idx = callbacks.indexOf(fn);
            if (idx !== -1) callbacks.splice(idx, 1);
        };
    }

    window.RenderLoop = { register };
})();
