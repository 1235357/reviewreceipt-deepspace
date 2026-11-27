export const responses = [
 { identity: 'Illustrative response 1', text: 'Use a native dialog element with showModal(), a clear title and close button. Test keyboard focus, Escape, and restoration of focus to the trigger.' },
 { identity: 'Illustrative response 2', text: 'Use a fixed-position overlay with a click-to-dismiss background. Add styling to make the panel look like a modal.' },
] as const
export type Vote = 'A'|'B'|'tie'
export function canonical(reviewer: 0|1, vote: Vote): number|null {
 if(vote==='tie') return null
 return reviewer===0 ? (vote==='A'?0:1) : (vote==='A'?1:0)
}
export function reveal(votes: [Vote|null,Vote|null]) {
 if(votes[0]===null || votes[1]===null) return null
 const identities=[canonical(0,votes[0]),canonical(1,votes[1])]
 return { identities, agreement: identities[0]===identities[1] }
}

import {decisionReceipt} from './decision-receipt'
export function sampleReviewReceipt(votes:[Vote|null,Vote|null],reasons:[string,string]) {
 const result=reveal(votes)
 if(!result||reasons.some(r=>r.trim().length<3))return null
 const receipt=decisionReceipt({
  title:'Illustrative sample',prompt:'How should a website implement an accessible modal?',
  rubric:'Prefer concrete, accessible behavior and verifiable guidance.',
  revealed:true,answers:responses.map(r=>({...r})),results:result.identities.map((id,i)=>({
    reviewerId:'demo-'+(i+1),choice:votes[i]!,identity:id===null?null:responses[id].identity,
    canonical:id===null?null:id+1,reason:reasons[i].trim(),
  }))
 })
 return receipt?'SIMULATED DEMO — authored examples, one device, no real collaboration.\n\n'+receipt:null
}
