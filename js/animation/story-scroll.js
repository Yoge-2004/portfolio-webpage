/**
 * Story-Driven Scroll Choreography (GSAP + ScrollTrigger)
 * Ensures that the visitor's scroll actively controls the narrative,
 * transforming content, revealing progressive phases, and driving chapter transitions.
 */
import { gsap } from '../../vendor/gsap/index.js';
import ScrollTrigger from '../../vendor/gsap/ScrollTrigger.js';
import { state } from '../core/state.js';

gsap.registerPlugin(ScrollTrigger);

export function initStoryScroll() {
  if (state.reducedMotion) return;

  // 1. Chapter 01: Prologue — Split Typography & Identity Assembly
  const prologueSec = document.getElementById('prologue');
  if (prologueSec) {
    const firstName = prologueSec.querySelector('.hero-name-first');
    const lastName = prologueSec.querySelector('.hero-name-last');
    const lede = prologueSec.querySelector('.lede');
    const facts = prologueSec.querySelectorAll('.facts-item');

    if (firstName && lastName) {
      gsap.to(firstName, {
        x: -28,
        letterSpacing: '0.02em',
        ease: 'power1.out',
        scrollTrigger: {
          trigger: prologueSec,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
      gsap.to(lastName, {
        x: 28,
        letterSpacing: '0.04em',
        ease: 'power1.out',
        scrollTrigger: {
          trigger: prologueSec,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }

    if (facts.length > 0) {
      gsap.from(facts, {
        y: 24,
        opacity: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.facts',
          start: 'top 85%',
          end: 'top 55%',
          scrub: 0.5
        }
      });
    }
  }

  // 2. Chapter 02: Origin — Foundation Manifesto & Progressive Pillars
  const originSec = document.getElementById('origin');
  if (originSec) {
    const manifesto = originSec.querySelector('.origin-manifesto');
    const pillars = originSec.querySelectorAll('.origin-pillar');
    const panels = originSec.querySelectorAll('.panel');

    if (manifesto) {
      gsap.fromTo(
        manifesto,
        { scale: 0.96, opacity: 0.7 },
        {
          scale: 1.02,
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: originSec,
            start: 'top 75%',
            end: 'top 25%',
            scrub: 0.5
          }
        }
      );
    }

    if (pillars.length > 0) {
      gsap.from(pillars, {
        y: 30,
        opacity: 0.2,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.origin-pillars-grid',
          start: 'top 80%',
          end: 'top 40%',
          scrub: 0.5
        }
      });
    }

    if (panels.length > 0) {
      gsap.from(panels, {
        x: 20,
        opacity: 0.3,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.panel-group',
          start: 'top 80%',
          end: 'top 45%',
          scrub: 0.5
        }
      });
    }
  }

  // 3. Chapter 03: Discovery — Progressive Research Architecture
  const discoverySec = document.getElementById('discovery');
  if (discoverySec) {
    const pipelineSteps = discoverySec.querySelectorAll('.pipeline-step');
    const numCards = discoverySec.querySelectorAll('.num');

    if (pipelineSteps.length > 0) {
      pipelineSteps.forEach((step, idx) => {
        gsap.fromTo(
          step,
          { opacity: 0.4, borderColor: 'rgba(255,255,255,0.08)' },
          {
            opacity: 1,
            borderColor: '#ff8a65',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 78%',
              end: 'top 50%',
              scrub: 0.4
            }
          }
        );
      });
    }

    if (numCards.length > 0) {
      gsap.from(numCards, {
        y: 20,
        opacity: 0.3,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.nums',
          start: 'top 82%',
          end: 'top 55%',
          scrub: 0.5
        }
      });
    }
  }

  // 4. Chapter 04: Quests — Stack Layers & Progressive Project Phases
  const questsSec = document.getElementById('quests');
  if (questsSec) {
    // Technical Layers Scrub
    const techLayers = questsSec.querySelectorAll('.tech-layer');
    techLayers.forEach((layer, idx) => {
      gsap.fromTo(
        layer,
        { opacity: 0.4, y: 18 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: layer,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.5
          }
        }
      );
    });

    // Major Project Cards: Scrub Progressive Story Phases
    const projectCards = questsSec.querySelectorAll('.project-story-card');
    projectCards.forEach(card => {
      const phases = card.querySelectorAll('.story-phase');
      const consoleCard = card.querySelector('.telemetry-console-card');
      const bars = card.querySelectorAll('.c-bar-fill');

      if (phases.length > 0) {
        gsap.from(phases, {
          y: 16,
          opacity: 0.3,
          stagger: 0.12,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 75%',
            end: 'top 35%',
            scrub: 0.5
          }
        });
      }

      if (bars.length > 0) {
        bars.forEach(b => {
          const targetW = b.style.width || '95%';
          gsap.fromTo(
            b,
            { width: '0%' },
            {
              width: targetW,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: consoleCard || card,
                start: 'top 80%',
                end: 'top 45%',
                scrub: 0.6
              }
            }
          );
        });
      }
    });

    // Secondary Works Rack
    const slots = questsSec.querySelectorAll('.slot');
    if (slots.length > 0) {
      gsap.from(slots, {
        y: 22,
        opacity: 0.3,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.rack',
          start: 'top 85%',
          end: 'top 50%',
          scrub: 0.5
        }
      });
    }
  }

  // 5. Chapter 05: Arena — Timeline Rail Progression
  const arenaSec = document.getElementById('arena');
  if (arenaSec) {
    const arenaRows = arenaSec.querySelectorAll('.row');
    arenaRows.forEach(row => {
      gsap.fromTo(
        row,
        { opacity: 0.35, x: -16 },
        {
          opacity: 1,
          x: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 82%',
            end: 'top 55%',
            scrub: 0.4
          }
        }
      );
    });
  }

  // 6. Chapter 06: Capability — Stack Cascade & Certs
  const capSec = document.getElementById('capability');
  if (capSec) {
    const caps = capSec.querySelectorAll('.cap');
    const certs = capSec.querySelectorAll('.cert-card');

    if (caps.length > 0) {
      gsap.from(caps, {
        y: 25,
        opacity: 0.3,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.caps',
          start: 'top 85%',
          end: 'top 55%',
          scrub: 0.5
        }
      });
    }

    if (certs.length > 0) {
      gsap.from(certs, {
        scale: 0.94,
        opacity: 0.3,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.certs',
          start: 'top 85%',
          end: 'top 50%',
          scrub: 0.5
        }
      });
    }
  }

  // 7. Chapter 07: Path — Chronological Beam Progression
  const pathSec = document.getElementById('path');
  if (pathSec) {
    const stops = pathSec.querySelectorAll('.stop');
    stops.forEach((stop, i) => {
      gsap.fromTo(
        stop,
        { opacity: 0.35, y: 18 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stop,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.4,
            onEnter: () => stop.classList.add('hit'),
            onLeaveBack: () => stop.classList.remove('hit')
          }
        }
      );
    });
  }

  // 8. Chapter 08: Contact — Convergence
  const contactSec = document.getElementById('contact');
  if (contactSec) {
    const reachCards = contactSec.querySelectorAll('.reach-card');
    if (reachCards.length > 0) {
      gsap.from(reachCards, {
        y: 28,
        opacity: 0.25,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.reach',
          start: 'top 85%',
          end: 'top 55%',
          scrub: 0.5
        }
      });
    }
  }
}
