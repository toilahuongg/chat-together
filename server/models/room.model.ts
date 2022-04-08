
import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

import { IRoom } from '../types/room.type';

const RoomSchema = new Schema<IRoom>({
    name: {
        type: String
    },
    isGroup: {
        type: Boolean
    },
    userIDs: [{
        type: Schema.Types.ObjectId
    }], 
    ownerID: {
        type: Schema.Types.ObjectId,
        transform: (v: any) => v == null ? '' : v
    },
    settings: {},
    lastChange: {
        type: Date
    }
    
}, { timestamps: true });

const updateLastChange = async (room: IRoom) => {
    room.lastChange = new Date()
    await room.save()
}
const RoomModel = model<IRoom>('rooms', RoomSchema);
export default RoomModel;
export {updateLastChange}