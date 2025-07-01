import { FileSystemEntry } from './fileSystemEntry';

export class FileSystemUI {
  private root: FileSystemEntry[];
  private parentElement: HTMLElement | null = null;
  private renderLiElement: ((entries: FileSystemEntry[], entry: FileSystemEntry) => HTMLLIElement) | null = null;
  private className: string | null = null;
  private ulElement: HTMLUListElement | null = null;

  private constructor(root: FileSystemEntry[]) {
    this.root = root;
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
      this.ulElement!.appendChild(li);
    }

    this.parentElement.appendChild(this.ulElement);
    return this;
  }

  public update(newEntries: FileSystemEntry[]): void {
    this.root = newEntries;
    this.create();
  }
}

class FileSystemUIBuilder {
  private readonly root: FileSystemEntry[];
  private parentElement: HTMLElement | null = null;
  private className: string | null = null;
  private renderLiElement: ((entries: FileSystemEntry[], entry: FileSystemEntry) => HTMLLIElement) | null = null;

  constructor(root: FileSystemEntry[]) {
    this.root = root;
  }

  public htmlLiElement(fn: (entries: FileSystemEntry[], entry: FileSystemEntry) => HTMLLIElement): FileSystemUIBuilder {
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
