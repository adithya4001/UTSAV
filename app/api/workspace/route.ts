import { eq, and, desc } from 'drizzle-orm';
import { getOrganiserUser } from '../../../lib/auth-server';
import { getDb } from '../../../db';
import { profiles, events } from '../../../db/schema';
import { profileSchema, stateSchema, orderStatus } from '../../../lib/contracts';
const noStore = { 'Cache-Control': 'no-store' };
export async function GET() {
    const user = await getOrganiserUser();
    if (!user)
        return Response.json({ error: 'Sign in to open your workspace.' }, { status: 401, headers: noStore });
    try {
        const db = getDb();
        const p = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
        const rows = await db.select().from(events).where(eq(events.userId, user.userId)).orderBy(desc(events.updatedAt)).limit(100);
        return Response.json({ user: { name: user.displayName, email: user.email }, profile: p[0] || null, events: rows.map(x => ({ id: x.id, state: JSON.parse(x.state), status: x.status, revision: x.revision, updatedAt: x.updatedAt })) }, { headers: noStore });
    }
    catch {
        return Response.json({ error: 'Your workspace could not be loaded. Please retry; do not clear your browser data.' }, { status: 503, headers: noStore });
    }
}
export async function POST(req: Request) {
    if (req.headers.get('origin') !== new URL(req.url).origin)
        return Response.json({ error: 'Origin not allowed.' }, { status: 403, headers: noStore });
    const user = await getOrganiserUser();
    if (!user)
        return Response.json({ error: 'Sign in to save organiser data.' }, { status: 401, headers: noStore });
    if (Number(req.headers.get('content-length') || 0) > 750000)
        return Response.json({ error: 'Request too large.' }, { status: 413, headers: noStore });
    try {
        const raw = await req.text();
        if (raw.length > 750000)
            return Response.json({ error: 'Workspace entry is too large.' }, { status: 413, headers: noStore });
        const body = JSON.parse(raw);
        const db = getDb(), now = new Date().toISOString();
        if (body.action === 'profile') {
            const p = profileSchema.parse(body.profile);
            await db.insert(profiles).values({ ...p, userId: user.userId, updatedAt: now }).onConflictDoUpdate({ target: profiles.userId, set: { ...p, updatedAt: now } });
            return Response.json({ ok: true }, { headers: noStore });
        }
        if (body.action === 'save') {
            const state = stateSchema.parse(body.state), status = orderStatus.parse(body.status);
            if (body.id) {
                if (typeof body.id !== 'string' || body.id.length > 100 || !Number.isInteger(body.revision))
                    throw Error('Invalid revision');
                const result = await db.update(events).set({ state: JSON.stringify(state), status, revision: body.revision + 1, updatedAt: now }).where(and(eq(events.id, body.id), eq(events.userId, user.userId), eq(events.revision, body.revision))).returning({ id: events.id });
                if (!result.length)
                    return Response.json({ error: 'This event changed elsewhere or is not yours. Reload orders before saving.' }, { status: 409, headers: noStore });
                return Response.json({ id: body.id, revision: body.revision + 1, updatedAt: now }, { headers: noStore });
            }
            const id = crypto.randomUUID();
            await db.insert(events).values({ id, userId: user.userId, state: JSON.stringify(state), status, revision: 1, updatedAt: now });
            return Response.json({ id, revision: 1, updatedAt: now }, { headers: noStore });
        }
        return Response.json({ error: 'Unknown operation.' }, { status: 400, headers: noStore });
    }
    catch {
        return Response.json({ error: 'Could not save. Check the form values and try again.' }, { status: 400, headers: noStore });
    }
}
