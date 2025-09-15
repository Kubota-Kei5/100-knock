import { UserManager, User } from "../utils/UserManager";

describe("UserManagerクラス", () => {
  let userManager: UserManager;

  beforeEach(() => {
    userManager = new UserManager();
  });

  describe("addUser メソッド", () => {
    it("ユーザーを正常に追加できる", () => {
      const userData: User = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        isActive: true,
        tags: ["developer", "javascript"],
      };

      const result = userManager.addUser(userData);

      // オブジェクトの等価性をテスト
      expect(result).toEqual(userData);
      expect(result).toStrictEqual(userData);
    });

    it("追加されたユーザーが正しいプロパティを持つ", () => {
      const userData: User = {
        id: 1,
        name: "Jane Doe",
        email: "jane@example.com",
        isActive: true,
        tags: ["designer"],
        profile: {
          bio: "UI/UX Designer",
          website: "https://jane.example.com",
        },
      };

      const result = userManager.addUser(userData);

      // プロパティの存在確認
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("isActive");
      expect(result).toHaveProperty("tags");
      expect(result).toHaveProperty("profile.bio");
      expect(result).toHaveProperty("profile.website");

      // 配列の長さ確認
      expect(result.tags).toHaveLength(1);

      // 配列の要素確認
      expect(result.tags).toContain("designer");
    });
  });

  describe("getUserById メソッド", () => {
    beforeEach(() => {
      userManager.addUser({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        isActive: true,
        tags: ["test"],
      });
    });

    it("存在するユーザーを取得できる", () => {
      const result = userManager.getUserById(1);

      // undefined ではないことを確認
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();

      // オブジェクトの部分マッチング
      expect(result).toMatchObject({
        id: 1,
        name: "Test User",
        email: "test@example.com",
      });
    });

    it("存在しないユーザーはundefinedを返す", () => {
      const result = userManager.getUserById(999);

      expect(result).toBeUndefined();
      expect(result).toBeFalsy();
    });
  });

  describe("getUsersByTag メソッド", () => {
    beforeEach(() => {
      userManager.addUser({
        id: 1,
        name: "JavaScript Developer",
        email: "jsdev@example.com",
        isActive: true,
        tags: ["javascript", "developer"],
      });
      userManager.addUser({
        id: 2,
        name: "TypeScript Developer",
        email: "tsdev@example.com",
        isActive: true,
        tags: ["typescript", "developer"],
      });
    });

    it("特定のタグを持つユーザーを取得できる", () => {
      const result = userManager.getUsersByTag("javascript");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        name: "JavaScript Developer",
        email: "jsdev@example.com",
      });
    });

    it("存在しないタグの場合は空の配列を返す", () => {
      const result = userManager.getUsersByTag("nonexistent");

      expect(result).toHaveLength(0);
    });
  });
});
