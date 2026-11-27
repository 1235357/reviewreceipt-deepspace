import {useState} from 'react'
import {reviewTemplates,type ReviewTemplate} from '../scope/review-templates'
export function ReviewTemplates({onApply}:{onApply:(template:ReviewTemplate)=>void}){
 const [applied,setApplied]=useState('')
 return <section className="review-template-panel" aria-label="Review starter templates">
  <div><p className="review-kicker">Start with a template</p><p className="review-muted">Choose a common task. It fills only empty title, question and criteria fields. You supply both actual answers.</p></div>
  <div className="review-template-grid">{reviewTemplates.map(t=><article className="review-template" key={t.id}><h3>{t.title}</h3><p>{t.description}</p><button type="button" onClick={()=>{onApply(t);setApplied(t.title+' template selected. Existing text was preserved. Review the fields below.')}}>Use {t.title.toLowerCase()}</button></article>)}</div>
 <p role="status" className="review-muted">{applied}</p></section>
}
