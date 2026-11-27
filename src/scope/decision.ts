export type Decision = {title: string; evidence: string; impact: number; effort: number; confidence: number; status: 'open'|'shipped'|'deferred'; fileKey: string; fileName: string}
export type Outcome = 'Ship' | 'Verify' | 'Defer' | 'Closed'
export const sample: Decision[] = [
  {title:'Fix checkout keyboard focus',evidence:'Keyboard-only walkthrough cannot reach the confirmation button.',impact:5,effort:2,confidence:5,status:'open',fileKey:'',fileName:''},
  {title:'Add dashboard export',evidence:'One reviewer requested CSV export; no usage data yet.',impact:3,effort:2,confidence:2,status:'open',fileKey:'',fileName:''},
  {title:'Redesign settings navigation',evidence:'Cosmetic cleanup; no blocked user flow.',impact:1,effort:4,confidence:4,status:'open',fileKey:'',fileName:''},
  {title:'Explain failed export recovery',evidence:'A support walkthrough reproduced the same confusing retry message.',impact:4,effort:2,confidence:4,status:'open',fileKey:'',fileName:''},
  {title:'Improve release verification checklist',evidence:'A review found a missing prerequisite in the current checklist.',impact:4,effort:3,confidence:5,status:'open',fileKey:'',fileName:''},
]
export function assess(d: Decision): Outcome {
  if(d.status !== 'open') return 'Closed'
  if(d.confidence < 3) return 'Verify'
  return d.impact >= 3 && d.impact >= d.effort ? 'Ship' : 'Defer'
}
export function efficiency(d: Decision) {return d.impact / Math.max(1,d.effort)}
export function valid(input: unknown): input is Decision {
 if(typeof input!=='object'||input===null)return false
 const d=input as Partial<Decision>
 return typeof d.title==='string' && d.title.trim().length>0 && d.title.length<=100
 && typeof d.evidence==='string' && d.evidence.trim().length>0 && d.evidence.length<=1000
 && [d.impact,d.effort,d.confidence].every(v=>typeof v==='number'&&Number.isInteger(v)&&v>=1&&v<=5)
 && (d.status==='open'||d.status==='shipped'||d.status==='deferred')
 && typeof d.fileKey==='string' && typeof d.fileName==='string'
}
