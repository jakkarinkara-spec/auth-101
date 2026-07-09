import { pgTable, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // เก็บ hash ไม่เก็บ plain text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crops = pgTable("crops", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  dayGrow: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PENDING -> PROCESSING -> REVIEW_REQUESTED -> COMPLETED, or FAILED / REJECTED
export const itemMaintenanceRequestStatusEnum = pgEnum(
  "item_maintenance_request_status",
  [
    "PENDING",
    "PROCESSING",
    "REVIEW_REQUESTED",
    "COMPLETED",
    "FAILED",
    "REJECTED",
  ],
);

export const itemMaintenanceRequests = pgTable("item_maintenance_requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  imrNumber: text("imr_number").notNull().unique(), // "IMR-000001" or "IMR-000001-<buyerCode>" for exploded rows
  itemCount: integer("item_count").notNull().default(0),
  buyerInfo: jsonb("buyer_info").$type<
    { buyer_code: string; buyer_name: string }[]
  >(),
  requestStatus: itemMaintenanceRequestStatusEnum("request_status")
    .notNull()
    .default("PENDING"),
  submittedAsRole: text("submitted_as_role"),
  requesterEmailId: text("requester_email_id"),
  requestedByUserName: text("requested_by_user_name"),
  submittedAt: timestamp("submitted_at"),
  lastUpdatedAt: timestamp("last_updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
