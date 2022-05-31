import { IUser } from "server/types/user.type";

export const defaultUser = (): IUser => ({ 
    _id: '',
    email: '',
    fullname: '',
    phone: '',
    username: '',
    friendRequestSent: [],
    pendingFriendRequest: [],
    refreshToken: '',
    password: '',
    friends: [],
    avatar: '',
    isSocial: false
});