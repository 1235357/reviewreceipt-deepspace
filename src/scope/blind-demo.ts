import {decisionReceipt} from './decision-receipt'
export type Candidate={identity:string;text:string}
export type LocalPacket={title:string;prompt:string;rubric:string;answers:[Candidate,Candidate]}
export const responses = [
 { identity: 'Illustrative response 1', text: 'Update the existing troubleshooting guide with a short checklist: verify the version, confirm the relevant configuration, and test with a minimal example. Link to the authoritative reference.' },
 { identity: 'Illustrative response 2', text: 'Add a general note telling users to restart the application and retry. Include a link to the general support page.' },
] as const
export const samplePacket:LocalPacket={title:'Choose a documentation fix',prompt:'Two AI tools propose different updates to a troubleshooting guide. Which should the team adopt?',rubric:'Favor actionable steps, version-specific evidence, and verifiable guidance. Do not assume an unconfirmed root cause.',answers:[{...responses[0]},{...responses[1]}]}
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
export function freezeLocalPacket(packet:LocalPacket):LocalPacket|null {
 const title=packet.title.trim(),prompt=packet.prompt.trim(),rubric=packet.rubric.trim()
 const answers=packet.answers.map(a=>({identity:a.identity.trim(),text:a.text.trim()})) as [Candidate,Candidate]
 if(!title||title.length>100||!prompt||prompt.length>3000||!rubric||rubric.length>2000||answers.some(a=>!a.identity||a.identity.length>100||!a.text||a.text.length>6000)||answers[0].identity===answers[1].identity)return null
 return {title,prompt,rubric,answers}
}
export function localReviewReceipt(packet:LocalPacket,votes:[Vote|null,Vote|null],reasons:[string,string],sample:boolean) {
 const result=reveal(votes)
 if(!result||reasons.some(r=>r.trim().length<3))return null
 const receipt=decisionReceipt({
  title:packet.title,prompt:packet.prompt,rubric:packet.rubric,
  revealed:true,answers:packet.answers,results:result.identities.map((id,i)=>({
    reviewerId:'local-'+(i+1),choice:votes[i]!,identity:id===null?null:packet.answers[id].identity,
    canonical:id===null?null:id+1,reason:reasons[i].trim(),
  }))
 })
 if(!receipt)return null
 const warning=sample?'SIMULATED DEMO — authored examples, one device, no real collaboration.':'LOCAL GUEST REVIEW — supplied responses, one device; reviewer identities and independence are not verified.'
 return warning+'\n\n'+receipt.replace('# Independent review receipt','# Local review receipt').replace('## Independent judgments','## Local review slots').replace('Both independent reviewers','Both review slots')
}
export function sampleReviewReceipt(votes:[Vote|null,Vote|null],reasons:[string,string]) {
 return localReviewReceipt(samplePacket,votes,reasons,true)
}
