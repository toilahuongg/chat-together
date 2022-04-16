import express from 'express';
import passport from 'passport';
import UserModel, {User} from '../models/user.model';
import RoomModel, { Room } from '../models/room.model';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import IRoom from 'server/types/room.type';
import { Notification } from '../models/notification.model';
import SocketManager from '../helpers/socketManager';
const Router = express.Router();
/**
 * Tạo phòng
 */
Router.post('/api/room/create-room',passport.authenticate('jwt', { session: false  }), async (req, res) => {
    try {
    const userID = req.auth?._id.toString()
    const listUserAddToRoom = req.body.users
    let groupName         = req.body.name
    if(!groupName) {
        let NAME = `Nhóm của: ${req.auth?.username}`
        const userNames = await Promise.all(listUserAddToRoom.map(async (userID)=> {
            const user = await User.getUserByID(userID)
            return user?.username
        }))
        userNames.forEach((username) => {
            NAME += `, ${username}` 
        })
        groupName = NAME
    }
    if(typeof(listUserAddToRoom != typeof([])) && listUserAddToRoom.length === 0) {
        res.status(403)
        return res.send({message: "Bạn cần thêm ít nhất một user để tạo group"})
    }
    const userFriendList = await UserModel.findOne({'_id': userID})
                                          .then(data => {
                                              return data?.friends
                                          })
    if(!userFriendList || userFriendList.length === 0) {
        res.status(403)
        return res.send({message: "Bạn không có bạn, hãy kết thêm bạn để tạo group chat"})
    }

    let gotErr = false
    await Room.createRoom(userID, listUserAddToRoom, {name: groupName } )
              .catch(err => {
                gotErr = true
                return res.status(403).json({message: err.message})
              })
    if(gotErr) return
    return res.status(200).json({message: "group đã tạo thành công"})
    } catch(err) {
        return res.status(500).json({message: "lỗi hệ thống"})
    }
})
/**
 * Thêm thành viên vào phòng
 */
Router.post("/api/room/add-member/:roomid/:userid", passport.authenticate('jwt', { session: false  }), async (req, res) => {
    // khoi tao bien cuc bo
    try {
    const userID = req.auth?._id.toString() as string
    const userAdd = req.params.userid
    const roomAdd = req.params.roomid
    const userFriend = await User.getFriend(userID)
                                 .catch(err => {
                                     return res.status(403).json({message: err.message})
                                 }) as string[]|null
    if(!userFriend || !userFriend.includes(userAdd))  return res.status(403).json({message: "User ko phải bạn của bạn"})

    let addErr = false
    await Room.addMoreUserToGroup(userAdd,roomAdd, userID)
              .catch(err => {
                  addErr = true;
                  return res.status(403).json({message: err.message})
              })
    if(addErr) return
    // thông báo đến user nếu online
    const owner = await Room.getRoomOwner(roomAdd)
    if(owner) {
    const sockets = await SocketManager.getSockets(owner)
    sockets.forEach(socket => {
        req.io.to(socket).emit("new-notification", {
            type: "request-add-room-member",
            roomID: roomAdd,
            userAdd: userAdd,
            userRequire: userID
        })
    })
    }
    return res.status(200).json({message: "them thanh vien thanh cong"})
    } catch(err) {
        console.log(err)
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
})
/**
 * Chấp nhận yêu cầu vào phòng
 */
Router.post("/api/room/accept-require-add-member/:roomid/:userrequireid/:useraddid", passport.authenticate('jwt', { session: false  }), async (req, res) => {
    try {
        const userID        = req.auth?._id.toString() as string
        const roomID        = req.params.roomid
        const userrequireid = req.params.userrequireid
        const useraddid     = req.params.useraddid
        let gotErr = false
        await Notification.acceptRequireAddMember(userID,userrequireid, useraddid, roomID)
                          .catch(err => {
                            gotErr = true
                            return res.status(403).json({message: err.message})
                          })
                          
        if(gotErr) return
        // thông báo đến toàn bộ user là room update thành công
        const members = await Room.getMemberInRoom(roomID);
        members.forEach(async (member) => {
            const sockets = await SocketManager.getSockets(member)
            sockets.forEach(socket => {
                req.io.to(socket).emit("add-member", {
                    roomID: roomID,
                    memberAdd: useraddid
                } )
            })
        })
        return res.status(200).json({message: "Chấp nhận yêu cầu thành công"})

    }
    catch(err) {
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
})
/**
 * Lấy về toàn bộ room mà user tham gia
 * example
 * /api/room    : lấy về 10 phòng đầu tiên
 * /api/room/?offsetid=idphongthaydoicuoicungphiaclient&limit=sophonglay
 */
Router.get('/api/room/get-room/',passport.authenticate('jwt', { session: false  }), async (req: Request, res: Response) => {
    interface RoomQuery{
        offsetid?: string,
        limit?: number
    };
    try{
        let query:RoomQuery = req.query as unknown as RoomQuery
        query.limit = parseInt(query.limit as unknown as string)
        const userID:string = req.auth!._id.toString()
        // kiểm tra user có tồn tại hay không
        const user  = await UserModel.findOne({'_id': userID})
        if(!user) 
            return res.status(403).json({nessage: "user không tồn tại"})
        if(!query.limit) query.limit = 10

        let rooms:IRoom[];
        if(!query.offsetid) {
            rooms = await RoomModel.find({userIDs: {"$in" : userID}}).sort({ lastChange: -1}).limit(query.limit)
           
        }
        else {
           rooms = await RoomModel.find(  {userIDs: {"$in": userID},
                                                 _id: {$gt: query.offsetid}
                                                })
                                                .sort({lastChange: -1})
                                                .limit(query.limit)
        }
        const result= await Promise.all(rooms.map(async room => {
            const lastmessage= await Room.lastRoomMessage(room) as any
            const roomData = {
                roomInfo    : room,
                lastMessage:    (lastmessage?{
                                ...lastmessage["_doc"]}:
                                null) 
                
            }
            return roomData
        }))
        return res.status(200).json(result)
    } catch(err) {
        console.log(err)
        return res.status(500).json({nessage: "Lỗi"})
    }
    
})

export default Router;