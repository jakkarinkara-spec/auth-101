import { db } from "@/app/db/index";
import { itemMaintenanceRequests } from "@/app/db/schema";
import { count, desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// เกณฑ์แบ่งกลุ่มสถานะสำหรับตัวเลขสรุป (dashboard counts) ปรับได้ตามนิยามธุรกิจจริง
const PENDING_STATUSES = ["PENDING", "PROCESSING", "REVIEW_REQUESTED"] as const;
const PROCESSED_AND_COMPLETED_STATUSES = ["PROCESSING", "COMPLETED"] as const;

// รับ query param ?requesterEmailId= เพื่อให้ system อื่นที่ไม่มี session ระบุ "ฉัน" ได้
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 20);
  const requesterEmailId = searchParams.get("requesterEmailId");

  const [rows, totalResult, pendingResult, processedResult, myRequestResult] =
    await Promise.all([
      db
        .select()
        .from(itemMaintenanceRequests)
        .orderBy(desc(itemMaintenanceRequests.submittedAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ value: count() }).from(itemMaintenanceRequests),
      db
        .select({ value: count() })
        .from(itemMaintenanceRequests)
        .where(
          inArray(itemMaintenanceRequests.requestStatus, PENDING_STATUSES),
        ),
      db
        .select({ value: count() })
        .from(itemMaintenanceRequests)
        .where(
          inArray(
            itemMaintenanceRequests.requestStatus,
            PROCESSED_AND_COMPLETED_STATUSES,
          ),
        ),
      requesterEmailId
        ? db
            .select({ value: count() })
            .from(itemMaintenanceRequests)
            .where(
              eq(itemMaintenanceRequests.requesterEmailId, requesterEmailId),
            )
        : Promise.resolve([{ value: 0 }]),
    ]);

  const data = rows.map((row) => ({
    imrNumber: row.imrNumber,
    itemCount: row.itemCount,
    buyerInfo: row.buyerInfo ?? undefined,
    requestedAt: row.submittedAt ?? undefined,
    lastUpdatedAt: row.lastUpdatedAt,
    requestStatus: row.requestStatus,
    submittedAsRole: row.submittedAsRole,
    requesterEmailId: row.requesterEmailId,
    requestedByUserName: row.requestedByUserName ?? undefined,
  }));

  return NextResponse.json({
    success: true,
    data: {
      data,
      total: totalResult[0].value,
      page,
      limit,
      pendingMaintenanceRequestCount: pendingResult[0].value,
      processedAndCompletedRequestCount: processedResult[0].value,
      myRequestCount: myRequestResult[0].value,
    },
  });
}
