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

export interface IMessageModel extends Omit<IMessage, '_id'>, mongoose.Document {};