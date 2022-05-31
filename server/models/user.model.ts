import { Schema, model } from 'mongoose';
import SocketIO from '../helpers/socketIO';
import SocketManager from '../helpers/socketManager';
import { IUser } from '../types/user.type';
import console from 'console';
import socketManager from '../helpers/socketManager';
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
    friends: [
        {
            type: String
        }
    ],
    avatar: {
        type: String
    },
    pendingFriendRequest: [
        {
            type: String
        }
    ],
    friendRequestSent: [
        {
            type: String
        }
    ],
    phone: {
        type: String
    },
    refreshToken: {
        type: String
    },
    isSocial: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
const UserModel = model<IUser>('users', UserSchema);
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
        const user = await UserModel.findOne({ _id: userID })
        if (user === null) throw new Error("User Không tồn tại")
        return user.friends
    }

    /**
     * Gửi event đến client
     * @param io là io controller dược cung cấp bởi socket.io
     * @param userID 
     * @param eventName 
     * @param data 
     * @returns 
     */
    static async EventToUser(userID: string, eventName: string, data: object, exclude: string[] = []) {
        try {
            await socketManager.pubClient.publish('socket', JSON.stringify({ data, userID, eventName, exclude }));
            const sockets = SocketManager.sockets[userID];
            if (sockets && sockets.length)  {
                sockets.forEach(socket => {
                    if (!exclude.includes(socket)) {
                        SocketIO.sendEvent({
                            eventName, data, socketID: socket, userID
                        })
                    }
                })
            }
        } catch (err) {
            console.log("ERR: Lỗi hệ thống")
            console.log(err)
            return
        }
    }
}
export default UserModel;
export { User }