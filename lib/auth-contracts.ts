import { z } from 'zod';
export const accountInput = z.object({ action: z.enum(['login', 'register', 'recover', 'reset', 'logout']), email: z.string().email().max(254).optional(), password: z.string().min(1).max(128).optional(), name: z.string().trim().min(1).max(100).optional() }).superRefine((b, ctx) => {
    if (['login', 'register', 'recover'].includes(b.action) && !b.email)
        ctx.addIssue({ code: 'custom', path: ['email'], message: 'Email is required.' });
    if (['login', 'register', 'reset'].includes(b.action) && !b.password)
        ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password is required.' });
    if (['register', 'reset'].includes(b.action) && b.password && b.password.length < 10)
        ctx.addIssue({ code: 'custom', path: ['password'], message: 'Use at least 10 characters.' });
    if (b.action === 'register' && !b.name)
        ctx.addIssue({ code: 'custom', path: ['name'], message: 'Name is required.' });
});
export const safeAuthDestination = (value: string | null) => value === '/reset-password' ? '/reset-password' : '/workspace';
