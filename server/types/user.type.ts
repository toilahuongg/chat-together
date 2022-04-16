import { Types } from 'mongoose';
export interface IUserData {
    _id: Types.ObjectId,
    fullname: string,
    username: string
}

export interface IUser extends IUserData {
    password: string,
    email: string,
    phone: string,
    refreshToken: string,
    friends: string[],
    pendingFriendRequest: string[],
    friendRequestSent   : string[]
}