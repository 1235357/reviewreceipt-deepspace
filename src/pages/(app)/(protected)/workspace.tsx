import {useQuery,useMutations,useR2Files} from 'deepspace'
import {Board} from '../../../scope/Board'
import type {Decision} from '../../../scope/decision'
export default function Workspace(){
 const {records,status,error}=useQuery<Decision>('decisions',{orderBy:'createdAt',orderDir:'desc'})
 const {createConfirmed,putConfirmed}=useMutations<Decision>('decisions')
 const {upload,downloadFile}=useR2Files({scope:'self'})
 return <>{status==='error'&&<p role="alert">Unable to load decisions: {String(error)}</p>}<Board rows={records.map(r=>({id:r.recordId,data:r.data}))} busy={status==='loading'}
 save={async d=>{await createConfirmed(d)}} change={async(id,p)=>{await putConfirmed(id,p)}}
 attachment={async(id,file)=>{if(file.size>2*1024*1024||!['image/png','image/jpeg','application/pdf','text/plain'].includes(file.type))throw new Error('Choose PNG, JPEG, PDF or text up to 2 MB.');const result=await upload(file,file.name);if(!result.success||!result.key)throw new Error('Upload failed.'); await putConfirmed(id,{fileKey:result.key,fileName:file.name})}}
 download={async key=>{const r=await downloadFile(key);if(!r.success)throw new Error('Download failed.')}}/></>
}
