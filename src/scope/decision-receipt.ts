export type ReviewResult={reviewerId:string;choice:string;identity:string|null;canonical:number|null;reason:string}
export type RevealedReview={title:string;prompt:string;rubric:string;revealed:boolean;results?:ReviewResult[];answers?:{identity?:string;text:string}[]}
export type Outcome='aligned'|'inconclusive'|'disagreement'
export function reviewOutcome(room:RevealedReview):Outcome|null {
 if(!room.revealed || room.results?.length!==2)return null
 const [a,b]=room.results
 if(a.reviewerId===b.reviewerId)return null
 if(a.canonical===null&&b.canonical===null)return 'inconclusive'
 return a.canonical===b.canonical&&a.canonical!==null?'aligned':'disagreement'
}
const lines:Record<Outcome,string>={
 aligned:'Both independent reviewers preferred the same answer. Verify the supporting reasons before adoption.',
 inconclusive:'Neither reviewer selected a winner. Refine the criteria or collect better evidence before deciding.',
 disagreement:'Reviewers did not select the same outcome. Compare their reasoning and resolve the disputed criteria before deciding.',
}
export function nextCheck(outcome:Outcome){return lines[outcome]}
export function decisionReceipt(room:RevealedReview):string|null {
 const outcome=reviewOutcome(room)
 if(!outcome)return null
 return [
  '# Independent review receipt', '', room.title, '', '## Frozen question', room.prompt, '', '## Frozen evaluation criteria', room.rubric, '',
  '## Outcome', outcome, nextCheck(outcome), '', 'Reviewer agreement is not factual verification.', '',
  '## Independent judgments', ...room.results!.flatMap((r,i)=>['Reviewer '+(i+1)+': '+(r.identity??'Tie / cannot judge'), 'Reason: '+r.reason,'']),
  '## Compared answers', ...(room.answers??[]).flatMap(a=>[a.identity??'Unspecified response',a.text,'']),
  '## Follow-up', 'Confirm supporting evidence and record the final decision outside this comparison. This receipt contains reviewer preference, not certification.'
 ].join('\n')
}
