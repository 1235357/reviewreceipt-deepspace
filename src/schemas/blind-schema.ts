import type {CollectionSchema,ColumnDefinition} from 'deepspace/schema'
const col=(name:string,maxLength:number):ColumnDefinition=>({name,storage:'text',interpretation:'plain',required:true,immutable:true,maxLength})
const deny={read:false,create:false,update:false,delete:false} as const
const shared={...deny,read:'shared'} as const
const hidden={permissions:{'*':deny,viewer:deny,member:deny,admin:deny}}
export const blindRoomSchema:CollectionSchema={name:'blind_rooms',...hidden,uniqueOn:['ownerId','submissionKey'],columns:[
 col('ownerId',128),col('reviewer1',128),col('reviewer2',128),col('submissionKey',64),col('title',100),col('prompt',3000),col('rubric',2000),col('answer1',6000),col('answer2',6000),col('identity1',100),col('identity2',100),col('order1',1),col('order2',1)
]}
export const blindBallotSchema:CollectionSchema={name:'blind_ballots',...hidden,uniqueOn:['roomId','reviewerId'],columns:[col('roomId',128),col('reviewerId',128),col('choice',3),col('reason',2000)]}
export const blindReceiptSchema:CollectionSchema={name:'blind_receipts',collaboratorsField:'collaborators',permissions:{'*':deny,viewer:deny,member:shared,admin:shared},uniqueOn:['roomId','reviewerId'],columns:[col('roomId',128),col('reviewerId',128),{name:'collaborators',storage:'text',interpretation:{kind:'json'},immutable:true,required:true}]}
