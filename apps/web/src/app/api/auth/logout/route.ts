import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

const appendSetCookies = (source: Response, target: NextResponse) => {
    const headersWithGetSetCookie = source.headers as Headers & { getSetCookie?: () => string[] };
    const setCookies = headersWithGetSetCookie.getSetCookie?.() || [];

    if (setCookies.length > 0) {
        for (const cookie of setCookies) {
            target.headers.append('set-cookie', cookie);
        }
        return;
    }

    const fallbackCookie = source.headers.get('set-cookie');
    if (fallbackCookie) {
        target.headers.set('set-cookie', fallbackCookie);
    }
};

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cookieHeader = request.headers.get('cookie');
        const targetUrl = `${API_BASE_URL}/auth/logout`;
        const headers: Record<string, string> = {};

        if (authHeader) {
            headers.Authorization = authHeader;
        }
        if (cookieHeader) {
            headers.Cookie = cookieHeader;
        }

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: Object.keys(headers).length > 0 ? headers : undefined
        });

        const payload = await response.json().catch(() => ({}));
        const nextResponse = NextResponse.json(payload, { status: response.status });
        appendSetCookies(response, nextResponse);

        return nextResponse;
    } catch (error) {
        console.error('Logout Proxy Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'BACKEND_UNREACHABLE',
                    message: 'Backend API tidak dapat diakses. Pastikan backend + database berjalan.',
                    details: errorMessage
                }
            },
            { status: 503 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } },
        { status: 405 }
    );
}
