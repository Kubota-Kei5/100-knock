import { describe, it, expect, test } from "@jest/globals";
import { add, subtract, multiply, divide } from "../math";

describe("四則演算関数のテスト", () => {
  describe("add関数", () => {
    it("正の数の加算ができる", () => {
      expect(add(2, 3)).toBe(5);
    });
    it("負の数の加算ができる", () => {
      expect(add(-2, -3)).toBe(-5);
    });
    it("正の数と負の数の加算ができる", () => {
      expect(add(2, -3)).toBe(-1);
    });
    it("0の加算ができる", () => {
      expect(add(0, 5)).toBe(5);
    });
    it("小数の加算ができる", () => {
      expect(add(2.5, 3.1)).toBeCloseTo(5.6);
    });
  });

  describe("subtract関数", () => {
    it("正の数の減算ができる", () => {
      expect(subtract(5, 3)).toBe(2);
    });
    it("負の数の減算ができる", () => {
      expect(subtract(-5, -3)).toBe(-2);
    });
    it("正の数と負の数の減算ができる", () => {
      expect(subtract(5, -3)).toBe(8);
    });
    it("0の減算ができる", () => {
      expect(subtract(5, 0)).toBe(5);
    });
    it("小数の減算ができる", () => {
      expect(subtract(5.5, 3.2)).toBeCloseTo(2.3);
    });
  });

  describe("multiply関数", () => {
    it("正の数の乗算ができる", () => {
      expect(multiply(2, 3)).toBe(6);
    });
    it("負の数の乗算ができる", () => {
      expect(multiply(-2, -3)).toBe(6);
    });
    it("正の数と負の数の乗算ができる", () => {
      expect(multiply(2, -3)).toBe(-6);
    });
    it("0の乗算ができる", () => {
      expect(multiply(0, 5)).toBe(0);
    });
    it("小数の乗算ができる", () => {
      expect(multiply(2.5, 3.1)).toBeCloseTo(7.75);
    });
  });

  describe("divide関数", () => {
    it("正の数の除算ができる", () => {
      expect(divide(6, 3)).toBe(2);
    });
    it("負の数の除算ができる", () => {
      expect(divide(-6, -3)).toBe(2);
    });
    it("正の数と負の数の除算ができる", () => {
      expect(divide(6, -3)).toBe(-2);
    });
    it("0の除算ができる", () => {
      expect(divide(0, 5)).toBe(0);
    });
    it("小数の除算ができる", () => {
      expect(divide(7.5, 2.5)).toBeCloseTo(3);
    });
    it("ゼロ除算のエラー処理", () => {
      expect(() => divide(5, 0)).toThrow("Division by zero is not allowed");
    });
  });
});
