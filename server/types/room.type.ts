import mongoose from "mongoose"
import { IMessage } from "./message.type"
import { IUserData } from "./user.type"
export default interface IRoom {
    _id: string,
    name: string,
    isGroup: boolean,
    userIDs: string[],
    ownerID?: string,
    settings: any,
    avatar: string,
    infoUsers: Record<string, IUserData>,
    createdAt: string
};
export type IMessageRoom = IRoom & {
    message: IMessage | null
    user: IUserData | null
  }
export interface IRoomModel extends Omit<IRoom, '_id'>, mongoose.Document {};