'use client';
import {demoFetch as fetch} from '../lib/demo-account';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowRight, ArrowUpRight, Plus, Sun, Moon, SlidersHorizontal, UserRound, BookOpen, ChevronLeft, ChevronRight, Check, CheckCircle2, Clock, MapPin, Users, Wallet, Sparkles, ShieldCheck, AlertTriangle, Download, LogIn, LogOut, Save, Search, Flower2, CalendarDays, ClipboardCheck, RefreshCw, Play, LayoutGrid, X, Cloud, Monitor } from 'lucide-react';
import Dialog from '../components/Dialog';
import Tutorial, { lessons } from '../components/Tutorial';
import EventBrief from '../components/EventBrief';
import StageArt from '../components/StageArt';
import { seed, totals, money, guestProposal, delayProposal, approve, conflicts } from '../lib/engine.mjs';
import { createEventPlan, creativeBlueprint, nextAction } from '../lib/planning.mjs';
import { stateSchema, profileSchema } from '../lib/contracts';
type Order = {
    id: string | null;
    state: any;
    status: string;
    revision: number;
    updatedAt?: string;
};
const steps = [['Client brief', 'The essentials'], ['Creative plan', 'The experience'], ['Budget & vendors', 'The resources'], ['Team & schedule', 'The people'], ['Review & delivery', 'The decisions']];
const statuses = ['Enquiry', 'Confirmed', 'Planning', 'Live', 'Completed'];
const demoKey = 'utsavops-v2-demo';
export default function OrganiserStudio() {
    const [screen, setScreen] = useState('orders'), [step, setStep] = useState(0), [modal, setModal] = useState(''), [orders, setOrders] = useState<Order[]>([]), [order, setOrder] = useState<Order | null>(null), [s, setS] = useState<any>(seed), [user, setUser] = useState<any>(null), [profile, setProfile] = useState<any>(null), [profileDraft, setProfileDraft] = useState({ name: '', company: '', city: '', specialty: 'All event types' }), [loading, setLoading] = useState(true), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false), [filter, setFilter] = useState('All orders'), [search, setSearch] = useState(''), [theme, setTheme] = useState('light'), [brightness, setBrightness] = useState(100), [count, setCount] = useState(260), [delay, setDelay] = useState(45), [tutorialDone, setTutorialDone] = useState(false);
    const original = useRef('');
    const notify = (text: string) => setNotice(text);
    const loadWorkspace = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch('/api/workspace');
            const data: any = await r.json();
            if (!r.ok) {
                if (r.status === 401) {
                    window.location.assign('/login');
                    return;
                }
                throw Error(data.error);
            }
            setUser(data.user);
            setProfile(data.profile);
            if (data.user) {
                setOrders(data.events);
                setProfileDraft(data.profile || { name: data.user.name, company: '', city: '', specialty: 'All event types' });
            }
            else {
                try {
                    const saved = JSON.parse(localStorage.getItem(demoKey) || '[]');
                    setOrders(saved.filter((o: any) => stateSchema.safeParse(o.state).success));
                }
                catch {
                    setOrders([]);
                }
            }
        }
        catch (e: any) {
            notify(e.message);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        try {
            const p = JSON.parse(localStorage.getItem('utsavops-appearance') || '{}');
            setTheme(['light', 'dark'].includes(p.theme) ? p.theme : 'light');
            setBrightness(Math.max(70, Math.min(110, Number(p.brightness) || 100)));
            setTutorialDone(localStorage.getItem('utsavops-tutorial') === 'done');
        }
        catch { }
        loadWorkspace();
    }, [loadWorkspace]);
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem('utsavops-appearance', JSON.stringify({ theme, brightness }));
        }
        catch { }
    }, [theme, brightness]);
    useEffect(() => {
        if (order)
            setDirty(JSON.stringify({ state: s, status: order.status }) !== original.current);
    }, [s, order]);
    useEffect(() => {
        const warn = (e: BeforeUnloadEvent) => {
            if (dirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);
    function openOrder(o: Order) {
        if (dirty) {
            notify('Save your current event before switching orders.');
            return;
        }
        setOrder(o);
        setS(structuredClone(o.state));
        original.current = JSON.stringify({ state: o.state, status: o.status });
        setDirty(false);
        setStep(0);
        setScreen('event');
    }
    async function saveEvent(state = s, status = order?.status || 'Planning', newOrder = false) {
        setBusy(true);
        try {
            if (!stateSchema.safeParse(state).success)
                throw Error('Event contains invalid values. Review the brief, budget and tasks.');
            if (user) {
                const r = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', id: newOrder ? null : order?.id, revision: newOrder ? undefined : order?.revision, state, status }) });
                const result: any = await r.json();
                if (!r.ok)
                    throw Error(result.error);
                const o = { ...result, state: structuredClone(state), status };
                setOrder(o);
                setOrders(prev => [o, ...prev.filter(x => x.id !== o.id)]);
                original.current = JSON.stringify({ state, status });
                setDirty(false);
                notify('Saved securely to your organiser account.');
            }
            else {
                const o = { id: newOrder || !order?.id ? `demo-${Date.now()}` : order.id, state: structuredClone(state), status, revision: (order?.revision || 0) + 1, updatedAt: new Date().toISOString() };
                let list = [o, ...orders.filter(x => x.id !== o.id)];
                localStorage.setItem(demoKey, JSON.stringify(list));
                setOrder(o);
                setOrders(list);
                original.current = JSON.stringify({ state, status });
                setDirty(false);
                notify('Demo order saved on this device. Sign in for your own cloud workspace.');
            }
        }
        catch (e: any) {
            notify(e.message);
        }
        finally {
            setBusy(false);
        }
    }
    function create(b: any) { const state = createEventPlan(b); setS(state); setOrder({ id: null, state, status: 'Enquiry', revision: 0 }); original.current = ''; setDirty(true); setModal(''); setScreen('event'); setStep(1); notify('Your order is ready. Review the personalised draft, then save your event.'); }
    function startDemo() { const sample = seed(); sample.brief = { ...sample.brief, venue: 'The Courtyard', style: 'Heritage', setting: 'Mixed', priority: 'Guest comfort', start: '14:00', capacity: 250 }; sample.blueprint = creativeBlueprint(sample.brief); setOrder({ id: null, state: sample, status: 'Planning', revision: 0 }); setS(sample); original.current = ''; setDirty(true); setScreen('event'); setStep(0); notify('Sample event opened. All vendor names and quotes are illustrative.'); }
    function propose(kind: string) {
        try {
            const p = kind === 'guests' ? guestProposal(s, count) : delayProposal(s, delay);
            setS({ ...s, proposals: [p, ...s.proposals] });
            setModal('');
            setStep(4);
            notify('Impact preview created. The operational plan is unchanged until you approve.');
        }
        catch (e: any) {
            notify(e.message);
        }
    }
    async function ai() {
        setBusy(true);
        try {
            const r = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s.brief) });
            const data: any = await r.json();
            if (!r.ok) {
                if (r.status === 401) {
                    window.location.assign('/login');
                    return;
                }
                throw Error(data.error);
            }
            setS({ ...s, blueprint: data });
            notify('AI creative draft generated. Review it before committing resources.');
        }
        catch (e: any) {
            notify(e.message);
        }
        finally {
            setBusy(false);
        }
    }
    function exportPlan() { const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `utsavops-${s.brief.type.toLowerCase()}-plan.json`; a.click(); URL.revokeObjectURL(url); }
    async function saveProfile(e: React.FormEvent) {
        e.preventDefault();
        const p = profileSchema.safeParse(profileDraft);
        if (!p.success) {
            notify(p.error.issues[0].message);
            return;
        }
        setBusy(true);
        try {
            const r = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'profile', profile: p.data }) });
            const data: any = await r.json();
            if (!r.ok) {
                if (r.status === 401) {
                    window.location.assign('/login');
                    return;
                }
                throw Error(data.error);
            }
            setProfile(p.data);
            setModal('');
            notify('Organiser profile saved. Your studio is ready.');
        }
        catch (e: any) {
            notify(e.message);
        }
        finally {
            setBusy(false);
        }
    }
    const total = totals(s), pending = s.proposals.filter((p: any) => p.status === 'Pending'), issues = conflicts(s.tasks), done = s.tasks.filter((x: any) => x.status === 'Completed').length;
    const filtered = orders.filter(o => (filter === 'All orders' || o.status === filter) && (o.state.brief.name + ' ' + o.state.brief.city).toLowerCase().includes(search.toLowerCase()));
    const close = () => setModal('');
    const badge = (text: string, color = '') => <span className={'tag ' + color}>{text}</span>;
    if (loading || !user)
        return <div className="account-loading"><Flower2 size={35}/><h1>Opening your private studio…</h1><p>{notice || 'Checking your organiser session.'}</p><a href="/login">Return to sign in</a></div>;
    return <div className="studio" style={{ '--brightness': brightness / 100 } as React.CSSProperties}><a href="#main-content" className="skip">Skip to content</a><header className="studio-header"><a className="wordmark" href="#" onClick={e => { e.preventDefault(); setScreen('orders'); }}><span className="logo-mark"><Flower2 size={25} strokeWidth={1.4}/></span>utsav<span>ops</span><i>EVENT STUDIO</i></a><nav aria-label="Main navigation"><button className={screen === 'orders' ? 'active' : ''} onClick={() => setScreen('orders')}><LayoutGrid size={15}/>Orders</button>{order && <button className={screen === 'event' ? 'active' : ''} onClick={() => setScreen('event')}><Flower2 size={15}/>Event studio{dirty && <i className="unsaved-dot"/>}</button>}<button onClick={() => setModal('learn')}><BookOpen size={15}/>Learn</button></nav><div className="header-tools"><button className="icon-btn theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button><button className="icon-btn" aria-label="Appearance settings" onClick={() => setModal('appearance')}><SlidersHorizontal size={18}/></button>{user ? <button className="profile-pill" onClick={() => setModal('profile')}><span>{(profile?.name || user.name || 'O').slice(0, 1)}</span><b>{profile?.company || 'Set up profile'}</b><ChevronRight size={14}/></button> : <a className="btn primary small" href="/login" target="_top"><LogIn size={15}/>Organiser sign in</a>}</div></header>
 {notice && <div className="toast" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16}/></button></div>}
 <main id="main-content">{screen === 'orders' ? <><section className="welcome-grid"><div className="welcome-copy"><div className="eyebrow"><span className="live-dot"/>{user ? 'YOUR ORGANISER WORKSPACE' : 'MEET YOUR EVENT OPERATIONS STUDIO'}</div><h1>Behind every great<br />celebration, <em>a clear plan.</em></h1><p>Bring the vision. Align the people. Keep every moving part in rhythm—from the first brief to the final toast.</p><div className="welcome-actions"><button className="btn primary" onClick={() => setModal('new')}><Plus size={17}/>Create an event order</button><button className="btn text" onClick={() => setModal('tutorial')}><Play size={15}/>Take a 2-minute tour</button></div><div className="welcome-trust"><ShieldCheck size={15}/>{user ? 'Signed-in orders are private to your account.' : 'Explore freely. Sign in to save your own organiser workspace.'}</div></div><div className="welcome-art"><div className="art-label"><span>THE ART OF</span><b>bringing it<br />all together.</b></div><StageArt type="Wedding" style="Heritage"/><div className="art-caption"><span>VISION → PEOPLE → CELEBRATION</span><span>EST. FOR THE DETAILS</span></div></div></section>
 {!tutorialDone && <section className="onboarding-strip"><div className="number-seal">01</div><div><h3>First time in the studio?</h3><p>Start with one order. We’ll guide you through five practical steps.</p></div><button className="btn secondary" onClick={() => setModal('tutorial')}>Show me how <ArrowRight size={15}/></button><button className="icon-btn" aria-label="Dismiss getting started" onClick={() => { setTutorialDone(true); localStorage.setItem('utsavops-tutorial', 'done'); }}><X size={15}/></button></section>}
 <section className="orders-section"><div className="section-title"><div><span className="eyebrow">YOUR PIPELINE</span><h2>Every occasion, in order<span className="subtle-count">{orders.length}</span></h2></div><label className="search"><Search size={16}/><input aria-label="Search orders" placeholder="Search events or cities" value={search} onChange={e => setSearch(e.target.value)}/></label></div><div className="order-filters" role="group" aria-label="Filter event orders">{['All orders', ...statuses].map(x => <button className={filter === x ? 'selected' : ''} key={x} onClick={() => setFilter(x)}>{x}{x !== 'All orders' && <span>{orders.filter(o => o.status === x).length}</span>}</button>)}</div>{loading ? <div className="empty-state"><RefreshCw size={30}/><h3>Opening your studio…</h3></div> : filtered.length ? <div className="order-grid">{filtered.map((o, i) => <button className={`order-card card-${o.state.brief.type.toLowerCase()}`} key={o.id || i} onClick={() => openOrder(o)}><div className="order-card-top">{badge(o.state.brief.type)}{badge(o.status, 'outline')}</div><div className="order-card-art"><StageArt type={o.state.brief.type} style={o.state.brief.style}/></div><div className="order-card-body"><span className="eyebrow">{o.state.brief.city}</span><h3>{o.state.brief.name}</h3><div className="order-card-meta"><span><CalendarDays size={13}/>{o.state.brief.date}</span><span><Users size={13}/>{o.state.brief.guests}</span></div><div className="order-card-bottom"><b>{money(o.state.brief.budget)}</b><span>Open studio <ArrowUpRight size={15}/></span></div></div></button>)}</div> : <div className="empty-orders"><div className="empty-illustration"><Flower2 size={55} strokeWidth={1}/><span>YOUR NEXT CHAPTER</span></div><div><h3>{search || filter !== 'All orders' ? 'No matching orders.' : 'Your first event starts here.'}</h3><p>{search || filter !== 'All orders' ? 'Try another search or order status.' : 'Create a real client brief, or explore a sample wedding to see the complete workflow.'}</p><div className="actions"><button className="btn primary" onClick={() => setModal('new')}>Create order <Plus size={15}/></button><button className="btn secondary" onClick={startDemo}>Explore sample wedding <ArrowRight size={15}/></button></div></div></div>}<p className="section-note">“Orders” are event enquiries you create. This is your planning pipeline, not a marketplace of incoming customers.</p></section>
 <section className="method-section"><div><span className="eyebrow">A WORKFLOW THAT MAKES SENSE</span><h2>Five steps.<br /><em>Nothing lost in between.</em></h2></div><div className="method-steps">{steps.map(([name, sub], i) => <button key={name} onClick={() => {
                    if (order) {
                        setStep(i);
                        setScreen('event');
                    }
                    else
                        setModal('tutorial');
                }}><span>0{i + 1}</span><div><h3>{name}</h3><p>{sub}</p></div><ArrowUpRight size={17}/></button>)}</div></section></> : <>
 <div className="event-topline"><button className="back-link" onClick={() => setScreen('orders')}><ChevronLeft size={16}/>All orders</button><div className="save-status">{user ? <Cloud size={14}/> : <Monitor size={14}/>} {dirty ? 'Unsaved changes' : user ? 'Saved to your account' : 'Saved on this device'}<button className="btn primary small" disabled={busy || !dirty} onClick={() => saveEvent()}><Save size={14}/>{busy ? 'Saving…' : 'Save event'}</button></div></div>
 <section className={`event-cover cover-${s.brief.type.toLowerCase()}`}><div className="event-cover-copy"><div className="cover-tags">{badge(s.brief.type)}{badge(order?.status || 'Enquiry', 'outline')}<span className="eyebrow">PLAN V{s.version}</span></div><h1>{s.brief.name}</h1><p>{s.brief.venue || 'Venue to be confirmed'} · {s.brief.city}</p><div className="cover-meta"><span><CalendarDays size={15}/>{s.brief.date}</span><span><Users size={15}/>{s.brief.guests} guests</span><span><Wallet size={15}/>{money(s.brief.budget)}</span></div></div><div className="cover-art"><StageArt type={s.brief.type} style={s.brief.style}/></div></section>
 <nav className="workflow" aria-label="Event workflow">{steps.map(([name, sub], i) => <button aria-current={step === i ? 'step' : undefined} className={step === i ? 'selected' : step > i ? 'visited' : ''} key={name} onClick={() => setStep(i)}><span className="step-number">{step > i ? <Check size={16}/> : String(i + 1).padStart(2, '0')}</span><div><b>{name}</b><small>{sub}</small></div>{i < 4 && <ChevronRight className="step-arrow" size={15}/>}</button>)}</nav>
 <div className="step-intro"><div><span className="eyebrow">STEP 0{step + 1} / 05</span><h2>{['Understand the occasion.', 'Make the vision tangible.', 'Make the numbers work.', 'Give the plan its people.', 'Stay ready for the real world.'][step]}</h2><p>{['Everything that makes this event theirs.', 'Ideas shaped by the brief—not a one-size-fits-all checklist.', 'Start with estimates. Commit only after real supplier confirmation.', 'Clear owners, clear timing and a shared understanding of what comes next.', 'Preview a change, understand its consequences, then decide.'][step]}</p></div><button className="help-link" onClick={() => setModal('learn')}><BookOpen size={15}/>How this step works</button></div>
 {step === 0 && <div className="brief-summary"><section className="panel"><div className="panel-heading"><h3>The client brief</h3><button className="btn secondary small" onClick={() => setModal('edit')}>Edit brief</button></div><dl className="details-grid">{[['Event', s.brief.type], ['Venue', s.brief.venue || 'Not confirmed'], ['Setting', s.brief.setting || 'Mixed'], ['Guest count', s.brief.guests], ['Capacity', s.brief.capacity || 'Not recorded'], ['Budget', money(s.brief.budget)], ['Direction', s.brief.style || 'Heritage'], ['Protected priority', s.brief.priority || 'Guest comfort']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="client-notes"><span className="eyebrow">THE PERSONAL TOUCH</span><p>{s.brief.preferences || 'Add traditions, cuisine and guest preferences to personalise the plan.'}</p></div>{s.brief.capacity && s.brief.guests > s.brief.capacity && <div className="inline-alert"><AlertTriangle size={17}/>Guest count exceeds recorded capacity. Resolve before confirming.</div>}</section><aside className="next-card"><span className="eyebrow">YOUR NEXT MOVE</span><h3>A clear brief becomes<br />a better celebration.</h3><p>Review the creative direction, food considerations and questions generated from this event’s inputs.</p><button className="btn primary" onClick={() => setStep(1)}>Explore creative plan <ArrowRight size={16}/></button><div className="note"><ShieldCheck size={15}/>Editing the brief rebuilds estimates. Existing operational work is protected once changed.</div></aside></div>}
 {step === 1 && <><section className="creative-board"><div className={`creative-poster poster-${(s.brief.style || 'Heritage').toLowerCase()}`}><span className="eyebrow">THE CREATIVE DIRECTION</span><h2>{s.blueprint?.theme || 'A vision, waiting.'}</h2><StageArt type={s.brief.type} style={s.brief.style}/><div className="poster-bottom"><span>{s.brief.style || 'Heritage'}</span><span>{s.brief.priority || 'Guest comfort'}</span></div></div><div className="creative-copy"><div className="panel-heading"><span className="tag">{s.blueprint?.source || 'Draft needed'}</span><button className="btn secondary small" disabled={busy} onClick={ai}><Sparkles size={14}/>{busy ? 'Working…' : 'Refine with live AI'}</button></div><h3>Designed around this brief.</h3><p>{s.blueprint?.vision}</p><div className="mood-palette"><i /><i /><i /><i /><span>Directional palette<br /><b>Confirm materials with your supplier</b></span></div><div className="note"><ShieldCheck size={17}/>The context-based draft works without a model. Live AI needs organiser sign-in and a configured server credential. Your brief is sent to Google only when you request live refinement.</div></div></section><div className="three-panels">{[['The guest experience', s.blueprint?.ideas], ['Food & beverages', s.blueprint?.menu], ['Before you confirm', s.blueprint?.questions]].map(([name, items]) => <section className="panel" key={name as string}><span className="eyebrow">{name as string}</span><ul className="editorial-list">{(items as string[] || []).map((x, i) => <li key={i}><span>0{i + 1}</span>{x}</li>)}</ul></section>)}</div></>}
 {step === 2 && <><div className="budget-summary">{[['Total budget', money(s.brief.budget), 'Client spending limit'], ['Allocated', money(total.committed), 'Estimates + entered quotes'], ['Paid', money(total.paid), 'Recorded payments'], ['Free after reserve', money(total.remaining), `${money(total.reserve)} contingency held`]].map(([label, value, note], i) => <div className={i === 3 && total.remaining < 0 ? 'negative' : ''} key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div><section className="panel"><div className="panel-heading"><div><h3>Vendor desk</h3><p>Enter actual quotes. A label records your confirmation; it is not independent verification.</p></div>{badge(total.remaining < 0 ? 'Budget needs attention' : 'Within budget', total.remaining < 0 ? 'danger' : 'success')}</div><div className="table-scroll"><table><thead><tr><th>Category & supplier</th><th>Allocation ₹</th><th>Paid ₹</th><th>Per guest ₹</th><th>Evidence</th><th>Booking</th></tr></thead><tbody>{s.items.map((x: any) => <tr key={x.id}><td><b>{x.name}</b><input aria-label={`${x.name} vendor`} value={x.vendor} maxLength={100} onChange={e => setS({ ...s, version: s.version + 1, items: s.items.map((a: any) => a.id === x.id ? { ...a, vendor: e.target.value } : a) })}/></td>{['amount', 'paid', 'perGuest'].map(field => <td key={field}><input aria-label={`${x.name} ${field}`} className="money-input" type="number" min={0} max={100000000} value={x[field]} onChange={e => {
                            const n = Number(e.target.value), v = { ...x, [field]: n };
                            if (!Number.isInteger(n) || n < 0 || n > 100000000)
                                return;
                            if (v.paid > v.amount) {
                                notify('Recorded payment cannot exceed allocation. Adjust allocation first.');
                                return;
                            }
                            setS({ ...s, version: s.version + 1, items: s.items.map((a: any) => a.id === x.id ? v : a) });
                        }}/></td>)}<td><select aria-label={`${x.name} evidence`} value={x.basis} onChange={e => setS({ ...s, version: s.version + 1, items: s.items.map((a: any) => a.id === x.id ? { ...a, basis: e.target.value } : a) })}>{['Estimate', 'Illustrative quote', 'Confirmed quote'].map(o => <option key={o}>{o}</option>)}</select></td><td><select aria-label={`${x.name} booking`} value={x.status} onChange={e => setS({ ...s, version: s.version + 1, items: s.items.map((a: any) => a.id === x.id ? { ...a, status: e.target.value } : a) })}>{['Shortlisted', 'Quote received', 'Booking confirmed', 'Delivered'].map(o => <option key={o}>{o}</option>)}</select></td></tr>)}</tbody></table></div></section><section className="checklist-band"><ClipboardCheck size={24}/><div><h3>Before you confirm a supplier</h3><p>Check tax & transport · Confirm capacity & timing · Record cancellation terms · Agree on a backup contact</p></div></section></>}
 {step === 3 && <><div className="schedule-summary"><div><b>{s.tasks.length}</b><span>tasks in the run sheet</span></div><div><b>{s.tasks.filter((x: any) => x.owner === 'Unassigned').length}</b><span>need an owner</span></div><div><b>{done}</b><span>completed</span></div><div><b>{issues.length}</b><span>resource conflicts</span></div></div>{issues.map(x => <div key={x} className="inline-alert"><AlertTriangle size={17}/>{x}</div>)}<section className="panel"><div className="panel-heading"><div><h3>The people & the run of show</h3><p>Coordinator records only. Assigned people are not automatically notified.</p></div><button className="btn secondary small" onClick={() => setModal('task')}><Plus size={15}/>Add task</button></div><div className="table-scroll"><table><thead><tr><th>When</th><th>What happens</th><th>Who owns it</th><th>Progress</th></tr></thead><tbody>{[...s.tasks].sort((a, b) => a.time.localeCompare(b.time)).map((x: any) => <tr key={x.id}><td><input type="time" aria-label={`Time for ${x.title}`} value={x.time} onChange={e => setS({ ...s, version: s.version + 1, tasks: s.tasks.map((a: any) => a.id === x.id ? { ...a, time: e.target.value } : a) })}/><small>{x.duration} minutes</small></td><td><b>{x.title}</b><small>{x.depends.length ? 'After: ' + x.depends.map((id: string) => s.tasks.find((a: any) => a.id === id)?.title).join(', ') : 'Independent task'}</small></td><td><input aria-label={`Owner for ${x.title}`} value={x.owner} maxLength={100} onChange={e => setS({ ...s, version: s.version + 1, tasks: s.tasks.map((a: any) => a.id === x.id ? { ...a, owner: e.target.value || 'Unassigned' } : a) })}/></td><td><select aria-label={`Status for ${x.title}`} value={x.status} onChange={e => {
                        const value = e.target.value;
                        if (value === 'Completed' && x.depends.some((id: string) => s.tasks.find((a: any) => a.id === id)?.status !== 'Completed')) {
                            notify('Complete prerequisite tasks first.');
                            return;
                        }
                        if (value !== 'Proposed' && x.owner === 'Unassigned') {
                            notify('Assign a responsible person first.');
                            return;
                        }
                        setS({ ...s, version: s.version + 1, tasks: s.tasks.map((a: any) => a.id === x.id ? { ...a, status: value } : a) });
                    }}>{['Proposed', 'Accepted', 'In progress', 'Completed', 'Blocked'].map(o => <option key={o}>{o}</option>)}</select></td></tr>)}</tbody></table></div></section></>}
 {step === 4 && <><div className="review-layout"><section className="change-desk"><span className="eyebrow">THE CHANGE DESK</span><h3>Plans change.<br /><em>Stay in command.</em></h3><p>Preview the knock-on effects before changing a single commitment.</p><button onClick={() => { setCount(s.brief.guests + 50); setModal('guests'); }}><Users size={20}/><div><b>Guest count changed</b><small>See cost impact and follow-up work</small></div><ArrowRight size={17}/></button><button onClick={() => setModal('delay')}><Clock size={20}/><div><b>Décor setup is delayed</b><small>Review a conservative timeline recovery</small></div><ArrowRight size={17}/></button></section><section className="panel delivery"><div className="panel-heading"><h3>Delivery overview</h3>{badge(`${pending.length} pending`)}</div><label>Order status<select value={order?.status || 'Enquiry'} onChange={e => { setOrder(order ? { ...order, status: e.target.value } : null); setDirty(true); }}>{statuses.map(x => <option key={x}>{x}</option>)}</select></label><p>{nextAction(s)}. Confirm on-site conditions and supplier availability with your team.</p><button className="btn secondary" onClick={exportPlan}><Download size={16}/>Export full event plan</button><button className="btn text" onClick={() => window.print()}>Print this view <ArrowUpRight size={15}/></button><div className="note">Approvals are recorded by the signed-in organiser. A separate client approval portal and automatic supplier actions are not part of this release.</div></section></div><section className="proposals"><div className="section-title"><h3>Decisions & impact previews</h3><span>{pending.length} awaiting review</span></div>{!s.proposals.length ? <div className="quiet-empty"><CheckCircle2 size={23}/><p>No changes waiting. Use the change desk when the brief or delivery changes.</p></div> : s.proposals.map((p: any) => <article className="panel proposal" key={p.id}><div className="panel-heading"><div><span className="eyebrow">{p.reason}</span><h3>{p.title}</h3></div>{badge(p.status, p.status === 'Approved' ? 'success' : p.status === 'Rejected' ? 'danger' : '')}</div><div className="impact-numbers"><div><small>Cost delta</small><b>{money(p.cost)}</b></div><div><small>Based on</small><b>Plan v{p.baseVersion}</b></div><div><small>Budget after reserve</small><b>{money(total.remaining - (p.status === 'Pending' ? p.cost : 0))}</b></div></div><ul>{p.details.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>{p.status === 'Pending' && <div className="proposal-actions">{p.baseVersion !== s.version ? <p className="error">Plan changed. Reject and recreate this proposal.</p> : <button className="btn primary" onClick={() => {
                                try {
                                    setS(approve(s, p.id));
                                    notify('Applied to the working plan. Save event to persist this decision.');
                                }
                                catch (e: any) {
                                    notify(e.message);
                                }
                            }}><Check size={16}/>Approve & apply</button>}<button className="btn secondary" onClick={() => setS({ ...s, proposals: s.proposals.map((a: any) => a.id === p.id ? { ...a, status: 'Rejected' } : a) })}>Reject</button></div>}</article>)}</section><section className="panel"><div className="panel-heading"><h3>Approved change history</h3><span className="eyebrow">TRACEABLE DECISIONS</span></div>{!s.history.length ? <p className="panel-note">No approved changes yet.</p> : s.history.map((x: any) => <div className="history-entry" key={x.id}><CheckCircle2 size={17}/><div><b>{x.title}</b><small>Version {x.version} · {new Date(x.at).toLocaleString('en-IN')}</small></div><span>{money(x.cost)}</span></div>)}</section></>}
 <div className="step-footer"><button className="btn secondary" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft size={16}/>Previous step</button><span>HUMAN EXPERTISE. CONNECTED BY DESIGN.</span>{step < 4 ? <button className="btn primary" onClick={() => setStep(step + 1)}>Next: {steps[step + 1][0]}<ArrowRight size={16}/></button> : <button className="btn primary" disabled={busy} onClick={() => saveEvent()}><Save size={16}/>Save event</button>}</div>
 </>}
 <footer className="studio-footer"><span><Flower2 size={17}/>UTSAVOPS <i>For the people behind the celebration.</i></span><div><button onClick={() => setModal('learn')}>Help & tutorials</button><button onClick={() => setModal('privacy')}>Privacy & scope</button><span>BUILT WITH INTENTION</span></div></footer></main>
 {modal && <Dialog title={{ new: 'A new occasion, thoughtfully planned.', edit: 'Update the client brief', tutorial: 'Welcome to your event studio', learn: 'A little guidance. A lot more clarity.', appearance: 'Make the studio yours', profile: 'Your organiser identity', guests: 'A new headcount. A clear impact.', delay: 'Recover the plan, together.', task: 'Give a task a clear owner', privacy: 'Your data & the product boundaries' }[modal] || 'Event studio'} close={close} wide={['new', 'edit', 'learn'].includes(modal)}>{notice && <p className="dialog-message" role="status">{notice}</p>}{modal === 'new' && <EventBrief onSubmit={create}/>} {modal === 'edit' && <><div className="note">Rebuilding the brief replaces estimated allocations and tasks. For an event with recorded payments or operational changes, create a new order instead.</div>{s.version > 1 || s.items.some((x: any) => x.paid > 0) ? <p className="error">This event has operational changes. Use the change desk or create a new event order to protect existing work.</p> : <EventBrief initial={s.brief} editing onSubmit={b => { setS(createEventPlan(b)); setDirty(true); close(); notify('Brief updated and estimated plan rebuilt. Save your event.'); }}/>}</>}{modal === 'tutorial' && <Tutorial close={() => { setTutorialDone(true); localStorage.setItem('utsavops-tutorial', 'done'); close(); }} go={n => {
                    if (n === 0)
                        setModal('new');
                    else if (order) {
                        setStep(n);
                        setScreen('event');
                    }
                    else
                        startDemo();
                }}/>}{modal === 'learn' && <div className="help-grid">{lessons.map((l, i) => {
                    const Icon = l.icon;
                    return <article key={l.title}><span className="help-number">0{i + 1}</span><Icon size={26}/><h3>{l.title}</h3><p>{l.text}</p><button className="btn text" onClick={() => {
                            if (i === 0)
                                setModal('new');
                            else {
                                if (!order)
                                    startDemo();
                                setStep(i === 4 ? 4 : i);
                                setScreen('event');
                                close();
                            }
                        }}>{l.action}<ArrowRight size={15}/></button></article>;
                })}<article className="help-account"><ShieldCheck size={25}/><h3>Your account, your events</h3><p>Demo accounts, profiles and orders stay on this browser. This prototype does not provide secure account isolation or cross-device sync. Use sample event data.</p></article></div>}{modal === 'appearance' && <div className="appearance-settings"><p>Choose your working environment. These preferences stay on this device.</p><div className="theme-options"><button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><Sun size={28}/><b>Daylight</b><span>Warm, bright and editorial</span></button><button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><Moon size={28}/><b>After hours</b><span>Calm contrast for late planning</span></button></div><label>App brightness <strong>{brightness}%</strong><input aria-label="App brightness" type="range" min={70} max={110} step={5} value={brightness} onChange={e => setBrightness(Number(e.target.value))}/></label><p className="hint">Changes this app’s appearance, not your device display brightness.</p><button className="btn secondary" onClick={() => { setTheme('light'); setBrightness(100); }}>Reset appearance</button></div>}{modal === 'profile' && <>{user ? <form className="profile-form" onSubmit={saveProfile}><div className="account-identity"><span><UserRound size={27}/></span><div><b>Demo organiser</b><small>{user.email}</small></div>{badge('Demo access', 'success')}</div><label>Your name<input required maxLength={100} value={profileDraft.name} onChange={e => setProfileDraft({ ...profileDraft, name: e.target.value })}/></label><label>Studio / company name<input required maxLength={100} value={profileDraft.company} onChange={e => setProfileDraft({ ...profileDraft, company: e.target.value })}/></label><div className="form-grid"><label>Based in<input maxLength={100} value={profileDraft.city} onChange={e => setProfileDraft({ ...profileDraft, city: e.target.value })}/></label><label>Specialty<select value={profileDraft.specialty} onChange={e => setProfileDraft({ ...profileDraft, specialty: e.target.value })}>{['Celebrations & weddings', 'Birthdays & private events', 'Community & cultural events', 'All event types'].map(x => <option key={x}>{x}</option>)}</select></label></div><div className="dialog-actions"><a className="btn text" href="/" onClick={async (e) => { e.preventDefault(); const r = await fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }); if (r.ok)
            window.location.assign('/');
        else
            notify('Sign out could not finish. Please retry.'); }}><LogOut size={15}/>Sign out</a><button className="btn primary" disabled={busy} type="submit">Save organiser profile<Check size={16}/></button></div></form> : <div className="empty-state"><ShieldCheck size={35}/><h3>Your own organiser workspace</h3><p>Sign in to set up your profile and save events privately across devices.</p><a className="btn primary" href="/login" target="_top">Sign in securely <LogIn size={16}/></a></div>}</>}{['guests', 'delay'].includes(modal) && <div className="change-form"><p>{modal === 'guests' ? `Current plan: ${s.brief.guests} guests. Variable rates come from your budget entries. Fixed quotes need reconfirmation.` : 'Report the delay. The draft recovery shifts décor and later programme entries; it does not confirm venue or supplier availability.'}</p><label>{modal === 'guests' ? 'New guest count' : 'Delay in minutes'}<input type="number" min={modal === 'guests' ? 1 : 5} max={modal === 'guests' ? 10000 : 240} value={modal === 'guests' ? count : delay} onChange={e => modal === 'guests' ? setCount(Number(e.target.value)) : setDelay(Number(e.target.value))}/></label><div className="note"><ShieldCheck size={17}/>Preview first. Approval applies the changes; Save event persists them.</div><button className="btn primary full" onClick={() => propose(modal)}>Preview the impact<ArrowRight size={16}/></button></div>}{modal === 'task' && <form onSubmit={e => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget), title = String(data.get('title')).trim();
                    if (!title)
                        return;
                    setS({ ...s, version: s.version + 1, tasks: [...s.tasks, { id: `task-${Date.now()}`, title, owner: String(data.get('owner')).trim() || 'Unassigned', time: String(data.get('time')), duration: Number(data.get('duration')), status: 'Proposed', depends: [], category: 'Coordination' }] });
                    close();
                    notify('Task added. Save event to persist.');
                }}><label>Task<input name="title" required maxLength={500} placeholder="e.g. Check accessible entry route"/></label><label>Responsible person<input name="owner" maxLength={100} placeholder="Unassigned"/></label><div className="form-grid"><label>Start time<input name="time" type="time" required defaultValue="10:00"/></label><label>Duration · minutes<input name="duration" type="number" min={1} max={1440} required defaultValue={30}/></label></div><button className="btn primary full" type="submit">Add task<Plus size={16}/></button></form>}{modal === 'privacy' && <div className="privacy-copy"><h3>Secure organiser workspaces</h3><p>Authentication uses browser-only demo accounts and secure sessions. Saved profile and event records are scoped server-side to the authenticated organiser. This release does not include shared company membership or independent client/team logins.</p><h3>Demo and account data stay distinct</h3><p>Guest demo orders are stored on this device. Signed-in orders are saved to the server with conflict detection. Unsaved edits can be lost when leaving or reloading; use Save event.</p><h3>Human approval, honest assumptions</h3><p>Quotes, availability, task acceptance and physical progress are organiser-entered records. No automated bookings, supplier messages or payments occur. Live Gemini refinement requires a server credential and sends the brief to Google when requested. Avoid sensitive guest details.</p></div>}</Dialog>}
 </div>;
}
