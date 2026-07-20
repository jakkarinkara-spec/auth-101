import "dotenv/config";
import { db } from "../app/db/index";
import { itemMaintenanceRequests } from "../app/db/schema";

type ImrRow = typeof itemMaintenanceRequests.$inferInsert;

const STATUSES = [
  "PENDING",
  "PROCESSING",
  "REVIEW_REQUESTED",
  "COMPLETED",
  "FAILED",
  "REJECTED",
] as const;

const ROLES = ["buyer", "senior_buyer", null] as const;

const BUYER_POOL = [
  { buyer_code: "B001", buyer_name: "บริษัท เอ จำกัด" },
  { buyer_code: "B002", buyer_name: "บริษัท บี จำกัด" },
  { buyer_code: "B003", buyer_name: "บริษัท ซี จำกัด" },
  { buyer_code: "B004", buyer_name: "บริษัท ดี จำกัด" },
  { buyer_code: "B005", buyer_name: "บริษัท อี จำกัด" },
  { buyer_code: "B006", buyer_name: "บริษัท เอฟ จำกัด" },
  { buyer_code: "B007", buyer_name: "บริษัท จี จำกัด" },
  { buyer_code: "B008", buyer_name: "บริษัท เอช จำกัด" },
];

const REQUESTERS = [
  { email: "jkarapha@cpaxtra.co.th", name: "Jakkarin K." },
  { email: "somchai@example.com", name: "สมชาย" },
  { email: "malee@example.com", name: "มาลี" },
  { email: "anong@example.com", name: "อนงค์" },
  { email: null, name: null },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// สุ่มสร้างข้อมูลตัวอย่างเพิ่มเติม ต่อเลขจาก IMR-000007 ที่มีอยู่แล้ว
function generateRows(count: number, startIndex: number): ImrRow[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;
    const buyerCount = randomInt(0, 3);
    const buyerInfo =
      buyerCount > 0
        ? [...BUYER_POOL]
            .sort(() => Math.random() - 0.5)
            .slice(0, buyerCount)
        : undefined;
    const requester = pick(REQUESTERS);
    const submittedAt = new Date(now - randomInt(0, 90) * 24 * 60 * 60 * 1000);
    const lastUpdatedAt = new Date(
      submittedAt.getTime() + randomInt(0, 10) * 24 * 60 * 60 * 1000,
    );

    return {
      imrNumber: `IMR-${String(idx).padStart(6, "0")}`,
      itemCount: randomInt(1, 20),
      buyerInfo,
      requestStatus: pick(STATUSES),
      submittedAsRole: pick(ROLES),
      requesterEmailId: requester.email,
      requestedByUserName: requester.name,
      submittedAt,
      lastUpdatedAt,
    };
  });
}

const curatedRows: ImrRow[] = [
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
  {
    imrNumber: "IMR-000007",
    itemCount: 12,
    buyerInfo: [
      { buyer_code: "B001", buyer_name: "บริษัท เอ จำกัด" },
      { buyer_code: "B002", buyer_name: "บริษัท บี จำกัด" },
      { buyer_code: "B004", buyer_name: "บริษัท ดี จำกัด" },
    ],
    requestStatus: "PENDING",
    submittedAsRole: "buyer",
    requesterEmailId: "jkarapha@cpaxtra.co.th",
    requestedByUserName: "Jakkarin K.",
    submittedAt: new Date("2026-07-14T03:00:00Z"),
    lastUpdatedAt: new Date("2026-07-14T03:00:00Z"),
  },
];

const rows: ImrRow[] = [...curatedRows, ...generateRows(100, 8)];

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
