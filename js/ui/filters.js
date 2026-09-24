/**
 * Capability Bay Interactive Domain Filter Controller
 */

export function setupCapabilityFilters() {
  const filterBtns = document.querySelectorAll('.cap-filter');
  const caps = document.querySelectorAll('.cap');
  const certCards = document.querySelectorAll('.cert-card');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const domain = btn.dataset.domain;

      caps.forEach(cap => {
        if (domain === 'all' || (cap.dataset.domain && cap.dataset.domain.includes(domain))) {
          cap.classList.remove('dimmed');
          cap.classList.add('highlighted');
        } else {
          cap.classList.add('dimmed');
          cap.classList.remove('highlighted');
        }
      });

      certCards.forEach(card => {
        if (domain === 'all' || (card.dataset.domain && card.dataset.domain.includes(domain))) {
          card.classList.remove('dimmed');
          card.classList.add('highlighted');
        } else {
          card.classList.add('dimmed');
          card.classList.remove('highlighted');
        }
      });
    });
  });
}
