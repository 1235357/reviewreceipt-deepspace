import {test,expect,loadAllTestAccounts} from 'deepspace/testing'
test.skip(loadAllTestAccounts().length<4,'Requires four approved SDK test accounts.')
test('four distinct sessions, sealed votes, confirmed realtime reveal, reconnect',async({users})=>{
 test.setTimeout(120000)
 const [owner,a,b,outsider]=await users(4)
 const members=[owner,a,b,outsider]
 expect(new Set(members.map(u=>u.email)).size).toBe(4)
 for(const u of members){await u.page.goto('/blind');await expect(u.page.getByRole('heading',{name:'ReviewReceipt',exact:true})).toBeVisible();await u.page.getByRole('button',{name:'Account menu'}).click();await expect(u.page.getByTestId('nav-user-email')).toHaveText(u.email);await u.page.getByRole('button',{name:'Account menu'}).click();await expect(u.page.getByTestId('blind-connection')).toHaveText('Connected')}
 const excludedBaseline=await outsider.page.getByTestId('blind-receipt-count').textContent()
 const title='__test-'+Date.now()+'__ ReviewReceipt'
 await owner.page.getByLabel('Room title').fill(title)
 await owner.page.getByLabel('Question').fill('Synthetic public question')
 await owner.page.getByLabel('Evaluation criteria').fill('Accuracy and clarity')
 await owner.page.getByLabel('First response',{exact:true}).fill('Scoped synthetic answer')
 await owner.page.getByLabel('Second response',{exact:true}).fill('Overbroad synthetic answer')
 const identity1='Identity '+Date.now()+' X',identity2='Identity '+Date.now()+' Y'
 await owner.page.getByLabel('First response identity (hidden)',{exact:true}).fill(identity1)
 await owner.page.getByLabel('Second response identity (hidden)',{exact:true}).fill(identity2)
 const pick=async(u:typeof a,label:string)=>{const s=owner.page.getByLabel(label,{exact:true});if(u.userId)await s.selectOption(u.userId);else await s.selectOption({label:u.name})}
 await pick(a,'Reviewer 1');await pick(b,'Reviewer 2')
 await owner.page.getByRole('button',{name:'Create frozen room'}).click()
 await expect(owner.page.getByRole('heading',{name:title,exact:true})).toBeVisible({timeout:15000})
 for(const u of [a,b,outsider])await u.page.getByRole('button',{name:'Refresh rooms'}).click()
 await expect(outsider.page.getByRole('button',{name:title+' · reviewer'})).toHaveCount(0)
 for(const u of [a,b]){await u.page.getByRole('button',{name:title+' · reviewer'}).click();await expect(u.page.getByRole('heading',{name:'Masked responses'})).toBeVisible({timeout:15000});await expect(u.page.getByText(identity1,{exact:true})).toHaveCount(0);await expect(u.page.getByText(identity2,{exact:true})).toHaveCount(0)}
 const sel=async(u:typeof a)=>{const scoped=u.page.locator('.review-step').filter({hasText:'Scoped synthetic answer'}).filter({has:u.page.getByRole('heading',{name:/^Answer [AB]$/})});const label=await scoped.getByRole('heading',{name:/^Answer [AB]$/}).textContent();await u.page.getByLabel(label!,{exact:true}).check()}
 await sel(a);await sel(b)
 await a.page.getByLabel('Reason',{exact:true}).fill('Synthetic review one, independent reason')
 await b.page.getByLabel('Reason',{exact:true}).fill('Synthetic review two, independent reason')
 await a.page.getByRole('button',{name:'Lock vote'}).click()
 await expect(owner.page.getByText('Confirmed review slots: 1/2',{exact:true})).toBeVisible({timeout:15000})
 await expect(b.page.getByText('Synthetic review one, independent reason',{exact:true})).toHaveCount(0)
 await expect(owner.page.getByText('Synthetic review one, independent reason',{exact:true})).toHaveCount(0)
 await expect(outsider.page.getByTestId('blind-receipt-count')).toHaveText(excludedBaseline!)
 await b.context.setOffline(true)
 try{await expect(b.page.getByTestId('blind-connection')).toContainText('Reconnecting',{timeout:20000});await expect(b.page.getByRole('button',{name:'Lock vote'})).toBeDisabled();await expect(b.page.getByLabel('Reason',{exact:true})).toHaveValue('Synthetic review two, independent reason')}finally{await b.context.setOffline(false)}
 await expect(b.page.getByTestId('blind-connection')).toHaveText('Connected',{timeout:35000})
 await b.page.getByRole('button',{name:'Lock vote'}).click()
 for(const u of [owner,a,b]){await expect(u.page.getByRole('heading',{name:'Results revealed'})).toBeVisible({timeout:15000});await expect(u.page.getByText(/Both independent reviewers preferred the same answer/)).toBeVisible()}
 await expect(outsider.page.getByTestId('blind-receipt-count')).toHaveText(excludedBaseline!)
 await a.page.reload();await a.page.getByRole('button',{name:title+' · reviewer'}).click();await expect(a.page.getByRole('heading',{name:'Results revealed'})).toBeVisible({timeout:15000})
 // Run this spec only against isolated local disposable SDK dev state, not a real dataset.
})
