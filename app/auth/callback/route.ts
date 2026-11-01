import { safeAuthDestination } from '../../../lib/auth-contracts';
import { NextResponse } from 'next/server';
import { createAuthClient, authConfigured } from '../../../lib/auth-server';
export async function GET(req: Request) {
    const url = new URL(req.url), code = url.searchParams.get('code');
    const next = safeAuthDestination(url.searchParams.get('next'));
    if (code && authConfigured()) {
        const client = await createAuthClient();
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (!error) {
            const response = NextResponse.redirect(new URL(next, url.origin));
            response.headers.set('Cache-Control', 'private, no-store');
            return response;
        }
    }
    return NextResponse.redirect(new URL('/login?auth_error=1', url.origin));
}
