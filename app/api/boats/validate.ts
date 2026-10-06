import { BOAT_TAGS, PORTS } from "@/app/lib/boats";

// ตรวจ body ของเรือ — ใช้ร่วมกันระหว่าง POST (เพิ่ม) และ PATCH (แก้ไข ส่งทุก field มาแทนค่าเดิม)

// ค่าสูงสุดของ Postgres integer — เกินนี้ insert จะ error เป็น 500
const MAX_INT = 2147483647;

export type BoatData = {
  name: string;
  port: string;
  lengthM: number;
  seats: number;
  kind: string;
  captain: string;
  description: string | null;
  engine: string | null;
  equipment: string | null;
  tags: string[];
  priceHalf: number | null;
  priceFull: number | null;
  priceNight: number | null;
};

export function parseBoatBody(body: unknown): { data: BoatData } | { error: string } {
  const b = body as Record<string, unknown> | null;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(b?.name);
  const port = str(b?.port);
  const kind = str(b?.kind);
  const captain = str(b?.captain);
  const lengthM = Number(b?.lengthM);
  const seats = Number(b?.seats);

  if (!name) return { error: "Boat name is required" };
  if (!PORTS.some((p) => p.id === port)) return { error: "Port must be one of the listed ports" };
  if (!kind) return { error: "Boat type is required" };
  if (!captain) return { error: "Captain name is required" };
  if (!Number.isInteger(lengthM) || lengthM < 1 || lengthM > 200) return { error: "Length must be a whole number 1–200 m" };
  if (!Number.isInteger(seats) || seats < 1 || seats > 100) return { error: "Seats must be a whole number 1–100" };

  // ราคา: ว่าง = ไม่รับทริปแบบนั้น (null) — ต้องมีอย่างน้อยหนึ่งแบบ
  const price = (v: unknown): number | null | "invalid" => {
    if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= MAX_INT ? n : "invalid";
  };
  const priceHalf = price(b?.priceHalf);
  const priceFull = price(b?.priceFull);
  const priceNight = price(b?.priceNight);
  if (priceHalf === "invalid" || priceFull === "invalid" || priceNight === "invalid") {
    return { error: "Prices must be whole numbers greater than 0 (or empty)" };
  }
  if (priceHalf === null && priceFull === null && priceNight === null) {
    return { error: "Set a price for at least one trip type" };
  }

  const rawTags = Array.isArray(b?.tags) ? b.tags.filter((t): t is string => typeof t === "string") : [];
  if (rawTags.some((t) => !BOAT_TAGS.includes(t))) return { error: "Unknown tag" };

  return {
    data: {
      name,
      port,
      lengthM,
      seats,
      kind,
      captain,
      description: str(b?.description) || null,
      engine: str(b?.engine) || null,
      equipment: str(b?.equipment) || null,
      // เรียงตามลำดับใน BOAT_TAGS ให้แสดงผลคงที่
      tags: BOAT_TAGS.filter((t) => rawTags.includes(t)),
      priceHalf,
      priceFull,
      priceNight,
    },
  };
}
