/**
 * Chapter Consistency Validator
 * Development-time validation system ensuring 100% synchronization between
 * CANONICAL_CHAPTERS configuration, DOM section hierarchy, desktop/mobile navigation,
 * section metadata tags, and HUD telemetry elements.
 * 
 * Fails fast by throwing an Error on any drift or mismatch.
 */
import { CANONICAL_CHAPTERS } from './content.js';

export function validateChapterConsistency() {
  const errors = [];

  if (!Array.isArray(CANONICAL_CHAPTERS) || CANONICAL_CHAPTERS.length !== 8) {
    errors.push(`CANONICAL_CHAPTERS must define exactly 8 chapters, found: ${CANONICAL_CHAPTERS?.length}`);
  }

  // 1. Verify DOM Section targets
  CANONICAL_CHAPTERS.forEach((ch, i) => {
    const el = document.querySelector(ch.domTarget);
    if (!el) {
      errors.push(`[Section Missing] Target "${ch.domTarget}" for Chapter ${ch.number} (${ch.label}) not found in DOM`);
      return;
    }

    if (el.id !== ch.id) {
      errors.push(`[ID Mismatch] Element ${ch.domTarget} has id="${el.id}", expected "${ch.id}"`);
    }

    const dataChapter = el.getAttribute('data-chapter');
    if (dataChapter !== ch.hudTitle) {
      errors.push(`[data-chapter Mismatch] Element ${ch.domTarget} has data-chapter="${dataChapter}", expected "${ch.hudTitle}"`);
    }

    const dataIdx = el.getAttribute('data-idx');
    if (dataIdx !== ch.hudIndex) {
      errors.push(`[data-idx Mismatch] Element ${ch.domTarget} has data-idx="${dataIdx}", expected "${ch.hudIndex}"`);
    }

    // Verify section tag contains chapter number
    const tagEl = el.querySelector('.tag');
    if (tagEl) {
      const tagText = tagEl.textContent;
      if (!tagText.includes(ch.number) && !tagText.includes(ch.label)) {
        errors.push(`[Tag Drift] Element ${ch.domTarget} tag "${tagText.trim()}" does not contain Chapter "${ch.number}" or "${ch.label}"`);
      }
    }
  });

  // 2. Verify Desktop Navigation
  const desktopNavLinks = [...document.querySelectorAll('header nav.nav a')];
  if (desktopNavLinks.length !== CANONICAL_CHAPTERS.length) {
    errors.push(`[Desktop Nav Count] Desktop nav has ${desktopNavLinks.length} links, expected ${CANONICAL_CHAPTERS.length}`);
  } else {
    desktopNavLinks.forEach((a, i) => {
      const ch = CANONICAL_CHAPTERS[i];
      const href = a.getAttribute('href');
      const target = a.getAttribute('data-target');
      const text = a.textContent.trim();

      if (href !== ch.domTarget) {
        errors.push(`[Desktop Nav href] Link #${i + 1} has href="${href}", expected "${ch.domTarget}"`);
      }
      if (target !== ch.id) {
        errors.push(`[Desktop Nav data-target] Link #${i + 1} has data-target="${target}", expected "${ch.id}"`);
      }
      if (text !== ch.navLabel && text !== `${ch.number} ${ch.label}`) {
        errors.push(`[Desktop Nav Label] Link #${i + 1} text="${text}", expected "${ch.navLabel}"`);
      }
    });
  }

  // 3. Verify Mobile Navigation
  const mobileNavLinks = [...document.querySelectorAll('#sheet ul a')];
  if (mobileNavLinks.length !== CANONICAL_CHAPTERS.length) {
    errors.push(`[Mobile Nav Count] Mobile nav has ${mobileNavLinks.length} links, expected ${CANONICAL_CHAPTERS.length}`);
  } else {
    mobileNavLinks.forEach((a, i) => {
      const ch = CANONICAL_CHAPTERS[i];
      const href = a.getAttribute('href');
      const numSpan = a.querySelector('span')?.textContent.trim();
      const rawText = a.textContent.replace(numSpan || '', '').trim();

      if (href !== ch.domTarget) {
        errors.push(`[Mobile Nav href] Link #${i + 1} has href="${href}", expected "${ch.domTarget}"`);
      }
      if (numSpan !== ch.number) {
        errors.push(`[Mobile Nav Number] Link #${i + 1} has number "${numSpan}", expected "${ch.number}"`);
      }
      if (rawText !== ch.label) {
        errors.push(`[Mobile Nav Label] Link #${i + 1} has label "${rawText}", expected "${ch.label}"`);
      }
    });
  }

  // 4. Verify Telemetry & HUD elements
  const requiredHud = ['hudIndex', 'hudTitle', 'hudDepth', 'barFill'];
  requiredHud.forEach(id => {
    if (!document.getElementById(id)) {
      errors.push(`[HUD Element Missing] Required telemetry element #${id} not found`);
    }
  });

  if (errors.length > 0) {
    const errorMsg = `[CHAPTER CONSISTENCY FAILURE]\nFound ${errors.length} information architecture discrepancies:\n` +
      errors.map((e, idx) => `  ${idx + 1}. ${e}`).join('\n');
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log(`✓ [Validator] Chapter consistency verified: 8/8 canonical chapters strictly synchronized.`);
  return true;
}
