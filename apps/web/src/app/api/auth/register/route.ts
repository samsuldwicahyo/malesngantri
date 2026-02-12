import { NextResponse } from 'next/server';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

const resolveBaseUrl = () =>
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

const resolveAltBaseUrl = (baseUrl: string) => {
    if (baseUrl.endsWith('/api/v1')) {
        return baseUrl.replace(/\/api\/v1$/, '');
    }
    return `${baseUrl}/api/v1`;
};

const normalizeBaseUrls = (baseUrl: string, host?: string | null) => {
    const candidates = [
        baseUrl,
        resolveAltBaseUrl(baseUrl),
        DEFAULT_API_BASE_URL,
        resolveAltBaseUrl(DEFAULT_API_BASE_URL),
        'http://localhost:3001/api/v1',
        'http://localhost:3001'
    ];

    const seen = new Set<string>();
    const filtered: string[] = [];

    for (const url of candidates) {
        if (!url) continue;
        if (seen.has(url)) continue;
        if (host && url.includes(host)) {
            // Avoid proxying to the same Next host
            continue;
        }
        seen.add(url);
        filtered.push(url);
    }

    return filtered;
};

const forward = async (baseUrl: string, body: unknown) => {
    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload };
};

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const baseUrl = resolveBaseUrl();
        const host = request.headers.get('host');
        const baseUrls = normalizeBaseUrls(baseUrl, host);

        let lastResponse: Response | null = null;
        let lastPayload: any = null;

        for (const url of baseUrls) {
            const { response, payload } = await forward(url, body);
            lastResponse = response;
            lastPayload = payload;

            if (![401, 404, 502, 503].includes(response.status)) {
                return NextResponse.json(payload, { status: response.status });
            }
        }

        return NextResponse.json(lastPayload ?? {}, { status: lastResponse?.status || 500 });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'REGISTER_PROXY_FAILED', message: 'Register proxy error' }
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } },
        { status: 405 }
    );
}
