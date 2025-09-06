export function showToast(message: string, color = '#fff', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'poe2-toast';
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: color,
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    zIndex: '10000',
    opacity: '0',
    transition: 'opacity 0.3s ease-in-out'
  });

  // 기존 toast가 있으면 위로 올리기
  const existingToasts = document.querySelectorAll('.poe2-toast') as NodeListOf<HTMLDivElement>;
  existingToasts.forEach(el => {
    el.style.bottom = el.style.bottom ? `${parseInt(el.style.bottom) + 50}px` : '80px';
  });

  document.body.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}