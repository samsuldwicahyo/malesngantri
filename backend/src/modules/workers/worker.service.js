const prisma = require('../../config/database');
const authService = require('../auth/auth.service');

const createError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const normalizeIdentifier = (payload) => {
    const raw = (payload.identifier || payload.email || payload.username || '').trim();
    const isEmail = raw.includes('@');
    const emailRaw = payload.email || (isEmail ? raw : null);
    const usernameRaw = payload.username || (!isEmail ? raw.toLowerCase() : null);

    return {
        email: emailRaw ? emailRaw.toLowerCase() : null,
        username: usernameRaw ? usernameRaw.toLowerCase() : null
    };
};

const buildWorkerResponse = (barber, user) => ({
    id: barber.id,
    userId: user.id,
    name: barber.name,
    email: user.email,
    username: user.username,
    phone: barber.phone,
    photoUrl: barber.photoUrl,
    socials: barber.socialLinks || {},
    bio: barber.bio,
    isActive: barber.isActive,
    status: barber.status
});

const ensureTenant = async (slug, user) => {
    const tenant = await prisma.barbershop.findUnique({
        where: { slug },
        select: { id: true, slug: true, name: true }
    });

    if (!tenant) {
        throw createError(404, 'Tenant not found');
    }

    if (!user || user.barbershopId !== tenant.id) {
        throw createError(403, 'Cross-tenant access is not allowed');
    }

    return tenant;
};

const ensureWorkerIdentifierUnique = async (tenantId, { email, username }, excludeUserId = null) => {
    const filters = [];
    if (email) filters.push({ email });
    if (username) filters.push({ username });

    if (filters.length === 0) {
        throw createError(400, 'Worker identifier is required');
    }

    const existing = await prisma.user.findFirst({
        where: {
            barbershopId: tenantId,
            role: 'BARBER',
            deletedAt: null,
            OR: filters,
            ...(excludeUserId ? { NOT: { id: excludeUserId } } : {})
        },
        select: { id: true }
    });

    if (existing) {
        throw createError(409, 'Email/username already used in this tenant');
    }
};

const mapPrismaError = (error) => {
    if (error?.code === 'P2002') {
        return createError(409, 'Email/username already used');
    }

    return error;
};

const buildFallbackEmail = (tenantSlug, username) => {
    const safeUsername = username || `worker${Date.now()}`;
    return `${safeUsername}.${tenantSlug}@malasngantri.com`;
};

const buildFallbackPhone = () => {
    const suffix = String(Date.now()).slice(-10);
    return `620${suffix}`;
};

const listWorkers = async (slug, actor) => {
    const tenant = await ensureTenant(slug, actor);

    const workers = await prisma.barber.findMany({
        where: { barbershopId: tenant.id, deletedAt: null },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    username: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return workers.map((barber) => buildWorkerResponse(barber, barber.user));
};

const createWorker = async (slug, payload, actor) => {
    const tenant = await ensureTenant(slug, actor);
    const { email, username } = normalizeIdentifier(payload);

    await ensureWorkerIdentifierUnique(tenant.id, { email, username });

    const passwordHash = await authService.hashPassword(payload.password);
    const workerEmail = email || buildFallbackEmail(tenant.slug, username);
    const workerPhone = payload.phone || buildFallbackPhone();
    const isActive = payload.isActive !== false;

    let result;
    try {
        result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    barbershopId: tenant.id,
                    fullName: payload.name,
                    email: workerEmail,
                    username: username || null,
                    phoneNumber: workerPhone,
                    passwordHash,
                    role: 'BARBER'
                }
            });

            const barber = await tx.barber.create({
                data: {
                    userId: user.id,
                    barbershopId: tenant.id,
                    name: payload.name,
                    phone: workerPhone,
                    email: workerEmail,
                    photoUrl: payload.photoUrl || null,
                    bio: payload.bio || null,
                    specializations: [],
                    socialLinks: payload.socials || undefined,
                    experienceYears: 0,
                    commissionType: 'PERCENTAGE',
                    commissionValue: 40,
                    status: isActive ? 'AVAILABLE' : 'OFFLINE',
                    isActive
                }
            });

            return { user, barber };
        });
    } catch (error) {
        throw mapPrismaError(error);
    }

    return buildWorkerResponse(result.barber, result.user);
};

const updateWorker = async (slug, workerId, payload, actor) => {
    const tenant = await ensureTenant(slug, actor);

    const worker = await prisma.barber.findFirst({
        where: { id: workerId, barbershopId: tenant.id, deletedAt: null },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    username: true
                }
            }
        }
    });

    if (!worker) {
        throw createError(404, 'Worker not found');
    }

    const { email, username } = normalizeIdentifier(payload);
    if (email || username) {
        await ensureWorkerIdentifierUnique(tenant.id, { email, username }, worker.user.id);
    }

    const nextEmail = email || worker.user.email;
    const nextUsername = username !== null && username !== undefined ? username : worker.user.username;
    const nextPhone = payload.phone || worker.phone;

    const userUpdates = {};
    if (payload.name) userUpdates.fullName = payload.name;
    if (email) userUpdates.email = email;
    if (username !== null && username !== undefined) userUpdates.username = username;
    if (payload.password) userUpdates.passwordHash = await authService.hashPassword(payload.password);
    if (payload.phone) userUpdates.phoneNumber = payload.phone;

    const barberUpdates = {};
    if (payload.name) barberUpdates.name = payload.name;
    if (payload.phone) barberUpdates.phone = payload.phone;
    if (payload.photoUrl !== undefined) barberUpdates.photoUrl = payload.photoUrl || null;
    if (payload.bio !== undefined) barberUpdates.bio = payload.bio || null;
    if (payload.socials !== undefined) barberUpdates.socialLinks = payload.socials || undefined;
    if (payload.isActive !== undefined) {
        barberUpdates.isActive = payload.isActive;
        barberUpdates.status = payload.isActive ? 'AVAILABLE' : 'OFFLINE';
    }

    let updated;
    try {
        updated = await prisma.$transaction(async (tx) => {
            if (Object.keys(userUpdates).length > 0) {
                const userUpdate = await tx.user.updateMany({
                    where: { id: worker.user.id, barbershopId: tenant.id, deletedAt: null },
                    data: userUpdates
                });
                if (userUpdate.count === 0) {
                    throw createError(404, 'Worker user not found in this tenant');
                }
            }

            if (Object.keys(barberUpdates).length > 0) {
                const barberUpdate = await tx.barber.updateMany({
                    where: { id: worker.id, barbershopId: tenant.id, deletedAt: null },
                    data: barberUpdates
                });
                if (barberUpdate.count === 0) {
                    throw createError(404, 'Worker not found in this tenant');
                }
            }

            return tx.barber.findFirst({
                where: { id: worker.id, barbershopId: tenant.id, deletedAt: null },
                include: {
                    user: {
                        select: { id: true, email: true, username: true }
                    }
                }
            });
        });
    } catch (error) {
        throw mapPrismaError(error);
    }

    if (!updated) {
        throw createError(404, 'Worker not found after update');
    }

    // keep email/phone in barber table in sync
    if (nextEmail !== updated.email || nextPhone !== updated.phone) {
        const syncResult = await prisma.barber.updateMany({
            where: { id: updated.id, barbershopId: tenant.id, deletedAt: null },
            data: {
                email: nextEmail,
                phone: nextPhone
            }
        });
        if (syncResult.count === 0) {
            throw createError(404, 'Worker not found during profile sync');
        }
    }

    return buildWorkerResponse(
        {
            ...updated,
            email: nextEmail,
            phone: nextPhone
        },
        { ...updated.user, email: nextEmail, username: nextUsername }
    );
};

const deleteWorker = async (slug, workerId, actor) => {
    const tenant = await ensureTenant(slug, actor);

    const worker = await prisma.barber.findFirst({
        where: { id: workerId, barbershopId: tenant.id, deletedAt: null },
        select: { id: true, userId: true }
    });
    if (!worker) {
        throw createError(404, 'Worker not found');
    }

    await prisma.$transaction(async (tx) => {
        const barberResult = await tx.barber.updateMany({
            where: { id: worker.id, barbershopId: tenant.id, deletedAt: null },
            data: {
                deletedAt: new Date(),
                isActive: false,
                status: 'OFFLINE'
            }
        });
        if (barberResult.count === 0) {
            throw createError(404, 'Worker not found in this tenant');
        }

        const userResult = await tx.user.updateMany({
            where: { id: worker.userId, barbershopId: tenant.id, deletedAt: null },
            data: { deletedAt: new Date() }
        });
        if (userResult.count === 0) {
            throw createError(404, 'Worker user not found in this tenant');
        }
    });
};

module.exports = {
    listWorkers,
    createWorker,
    updateWorker,
    deleteWorker
};
