import { describe, it, expect } from "@jest/globals";
import { getLength, toUpperCase, contains } from "../string";

describe("文字列関数のテスト", () => {
  describe("文字列の長さを取得する関数", () => {
    it("文字列の長さを取得できる", () => {
      expect(getLength("hello")).toBe(5);
    });
  });
  describe("文字列を大文字に変換する関数", () => {
    it("文字列を大文字に変換できる", () => {
      expect(toUpperCase("hello")).toBe("HELLO");
    });
  });
  describe("文字列に特定の文字が含まれているかチェックする関数", () => {
    it("文字列に特定の文字が含まれているかチェックできる", () => {
      expect(contains("hello", "e")).toBe(true);
      expect(contains("hello", "a")).toBe(false);
    });
  });
});
