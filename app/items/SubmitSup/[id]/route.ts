import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({
  "returnCode" : "OK",
  "returnMessage" : "Completed Successfully",
  "tranId" : 3599
  });
}
