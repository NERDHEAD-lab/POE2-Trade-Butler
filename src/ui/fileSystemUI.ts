import * as fs from './fileSystemEntry';
import { FileSystemEntry } from './fileSystemEntry';

export class FileSystemUI {
  private fileSystemMap: Record<string, FileSystemEntry>;

  private constructor(fileSystemMap: Record<string, FileSystemEntry>) {
    this.fileSystemMap = fileSystemMap;
  }

  public static builder(fileSystemMap: Record<string, FileSystemEntry>): FileSystemUIBuilder {
    return new FileSystemUIBuilder(fileSystemMap);
  }
}

class FileSystemUIBuilder {
  private readonly fileSystemMap: Record<string, FileSystemEntry>;

  constructor(fileSystemMap: Record<string, FileSystemEntry>) {
    this.fileSystemMap = fileSystemMap;
  }

  public build(): FileSystemUI {
    return (FileSystemUI as any).createInstance(this.fileSystemMap);
  }

  public addOnClickListener(event: (entry: FileSystemEntry) => void): this {
    //TODO
    return this;
  }

  public addOnDoubleClickListener(event: (entry: FileSystemEntry) => void): this {
    //TODO
    return this;
  }

  public addOnDragAndDropListener(event: (entry: FileSystemEntry, target: FileSystemEntry) => void): this {
    //TODO
    return this;
  }
}