import { PreviewPanelSnapshot } from '../storage/previewStorage';
import * as settings from '../storage/settingStorage';
import * as previewStorage from '../storage/previewStorage';
import { getMessage } from './_locale';

export class TradePreviewer {
  private static readonly PREVIEW_PANEL_ID = 'trade-preview-panel';
  private static _previewPanel: HTMLDivElement | null = null;

  public static async waitWhileCurrentPanelExists(
    count: number = 20,
    interval: number = 100
  ): Promise<void> {
    while (count-- > 0) {
      if (TradePreviewer.currentPanel) return;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(getMessage('error_trade_preview_panel_not_found'));
  }

  public static async extractCurrentPanel(): Promise<PreviewPanelSnapshot> {
    await TradePreviewer.waitUntilSearchButtonEnabled();

    const panel = TradePreviewer.currentPanel;
    if (!panel) {
      console.error(getMessage('error_trade_preview_not_found'));
      throw new Error(getMessage('error_trade_preview_not_found'));
    }

    const isCollapsed = TradePreviewer.isPanelCollapsed();
    await TradePreviewer.expandPanel();
    const searchLeft = TradePreviewer.currentSearchLeftValue;

    const panelClone = panel.cloneNode(true) as HTMLElement;
    panelClone.querySelectorAll('.multiselect__content-wrapper').forEach(el => el.remove());
    const outerHTML = panelClone.outerHTML;

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

  public static addHoverEventListener(
    target: HTMLElement,
    id: string,
    previewStoragePromise: Promise<Record<string, PreviewPanelSnapshot>>,
    appendPreviewIconTarget?: HTMLElement
  ): void {
    settings.getPreviewOverlayEnabled()
      .then(enabled => {
        if (!enabled) return;

        TradePreviewer.waitWhileCurrentPanelExists()
          .then(() => {
            const previewPromise = previewStorage.getById(id, previewStoragePromise);

            target.addEventListener('mouseenter', () => {
              target.classList.add('hovered');
              previewPromise.then(previewInfo => {
                if (!previewInfo) return;
                TradePreviewer.showAsPreviewPanel(previewInfo);
              });
            });

            target.addEventListener('mouseleave', () => {
              target.classList.remove('hovered');
              TradePreviewer.hidePreviewPanel();
            });

            // currentPanel에 마우스가 들어오면 미리보기 제거
            // TradePreviewer.currentPanel?.addEventListener('mouseenter', () => {
            document
              .querySelector('div#poe2-content-wrapper div.wrapper')
              ?.addEventListener('mouseenter', () => {
                target.classList.remove('hovered');
                TradePreviewer.hidePreviewPanel();
              });

            previewPromise.then(previewInfo => {
              if (!appendPreviewIconTarget) return;
              const icon = document.createElement('span');
              icon.className = 'preview-icon';
              icon.textContent = '🔍';
              icon.style.marginLeft = '1px';
              icon.style.fontSize = '0.8em';
              icon.style.verticalAlign = 'middle';
              if (!previewInfo) {
                icon.style.opacity = '0.1';
                icon.style.color = 'gray';
              }

              appendPreviewIconTarget.insertAdjacentElement('afterend', icon);
            });
          })
          .catch(error => {
            console.debug(getMessage('error_wait_for_injector', error.toString()));
          });
      }
    )

  }

  private static showAsPreviewPanel(snapshot: PreviewPanelSnapshot): void {
    TradePreviewer.hideCurrentPanel();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = snapshot.outerHTML;
    const panel = wrapper.firstElementChild as HTMLDivElement;

    if (!panel) {
      console.error(getMessage('error_invalid_panel_html'));
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
      console.error(getMessage('error_insert_preview_panel'));
      return;
    }

    TradePreviewer._previewPanel = panel;
    TradePreviewer.previewPanelSearchLeftValue = snapshot.searchKeyword;
  }

  public static hidePreviewPanel(): void {
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

  private static async waitUntilSearchButtonEnabled(
    retry: number = 20,
    delay: number = 100
  ): Promise<void> {
    for (let i = 0; i < retry; i++) {
      const button = TradePreviewer.currentPanel?.querySelector<HTMLButtonElement>('.search-btn');
      if (button && !button.disabled) return;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(getMessage('error_search_button_not_enabled'));
  }

  private static isPanelCollapsed(): boolean {
    const btn = TradePreviewer.currentPanel?.querySelector('.controls .toggle-search-btn');
    return btn?.querySelector('.chevron')?.classList.contains('collapsed') ?? false;
  }

  public static async expandPanel(): Promise<void> {
    const btn = TradePreviewer.currentPanel?.querySelector(
      '.controls .toggle-search-btn'
    ) as HTMLButtonElement | null;
    if (btn && TradePreviewer.isPanelCollapsed()) {
      btn.click();
      await TradePreviewer.waitUntilAdvancedVisible();
    }
  }

  private static async waitUntilAdvancedVisible(
    retry: number = 20,
    delay: number = 100
  ): Promise<void> {
    for (let i = 0; i < retry; i++) {
      const advanced = TradePreviewer.currentPanel?.querySelector('.search-bar.search-advanced');

      if (advanced && !advanced.classList.contains('search-advanced-hidden')) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(getMessage('error_advanced_panel_not_expanded'));
  }

  private static collapsePanel(): void {
    const btn = TradePreviewer.currentPanel?.querySelector(
      '.controls .toggle-search-btn'
    ) as HTMLButtonElement | null;
    if (btn && !TradePreviewer.isPanelCollapsed()) {
      btn.click();
    }
  }

  private static get currentPanel(): HTMLDivElement | null {
    return document.querySelector('#trade .search-panel');
  }

  private static get currentSearchLeftValue(): string {
    const searchLeft = this.currentPanel?.querySelector(
      '.search-bar .search-left input'
    ) as HTMLInputElement | null;
    return searchLeft ? searchLeft.value.trim() : '';
  }

  private static get previewPanel(): HTMLDivElement | null {
    if (this._previewPanel) {
      return this._previewPanel;
    }
    return document.querySelector(`#${this.PREVIEW_PANEL_ID}`) as HTMLDivElement | null;
  }

  private static set previewPanelSearchLeftValue(value: string) {
    const searchLeft = this.previewPanel?.querySelector(
      '.search-bar .search-left input'
    ) as HTMLInputElement | null;
    if (!searchLeft) {
      console.error(getMessage('error_search_input_not_found'));
      return;
    }
    searchLeft.value = value;
  }
}
