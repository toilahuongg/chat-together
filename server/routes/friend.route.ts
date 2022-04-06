import express from 'express'
import passport from 'passport'
import SocketManager from '../helpers/socketManager'
import NotificationModel from '../models/notificaiton.model'
import UserModel from '../models/user.model'
import ObjectID from 'mongoose'
import RoomModel from '../models/room.model'
import mongoose from 'mongoose'
const router = express.Router()
/**
 * gửi lời mởi kết bạn
 */
router.post('/api/friend/friendrequest/:id',passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        if(!req.auth) {
            res.status(401)
            return res.send("unauthentication")
        }
        // người gửi lời mởi kết bạn
        const userSendRequest:string = req.auth._id.toString()
        // người nhận lời mời kết bạn
        const isvalidID = ObjectID.isValidObjectId(req.params.id)
        if(!isvalidID) {
            res.status(404)
            return res.send({message: "Mã người dùng trong lời mời kết bạn không hợp lệ"})
        }
        const friendID:string = req.params.id
        // kiểm tra xem 2 người đã phải là bạn hay chưa
        const user = await UserModel.findOne({'_id': userSendRequest})
        if(!user) {
            res.status(404)
            return res.send("Err")
        }   
        const friendlist = user.friends
        const indexF     = friendlist.indexOf(friendID)
        if(indexF >= 0) {
            res.status(404)
            return res.send({type: 1 ,message: "Đã là bạn từ trước"})
        }
        // kiêm tra xem người dùng có tồn tại hay không
        const existUser = await UserModel.where('_id').equals(friendID)
                                .then(users => {
                                    if(users.length >= 1) return true
                                    return false
                                })
        if(!existUser) {
            res.status(404)
            return res.send({type:2, message: "User không tồn tại"})
        }
        // kiểm tra xem bạn đã gửi request này đến user trước đó chưa
        const checkExistFriendRequest = await NotificationModel.find({'userID': friendID,
                                                                      'infoNoti.nt': 'friend-request',
                                                                      'infoNoti.userSent': new ObjectID.Types.ObjectId(userSendRequest)
                                                                    })
                                                        .then(notifications => {
                                                            if(notifications.length >= 1) return true
                                                            return false
                                                        })
        if(checkExistFriendRequest) {
            res.status(404)
            return res.send({type: 3, message: "Bạn đã gửi lời mởi kết bạn rồi"})
        }
        // gửi friend request
        //-------------------------
        // lưu notificaiton
        const friendRequestNotificaiton = await new NotificationModel({
            userID: friendID,
            infoNoti: {
                nt: "friend-request",
                userSent        : userSendRequest,
                accepted: false
            }
        }).save()
        // lưu gửi thông báo vào mục pending request của người gửi kết bạn
        await UserModel.updateOne({"_id": friendID}, {$push: 
            {
            pendingFriendRequest:    {userID:new ObjectID.Types.ObjectId(userSendRequest), notificationID: new ObjectID.Types.ObjectId(friendRequestNotificaiton._id)}
            }
        })
        // lưu lời mời mà người dùng đã gửi vào friendRequestSent của người gửi
        await UserModel.updateOne({"_id": userSendRequest}, {$push:
            {
            friendRequestSent: {userID: new ObjectID.Types.ObjectId(friendID),notificationID: new ObjectID.Types.ObjectId(friendRequestNotificaiton._id)}
            }
        })
        // gửi thông báo đến người nhận
        let sockets: string[] = SocketManager.getSockets(friendID)
        for(let i = 0 ; i < sockets.length; i++) {
            req.io.to(sockets[i]).emit("notification", friendRequestNotificaiton)
        }
        res.status(200)
        return res.send({message: "Gửi lời mời kết bạn thành công"})
    } catch(err) {
        console.log(err)
        res.status(404)
        return res.send("err")
    }
})
/**
 * Chấp nhận lời mời kết bạn
 */
router.post('/api/friend/acceptfriendrequest/:notificationID',passport.authenticate("jwt", {session: false}),async (req,res) => {
    try{
    if(!req.auth) {
        res.status(404)
        return res.send({message: "unauthentication"})
    }
    // --------------- KIỂM TRA THÔNG TIN --------------------------
    // id người truy cập
    const userID:string = req.auth._id.toString()
    // lấy id thông báo xác nhận lời mời kết bạn từ param
    const notificationID:string = req.params.notificationID
    // kiểm tra xem lời mời này có xác thực không
    const validNotificationID = ObjectID.isValidObjectId(notificationID)
    if(!validNotificationID) {
        res.status(404)
        return res.send({message: "Mã lời mời kết bạn không hợp lệ"})
    }
    const notification = await NotificationModel.findOne({"_id": notificationID})
    if(!notification) {
        res.status(404)
        return res.send({message: "Lời mời kết bạn không tồn tại"})
    }
    if(notification.userID.toString() !== userID) {
        res.status(404)
        return res.send({message: "Bạn không có quyền chấp nhận lời mời kết bạn này"})
    }
    // kiểm tra xem mã có đúng là thông báo lời mời kết bạn không
    if(notification.infoNoti.nt !== "friend-request") {
        res.status(404)
        return res.send("Lỗi không thể chấp nhận kết bạn do đây ko phải thông báo kết bạn")
    }
    // kiểm tra xem lời mời có được chấp nhận trước đó hay không
    if(notification.infoNoti.accepted === true) {
        res.status(404)
        return res.send({message: "Lời mời này đã được chấp nhận trước đó"})
    }
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
    // gửi thông báo đến socket của user nết online
    const sockets:string[] = SocketManager.getSockets(notification.infoNoti.userSent.toString())
    for(let i = 0; i < sockets.length; i++) {
        req.io.to(sockets[i]).emit("notification", acceptedNotification)
    }
    // tạo phòng chat riêng 
    const PrivateRoom = new RoomModel({
        'isGroup' : false,
        userIDs: [new ObjectID.Types.ObjectId(userID), notification.infoNoti.userSent]
    })
    await PrivateRoom.save()
    // thông báo cho cả 2 người dùng rằng có room mới vừa được tạo
    const socketsForSendingNewRomNotification: string[] = SocketManager.getSockets(userID).concat(SocketManager.getSockets(notification.infoNoti.userSent.toString()))
    for(let i = 0; i< socketsForSendingNewRomNotification.length; i++)
    req.io.to(socketsForSendingNewRomNotification[i]).emit("roomnotification", PrivateRoom)
    // xóa pending request và requestsent trong thông tin chung của 2 user
    const userSentFriendRequest =await UserModel.updateOne({"_id": notification.infoNoti.userSent.toString()},
                                                 {
                                                    $push: {
                                                        friends: userID
                                                    },
                                                     $pull: {
                                                        friendRequestSent: {
                                                            userID: new ObjectID.Types.ObjectId(userID),
                                                            notificationID: notification._id
                                                        }
                                                     }
                                                 })
    const userAcceptRequest    = await UserModel.updateOne({"_id": userID},
                                                {
                                                    $push: {
                                                        friends: notification.infoNoti.userSent
                                                    },
                                                    $pull: {
                                                        pendingFriendRequest: {
                                                            userID: new ObjectID.Types.ObjectId(notification.infoNoti.userSent.toString()),
                                                            notificationID: notification._id
                                                        }
                                                    }
                                                })
    // thêm bạn bè vào thông tin chung của 2 user
    res.status(200)
    return res.send({message: "Bạn đã chấp nhận lời kết bạn, bây h các bạn có thể kiểm tra thông tin của nhau"})
    } catch(err) {
        console.log(err)
        res.status(404)
        return res.send("err")
    }
})

/**
 * Kiểm tra xem user có phải là bạn không
 */
router.get('/api/friend/isfriend/:id',passport.authenticate("jwt", {session: false}),async (req, res) => {
    if(!req.auth) {
        res.status(404)
        return res.send({message: "unauthentication"})
    }
    const userID = req.auth._id.toString()
    const user = await UserModel.findOne({_id: userID})
    if(!user) {
        res.status(404)
        return res.send({message: "Lỗi"})
    }
    const friends = user.friends
    const id:string = req.params.id
    const index = friends.indexOf(id)
    res.status(200)
    if(index < 0) {
        return res.send({isFriend: false})
    }
    return res.send({isFriend: true})
}) 
/**
 * Kiểm tra danh sách bạn 
 */
router.get('/api/friend/arefriends',passport.authenticate("jwt", {session: false}),async (req, res) => {
    try {
    if(!req.auth) {
        res.status(401)
        return res.send({message: "unauthentication"})
    }
    const userID = req.auth._id.toString()
    const user = await UserModel.findOne({_id: userID})
    if(!user) {
        res.status(404)
        return res.send({message: "Lỗi"})
    }
    if(!req.body.checkList) {
        res.status(404)
        return res.send({message: "req không có check list"})
    }
    // list user cần phải kiểm tra xem có phải là bạn hay không
    const checkList:string[] = req.body.checkList
    // list bạn
    const friends = user.friends
    // keết quả trả về của url
    const resultList:Object[] = []
    // kiểm tra
    for(let i= 0 ;i < checkList.length; i++) {
        const index = friends.indexOf(checkList[i])

        if(index < 0) {
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
    return res.send(resultList)
    } catch(err) {
        res.status(404)
        return res.send({message: "Lỗi"})
    }
})



//----------------------------------------------------------------------
// gợi ý kết bạn
router.get('/api/friend/similarname/:name?',async (req, res) => {
    const name = req.params.name
    const user = await UserModel.find({username: {$regex: `^${name}`}}).limit(10)
    let result:Object[] = []
    for(let i = 0; i < user.length; i++) {
        result.push({
            id:user[i]._id.toString(),
            username: user[i].username,
            fullname: user[i].fullname
        })
    }
    res.status(200)
    return res.send(result)
})

router.get('/api/friend/randomuser',async (req, res) => {
    let offsetid;
    let limit;
    if(req.query.offsetid) {
        try {
        offsetid =  req.query.offsetid
        limit    = req.query.limit
        }
        catch(err) {
            res.status(404)
            return res.send({message: "query err"})
        }
        console.log(offsetid)
        console.log(limit)
        console.log("-------------------------------------------------------")
        const users = await UserModel.find({'_id': {$gt: new mongoose.Types.ObjectId(offsetid)}}).limit(limit)
        console.log(users)
        res.status(200)
        return res.send(users)
    }
    try{
    limit = req.query.limit ? req.query.limit:5
    const user = await UserModel.find({}).limit(limit)
    const result:Object[] = []
    for(let i = 0; i < user.length; i++) {
        const temp = new Object({
            id:user[i]._id.toString(),
            username: user[i].username,
            fullname: user[i].fullname
        })
        result.push(temp)
    }
    res.status(200)
    return res.send(result)
    } catch(err) {
        res.status(404)
        return res.send({message: "Lỗi"})
    }
})  

export default router
