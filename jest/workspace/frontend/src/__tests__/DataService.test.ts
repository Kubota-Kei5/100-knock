import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { DataService } from "@/DataService";
import { HttpClient, CacheService, Logger } from "@/types/service";

describe("DataServiceクラス", () => {
  let dataService: DataService;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockCache: jest.Mocked<CacheService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn() as jest.MockedFunction<HttpClient["get"]>,
      post: jest.fn() as jest.MockedFunction<HttpClient["post"]>,
    };

    mockCache = {
      get: jest.fn() as jest.MockedFunction<CacheService["get"]>,
      set: jest.fn() as jest.MockedFunction<CacheService["set"]>,
      delete: jest.fn() as jest.MockedFunction<CacheService["delete"]>,
    };

    mockLogger = {
      info: jest.fn() as jest.MockedFunction<Logger["info"]>,
      error: jest.fn() as jest.MockedFunction<Logger["error"]>,
    };

    dataService = new DataService(mockHttpClient, mockCache, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserData メソッド", () => {
    const userId = 123;
    const cacheKey = `user:${userId}`;
    const userData = { id: userId, name: "John", email: "john@example.com" };

    it("キャッシュにデータがある場合はキャッシュから返す", async () => {
      // Arrange: キャッシュにデータがある状態をモック
      mockCache.get.mockReturnValue(userData);

      // Act
      const result = await dataService.getUserData(userId);

      // Assert
      expect(result).toEqual(userData);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(mockHttpClient.get).not.toHaveBeenCalled(); // API呼び出しなし
      expect(mockLogger.info).toHaveBeenCalledWith(
        `User data found in cache for user ${userId}`
      );
    });

    it("キャッシュにない場合はAPIから取得してキャッシュに保存", async () => {
      // Arrange: キャッシュにデータがない状態をモック
      mockCache.get.mockReturnValue(null);
      mockHttpClient.get.mockResolvedValue(userData);

      // Act
      const result = await dataService.getUserData(userId);

      // Assert
      expect(result).toEqual(userData);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/users/${userId}`);
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, userData, 300);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Fetching user data from API for user ${userId}`
      );
    });

    it("API呼び出し失敗時はエラーを再スローする", async () => {
      const apiError = new Error("API Error");
      mockCache.get.mockReturnValue(null);
      mockHttpClient.get.mockRejectedValue(apiError);

      await expect(dataService.getUserData(userId)).rejects.toThrow(
        "API Error"
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to fetch user data for user ${userId}`,
        apiError
      );
      expect(mockCache.set).not.toHaveBeenCalled(); // キャッシュ保存なし
    });
  });

  describe("updateUserProfile メソッド", () => {
    const userId = 123;
    const profileData = { bio: "Updated bio", website: "https://example.com" };

    it("プロフィール更新後にキャッシュを削除する", async () => {
      mockHttpClient.post.mockResolvedValue({ success: true });

      const result = await dataService.updateUserProfile(userId, profileData);

      expect(result).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/users/${userId}/profile`,
        profileData
      );
      expect(mockCache.delete).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `User profile updated for user ${userId}`
      );
    });

    it("更新失敗時はfalseを返す", async () => {
      const updateError = new Error("Update failed");
      mockHttpClient.post.mockRejectedValue(updateError);

      const result = await dataService.updateUserProfile(userId, profileData);

      expect(result).toBe(false);
      expect(mockCache.delete).not.toHaveBeenCalled(); // キャッシュ削除なし
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to update user profile for user ${userId}`,
        updateError
      );
    });
  });
});

describe("基本的なモック", () => {
  it("jest.fn()でモック関数を作成", () => {
    const mockFunction = jest.fn();

    // 戻り値を設定
    mockFunction.mockReturnValue("test value");

    // 呼び出し
    const result = mockFunction();

    // 検証
    expect(result).toBe("test value");
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});
