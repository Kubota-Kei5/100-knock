interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "https://api.example.com") {
    this.baseUrl = baseUrl;
  }

  // Get user by ID successfully
  async getUser(id: number): Promise<ApiResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: { id, name: `User ${id}`, email: `user${id}@example.com` },
          status: 200,
          message: "Success",
        });
      }, 100);
    });
  }

  // Create a new user successfully
  async createUser(userData: Omit<User, "id">): Promise<ApiResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Math.floor(Math.random() * 1000),
          ...userData,
        };
        resolve({
          data: newUser,
          status: 201,
          message: "User created successfully",
        });
      }, 200);
    });
  }

  // Error case: User not found
  async getUserNotFound(id: number): Promise<ApiResponse<User>> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`User with ID ${id} not found`));
      }, 150);
    });
  }

  // Get users list successfully
  async getUsers(ids: number[]): Promise<ApiResponse<User[]>> {
    const promises = ids.map((id) => this.getUser(id));
    const results = await Promise.all(promises);

    return {
      data: results.map((result) => result.data),
      status: 200,
      message: `Retrieved ${results.length} users`,
    };
  }
  // Upload File（This process takes a long time）
  async uploadFile(
    fileName: string
  ): Promise<ApiResponse<{ fileName: string; size: number }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: { fileName, size: Math.floor(Math.random() * 10000) },
          status: 200,
          message: "File uploaded successfully",
        });
      }, 1000); // 1秒かかる処理
    });
  }

  // Simulate network error
  async networkError(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Network connection failed"));
      }, 50);
    });
  }
}
