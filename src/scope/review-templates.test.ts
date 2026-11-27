import {describe,it,expect} from 'vitest'
import {applyReviewTemplate,reviewTemplates} from './review-templates'
describe('review starter templates',()=>{
 it('fills empty task fields without inventing answers',()=>{
   const draft={title:'',prompt:'',rubric:'',answer1:'',answer2:'',reviewer1:''}
   const result=applyReviewTemplate(draft,reviewTemplates[0])
   expect(result.title).toBe(reviewTemplates[0].title)
   expect(result.prompt).toBe(reviewTemplates[0].prompt)
   expect(result.rubric).toBe(reviewTemplates[0].rubric)
   expect(result.answer1).toBe('');expect(result.answer2).toBe('');expect(result.reviewer1).toBe('')
 })
 it('preserves existing user text, identities and candidate responses',()=>{
   const draft={title:'My project',prompt:'Actual question',rubric:'',answers:[{identity:'X',text:'Actual answer'}]}
   const result=applyReviewTemplate(draft,reviewTemplates[1])
   expect(result.title).toBe(draft.title);expect(result.prompt).toBe(draft.prompt)
   expect(result.answers).toBe(draft.answers);expect(result.rubric).toBe(reviewTemplates[1].rubric)
 })
 it('keeps all filled fields unchanged',()=>{
   const draft={title:'T',prompt:'Q',rubric:'R'}
   expect(applyReviewTemplate(draft,reviewTemplates[2])).toEqual(draft)
 })
})
