export type ReviewTemplate={id:string;title:string;description:string;prompt:string;rubric:string}
export const reviewTemplates:readonly ReviewTemplate[]=[
 {id:'technical',title:'Technical recommendation',description:'Compare architectures, fixes or implementation options.',prompt:'Which proposal best meets the stated technical requirements? Add your actual constraints and context.',rubric:'Evaluate correctness, evidence, compatibility, maintainability and explicit limitations. Prefer a verifiable next step over unsupported certainty.'},
 {id:'assistant',title:'AI answer quality',description:'Compare two answers to the same user question.',prompt:'Which answer better addresses the original question? Replace this sentence with the actual user question.',rubric:'Evaluate relevance, factual support, completeness and clarity. Note unsupported claims and unresolved uncertainty.'},
 {id:'code',title:'Code review recommendation',description:'Compare two proposed code changes or review comments.',prompt:'Which recommendation is more useful for the stated code change? Add the real review context.',rubric:'Evaluate correctness, concrete evidence, regressions, readability and testability. Distinguish verified behavior from assumptions.'},
]
export function applyReviewTemplate<T extends {title:string;prompt:string;rubric:string}>(draft:T,template:ReviewTemplate):T{
 return {...draft,title:draft.title.trim()?draft.title:template.title,prompt:draft.prompt.trim()?draft.prompt:template.prompt,rubric:draft.rubric.trim()?draft.rubric:template.rubric}
}
