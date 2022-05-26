import mongoose from "mongoose"
export default interface IRoom {
    _id: string,
    name: string,
    isGroup: boolean,
    userIDs: string[],
    ownerID?: string,
    settings: any,
    avatar?: string,
    name2: Record<string, string>
};
export interface IRoomModel extends Omit<IRoom, '_id'>, mongoose.Document {};