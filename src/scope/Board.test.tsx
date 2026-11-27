import {describe,it,expect} from 'vitest'
import {renderToString} from 'react-dom/server'
import {Board,type Row} from './Board'
import {sample} from './decision'

describe('saved record resilience',()=>{
 it('shows a warning while excluding malformed and duplicate identifiers from metrics and plan',()=>{
  const rows:Row[]=[{id:'valid',data:sample[0]},{id:'broken',data:{...sample[0],title:null} as unknown as Row['data']},{id:'duplicate',data:sample[1]},{id:'duplicate',data:sample[2]}]
  const markup=renderToString(<Board rows={rows} save={async()=>{}} change={async()=>{}}/>)
  expect(markup).toContain('saved record(s) are incomplete')
  expect(markup).toContain('Fix checkout keyboard focus')
  expect(markup).not.toContain('Add dashboard export')
  expect(markup).not.toContain('Redesign settings navigation')
  expect(markup).toContain('In suggested release')
 })
})
