import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'UtsavOps — Event Command Centre', description: 'Client vision. Human expertise. One coordinated event. AI-assisted event operations with budgets, approvals and recovery planning.' };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body>{children}</body></html>; }
