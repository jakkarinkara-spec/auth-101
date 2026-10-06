export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// searchParams อาจเป็น array ถ้า query ซ้ำ (?q=a&q=b) — ใช้ค่าแรก
export function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

// pattern สำหรับ ILIKE '%...%' — escape \ % _ ไม่ให้ผู้ใช้พิมพ์แล้วกลายเป็น wildcard
export function containsPattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, '\\$&')}%`;
}
