import { useState, type FormEvent } from 'react'
import { assess, efficiency, valid, type Decision } from './decision'
import { MAX_BUDGET, recommendPortfolio, evidenceValue } from './portfolio'
export type Row = {id:string;data:Decision}
const empty:Decision={title:'',evidence:'',impact:3,effort:3,confidence:3,status:'open',fileKey:'',fileName:''}
export function Board({rows,save,change,attachment,download,busy=false,demo=false}:{
 rows:Row[];save:(d:Decision)=>Promise<void>;change:(id:string,p:Partial<Decision>)=>Promise<void>;attachment?:(id:string,f:File)=>Promise<void>;download?:(key:string)=>Promise<void>;busy?:boolean;demo?:boolean
}) {
 const [draft,setDraft]=useState(empty),[error,setError]=useState(''),[pending,setPending]=useState(false),[filter,setFilter]=useState('All')
 const [budget,setBudget]=useState(5)
 const identityCounts=new Map<string,number>()
 for(const row of rows) if(row&&typeof row.id==='string'&&row.id) identityCounts.set(row.id,(identityCounts.get(row.id)??0)+1)
 const safeRows=rows.filter(row=>row&&typeof row.id==='string'&&row.id&&identityCounts.get(row.id)===1&&valid(row.data))
 const skipped=rows.length-safeRows.length
 const sorted=[...safeRows].sort((a,b)=>efficiency(b.data)-efficiency(a.data))
 const portfolio=recommendPortfolio(safeRows,budget), selected=new Set(portfolio.ids)
 const byId=new Map(safeRows.map(row=>[row.id,row]))
 const planned=portfolio.ids.map(id=>byId.get(id)!).filter(Boolean)
 const filters=['All','Ship','Verify','Defer','Closed']
 async function run(fn:()=>Promise<void>){setError('');setPending(true);try{await fn()}catch(e){setError(e instanceof Error?e.message:'Please try again.')}finally{setPending(false)}}
 async function add(e:FormEvent){e.preventDefault();if(!valid(draft)){setError('Complete the title and evidence; scores must be 1–5.');return;}await run(async()=>{await save({...draft,title:draft.title.trim(),evidence:draft.evidence.trim()});setDraft(empty)})}
 return <div className="scope">
   <header className="scope-header"><div><p className="eyebrow">Release decision workspace {demo?' / sample data':''}</p><h1>What deserves to ship?</h1><p>Evidence before effort. Sort candidate changes by impact, cost, and confidence.</p></div><aside><strong>{safeRows.filter(r=>assess(r.data)==='Ship').length}</strong><span>ready to ship</span></aside></header>
   {error&&<p role="alert" className="scope-error">{error}</p>}
   {skipped>0&&<p role="status" className="scope-error">{skipped} saved record(s) are incomplete or have conflicting identifiers. They are excluded from the queue and plan; no stored record was changed.</p>}
   <section className="scope-portfolio" aria-labelledby="portfolio-title">
    <div><p className="eyebrow">Evidence-qualified allocation</p><h2 id="portfolio-title">Plan a release within capacity</h2><p className="scope-portfolio-note">Choose the strongest supported set, not just the top-ranked item. No decisions are changed automatically.</p>
     <label className="scope-budget">Effort budget <output htmlFor="effort-budget">{budget} units</output><input id="effort-budget" type="range" min="0" max={MAX_BUDGET} value={budget} onChange={e=>setBudget(Number(e.target.value))}/></label>
    </div>
    <div className="scope-allocation" aria-live="polite">
     <dl><div><dt>Selected</dt><dd>{portfolio.ids.length} / {portfolio.eligible}</dd></div><div><dt>Effort</dt><dd>{portfolio.effort} / {budget}</dd></div><div><dt>Priority value</dt><dd>{portfolio.value}</dd></div></dl>
     {planned.length?<ul aria-label="Recommended release decisions">{planned.map(({id,data})=><li key={id}><strong>{data.title}</strong><span>{data.effort} effort · {evidenceValue(data)} value</span></li>)}</ul>:<p>No evidence-qualified decision fits this budget.</p>}
     <details><summary>How the plan is calculated</summary><p>Only open Ship decisions qualify. The planner maximizes the total impact × confidence under the selected effort budget; it resolves equal scores with lower effort and a stable ID order. These are ordinal planning units, not hours, money or guaranteed outcomes.</p></details>
    </div>
   </section>
   <div className="scope-grid"><section aria-label="Decision queue"><div className="scope-filters" aria-label="Filter decisions">{filters.map(f=><button type="button" key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f} <span>{f==='All'?safeRows.length:safeRows.filter(r=>assess(r.data)===f).length}</span></button>)}</div>
   {busy&&<p role="status">Loading your saved decisions…</p>}
   {!busy&&sorted.filter(r=>filter==='All'||assess(r.data)===filter).length===0&&<p className="scope-empty">No decisions in this view. Add one to start.</p>}
   {sorted.filter(r=>filter==='All'||assess(r.data)===filter).map(({id,data:d})=><article className="scope-card" key={id}>
       <div className="scope-card-head"><h2>{d.title}</h2><span className={'scope-badge '+assess(d).toLowerCase()}>{assess(d)==='Closed'?d.status:assess(d)}</span></div>
       <p>{d.evidence}</p>{selected.has(id)&&<p className="scope-plan-badge">In suggested release</p>}<dl><div><dt>Impact</dt><dd>{d.impact}/5</dd></div><div><dt>Effort</dt><dd>{d.effort}/5</dd></div><div><dt>Confidence</dt><dd>{d.confidence}/5</dd></div></dl>
       {attachment&&<div className="scope-file">{d.fileKey?<button disabled={pending} onClick={()=>void run(()=>download!(d.fileKey))}>Download {d.fileName}</button>:<label>Attach public or non-sensitive evidence (max 2 MB)<input type="file" accept="image/png,image/jpeg,application/pdf,text/plain" disabled={pending} onChange={e=>{const f=e.currentTarget.files?.[0];e.currentTarget.value='';if(f)void run(()=>attachment(id,f))}}/></label>}</div>}
       <div className="scope-actions">{d.status==='open'?<><button disabled={pending} onClick={()=>void run(()=>change(id,{confidence:Math.min(5,d.confidence+1)}))}>Increase confidence</button><button disabled={pending} onClick={()=>void run(()=>change(id,{status:'shipped'}))}>Mark shipped</button><button disabled={pending} onClick={()=>void run(()=>change(id,{status:'deferred'}))}>Defer</button></>:<button disabled={pending} onClick={()=>void run(()=>change(id,{status:'open'}))}>Reopen</button>}</div>
   </article>)}</section>
   <aside><form className="scope-form" onSubmit={add}><h2>New decision</h2><label>Proposed change<input value={draft.title} required maxLength={100} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><label>Evidence or open question<textarea required maxLength={1000} rows={4} value={draft.evidence} onChange={e=>setDraft({...draft,evidence:e.target.value})}/></label>{(['impact','effort','confidence'] as const).map(k=><label key={k} className="score-label">{k}<select value={draft[k]} onChange={e=>setDraft({...draft,[k]:Number(e.target.value)})}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label>)}<p className="scope-hint">Suggested: <strong>{assess(draft)}</strong>. Confidence below 3 means verify first; otherwise ship when impact is at least 3 and no lower than effort.</p><button className="scope-primary" type="submit" disabled={pending}>{pending?'Saving…':'Add decision'}</button></form><p className="scope-hint">Recommendations are transparent heuristics, not facts. You decide what ships.</p></aside></div>
 </div>
}
