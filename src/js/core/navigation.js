/**
 * NAVIGATION
 * ----------
 * Builds every piece of chapter navigation from the single chapter
 * registry: top bar links, the drawer, the right-hand rail, and the
 * progress meter. Because all four read the same array, the chapter
 * number shown in the HUD can never disagree with the section on screen.
 */

import { CHAPTERS } from "../config/chapters.js";
import { themeBg, themeOf } from "./palettes.js";
import { pad2 } from "../utils.js";

export class Navigation {
  constructor({ topbarList, drawerList, rail, meterNum, meterTitle, meterFill, menuToggle, drawer, topbar }) {
    this.topbarList = topbarList;
    this.drawerList = drawerList;
    this.rail = rail;
    this.meterNum = meterNum;
    this.meterTitle = meterTitle;
    this.meterFill = meterFill;
    this.menuToggle = menuToggle;
    this.drawer = drawer;
    this.topbar = topbar;
    this.activeIndex = 0;

    // The browser-chrome / tab colour that shifts with each chapter.
    this.themeColorMeta = document.querySelector('meta[name="theme-color"]');

    this.render();
    this.bind();
  }

  render() {
    // --- Top bar ---
    this.topbarList.innerHTML = CHAPTERS.map(
      (c) => `
      <li>
        <a class="topbar__link" href="#chapter-${c.id}" data-nav-index="${c.index}">
          <span class="topbar__link-num">${pad2(c.index)}</span>
          <span class="topbar__link-text">${c.nav}</span>
        </a>
      </li>`,
    ).join("");

    // --- Drawer ---
    this.drawerList.innerHTML = CHAPTERS.map(
      (c) => `
      <li>
        <a class="drawer__link" href="#chapter-${c.id}" data-nav-index="${c.index}">
          <span class="drawer__link-num">${pad2(c.index)}</span>
          <span class="drawer__link-title">${c.title}</span>
        </a>
      </li>`,
    ).join("");

    // --- Right rail ---
    this.rail.innerHTML = CHAPTERS.map(
      (c) => `
      <span class="hud__tick" data-rail-index="${c.index}">
        <span class="hud__tick-text">${c.title}</span>
        <span class="hud__tick-bar"></span>
      </span>`,
    ).join("");

    this.links = Array.from(document.querySelectorAll("[data-nav-index]"));
    this.ticks = Array.from(document.querySelectorAll("[data-rail-index]"));
  }

  bind() {
    // Smooth-scroll to a chapter and close the drawer afterwards.
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#chapter-"]');
      if (!link) return;
      event.preventDefault();
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      this.closeDrawer();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      // Keep the URL honest without jumping.
      history.replaceState(null, "", `#${id}`);
    });

    this.menuToggle?.addEventListener("click", () => this.toggleDrawer());
    this.drawer?.querySelectorAll("[data-drawer-close]").forEach((el) =>
      el.addEventListener("click", () => this.closeDrawer()),
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeDrawer();
    });
  }

  toggleDrawer() {
    if (this.drawer.hidden) this.openDrawer();
    else this.closeDrawer();
  }

  openDrawer() {
    this.drawer.hidden = false;
    this.menuToggle.setAttribute("aria-expanded", "true");
    this.menuToggle.setAttribute("aria-label", "Close chapter menu");
    document.documentElement.style.overflow = "hidden";
    // Focus the first chapter link for keyboard users.
    requestAnimationFrame(() => this.drawer.querySelector("a")?.focus());
  }

  closeDrawer() {
    if (this.drawer.hidden) return;
    this.drawer.hidden = true;
    this.menuToggle.setAttribute("aria-expanded", "false");
    this.menuToggle.setAttribute("aria-label", "Open chapter menu");
    document.documentElement.style.overflow = "";
  }

  /** Called by the choreography whenever the active chapter changes. */
  setActive(chapter, index) {
    this.activeIndex = index;

    this.links.forEach((link) => {
      link.classList.toggle("is-active", Number(link.dataset.navIndex) === chapter.index);
      if (Number(link.dataset.navIndex) === chapter.index) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    this.ticks.forEach((tick) => {
      const i = Number(tick.dataset.railIndex);
      tick.classList.toggle("is-active", i === chapter.index);
      tick.classList.toggle("is-passed", i < chapter.index);
    });

    this.meterNum.textContent = `CH ${pad2(chapter.index)}`;
    this.meterTitle.textContent = chapter.title;

    // Highlight the current section so its ghost numeral fades in.
    document.querySelectorAll(".chapter.is-current").forEach((el) => el.classList.remove("is-current"));
    document.getElementById(`chapter-${chapter.id}`)?.classList.add("is-current");

    // The DOM accent follows the chapter, so HTML colour and WebGL
    // lighting always agree.
    document.documentElement.dataset.activeChapter = chapter.id;
    document.documentElement.dataset.chapterIndex = String(chapter.index);

    // Shift the browser tab / mobile status-bar colour to this chapter's
    // background so the OS chrome travels with the story (theme-aware).
    this.refreshThemeColor();
  }

  /** Re-syncs the tab colour to the active chapter in the current theme. */
  refreshThemeColor() {
    if (!this.themeColorMeta) return;
    const chapter = CHAPTERS[this.activeIndex] ?? CHAPTERS[0];
    this.themeColorMeta.setAttribute("content", themeBg(chapter.palette, themeOf()));
  }

  /** Overall scroll progress, 0..1. */
  setProgress(ratio) {
    if (this.meterFill) this.meterFill.style.height = `${(ratio * 100).toFixed(2)}%`;
  }
}
