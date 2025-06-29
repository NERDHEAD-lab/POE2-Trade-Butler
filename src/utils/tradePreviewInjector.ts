export interface PreviewPanelSnapshot {
  searchKeyword: string;
  outerHTML: string;
  attributes: { [key: string]: string };
  timestamp: number;
}

export class TradePreviewer {
  private static readonly PREVIEW_PANEL_ID = 'trade-preview-panel';
  private static _previewPanel: HTMLDivElement | null = null;

  public static async waitWhileCurrentPanelExists(count: number = 20, interval: number = 100): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Skipping waitWhileCurrentPanelExists in development mode');
    }

    while (count-- > 0) {
      if (TradePreviewer.currentPanel) return;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Trade preview panel not found');
  }

  public static async extractCurrentPanel(): Promise<PreviewPanelSnapshot> {
    const panel = TradePreviewer.currentPanel;
    if (!panel) {
      console.error('Trade preview element not found. Make sure you are on the trade page.');
      throw new Error('Trade preview element not found');
    }

    await TradePreviewer.waitUntilSearchButtonEnabled();

    const isCollapsed = TradePreviewer.isPanelCollapsed();
    await TradePreviewer.expandPanel();
    const searchLeft = TradePreviewer.currentSearchLeftValue;
    const outerHTML = panel.outerHTML;
    if (isCollapsed) {
      TradePreviewer.collapsePanel();
    }

    const attributes: { [key: string]: string } = {};
    Array.from(panel.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });

    return {
      searchKeyword: searchLeft,
      outerHTML: outerHTML,
      attributes,
      timestamp: Date.now()
    };
  }

  public static showAsPreviewPanel(snapshot: PreviewPanelSnapshot): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Skipping showPreviewPanel in development mode');
      return;
    }

    TradePreviewer.hideCurrentPanel();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = snapshot.outerHTML;
    const panel = wrapper.firstElementChild as HTMLDivElement;

    if (!panel) {
      console.error('Invalid panel HTML');
      return;
    }

    for (const [key, value] of Object.entries(snapshot.attributes)) {
      panel.setAttribute(key, value);
    }

    panel.id = TradePreviewer.PREVIEW_PANEL_ID;
    panel.style.display = '';

    const current = TradePreviewer.currentPanel;
    const existing = TradePreviewer._previewPanel;

    if (existing && existing.parentElement) {
      existing.replaceWith(panel);
    } else if (current && current.parentElement) {
      current.parentElement.insertBefore(panel, current.nextElementSibling);
    } else {
      console.error('Failed to insert preview panel next to currentPanel');
      return;
    }

    TradePreviewer._previewPanel = panel;
    TradePreviewer.previewPanelSearchLeftValue = snapshot.searchKeyword;
  }

  public static hidePreviewPanel(): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Skipping hidePreviewPanel in development mode');
      return;
    }

    TradePreviewer.showCurrentPanel();

    if (TradePreviewer._previewPanel && TradePreviewer._previewPanel.parentElement) {
      TradePreviewer._previewPanel.remove();
      TradePreviewer._previewPanel = null;
    }
  }

  private static hideCurrentPanel(): void {
    const panel = TradePreviewer.currentPanel;
    if (panel) {
      panel.style.display = 'none';
    }
  }

  private static showCurrentPanel(): void {
    const panel = TradePreviewer.currentPanel;
    if (panel) {
      panel.style.display = '';
    }
  }

  private static async waitUntilSearchButtonEnabled(retry: number = 20, delay: number = 100): Promise<void> {
    for (let i = 0; i < retry; i++) {
      const button = TradePreviewer.currentPanel?.querySelector<HTMLButtonElement>('.search-btn');
      if (button && !button.disabled) return;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error('Search button did not become enabled in time');
  }

  public static isPanelCollapsed(): boolean {
    const btn = TradePreviewer.currentPanel?.querySelector('.controls .toggle-search-btn');
    return btn?.querySelector('.chevron')?.classList.contains('collapsed') ?? false;
  }

  public static async expandPanel(): Promise<void> {
    const btn = TradePreviewer.currentPanel?.querySelector('.controls .toggle-search-btn') as HTMLButtonElement | null;
    if (btn && TradePreviewer.isPanelCollapsed()) {
      btn.click();
      await TradePreviewer.waitUntilAdvancedVisible();
    }
  }

  private static async waitUntilAdvancedVisible(retry: number = 20, delay: number = 100): Promise<void> {
    for (let i = 0; i < retry; i++) {
      const advanced = TradePreviewer.currentPanel?.querySelector('.search-bar.search-advanced');

      if (advanced && !advanced.classList.contains('search-advanced-hidden')) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error('Advanced panel did not expand in time');
  }


  public static collapsePanel(): void {
    const btn = TradePreviewer.currentPanel?.querySelector('.controls .toggle-search-btn') as HTMLButtonElement | null;
    if (btn && !TradePreviewer.isPanelCollapsed()) {
      btn.click();
    }
  }

  private static get currentPanel(): HTMLDivElement | null {
    return document.querySelector('#trade .search-panel');
  }

  private static get currentSearchLeftValue(): string {
    const searchLeft = this.currentPanel?.querySelector('.search-bar .search-left input') as HTMLInputElement | null;
    return searchLeft ? searchLeft.value.trim() : '';
  }

  private static get previewPanel(): HTMLDivElement | null {
    if (this._previewPanel) {
      return this._previewPanel;
    }
    return document.querySelector(`#${this.PREVIEW_PANEL_ID}`) as HTMLDivElement | null;
  }

  private static set previewPanelSearchLeftValue(value: string) {
    const searchLeft = this.previewPanel?.querySelector('.search-bar .search-left input') as HTMLInputElement | null;
    if (!searchLeft) {
      console.error('Search left input not found. Cannot set search value.');
      return;
    }
    searchLeft.value = value;
  }
}
