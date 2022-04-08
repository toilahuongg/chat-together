import express from 'express';
import passport from 'passport';
import UserModel from '../models/user.model';
import RoomModel from '../models/room.model';
import mongoose from 'mongoose';
import { updateLastChange } from '../models/room.model';
const Router = express.Router();
/**
 * Tạo room mới
 */
// Router.post('/api/room/:id', passport.authenticate('jwt', { session: false  }), async (req, res) => {
//     const { id } = req.params;
//     const { type } = req.body;
//     if (!req.auth) return res.status(401).json('Unauthorized');
//     if (type === 'u') {
//         const room = await RoomModel.findOne({ userIDs: { $in: [ id, req.auth._id ] }, isGroup: false }).lean();
//         if (room) return res.json(room);
//         const newRoom = await RoomModel.create({
//             isGroup: false,
//             name: '',
//             userIDs: [id, req.auth._id],
//             settings: {}
//         });
//         return res.json(newRoom);
//     }
//     return res.json();
// });
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
 */
Router.get('/api/room/',passport.authenticate('jwt', { session: false  }), async (req, res) => {
    // kiểm tra user
    try{
        if(!req.auth) {
            res.status(401)
            return res.send("unauthentication")
        }
        const userID:string = req.auth._id.toString()
        // kiểm tra user có tồn tại hay không
        const user =await UserModel.findOne({'_id': userID})
        if(!user) {
            res.status(404)
            return res.send({nessage: "Lỗi"})
        }
        // lấy phòng
        const rooms =await RoomModel.find({userIDs: {"$in" : new mongoose.Types.ObjectId(userID)}}).sort({ createdAt: -1})
        console.log(rooms)
        res.status(200)
        return res.send(rooms)
    } catch(err) {
        console.log(err)
        res.status(404)
        return res.send({nessage: "Lỗi"})
    }
})

export default Router;