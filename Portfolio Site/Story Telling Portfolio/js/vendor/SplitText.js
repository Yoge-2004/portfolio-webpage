/*!
 * SplitText.js — lightweight GSAP-compatible implementation
 * Splits text into chars, words, lines — returns { chars, words, lines }
 * Revert() restores original HTML.
 */
(function(global) {
    'use strict';

    function SplitText(targets, vars) {
        vars = vars || {};
        this.chars  = [];
        this.words  = [];
        this.lines  = [];
        this._originals = [];

        const type         = vars.type || 'chars,words';
        const charsClass   = vars.charsClass   || 'gsap-char';
        const wordsClass   = vars.wordsClass   || 'gsap-word';
        const linesClass   = vars.linesClass   || 'gsap-line';
        const splitChars   = /chars/.test(type);
        const splitWords   = /words/.test(type) || splitChars;
        const splitLines   = /lines/.test(type);

        const els = typeof targets === 'string'
            ? Array.from(document.querySelectorAll(targets))
            : (targets instanceof Element ? [targets] : Array.from(targets));

        const self = this;

        els.forEach(el => {
            // Store original
            self._originals.push({ el, html: el.innerHTML });

            if (splitLines) {
                _splitLines(el, linesClass, self.lines);
                return;
            }

            const text = el.textContent;
            el.innerHTML = '';

            if (splitWords || splitChars) {
                const wordArr = text.split(/(\s+)/);
                wordArr.forEach(segment => {
                    if (/^\s+$/.test(segment)) {
                        el.appendChild(document.createTextNode(segment));
                        return;
                    }
                    const wordSpan = document.createElement('span');
                    wordSpan.className = wordsClass;
                    wordSpan.style.cssText = 'display:inline-block; white-space:nowrap;';

                    if (splitChars) {
                        segment.split('').forEach(ch => {
                            const charSpan = document.createElement('span');
                            charSpan.className = charsClass;
                            charSpan.style.cssText = 'display:inline-block;';
                            charSpan.textContent = ch === ' ' ? '\u00A0' : ch;
                            wordSpan.appendChild(charSpan);
                            self.chars.push(charSpan);
                        });
                    } else {
                        wordSpan.textContent = segment;
                    }

                    el.appendChild(wordSpan);
                    self.words.push(wordSpan);
                });
            }
        });
    }

    function _splitLines(el, linesClass, linesArr) {
        const text = el.textContent;
        el.innerHTML = '';

        // Measure line breaks by word-wrapping
        const words = text.split(/(\s+)/);
        const spans = [];
        words.forEach(w => {
            if (/^\s+$/.test(w)) return;
            const s = document.createElement('span');
            s.style.cssText = 'display:inline; white-space:nowrap;';
            s.textContent = w + ' ';
            el.appendChild(s);
            spans.push(s);
        });

        // Group spans by their top offset = same line
        const lineMap = new Map();
        spans.forEach(s => {
            const top = s.getBoundingClientRect().top.toFixed(1);
            if (!lineMap.has(top)) lineMap.set(top, []);
            lineMap.get(top).push(s);
        });

        el.innerHTML = '';
        lineMap.forEach(spansInLine => {
            const lineEl = document.createElement('div');
            lineEl.className = linesClass;
            lineEl.style.cssText = 'display:block; overflow:hidden;';
            lineEl.textContent = spansInLine.map(s => s.textContent.trim()).join(' ');
            el.appendChild(lineEl);
            linesArr.push(lineEl);
        });
    }

    SplitText.prototype.revert = function() {
        this._originals.forEach(({ el, html }) => { el.innerHTML = html; });
        this.chars  = [];
        this.words  = [];
        this.lines  = [];
        return this;
    };

    // Register with GSAP if available
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        SplitText.version = '1.0.0';
        gsap.registerPlugin(SplitText);
    }

    global.SplitText = SplitText;

})(typeof window !== 'undefined' ? window : this);
