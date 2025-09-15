// 文字列の長さを取得する関数
export function getLength(str: string): number {
  return str.length;
}

// 文字列を大文字に変換する関数
export function toUpperCase(str: string): string {
  return str.toUpperCase();
}

// 文字列に特定の文字が含まれているかチェック
export function contains(str: string, char: string): boolean {
  return str.includes(char);
}
