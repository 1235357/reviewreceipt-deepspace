import {describe,it,expect} from 'vitest'
import {assess,valid,sample} from './decision'
describe('decision logic',()=>{
 it('ships supported high impact changes',()=>expect(assess(sample[0])).toBe('Ship'))
 it('prioritizes verification when evidence is weak',()=>expect(assess(sample[1])).toBe('Verify'))
 it('defers low impact and high effort',()=>expect(assess(sample[2])).toBe('Defer'))
 it('closes shipped and deferred',()=>expect(assess({...sample[0],status:'shipped'})).toBe('Closed'))
 it('rejects invalid evidence and scores',()=>{expect(valid({...sample[0],evidence:' '})).toBe(false);expect(valid({...sample[0],impact:6})).toBe(false)})
 it('rejects malformed saved shapes without throwing',()=>{for(const x of [null,undefined,{}, {...sample[0],title:null},{...sample[0],evidence:null},{...sample[0],status:'unknown'},{...sample[0],fileKey:null}])expect(valid(x)).toBe(false)})
 it('accepts sample cases',()=>expect(sample.every(valid)).toBe(true))
})
