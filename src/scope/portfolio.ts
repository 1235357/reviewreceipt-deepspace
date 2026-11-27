import { assess, valid, type Decision } from './decision'

export type Candidate = { id: string; data: Decision }
export type Portfolio = { ids: string[]; effort: number; value: number; eligible: number; budget: number }
type State = { ids: string[]; effort: number; value: number }

export const MAX_BUDGET = 25
export function evidenceValue(d: Decision) { return d.impact * d.confidence }

function better(a: State, b: State) {
  if (a.value !== b.value) return a.value > b.value
  if (a.effort !== b.effort) return a.effort < b.effort
  return JSON.stringify(a.ids) < JSON.stringify(b.ids)
}

/** 0/1 knapsack limited to valid, open, evidence-qualified decisions.
 * Effort is an ordinal planning unit, not an estimate of hours or money.
 * Ties have a stable order; rows are never mutated or automatically shipped.
 */
export function recommendPortfolio(rows: readonly Candidate[], budget: number): Portfolio {
  if (!Number.isInteger(budget) || budget < 0 || budget > MAX_BUDGET) throw new RangeError('Invalid effort budget')
  const seen = new Set<string>()
  const eligible = [...rows].sort((a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).filter(r => {
    if (seen.has(r.id)) throw new Error('Duplicate decision ID')
    seen.add(r.id)
    return valid(r.data) && assess(r.data) === 'Ship'
  })
  const dp: State[] = Array.from({length:budget+1}, () => ({ ids:[], effort:0, value:0 }))
  for (const {id,data} of eligible) {
    for (let cap = budget; cap >= data.effort; cap--) {
      const prior = dp[cap-data.effort]
      const next = {ids:[...prior.ids,id],effort:prior.effort+data.effort,value:prior.value+evidenceValue(data)}
      if (better(next,dp[cap])) dp[cap]=next
    }
  }
  return {...dp[budget], eligible:eligible.length, budget}
}
