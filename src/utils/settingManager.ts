export interface Settings {
  tabs: SettingTab[];
}

interface SettingTab {
  name: string;
  iconUrl: string;
  options: SettingOption<AnyDetailOption>[] | (() => SettingOption<AnyDetailOption>[]) | (() => Promise<SettingOption<AnyDetailOption>[]>);
}


export interface SettingOption<T extends AnyDetailOption> {
  id: string;
  name: string;
  iconUrl?: string;
  description?: string;
  optionDetail: T;
}

export type AnyDetailOption =
  CheckboxDetailOption
  | SelectDetailOption
  | DivTextDetailOption
  | NumberDetailOption
  | SwitchDetailOption;

interface DetailOption<T> {
  type: 'checkbox' | 'select' | 'text' | 'number' | 'switch';
  onChangeListener?: onOptionChangeListener<T>;
}

export interface CheckboxDetailOption extends DetailOption<boolean> {
  type: 'checkbox';
  checked: boolean;
  onChangeListener: onOptionChangeListener<boolean>;
}

export interface SelectDetailOption extends DetailOption<SelectEntity> {
  type: 'select';
  options: string[];
  selectedIndex: number;
  onChangeListener: onOptionChangeListener<SelectEntity>;
}

interface SelectEntity {
  options: string[];
  selectedIndex: number;
}

// just for description, no listener
export interface DivTextDetailOption extends DetailOption<void> {
  type: 'text';
  value: HTMLDivElement | string;
}

export interface NumberDetailOption extends DetailOption<number> {
  type: 'number';
  value: number;
  min?: number;
  max?: number;
  onChangeListener: onOptionChangeListener<number>;
}

export interface SwitchDetailOption extends DetailOption<boolean> {
  type: 'switch';
  checked: boolean;
  onChangeListener: onOptionChangeListener<boolean>;
}

export interface onOptionChangeListener<T> {
  (selected: T): void;
}

export class SettingManager {
  private applyChangedQueue: (Record<string, () => void>) = {};
  private readonly settings: Settings;

  public constructor(settings: Settings) {
    this.settings = settings;
  }

  public async generateSettingsDiv(): Promise<HTMLDivElement> {
    const settingsDiv = document.createElement('div');
    settingsDiv.className = 'poe2-settings';

    // left: Tab List Area
    const tabListDiv = document.createElement('div');
    tabListDiv.className = 'poe2-settings-tab-list';

    // right: Content Area
    const contentDiv = document.createElement('div');
    contentDiv.className = 'poe2-settings-content';

    // Map to hold tab content elements
    const tabOptionsMap = new Map<string, HTMLElement>();

    if (this.settings.tabs.length === 0) return settingsDiv;

    this.createTab(tabListDiv, contentDiv, tabOptionsMap);
    await this.createContent(contentDiv, tabOptionsMap);

    settingsDiv.appendChild(tabListDiv);
    settingsDiv.appendChild(contentDiv);

    return settingsDiv;
  }


  private async createContent(contentDiv: HTMLDivElement, tabOptionsMap: Map<string, HTMLElement>) {
    for (const tab of this.settings.tabs) {
      const idx = this.settings.tabs.indexOf(tab);
      const tabContent = document.createElement('div');
      tabContent.className = 'poe2-settings-content-tab';
      if (idx !== 0) tabContent.style.display = 'none'; // 첫 탭만 보이게

      const titleBar = this.createContentTitle(tab);
      const optionsDiv = await this.createOptions(tab);

      tabContent.appendChild(titleBar);
      tabContent.appendChild(optionsDiv);
      contentDiv.appendChild(tabContent);
      tabOptionsMap.set(tab.name, tabContent);
    }
  }

  // 탭 제목 "-----일반------------------------" 이런 스타일의 제목을 추가
  private createContentTitle(tab: SettingTab) {
    const titleBar = document.createElement('div');
    titleBar.className = 'poe2-settings-content-title-bar';
    const tileDividerLeft = document.createElement('span');
    tileDividerLeft.className = 'poe2-settings-content-title-divider left';
    const titleText = document.createElement('span');
    titleText.className = 'poe2-settings-content-title-text';
    titleText.textContent = tab.name;
    const tileDividerRight = document.createElement('span');
    tileDividerRight.className = 'poe2-settings-content-title-divider right';

    titleBar.appendChild(tileDividerLeft);
    titleBar.appendChild(titleText);
    titleBar.appendChild(tileDividerRight);
    return titleBar;
  }

  private async createOptions(tab: SettingTab): Promise<HTMLDivElement> {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'poe2-settings-options';

    const rawOptions = typeof tab.options === 'function' ? tab.options() : tab.options;
    const options = rawOptions instanceof Promise ? await rawOptions : rawOptions;

    options.forEach(option => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'poe2-settings-option';

      // 아이콘 렌더링
      if (option.iconUrl) {
        const icon = document.createElement('img');
        icon.src = option.iconUrl;
        icon.className = 'poe2-settings-option-icon';
        optionDiv.appendChild(icon);
      }

      const label = document.createElement('label');
      label.textContent = option.name;
      label.className = 'poe2-settings-option-label';
      optionDiv.appendChild(label);

      // input 렌더링 (switch, checkbox, select)
      let optionElement: HTMLElement;
      switch (option.optionDetail.type) {
        case 'checkbox': {
          const opt = option.optionDetail;
          optionElement = document.createElement('input');
          (optionElement as HTMLInputElement).type = 'checkbox';
          (optionElement as HTMLInputElement).checked = opt.checked;
          optionElement.onchange = () => {
            this.addToApplyQueue(option, () => {
              if (option.optionDetail.onChangeListener) {
                opt.onChangeListener((optionElement as HTMLInputElement).checked);
              }
            });
          };
          break;
        }
        case 'select': {
          const selectOpt = option.optionDetail;
          optionElement = document.createElement('select');
          selectOpt.options.forEach(optStr => {
            const optElem = document.createElement('option');
            optElem.textContent = optStr;
            (optionElement as HTMLSelectElement).appendChild(optElem);
          });
          (optionElement as HTMLSelectElement).selectedIndex = selectOpt.selectedIndex || 0;
          optionElement.onchange = () => {
            this.addToApplyQueue(option, () => {
              if (option.optionDetail.onChangeListener) {
                selectOpt.onChangeListener({
                  options: selectOpt.options,
                  selectedIndex: (optionElement as HTMLSelectElement).selectedIndex
                });
              }
            });
          };
          break;
        }
        case 'switch': {
          const switchOpt = option.optionDetail;
          // 커스텀 스위치 (label > input[type=checkbox] + span)
          const switchLabel = document.createElement('label');
          switchLabel.className = 'poe2-settings-option-switch';
          switchLabel.innerHTML = `
            <input type="checkbox" class="poe2-settings-switch-input" ${switchOpt.checked ? 'checked' : ''}>
            <span class="poe2-settings-switch-slider"></span>
          `;
          const switchInput = switchLabel.querySelector('input[type=checkbox]') as HTMLInputElement;
          if (switchInput) {
            switchInput.onchange = () => {
              this.addToApplyQueue(option, () => {
                if (option.optionDetail.onChangeListener) {
                  switchOpt.onChangeListener(switchInput.checked);
                }
              });
            };
          }
          optionElement = switchLabel;
          break;
        }
        case 'text': {
          const textOpt = option.optionDetail;

          optionElement = document.createElement('div');
          optionElement.className = 'poe2-settings-option-text';
          if (textOpt.value instanceof HTMLDivElement) {
            optionElement.appendChild(textOpt.value);
          } else {
            optionElement.textContent = textOpt.value as string;
          }
          break;
        }
        default:
          throw new Error(`Unsupported option type: ${option.optionDetail.type}`);
      }
      optionElement.className = `poe2-settings-option-${option.optionDetail.type}`;
      if (option.description) {
        const description = document.createElement('p');
        description.textContent = option.description;
        description.className = 'poe2-settings-option-description';
        optionDiv.appendChild(description);
      }
      optionDiv.appendChild(optionElement);
      optionsDiv.appendChild(optionDiv);
    });

    return optionsDiv;
  }

  private createTab(tabListDiv: HTMLDivElement, contentDiv: HTMLDivElement, tabOptionsMap: Map<string, HTMLElement>) {
    this.settings.tabs.forEach((tab, idx) => {
      const tabBtn = document.createElement('button');
      tabBtn.className = 'poe2-settings-tab-btn' + (idx === 0 ? ' active' : '');
      if (tab.iconUrl) {
        const icon = document.createElement('img');
        icon.src = tab.iconUrl;
        icon.className = 'poe2-settings-tab-icon';
        tabBtn.appendChild(icon);
      }
      //tab.name
      const tabName = document.createElement('span');
      tabName.textContent = tab.name;
      tabName.className = 'poe2-settings-tab-name';
      tabBtn.appendChild(tabName);

      tabBtn.type = 'button';
      tabBtn.onclick = () => {
        // 탭 버튼 active 갱신
        Array.from(tabListDiv.children).forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        // 컨텐츠 전환
        Array.from(contentDiv.children).forEach(el => (el as HTMLElement).style.display = 'none');
        const thisContent = tabOptionsMap.get(tab.name);
        if (thisContent) thisContent.style.display = '';
      };
      tabListDiv.appendChild(tabBtn);
    });
  }

  public applyChanges(): void {
    Object.values(this.applyChangedQueue).forEach(callback => callback());
    this.applyChangedQueue = {};
  }

  public hasChanges(): boolean {
    return Object.keys(this.applyChangedQueue).length > 0;
  }

  public addToApplyQueue(option: SettingOption<AnyDetailOption>, callback: () => void): void {
    this.applyChangedQueue[option.id] = callback;
  }

  public clearApplyQueue(): void {
    this.applyChangedQueue = {};
  }
}

