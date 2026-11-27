import {describe,it,expect} from 'vitest'
import type {ActionContext,ActionTools} from 'deepspace/worker'
import type {Env} from '../../worker'
import {createBlindRoom,listBlindRooms,readBlindRoom,submitBlindVote,syncBlindReceipt} from './blind'
import {blindRoomSchema,blindBallotSchema,blindReceiptSchema} from '../schemas/blind-schema'
type Row={recordId:string;createdBy:string;data:Record<string,unknown>}
const fake=()=>{
 const tables=new Map<string,Map<string,Row>>()
 const table=(n:string)=>{let rows=tables.get(n);if(!rows){rows=new Map;tables.set(n,rows)}return rows}
 for(const id of ['owner','r1','r2','outsider'])table('users').set(id,{recordId:id,createdBy:id,data:{role:'member'}})
 let seq=0,denyReceipt=false
 const ctx=(userId:string,params:Record<string,unknown>={}):ActionContext<Env>=>({userId,params,callerJwt:'fixture',env:{} as Env,tools:{
 async get(n:string,id:string){const record=table(n).get(id);return record?{success:true,data:{record}}:{success:false,error:'not found'}},
 async query(n:string,{where,limit}:{where:Record<string,unknown>;limit:number}){const records=[...table(n).values()].filter(r=>Object.entries(where).every(([k,v])=>r.data[k]===v)).slice(0,limit);return {success:true,data:{records,count:records.length}}},
 async create(n:string,data:Record<string,unknown>){if(n==='blind_receipts'&&denyReceipt)return {success:false,error:'unavailable'};const s=[blindRoomSchema,blindBallotSchema,blindReceiptSchema].find(s=>s.name===n)!;if([...table(n).values()].some(r=>s.uniqueOn!.every(k=>r.data[k]===data[k])))return {success:false,error:'duplicate'};const recordId='row-'+(++seq);table(n).set(recordId,{recordId,createdBy:userId,data});return {success:true,data:{recordId}}}
 } as unknown as ActionTools})
 return {ctx,table,failReceipt:(flag:boolean)=>{denyReceipt=flag}}
}
const config={reviewer1:'r1',reviewer2:'r2',submissionKey:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',title:'Test room',prompt:'Public question',rubric:'Accuracy',answer1:'one',answer2:'two',identity1:'Alpha',identity2:'Beta'}
const setup=async()=>{const f=fake();expect((await createBlindRoom(f.ctx('owner',config))).success).toBe(true);return f}
const vote=(choice='A',reason='reason justified')=>({roomId:'row-1',choice,reason})
const data=(r:Awaited<ReturnType<typeof readBlindRoom>>)=>{expect(r.success).toBe(true);return (r as {data:Record<string,unknown>}).data}
describe('BlindCompare isolated SDK action contracts with fake store',()=>{
 it('private room/ballot collections never expose direct reads/writes; receipt is read-only shared and contains no vote',()=>{for(const s of [blindRoomSchema,blindBallotSchema])for(const p of Object.values(s.permissions))expect(p).toEqual({read:false,create:false,update:false,delete:false});expect(blindReceiptSchema.columns.map(c=>c.name)).toEqual(['roomId','reviewerId','collaborators']);expect(blindReceiptSchema.permissions.member).toEqual({read:'shared',create:false,update:false,delete:false})})
 it('requires two distinct registered reviewers',async()=>{const f=fake();for(const r of ['owner','r1','missing'])expect((await createBlindRoom(f.ctx('owner',{...config,reviewer2:r}))).success).toBe(false)})
 it('only members can discover and read a room',async()=>{const f=await setup();expect(data(await listBlindRooms(f.ctx('outsider'))).rooms).toEqual([]);expect((await readBlindRoom(f.ctx('outsider',{roomId:'row-1'}))).success).toBe(false);expect(data(await listBlindRooms(f.ctx('r1'))).rooms).toEqual([{roomId:'row-1',title:'Test room',role:'reviewer'}])})
 it('early projection contains independent swapped text and no labels or other votes',async()=>{const f=await setup();const a=data(await readBlindRoom(f.ctx('r1',{roomId:'row-1'}))),b=data(await readBlindRoom(f.ctx('r2',{roomId:'row-1'})));expect(JSON.stringify(a)).not.toMatch(/Alpha|Beta|results|order1/);expect((a.answers as {text:string}[])[0].text).toBe((b.answers as {text:string}[])[1].text);expect(data(await readBlindRoom(f.ctx('owner',{roomId:'row-1'}))).answers).toBeUndefined()})
 it('one vote stays private; receipt is opaque and shared narrowly',async()=>{const f=await setup();expect((await submitBlindVote(f.ctx('owner',vote()))).success).toBe(false);expect((await submitBlindVote(f.ctx('outsider',vote()))).success).toBe(false);expect((await submitBlindVote(f.ctx('r1',vote()))).success).toBe(true);const v=data(await readBlindRoom(f.ctx('r2',{roomId:'row-1'})));expect(v.submitted).toBe(1);expect(v.results).toBeUndefined();expect(JSON.stringify(v)).not.toMatch(/reason justified|Alpha|Beta/);expect([...f.table('blind_receipts').values()][0].data).toEqual({roomId:'row-1',reviewerId:'r1',collaborators:['owner','r2']})})
 it('two committed votes reveal canonical agreement independent of order',async()=>{const f=await setup();await Promise.all([submitBlindVote(f.ctx('r1',vote('A'))),submitBlindVote(f.ctx('r2',vote('B')))]);const v=data(await readBlindRoom(f.ctx('owner',{roomId:'row-1'})));expect(v.revealed).toBe(true);expect(v.agreement).toBe(true);expect((v.results as {identity:string}[])[0].identity).toBe((v.results as {identity:string}[])[1].identity);expect((await readBlindRoom(f.ctx('outsider',{roomId:'row-1'}))).success).toBe(false)})
 it('duplicate and altered votes do not overwrite',async()=>{const f=await setup();await Promise.all([submitBlindVote(f.ctx('r1',vote())),submitBlindVote(f.ctx('r1',vote()))]);expect(f.table('blind_ballots').size).toBe(1);expect((await submitBlindVote(f.ctx('r1',vote('B')))).success).toBe(false);expect((await submitBlindVote(f.ctx('r1',vote()))).success).toBe(true);expect(f.table('blind_receipts').size).toBe(1)})
 it('lost receipt never invalidates ballot and can be repaired after reload',async()=>{const f=await setup();f.failReceipt(true);expect(data(await submitBlindVote(f.ctx('r1',vote())))).toEqual({confirmed:true,receiptSynced:false});expect(f.table('blind_ballots').size).toBe(1);f.failReceipt(false);expect((await syncBlindReceipt(f.ctx('r2',{roomId:'row-1'}))).success).toBe(false);expect((await syncBlindReceipt(f.ctx('r1',{roomId:'row-1'}))).success).toBe(true);expect(f.table('blind_receipts').size).toBe(1)})
 it('tie is independent of textual identity naming',async()=>{const f=fake();await createBlindRoom(f.ctx('owner',{...config,identity1:'tie'}));await submitBlindVote(f.ctx('r1',vote('tie')));const d=[...f.table('blind_rooms').values()][0].data;await submitBlindVote(f.ctx('r2',vote(d.order2==='0'?'A':'B')));expect(data(await readBlindRoom(f.ctx('owner',{roomId:'row-1'}))).agreement).toBe(false)})
})
