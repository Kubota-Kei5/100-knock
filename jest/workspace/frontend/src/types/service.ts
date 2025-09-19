// 外部依存（メール送信、SMS送信）
export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

export interface SmsService {
  sendSms(phoneNumber: string, message: string): Promise<boolean>;
}

export interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
}

export interface CacheService {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): void;
}

export interface Logger {
  info(message: string): void;
  error(message: string, error?: Error): void;
}
