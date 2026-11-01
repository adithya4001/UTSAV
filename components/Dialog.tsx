'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Dialog({ title, close, children, wide = false }: {
    title: string;
    close: () => void;
    children: React.ReactNode;
    wide?: boolean;
}) { const ref = useRef<HTMLElement>(null); useEffect(() => { const previous = document.activeElement as HTMLElement; const els = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,select,textarea,a[href]') || []); els()[0]?.focus(); const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape')
    close(); if (e.key === 'Tab') {
    const f = els(), first = f[0], last = f.at(-1);
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
    }
} }; const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; document.addEventListener('keydown', onKey); return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = old; previous?.focus(); }; }, []); return <div className="dialog-shade" onClick={close}><section ref={ref} className={'dialog ' + (wide ? 'wide-dialog' : '')} role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={e => e.stopPropagation()}><div className="dialog-head"><div><span className="eyebrow">UTSAVOPS STUDIO</span><h2 id="dialog-title">{title}</h2></div><button className="icon-btn" aria-label="Close dialog" onClick={close}><X size={20}/></button></div>{children}</section></div>; }
