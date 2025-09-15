interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
  tags: string[];
  profile?: {
    bio: string;
    website?: string;
  };
}

export class UserManager {
  private users: User[] = [];

  addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  getUserById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  getUsersByTag(tag: string): User[] {
    return this.users.filter((user) => user.tags.includes(tag));
  }

  getActiveUsers(): User[] {
    return this.users.filter((user) => user.isActive);
  }

  calculateAverageAge(): number | null {
    const usersWithAge = this.users.filter((user) => user.age !== undefined);
    if (usersWithAge.length === 0) return null;

    const sum = usersWithAge.reduce(
      (total, user) => total + (user.age || 0),
      0
    );
    return sum / usersWithAge.length;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  generateUserSummary(user: User): string {
    return `${user.name} (${user.email}) - Active: ${user.isActive}`;
  }

  clearUsers(): void {
    this.users = [];
  }
}

export type { User };
