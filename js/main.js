/**
 * Application Entrypoint & Subsystem Orchestration
 */
import { renderAllTacticalCards } from './ui/cards.js';
import { initPointer } from './interaction/pointer.js';
import { initCursor } from './interaction/cursor.js';
import { initMobileMenu } from './navigation/mobile-menu.js';
import { initNavigation } from './navigation/navigation.js';
import { initScroll } from './animation/scroll.js';
import { initReveal } from './animation/reveal.js';
import { initTelemetry } from './ui/telemetry.js';
import { initWorld } from './world/world.js';
import { initLoading } from './ui/loading.js';

function bootstrap() {
  // 1. Interactions
  const pointerController = initPointer();
  initCursor();

  // 2. Navigation
  initMobileMenu();

  // 3. Animation & Observables
  const revealController = initReveal();
  const telemetryController = initTelemetry();
  const lenisInstance = initScroll();
  initNavigation(lenisInstance);

  // 4. Tactical Canvases & 3D World
  let worldInstance = null;

  renderAllTacticalCards(() => {
    if (worldInstance?.refreshExhibitTextures) {
      worldInstance.refreshExhibitTextures();
    }
  });

  worldInstance = initWorld(pointerController, telemetryController, revealController);

  // 5. Loading Dismissal
  initLoading();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
