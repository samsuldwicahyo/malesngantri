const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Create Barbershop
    const barbershop = await prisma.barbershop.upsert({
        where: { slug: 'the-gentleman-barber' },
        update: {},
        create: {
            name: 'The Gentleman Barber',
            slug: 'the-gentleman-barber',
            address: 'Jl. Sudirman No. 123, Jakarta',
            timezone: 'Asia/Jakarta',
            settings: {
                theme: 'dark',
                allowOnlineBooking: true
            }
        }
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1.5 Create Super Admin User
    await prisma.user.upsert({
        where: { email: 'superadmin@barber.com' },
        update: {},
        create: {
            fullName: 'Platform Owner',
            email: 'superadmin@barber.com',
            phoneNumber: '081111111111',
            passwordHash: passwordHash,
            role: 'SUPER_ADMIN'
        }
    });

    // 2. Create Admin User
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@barber.com' },
        update: {},
        create: {
            fullName: 'Admin Gentleman',
            email: 'admin@barber.com',
            phoneNumber: '081234567890',
            passwordHash: passwordHash,
            role: 'ADMIN',
            barbershopId: barbershop.id
        }
    });

    // 3. Create Barber User
    const barberUser = await prisma.user.upsert({
        where: { email: 'barber@barber.com' },
        update: {},
        create: {
            fullName: 'Budi The Barber',
            email: 'barber@barber.com',
            phoneNumber: '081234567891',
            passwordHash: passwordHash,
            role: 'BARBER',
            barbershopId: barbershop.id
        }
    });

    // 4. Create Barber Record
    const barber = await prisma.barber.upsert({
        where: { userId: barberUser.id },
        update: {},
        create: {
            userId: barberUser.id,
            barbershopId: barbershop.id,
            name: 'Budi The Barber',
            phone: '081234567891',
            experienceYears: 5,
            commissionType: 'PERCENTAGE',
            commissionValue: 40,
            status: 'AVAILABLE'
        }
    });

    // 5. Create Customer User
    const customerUser = await prisma.user.upsert({
        where: { email: 'customer@gmail.com' },
        update: {},
        create: {
            fullName: 'Andi Customer',
            email: 'customer@gmail.com',
            phoneNumber: '081234567892',
            passwordHash: passwordHash,
            role: 'CUSTOMER'
        }
    });

    // 6. Create Services
    const servicesData = [
        { name: 'Haircut Premium', price: 50000, duration: 45, description: 'Potong rambut dengan cuci' },
        { name: 'Shaving', price: 30000, duration: 30, description: 'Cukur jenggot dengan handuk hangat' },
        { name: 'Hair Coloring', price: 150000, duration: 90, description: 'Pewarnaan rambut semi-permanen' }
    ];

    for (const s of servicesData) {
        const service = await prisma.service.create({
            data: {
                ...s,
                barbershopId: barbershop.id
            }
        });

        // Link service to barber
        await prisma.barberService.create({
            data: {
                barberId: barber.id,
                serviceId: service.id
            }
        });
    }

    // 7. Create Barber Schedule
    const days = [1, 2, 3, 4, 5]; // Mon-Fri
    for (const day of days) {
        await prisma.barberSchedule.create({
            data: {
                barberId: barber.id,
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '18:00',
                isWorkDay: true
            }
        });
    }

    console.log('Seed completed successfully!');
    console.log('--- Account Credentials ---');
    console.log('Admin:    admin@barber.com / password123');
    console.log('Barber:   barber@barber.com / password123');
    console.log('Customer: customer@gmail.com / password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
