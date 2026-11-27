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
 it('marks the returned receipt as simulated and includes both reasons',()=>{const receipt=sampleReviewReceipt(['A','B'],['reason one','reason two'])!;expect(receipt).toContain('SIMULATED DEMO');expect(receipt).toContain('stackoverflow.com/questions/76280041');expect(receipt).toContain('techdocs.zebra.com/datawedge/15-0/guide/api/softscantrigger/');expect(receipt).toContain('reason one');expect(receipt).toContain('reason two')})
})

import {freezeLocalPacket,localReviewReceipt,samplePacket} from './blind-demo'
describe('guest comparison',()=>{
 it('validates and freezes a distinct user packet',()=>{const p=freezeLocalPacket({...samplePacket,title:' My review '});expect(p?.title).toBe('My review');expect(freezeLocalPacket({...samplePacket,answers:[samplePacket.answers[0],samplePacket.answers[0]]})).toBeNull()})
 it('labels the user-supplied local result and does not claim verified identities',()=>{const r=localReviewReceipt(samplePacket,['A','B'],['first reason','second reason'],false)!;expect(r).toContain('LOCAL GUEST REVIEW');expect(r).toContain('independence are not verified')})
})
