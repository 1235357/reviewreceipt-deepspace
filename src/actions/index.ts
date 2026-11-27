import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'

import {createBlindRoom,listBlindRooms,readBlindRoom,submitBlindVote,syncBlindReceipt} from './blind'

export const actions: Record<string, ActionHandler<Env>> = {createBlindRoom,listBlindRooms,readBlindRoom,submitBlindVote,syncBlindReceipt}
