/**
 * Clipboard & Toast Feedback Controller
 */

export function setupClipboard() {
  let toastEl = document.getElementById('toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }

  let hideTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  const mailCards = document.querySelectorAll('a[href^="mailto:"]');
  mailCards.forEach(card => {
    card.addEventListener('click', e => {
      const email = 'yogeshwaranmuthuraman56@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showToast(`✓ Copied ${email} to clipboard!`);
        }).catch(() => {
          showToast(`Direct email: ${email}`);
        });
      }
    });
  });

  return { showToast };
}
