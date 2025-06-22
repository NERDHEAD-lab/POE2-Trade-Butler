interface AdvancedFilterInfo_Blue {
  expanded: boolean;
  name: string;
  inputs: string[];
}

interface AdvancedFilterInfo_Brown {
  expanded: boolean;
  name: string;
  inputs: string[];
}

export interface tradePreviewData {
  searchLeft: string;
  advancedFilterInfo_Blue: AdvancedFilterInfo_Blue[];
  advancedFilterInfo_Brown: AdvancedFilterInfo_Brown[];
}

/**
 * 마우스 오버 시 trade 페이지 좌측 상단의 .top 영역에 프리뷰 표시
 * 오버에서 마우스가 벗어나면 프리뷰 제거
 * @param history SearchHistoryEntity
 */
export class TradePreviewInjector {
  private backupPanel: HTMLDivElement | null = null;

  private get currentPanel(): HTMLDivElement {
    return TradePreviewInjector.currentPanel;
  }

  private static get currentPanel(): HTMLDivElement {
    return document.querySelector('#trade .search-panel') as HTMLDivElement;
  }

  constructor() {
    if (!this.currentPanel) {
      console.error('Trade preview element not found. Make sure you are on the trade page.');
      throw new Error('Trade preview element not found');
    }
  }

  public static waitWhileCurrentPanelExists(count: number = 20, interval: number = 100): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      return Promise.reject('Skipping waitWhileCurrentPanelExists in development mode');
    }

    //search-panel이 존재 할 때 까지 대기
    return new Promise((resolve, reject) => {
      const checkPanel = () => {
        const panel = TradePreviewInjector.currentPanel;
        if (panel || count <= 0) {
          if (panel) {
            console.info('Trade preview panel is now available.');
            resolve();
          } else {
            console.warn('Trade preview panel not found after waiting.');
            reject(new Error('Trade preview panel not found'));
          }
        } else {
          count--;
          setTimeout(checkPanel, interval);
        }
      };
      checkPanel();
    });
  }

  public static extractTradePreviewData(): tradePreviewData {
    console.log('Extracting trade preview data...');
    return {
      searchLeft: this.getSearchLeftValue(),
      advancedFilterInfo_Blue: this.getAdvancedFilterInfo_Blue(),
      // advancedFilterInfo_Brown: this.getAdvancedFilterInfo_Brown()
      advancedFilterInfo_Brown: [] // 현재는 브라운 필터 정보는 사용하지 않음
    };
  }

  public applyTradePreviewData(data: tradePreviewData): void {
    this.backupTradePreviewPanel();

    console.log('Applying trade preview data:', data);
    this.showTradePreviewPanelWhenClosed();

    // 검색어 설정
    this.setSearchLeftValue(data.searchLeft);

    // 블루 필터 정보 설정
    this.setAdvancedFilterInfo_Blue(data.advancedFilterInfo_Blue);

    // 브라운 필터 정보 설정 (현재는 사용하지 않음)
    // this.setAdvancedFilterInfo_Brown(data.advancedFilterInfo_Brown);
  }

  private backupTradePreviewPanel(): void {
    if (!this.backupPanel) {
      this.backupPanel = this.currentPanel.cloneNode(true) as HTMLDivElement;
      console.info('Backup of trade preview panel created.');
    } else {
      console.warn('Backup of trade preview panel already exists.');
    }
  }

  private showTradePreviewPanelWhenClosed(): void {
    const showPanelBtn = document.querySelector('.search-panel .controls .toggle-search-btn') as HTMLButtonElement | null;
    if (showPanelBtn?.querySelector('.chevron')?.classList.contains('collapsed')) {
      showPanelBtn.click();
      console.info('Trade preview panel was closed, now opened.');
    }
  }

  public rollbackTradePreviewPanel(): void {
    if (this.backupPanel) {
      this.currentPanel.innerHTML = this.backupPanel.innerHTML;
      console.info('Trade preview rolled back to original panel.', this.backupPanel);

      this.backupPanel = null;
    } else {
      console.warn('No backup panel found to rollback.');
    }
  }

  /**
   * 아이템 검색 값
   * .searchPanel -> .search-bar -> .search-left -> input
   * @private
   */
  private static getSearchLeftValue(): string {
    const searchLeft = document.querySelector('.search-bar .search-left input') as HTMLInputElement | null;
    if (!searchLeft || !searchLeft.value) {
      return '';
    }

    return searchLeft.value.trim();
  }

  private setSearchLeftValue(value: string): void {
    const searchLeft = document.querySelector('.search-bar .search-left input') as HTMLInputElement | null;
    if (!searchLeft) {
      console.error('Search left input not found. Cannot set search value.');
      return;
    }

    searchLeft.value = value;
  }

  /**
   * advanced 검색 필터 값
   * searchPanel -> ".search-bar search-advanced" -> filter-group
   * 각 필터의 name
   * - document.querySelectorAll('.search-advanced .filter-group')[0].querySelector('.filter-body .filter-title').childNodes[0].textContent 참고
   * UI를 활성화 하고 싶을 경우 expanded 여부에 따라
   * - document.querySelectorAll('.search-advanced .filter-group')[0].querySelector('button').click() 참고
   * 6번째 이후로는 능력치 필터로 적용이 필요할 때는 뒤에서부터 7번째까지 group의 remove-btn을 클릭하여 제거
   */
  private static getAdvancedFilterInfo_Blue(): AdvancedFilterInfo_Blue[] {
    const results: AdvancedFilterInfo_Blue[] = [];
    const filterGroups = document.querySelectorAll('.search-advanced-pane.blue .filter-group');

    filterGroups.forEach(group => {
      const expanded = group.classList.contains('expanded');
      const titleElement = group.querySelector('.filter-title')?.childNodes[0]?.textContent || '';
      const inputs = Array.from(group.querySelectorAll('input')) as HTMLInputElement[];

      // let matchedIndex;
      // const editBtn = group.querySelector('.edit-btn') as HTMLButtonElement;
      // if (editBtn) {
      //   editBtn.click(); // 편집 버튼 클릭하여 입력 활성화
      //   const allLi = group
      //     .querySelectorAll('.multiselect__content')[0]
      //     .querySelectorAll('.multiselect__option');
      //   matchedIndex = Array.from(allLi).findIndex(li =>
      //     li.querySelector('.multiselect__option.multiselect__option--selected')
      //   );
      //   editBtn.click(); // 다시 편집 버튼 클릭하여 입력 비활성화
      // }

      results.push({
        expanded,
        name: titleElement.trim(),
        inputs: inputs.map(input => input.value.trim())
      });
    });

    return results;
  }

  private setAdvancedFilterInfo_Blue(filterInfos: AdvancedFilterInfo_Blue[]): void {
    const filterBlueGroups = document.querySelectorAll('.search-advanced-pane.blue .filter-group');
    //0 ~ 5번째까지 배열을 분리
    for (let i = 0; i < filterBlueGroups.length; i++) {
      const group = filterBlueGroups[i];
      if (!group) continue;

      const inputs = group.querySelectorAll('input');
      if (!inputs) {
        console.warn(`No inputs found in filter group ${i}. Skipping...`, group, filterInfos[i]);
        continue;
      }
      filterInfos[i].inputs.forEach((value, index) => {
        if (inputs[index]) {
          (inputs[index] as HTMLInputElement).value = value;
        }
      });

      // 확장 상태 설정 (fiters와 group의 expanded 상태가 다를 경우) -> expanded 상태가 다를 경우에만 클릭
      if (filterInfos[i].expanded !== group.classList.contains('expanded')) {
        const toggleButton = group.querySelector('.toggle-btn') as HTMLButtonElement | null;
        toggleButton?.click();
      }
    }
  }
}
