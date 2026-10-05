import { pgTable, text, timestamp, integer, pgEnum, numeric, date } from "drizzle-orm/pg-core";

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

export const crops = pgTable("crops", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  dayGrow: integer("day_grow").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// แปลงปลูก — วันเก็บเกี่ยวคำนวณได้จาก plantedAt + crops.dayGrow
export const plots = pgTable("plots", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  areaRai: numeric("area_rai", { precision: 10, scale: 2 }), // ขนาดแปลง (ไร่)
  location: text("location"),
  cropId: text("crop_id").references(() => crops.id, { onDelete: "set null" }), // พืชที่ปลูกอยู่
  plantedAt: date("planted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
