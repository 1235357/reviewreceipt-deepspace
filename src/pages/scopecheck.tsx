import {useState} from 'react'
import {Link} from 'react-router-dom'
import {Board} from '../scope/Board'
import {sample} from '../scope/decision'
import {Seo} from '../components/Seo'
import {seo} from '../seo'
export default function Landing(){
 const [rows,setRows]=useState(()=>sample.map((data,i)=>({id:String(i),data})))
 return <><Seo {...seo} title="ScopeCheck | Archived release decision tool" description="Archived ScopeCheck release decision demo." path="/scopecheck"/><div data-testid="static-landing"><nav className="scope-nav"><strong>ScopeCheck</strong><span>Interactive sample · no data is saved</span><Link to="/workspace">Open saved workspace →</Link><Link to="/">Return to ReviewReceipt →</Link></nav><Board demo rows={rows} save={async d=>{setRows(r=>[...r,{id:crypto.randomUUID(),data:d}])}} change={async(id,p)=>setRows(r=>r.map(x=>x.id===id?{...x,data:{...x.data,...p}}:x))}/></div></>
}
