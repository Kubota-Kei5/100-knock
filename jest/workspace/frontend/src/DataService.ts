import { jest } from "@jest/globals";
import { Logger } from "./NotificationService";

interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
}

interface CacheService {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): void;
}

export class DataService {
  constructor(
    private httpClient: HttpClient,
    private cache: CacheService,
    private logger: Logger
  ) {}

  async getUserData(userId: number): Promise<any> {
    const cacheKey = `user:${userId}`;

    // キャッシュをチェック
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.info(`User data found in cache for user ${userId}`);
      return cachedData;
    }

    // APIから取得
    try {
      this.logger.info(`Fetching user data from API for user ${userId}`);
      const userData = await this.httpClient.get(`/users/${userId}`);

      // キャッシュに保存（5分間）
      this.cache.set(cacheKey, userData, 300);
      return userData;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user data for user ${userId}`,
        error as Error
      );
      throw error;
    }
  }

  async updateUserProfile(userId: number, profileData: any): Promise<boolean> {
    try {
      await this.httpClient.post(`/users/${userId}/profile`, profileData);

      // キャッシュを無効化
      this.cache.delete(`user:${userId}`);

      this.logger.info(`User profile updated for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to update user profile for user ${userId}`,
        error as Error
      );
      return false;
    }
  }
}
