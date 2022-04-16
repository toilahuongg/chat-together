import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';
import { IUser } from '../types/user.type';
const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    friends: {
        type: [String]
    },
    pendingFriendRequest : {
        type: [{
            userID: String,
            notificationID: String
        }]
    },
    friendRequestSent    : {
        type: [{
            userID: String,
            notificationID: String
        }]
    },
    phone: {
        type: String
    },
    refreshToken: {
        type: String
    },
}, { timestamps: true });
/**
 * Hỗ trợ truy xuất dữ liệu
 */
class User {
    /**
     * Lấy toàn bộ bạn của user 
     * @param userID
     * @returns string[]
     */
    static async getFriend(userID: string) {
        const user = await UserModel.findOne({_id: userID})
        if(user === null) throw new Error("User Không tồn tại")
        return user.friends
    }
    static async getUserByID(userID: string) {
        const user = await UserModel.findOne({_id: userID})
        return user
    }
}
const UserModel = model<IUser>('users', UserSchema);
export default UserModel;
export {User}