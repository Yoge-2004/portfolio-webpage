/**
 * 2D Tactical Exhibit Canvas Card Renderers
 */
import { EXHIBIT_PREVIEWS } from '../core/config.js';

export function paintTacticalCard(canvas, data) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Background Obsidian Matte
  ctx.fillStyle = '#0D0C0A';
  ctx.fillRect(0, 0, w, h);

  // Precision 1px Hairline Frame
  ctx.strokeStyle = '#30261D';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Top Telemetry Header
  ctx.fillStyle = data.accent;
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillText(data.tag, 36, 52);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#B9AA97';
  ctx.fillText(data.state, w - 36, 52);
  ctx.textAlign = 'left';

  // Rule Divider
  ctx.strokeStyle = 'rgba(48,38,29,0.8)';
  ctx.beginPath();
  ctx.moveTo(36, 68);
  ctx.lineTo(w - 36, 68);
  ctx.stroke();

  // Display Headlines
  ctx.fillStyle = '#FFF9F1';
  ctx.font = '36px "Bodoni Moda", Georgia, serif';
  data.title.forEach((line, i) => {
    ctx.fillText(line, 36, 134 + i * 48);
  });

  // Telemetry Bars
  const startY = 134 + data.title.length * 48 + 24;
  data.bars.forEach((val, i) => {
    ctx.fillStyle = 'rgba(48,38,29,0.7)';
    ctx.fillRect(36, startY + i * 26, w - 72, 8);
    ctx.fillStyle = data.accent;
    ctx.fillRect(36, startY + i * 26, val * (w - 72), 8);
  });

  // Bottom Telemetry Metrics
  ctx.fillStyle = '#B9AA97';
  ctx.font = '500 13px "JetBrains Mono", monospace';
  const metricsStr = data.metrics.join('  //  ');
  ctx.fillText(metricsStr, 36, h - 38);
}

export function renderAllTacticalCards(onComplete) {
  const shotCanvases = [...document.querySelectorAll('canvas[data-shot]')];
  shotCanvases.forEach(c => {
    const idx = parseInt(c.dataset.shot, 10);
    if (EXHIBIT_PREVIEWS[idx]) {
      paintTacticalCard(c, EXHIBIT_PREVIEWS[idx]);
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      shotCanvases.forEach(c => {
        const idx = parseInt(c.dataset.shot, 10);
        if (EXHIBIT_PREVIEWS[idx]) paintTacticalCard(c, EXHIBIT_PREVIEWS[idx]);
      });
      if (onComplete) onComplete();
    }).catch(() => {});
  } else if (onComplete) {
    onComplete();
  }
}
