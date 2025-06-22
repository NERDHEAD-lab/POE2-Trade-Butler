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
  private originalPanel = document.querySelector('#trade .search-panel') as HTMLDivElement;
  private readonly backupPanel: HTMLDivElement | null = null;

  constructor() {
    if (!this.originalPanel) {
      console.error('Trade preview element not found. Make sure you are on the trade page.');
      throw new Error('Trade preview element not found');
    }

    this.backupPanel = this.originalPanel.cloneNode(true) as HTMLDivElement;
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

  public rollback(): void {
    if (this.backupPanel) {
      this.originalPanel.replaceWith(this.backupPanel);
      console.info('Trade preview rolled back to original panel.');
    } else {
      console.warn('No backup panel found to rollback.');
    }
  }

  /**
   * 아이템 검색 값
   * .searchPanel -> .search-bar -> .search-left -> input
   * @private
   */
  private static getSearchLeftValue() : string {
    const searchLeft = document.querySelector('.search-bar .search-left input') as HTMLInputElement | null;
    if (!searchLeft || !searchLeft.value) {
      return '';
    }

    return searchLeft.value.trim();
  }

  private setSearchLeftValue(value: string): void {
    const searchLeft = document.querySelector('.search-left input') as HTMLInputElement | null;
    if (!searchLeft) {
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
