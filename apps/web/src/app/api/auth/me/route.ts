import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cookieHeader = request.headers.get('cookie');
        const targetUrl = `${API_BASE_URL}/auth/me`;
        const headers: Record<string, string> = {};

        if (authHeader) {
            headers.Authorization = authHeader;
        }
        if (cookieHeader) {
            headers.Cookie = cookieHeader;
        }

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: Object.keys(headers).length > 0 ? headers : undefined
        });

        const payload = await response.json().catch(() => ({}));

        return NextResponse.json(payload, { status: response.status });
    } catch (error) {
        console.error('Me Proxy Error:', error);
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
