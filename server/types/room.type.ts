import mongoose from "mongoose"
export default interface IRoom {
    _id: string,
    name: string,
    isGroup: boolean,
    userIDs: string[],
    ownerID?: string,
    settings: any,
    lastChange: Date,
    avatar?: string|null|undefined,
    background?: string|null|undefined
    lastMessageRead?: string[]|null,
    lastReadMessageByUsers?: any 
};
export interface IRoomModel extends Omit<IRoom, '_id'>, mongoose.Document {};