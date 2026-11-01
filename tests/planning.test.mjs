import test from 'node:test';import assert from 'node:assert/strict';import {createEventPlan,creativeBlueprint,nextAction} from '../lib/planning.mjs';import {seed,totals} from '../lib/engine.mjs';
const b={...seed().brief,style:'Garden',setting:'Outdoor',priority:'Food experience',start:'14:00',capacity:250};
test('event types produce different allocations and task programmes',()=>{let w=createEventPlan({...b,type:'Wedding'}),d=createEventPlan({...b,type:'Birthday'}),c=createEventPlan({...b,type:'Community'});assert.notEqual(w.items[0].amount,d.items[0].amount);assert.match(d.tasks[4].title,/Cake/);assert.match(c.tasks[4].title,/Community/)});
test('food priority moves resources toward catering',()=>{let a=createEventPlan({...b,priority:'Guest comfort'}),p=createEventPlan(b);assert.ok(p.items[0].amount>a.items[0].amount);assert.ok(Math.abs(totals(p).committed-b.budget*.9)<10)});
test('style and outdoor setting change the creative draft',()=>{let p=creativeBlueprint(b);assert.equal(p.theme,'Gather under the green');assert.match(p.vision,/covered fallback/);assert.ok(p.questions.some(x=>x.includes('weather')))});
test('new events are unassigned, unpaid and estimated',()=>{let p=createEventPlan(b);assert.ok(p.tasks.every(x=>x.owner==='Unassigned'));assert.ok(p.items.every(x=>x.paid===0&&x.basis==='Estimate'));assert.equal(p.proposals.length,0);assert.equal(p.history.length,0)});
test('start time shifts planned tasks',()=>{let p=createEventPlan({...b,start:'18:00'});assert.equal(p.tasks[4].time,'18:00');assert.equal(p.tasks[0].time,'14:00')});
test('next action identifies supplier gaps',()=>assert.equal(nextAction(createEventPlan(b)),'Add vendor quotes'));
test('context draft is explicitly not live AI',()=>assert.match(creativeBlueprint(b).source,/not live AI/));
