import {decisionReceipt} from './decision-receipt'
export type Candidate={identity:string;text:string}
export type LocalPacket={title:string;prompt:string;rubric:string;answers:[Candidate,Candidate]}
export const sampleSources=[
 {label:'Public developer question (May 2023)',url:'https://stackoverflow.com/questions/76280041/zebra-datawedge-how-to-trigger-a-scan-from-code'},
 {label:'Official Zebra TechDocs: DataWedge 15.0 — Soft Scan Trigger',url:'https://techdocs.zebra.com/datawedge/15-0/guide/api/softscantrigger/'},
] as const
export const responses = [
 { identity: 'Candidate documentation revision 1', text: 'Add a prerequisite and troubleshooting note to the Soft Scan Trigger guide: verify the active profile has Barcode Input enabled; connect the on-screen control to the documented start/stop/toggle commands; wait for scanner readiness before repeating a command. Clarify that continuous scanning behavior depends on the installed version, profile, and scanner configuration. Confirm these on the device before promising a result.' },
 { identity: 'Candidate documentation revision 2', text: 'Add a short example showing how to start and stop scanning from an on-screen button, with a link to the existing Soft Scan Trigger API example. Add a separate note asking developers to consult the scanner settings guide for automatic or continuous scanning. This keeps the main example short and leaves device-specific details in the related guide.' },
] as const
export const samplePacket:LocalPacket={title:'Public case: software-controlled barcode scanning',prompt:'A developer reports that the hardware trigger works on a Zebra MC33X and asks how to start scans from an on-screen button, including automatic or continuous scanning. Which proposed documentation revision should a team adopt?',rubric:'Prefer actionable guidance, explicit prerequisites, version-aware evidence and honest limitations. Do not infer the installed software version or claim a device test.',answers:[{...responses[0]},{...responses[1]}]}
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
 return warning+(sample?'\nPublic case sources (candidate revisions are authored examples):\n'+sampleSources.map(source=>source.label+': '+source.url).join('\n'):'')+'\n\n'+receipt.replace('# Independent review receipt','# Local review receipt').replace('## Independent judgments','## Local review slots').replace('Both independent reviewers','Both review slots')
}
export function sampleReviewReceipt(votes:[Vote|null,Vote|null],reasons:[string,string]) {
 return localReviewReceipt(samplePacket,votes,reasons,true)
}
