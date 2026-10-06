import { pgTable, text, timestamp, integer, pgEnum, date, uniqueIndex, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const roleEnum = pgEnum("user_role", ["user", "admin"]);

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // เก็บ hash ไม่เก็บ plain text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: roleEnum("role").default("user").notNull(),
});

// ===== เช่าเรือตกปลา (น้ำลึก) =====

export const tripTypeEnum = pgEnum("trip_type", ["half", "full", "night"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled"]);

// เรือให้เช่า — ราคาเหมาลำ (บาท) ต่อประเภททริป, null = เรือลำนี้ไม่รับทริปแบบนั้น
export const boats = pgTable("boats", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  port: text("port").notNull(), // ชื่อสั้นของท่าเรือ ตรงกับ key ใน app/lib/boats.ts (PORTS)
  lengthM: integer("length_m").notNull(),
  seats: integer("seats").notNull(),
  kind: text("kind").notNull(),
  captain: text("captain").notNull(),
  description: text("description"),
  engine: text("engine"),
  equipment: text("equipment"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`), // สิ่งอำนวยความสะดวก ใช้กรองหน้า /boats
  priceHalf: integer("price_half"),
  priceFull: integer("price_full"),
  priceNight: integer("price_night"),
  // false = ปิดรับจอง (แทนการลบ — คำขอจองเดิมยังอยู่) ไม่แสดงในหน้าเว็บ และ API ไม่รับจองเพิ่ม
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// คำขอจอง — ราคาคำนวณที่ server ตอนสร้าง (ไม่เชื่อค่าจาก client)
export const bookings = pgTable(
  "bookings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    boatId: text("boat_id")
      .notNull()
      .references(() => boats.id, { onDelete: "cascade" }),
    tripType: tripTypeEnum("trip_type").notNull(),
    tripDate: date("trip_date").notNull(),
    guests: integer("guests").notNull(),
    addons: text("addons").array().notNull().default(sql`'{}'::text[]`),
    total: integer("total").notNull(),
    deposit: integer("deposit").notNull(),
    status: bookingStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // เรือหนึ่งลำจองได้วันละหนึ่งรายการ (ไม่นับที่ยกเลิก) — กันจองซ้อนแม้ส่งพร้อมกัน เพราะ neon-http ไม่มี transaction
  (t) => [uniqueIndex("bookings_boat_date_active").on(t.boatId, t.tripDate).where(sql`${t.status} <> 'cancelled'`)],
);
