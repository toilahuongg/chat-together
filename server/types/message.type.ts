import mongoose from "mongoose"
export interface IMessage extends mongoose.Document  {
    _id: string,
    sender: string,
    msg: string|any,
    roomID: string,
    createdAt: Date,
    modifiedAt: Date,
}

export interface IMessageData {
    sender: string,
    msg: string,
    roomID: string
}