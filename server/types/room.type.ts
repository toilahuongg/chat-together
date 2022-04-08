import mongoose from "mongoose"
export interface IRoom extends mongoose.Document {
    _id: string,
    name: string,
    isGroup: boolean,
    userIDs: string[],
    ownerID?: string,
    settings: any,
    lastChange: Date
}