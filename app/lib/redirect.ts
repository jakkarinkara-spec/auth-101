// path ที่จะพากลับไปหลัง login (เช่นหน้าจองเรือ) — รับเฉพาะ path ในเว็บนี้ กัน open redirect ไปเว็บอื่น
export function safeCallbackUrl(raw: string | null | undefined, fallback = '/'): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\') ? raw : fallback;
}
