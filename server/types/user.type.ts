export interface IUserData {
    _id: string,
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