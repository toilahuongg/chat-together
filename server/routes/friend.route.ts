import express from 'express'
import passport from 'passport'
import UserModel, { User } from '../models/user.model'
import ObjectID from 'mongoose'
import RoomModel from '../models/room.model'
import mongoose from 'mongoose'
const router = express.Router()
/**
 * gửi lời mởi kết bạn
 */
router.post('/api/friend/friend-request/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        // người gửi lời mởi kết bạn
        const userSendRequest = req.auth?._id.toString()!;
        // người nhận lời mời kết bạn
        const isvalidID = ObjectID.isValidObjectId(req.params.id)
        if (userSendRequest === req.params.id)
            return res.status(403).json({ message: "Không thể gửi lời mời kết bạn đến chính mình" })
        if (!isvalidID)
            return res.status(403).json({ message: "Mã người dùng trong lời mời kết bạn không hợp lệ" })
        const friendID: string = req.params.id
        // kiểm tra xem 2 người đã phải là bạn hay chưa
        const user = await UserModel.findById(userSendRequest, { _id: 1, username: 1, fullname: 1, friends: 1 }).lean();
        if (!user)
            return res.status(403).json({ message: "Err" })

        const friendlist = user.friends
        const indexF = friendlist.indexOf(friendID)
        if (indexF >= 0)
            return res.status(403).json({ type: 1, message: "Đã là bạn từ trước" })
        // kiêm tra xem người dùng có tồn tại hay không
        const fUser = await UserModel.findById(friendID, { _id: 1, username: 1, fullname: 1 }).lean();
        if (!fUser) return res.status(403).json({ type: 2, message: "User không tồn tại" })

        // Người được gửi
        await UserModel.updateOne({ "_id": friendID }, { $addToSet: { pendingFriendRequest: userSendRequest } });
        await User.EventToUser(friendID, "pending-friend-request", user)

        // Người gửi
        await UserModel.updateOne({ "_id": userSendRequest }, {
            $addToSet: { friendRequestSent: friendID }
        })
        await User.EventToUser(userSendRequest, "friend-request-sent", fUser, [excludeSocketId]);

        return res.status(200).send({ message: "Gửi lời mời kết bạn thành công" })
    } catch (err) {
        console.log(err)
        res.status(500)
        return res.json({ message: "err" })
    }
})
/**
 * Rút lại lời mời kết bạn
 */
router.post("/api/friend/retake-friend-request/:retakeUserID", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        const userID = req.auth?._id.toString()!;
        const retakeUserID = req.params.retakeUserID
        await UserModel.updateOne({ _id: userID }, {
            $pull: {
                friendRequestSent: retakeUserID
            }
        })
        // xóa friend request phía người nhận
        await UserModel.updateOne({ _id: retakeUserID }, {
            $pull: {
                pendingFriendRequest: userID
            }
        })
        await User.EventToUser(userID, "retake-friend-request-sent", { userID: retakeUserID }, [excludeSocketId])
        // Người bị huỷ lời mời
        await User.EventToUser(retakeUserID, "retake-pending-friend-request", { userID: userID })
        return res.status(200).json({ oke: 1 });
    }
    catch (err) {
        console.error("ERR: Lỗi hệ thống")
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
})
/**
 * Từ chối lời mời kết bạn
 */
router.post('/api/friend/denie-friend-request/:userDenieID', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        const userID = req.auth?._id.toString()!;
        const userDenieID = req.params.userDenieID
        await UserModel.updateOne({ _id: userID }, {
            $pull: {
                pendingFriendRequest: userDenieID
            }
        })
        await UserModel.updateOne({ _id: userDenieID }, {
            $pull: {
                friendRequestSent: userID
            }
        })
        await User.EventToUser(userID, "denie-pending-friend-request", { userID: userDenieID }, [excludeSocketId])
        // Người bị từ chối
        await User.EventToUser(userDenieID, "denie-friend-request-sent", { userID: userID })
        return res.status(200).json({ oke: 1 });
    }
    catch (err) {
        console.log("ERR: Lỗi hệ thống")
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
})
router.post('/api/friend/unfriend/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        const userID = req.auth?._id.toString()!;
        const idUnfriend = req.params.id
        await UserModel.updateOne({ _id: userID }, {
            $pull: {
                friends: idUnfriend
            }
        })
        await UserModel.updateOne({ _id: idUnfriend }, {
            $pull: {
                friends: userID
            }
        })
        await User.EventToUser(userID, "unfriend", { userID: idUnfriend }, [excludeSocketId])
        await User.EventToUser(idUnfriend, "unfriend", { userID: userID })
        return res.status(200).send({ message: "unfriend thành công" })
    }
    catch (err) {
        console.log("ERR: Lỗi hệ thống")
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
})
/**
 * Chấp nhận lời mời kết bạn bằng userID
 */
router.post('/api/friend/accept-friend-request/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const excludeSocketId = req.headers['x-exclude-socket-id'] as string;
        // --------------- KIỂM TRA THÔNG TIN --------------------------
        // id người truy cập
        const userID = req.auth?._id.toString()!;
        // lấy id thông báo xác nhận lời mời kết bạn từ param
        const friendID = req.params.id as string
        // Kiểm tra người gửi
        const user = await UserModel.findById(userID, { _id: 1, username: 1, fullname: 1, avatar: 1 }).lean();
        if (!user) return res.status(401).json({ type: 2, message: "User không tồn tại" })

        // kiêm tra xem người dùng có tồn tại hay không
        const fUser = await UserModel.findById(friendID, { _id: 1, username: 1, fullname: 1, avatar: 1 }).lean();
        if (!fUser) return res.status(403).json({ type: 2, message: "User không tồn tại" })

        // Người được đồng ý kết bạn
        await UserModel.updateOne({ "_id": friendID }, {
            $addToSet: { friends: userID },
            $pull: {
                friendRequestSent: userID
            }
        });
        await User.EventToUser(friendID, "accept-friend-request-sent", user);

        // Người chấp nhận đồng ý
        await UserModel.updateOne({ "_id": userID }, {
            $addToSet: { friends: friendID },
            $pull: {
                pendingFriendRequest: friendID
            }
        });
        await User.EventToUser(userID, "accept-pending-friend-request", fUser, [excludeSocketId]);

        // Kiểm tra xem đã tồn tại group hay chưa
        const isExistGroup = await RoomModel.findOne({
            $and: [
                {
                    userIDs: { $in: [new mongoose.Types.ObjectId(userID)] },
                },
                {
                    userIDs: { $in: [new mongoose.Types.ObjectId(friendID)] },
                }, {
                    isGroup: false

                }
            ]
        });
        // Nếu chưa có tiến hành tạo và gửi socket
        if (!isExistGroup) {
            const dataRoom = await RoomModel.create({
                name: "",
                isGroup: false,
                userIDs: [userID, friendID],
                settings: {},
                infoUsers: {
                    [userID]: fUser,
                    [friendID]: user,
                }
            });
            await User.EventToUser(friendID, "new-room", dataRoom);
            await User.EventToUser(userID, "new-room", dataRoom);
        }
        return res.status(200).json({ message: 'Bạn đã chấp nhận kết bạn' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống! Vui lòng thử lại" })
    }
})

export default router
