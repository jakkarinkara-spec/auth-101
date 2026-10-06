// class ที่ใช้ซ้ำทั้งใน Server และ Client Component (แยกจาก ui.tsx ที่ import auth ฝั่ง server)

export const heading = 'font-(family-name:--font-kanit) font-semibold';

export const fieldLabel = 'flex flex-col gap-2 text-sm font-medium text-(--nl-label)';

export const field =
  'h-[50px] rounded-xl border border-(--nl-field) bg-white px-3 text-base text-(--nl-ink) outline-none placeholder:text-[#8A9AA1] focus:border-(--nl-teal) focus:ring-3 focus:ring-(--nl-teal)/15';

export const primaryButton =
  'flex h-[50px] items-center justify-center gap-2 rounded-xl bg-(--nl-teal) text-[17px] font-semibold text-white hover:bg-(--nl-teal-dk) disabled:cursor-not-allowed disabled:opacity-60';

export const textLink = 'font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)';

// ป้ายสถานะคำขอจอง — ใช้ทั้งหน้า /admin และ /bookings
export const STATUS_BADGE = {
  pending: { label: 'รอยืนยัน', className: 'bg-(--nl-accent-soft) text-[#9A4A00]' },
  confirmed: { label: 'ยืนยันแล้ว', className: 'bg-(--nl-tint) text-(--nl-teal-dk)' },
  cancelled: { label: 'ยกเลิก', className: 'bg-[#EDF1F1] text-[#6B7C84]' },
} as const;

export const badge = 'inline-flex rounded-full px-2.5 py-1 text-[13px] font-semibold';

// ประเภทคำขอในหน้าอนุมัติของ admin — สีเดียวกันทุกหน้า: สร้าง = เขียว, แก้ไข = ส้ม, ส่งใหม่ = ฟ้า
// badge = ป้าย, bar = แถบสีซ้ายของรายการ
export const REQUEST_KIND = {
  create: { label: 'สร้างใหม่', badge: 'bg-[#E3F5E9] text-[#1B6E37]', bar: 'border-l-[#2E9E57]' },
  edit: { label: 'แก้ไขข้อมูล', badge: 'bg-(--nl-accent-soft) text-[#9A4A00]', bar: 'border-l-(--nl-accent)' },
  resubmit: { label: 'ส่งใหม่หลังไม่ผ่าน', badge: 'bg-[#E5EFFA] text-[#1F5A9E]', bar: 'border-l-[#3D7CC9]' },
} as const;
export type RequestKind = keyof typeof REQUEST_KIND;

// ป้ายสถานะใบสมัคร / คำขอเพิ่มเรือของเจ้าของเรือ
export const APP_STATUS = {
  pending: { label: 'รออนุมัติ', className: 'bg-(--nl-accent-soft) text-[#9A4A00]' },
  approved: { label: 'อนุมัติแล้ว', className: 'bg-(--nl-tint) text-(--nl-teal-dk)' },
  rejected: { label: 'ไม่อนุมัติ', className: 'bg-[#EDF1F1] text-[#6B7C84]' },
} as const;
