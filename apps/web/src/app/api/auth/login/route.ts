import { NextResponse } from 'next/server';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const baseUrl =
            process.env.API_BASE_URL ||
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            DEFAULT_API_BASE_URL;

        const response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const payload = await response.json().catch(() => ({}));
        return NextResponse.json(payload, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'LOGIN_PROXY_FAILED', message: 'Login proxy error' }
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
