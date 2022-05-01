import express from 'express'
import passport from 'passport'
import mongoose from 'mongoose'
import RoomModel, { Room } from '../models/room.model'
import UserModel from '../models/user.model'
import MessageModel from '../models/message.model'
import SocketManager from '../helpers/socketManager'
const router = express.Router()

/**
 * Gửi tin nhắn vào phòng 
 * vi dụ api/message/:idroom
 */
router.post("/api/message/:room/send-message", passport.authenticate("jwt", { session: false }), async (req, res) => {
    interface Message {
        sender: string,
        msg: string,
        roomID: string
    }
    if (!req.body || !req.body.message) {
        return res.status(403).json({ message: "Tin nhắn trống không thể gửi" })
    }
    let messageInfo: Message = {
        msg: req.body.message,
        sender: req.auth?._id.toString() as unknown as string,
        roomID: req.params.room
    };
    if (!mongoose.isValidObjectId(messageInfo.roomID))
        return res.status(403).json({ message: "Mã này không phải mã phòng" })
    // kiểm tra phòng có tồn tại không
    const room = await RoomModel.findOne({ "_id": messageInfo.roomID })
    if (!room)
        return res.status(403).json({ message: "Phòng không tồn tại" })
    // kiểm tra user có phải là thành viên trong phòng không
    const roomMembers = room.userIDs;
    const indexMember = roomMembers.indexOf(messageInfo.sender)
    if (indexMember < 0) {
        return res.status(403).json({ message: "Bạn không phải là thành viên trong phòng không thể gửi request" })
    }
    // lưu tin nhắn
    let message = new MessageModel({
        ...messageInfo
    })
    await message.save((err, msg) => {
        // lấy thông tin cần thiết
        message = msg
    })
    // cập nhật thông tin của phòng
    await Room.updateLastChange(room)
    // lấy socketID của các thành viên trong nhóm
    let sockets: string[] = [];
    for (let i = 0; i < roomMembers.length; i++) {
        if(roomMembers[i] === messageInfo.sender ) 
            continue
        let temp: string[] = await SocketManager.getSockets(roomMembers[i].toString())
        sockets = sockets.concat(temp)
    }
    // gửi thông báo đến các socket rằng có tin nhắn mới
    for (let i = 0; i < sockets.length; i++) {
        req.io.to(sockets[i]).emit("new-chat-message", {
            ...message["_doc"]
        })
    }
    return res.status(200).json({ message: "tin nhắn gửi thành công" })
})
/**
 * Lấy các tin nhắn đã gửi trong phòng
 */
router.get("/api/message/:idroom/get-message", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const roomID: string = req.params.idroom
        const userID: string | undefined = req.auth?._id.toString()
        const offsetid: string | undefined = req.query.offsetid as string | undefined
        let limit: number = parseInt(req.query.limit as string)
        let messages
        if (!limit) limit = 40
        const user = UserModel.findOne({ _id: userID })
        if (!user)
            return res.status(403).json({ nessage: "Lỗi" })
        // Lấy room
        const room = await RoomModel.findOne({ _id: roomID })
        if (!room)
            return res.status(403).json({ nessage: "Không tồn tại phòng chat" })
        // lấy message
        if (!offsetid) {
            messages = await MessageModel.find(
                {
                    roomID: roomID
                }
            ).sort({ createdAt: -1 }).limit(limit)
        }
        else {
            messages = await MessageModel.find(
                {

                    roomID: roomID,
                    _id: { $lt: offsetid }
                }
            ).sort({ createdAt: -1 }).limit(limit)
        }
        return res.status(200).json(messages)
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Lỗi" })
    }
})
export default router