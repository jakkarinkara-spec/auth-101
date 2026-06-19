import { db } from "@/app/db/index";
import { usersTable } from "@/app/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

//ตัวรับ API routing รับ request มาจาก register page ใน request จะมี  json แล้วเอามาทำเป็น constant แล้วใช้ validate and save data
export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  ///search data from data base and validate
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { message: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  //insert data to database
  await db.insert(usersTable).values({
    name,
    email,
    password: hashedPassword,
  });

  return NextResponse.json({ message: "User created" }, { status: 201 });
}
