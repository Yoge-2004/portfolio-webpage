/**
 * Story-Driven Scroll Choreography (GSAP + ScrollTrigger)
 * Content-first, narrative-synchronized scroll mechanics.
 * Each chapter features a distinct visual interaction communicating its meaning.
 * Uses safe immediateRender: false to preserve pristine 100% typography & readability.
 */
import { gsap } from '../../vendor/gsap/index.js';
import ScrollTrigger from '../../vendor/gsap/ScrollTrigger.js';
import { state } from '../core/state.js';

gsap.registerPlugin(ScrollTrigger);

export function initStoryScroll() {
  if (state.reducedMotion) return;

  // 1. Chapter 01: Prologue — Split Typography & Spatial Kinetic Drift
  const prologueSec = document.getElementById('prologue');
  if (prologueSec) {
    const firstName = prologueSec.querySelector('.hero-name-first');
    const lastName = prologueSec.querySelector('.hero-name-last');
    const facts = prologueSec.querySelectorAll('.facts-item');

    if (firstName && lastName) {
      gsap.to(firstName, {
        x: -36,
        letterSpacing: '0.015em',
        ease: 'none',
        scrollTrigger: {
          trigger: prologueSec,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.4
        }
      });
      gsap.to(lastName, {
        x: 36,
        letterSpacing: '0.035em',
        ease: 'none',
        scrollTrigger: {
          trigger: prologueSec,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.4
        }
      });
    }

    if (facts.length > 0) {
      gsap.fromTo(
        facts,
        { y: 16, opacity: 0.8 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.facts',
            start: 'top 88%',
            end: 'top 65%',
            scrub: 0.3
          }
        }
      );
    }
  }

  // 2. Chapter 02: Origin — Foundation Manifesto Scale & Architectural Pillar Elevation
  const originSec = document.getElementById('origin');
  if (originSec) {
    const manifesto = originSec.querySelector('.origin-manifesto');
    const pillars = originSec.querySelectorAll('.origin-pillar');
    const panels = originSec.querySelectorAll('.panel');

    if (manifesto) {
      gsap.fromTo(
        manifesto,
        { scale: 0.98, borderColor: 'rgba(255,255,255,0.08)' },
        {
          scale: 1.01,
          borderColor: 'rgba(245, 158, 11, 0.4)',
          ease: 'power1.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: originSec,
            start: 'top 75%',
            end: 'top 25%',
            scrub: 0.4
          }
        }
      );
    }

    if (pillars.length > 0) {
      gsap.fromTo(
        pillars,
        { y: 18, borderColor: 'rgba(255,255,255,0.08)' },
        {
          y: 0,
          borderColor: 'rgba(245, 158, 11, 0.25)',
          stagger: 0.1,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.origin-pillars-grid',
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.4
          }
        }
      );
    }

    if (panels.length > 0) {
      gsap.fromTo(
        panels,
        { x: 12 },
        {
          x: 0,
          stagger: 0.08,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.panel-group',
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.4
          }
        }
      );
    }
  }

  // 3. Chapter 03: Discovery — Pipeline Activation & Confidence Readout
  const discoverySec = document.getElementById('discovery');
  if (discoverySec) {
    const pipelineSteps = discoverySec.querySelectorAll('.pipeline-step');
    const numCards = discoverySec.querySelectorAll('.num');

    if (pipelineSteps.length > 0) {
      pipelineSteps.forEach((step, idx) => {
        gsap.fromTo(
          step,
          { borderColor: 'rgba(255,255,255,0.08)' },
          {
            borderColor: '#ff8a65',
            ease: 'power1.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: step,
              start: 'top 80%',
              end: 'top 55%',
              scrub: 0.3
            }
          }
        );
      });
    }

    if (numCards.length > 0) {
      gsap.fromTo(
        numCards,
        { y: 14 },
        {
          y: 0,
          stagger: 0.08,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.nums',
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.4
          }
        }
      );
    }
  }

  // 4. Chapter 04: Quests — Stack Layers Scrub & Live Telemetry Meter Calibration
  const questsSec = document.getElementById('quests');
  if (questsSec) {
    const techLayers = questsSec.querySelectorAll('.tech-layer');
    techLayers.forEach((layer) => {
      gsap.fromTo(
        layer,
        { y: 12, borderColor: 'rgba(255,255,255,0.07)' },
        {
          y: 0,
          borderColor: 'rgba(6, 182, 212, 0.35)',
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: layer,
            start: 'top 88%',
            end: 'top 65%',
            scrub: 0.4
          }
        }
      );
    });

    const projectCards = questsSec.querySelectorAll('.project-story-card');
    projectCards.forEach(card => {
      const phases = card.querySelectorAll('.story-phase');
      const consoleCard = card.querySelector('.telemetry-console-card');
      const bars = card.querySelectorAll('.c-bar-fill');

      if (phases.length > 0) {
        gsap.fromTo(
          phases,
          { y: 10, borderColor: 'rgba(255,255,255,0.07)' },
          {
            y: 0,
            borderColor: 'rgba(245, 158, 11, 0.3)',
            stagger: 0.08,
            ease: 'power1.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              end: 'top 45%',
              scrub: 0.4
            }
          }
        );
      }

      if (bars.length > 0) {
        bars.forEach(b => {
          const targetW = b.getAttribute('data-width') || b.style.width || '95%';
          b.setAttribute('data-width', targetW);
          gsap.fromTo(
            b,
            { width: '20%' },
            {
              width: targetW,
              ease: 'power2.out',
              immediateRender: false,
              scrollTrigger: {
                trigger: consoleCard || card,
                start: 'top 85%',
                end: 'top 55%',
                scrub: 0.5
              }
            }
          );
        });
      }
    });

    const slots = questsSec.querySelectorAll('.slot');
    if (slots.length > 0) {
      gsap.fromTo(
        slots,
        { y: 14 },
        {
          y: 0,
          stagger: 0.05,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.rack',
            start: 'top 88%',
            end: 'top 60%',
            scrub: 0.4
          }
        }
      );
    }
  }

  // 5. Chapter 05: Arena — Structural Timeline Rail Progression
  const arenaSec = document.getElementById('arena');
  if (arenaSec) {
    const arenaRows = arenaSec.querySelectorAll('.row');
    arenaRows.forEach(row => {
      gsap.fromTo(
        row,
        { x: -10, borderColor: 'rgba(255,255,255,0.08)' },
        {
          x: 0,
          borderColor: 'rgba(245, 158, 11, 0.35)',
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: row,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.35
          }
        }
      );
    });
  }

  // 6. Chapter 06: Capability — Stack Cascade & Certificate Badging
  const capSec = document.getElementById('capability');
  if (capSec) {
    const caps = capSec.querySelectorAll('.cap');
    const certs = capSec.querySelectorAll('.cert-card');

    if (caps.length > 0) {
      gsap.fromTo(
        caps,
        { y: 14 },
        {
          y: 0,
          stagger: 0.08,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.caps',
            start: 'top 88%',
            end: 'top 60%',
            scrub: 0.4
          }
        }
      );
    }

    if (certs.length > 0) {
      gsap.fromTo(
        certs,
        { scale: 0.98 },
        {
          scale: 1,
          stagger: 0.04,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.certs',
            start: 'top 88%',
            end: 'top 55%',
            scrub: 0.4
          }
        }
      );
    }
  }

  // 7. Chapter 07: Path — Chronological Beam Illumination
  const pathSec = document.getElementById('path');
  if (pathSec) {
    const stops = pathSec.querySelectorAll('.stop');
    stops.forEach((stop) => {
      gsap.fromTo(
        stop,
        { y: 12 },
        {
          y: 0,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: stop,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.35,
            onEnter: () => stop.classList.add('hit'),
            onLeaveBack: () => stop.classList.remove('hit')
          }
        }
      );
    });
  }

  // 8. Chapter 08: Contact — Convergence & Terminal Activation
  const contactSec = document.getElementById('contact');
  if (contactSec) {
    const reachCards = contactSec.querySelectorAll('.reach-card');
    if (reachCards.length > 0) {
      gsap.fromTo(
        reachCards,
        { y: 16 },
        {
          y: 0,
          stagger: 0.08,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.reach',
            start: 'top 88%',
            end: 'top 60%',
            scrub: 0.4
          }
        }
      );
    }
  }
}
