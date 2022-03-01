import { Schema, model } from 'mongoose';
import { IMessage } from '../types/message.type';
const MessageSchema = new Schema<IMessage>({
    msg: {
        type: String
    },
    sender: {
        type: Schema.Types.ObjectId
    },
    readers: [{
        type: Schema.Types.ObjectId
    }], 
    roomID: {
        type: Schema.Types.ObjectId
    },
}, { timestamps: true });

const UserModel = model('messages', MessageSchema);
export default UserModel;