import { isExportDeclaration } from "typescript";
import { ApiClient } from "../ApiClient";
import { describe, it } from "@jest/globals";

describe("ApiClientクラス", () => {
  let apiClient: ApiClient;

  beforeAll(() => {
    apiClient = new ApiClient("https://api.example.com");
  });

  describe("getUserメソッド", () => {
    it("ユーザー情報を正常に取得できる", async () => {
      // async/awaitを使用して非同期テスト
      const result = await apiClient.getUser(1);

      expect(result.status).toBe(200);
      expect(result.message).toBe("Success");
      expect(result.data).toHaveProperty("id", 1);
      expect(result.data).toHaveProperty("name", "User 1");
      expect(result.data).toHaveProperty("email", "user1@example.com");
    });
    it("正しいAPIレスポンス形式を返す", async () => {
      const result = await apiClient.getUser(2);

      // オブジェクトの構造をテスト
      expect(result).toMatchObject({
        data: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
        }),
        status: expect.any(Number),
        message: expect.any(String),
      });
    });
  });

  describe("createUserメソッド", () => {
    it("新しいユーザーを作成できる", async () => {
      const newUserData = {
        name: "New User",
        email: "newuser@example.com",
      };
      const result = await apiClient.createUser(newUserData);

      expect(result.status).toBe(201);
      expect(result.message).toBe("User created successfully");
      expect(result.data).toMatchObject(newUserData);
      expect(result.data.id).toBeDefined();
      expect(typeof result.data.id).toBe("number");
    });
    it("作成されたユーザーに正しいIDが割り当てられる", async () => {
      const newUserData = {
        name: "Test User",
        email: "testuser@example.com",
      };
      const result = await apiClient.createUser(newUserData);

      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.id).toBeLessThan(1000);
    });
  });

  describe("getUserNotFoundメソッド", () => {
    it("存在しないユーザーでエラーを返す1", async () => {
      // async/await でのエラーハンドリング
      await expect(async () => {
        await apiClient.getUserNotFound(999);
      }).rejects.toThrow("not found");
    });
    it("存在しないユーザーでエラーを返す2", async () => {
      await expect(apiClient.getUserNotFound(888)).rejects.toThrow("not found");
    });
  });

  describe("getUsersメソッド", () => {
    it("複数ユーザーを並行取得できる", async () => {
      const userIds = [1, 2, 3];

      const startTime = Date.now();
      const result = await apiClient.getUsers(userIds);
      const endTime = Date.now();

      // 並行処理により時間が短縮されていることを確認
      const executationTime = endTime - startTime;
      expect(executationTime).toBeLessThan(500); // 500ms未満で完了することを期待

      expect(result.status).toBe(200);
      expect(result.data.length).toBe(3);
      expect(result.message).toBe("Retrieved 3 users");

      // 各ユーザーの検証
      result.data.forEach((user, index) => {
        expect(user.id).toBe(userIds[index]);
        expect(user.name).toBe(`User ${userIds[index]}`);
      });
    });
  });

  describe("uploadFileメソッド", () => {
    it("ファイルを正常にアップロードできる", async () => {
      const fileName = "testfile.txt";
      const result = await apiClient.uploadFile(fileName);

      expect(result.status).toBe(200);
      expect(result.message).toBe("File uploaded successfully");
      expect(result.data).toHaveProperty("fileName", fileName);
      expect(result.data.size).toBeGreaterThan(0);
      expect(result.data.size).toBeLessThan(10000);
    });
  });

  describe("networkErrorメソッド", () => {
    it("ネットワークエラーを適切に処理する", async () => {
      await expect(apiClient.networkError()).rejects.toThrow(
        "Network connection failed"
      );
    });
  });
});
