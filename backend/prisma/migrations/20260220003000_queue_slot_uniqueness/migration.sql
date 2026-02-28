-- Replace per-day uniqueness with per-slot uniqueness.
-- Old: one booking per barber/day
-- New: one booking per barber/day/time-slot

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Queue_barberId_scheduledDate_key'
    ) THEN
        ALTER TABLE "Queue" DROP CONSTRAINT "Queue_barberId_scheduledDate_key";
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_barber_slot'
    ) THEN
        ALTER TABLE "Queue" DROP CONSTRAINT "unique_barber_slot";
    END IF;
END $$;

DROP INDEX IF EXISTS "Queue_barberId_scheduledDate_key";
DROP INDEX IF EXISTS "unique_barber_slot";

CREATE UNIQUE INDEX IF NOT EXISTS "Queue_barberId_scheduledDate_scheduledTime_key"
    ON "Queue"("barberId", "scheduledDate", "scheduledTime");
