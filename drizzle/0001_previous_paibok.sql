ALTER TABLE "todos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "todos" DROP CONSTRAINT "todos_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "position" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;