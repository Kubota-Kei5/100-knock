// 加算関数
export function add(a: number, b: number): number {
  return a + b;
}

// 減算関数
export function subtract(a: number, b: number): number {
  return a - b;
}

// 乗算関数
export function multiply(a: number, b: number): number {
  return a * b;
}

// 除算関数
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero is not allowed");
  }
  return a / b;
}
