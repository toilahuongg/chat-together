import express from 'express';
import passport from 'passport';
import UserModel, { User } from '../models/user.model';
import RoomModel, { Room } from '../models/room.model';
import MessageModel from '../models/message.model'

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
Router.put('/api/room/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        const { id } = req.params;
        const { name, settings } = req.body as { name: string[], settings: any };
        const result = await RoomModel.findOneAndUpdate({ _id: id }, { name, settings }, { new: true });
        if (!result) return res.status(500).json({ message: 'Không tồn tại Group' });
        for (const _id of result.userIDs) {
            await User.EventToUser(_id, 'update-room', result, [excludeSocketId]);
        }
        return res.status(200).json(result);
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
        const { id } = req.params;
        const { lastId } = req.query;
        const limit = 15;
        let match = { roomID: id };
        if (lastId) match['_id'] = { $lt: lastId };
        const messages = await MessageModel.find(match).sort({ createdAt: -1 }).limit(limit).lean();
        const count = await MessageModel.count({ roomID: id });
        return res.status(200).json({ messages, count });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "lỗi hệ thống" })
    }
});
// /**
//  * Thêm thành viên vào phòng
//  */
// Router.post("/api/room/add-member/:roomid/:userid", passport.authenticate('jwt', { session: false }), async (req, res) => {
//     // khoi tao bien cuc bo
//     try {
//         const userID = req.auth?._id.toString() as string
//         const userAdd = req.params.userid
//         const roomAdd = req.params.roomid
//         const userFriend = await User.getFriend(userID)
//             .catch(err => {
//                 return res.status(403).json({ message: err.message })
//             }) as string[] | null
//         if (!userFriend || !userFriend.includes(userAdd)) return res.status(403).json({ message: "User ko phải bạn của bạn" })

//         let addErr = false
//         await Room.addMoreUserToGroup(userAdd, roomAdd, userID)
//             .catch(err => {
//                 addErr = true;
//                 return res.status(403).json({ message: err.message })
//             })
//         if (addErr) return
//         // thông báo đến user nếu online
//         const owner = await Room.getRoomOwner(roomAdd)
//         if (owner) {
//             const sockets = await SocketManager.getSockets(owner)
//             sockets.forEach(socket => {
//                 req.io.to(socket).emit("new-notification", {
//                     type: "request-add-room-member",
//                     roomID: roomAdd,
//                     userAdd: userAdd,
//                     userRequire: userID
//                 })
//             })
//         }
//         return res.status(200).json({ message: "them thanh vien thanh cong" })
//     } catch (err) {
//         console.log(err)
//         return res.status(500).json({ message: "Lỗi hệ thống" })
//     }
// })
// /**
//  * Chấp nhận yêu cầu vào phòng
//  */
// Router.post("/api/room/accept-require-add-member/:roomid/:userrequireid/:useraddid", passport.authenticate('jwt', { session: false }), async (req, res) => {
//     try {
//         const userID = req.auth?._id.toString() as string
//         const roomID = req.params.roomid
//         const userrequireid = req.params.userrequireid
//         const useraddid = req.params.useraddid
//         let gotErr = false
//         await Notification.acceptRequireAddMember(userID, userrequireid, useraddid, roomID)
//             .catch(err => {
//                 gotErr = true
//                 return res.status(403).json({ message: err.message })
//             })

//         if (gotErr) return
//         // thông báo đến toàn bộ user là room update thành công
//         const members = await Room.getMemberInRoom(roomID);
//         members.forEach(async (member) => {
//             const sockets = await SocketManager.getSockets(member)
//             sockets.forEach(socket => {
//                 req.io.to(socket).emit("add-member", {
//                     roomID: roomID,
//                     memberAdd: useraddid
//                 })
//             })
//         })
//         return res.status(200).json({ message: "Chấp nhận yêu cầu thành công" })

//     }
//     catch (err) {
//         return res.status(500).json({ message: "Lỗi hệ thống" })
//     }
// })
// /**
//  * Lấy về toàn bộ room mà user tham gia
//  * example
//  * /api/room    : lấy về 10 phòng đầu tiên
//  * /api/room/?offsetid=idphongthaydoicuoicungphiaclient&limit=sophonglay
//  */
// Router.get('/api/room/get-room/', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
//     interface RoomQuery {
//         offsetid?: string,
//         limit?: number
//     };
//     try {
//         let query: RoomQuery = req.query as unknown as RoomQuery
//         query.limit = parseInt(query.limit as unknown as string)
//         const userID: string = req.auth!._id.toString()
//         // kiểm tra user có tồn tại hay không
//         const user = await UserModel.findOne({ '_id': userID })
//         if (!user)
//             return res.status(403).json({ nessage: "user không tồn tại" })
//         if (!query.limit) query.limit = 10

//         let rooms: IRoomModel[];
//         if (!query.offsetid) {
//             rooms = await RoomModel.find({ userIDs: { "$in": userID } }).sort({ lastChange: -1 }).limit(query.limit)

//         }
//         else {
//             // get room 
//             const room = await Room.getRoomById(query.offsetid)
//             rooms = await RoomModel.find(
//                 {
//                     userIDs: { "$in": userID },
//                     lastChange: { $lt: room.lastChange }
//                 })
//                 .sort({ lastChange: -1 })
//                 .limit(query.limit)
//         }
//         const result = await Promise.all(rooms.map(async room => {
//             const lastmessage = await Room.lastRoomMessage(room) as any
//             const roomData = {
//                 roomInfo: room,
//                 lastMessage: (lastmessage ? {
//                     ...lastmessage["_doc"]
//                 } :
//                     null)

//             }
//             return roomData
//         }))
//         return res.status(200).json(result)
//     } catch (err) {
//         console.log(err)
//         return res.status(500).json({ nessage: "Lỗi" })
//     }

// })

export default Router;