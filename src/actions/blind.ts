import type {ActionHandler,ActionTools,ActionResult} from 'deepspace/worker'
import type {Env} from '../../worker'
type Room={ownerId:string;reviewer1:string;reviewer2:string;submissionKey:string;title:string;prompt:string;rubric:string;answer1:string;answer2:string;identity1:string;identity2:string;order1:string;order2:string}
type Ballot={roomId:string;reviewerId:string;choice:string;reason:string}
const fail=(error='Review room unavailable. Check access and refresh.'):ActionResult=>({success:false,error})
const ok=(data:Record<string,unknown>):ActionResult=>({success:true,data})
const id=(x:unknown):x is string=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(x)&&!x.startsWith('anon-')
const bounded=(v:unknown,max:number)=>typeof v==='string'&&v.trim()&&v.trim().length<=max?v.trim():null
const choice=(v:unknown):v is 'A'|'B'|'tie'=>v==='A'||v==='B'||v==='tie'
async function registered(tools:ActionTools,userId:unknown){if(!id(userId))return false;const r=await tools.get('users',userId);return r.success&&r.data.record.recordId===userId&&['member','admin'].includes(String(r.data.record.data.role))}
const people=(d:Room)=>[d.ownerId,d.reviewer1,d.reviewer2]
function isRoom(d:Room,createdBy:string){return d&&id(d.ownerId)&&id(d.reviewer1)&&id(d.reviewer2)&&new Set(people(d)).size===3&&createdBy===d.ownerId&&['0','1'].includes(d.order1)&&['0','1'].includes(d.order2)&&d.order1!==d.order2}
async function room(tools:ActionTools,roomId:unknown){if(!id(roomId))return null;const r=await tools.get<Room>('blind_rooms',roomId);if(!r.success||!isRoom(r.data.record.data,r.data.record.createdBy))return null;return {roomId,d:r.data.record.data}}
async function ballots(tools:ActionTools,roomId:string,d:Room){const r=await tools.query<Ballot>('blind_ballots',{where:{roomId},limit:3});if(!r.success)return null;const seen=new Set<string>();const out:Ballot[]=[];for(const row of r.data.records){const b=row.data;if(b.roomId!==roomId||b.reviewerId!==row.createdBy||![d.reviewer1,d.reviewer2].includes(b.reviewerId)||seen.has(b.reviewerId)||!choice(b.choice)||!bounded(b.reason,2000))return null;seen.add(b.reviewerId);out.push(b)}return out}
const summary=(id:string,d:Room,u:string)=>({roomId:id,title:d.title,role:d.ownerId===u?'owner':'reviewer'})
async function receipt(tools:ActionTools,roomId:string,d:Room,userId:string){const r=await tools.query('blind_receipts',{where:{roomId,reviewerId:userId},limit:2});if(!r.success)return false;if(r.data.records.length===1){const row=r.data.records[0],others=people(d).filter(id=>id!==userId);return row.createdBy===userId&&row.data.roomId===roomId&&row.data.reviewerId===userId&&Array.isArray(row.data.collaborators)&&row.data.collaborators.length===others.length&&others.every(x=>(row.data.collaborators as unknown[]).includes(x))}if(r.data.records.length!==0)return false;const saved=await tools.create('blind_receipts',{roomId,reviewerId:userId,collaborators:people(d).filter(id=>id!==userId)});return saved.success}
export const createBlindRoom:ActionHandler<Env>=async({userId,params,tools})=>{
 if(!id(userId)||!id(params.reviewer1)||!id(params.reviewer2)||new Set([userId,params.reviewer1,params.reviewer2]).size!==3||typeof params.submissionKey!=='string'||!/^[a-f0-9-]{36}$/.test(params.submissionKey))return fail('Choose two different registered reviewers.')
 if(!await registered(tools,userId)||!await registered(tools,params.reviewer1)||!await registered(tools,params.reviewer2))return fail()
 const title=bounded(params.title,100),prompt=bounded(params.prompt,3000),rubric=bounded(params.rubric,2000),answer1=bounded(params.answer1,6000),answer2=bounded(params.answer2,6000),identity1=bounded(params.identity1,100),identity2=bounded(params.identity2,100)
 if(!title||!prompt||!rubric||!answer1||!answer2||!identity1||!identity2||identity1===identity2)return fail('Complete all fields and use distinct answer identities.')
 const order1=String(crypto.getRandomValues(new Uint8Array(1))[0]%2),order2=order1==='0'?'1':'0'
 const d={ownerId:userId,reviewer1:params.reviewer1,reviewer2:params.reviewer2,submissionKey:params.submissionKey,title,prompt,rubric,answer1,answer2,identity1,identity2,order1,order2}
 const r=await tools.create('blind_rooms',d)
 if(r.success)return ok({roomId:r.data.recordId})
 return fail('Room creation not confirmed. Refresh the room list before retrying.')
}
export const listBlindRooms:ActionHandler<Env>=async({userId,tools})=>{
 if(!id(userId)||!await registered(tools,userId))return fail()
 const all=new Map<string,ReturnType<typeof summary>>()
 for(const field of ['ownerId','reviewer1','reviewer2']){const r=await tools.query<Room>('blind_rooms',{where:{[field]:userId},limit:50});if(!r.success)return fail();for(const row of r.data.records){if(!isRoom(row.data,row.createdBy)||!people(row.data).includes(userId))continue;all.set(row.recordId,summary(row.recordId,row.data,userId))}}
 return ok({rooms:[...all.values()]})
}
export const readBlindRoom:ActionHandler<Env>=async({userId,params,tools})=>{
 if(!id(userId)||!await registered(tools,userId))return fail()
 const r=await room(tools,params.roomId);if(!r||!people(r.d).includes(userId))return fail()
 const b=await ballots(tools,r.roomId,r.d);if(!b)return fail()
 const {d}=r
 const base={...summary(r.roomId,d,userId),prompt:d.prompt,rubric:d.rubric,submitted:b.length,total:2,ownSubmitted:b.some(x=>x.reviewerId===userId)}
 if(b.length===2){const mapped=b.map(x=>{const order=x.reviewerId===d.reviewer1?d.order1:d.order2;return {reviewerId:x.reviewerId,choice:x.choice,canonical:x.choice==='tie'?null:(x.choice==='A')===(order==='0')?1:2,identity:x.choice==='tie'?null:(x.choice==='A')===(order==='0')?d.identity1:d.identity2,reason:x.reason}});return ok({...base,revealed:true,results:mapped,agreement:mapped[0].canonical===mapped[1].canonical,answers:[{identity:d.identity1,text:d.answer1},{identity:d.identity2,text:d.answer2}]})}
 if(userId===d.ownerId)return ok({...base,revealed:false})
 const order=userId===d.reviewer1?d.order1:d.order2
 return ok({...base,revealed:false,answers:[{label:'A',text:order==='0'?d.answer1:d.answer2},{label:'B',text:order==='0'?d.answer2:d.answer1}]})
}
export const submitBlindVote:ActionHandler<Env>=async({userId,params,tools})=>{
 if(!id(userId)||!choice(params.choice)||!await registered(tools,userId))return fail()
 const reason=bounded(params.reason,2000);if(!reason||reason.length<3)return fail('Give a reason for your review.')
 const r=await room(tools,params.roomId);if(!r||![r.d.reviewer1,r.d.reviewer2].includes(userId))return fail()
 const b=await ballots(tools,r.roomId,r.d);if(!b)return fail()
 const prior=b.find(x=>x.reviewerId===userId)
 if(prior&&(prior.choice!==params.choice||prior.reason!==reason))return fail('Your original review is already locked.')
 if(!prior){const saved=await tools.create('blind_ballots',{roomId:r.roomId,reviewerId:userId,choice:params.choice,reason});if(!saved.success)return fail('Vote not confirmed or already recorded. Refresh before retrying.')}
 const synced=await receipt(tools,r.roomId,r.d,userId)
 return ok({confirmed:true,receiptSynced:synced})
}
export const syncBlindReceipt:ActionHandler<Env>=async({userId,params,tools})=>{
 if(!id(userId)||!await registered(tools,userId))return fail()
 const r=await room(tools,params.roomId);if(!r||![r.d.reviewer1,r.d.reviewer2].includes(userId))return fail()
 const b=await ballots(tools,r.roomId,r.d);if(!b||!b.some(x=>x.reviewerId===userId))return fail()
 const synced=await receipt(tools,r.roomId,r.d,userId)
 return synced?ok({receiptSynced:true}):fail('Receipt was not confirmed. Your locked vote remains recorded.')
}
