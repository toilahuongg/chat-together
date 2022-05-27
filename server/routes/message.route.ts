import express from 'express'
import passport from 'passport'
import RoomModel, { Room } from '../models/room.model'
import UserModel, { User } from '../models/user.model'
import MessageModel from '../models/message.model'
import mongoose from 'mongoose'
const router = express.Router()

/**
 * Gửi tin nhắn vào phòng 
 * vi dụ api/message/:idroom
 */
router.post("/api/message/:id/send-message", passport.authenticate("jwt", { session: false }), async (req, res) => {
    const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
    if (!req.body) {
        return res.status(403).json({ message: "Tin nhắn trống không thể gửi" })
    }
    const roomID = req.params.id;
    const sender: string = req.auth?._id.toString()!;
    const room = await RoomModel.findOne({ _id: roomID, userIDs: { $in: new mongoose.Types.ObjectId(sender)} }).lean();
    if (!room) return res.status(500).json({ message: "Nhóm không tồn tại" })
    const { message } = req.body as { message: string };
    const result = await MessageModel.create({
        sender,
        roomID,
        msg: {
            type: 'text',
            value: message
        }
    });
    for (const _id of room.userIDs) {
        await User.EventToUser(_id, 'new-message', {
            message: result,
            user: req.auth
        }, [excludeSocketId]);
    }
    return res.status(200).json(result);
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