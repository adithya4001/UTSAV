import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export function authConfigured() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY); }
export async function createAuthClient() {
    if (!authConfigured())
        throw new Error('Email authentication is not configured yet.');
    const jar = await cookies();
    return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
        cookieOptions: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' },
        cookies: { getAll: () => jar.getAll(), setAll: (items) => { try {
                items.forEach(({ name, value, options }) => jar.set(name, value, options));
            }
            catch { /* Server components cannot set cookies. Route handlers refresh them. */ } } }
    });
}
export async function getOrganiserUser() {
    if (!authConfigured())
        return null;
    try {
        const client = await createAuthClient();
        const { data, error } = await client.auth.getUser();
        if (error || !data.user)
            return null;
        return { userId: data.user.id, email: data.user.email || '', displayName: String(data.user.user_metadata?.name || data.user.email || 'Organiser') };
    }
    catch {
        return null;
    }
}
