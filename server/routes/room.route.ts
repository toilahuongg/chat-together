import express from 'express';
import passport from 'passport';
import UserModel from '../models/user.model';
import RoomModel from '../models/room.model';
import mongoose from 'mongoose';
import { updateLastChange, lastRoomMessage } from '../models/room.model';
import { Request, Response } from 'express';
import { IMessage } from 'server/types/message.type';
import IRoom from 'server/types/room.type';
const Router = express.Router();
/**
 * Tạo phòng
 */
Router.post('/api/room/createroom',passport.authenticate('jwt', { session: false  }), async (req, res) => {
    // kiem tra login
    if(!req.auth) {
        res.status(401)
        return res.send("unauthentication")
    }
    // khoi tao bien cuc bo
    const userID = req.auth._id.toString()
    const listUserAddToRoom = req.body.users
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
    // kiem tra xem những user có là bạn của user gốc ko
    for(let i = 0; i< listUserAddToRoom.length; i++) {
        let isFriend = false // danh dau
        for(let j = 0; j < userFriendList.length; j++) {
            if(listUserAddToRoom[i] === userFriendList[j]) {
                isFriend = true
                break;
            }
        }
        if(!isFriend) {
            res.status(403)
            return res.send({message: "Chỉ được thêm vào group những người đã là bạn của bạn"})
        }
    }
    // xác minh các trường cần thiết
    const groupName = req.body.id
    if(typeof(groupName) !== typeof("")) {
        res.status(403)
        return res.send("Tên nhóm là bắt buộc, tên nhóm phải là 1 chuỗi các kí tự")
    }
    // tạo group
    const session = await RoomModel.startSession();
    
    await session.withTransaction(async () => {
        const date = new Date()
        const group = await new RoomModel({
            name: groupName,
            isGroup: true,
            userIDs: [...listUserAddToRoom, new mongoose.Types.ObjectId(userID)],
            ownerID: new mongoose.Types.ObjectId(userID),
            settings: {},
            lastChange: date
        })
        await group.save()
        updateLastChange(group)
    })
    res.status(200)
    return res.send({message: "group đã tạo thành công"})
    
})
/**
 * Thêm thành viên vào phòng
 */
Router.post("/api/room/add-member", passport.authenticate('jwt', { session: false  }), async (req, res) => {
     // kiem tra login
     if(!req.auth) {
        res.status(401)
        return res.send("unauthentication")
    }
    // khoi tao bien cuc bo
    const userID = req.auth._id.toString()
    const listUserAddToRoom = req.body.users
    if(typeof(listUserAddToRoom != typeof([])) && listUserAddToRoom.length === 0) {
        res.status(403)
        return res.send({message: "Trong list không có user"})
    }
    const userFriendList = await UserModel.findOne({'_id': userID})
                                          .then(data => {
                                              return data?.friends
                                          })
    if(!userFriendList || userFriendList.length === 0) {
        res.status(403)
        return res.send({message: "Bạn không có bạn, hãy kết thêm bạn để tạo group chat"})
    }
    // kiem tra xem những user có là bạn của user gốc ko
    for(let i = 0; i< listUserAddToRoom.length; i++) {
        let isFriend = false // danh dau
        for(let j = 0; j < userFriendList.length; j++) {
            if(listUserAddToRoom[i] === userFriendList[j]) {
                isFriend = true
                break;
            }
        }
        if(!isFriend) {
            res.status(403)
            return res.send({message: "Chỉ được thêm vào group những người đã là bạn của bạn"})
        }
    }
    // các trường cần thiết
    const roomID = req.body.roomID
    if(!roomID) {
        res.status(403)
        return res.send({message: "cần roomID để thêm"})
    }
    // kiem tra phong co ton tai ko
    const room = await RoomModel.findOne({'_id': new mongoose.Types.ObjectId(roomID)})
    if(!room) {
        res.status(403)
        return res.send({message: "group không tồn tại"})
    }
    // kiểm tra xem các thành viên muốn thêm đã có trong nhóm hay chưa
    const userAlreadyInGroup = room.userIDs;
    // kiem tra loi bat ngo
    if(typeof(userAlreadyInGroup) !== typeof([])) {
        res.status(403)
        return res.send({message: "unknow err"})
    }
    for(let i = 0; i < listUserAddToRoom.length; i++) {
        for(let j = 0; j < userAlreadyInGroup.length; j++) {
            if(listUserAddToRoom[i] === userAlreadyInGroup[j]) {
                res.status(403)
                return res.send({message: "cac thanh vien duoc them phai khong nam trong group"})
            }
        }
    }

    // them thanh vien
    const session = await RoomModel.startSession();
    
    await session.withTransaction(async () => {
        const room = await RoomModel.findOne({'_id': new mongoose.Types.ObjectId(roomID)})
        if(room !== null) {
        const userAlreadyInGroup = room.userIDs;
        room.userIDs = [...userAlreadyInGroup, ...listUserAddToRoom]
        await room.save()
        updateLastChange(room)
        }
    })
    res.status(200)
    return res.send({message: "them thanh vien thanh cong"})
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
            const lastmessage= await lastRoomMessage(room) as any
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