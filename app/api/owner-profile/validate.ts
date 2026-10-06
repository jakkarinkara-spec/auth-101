// ตรวจข้อมูลส่วนตัวเจ้าของเรือ

export type OwnerProfileData = {
  fullName: string;
  phone: string;
  address: string;
  contactEmail: string | null;
};

// เบอร์ไทย / ต่างประเทศ: ตัวเลข ช่องว่าง - + ( ) และมีตัวเลข 9–15 หลัก
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^[\d\s+()-]+$/.test(phone) && digits.length >= 9 && digits.length <= 15;
}

export function parseOwnerProfile(body: unknown): { data: OwnerProfileData } | { error: string } {
  const b = body as Record<string, unknown> | null;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const fullName = str(b?.fullName, 200);
  const phone = str(b?.phone, 30);
  const address = str(b?.address, 500);
  const contactEmail = str(b?.contactEmail, 200);

  if (!fullName) return { error: "Full name is required" };
  if (!isValidPhone(phone)) return { error: "Phone number is invalid" };
  if (!address) return { error: "Address is required" };
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return { error: "Contact email is invalid" };

  return { data: { fullName, phone, address, contactEmail: contactEmail || null } };
}
