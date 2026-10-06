// ข้อมูลคงที่ + การคำนวณราคาของเว็บเช่าเรือ — ใช้ร่วมกันทั้งหน้าเว็บ (แสดงผล) และ API (คำนวณราคาจริง)

export type TripType = 'half' | 'full' | 'night';

export const TRIPS: { id: TripType; label: string; time: string; blurb: string }[] = [
  {
    id: 'half',
    label: 'ครึ่งวัน',
    time: '07:00–11:00 หรือ 13:00–17:00',
    blurb: '4 ชั่วโมง ออกเช้าหรือบ่าย เหมาะกับมือใหม่และครอบครัว ตกปลาใกล้ฝั่งตามกองหิน',
  },
  {
    id: 'full',
    label: 'เต็มวัน',
    time: '06:30–15:00',
    blurb: '8 ชั่วโมง ออกไกลถึงจุดน้ำลึก ลุ้นปลาอินทรี ปลากะมง และปลาเก๋า รวมอาหารกลางวันบนเรือ',
  },
  {
    id: 'night',
    label: 'ตกหมึก / กลางคืน',
    time: '17:00–06:00',
    blurb: 'ออกเย็น กลับรุ่งเช้า เปิดไฟล่อหมึกกลางทะเล มีที่นอนและอาหารเย็นบนเรือ',
  },
];

export const isTripType = (v: unknown): v is TripType => TRIPS.some((t) => t.id === v);
export const tripLabel = (id: TripType) => TRIPS.find((t) => t.id === id)!.label;

// key = ค่าที่เก็บใน boats.port
export const PORTS: { id: string; label: string; fish: string }[] = [
  { id: 'สัตหีบ', label: 'สัตหีบ, ชลบุรี', fish: 'ปลาอินทรี ปลาสาก ปลากะพง' },
  { id: 'หัวหิน', label: 'หัวหิน, ประจวบฯ', fish: 'ปลาเก๋า ปลากะมง ปลาทู' },
  { id: 'ภูเก็ต', label: 'ภูเก็ต', fish: 'ปลาโอ ปลาอินทรี ปลากระโทงแทง' },
  { id: 'เกาะช้าง', label: 'เกาะช้าง, ตราด', fish: 'หมึก ปลาเก๋า ปลาสีกุน' },
];

export const portLabel = (id: string) => PORTS.find((p) => p.id === id)?.label ?? id;

// ตัวกรองสิ่งอำนวยความสะดวก — value ตรงกับค่าใน boats.tags
export const AMENITIES: { value: string; label: string }[] = [
  { value: 'หลังคากันแดด', label: 'หลังคากันแดด' },
  { value: 'ห้องน้ำ', label: 'ห้องน้ำบนเรือ' },
  { value: 'โซนาร์', label: 'เครื่องโซนาร์หาปลา' },
  { value: 'ที่นอน', label: 'ที่นอน (ทริปค้างคืน)' },
];

// แท็กทั้งหมดที่เลือกได้ตอนเพิ่ม/แก้ไขเรือ = ตัวกรองหน้า /boats + แท็กที่ไม่ได้ใช้กรอง
export const BOAT_TAGS = [...AMENITIES.map((a) => a.value), 'ไฟล่อหมึก'];

export const ADDONS: { id: string; label: string; desc: string; per: 'person' | 'trip'; price: number }[] = [
  { id: 'gear', label: 'ชุดตกปลาพรีเมียม', desc: 'คันจิ๊กกิ้งและรอกสปินนิ่ง', per: 'person', price: 500 },
  { id: 'lunch', label: 'อาหารกลางวันบนเรือ', desc: 'ข้าว กับข้าว 2 อย่าง ผลไม้', per: 'person', price: 250 },
  { id: 'photo', label: 'ช่างภาพและโดรน', desc: 'ไฟล์ภาพและคลิปส่งภายในวันเดียวกัน', per: 'trip', price: 1500 },
];

export const addonLabel = (id: string) => ADDONS.find((a) => a.id === id)?.label ?? id;

export const INCLUDED = ['กัปตันและลูกเรือ', 'คันเบ็ดและรอก', 'เหยื่อสดและน้ำแข็ง', 'เสื้อชูชีพทุกที่นั่ง', 'น้ำดื่มตลอดทริป', 'ประกันอุบัติเหตุ'];

export const DEPOSIT_RATE = 0.3;
// จองล่วงหน้าได้ตั้งแต่พรุ่งนี้ ถึง BOOKING_WINDOW_DAYS วัน
export const BOOKING_WINDOW_DAYS = 60;
// ปฏิทินหน้ารายละเอียดเรือแสดงกี่วัน (เริ่มพรุ่งนี้) — ฟอร์มค้นหาหน้าแรกเลือกวันได้ไม่เกินช่วงนี้
export const CALENDAR_DAYS = 14;

type Priced = { priceHalf: number | null; priceFull: number | null; priceNight: number | null };

export function boatPrice(boat: Priced, trip: TripType): number | null {
  return trip === 'half' ? boat.priceHalf : trip === 'full' ? boat.priceFull : boat.priceNight;
}

// ราคารวม — ใช้ทั้งสรุปการจองฝั่ง client และตอนบันทึกฝั่ง server (ให้ตัวเลขตรงกันเสมอ)
export function quote(boat: Priced, trip: TripType, guests: number, addonIds: string[]) {
  const base = boatPrice(boat, trip);
  if (base === null) return null;

  const lines = [{ label: `ค่าเรือ (${tripLabel(trip)})`, amount: base }];
  for (const a of ADDONS) {
    if (!addonIds.includes(a.id)) continue;
    const amount = a.per === 'person' ? a.price * guests : a.price;
    lines.push({ label: a.per === 'person' ? `${a.label} × ${guests}` : a.label, amount });
  }
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total, deposit: Math.round(total * DEPOSIT_RATE) };
}

export const baht = (n: number) => '฿' + n.toLocaleString('en-US');

// ===== วันที่ (เวลาไทย) — เก็บเป็น 'YYYY-MM-DD' ตรงกับคอลัมน์ date =====

export function bangkokToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
}

export function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const isYmd = (v: unknown): v is string =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(`${v}T00:00:00Z`));

// เช่น "จ. 12 ต.ค. 69"
export function thaiDate(ymd: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }) {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString('th-TH', { ...opts, timeZone: 'UTC' });
}
