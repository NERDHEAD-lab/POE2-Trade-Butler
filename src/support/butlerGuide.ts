interface ButlerGuide {
  guideTarget: string; // 가이드 대상
  description: string; // 가이드 설명
  focusTarget: string[]; // 블러 효과를 제외할 대상, 없을 경우 블러 처리 하지 않음
  onBefore?: () => void; // 가이드 시작 전 실행할 함수
  onAfter?: () => void; // 가이드 완료 후 실행할 함수
}

const butlerGuides: ButlerGuide[] = [
  {
    guideTarget: '#poe2-sidebar #poe2-sidebar-toggle-button',
    description: 'Click this button to toggle the sidebar visibility.',
    focusTarget: ['#poe2-sidebar'],
    onBefore: () => {
      const element = document.querySelector('#poe2-sidebar #poe2-sidebar-toggle-button') as HTMLButtonElement;
      if (!element) {
        return;
      }
      // 닫겨 있으면 클릭해서 열기
      if (element.classList.contains('collapsed')) {
        element.click();
      }
    },
    onAfter: () => {
      const element = document.querySelector('#poe2-sidebar #poe2-sidebar-toggle-button') as HTMLButtonElement;
      if (!element) {
        console.error('Toggle button not found in the sidebar.');
        return;
      }
      // 사이드 바를 닫는다.
      element.click();
      // 2초 후에 다시 클릭하여 사이드바를 연다.
      setTimeout(() => {
        element.click();
      }, 2000);
    }
  }
]

// focusTarget만 구멍 뚫는 오버레이 + guideTarget에 별도 강조 박스 추가
export async function runButlerGuides() {
  for (let i = 0; i < butlerGuides.length; i++) {
    const guide = butlerGuides[i];
    guide.onBefore?.();

    // 오버레이 추가
    let overlay: HTMLDivElement | null = null;
    let focusRects: DOMRect[] = [];
    if (guide.focusTarget && guide.focusTarget.length > 0) {
      // focusTarget들의 화면 위치 저장
      focusRects = guide.focusTarget.flatMap(sel =>
        Array.from(document.querySelectorAll<HTMLElement>(sel))
          .filter(el => el.offsetParent !== null)
          .map(el => el.getBoundingClientRect())
      );

      overlay = document.createElement('div');
      overlay.id = 'butler-guide-blur-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.zIndex = '9998';
      overlay.style.pointerEvents = 'none';
      overlay.style.backdropFilter = 'blur(4px)';
      overlay.style.background = 'rgba(0,0,0,0.2)';
      overlay.style.transition = 'backdrop-filter 0.2s;';
      if (focusRects.length > 0) {
        const holes = focusRects.map(r =>
          `inset(${r.top}px calc(100vw - ${r.right}px) calc(100vh - ${r.bottom}px) ${r.left}px)`
        );
        overlay.style.clipPath = holes.length === 1 ? holes[0] : `polygon(evenodd, ${holes.join(', ')})`;
      }
      document.body.appendChild(overlay);
    }

    // guideTarget 강조 박스 생성
    let highlightBox: HTMLDivElement | null = null;
    const target = document.querySelector(guide.guideTarget) as HTMLElement;
    if (target) {
      const rect = target.getBoundingClientRect();
      highlightBox = document.createElement('div');
      const margin = 8; // 강조 박스 여유 공간(px)
      highlightBox.id = 'butler-guide-highlight-box';
      highlightBox.style.position = 'fixed';
      highlightBox.style.left = (rect.left - margin) + 'px';
      highlightBox.style.top = (rect.top - margin) + 'px';
      highlightBox.style.width = (rect.width + margin * 2) + 'px';
      highlightBox.style.height = (rect.height + margin * 2) + 'px';
      highlightBox.style.border = '3px solid #ffb300';
      highlightBox.style.borderRadius = '8px';
      highlightBox.style.boxShadow = '0 0 16px 6px rgba(255,180,0,0.4)';
      highlightBox.style.zIndex = '9999';
      highlightBox.style.pointerEvents = 'none';
      highlightBox.style.transition = 'all 0.3s cubic-bezier(0.55,0,0.55,1)';
      document.body.appendChild(highlightBox);
    }

    // 설명 표시 및 next 버튼
    let descDiv: HTMLDivElement | null = null;
    let nextBtn: HTMLButtonElement | null = null;
    if (target) {
      descDiv = document.createElement('div');
      descDiv.id = 'butler-guide-desc';
      descDiv.textContent = guide.description;
      descDiv.style.position = 'absolute';
      const rect = target.getBoundingClientRect();
      descDiv.style.left = rect.left + window.scrollX + 'px';
      descDiv.style.top = (rect.bottom + window.scrollY + 8) + 'px';
      descDiv.style.background = 'rgba(0,0,0,0.85)';
      descDiv.style.color = '#fff';
      descDiv.style.padding = '8px 16px';
      descDiv.style.borderRadius = '8px';
      descDiv.style.zIndex = '10000';
      descDiv.style.fontSize = '16px';
      descDiv.style.maxWidth = '320px';
      descDiv.style.pointerEvents = 'auto';
      descDiv.style.display = 'flex';
      descDiv.style.flexDirection = 'column';
      descDiv.style.gap = '8px';
      document.body.appendChild(descDiv);

      nextBtn = document.createElement('button');
      nextBtn.id = 'butler-guide-next-btn';
      nextBtn.textContent = '다음';
      nextBtn.style.marginTop = '8px';
      nextBtn.style.alignSelf = 'flex-end';
      nextBtn.style.background = '#4caf50';
      nextBtn.style.color = '#fff';
      nextBtn.style.border = 'none';
      nextBtn.style.borderRadius = '4px';
      nextBtn.style.padding = '4px 16px';
      nextBtn.style.cursor = 'pointer';
      nextBtn.style.fontSize = '15px';
      descDiv.appendChild(nextBtn);
    }

    try {
      await new Promise<void>(resolve => {
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            guide.onAfter?.();
            resolve();
          }, { once: true });
        } else {
          guide.onAfter?.();
          resolve();
        }
      });
    } finally {
      if (descDiv) descDiv.remove();
      if (nextBtn) nextBtn.remove();
      if (overlay) overlay.remove();
      if (highlightBox) highlightBox.remove();
    }
  }
}
