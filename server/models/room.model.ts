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
    settings: {}
}, { timestamps: true });

const RoomModel = model('rooms', RoomSchema);
export default RoomModel;