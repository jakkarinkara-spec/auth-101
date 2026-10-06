import { db } from "@/app/db/index";
import { boats } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { ADDONS, BOOKING_WINDOW_DAYS, addDays, bangkokToday, isTripType, isYmd, quote, type TripType } from "@/app/lib/boats";

// ตรวจ body ของคำขอจอง แล้วคำนวณราคาใหม่ที่ server — client ส่งมาแค่ตัวเลือก ไม่ส่งราคา

type BookingData = {
  boatId: string;
  tripType: TripType;
  tripDate: string;
  guests: number;
  addons: string[];
  total: number;
  deposit: number;
};

export async function parseBookingBody(body: unknown): Promise<{ data: BookingData } | { error: string; status?: number }> {
  const b = body as Record<string, unknown> | null;
  const boatId = typeof b?.boatId === "string" ? b.boatId : "";
  const tripType = b?.tripType;
  const tripDate = b?.tripDate;
  const guests = Number(b?.guests);
  const addons = Array.isArray(b?.addons) ? b.addons.filter((a): a is string => typeof a === "string") : [];

  if (!boatId) return { error: "Boat is required" };
  if (!isTripType(tripType)) return { error: "Trip type must be half, full or night" };
  if (!isYmd(tripDate)) return { error: "Trip date must be YYYY-MM-DD" };

  // จองได้ตั้งแต่พรุ่งนี้ (เวลาไทย) ถึง BOOKING_WINDOW_DAYS วันข้างหน้า — string YYYY-MM-DD เทียบกันได้ตรงๆ
  const today = bangkokToday();
  if (tripDate <= today || tripDate > addDays(today, BOOKING_WINDOW_DAYS)) {
    return { error: `Trip date must be between tomorrow and ${BOOKING_WINDOW_DAYS} days ahead` };
  }

  if (addons.some((a) => !ADDONS.some((x) => x.id === a))) return { error: "Unknown add-on" };

  const [boat] = await db.select().from(boats).where(eq(boats.id, boatId)).limit(1);
  if (!boat) return { error: "Boat not found", status: 404 };
  if (!boat.active) return { error: "This boat is not accepting bookings", status: 409 };

  if (!Number.isInteger(guests) || guests < 1 || guests > boat.seats) {
    return { error: `Guests must be between 1 and ${boat.seats}` };
  }

  const q = quote(boat, tripType, guests, addons);
  if (!q) return { error: "This boat does not offer that trip type" };

  return {
    data: { boatId, tripType, tripDate, guests, addons: [...new Set(addons)], total: q.total, deposit: q.deposit },
  };
}
