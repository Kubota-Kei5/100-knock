export class DataProcessor {
  // データの変換処理
  static async transformData<T, U>(
    data: T[],
    transformer: (item: T) => Promise<U>
  ): Promise<U[]> {
    const promises = data.map(transformer);
    return Promise.all(promises);
  }

  // データの並列処理
  static async processInParallel<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(tasks.map((task) => task()));
  }

  // データの順次処理
  static async processSequentially<T>(
    tasks: (() => Promise<T>)[]
  ): Promise<T[]> {
    const results: T[] = [];
    for (const task of tasks) {
      const result = await task();
      results.push(result);
    }
    return results;
  }

  // リトライ機能付き処理
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) {
          throw lastError;
        }
        // 指数バックオフ
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 100)
        );
      }
    }

    throw lastError!;
  }
}
