import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, totals, guestProposal, delayProposal, approve, shiftTime, conflicts, validateBrief, sampleBlueprint } from '../lib/engine.mjs';
test('sample budget reserves 10% and reconciles payments', () => { assert.deepEqual(totals(seed()), { committed: 445000, paid: 100000, reserve: 50000, remaining: 5000, outstanding: 345000 }); });
test('guest proposal calculates cost without mutating approved state', () => { let s = seed(), before = JSON.stringify(s), p = guestProposal(s, 260); assert.equal(p.cost, 48000); assert.equal(JSON.stringify(s), before); });
test('approval applies headcount, cost, confirmation task and immutable version', () => { let s = seed(), p = guestProposal(s, 260); s.proposals.push(p); let n = approve(s, p.id); assert.equal(n.brief.guests, 260); assert.equal(n.items[0].amount, 208000); assert.equal(n.version, 2); assert.equal(n.tasks.at(-1).owner, 'Unassigned'); assert.equal(n.history.length, 1); assert.equal(s.brief.guests, 200); assert.equal(totals(n).remaining, -43000); });
test('repeated approval cannot apply twice', () => { let s = seed(), p = guestProposal(s, 260); s.proposals.push(p); let n = approve(s, p.id); assert.throws(() => approve(n, p.id)); });
test('stale proposals rejected', () => { let s = seed(), p = guestProposal(s, 260); s.proposals.push(p); s.version++; assert.throws(() => approve(s, p.id), /latest version/); });
test('rejected proposals cannot apply', () => { let s = seed(), p = guestProposal(s, 260); p.status = 'Rejected'; s.proposals.push(p); assert.throws(() => approve(s, p.id)); });
test('guest reduction cannot erase recorded payment', () => { let s = seed(); s.items[0].paid = 150000; let p = guestProposal(s, 10); s.proposals.push(p); assert.throws(() => approve(s, p.id), /payment/); });
test('invalid guest counts rejected', () => { for (const n of [0, -1, 1.5, 10001, NaN, 200])
    assert.throws(() => guestProposal(seed(), n)); });
test('recovery shifts affected timeline and creates follow-up', () => { let s = seed(), p = delayProposal(s, 45); s.proposals.push(p); let n = approve(s, p.id); assert.equal(n.tasks.find(x => x.id === 't2').time, '11:45'); assert.equal(n.tasks.find(x => x.id === 't3').time, '13:15'); assert.equal(n.tasks[0].time, '10:00'); assert.equal(n.history[0].cost, 0); });
test('invalid delay rejected', () => { for (const n of [0, 4, 241, 3.5, NaN])
    assert.throws(() => delayProposal(seed(), n)); });
test('time arithmetic handles hour boundaries', () => assert.equal(shiftTime('12:45', 45), '13:30'));
test('cross-midnight recovery fails atomically', () => { let s = seed(); s.tasks[1].time = '23:30'; let p = delayProposal(s, 60); s.proposals.push(p); let before = JSON.stringify(s); assert.throws(() => approve(s, p.id), /midnight/); assert.equal(JSON.stringify(s), before); });
test('detect overlapping owner assignments', () => { let s = seed(); s.tasks[4].time = '11:30'; assert.equal(conflicts(s.tasks).length, 1); });
test('completed and unassigned tasks excluded from conflicts', () => { let s = seed(); s.tasks[4].time = '11:30'; s.tasks[4].status = 'Completed'; assert.equal(conflicts(s.tasks).length, 0); });
test('touching task boundaries do not conflict', () => { let s = seed(); s.tasks[4].time = '12:30'; assert.equal(conflicts(s.tasks).length, 0); });
test('brief validation accepts all challenge event types', () => { for (const type of ['Wedding', 'Birthday', 'Community'])
    assert.equal(validateBrief({ ...seed().brief, type }).type, type); });
test('brief validation rejects invalid values and oversized input', () => { for (const change of [{ budget: -1 }, { guests: 0 }, { name: '' }, { type: 'Other' }, { preferences: 'x'.repeat(2001) }, { date: 'bad' }, { city: '' }])
    assert.throws(() => validateBrief({ ...seed().brief, ...change })); });
test('sample is explicitly not live AI', () => assert.match(sampleBlueprint(seed().brief).source, /not live AI/));
test('sample personalizes event type and city', () => assert.match(sampleBlueprint({ ...seed().brief, type: 'Birthday', city: 'Pune' }).vision, /birthday in Pune/));
test('fixed costs stay unchanged on guest change', () => { let s = seed(), p = guestProposal(s, 260); s.proposals.push(p); let n = approve(s, p.id); assert.equal(n.items[1].amount, s.items[1].amount); });
