-- QueueStatus migration: legacy queue model -> final booking state machine
-- WAITING      -> BOOKED
-- CALLED       -> CHECKED_IN
-- IN_PROGRESS  -> IN_SERVICE
-- COMPLETED    -> DONE
-- CANCELLED    -> CANCELED
-- SKIPPED      -> NO_SHOW

CREATE TYPE "QueueStatus_new" AS ENUM (
  'BOOKED',
  'CHECKED_IN',
  'IN_SERVICE',
  'DONE',
  'NO_SHOW',
  'CANCELED'
);

ALTER TABLE "Queue"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Queue"
ALTER COLUMN "status" TYPE "QueueStatus_new"
USING (
  CASE "status"::text
    WHEN 'WAITING' THEN 'BOOKED'
    WHEN 'CALLED' THEN 'CHECKED_IN'
    WHEN 'IN_PROGRESS' THEN 'IN_SERVICE'
    WHEN 'COMPLETED' THEN 'DONE'
    WHEN 'NO_SHOW' THEN 'NO_SHOW'
    WHEN 'CANCELLED' THEN 'CANCELED'
    WHEN 'SKIPPED' THEN 'NO_SHOW'
    ELSE 'BOOKED'
  END
)::"QueueStatus_new";

DROP TYPE "QueueStatus";
ALTER TYPE "QueueStatus_new" RENAME TO "QueueStatus";

ALTER TABLE "Queue"
ALTER COLUMN "status" SET DEFAULT 'BOOKED';
