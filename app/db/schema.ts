import { pgTable, text, timestamp, integer, pgEnum, date, uniqueIndex, boolean, jsonb } from "drizzle-orm/pg-core";
import type { BoatData } from "@/app/api/boats/validate";
import { sql } from "drizzle-orm";

// owner = เจ้าของเรือ (ได้จากการอนุมัติคำขอ) — ใช้แค่แสดงเมนู สิทธิ์จริงเช็คจาก boats.owner_id
export const roleEnum = pgEnum("user_role", ["user", "admin", "owner"]);

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
  // เจ้าของเรือ — จัดการคำขอจอง / วันปิด / เปิด-ปิดเรือลำนี้ได้ (ลบ user แล้วเรือกลับเป็นไม่มีเจ้าของ)
  ownerId: text("owner_id").references(() => usersTable.id, { onDelete: "set null" }),
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

// วันที่เรือปิดรับจอง (admin กำหนด เช่น ซ่อมบำรุง / คลื่นลม / กัปตันไม่ว่าง) — วันละหนึ่งแถวต่อเรือ
// คำขอจองที่มีอยู่แล้วในวันนั้นไม่ถูกยกเลิกอัตโนมัติ
export const boatClosures = pgTable(
  "boat_closures",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    boatId: text("boat_id")
      .notNull()
      .references(() => boats.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("boat_closures_boat_date").on(t.boatId, t.date)],
);

export const ownerApplicationStatusEnum = pgEnum("owner_application_status", ["pending", "approved", "rejected"]);

// คำขอเป็นเจ้าของเรือ — ผู้ใช้กรอกข้อมูลเรือของตัวเอง (boat_data) แล้วรอ admin อนุมัติ
// อนุมัติ = สร้างเรือใหม่จาก boat_data โดย owner_id = ผู้สมัคร แล้วเก็บ id ไว้ที่ boat_id + role เป็น owner (ถ้าเดิมเป็น user)
export const ownerApplications = pgTable("owner_applications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  boatData: jsonb("boat_data").$type<BoatData>().notNull(), // ข้อมูลเรือที่ผู้สมัครกรอก (ผ่าน parseBoatBody แล้ว)
  boatId: text("boat_id").references(() => boats.id, { onDelete: "set null" }), // เรือที่สร้างตอนอนุมัติ
  phone: text("phone").notNull(),
  note: text("note"),
  status: ownerApplicationStatusEnum("status").default("pending").notNull(),
  rejectReason: text("reject_reason"), // เหตุผลที่ admin ไม่อนุมัติ — แสดงให้ผู้ส่งเห็น
  createdAt: timestamp("created_at").defaultNow().notNull(),
  decidedAt: timestamp("decided_at"),
});

export const ownerProfileStatusEnum = pgEnum("owner_profile_status", ["pending", "approved", "rejected"]);
// ประเภทคำขอที่รอตรวจ — ให้ admin แยกได้ว่าสมัครใหม่ / แก้ข้อมูลหลังอนุมัติ / ส่งใหม่หลังถูกปฏิเสธ
export const ownerProfileRequestEnum = pgEnum("owner_profile_request", ["new", "edit", "resubmit"]);

// ข้อมูลตัวตนชุดที่ admin อนุมัติล่าสุด — ใช้แสดงว่าคำขอแก้ไขเปลี่ยนอะไรไปบ้าง
export type ApprovedIdentity = { fullName: string; phone: string; address: string };

// ข้อมูลส่วนตัวของเจ้าของเรือ = ใบสมัครเป็นเจ้าของเรือ (หนึ่งแถวต่อผู้ใช้)
// ขั้นที่ 1: admin อนุมัติตัวบุคคล (status approved + role owner) → ขั้นที่ 2: ส่งคำขอเพิ่มเรือได้ (owner_applications)
// แก้ชื่อ / เบอร์ / ที่อยู่หลังอนุมัติ = กลับเป็น pending ให้ admin ตรวจใหม่
export const ownerProfiles = pgTable("owner_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  contactEmail: text("contact_email"), // อีเมลติดต่อ (ถ้ามี) — อาจไม่ใช่อีเมลที่ใช้ล็อกอิน
  status: ownerProfileStatusEnum("status").default("pending").notNull(),
  requestType: ownerProfileRequestEnum("request_type").default("new").notNull(),
  approvedData: jsonb("approved_data").$type<ApprovedIdentity>(),
  // เหตุผลที่ admin ไม่อนุมัติครั้งล่าสุด — แสดงให้ผู้สมัคร และให้ admin เห็นตอนผู้สมัครส่งใหม่ (ล้างเมื่ออนุมัติ)
  rejectReason: text("reject_reason"),
  decidedAt: timestamp("decided_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
