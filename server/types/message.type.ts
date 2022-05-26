import mongoose from "mongoose";
export interface IMessage {
    _id: string,
    sender: string,
    msg: {
        type: 'image' | 'text' | 'notify',
        value: string
    },
    roomID: string,
}

export interface IGroupMessage {
    sender: string,
    messages: IMessage[]
}

export interface IMessageModel extends Omit<IMessage, '_id'>, mongoose.Document {};