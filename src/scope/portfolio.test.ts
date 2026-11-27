import {describe,it,expect} from 'vitest'
import {recommendPortfolio,evidenceValue} from './portfolio'
import {sample,type Decision} from './decision'
const row=(id:string,impact:number,effort:number,confidence:number,status:Decision['status']='open')=>({id,data:{...sample[0],title:id,impact,effort,confidence,status}})
describe('bounded evidence-qualified release planning',()=>{
 it('chooses the maximal total value, not a greedy single item',()=>{
  const rows=[row('a',5,4,5),row('b',4,2,4),row('c',4,2,4)]
  expect(recommendPortfolio(rows,4)).toMatchObject({ids:['b','c'],effort:4,value:32,eligible:3})
 })
 it('excludes low confidence, low impact, closed and invalid decisions',()=>{
  const rows=[row('ok',3,2,3),row('verify',5,1,2),row('defer',2,1,5),row('closed',5,1,5,'shipped'),row('invalid',9,1,5)]
  expect(recommendPortfolio(rows,5)).toMatchObject({ids:['ok'],effort:2,value:9,eligible:1})
 })
 it('safely excludes a malformed saved decision',()=>{const broken={id:'broken',data:{...sample[0],evidence:null} as unknown as Decision};expect(recommendPortfolio([broken,row('ok',3,2,4)],5)).toMatchObject({ids:['ok'],eligible:1})})
 it('returns an empty portfolio below minimum cost and for zero effort budget',()=>{
  expect(recommendPortfolio([row('a',4,3,5)],2).ids).toEqual([])
  expect(recommendPortfolio([],0)).toEqual({ids:[],effort:0,value:0,eligible:0,budget:0})
 })
 it('uses lower effort and deterministic id order for equal objective',()=>{
  expect(recommendPortfolio([row('z',4,3,3),row('a',4,2,3)],3).ids).toEqual(['a'])
  expect(recommendPortfolio([row('z',4,2,3),row('a',4,2,3)],2).ids).toEqual(['a'])
 })
 it('never returns the same item twice and rejects bad budgets and duplicate IDs',()=>{
  expect(recommendPortfolio([row('a',4,2,3)],25).ids).toEqual(['a'])
  for(const x of [-1,26,1.2,NaN]) expect(()=>recommendPortfolio([],x)).toThrow()
  expect(()=>recommendPortfolio([row('a',4,2,3),row('a',4,2,3)],4)).toThrow()
 })
 it('agrees with exhaustive subsets for 80 deterministic small problem instances',()=>{
  let seed=31
  const rand=()=>{seed=(seed*48271)%2147483647;return seed}
  for(let n=0;n<80;n++){
   const rows=Array.from({length:6},(_,i)=>row(String(i),3+rand()%3,1+rand()%3,3+rand()%3))
   const budget=rand()%12
   let max=0
   for(let mask=0;mask<(1<<rows.length);mask++){
    const subset=rows.filter((_,i)=>mask&(1<<i))
    if(subset.reduce((s,r)=>s+r.data.effort,0)<=budget) max=Math.max(max,subset.reduce((s,r)=>s+evidenceValue(r.data),0))
   }
   const result=recommendPortfolio(rows,budget)
   expect(result.value).toBe(max)
   expect(result.effort).toBeLessThanOrEqual(budget)
  }
 })
})
