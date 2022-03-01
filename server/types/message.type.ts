import { Types } from 'mongoose';
export interface IMessage {
    _id: string,
    sender: Types.ObjectId,
    msg: string,
    readers: Types.ObjectId[],
    roomID: Types.ObjectId
}

export interface IMessageData {
    sender: string,
    msg: string,
    roomID: string
}