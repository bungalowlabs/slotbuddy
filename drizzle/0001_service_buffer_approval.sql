ALTER TABLE "services" ADD COLUMN "buffer_before_minutes" integer DEFAULT 0 NOT NULL;
ALTER TABLE "services" ADD COLUMN "buffer_after_minutes" integer DEFAULT 0 NOT NULL;
ALTER TABLE "services" ADD COLUMN "requires_approval" boolean DEFAULT false NOT NULL;
