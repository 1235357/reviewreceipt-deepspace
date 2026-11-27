import type { CollectionSchema } from 'deepspace/schema'
export const decisionSchema: CollectionSchema = {
  name:'decisions',
  columns:[
    {name:'title',storage:'text',interpretation:'plain',required:true},
    {name:'evidence',storage:'text',interpretation:'plain',required:true},
    {name:'impact',storage:'number',interpretation:'plain',required:true},
    {name:'effort',storage:'number',interpretation:'plain',required:true},
    {name:'confidence',storage:'number',interpretation:'plain',required:true},
    {name:'status',storage:'text',interpretation:{kind:'select',options:['open','shipped','deferred']}},
    {name:'fileKey',storage:'text',interpretation:'plain'},
    {name:'fileName',storage:'text',interpretation:'plain'},
  ],
  permissions:{member:{read:'own',create:true,update:'own',delete:false},admin:{read:'own',create:true,update:'own',delete:false}}
}
