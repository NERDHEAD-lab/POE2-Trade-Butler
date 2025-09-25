class LoadingOverlay {
  private readonly overlay: HTMLDivElement;

  constructor(parent: HTMLElement = document.body) {
    const overlay = document.createElement('div');
    overlay.className = 'poe2-loading-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: '10002',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    })

    const spinner = document.createElement('div');
    spinner.className = 'poe2-spinner';
    Object.assign(spinner.style, {
      width: '80px',
      height: '80px',
      border: '12px solid #f3f3f3',
      borderTop: '12px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    });

    overlay.appendChild(spinner);
    this.overlay = overlay;
    this.hide();

    parent.appendChild(overlay);
  }

  show() {
    this.overlay.style.display = 'flex';
  }

  hide() {
    this.overlay.style.display = 'none';
  }
}

export { LoadingOverlay };