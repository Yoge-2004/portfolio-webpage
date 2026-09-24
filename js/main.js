/**
 * Application Entrypoint & Subsystem Orchestration
 */
import { renderAllTacticalCards } from './ui/cards.js';
import { initPointer } from './interaction/pointer.js';
import { initCursor } from './interaction/cursor.js';
import { initMagneticButtons } from './interaction/magnetic.js';
import { initMobileMenu } from './navigation/mobile-menu.js';
import { initNavigation } from './navigation/navigation.js';
import { initScroll } from './animation/scroll.js';
import { initStoryScroll } from './animation/story-scroll.js';
import { initReveal } from './animation/reveal.js';
import { initTextReveals } from './animation/text.js';
import { initTelemetry } from './ui/telemetry.js';
import { initWorld } from './world/world.js';
import { initLoading } from './ui/loading.js';
import { setupAudioUI } from './audio/soundscape.js';
import { setupResearchSimulator } from './ui/research-simulator.js';
import { setupCapabilityFilters } from './ui/filters.js';
import { setupClipboard } from './ui/clipboard.js';

function bootstrap() {
  // 1. Interactions
  const pointerController = initPointer();
  initCursor();
  initMagneticButtons();

  // 2. Navigation & Audio
  initMobileMenu();
  setupAudioUI();
  setupCapabilityFilters();
  setupClipboard();

  // 3. Animation & Observables
  const revealController = initReveal();
  initTextReveals();
  const telemetryController = initTelemetry();
  const lenisInstance = initScroll();
  initStoryScroll();
  initNavigation(lenisInstance);

  // 4. Tactical Canvases & 3D World
  let worldInstance = null;

  renderAllTacticalCards(() => {
    if (worldInstance?.refreshExhibitTextures) {
      worldInstance.refreshExhibitTextures();
    }
  });

  worldInstance = initWorld(pointerController, telemetryController, revealController);

  // 5. Research Simulator Integration
  setupResearchSimulator(preset => {
    // If the 3D world is active, we can trigger a pulse or lighting reaction
    if (worldInstance?.scene) {
      // Subtle reaction
    }
  });

  // 6. Loading Dismissal
  initLoading();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
