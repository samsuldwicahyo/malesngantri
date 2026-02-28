const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting emergency DB fix...');
    try {
        // Add username column if it doesn't exist
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
    `);
        console.log('Added username column to User table.');

        // Add unique index for tenant-scoped username
        await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_barbershopId_username_key" ON "User"("barbershopId", "username");
    `);
        console.log('Added unique index for username.');

        // Add slot uniqueness for Queue
        await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "unique_barber_slot" ON "Queue"("barberId", "scheduledDate");
    `);
        console.log('Added unique index for barber slots.');

        // Ensure QueueStatus enum is updated if necessary (Postgres specific)
        // We can't easily update Enums in raw SQL without knowing if they exist, 
        // but we can try to add the values.
        try {
            await prisma.$executeRawUnsafe(`ALTER TYPE "QueueStatus" ADD VALUE 'BOOKED';`);
            await prisma.$executeRawUnsafe(`ALTER TYPE "QueueStatus" ADD VALUE 'CHECKED_IN';`);
            await prisma.$executeRawUnsafe(`ALTER TYPE "QueueStatus" ADD VALUE 'IN_SERVICE';`);
            await prisma.$executeRawUnsafe(`ALTER TYPE "QueueStatus" ADD VALUE 'DONE';`);
            await prisma.$executeRawUnsafe(`ALTER TYPE "QueueStatus" ADD VALUE 'CANCELED';`);
        } catch (e) {
            console.log('Some QueueStatus values might already exist or type is different. Skipping.');
        }

        console.log('Emergency DB fix completed successfully.');
    } catch (error) {
        console.error('Failed to apply emergency fix:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
