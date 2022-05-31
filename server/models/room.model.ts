import { Schema, model, Types } from 'mongoose';
import { IRoomModel }  from '../types/room.type';
// import MessageModel from './message.model';
// import { Message } from './message.model';


const RoomSchema = new Schema<IRoomModel>({
    name: {
        type: String
    },
    isGroup: {
        type: Boolean,
        default: true
    },
    userIDs: [{
        type: Types.ObjectId
    }], 
    ownerID: {
        type: Types.ObjectId,
        transform: (v: any) => v == null ? '' : v
    },
    avatar: {
        type: String
    },
    settings: {},
    name2: {}
}, { timestamps: true });
const RoomModel = model<IRoomModel>('rooms', RoomSchema);
export default RoomModel;
