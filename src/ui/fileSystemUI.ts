import { FileSystemEntry } from './fileSystemEntry';

export class FileSystemUI {
  private root: FileSystemEntry[];
  private parentElement: HTMLElement | null = null;
  private renderLiElement: ((entries: FileSystemEntry[], entry: FileSystemEntry) => HTMLLIElement | void) | null = null;
  private className: string | null = null;
  private ulElement: HTMLUListElement | null = null;
  private onLiElementAdded: ((li: HTMLLIElement, entry: FileSystemEntry) => void)[] = [];
  private onDestroyed: (() => void)[] = [];

  private constructor(root: FileSystemEntry[]) {
    this.root = root;
  }

  private static createInstance(root: FileSystemEntry[]): FileSystemUI {
    return new FileSystemUI(root);
  }

  public static builder(root: FileSystemEntry[]): FileSystemUIBuilder {
    return new FileSystemUIBuilder(root);
  }

  public create(): FileSystemUI {
    if (!this.parentElement || !this.renderLiElement) {
      throw new Error('FileSystemUI must be configured with parentElement and renderLiElement before calling create().');
    }

    // 기존 내용 초기화
    if (this.ulElement) {
      this.parentElement.removeChild(this.ulElement);
    }

    this.ulElement = document.createElement('ul');
    if (this.className) {
      this.ulElement.className = this.className;
    }

    // TODO: 추후 계층 구조를 여기서 처리할 수 있도록 개선
    for (const entry of this.root) {
      const li = this.renderLiElement!(this.root, entry);
      if (!li) continue;

      this.ulElement!.appendChild(li);
      this.onLiElementAdded.forEach(callback => callback(li, entry));
    }

    this.parentElement.appendChild(this.ulElement);
    return this;
  }

  public update(newEntries: FileSystemEntry[]): void {
    this.root = newEntries;
    this.create();
  }

  public destroy(): void {
    if (this.ulElement && this.parentElement) {
      this.parentElement.removeChild(this.ulElement);
      this.ulElement = null;
    }
    this.parentElement = null;
    this.renderLiElement = null;
    this.className = null;
    this.onLiElementAdded = [];

    this.onDestroyed.forEach(callback => callback());
  }

  public addOnLiElementAdded(callback: (li: HTMLLIElement, entry: FileSystemEntry) => void): void {
    this.onLiElementAdded.push(callback);
  }

  public addOnDestroyed(callback: () => void): void {
    this.onDestroyed.push(callback);
  }

}

class FileSystemUIBuilder {
  private readonly root: FileSystemEntry[];
  private parentElement: HTMLElement | null = null;
  private className: string | null = null;
  private renderLiElement: ((entries: FileSystemEntry[], entry: FileSystemEntry) => HTMLLIElement | void) | null = null;

  constructor(root: FileSystemEntry[]) {
    this.root = root;
  }

  public htmlLiElement(fn: (entries: FileSystemEntry[], entry: FileSystemEntry) => HTMLLIElement | void): FileSystemUIBuilder {
    this.renderLiElement = fn;
    return this;
  }

  public attachTo(parent: HTMLElement, options?: { className?: string }): FileSystemUIBuilder {
    this.parentElement = parent;
    this.className = options?.className || null;
    return this;
  }

  public build(): FileSystemUI {
    const ui = (FileSystemUI as any).createInstance(this.root);
    ui.parentElement = this.parentElement;
    ui.className = this.className;
    ui.renderLiElement = this.renderLiElement;
    return ui;
  }
}
