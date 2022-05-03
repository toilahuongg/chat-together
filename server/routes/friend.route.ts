import express from 'express'
import passport from 'passport'
import SocketManager from '../helpers/socketManager'
import NotificationModel from '../models/notification.model'
import UserModel, { User } from '../models/user.model'
import ObjectID from 'mongoose'
import RoomModel, { Room } from '../models/room.model'
import RequestNotExist from '../helpers/exception/RequestNotExist'
import UnknownFriendRelation from '../helpers/exception/UnknownFriendRelation'
import UserNotExist from '../helpers/exception/UserNotExist'
const router = express.Router()
/**
 * gửi lời mởi kết bạn
 */
router.post('/api/friend/friend-request/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // người gửi lời mởi kết bạn
        const userSendRequest: string | undefined = req.auth?._id.toString()
        // người nhận lời mời kết bạn
        const isvalidID = ObjectID.isValidObjectId(req.params.id)
        if (userSendRequest === req.params.id)
            return res.status(403).json({ message: "Khôn thể gửi lời mời kết bạn đến chính mình" })
        if (!isvalidID)
            return res.status(403).json({ message: "Mã người dùng trong lời mời kết bạn không hợp lệ" })
        const friendID: string = req.params.id
        // kiểm tra xem 2 người đã phải là bạn hay chưa
        const user = await UserModel.findOne({ '_id': userSendRequest })
        if (!user)
            return res.status(403).json({ message: "Err" })

        const friendlist = user.friends
        const indexF = friendlist.indexOf(friendID)
        if (indexF >= 0)
            return res.status(403).json({ type: 1, message: "Đã là bạn từ trước" })
        // kiêm tra xem người dùng có tồn tại hay không
        const existUser = await UserModel.where('_id').equals(friendID)
            .then(users => {
                if (users.length >= 1) return true
                return false
            })
        if (!existUser)
            return res.status(403).json({ type: 2, message: "User không tồn tại" })
        // kiểm tra xem bạn đã gửi request này đến user trước đó chưa
        const checkExistFriendRequest = await NotificationModel.find({
            'userID': friendID,
            'infoNoti.nt': 'friend-request',
            'infoNoti.userSent': userSendRequest
        })
            .then(notifications => {
                if (notifications.length >= 1) return true
                return false
            })
        if (checkExistFriendRequest)
            return res.status(403).json({ type: 3, message: "Bạn đã gửi lời mởi kết bạn rồi" })
        // gửi friend request
        //-------------------------
        // lưu notificaiton
        const friendRequestNotificaiton = await new NotificationModel({
            userID: friendID,
            infoNoti: {
                nt: "friend-request",
                userSent: userSendRequest,
                accepted: false
            }
        }).save()
        // lưu gửi thông báo vào mục pending request của người gửi kết bạn
        await UserModel.updateOne({ "_id": friendID }, {
            $push:
            {
                pendingFriendRequest: { userID: new ObjectID.Types.ObjectId(userSendRequest), notificationID: new ObjectID.Types.ObjectId(friendRequestNotificaiton._id) }
            }
        })
        // lưu lời mời mà người dùng đã gửi vào friendRequestSent của người gửi
        await UserModel.updateOne({ "_id": userSendRequest }, {
            $push:
            {
                friendRequestSent: { userID: new ObjectID.Types.ObjectId(friendID), notificationID: new ObjectID.Types.ObjectId(friendRequestNotificaiton._id) }
            }
        })
        // gửi thông báo đến người nhận
        let sockets: string[] = await SocketManager.getSockets(friendID)
        for (let i = 0; i < sockets.length; i++) {
            req.io.to(sockets[i]).emit("new-notification", friendRequestNotificaiton)
        }
        return res.status(200).send(friendRequestNotificaiton)
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
        const userID = req.auth?._id
        const retakeUserID = req.params.retakeUserID
        await User.RemoveFriendRequest(userID, retakeUserID)
            .then(async () => {
                res.status(200).json({ message: "Rút lời mời kết bạn thành công" })
                // thông báo
                await User.EventToUser(userID, "anothertab-retake-friend-request", { userID: retakeUserID })
                await User.EventToUser(retakeUserID, "auser-retake-friend-request", { userID: userID })
            })
            .catch(err => {
                if (err instanceof RequestNotExist) {
                    res.status(403).json({ message: "Chưa từng gửi lời mời kết bạn đến user này" })
                    return
                }
                if (err instanceof UserNotExist) {
                    return res.status(403).json({ message: "User không tồn tại" })
                }
                throw new Error()
            })
        return
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
        const userID = req.auth?._id
        const userDenieID = req.params.userDenieID
        await User.DenieFriendRequest(userID, userDenieID)
            .then(async () => {
                res.status(200).json({ message: "Từ chối lời mời kết bạn thành công" })
                await User.EventToUser(userID, "anothertab-denie-friend-request", { userID: userDenieID })
                await User.EventToUser(userDenieID, "friend-request-be-denied", { userID: userID })
            })
            .catch(err => {
                if (err instanceof UserNotExist) {
                    return res.status(403).json({ message: "User không tồn tại" })
                }
                if (err instanceof RequestNotExist) {
                    return res.status(403).json({ message: "Chưa từng được user này gửi lời mời kết bạn" })
                }
                throw err
            })
    }
    catch (err) {
        console.log("ERR: Lỗi hệ thống")
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
})
router.post('/api/friend/unfriend/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const userID = req.auth?._id
        const idUnfriend = req.params.id
        await User.RemoveFriend(userID, idUnfriend)
            .then(async () => {
                res.status(200).send({ message: "unfriend thành công" })
                await User.EventToUser(userID, "unfriend", { userID: idUnfriend })
                await User.EventToUser(idUnfriend, "unfriend", { userID: userID })
                return
            })
            .catch(err => {
                if (err instanceof UserNotExist) {
                    return res.status(403).json({ message: "User không tồn tại" })
                }
                if (err instanceof UnknownFriendRelation) {
                    return res.status(403).json({ message: "Không phải là quan hệ bạn bè" })
                }
                throw err
            })
    }
    catch (err) {
        console.log("ERR: Lỗi hệ thống")
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
})
/**
 * Chấp nhận lời mời kết bạn bằng id của notification hoặc của user
 */
router.post('/api/friend/accept-friend-request/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        // --------------- KIỂM TRA THÔNG TIN --------------------------
        // id người truy cập
        const userID: string = req.auth?._id.toString() as string
        // lấy id thông báo xác nhận lời mời kết bạn từ param
        const notificationID: string = req.params.id
        // kiểm tra xem lời mời này có xác thực không
        const validNotificationID = ObjectID.isValidObjectId(notificationID)
        if (!validNotificationID)
            return res.status(403).json({ message: "Mã lời mời kết bạn không hợp lệ" })
        let notification = await NotificationModel.findOne({ "_id": notificationID })
        if (!notification) {
            // xét trương hợp id là id của user
            notification = await NotificationModel.findOne({ 'userID': userID, 'infoNoti.userSent': notificationID })
            if (!notification)
                return res.status(403).json({ message: "Lời mời kết bạn không tồn tại" })
        }
        if (notification.userID.toString() !== userID)
            return res.status(403).json({ message: "Bạn không có quyền chấp nhận lời mời kết bạn này" })
        // kiểm tra xem mã có đúng là thông báo lời mời kết bạn không
        if (notification.infoNoti.nt !== "friend-request")
            return res.status(403).json("Lỗi không thể chấp nhận kết bạn do đây ko phải thông báo kết bạn")
        // kiểm tra xem lời mời có được chấp nhận trước đó hay không
        if (notification.infoNoti.accepted === true)
            return res.status(403).send({ message: "Lời mời này đã được chấp nhận trước đó" })
        //----------------------CHẤP NHẬN LỜI MỜI KẾT BẠN VÀ INSERT VÀO DB NHỮNG THÔNG TIN CẦN THIẾT-----------------------------
        notification.infoNoti.accepted = true
        await notification.save()
        // thông báo đến người gửi rằng lời mời đã được chấp nhận
        const acceptedNotification = new NotificationModel({
            userID: notification.infoNoti.userSent.toString(),
            infoNoti: {
                nt: "accepted-friend-request",
                userSent: userID
            }
        })
        await acceptedNotification.save()
        // gửi thông báo đến socket của user nếu online
        const sockets = await SocketManager.getSockets(notification.infoNoti.userSent.toString())
        for (let i = 0; i < sockets.length; i++) {
            req.io.to(sockets[i]).emit("new-notification", acceptedNotification)
        }
        // gửi thông báo đến người gửi rằng đã chấp nhận lời mời kết bạn
        // socket của user hiện tại
        const socketsOfCurrentUser = await SocketManager.getSockets(userID)
        for (let i = 0; i < socketsOfCurrentUser.length; i++) {
            req.io.to(socketsOfCurrentUser[i]).emit("update-notification-satus", notification["infoNoti"])
        }
        // Khởi tạo tin nhắn cũ nhất
        const lastReadMessageByUsers = [
            {
                userID: userID,
                lastMessageID: null
            },
            {
                userID: notification.infoNoti.userSent,
                lastMessageID: null
            }
        ]
        // tạo phòng chat riêng 
        const room = await RoomModel.findOne({
            userIDs: { $all: [userID, notification.infoNoti.userSent] },
            isGroup: false
        })
        let PrivateRoom
        if (!room) {
            PrivateRoom = new RoomModel({
                name: "",
                isGroup: false,
                userIDs: [userID, notification.infoNoti.userSent],
                settings: {},
                lastReadMessageByUsers: lastReadMessageByUsers
            })
            await PrivateRoom
                .save()
                .then(room => {
                    Room.updateLastChange(room)
                });
        }

        if (!room) {
            // thông báo cho cả 2 người dùng rằng có room mới vừa được tạo
            const socketsForSendingNewRomNotification =
                await SocketManager.getSockets(userID as string)
                    .then(async (user1Socket) => {
                        const user2Socket = await SocketManager.getSockets(notification?.infoNoti.userSent.toString()!)
                        return user1Socket.concat(user2Socket)
                    })
            for (let i = 0; i < socketsForSendingNewRomNotification.length; i++)
                req.io.to(socketsForSendingNewRomNotification[i]).emit("room-notification", PrivateRoom)
        }
        // xóa pending request và requestsent trong thông tin chung của 2 user
        await UserModel.updateOne({ "_id": notification.infoNoti.userSent.toString() },
            {
                $push: {
                    friends: userID
                },
                $pull: {
                    friendRequestSent: {
                        userID: userID,
                        notificationID: notification._id
                    }
                }
            })
        await UserModel.updateOne(
            { "_id": userID },
            {
                $push: {
                    friends: notification.infoNoti.userSent
                },
                $pull: {
                    pendingFriendRequest: {
                        userID: notification.infoNoti.userSent.toString(),
                        notificationID: notification._id
                    }
                }
            })
        // thêm bạn bè vào thông tin chung của 2 user
        return res.status(200).json(acceptedNotification)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống! Vui lòng thử lại" })
    }
})
/**
 * Kiểm tra xem user có phải là bạn không
 */
router.get('/api/friend/isfriend/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const userID = req.auth?._id.toString()
        const user = await UserModel.findOne({ _id: userID })
        if (!user)
            return res.status(403).send({ message: "Lỗi" })
        const friends = user.friends
        const id: string = req.params.id
        const index = friends.indexOf(id)
        res.status(200)
        if (index < 0) {
            return res.send({ isFriend: false })
        }
        return res.send({ isFriend: true })
    }
    catch (err) {
        return res.status(500).json({ message: "Lỗi" })
    }
})
/**
 * Kiểm tra danh sách bạn 
 */
router.get('/api/friend/arefriends', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const userID = req.auth?._id.toString()
        const user = await UserModel.findOne({ _id: userID })
        if (!user)
            return res.status(403).send({ message: "Lỗi" })
        if (!req.body.checkList)
            return res.status(403).json({ message: "req không có check list" })
        // list user cần phải kiểm tra xem có phải là bạn hay không
        const checkList: string[] = req.body.checkList
        // list bạn
        const friends = user.friends
        // keết quả trả về của url
        const resultList: Object[] = []
        // kiểm tra
        for (let i = 0; i < checkList.length; i++) {
            const index = friends.indexOf(checkList[i])

            if (index < 0) {
                const temp = new Object({
                    id: checkList[i],
                    isFriend: false
                })
                resultList.push(temp)
            }
            else {
                const temp = new Object({
                    id: checkList[i],
                    isFriend: true
                })
                resultList.push(temp)
            }
        }
        res.status(200)
        return res.json(resultList)
    } catch (err) {
        res.status(500)
        return res.json({ message: "Lỗi" })
    }
})
export default router
