import '../styles/settings.scss';

import { getMessage } from '../utils/_locale';
import { ModalOptions, showModal } from '../utils/api';
import { showToast } from '../utils/toast';
import { LANGUAGE_NATIVE_NAMES } from '../utils/supportedLanguages';
import {
  AnyDetailOption,
  CheckboxDetailOption,
  DivTextDetailOption,
  SelectDetailOption,
  SettingManager,
  SettingOption,
  Settings, SliderDetailOption
} from '../utils/settingManager';
import * as settingStorage from '../storage/settingStorage';
import * as information from './information';
import * as storageUsage from '../storage/storageUsage';

const settings: Settings = {
  tabs: [
    {
      name: getMessage('settings_tab_general'),
      iconUrl: chrome.runtime.getURL('assets/settings_24dp_E9E5DE.svg'),
      options: [
        {
          id: 'select-language',
          name: getMessage('settings_option_select_language'),
          iconUrl: chrome.runtime.getURL('assets/translate_24dp_E9E5DE.svg'),
          description: getMessage('settings_option_select_language_description'),
          optionDetail: {
            type: 'select',
            options: [
              chrome.i18n.getMessage('settings_option_select_language_default', defaultLanguage()),
              ...Object.values(LANGUAGE_NATIVE_NAMES)
            ],
            selectedIndex: await i18nIndex(),
            onChangeListener: option => {
              console.log('Language changed to:', option.options[option.selectedIndex]);
              if (option.selectedIndex === 0) {
                settingStorage.setLanguage('default').then(() => {
                  showToast(
                    getMessage('settings_option_select_language_default_enabled', defaultLanguage())
                  );
                });
              } else {
                const selectedLanguage = option.options[option.selectedIndex];
                // value -> key
                const languageKey = Object.keys(LANGUAGE_NATIVE_NAMES).find(
                  key =>
                    LANGUAGE_NATIVE_NAMES[key as keyof typeof LANGUAGE_NATIVE_NAMES] ===
                    selectedLanguage
                );

                if (languageKey) {
                  settingStorage.setLanguage(languageKey).then(() => {
                    showToast(
                      getMessage('settings_option_select_language_enabled', selectedLanguage)
                    );
                  });
                } else {
                  showToast(
                    getMessage('settings_option_select_language_invalid', selectedLanguage)
                  );
                }
              }
            }
          } as SelectDetailOption
        },
        {
          id: 'show-guide-again',
          name: getMessage('settings_option_show_guide_again'),
          iconUrl: chrome.runtime.getURL('assets/menu_book_24dp_E9E5DE.svg'),
          optionDetail: {
            type: 'checkbox',
            checked: false,
            onChangeListener: (checked: boolean) => {
              if (!checked) {
                return;
              }
              settingStorage.setButlerGuideShown(false).then(() => {
                showToast(getMessage('settings_option_show_guide_again_enabled'));
              });
            }
          } as CheckboxDetailOption
        }
      ]
    },
    {
      name: getMessage('settings_tab_display'),
      iconUrl: chrome.runtime.getURL('assets/view_sidebar_24dp_E9E5DE.svg'),
      options: [
        {
          id: 'sidebar-opacity',
          name: getMessage('settings_option_sidebar_opacity'),
          iconUrl: chrome.runtime.getURL('assets/opacity_24dp_E9E5DE.svg'),
          description: getMessage('settings_option_sidebar_opacity_description'),
          optionDetail: {
            type: 'slider',
            min: 0.1,
            max: 1.0,
            step: 0.1,
            value: await settingStorage.getSidebarOpacity(),
            valueFormat: (value: number) => `${(value * 100).toFixed(0)}%`,
            onChangeListener: (value: number) => {
              settingStorage.setSidebarOpacity(value).then(() => {
                showToast(getMessage('settings_option_sidebar_opacity_changed', (value * 100).toFixed(0)));
              });
            }
          } as SliderDetailOption
        }
      ]
    },
    {
      name: getMessage('settings_tab_storage'),
      iconUrl: chrome.runtime.getURL('assets/database_24dp_E9E5DE.svg'),
      options: () => generateStorageOptions()
    },
    {
      name: getMessage('settings_tab_info'),
      iconUrl: chrome.runtime.getURL('assets/info_24dp_E9E5DE.svg'),
      options: [
        {
          id: 'info-text',
          name: '',
          optionDetail: {
            type: 'text',
            value: createInformationDiv()
          } as DivTextDetailOption
        }
      ]
    }
  ]
};

export async function attachSettingOnClick(parent: HTMLElement): Promise<void> {
  const img = document.createElement('img');
  const settingIconUrl = chrome.runtime.getURL('assets/settings_24dp_1F1F1F.svg');
  parent.appendChild(img);

  img.className = 'poe2-setting-icon';
  img.src = settingIconUrl;
  img.alt = getMessage('settings');
  Object.assign(img.style, {
    padding: '4px',
    width: '36px',
    height: '36px',
    cursor: 'pointer'
  });

  parent.addEventListener('click', async () => {
    const settingManager = new SettingManager(settings);

    const modalOptions: ModalOptions = {
      title: getMessage('settings'),
      div: await settingManager.generateSettingsDiv(),
      confirm: getMessage('button_save'),
      cancel: getMessage('button_cancel'),
      onConfirmListener: async (): Promise<boolean> => {
        if (settingManager.hasChanges()) {
          settingManager.applyChanges();
          showToast(getMessage('settings_changes_applied'));

          document.location.reload();
        }
        return true;
      },
      onCancelListener: async (): Promise<boolean> => {
        if (settingManager.hasChanges()) {
          const result = confirm(getMessage('settings_changes_discard_confirm'));
          if (!result) {
            return false;
          }
        }
        settingManager.clearApplyQueue();
        return true;
      },
      onOverlayClickListener: async (): Promise<boolean> => {
        if (settingManager.hasChanges()) {
          const result = confirm(getMessage('settings_changes_discard_confirm'));
          if (!result) {
            return false;
          }
        }
        settingManager.clearApplyQueue();
        return true;
      },
      etcButtons: [
        {
          name: getMessage('button_apply'),
          listener: async (): Promise<boolean> => {
            if (settingManager.hasChanges()) {
              settingManager.applyChanges();
              showToast(getMessage('settings_changes_applied'));

              document.location.reload();
            } else {
              showToast(getMessage('settings_no_changes'));
            }
            return false;
          }
        }
      ]
    };

    showModal(modalOptions);
  });
}

function defaultLanguage(): string {
  const language = navigator?.language.replace('-', '_');

  return (
    LANGUAGE_NATIVE_NAMES[language as keyof typeof LANGUAGE_NATIVE_NAMES] ||
    LANGUAGE_NATIVE_NAMES[language?.split('_')[0] as keyof typeof LANGUAGE_NATIVE_NAMES] ||
    LANGUAGE_NATIVE_NAMES.en
  );
}

function createInformationDiv(): HTMLDivElement {
  const infoDiv = document.createElement('div');
  infoDiv.className = 'poe2-settings-option-information';
  information.attachInformationSections(infoDiv);
  return infoDiv;
}

async function i18nIndex(): Promise<number> {
  const language = await settingStorage.getLanguage();
  const index = Object.keys(LANGUAGE_NATIVE_NAMES).indexOf(language);
  return index === -1 ? 0 : index + 1; // +1 because the first option is "default"
}

async function generateStorageOptions(): Promise<SettingOption<AnyDetailOption>[]> {
  const result: SettingOption<AnyDetailOption>[] = [];

  const usageInfo = await storageUsage.usageInfoAll();

  Object.keys(usageInfo).forEach(storageType => {
    const usage = usageInfo[storageType as keyof typeof usageInfo];
    if (usage.totalSize === 0) return;

    result.push(generateStorageOption(storageType, usage));
  });

  return result;
}

function generateStorageOption(
  storageType: string,
  usageInfo: storageUsage.StorageTypeUsage
): SettingOption<AnyDetailOption> {
  const id = `${storageType}-storage`;
  const name = getMessage(`settings_option_storage_${storageType}`);
  return {
    id,
    name: `${name} (${usageInfo.totalSize_f})`,
    description: getMessage(`settings_option_storage_${storageType}_description`),
    iconUrl: chrome.runtime.getURL(`assets/storage_24dp_E9E5DE.svg`),
    optionDetail: {
      type: 'text',
      isExpandable: true,
      value: createStorageDiv(usageInfo)
    }
  };
}

function createStorageDiv(usage: storageUsage.StorageTypeUsage): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'poe2-settings-option-storage-usage';

  const totalSize = usage.totalSize || 1;

  const undefinedDetails = document.createElement('details');
  undefinedDetails.className = 'storage-undefined-details';
  let undefinedTotalSize = 0;

  usage.entities.forEach(entry => {
    const { key, description, size, size_f, isDefined } = entry;
    const percent = Math.min(100, (size / totalSize) * 100);

    const block = document.createElement('div');
    block.className = 'storage-entry';

    const label = document.createElement('div');
    label.className = 'storage-label';
    label.textContent = key;

    if (isDefined) {
      const desc = document.createElement('div');
      desc.className = 'storage-description';
      desc.textContent = `- ${description}`;
      label.appendChild(desc);
    }

    const barContainer = createBarContainer(percent, size_f);

    block.appendChild(label);
    block.appendChild(barContainer);

    if (!isDefined) {
      undefinedDetails.appendChild(block);
      undefinedTotalSize += size;
    } else {
      container.appendChild(block);
    }
  });

  if (undefinedDetails.childElementCount > 0) {
    const undefinedContainer = document.createElement('div');
    undefinedContainer.className = 'storage-undefined-container';

    const undefinedTotalSize_f = storageUsage.formatFileSize(undefinedTotalSize);
    const percent = Math.min(100, (undefinedTotalSize / totalSize) * 100);

    const undefinedSummary = document.createElement('summary');

    const undefinedSummarySpan = document.createElement('span');
    undefinedSummarySpan.className = 'storage-undefined-summary';
    undefinedSummarySpan.textContent = `undefined(legacy) data (${undefinedTotalSize_f} / ${usage.totalSize_f})`;

    const barContainer = createBarContainer(percent, undefinedTotalSize_f);

    undefinedSummary.appendChild(undefinedSummarySpan);
    undefinedSummary.appendChild(barContainer);

    undefinedDetails.appendChild(undefinedSummary);

    undefinedContainer.appendChild(undefinedDetails);

    container.appendChild(undefinedContainer);
  }

  return container;
}

function createBarContainer(percent: number, size_f: string): HTMLDivElement {
  const barContainer = document.createElement('div');
  barContainer.className = 'storage-bar-container';

  const barWrapper = document.createElement('div');
  barWrapper.className = 'storage-bar-wrapper';

  const bar = document.createElement('div');
  bar.className = 'storage-bar';
  bar.style.width = `${percent}%`;

  const sizeText = document.createElement('div');
  sizeText.className = 'storage-size';
  sizeText.textContent = `${size_f} (${percent.toFixed(2)}%)`;

  barWrapper.appendChild(bar);
  barContainer.appendChild(barWrapper);
  barContainer.appendChild(sizeText);

  return barContainer;
}
