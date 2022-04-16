import express from 'express'
import passport from 'passport'
import mongoose from 'mongoose'
import RoomModel from '../models/room.model'
import UserModel from '../models/user.model'
import MessageModel from '../models/message.model'
import SocketManager from '../helpers/socketManager'
const router = express.Router()

/**
 * Gửi tin nhắn vào phòng 
 */
router.post("/api/message/:room",passport.authenticate("jwt", {session: false}),async (req, res) => {
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
    return res.status(200).json({});
    res.status(200)
    return res.send({message: "tin nhắn gửi thành công"})
})
/**
 * Lấy các tin nhắn đã gửi trong phòng
 */
router.get("/api/message/:idroom",passport.authenticate("jwt", {session: false}), async (req, res) => {
    try{
        if(!req.auth) {
            res.status(401)
            return res.send("unauthentication")
        }
        const roomID:string = req.params.idroom
        const userID:string = req.auth._id.toString()
        // kiểm tra user có tồn tại hay không
        const user = UserModel.findOne({_id: userID})
        if(!user) {
            res.status(404)
            return res.send({nessage: "Lỗi"})
        }
        // Lấy room
        const room = await RoomModel.findOne({_id: roomID})
        if(!room) {
            res.status(404)
            return res.send({nessage: "Không tồn tại phòng chat"})
        }
        // lấy message
        const message = await MessageModel.find({roomID: roomID}).sort({ createdAt: -1})
        res.status(200)
        return res.send(message)
    } 
    catch(err) {
        console.log(err)
        res.status(404)
        return res.send({nessage: "Lỗi"})
    }
})
export default router