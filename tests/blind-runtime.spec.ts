import {test,expect,request} from '@playwright/test'
import {loadAllTestAccounts} from 'deepspace/testing'
import {readFileSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
type Frame={type:string;payload?:{subscriptionId?:string;records?:unknown[];collection?:string;record?:unknown;role?:string;users?:{id:string;name?:string;role?:string}[]}}
function connect(url:URL){
 const socket=new WebSocket(url),frames:Frame[]=[]
 const ready=new Promise<void>((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Local record connection not ready')),12000)
  socket.addEventListener('message',e=>{try{const f=JSON.parse(String(e.data)) as Frame;frames.push(f);if(f.type==='user.info'){clearTimeout(timeout);resolve()}}catch{/* heartbeat */}})
  socket.addEventListener('error',()=>{clearTimeout(timeout);reject(Error('Local socket error'))})
 })
 return {socket,frames,ready,subscribe:()=>socket.send(JSON.stringify({type:'core.subscribe',payload:{subscriptionId:'receipts',query:{collection:'blind_receipts'}}}))}
}
test('local worker authenticates four roles and persists sealed review to reveal',async({baseURL})=>{
 test.setTimeout(110000)
 if(!baseURL||new URL(baseURL).hostname!=='127.0.0.1')throw Error('Local isolated dev only')
 const appId=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8').match(/DEEPSPACE_APP_ID\s*=\s*"([^"]+)"/)?.[1]
 if(!appId)throw Error('Missing local app scope')
 const accounts=loadAllTestAccounts().slice(0,4)
 expect(accounts.length).toBe(4)
 const opened:Awaited<ReturnType<typeof request.newContext>>[]=[]
 const sockets:ReturnType<typeof connect>[]=[]
 try{
 const sessions=[]
 for(const account of accounts){
   const client=await request.newContext({baseURL,extraHTTPHeaders:{Origin:baseURL}})
   opened.push(client)
   const login=await client.post('/api/auth/sign-in/email',{data:{email:account.email,password:account.password}})
   expect(login.status()).toBe(200)
   const resp=await client.post('/api/auth/token');expect(resp.status()).toBe(200)
   const token=(await resp.json()).token as string
   const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString())
   expect(claims.sub===account.userId||claims.email===account.email).toBe(true)
   const url=new URL('/ws/'+encodeURIComponent('app:'+appId),baseURL);url.protocol='ws:';url.searchParams.set('token',token)
   const ws=connect(url);sockets.push(ws);await ws.ready;ws.subscribe()
   await expect.poll(()=>ws.frames.some(f=>f.type==='core.query_result'&&f.payload?.subscriptionId==='receipts')).toBe(true)
   const act=async(name:string,data:Record<string,unknown>={})=>{
      const r=await client.post('/api/actions/'+name,{headers:{Authorization:'Bearer '+token},data})
      expect(r.status()).toBe(200);return r.json()
   }
   sessions.push({id:account.userId,act,ws,url})
 }
 const [owner,a,b,observer]=sessions
 owner.ws.socket.send(JSON.stringify({type:'user.list',payload:{}}))
 await expect.poll(()=>owner.ws.frames.filter(f=>f.type==='user.list').at(-1)?.payload?.users?.some(u=>u.id===a.id)).toBe(true)
 await expect.poll(()=>owner.ws.frames.filter(f=>f.type==='user.list').at(-1)?.payload?.users?.some(u=>u.id===b.id)).toBe(true)
 const title='__test-'+Date.now()+'__ review receipt'
 const created=await owner.act('createBlindRoom',{title,prompt:'Example question',rubric:'Evidence and scope',answer1:'Scoped answer',answer2:'Broad answer',identity1:'Model X',identity2:'Model Y',reviewer1:a.id,reviewer2:b.id,submissionKey:randomUUID()})
 expect(created.success).toBe(true)
 const roomId=created.data.roomId
 const list=await observer.act('listBlindRooms');expect(list.success).toBe(true);expect(list.data.rooms.some((r:{roomId:string})=>r.roomId===roomId)).toBe(false)
 const first=await a.act('readBlindRoom',{roomId}),second=await b.act('readBlindRoom',{roomId})
 expect(first.success&&second.success).toBe(true)
 expect(first.data.answers[0].text).toBe(second.data.answers[1].text)
 const select=(r:typeof first)=>r.data.answers.find((x:{text:string})=>x.text==='Scoped answer').label
 expect((await a.act('submitBlindVote',{roomId,choice:select(first),reason:'Independent reason one'})).success).toBe(true)
 const sealed=await b.act('readBlindRoom',{roomId});expect(sealed.data.submitted).toBe(1);expect(sealed.data.revealed).toBe(false);expect(sealed.data.results).toBeUndefined()
 await expect.poll(()=>owner.ws.frames.some(f=>f.type==='core.record_change'&&f.payload?.collection==='blind_receipts')).toBe(true)
 expect(observer.ws.frames.some(f=>f.type==='core.record_change'&&f.payload?.collection==='blind_receipts')).toBe(false)
 b.ws.socket.close()
 const reconnect=connect(b.url);sockets.push(reconnect);await reconnect.ready;reconnect.subscribe()
 await expect.poll(()=>reconnect.frames.find(f=>f.type==='core.query_result'&&f.payload?.subscriptionId==='receipts')?.payload?.records?.length).toBeGreaterThanOrEqual(1)
 expect((await b.act('submitBlindVote',{roomId,choice:select(second),reason:'Independent reason two'})).success).toBe(true)
 const revealed=await owner.act('readBlindRoom',{roomId});expect(revealed.data.revealed).toBe(true);expect(revealed.data.agreement).toBe(true)
 expect(revealed.data.results.length).toBe(2)
 console.log('Verified real local worker: all four identities, member discovery, sealed first vote, live receipt, final reveal.')
 }finally{for(const ws of sockets)ws.socket.close();for(const client of opened)await client.dispose()}
})
