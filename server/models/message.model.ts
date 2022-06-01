import { Schema, model } from 'mongoose';
import { IMessageModel } from '../types/message.type';
const MessageSchema = new Schema<IMessageModel>({
    msg: {
        type: { type: String },
        value: { type: String }
    },
    sender: {
        type: Schema.Types.ObjectId
    },
    roomID: {
        type: Schema.Types.ObjectId
    },
    readers: [{
        type: Schema.Types.ObjectId
    }],
    images: [
        {type: String}
    ]
}, { timestamps: true });

const MessageModel = model('messages', MessageSchema);

export class Message {
    static async getMessage(messageID: string) {
        const message = await MessageModel.findOne({_id: messageID})
        if(!message) throw new Error("tin Không tồn tại")
        return message
    }
}

export default MessageModel;