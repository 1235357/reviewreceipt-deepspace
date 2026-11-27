import {test,expect,request} from '@playwright/test'
import {loadAllTestAccounts} from 'deepspace/testing'
test('four approved test identities authenticate through actual local worker',async({baseURL})=>{
 test.setTimeout(120000)
 const accounts=loadAllTestAccounts().slice(0,4)
 expect(accounts.length).toBe(4)
 expect(new Set(accounts.map(a=>a.email)).size).toBe(4)
 for (const account of accounts) {
  const client=await request.newContext({baseURL,extraHTTPHeaders:{Origin:baseURL!}})
  try {
   const login=await client.post('/api/auth/sign-in/email',{data:{email:account.email,password:account.password}})
   expect(login.status(),'sign-in status').toBe(200)
   const tokenResponse=await client.post('/api/auth/token')
   expect(tokenResponse.status(),'token status').toBe(200)
   const token=(await tokenResponse.json()).token
   expect(typeof token).toBe('string')
   const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString())
   expect(claims.sub===account.userId||claims.email===account.email,'identity match').toBe(true)
   const action=await client.post('/api/actions/listBlindRooms',{headers:{Authorization:'Bearer '+token},data:{}})
   expect(action.status(),'authenticated action status').toBe(200)
   const result=await action.json()
   expect(typeof result.success).toBe('boolean')
   console.log('Authenticated fixture action:',result.success?'registered':'not registered in local data room')
  }finally{await client.dispose()}
 }
})
