ALTER TABLE "plots" ADD COLUMN "user_id" text;--> statement-breakpoint
-- แปลงที่มีอยู่ก่อนแยก owner: ยกให้ admin คนแรก (ถ้าไม่มี admin ให้ user ที่สมัครก่อนสุด)
UPDATE "plots" SET "user_id" = (
	SELECT "id" FROM "users" ORDER BY ("role" = 'admin') DESC, "created_at" ASC LIMIT 1
) WHERE "user_id" IS NULL;--> statement-breakpoint
-- ไม่มี user เลย = ไม่มีใครเป็นเจ้าของได้ ลบทิ้ง ไม่งั้น SET NOT NULL จะ fail
DELETE FROM "plots" WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "plots" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
