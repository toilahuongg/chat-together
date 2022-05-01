import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';
import SocketIO from '../helpers/socketIO';
import SocketManager from '../helpers/socketManager';
import { Socket } from 'socket.io';
import { IUser } from '../types/user.type';
import RoomModel, { Room } from './room.model';
import console from 'console';
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
    avatar: {
        type: String
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
    /**
     * Lấy toàn bộ bạn của user 
     * @param userID
     * @returns object
     */
    // TODO: bỏ vì đã có findById
    static async getUserByID(userID: string) {
        const user = await UserModel.findOne({_id: userID})
        return user
    }
    /**
     * Lấy toàn bộ phòng mà user tham gia
     * @param userID 
     * @returns 
     */
    static async getAllRoom(userID) {
        return await RoomModel.find({userIDs: {$in: userID}})
                                     .catch(err => {
                                         console.log(err)
                                         return []
                                     })
    }
    static async changeUserInFo(userID, {email, phone, avatar, fullname}) {
        const user = await this.getUserByID(userID)
        if(!user) throw new Error("User ko tồn tại")
        // đánh dấu xem có cần thiết thông báo với bạn bè ko
        let sendEvent = false
        if(avatar || fullname) {
            sendEvent = true
        }
        if(email) user.email = email
        if(phone) user.phone = phone
        if(avatar) user.avatar = avatar
        if(fullname) user.fullname = fullname
        await user.save()
        if(sendEvent) {
            const user = await this.getUserByID(userID)
            const {id, fullname, avatar, email, phone} = user as any
            const sockets:string[] = []
            const rooms = await User.getAllRoom(user?.id) as any
           
            if(!rooms) return
            for(let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
                const room = rooms[roomIndex]
                const members = room.userIDs
                for(let memberIndex = 0; memberIndex < members.length; memberIndex++ ) {
                    const member = members[memberIndex]
                    const l_sockets:string[] = await SocketManager.getSockets(member) as Array<string>|any
                    if(!l_sockets) return
                    for(let i = 0; i < l_sockets.length ; i++) {
                        if(!sockets.includes(l_sockets[i])) sockets.push(l_sockets[i])
                    }
                }
            }
            console.log(fullname)
            sockets.forEach(socket => {
                SocketIO.sendEvent("change-info", {id, fullname,avatar, email, phone}, socket)
            })
            
        }
        return
    }
    /**
     * Thay đổi thông tin của User
     * @param io 
     * @param userID 
     * @param eventName 
     * @param data 
     * @returns 
     */
    /**
     * Gửi event đến client
     * @param io là io controller dược cung cấp bởi socket.io
     * @param userID 
     * @param eventName 
     * @param data 
     * @returns 
     */
    static async EventToUser(userID, eventName, data) {
        try {
        const sockets = await SocketManager.getSockets(userID)
                                        .catch(err => {
                                            console.log(err)
                                            return null
                                        })
        if(!sockets || !sockets.length || sockets.length === 0) return
        sockets.forEach(socket => {
            SocketIO.sendEvent(eventName, data, socket)
        })
        } catch(err) {
            console.log("ERR: Lỗi hệ thống")
            console.log(err)
            return
        }

    }
}
const UserModel = model<IUser>('users', UserSchema);
export default UserModel;
export {User}