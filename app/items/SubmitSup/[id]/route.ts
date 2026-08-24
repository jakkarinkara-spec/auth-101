import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
  "returnCode" : "OK",
  "returnMessage" : "Completed Successfully",
  "tranId" : 3599
  });
}
