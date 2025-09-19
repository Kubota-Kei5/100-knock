import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { DataProcessor } from "../DataProcessor";

describe("DataProcessorクラス", () => {
  // モックタイマーを利用したテスト
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("transformDataメソッド", () => {
    it("データ配列を正しく変換する", async () => {
      const data = [1, 2, 3, 4, 5];
      const transformer = async (num: number): Promise<string> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(`Number: ${num}`);
          }, 10);
        });
      };
      const promise = DataProcessor.transformData(data, transformer);

      // 全てのタイマーを進める
      jest.advanceTimersByTime(10);

      const result = await promise;

      expect(result).toHaveLength(5);
      expect(result).toEqual([
        "Number: 1",
        "Number: 2",
        "Number: 3",
        "Number: 4",
        "Number: 5",
      ]);
    });

    it("空配列の場合も正しく処理する", async () => {
      const data: number[] = [];
      const transformer = async (num: number): Promise<string> => {
        return `Number: ${num}`;
      };
      const result = await DataProcessor.transformData(data, transformer);

      expect(result).toEqual([]);
    });
  });

  describe("processInParallelメソッド", () => {
    it("タスクを並列実行する", async () => {
      const tasks = [
        () => Promise.resolve("Task 1"),
        () => Promise.resolve("Task 2"),
        () => Promise.resolve("Task 3"),
      ];

      const results = await DataProcessor.processInParallel(tasks);
      expect(results).toEqual(["Task 1", "Task 2", "Task 3"]);
    });
  });

  describe("processSequentiallyメソッド", () => {
    it("タスクを順次実行する", async () => {
      const executionOrder: number[] = [];

      const tasks = [
        async () => {
          executionOrder.push(1);
          return "Task 1";
        },
        async () => {
          executionOrder.push(2);
          return "Task 2";
        },
        async () => {
          executionOrder.push(3);
          return "Task 3";
        },
      ];

      const results = await DataProcessor.processSequentially(tasks);
      expect(results).toEqual(["Task 1", "Task 2", "Task 3"]);
      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it("順次実行の時間を確認", async () => {
      jest.useRealTimers();

      const tasks = [
        () =>
          new Promise<string>((resolve) =>
            setTimeout(() => resolve("Task 1"), 50)
          ),
        () =>
          new Promise<string>((resolve) =>
            setTimeout(() => resolve("Task 2"), 50)
          ),
        () =>
          new Promise<string>((resolve) =>
            setTimeout(() => resolve("Task 3"), 50)
          ),
      ];

      const startTime = Date.now();
      const result = await DataProcessor.processSequentially(tasks);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(150);
      expect(result).toHaveLength(3);
    });
  });

  describe("withRetryメソッド", () => {
    it("成功するまでリトライする", async () => {
      jest.useRealTimers();

      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return "Success";
      };

      const result = await DataProcessor.withRetry(operation, 3);
      expect(result).toBe("Success");
      expect(attemptCount).toBe(3);
    });

    it("最大リトライ回数を超えた場合はエラーを返す", async () => {
      jest.useRealTimers();

      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        throw new Error(`Attempt ${attemptCount} failed`);
      };

      await expect(DataProcessor.withRetry(operation, 2)).rejects.toThrow(
        "Attempt 3 failed"
      );
      expect(attemptCount).toBe(3);
    });

    it("指数バックオフを確認する", async () => {
      jest.useRealTimers();

      const timestamps: number[] = [];
      const operation = async (): Promise<string> => {
        timestamps.push(Date.now());
        throw new Error("Always failed");
      };

      try {
        await DataProcessor.withRetry(operation, 2);
      } catch (error) {}

      expect(timestamps).toHaveLength(3);

      const interval1 = timestamps[1] - timestamps[0];
      const interval2 = timestamps[2] - timestamps[1];

      expect(interval1).toBeGreaterThan(80);
      expect(interval1).toBeLessThan(120);
      expect(interval2).toBeGreaterThan(180);
      expect(interval2).toBeLessThan(220);
    });
  });
});
