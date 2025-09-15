// workspace/frontend/src/utils/MathUtils.ts
export class MathUtils {
  static roundToDecimal(number: number, decimals: number): number {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  static isEven(number: number): boolean {
    return number % 2 === 0;
  }

  static factorial(n: number): number {
    if (n < 0) throw new Error("Factorial is not defined for negative numbers");
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  static getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
