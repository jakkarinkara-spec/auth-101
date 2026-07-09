import "dotenv/config";
import { db } from "../app/db/index";
import { itemMaintenanceRequests } from "../app/db/schema";

const rows: (typeof itemMaintenanceRequests.$inferInsert)[] = [
  {
    imrNumber: "IMR-000001",
    itemCount: 3,
    buyerInfo: [{ buyer_code: "B001", buyer_name: "บริษัท เอ จำกัด" }],
    requestStatus: "PENDING",
    submittedAsRole: "buyer",
    requesterEmailId: "jkarapha@cpaxtra.co.th",
    requestedByUserName: "Jakkarin K.",
    submittedAt: new Date("2026-07-01T02:00:00Z"),
    lastUpdatedAt: new Date("2026-07-01T02:00:00Z"),
  },
  // ตัวอย่าง exploded senior-buyer group row: 1 คำขอ แตกเป็นหลาย imrNumber ต่อ buyer
  {
    imrNumber: "IMR-000002-B001",
    itemCount: 5,
    buyerInfo: [{ buyer_code: "B001", buyer_name: "บริษัท เอ จำกัด" }],
    requestStatus: "PROCESSING",
    submittedAsRole: "senior_buyer",
    requesterEmailId: "jkarapha@cpaxtra.co.th",
    requestedByUserName: "Jakkarin K.",
    submittedAt: new Date("2026-07-02T03:30:00Z"),
    lastUpdatedAt: new Date("2026-07-03T09:15:00Z"),
  },
  {
    imrNumber: "IMR-000002-B002",
    itemCount: 5,
    buyerInfo: [{ buyer_code: "B002", buyer_name: "บริษัท บี จำกัด" }],
    requestStatus: "PROCESSING",
    submittedAsRole: "senior_buyer",
    requesterEmailId: "somchai@example.com",
    requestedByUserName: "สมชาย",
    submittedAt: new Date("2026-07-02T03:30:00Z"),
    lastUpdatedAt: new Date("2026-07-03T09:15:00Z"),
  },
  {
    imrNumber: "IMR-000003",
    itemCount: 1,
    requestStatus: "REVIEW_REQUESTED",
    submittedAsRole: "buyer",
    requesterEmailId: "somchai@example.com",
    requestedByUserName: "สมชาย",
    submittedAt: new Date("2026-07-04T06:45:00Z"),
    lastUpdatedAt: null,
  },
  {
    imrNumber: "IMR-000004",
    itemCount: 8,
    buyerInfo: [{ buyer_code: "B003", buyer_name: "บริษัท ซี จำกัด" }],
    requestStatus: "COMPLETED",
    submittedAsRole: "buyer",
    requesterEmailId: "jkarapha@cpaxtra.co.th",
    requestedByUserName: "Jakkarin K.",
    submittedAt: new Date("2026-06-20T01:00:00Z"),
    lastUpdatedAt: new Date("2026-06-25T04:20:00Z"),
  },
  {
    imrNumber: "IMR-000005",
    itemCount: 2,
    requestStatus: "FAILED",
    submittedAsRole: "buyer",
    requesterEmailId: "somchai@example.com",
    requestedByUserName: "สมชาย",
    submittedAt: new Date("2026-06-28T08:10:00Z"),
    lastUpdatedAt: new Date("2026-06-28T08:30:00Z"),
  },
  {
    imrNumber: "IMR-000006",
    itemCount: 4,
    requestStatus: "REJECTED",
    submittedAsRole: null,
    requesterEmailId: null,
    requestedByUserName: null,
    submittedAt: new Date("2026-06-15T10:00:00Z"),
    lastUpdatedAt: new Date("2026-06-16T11:00:00Z"),
  },
];

async function main() {
  const inserted = await db
    .insert(itemMaintenanceRequests)
    .values(rows)
    .onConflictDoNothing({ target: itemMaintenanceRequests.imrNumber })
    .returning({ imrNumber: itemMaintenanceRequests.imrNumber });

  console.log(`Inserted ${inserted.length}/${rows.length} row(s):`);
  for (const row of inserted) console.log(`  - ${row.imrNumber}`);

  const skipped = rows.length - inserted.length;
  if (skipped > 0) {
    console.log(`Skipped ${skipped} row(s) that already exist (matched by imrNumber).`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
