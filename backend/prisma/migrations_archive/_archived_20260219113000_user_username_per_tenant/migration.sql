-- Add username field for tenant-scoped login identifiers
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Tenant-scoped uniqueness for username (nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'User_barbershopId_username_key'
  ) THEN
    CREATE UNIQUE INDEX "User_barbershopId_username_key"
    ON "User"("barbershopId", "username");
  END IF;
END $$;

-- Helpful RBAC lookup index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'User_barbershopId_role_idx'
  ) THEN
    CREATE INDEX "User_barbershopId_role_idx"
    ON "User"("barbershopId", "role");
  END IF;
END $$;
