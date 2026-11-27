import {describe,it,expect} from 'vitest'
import {decisionReceipt,reviewOutcome,type RevealedReview} from './decision-receipt'
const room:RevealedReview={title:'Room',prompt:'Frozen question',rubric:'Criteria',revealed:true,results:[{reviewerId:'r1',choice:'A',identity:'one',canonical:1,reason:'reason one'},{reviewerId:'r2',choice:'B',identity:'one',canonical:1,reason:'reason two'}]}
describe('decision receipt',()=>{
 it('does not export a sealed review',()=>expect(decisionReceipt({...room,revealed:false})).toBeNull())
 it('retains reasons and criteria, not account identifiers',()=>{const r=decisionReceipt(room)!;expect(r).toContain('reason one');expect(r).toContain('Criteria');expect(r).not.toContain('r1');expect(r).toContain('not factual verification')})
 it('distinguishes shared tie from a consensus preference',()=>expect(reviewOutcome({...room,results:room.results!.map(r=>({...r,canonical:null,identity:null}))})).toBe('inconclusive'))
 it('identifies disagreements even if one reviewer abstained',()=>expect(reviewOutcome({...room,results:[room.results![0],{...room.results![1],canonical:null,identity:null}]})).toBe('disagreement'))
 it('rejects incomplete or duplicate reviewers',()=>expect(reviewOutcome({...room,results:[room.results![0],room.results![0]]})).toBeNull())
})
