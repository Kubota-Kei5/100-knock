import { ApiClient } from "../ApiClient";
import { describe, it } from "@jest/globals";

describe("ApiClientクラス", () => {
  describe("getUserメソッド", () => {
    it("ユーザー情報を正常に取得できる", async () => {});
    it("正しいAPIレスポンス形式を返す", async () => {});
  });

  describe("createUserメソッド", () => {
    it("新しいユーザーを作成できる", async () => {});
    it("作成されたユーザーに正しいIDが割り当てられる", async () => {});
  });

  describe("getUserNotFoundメソッド", () => {
    it("存在しないユーザーでエラーを返す", async () => {});
  });

  describe("getUsersメソッド", () => {
    it("複数ユーザーを並行取得できる", async () => {});
  });

  describe("uploadFileメソッド", () => {
    it("ファイルを正常にアップロードできる", async () => {});
  });

  describe("networkErrorメソッド", () => {
    it("ネットワークエラーを適切に処理する", async () => {});
  });
});
