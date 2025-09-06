class ChunkifyUtil {
  private static readonly SAFETY_MARGIN = 100;

  static chunkifyArray<T>(array: T[], chunkSize: number): T[][] {
    if (chunkSize <= this.SAFETY_MARGIN) {
      throw new Error(`Chunk size must be greater than safety margin of ${this.SAFETY_MARGIN}`);
    }
    const limit = chunkSize - this.SAFETY_MARGIN;

    const chunks: T[][] = [];
    let cur: T[] = [];
    let curSize = 2;

    for (const item of array) {
      const itemSize = JSON.stringify(item).length;

      if (itemSize + 2 > limit) {
        throw new Error(`Single item exceeds effective chunk size of ${limit} bytes`);
      }

      const comma = cur.length > 0 ? 1 : 0;
      const nextSize = curSize + comma + itemSize;

      if (nextSize > limit) {
        if (cur.length > 0) chunks.push(cur);
        cur = [item];
        curSize = 2 + itemSize;
      } else {
        cur.push(item);
        curSize = nextSize;
      }
    }

    if (cur.length > 0) chunks.push(cur);
    return chunks;
  }

  static combineChunks<T>(chunks: T[][]): T[] {
    return ([] as T[]).concat(...chunks);
  }
}

export { ChunkifyUtil };