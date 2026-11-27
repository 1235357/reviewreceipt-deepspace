import {describe,it,expect} from 'vitest'
import {reveal,sampleReviewReceipt} from './blind-demo'
describe('public illustrative comparison',()=>{
 it('does not reveal after a single vote',()=>expect(reveal(['A',null])).toBeNull())
 it('maps opposite labels to the same answer',()=>expect(reveal(['A','B'])).toEqual({identities:[0,0],agreement:true}))
 it('maps equal labels to distinct answers',()=>expect(reveal(['A','A'])).toEqual({identities:[0,1],agreement:false}))
 it('preserves ties',()=>expect(reveal(['tie','B'])).toEqual({identities:[null,0],agreement:false}))
})

describe('public demonstration receipt',()=>{
 it('is unavailable before both independent simulated reasons exist',()=>expect(sampleReviewReceipt(['A',null],['reason one',''])).toBeNull())
 it('marks the returned receipt as simulated and includes both reasons',()=>{const receipt=sampleReviewReceipt(['A','B'],['reason one','reason two'])!;expect(receipt).toContain('SIMULATED DEMO');expect(receipt).toContain('reason one');expect(receipt).toContain('reason two')})
})
