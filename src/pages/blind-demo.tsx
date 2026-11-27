import {useState} from 'react'
import {Link} from 'react-router-dom'
import {Seo} from '../components/Seo'
import {seo} from '../seo'
import {responses,reveal,sampleReviewReceipt, type Vote} from '../scope/blind-demo'
import '../scope/review.css'
export default function Landing(){
 const [votes,setVotes]=useState<[Vote|null,Vote|null]>([null,null])
 const [choice,setChoice]=useState<Vote|null>(null)
 const [reasons,setReasons]=useState<[string,string]>(['',''])
 const [reason,setReason]=useState('')
 const result=reveal(votes)
 const receipt=sampleReviewReceipt(votes,reasons)
 const download=()=>{if(!receipt)return;const url=URL.createObjectURL(new Blob([receipt],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='reviewreceipt-simulated-demo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 const reviewer=votes[0]===null?0:1
 const order=reviewer===0?[0,1]:[1,0]
 return <><Seo {...seo} title="ReviewReceipt | Independent AI output review" description="Review masked answers independently and export a traceable review receipt." path="/blind-demo"/><main className="review-page" data-testid="static-landing">
 <header><p className="review-kicker">Independent evidence comparison</p><h1>ReviewReceipt</h1><p>Compare two AI answers without seeing their model names or your teammate’s decision. Reveal the outcome only after both reviewers commit.</p>
 <Link to="/blind">Open authenticated review workspace →</Link></header>
 <section className="review-card"><h2>Try the 60-second sample</h2><p>This local demonstration simulates two reviewers on one device. It uses authored examples, not actual model outputs. No information is saved or shared.</p>
 <p><strong>Question:</strong> How should a website implement an accessible modal?</p><p><strong>Criteria:</strong> Prefer concrete, accessible behavior and verifiable guidance.</p>
 <label htmlFor="sample-progress">Locked demo votes: {votes.filter(v=>v!==null).length}/2</label><progress id="sample-progress" value={votes.filter(v=>v!==null).length} max={2}/>
 {result?<section aria-live="polite"><h3>Reveal</h3>{result.identities.map((id,i)=><p key={i}>Reviewer {i+1}: {id===null?'Tie / cannot judge':responses[id].identity}</p>)}<p>{result.identities.every(x=>x===null)?'Both reviewers could not judge: inconclusive.':result.agreement?'Reviewers selected the same canonical outcome.':'Reviewers selected different outcomes.'} Agreement does not prove factual accuracy.</p><div className="review-buttons"><button type="button" disabled={!receipt} onClick={download}>Download sample receipt</button><button type="button" onClick={()=>{setVotes([null,null]);setChoice(null);setReasons(['','']);setReason('')}}>Restart sample</button></div></section>:<form className="review-form" onSubmit={e=>{e.preventDefault();if(choice===null||reason.trim().length<3)return;setVotes(v=>reviewer===0?[choice,v[1]]:[v[0],choice]);setReasons(r=>reviewer===0?[reason.trim(),r[1]]:[r[0],reason.trim()]);setChoice(null);setReason('')}}>
 <h3>Simulated reviewer {reviewer+1}</h3><div className="review-answers">{order.map((id,i)=><article className="review-step" key={id}><h4>Answer {i===0?'A':'B'}</h4><p>{responses[id].text}</p></article>)}</div>
 <fieldset><legend>Choose the stronger response</legend>{(['A','B','tie'] as const).map(v=><label key={v}><input type="radio" name="sample-vote" value={v} checked={choice===v} required onChange={()=>setChoice(v)}/>{v==='tie'?'Tie / cannot judge':'Answer '+v}</label>)}</fieldset><label>Reason (what supports your choice?)<textarea value={reason} onChange={e=>setReason(e.target.value)} required minLength={3} maxLength={400} rows={2}/></label><button type="submit" disabled={choice===null||reason.trim().length<3}>Lock simulated vote</button></form>}</section>
 <section className="review-card"><h2>Why a shared workspace?</h2><p>A normal group chat exposes reviewer opinions before the next person decides. A spreadsheet can record votes, but independent masking and a controlled reveal require extra coordination. The signed-in workspace is designed to separate room membership, private ballots and public-to-members progress; this sample is not evidence that live collaboration works.</p></section>
 </main></>
}
