// Prisma Client initialization
const fs = require('fs');
const os = require('os');
const { URL } = require('url');
const { PrismaClient } = require('@prisma/client');

const isWslEnvironment = () => {
    if (process.platform !== 'linux') return false;

    const release = os.release().toLowerCase();
    if (release.includes('microsoft')) return true;

    try {
        const version = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
        return version.includes('microsoft');
    } catch {
        return false;
    }
};

const getWslWindowsHost = () => {
    try {
        const resolvConf = fs.readFileSync('/etc/resolv.conf', 'utf8');
        const nameserverLine = resolvConf
            .split('\n')
            .map((line) => line.trim())
            .find((line) => line.startsWith('nameserver '));

        if (!nameserverLine) return null;
        const [, host] = nameserverLine.split(/\s+/);
        return host || null;
    } catch {
        return null;
    }
};

const resolveDatabaseUrl = () => {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) return undefined;
    if (!isWslEnvironment()) return rawUrl;

    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return rawUrl;
    }

    // Docker Desktop on Windows can be unreachable via localhost from WSL.
    if (!['localhost', '127.0.0.1'].includes(parsed.hostname)) {
        return rawUrl;
    }

    const windowsHost = getWslWindowsHost();
    if (!windowsHost) {
        return rawUrl;
    }

    const originalHost = parsed.hostname;
    parsed.hostname = windowsHost;

    const resolvedUrl = parsed.toString();
    if (resolvedUrl !== rawUrl && process.env.NODE_ENV !== 'test') {
        console.log(
            `[database] WSL detected. DATABASE_URL host rewritten from ${originalHost} to ${windowsHost}.`,
        );
    }
    return resolvedUrl;
};

const datasourceUrl = resolveDatabaseUrl();

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
});

module.exports = prisma;
