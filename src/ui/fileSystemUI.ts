import * as fs from './fileSystemEntry';
import { FileSystemEntry } from './fileSystemEntry';

type EventType = 'click' | 'dblclick' | 'dragover' | 'drop';

export class FileSystemUI {
  private fileSystemEntries: FileSystemEntry[];

  private constructor(fileSystemEntries: FileSystemEntry[]) {
    this.fileSystemEntries = fileSystemEntries;
  }

  public create(): FileSystemUI {
    //TODO
    return this;
  }

  public update(fileSystemEntries: FileSystemEntry[]): FileSystemUI {
    //TODO
    return this;
  }

  public destroy(): FileSystemUI {
    //TODO
    return this;
  }

  public static builder(fileSystemEntries: FileSystemEntry[]): FileSystemUIBuilder {
    return new FileSystemUIBuilder(fileSystemEntries);
  }
}

class FileSystemUIBuilder {
  private readonly fileSystemEntries: FileSystemEntry[];

  constructor(fileSystemEntries: FileSystemEntry[]) {
    this.fileSystemEntries = fileSystemEntries;
  }

  public build(): FileSystemUI {
    //TODO
    return (FileSystemUI as any).createInstance(this.fileSystemEntries);
  }

  public htmlLiElement(handler: (fileSystemEntries: FileSystemEntry[], entry: FileSystemEntry) => HTMLLIElement): this {
    //TODO
    return this;
  }

  public attachTo(
    parent: HTMLElement,
    options?: { className?: string; style?: Partial<CSSStyleDeclaration> }
  ): this {
    //TODO
    return this;
  }
}