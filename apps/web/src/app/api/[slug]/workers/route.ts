import { NextResponse } from 'next/server';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1';

const resolveBaseUrl = () =>
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:5000/api/v1';

const toApiRoot = (baseUrl: string) => {
    if (baseUrl.endsWith('/api/v1')) return baseUrl;
    if (baseUrl.endsWith('/api')) return `${baseUrl}/v1`;
    return `${baseUrl.replace(/\/$/, '')}/api/v1`;
};

const resolveApiRoots = (host?: string | null) => {
    const baseUrl = resolveBaseUrl();
    const candidates = [
        toApiRoot(baseUrl),
        DEFAULT_API_BASE_URL,
        'http://localhost:5000/api/v1',
        'http://localhost:3001/api/v1'
    ];

    const seen = new Set<string>();
    const filtered: string[] = [];

    for (const url of candidates) {
        if (!url) continue;
        if (seen.has(url)) continue;
        if (host && url.includes(host)) continue;
        seen.add(url);
        filtered.push(url);
    }

    return filtered;
};

const forward = async (apiRoot: string, slug: string, method: 'GET' | 'POST', token: string, body?: unknown) => {
    const response = await fetch(`${apiRoot}/${slug}/workers`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload };
};

const extractToken = (request: Request) => {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const cookieToken = cookieHeader
        .split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith('accessToken='))
        ?.split('=')[1];

    return cookieToken ? decodeURIComponent(cookieToken) : null;
};

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const token = extractToken(request);
    if (!token) {
        return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { slug } = await params;
    const apiRoots = resolveApiRoots(request.headers.get('host'));
    let lastResponse: Response | null = null;
    let lastPayload: any = null;

    for (const apiRoot of apiRoots) {
        const { response, payload } = await forward(apiRoot, slug, 'GET', token);
        lastResponse = response;
        lastPayload = payload;
        if (![404, 502, 503].includes(response.status)) {
            return NextResponse.json(payload, { status: response.status });
        }
    }

    return NextResponse.json(lastPayload ?? {}, { status: lastResponse?.status || 500 });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const token = extractToken(request);
    if (!token) {
        return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const apiRoots = resolveApiRoots(request.headers.get('host'));
    let lastResponse: Response | null = null;
    let lastPayload: any = null;

    for (const apiRoot of apiRoots) {
        const { response, payload } = await forward(apiRoot, slug, 'POST', token, body);
        lastResponse = response;
        lastPayload = payload;
        if (![404, 502, 503].includes(response.status)) {
            return NextResponse.json(payload, { status: response.status });
        }
    }

    return NextResponse.json(lastPayload ?? {}, { status: lastResponse?.status || 500 });
}
