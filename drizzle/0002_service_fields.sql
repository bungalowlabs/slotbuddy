CREATE TABLE IF NOT EXISTS "service_fields" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "service_id" uuid NOT NULL,
  "label" text NOT NULL,
  "field_type" text DEFAULT 'text' NOT NULL,
  "required" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE "service_fields" ADD CONSTRAINT "service_fields_service_id_services_id_fk"
    FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "field_values" jsonb;
