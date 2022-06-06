import express from 'express'
import passport from 'passport'
import RoomModel from '../models/room.model'
import { User } from '../models/user.model'
import MessageModel from '../models/message.model'
import mongoose from 'mongoose';
import { upload } from '../helpers/handleMulter'

const router = express.Router()
/**
 * Gửi tin nhắn vào phòng 
 * vi dụ api/message/:idroom
 */
router.post("/api/message/:id/send-message", passport.authenticate("jwt", { session: false }), upload.array('images'), async (req, res) => {
    const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
    if (!req.body) {
        return res.status(403).json({ message: "Tin nhắn trống không thể gửi" })
    }
    const roomID = req.params.id;
    const sender: string = req.auth?._id.toString()!;
    const room = await RoomModel.findOne({ _id: roomID, userIDs: { $in: new mongoose.Types.ObjectId(sender)} }).lean();
    if (!room) return res.status(500).json({ message: "Nhóm không tồn tại" })
    const { message } = req.body as { message: string };
    const images = (req.files as Express.MulterS3.File[])?.map(file => file.location);
    const result = await MessageModel.create({
        sender,
        roomID,
        msg: {
            type: 'text',
            value: message
        },
        readers: [sender],
        images
    });
    for (const _id of room.userIDs) {
        await User.EventToUser(_id, 'new-message', {
            message: result,
            user: req.auth,
            room
        }, [excludeSocketId]);
    }
    return res.status(200).json(result);
})

export default router