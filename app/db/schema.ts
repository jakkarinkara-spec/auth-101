import { pgTable, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

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
