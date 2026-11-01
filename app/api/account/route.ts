import { accountInput } from '../../../lib/auth-contracts';
import { authConfigured, createAuthClient } from '../../../lib/auth-server';
const h = { 'Cache-Control': 'private, no-store', 'Pragma': 'no-cache' };
export async function GET() { return Response.json({ configured: authConfigured() }, { headers: h }); }
export async function POST(req: Request) {
    const origin = new URL(req.url).origin;
    if (req.headers.get('origin') !== origin)
        return Response.json({ error: 'Request origin is not allowed.' }, { status: 403, headers: h });
    if (!authConfigured())
        return Response.json({ error: 'Email sign-in is temporarily unavailable. Please try again later.' }, { status: 503, headers: h });
    try {
        if (Number(req.headers.get('content-length') || 0) > 6000)
            throw Error('invalid');
        const raw = await req.text();
        if (raw.length > 6000)
            throw Error('invalid');
        const parsed = accountInput.safeParse(JSON.parse(raw));
        if (!parsed.success)
            throw Error('invalid');
        const b = parsed.data;
        if (['login', 'register', 'recover'].includes(b.action) && !b.email)
            throw Error('invalid');
        if (['login', 'register', 'reset'].includes(b.action) && !b.password)
            throw Error('invalid');
        if (['register', 'reset'].includes(b.action) && b.password!.length < 10)
            throw Error('invalid');
        const client = await createAuthClient();
        const base = process.env.PUBLIC_APP_URL || origin;
        if (b.action === 'login') {
            const { error } = await client.auth.signInWithPassword({ email: b.email!, password: b.password! });
            if (error)
                return Response.json({ error: 'Unable to sign in. Check your email and password, and confirm your email if registration is new.' }, { status: 400, headers: h });
            return Response.json({ redirect: '/workspace' }, { headers: h });
        }
        if (b.action === 'register') {
            if (!b.name)
                throw Error('invalid');
            const { data, error } = await client.auth.signUp({ email: b.email!, password: b.password!, options: { data: { name: b.name }, emailRedirectTo: base + '/auth/callback?next=/workspace' } });
            if (error)
                return Response.json({ error: 'Registration could not finish. Try again later, or sign in if you already have an account.' }, { status: 400, headers: h });
            return Response.json(data.session ? { redirect: '/workspace' } : { message: 'Check your inbox for the account confirmation email. Confirm your email before signing in.' }, { headers: h });
        }
        if (b.action === 'recover') {
            const { error } = await client.auth.resetPasswordForEmail(b.email!, { redirectTo: base + '/auth/callback?next=/reset-password' });
            if (error)
                return Response.json({ error: 'The reset request could not be processed. Please retry later.' }, { status: 502, headers: h });
            return Response.json({ message: 'If an account exists for this email, you will receive a password-reset link. Check your inbox and spam folder.' }, { headers: h });
        }
        if (b.action === 'reset') {
            const { data, error: check } = await client.auth.getUser();
            if (check || !data.user)
                return Response.json({ error: 'Your reset session is missing or expired. Request a new reset email.' }, { status: 401, headers: h });
            const { error } = await client.auth.updateUser({ password: b.password! });
            if (error)
                return Response.json({ error: 'Password could not be updated. Request a fresh reset link or choose a different password.' }, { status: 400, headers: h });
            await client.auth.signOut({ scope: 'global' });
            return Response.json({ redirect: '/login?updated=1' }, { headers: h });
        }
        const { error } = await client.auth.signOut();
        if (error)
            return Response.json({ error: 'Could not complete sign out. Please retry.' }, { status: 502, headers: h });
        return Response.json({ redirect: '/' }, { headers: h });
    }
    catch {
        return Response.json({ error: 'Check your form. Passwords must contain 10–128 characters.' }, { status: 400, headers: h });
    }
}
