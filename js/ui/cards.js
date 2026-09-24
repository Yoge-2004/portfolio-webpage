/**
 * 2D Tactical Exhibit Canvas Card Renderers
 */
import { EXHIBIT_PREVIEWS } from '../core/config.js';

export function paintTacticalCard(canvas, data) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // 1. Futuristic Deep Obsidian Backdrop with Radial Glow
  const bgGrad = ctx.createRadialGradient(w * 0.4, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.7);
  bgGrad.addColorStop(0, '#101626');
  bgGrad.addColorStop(0.6, '#0b0f19');
  bgGrad.addColorStop(1, '#06080d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. High-Tech Background Coordinate Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSpacing = 36;
  for (let x = 20; x < w - 20; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, h - 20);
    ctx.stroke();
  }
  for (let y = 20; y < h - 20; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
  }

  // 3. Precision Perimeter Hairline Frame & Chamfered Reticles
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  // Corner Brackets
  ctx.strokeStyle = data.accent || '#f59e0b';
  ctx.lineWidth = 2.5;
  const cLen = 22;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(20, 20 + cLen);
  ctx.lineTo(20, 20);
  ctx.lineTo(20 + cLen, 20);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - 20 - cLen, 20);
  ctx.lineTo(w - 20, 20);
  ctx.lineTo(w - 20, 20 + cLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(20, h - 20 - cLen);
  ctx.lineTo(20, h - 20);
  ctx.lineTo(20 + cLen, h - 20);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - 20 - cLen, h - 20);
  ctx.lineTo(w - 20, h - 20);
  ctx.lineTo(w - 20, h - 20 - cLen);
  ctx.stroke();

  // 4. Telemetry Header
  ctx.fillStyle = data.accent || '#f59e0b';
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillText(data.tag, 42, 54);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillText(data.state, w - 42, 54);
  ctx.textAlign = 'left';

  // Luminous Header Rule Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(42, 70);
  ctx.lineTo(w - 42, 70);
  ctx.stroke();

  // 5. Display Headlines
  ctx.fillStyle = '#ffffff';
  ctx.font = '38px "Bodoni Moda", Georgia, serif';
  data.title.forEach((line, i) => {
    ctx.fillText(line, 42, 142 + i * 50);
  });

  // 6. Radiant Telemetry Progress Bars
  const startY = 142 + data.title.length * 50 + 26;
  data.bars.forEach((val, i) => {
    const barY = startY + i * 30;
    const barW = w - 84;
    // Track
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(42, barY, barW, 9);
    // Fill Gradient
    const fillGrad = ctx.createLinearGradient(42, barY, 42 + val * barW, barY);
    fillGrad.addColorStop(0, '#f59e0b');
    fillGrad.addColorStop(1, data.accent || '#06b6d4');
    ctx.fillStyle = fillGrad;
    ctx.fillRect(42, barY, val * barW, 9);
  });

  // 7. Bottom Telemetry Status Pill
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 13px "JetBrains Mono", monospace';
  const metricsStr = data.metrics.join('   //   ');
  ctx.fillText(metricsStr, 42, h - 42);
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
