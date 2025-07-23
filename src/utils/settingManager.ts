export interface Settings {
  tabs: SettingTab[];
}

interface SettingTab {
  name: string;
  iconUrl: string;
  options: SettingOption<AnyOption>[];
}

interface SettingOption<T extends AnyOption> {
  name: string;
  description?: string;
  option: T;
}

type AnyOption = CheckboxOption | SelectOption | TextOption | NumberOption | SwitchOption;

interface Option<T> {
  id: string;
  iconUrl?: string;
  type: 'checkbox' | 'select' | 'text' | 'number' | 'switch';
  onChangeListener?: onOptionChangeListener<T>;
}

export interface CheckboxOption extends Option<boolean> {
  type: 'checkbox';
  checked: boolean;
  onChangeListener: onOptionChangeListener<boolean>;
}

export interface SelectOption extends Option<SelectEntity> {
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
export interface TextOption extends Option<void> {
  type: 'text';
  value: string;
}

export interface NumberOption extends Option<number> {
  type: 'number';
  value: number;
  min?: number;
  max?: number;
  onChangeListener: onOptionChangeListener<number>;
}

export interface SwitchOption extends Option<boolean> {
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

  public generateSettingsDiv(): HTMLDivElement {
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
    this.createContent(contentDiv, tabOptionsMap);

    settingsDiv.appendChild(tabListDiv);
    settingsDiv.appendChild(contentDiv);

    return settingsDiv;
  }


  private createContent(contentDiv: HTMLDivElement, tabOptionsMap: Map<string, HTMLElement>) {
    this.settings.tabs.forEach((tab, idx) => {
      const tabContent = document.createElement('div');
      tabContent.className = 'poe2-settings-content-tab';
      if (idx !== 0) tabContent.style.display = 'none'; // 첫 탭만 보이게

      const optionsDiv = this.createOptions(tab);

      tabContent.appendChild(optionsDiv);
      contentDiv.appendChild(tabContent);
      tabOptionsMap.set(tab.name, tabContent);
    });
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

  private createOptions(tab: SettingTab): HTMLDivElement {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'poe2-settings-options';

    tab.options.forEach(option => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'poe2-settings-option';

      // 아이콘 렌더링
      if (option.option.iconUrl) {
        const icon = document.createElement('img');
        icon.src = option.option.iconUrl;
        icon.className = 'poe2-settings-option-icon';
        optionDiv.appendChild(icon);
      }

      const label = document.createElement('label');
      label.textContent = option.name;
      label.className = 'poe2-settings-option-label';
      optionDiv.appendChild(label);

      // input 렌더링 (switch, checkbox, select)
      let input: HTMLInputElement | HTMLSelectElement | HTMLLabelElement;
      switch (option.option.type) {
        case 'checkbox': {
          const opt = option.option;
          input = document.createElement('input');
          input.type = 'checkbox';
          (input as HTMLInputElement).checked = opt.checked;
          input.onchange = () => {
            this.addToApplyQueue(option.option, () => {
              if (option.option.onChangeListener) {
                opt.onChangeListener((input as HTMLInputElement).checked);
              }
            });
          };
          break;
        }
        case 'select': {
          const selectOpt = option.option;
          input = document.createElement('select');
          selectOpt.options.forEach(optStr => {
            const optElem = document.createElement('option');
            optElem.textContent = optStr;
            (input as HTMLSelectElement).appendChild(optElem);
          });
          (input as HTMLSelectElement).selectedIndex = selectOpt.selectedIndex || 0;
          input.onchange = () => {
            this.addToApplyQueue(option.option, () => {
              if (option.option.onChangeListener) {
                selectOpt.onChangeListener({
                  options: selectOpt.options,
                  selectedIndex: (input as HTMLSelectElement).selectedIndex
                });
              }
            });
          };
          break;
        }
        case 'switch': {
          const switchOpt = option.option;
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
              this.addToApplyQueue(option.option, () => {
                if (option.option.onChangeListener) {
                  switchOpt.onChangeListener(switchInput.checked);
                }
              });
            };
          }
          input = switchLabel;
          break;
        }
        default:
          throw new Error(`Unsupported option type: ${option.option.type}`);
      }
      input.className = `poe2-settings-option-${option.option.type}`;
      optionDiv.appendChild(input);
      if (option.description) {
        const description = document.createElement('p');
        description.textContent = option.description;
        description.className = 'poe2-settings-option-description';
        optionDiv.appendChild(description);
      }
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

  public addToApplyQueue(option: AnyOption, callback: () => void): void {
    this.applyChangedQueue[option.id] = callback;
  }

  public clearApplyQueue(): void {
    this.applyChangedQueue = {};
  }
}

