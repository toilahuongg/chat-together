import express from 'express';
import passport from 'passport';
import mongoose from 'mongoose';
import multer from 'multer';

import UserModel, { User } from '../models/user.model';
import RoomModel from '../models/room.model';
import MessageModel from '../models/message.model'
import { uploadImage } from '../helpers/uploadImage';

const upload = multer();
const Router = express.Router();
/**
 * Tạo phòng
 */
Router.post('/api/room', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        const userID = req.auth?._id.toString()!;
        const { userIDs, name: groupName } = req.body as { userIDs: string[], name: string };
        if (userIDs.length === 0) return res.status(400).json({ message: "Bạn cần thêm ít nhất một user để tạo group" })
        let NAME = groupName;
        const listIds = [...userIDs, userID];
        if (!groupName) {
            NAME = `Nhóm của: ${req.auth?.username}`
            const userNames = await Promise.all(userIDs.map(async (userID) => {
                const user = await UserModel.findById(userID)
                return user?.username
            }))
            userNames.forEach((username) => {
                if (username) NAME += `, ${username}`
            })
        }
        const result = await RoomModel.create({
            name: NAME,
            isGroup: true,
            userIDs: listIds,
            ownerID: userID,
            settings: {},
        });
        for (const id of listIds) {
            await User.EventToUser(id, 'new-room', result, [excludeSocketId]);
        }
        return res.status(200).json(result)
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});
/**
 * Sửa phòng
 */
Router.put('/api/room/:id/rename', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userID = req.auth?._id.toString()!;
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        const { id } = req.params;
        const { name } = req.body as { name: string };
        const room = await RoomModel.findOneAndUpdate({ _id: id }, { name }, { new: true }).lean();
        const message = await MessageModel.create({
            sender: userID,
            roomID: id,
            readers: [userID],
            msg: {
                type: 'notify',
                value: `đã thay đổi tên nhóm thành "${name}"`
            }
        });
        if (!room) return res.status(500).json({ message: 'Không tồn tại Group' });
        for (const _id of room.userIDs) {
            await User.EventToUser(_id, 'update-room', {
                ...room,
                message,
                user: req.auth
            }, [excludeSocketId]);
        }
        return res.status(200).json({
            ...room,
            message,
            user: req.auth
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});

Router.put('/api/room/:id/change-avatar', passport.authenticate('jwt', { session: false }), upload.single('image'), async (req, res) => {
    try {
        const userID = req.auth?._id.toString()!;
        if (!req.file) return res.status(500).send("File doesn't exists");
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        const { id } = req.params;
        const { width, height } = req.body;
        const data = await uploadImage(req.file.buffer, width, height);
        const room = await RoomModel.findOneAndUpdate({ _id: id }, { avatar: data.url }, { new: true }).lean();
        const message = await MessageModel.create({
            sender: userID,
            roomID: id,
            readers: [userID],
            msg: {
                type: 'notify',
                value: 'đã thay đổi ảnh nhóm'
            }
        });
        if (!room) return res.status(500).json({ message: 'Không tồn tại Group' });
        for (const _id of room.userIDs) {
            await User.EventToUser(_id, 'update-room', {
                ...room,
                message,
                user: req.auth
            }, [excludeSocketId]);
        }
        return res.status(200).json({
            ...room,
            message,
            user: req.auth
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});

/**
 * Lấy thông tin phòng
 */
Router.get('/api/room/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await RoomModel.findOne({ _id: id }).lean();
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});

Router.get('/api/room/:id/private', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.auth?._id.toString()!;
        const result = await RoomModel.findOne({
            $and: [
                {
                    userIDs: { $in: [new mongoose.Types.ObjectId(userID)] },
                },
                {
                    userIDs: { $in: [new mongoose.Types.ObjectId(id)] },
                }, {
                    isGroup: false

                }
            ]
        });
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});

Router.get('/api/room/:id/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await RoomModel.findOne({ _id: id }).lean();
        if (!result) return res.status(500).json({ message: 'Không tồn tại Group' });
        const users = await UserModel.find({ _id: { $in: result.userIDs }}).lean();
        return res.status(200).json(users);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});

/**
 * Lấy tin nhắn trong phòng
 */
 Router.get('/api/room/:id/messages', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userID = req.auth?._id.toString()!;
        const { id } = req.params;
        const { lastId } = req.query;
        const limit = 15;
        let match = { roomID: id };
        if (lastId) match['_id'] = { $lt: lastId };
        else await MessageModel.updateMany({ roomID: id }, { $addToSet: { readers: userID }});
        const messages = await MessageModel.find(match).sort({ createdAt: -1 }).limit(limit).lean();
        const count = await MessageModel.count({ roomID: id });
        return res.status(200).json({ messages, count });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});

Router.post('/api/room/:id/read-messages', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userID = req.auth?._id.toString()!;
        const { id } = req.params;
        await MessageModel.updateMany({ roomID: id }, { $addToSet: { readers: userID }});
        return res.status(200).json({ message: "success" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});

export default Router;