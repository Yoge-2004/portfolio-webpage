/**
 * Interactive ICISD'26 Fraud Detection Architecture Simulator
 * Allows visitors to test adversarial scams vs authentic job postings
 * and view live hybrid neuro-symbolic telemetry.
 */

const PRESETS = {
  scam: {
    text: '"URGENT: Entry-Level Remote Data Verification Assistant. Earn $4,500/week! No technical interview or previous experience needed. Telegram @fast_onboard_support to receive your home-office equipment check immediately."',
    distilbert: '99.4%',
    distilbertVal: 99.4,
    isoScore: '0.982',
    isoVal: 98.2,
    flagged: true,
    title: '🚨 HIGH-RISK RECRUITMENT PHISHING DETECTED',
    desc: 'Contextual embeddings matched known fraud clusters (unrealistic compensation, off-platform messaging). Isolation Forest mapped posting into extreme outlier distribution.'
  },
  legit: {
    text: '"Junior Software Engineer (Applied ML / Full-Stack) — Tech Stack: Python, FastAPI, Java Spring Boot, MySQL. 3-round technical assessment, competitive benefits, on-site Chennai office."',
    distilbert: '99.8%',
    distilbertVal: 99.8,
    isoScore: '0.038',
    isoVal: 3.8,
    flagged: false,
    title: '✓ VERIFIED AUTHENTIC OPPORTUNITY',
    desc: 'Contextual semantic vectors align with legitimate engineering benchmarks. Isolation Forest verified multi-dimensional features conform to authentic enterprise distributions.'
  }
};

export function setupResearchSimulator(onPresetChange) {
  const container = document.getElementById('researchSim');
  if (!container) return;

  const tabs = container.querySelectorAll('.sim-tab');
  const preview = container.querySelector('#simPreview');
  const dbertEl = container.querySelector('#simDbert');
  const dbertBar = container.querySelector('#simDbertBar');
  const isoEl = container.querySelector('#simIso');
  const isoBar = container.querySelector('#simIsoBar');
  const verdict = container.querySelector('#simVerdict');
  const verdictTitle = container.querySelector('#verdictTitle');
  const verdictDesc = container.querySelector('#verdictDesc');

  function applyPreset(key) {
    const data = PRESETS[key];
    if (!data) return;

    tabs.forEach(t => {
      const isTarget = t.dataset.preset === key;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    if (preview) preview.textContent = data.text;
    if (dbertEl) dbertEl.textContent = data.distilbert;
    if (dbertBar) {
      dbertBar.style.width = `${data.distilbertVal}%`;
      dbertBar.className = `meter-fill ${data.flagged ? 'scam' : 'legit'}`;
    }
    if (isoEl) isoEl.textContent = data.isoScore;
    if (isoBar) {
      isoBar.style.width = `${data.isoVal}%`;
      isoBar.className = `meter-fill ${data.flagged ? 'scam' : 'legit'}`;
    }

    if (verdict) {
      verdict.className = `sim-verdict ${data.flagged ? 'flagged' : 'verified'}`;
    }
    if (verdictTitle) verdictTitle.textContent = data.title;
    if (verdictDesc) verdictDesc.textContent = data.desc;

    if (typeof onPresetChange === 'function') {
      onPresetChange(data);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.preset;
      applyPreset(key);
    });
  });
}
