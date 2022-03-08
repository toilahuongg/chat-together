import express from 'express'
import passport from 'passport'
import mongoose from 'mongoose'
import RoomModel from '../models/room.model'
import MessageModel from '../models/message.model'
import SocketManager from '../helpers/socketManager'
const router = express.Router()

/**
 * Gửi tin nhắn vào phòng 
 */
router.post("/api/message/sentmessage/:room",passport.authenticate("jwt", {session: false}),async (req, res) => {
    // kiểm tra người dùng
    if(!req.auth) {
        res.status(404)
        return res.send({message: "Phải đăng nhập để gửi tin nhắn"})
    }
    if(!req.body || !req.body.message) {
        res.status(404)
        return res.send({message: "Tin nhắn trống không thể gửi"})
    }
    const messagebody:string = req.body.message
    const userID:string = req.auth._id.toString()
    const roomID:string = req.params.room
    // kiểm tra id thỏa mãn và phòng có tồn tại hay không
    if(!mongoose.isValidObjectId(roomID)) {
        res.status(404)
        return res.send({message: "Mã này không phải mã phòng"})
    }
    // kiểm tra phòng có tồn tại không
    const room = await RoomModel.findOne({"_id": roomID})
    if(!room) {
        res.status(404)
        return res.send({message: "Phòng không tồn tại"})
    }
    // kiểm tra user có phải là thành viên trong phòng không
    const roomMembers = room.userIDs;
    const indexMember = roomMembers.indexOf(userID)
    if(indexMember < 0) {
        res.status(404)
        return res.send({message: "Bạn không phải là thành viên trong phòng không thể gửi request"})
    }
    // lưu tin nhắn
    const message = new MessageModel({
        msg: messagebody,
        sender: new mongoose.Types.ObjectId(userID),
        readers: [
            new mongoose.Types.ObjectId(userID)
        ],
        roomID: new mongoose.Types.ObjectId(roomID)
    })
    await message.save()
    // gửi toàn bộ thành viên trong phòng thông báo có tin mới
    let sockets:string[] = [];
    for(let i = 0; i < roomMembers.length; i++) {
        let temp:string[] = SocketManager.getSockets(roomMembers[i].toString())

        sockets = sockets.concat(temp)
    }
    // gửi thông báo đến các socket rằng có tin nhắn mới
    for(let i = 0; i < sockets.length; i++) {
        req.io.to(sockets[i]).emit("newchatmessage", message)
    }
    res.status(200)
    return res.send({message: "tin nhắn gửi thành công"})
})

export default router