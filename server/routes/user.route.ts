import express from 'express';
import slug from 'slug';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import bcrypt from 'bcrypt';
import ObjectID from 'mongoose'

import { signToken, verifyToken } from '../helpers/jwt';
import UserModel, { User } from '../models/user.model';
import { IUser, IUserData } from '../types/user.type';
import randomChars from '../helpers/randomChars';
import SocketManager from '../helpers/socketManager';
import { Notification } from '../models/notification.model'
import multer from 'multer'
import fs from 'fs'
import uploadavartar from '../helpers/avartarUploadHandle'
import MulterRequest from 'server/types/multerrequest';
import { AnyContext } from '@hookstate/core';
dotenv.config();
const Router = express.Router();
/**
 * URL cho việc login bằng database
 */
Router.post('/api/auth/sign-in-with-social', async (req, res) => {
    const { displayName, email } = req.body;
    const userData = await UserModel.findOne({ email }, { _id: 1, fullname: 1, username: 1 }).lean();
    let payload: IUserData = {
        _id: '',
        fullname: '',
        username: ''
    }
    if (userData) payload = userData;
    else {
        const newUser = await UserModel.create({
            fullname: displayName,
            email,
            username: slug(displayName),
            password: bcrypt.hashSync(randomChars(10), parseInt(process.env.SALT_ROUNDS || '', 10))
        })
        payload = {
            _id: newUser._id,
            fullname: newUser.fullname,
            username: newUser.username
        }
    }
    const accessToken = signToken(payload, process.env.TOKEN_SECRET || '', process.env.TOKEN_EXPIRESIN || '');
    let refreshToken = '';
    // kiem tra xem refreshToken trong db co hop le hay khong, neu khong tao cai moi va luu vao db
    try {
        const user = await UserModel.findOne({ _id: payload._id }, { refreshToken: 1 });
        if (!user) return res.status(401).json('Unauthorized');
        await verifyToken(user.refreshToken, process.env.REFRESH_TOKEN_SECRET || '');
        refreshToken = user.refreshToken;
    } catch (error) {
        refreshToken = signToken(payload, process.env.REFRESH_TOKEN_SECRET || '', process.env.REFRESH_TOKEN_EXPIRESIN || '');
        await UserModel.updateOne({ _id: payload._id }, { refreshToken });
    }
    return res.json({ accessToken, refreshToken });
});

Router.post('/api/auth/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
    const { _id, fullname, username } = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET || '') as IUserData;
    const user = await UserModel.findOne({ _id, refreshToken });
    if (!user) return res.status(401).json('Unauthorized');
    const accessToken = signToken({ _id, fullname, username }, process.env.TOKEN_SECRET || '', process.env.TOKEN_EXPIRESIN || '');
    return res.json({ accessToken });
})

/**
 * Lấy thông tin người dùng
 */
Router.get('/api/user/profile/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // route có id thì tìm theo id
    try {
        let ID = req.auth?._id as unknown as string
        if (ID === req.query.id) req.query.id = undefined
        if (req.query.id) {
            ID = req.query.id as unknown as string
            const isvalidID = ObjectID.isValidObjectId(ID)
            if (!isvalidID)
                return res.status(403).json({ message: "Mã người dùng không hợp lệ" })
            // Danh sach ban của người gửi request
            const friendsID = await UserModel.findOne({ _id: req.auth?._id })
                .then(data => {
                    if (!data) return []
                    return data.friends
                })
            const isFriend = friendsID.includes(ID)
            const profile = await UserModel.findOne({ _id: ID }) as any
            if (!profile) return res.status(403).json({ message: "User không tồn tại" })
            profile.password = undefined
            // Kiểm tra user online 
            const isOnline = await SocketManager.isOnline(ID)
            if (isFriend) {
                return res.status(200).json({
                    username: profile.username,
                    fullname: profile.fullname,
                    email: profile.email,
                    phone: profile.phone,
                    onlinestatus: isOnline
                })
            }
            else {
                return res.status(200).json({
                    username: profile.username,
                    fullname: profile.fullname,
                })
            }

        }
        // route không có id không trả về thông tin của người của người gọi
        else {
            const ID = req.auth?._id
            let profile = await UserModel.findOne({ _id: ID }) as Partial<IUser>
            if (!profile) return res.status(500).json({ message: "Lỗi hệ thống" })
            delete profile.password
            return res.status(200).json(profile)
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
});
Router.get("/api/user/profile/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.params.id) return res.status(403).json({ message: "ParamID ko dc de trống" })
        const user = await User.getUserByID(req.params.id)
        return res.status(200).json(user)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
})
Router.get("/api/user/profile-list", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.body || !req.body.ids || req.body.ids === 0 || !req.body.ids)
            return res.status(403).json({ message: "Lỗi body request ko tồn tại ids hoặc độ dài của ids = 0" })
        const friendsID = await UserModel.findOne({ _id: req.auth?._id })
            .then(data => {
                if (!data) return []
                return data.friends
            })
        const ids = req.body.ids
        const listUser = await Promise.all(ids.map(async (id) => {
            const isFriend = friendsID.includes(id)
            const isOnline = await SocketManager.isOnline(id)
            const user = await User.getUserByID(id) as any
            if (!user) return null
            let userData;
            userData = {
                ...user["_doc"],
                phone: undefined,
                password: undefined,
                "pendingFriendRequest": undefined,
                "friendRequestSent": undefined,
                isOnline: isOnline
            }
            if (isFriend) {
                userData.isOnline = isOnline
            }
            return userData

        }))
        return res.status(200).json(listUser)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
})

Router.put("/api/user/update-profile",passport.authenticate('jwt', { session: false }), uploadavartar.single("avartar") , async ( req, res) => {
    try {
    const {username, email, phone, fullname} = req.body
    const id = req.auth?._id as string
    try{
    (req as any).body.avatar = (req as MulterRequest).file.filename
    } catch(err) {
        (req as any).body.avatar = undefined
    }
    await User.changeUserInFo(id, req.body as any)
    return res.status(200).send()
    } catch(err) {
        console.log(err)
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
})
Router.get("/api/user/notification", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.auth?._id
        const offsetid = (req.query.offsetid ? req.query.offsetid : false) as string | boolean
        const limit = req.query.limit
        await Notification.getNotificationByRange(offsetid, limit, userId)
            .then(notifications => {
                return res.status(200).json(notifications)
            })
            .catch(err => {
                return res.status(403).json({ message: err.message })
            })
    } catch (err) {
        console.log(err)
        return res.status(200).json({ message: "Lỗi hệ thống" })
    }
})
/**
 * Register route
 * cần phải gửi đủ 5 trường 
 * --------------------
 * REQUEST
 * POST      /api/register
 * Request header:
 *          content-type: application/json
 * 
 * Request body:
 *          username
 *          fullname
 *          password
 *          email
 *          phone
 * Success
 *          status: 200
 * Error
 *          status: 4xx
 * 
 * 
 */
Router.post('/api/register', async (req, res) => {
    const username: string = req.body.username
    const fullname: string = req.body.fullname
    const password: string = req.body.password
    const email: string = req.body.email
    const phone: string = req.body.phone
    if (!username || !password || !fullname || !email || !phone) {
        res.status(404)
        return res.send({ message: "Không được bỏ trống ô" })
    }
    try {
        // kiểm tra user tồn tại
        await UserModel.find({ username: username })
            .then(async data => {
                if (data.length !== 0) {
                    res.status(404)
                    return res.send({ message: "user đã tồn tại" })
                }
                // khởi tạo password mởi được hash dựa trên password ban đầu
                const hashpassword: string = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUNDS || '', 10))
                // luu du lieu vao trong database
                const newuser = await new UserModel({
                    username: username,
                    fullname: fullname,
                    password: hashpassword,
                    email: email,
                    phone: phone
                })
                    .save()
                    .then(() => {
                        res.status(200)
                        return res.send({ message: "Đăng ký thành công" })
                    })
            })
    } catch (err) {
        res.status(404)
        return res.send({ message: "Lỗi không xác định" })
    }
})

/**
 * Login route
 */
Router.post('/api/login', async (req, res) => {
    // lấy dữ liệu
    const username: string = req.body.username
    const password: string = req.body.password
    if (!username || !password) {
        res.status(404)
        return res.send({ message: "phải có đầy đủ tài khoản và mật khẩu để đăng nhập" })
    }
    // kiểm tra tài khoản tồn tại hay không
    await UserModel.findOne({ username: username })
        .then(async user => {
            // lỗi
            if (!user) {
                res.status(404)
                return res.send({ message: "Tài khoản không tồn tại" })
            }
            // kiểm tra mật khẩu đúng hay sai
            bcrypt.compare(password, user.password, async (err, result) => {
                if (err) {
                    res.status(404)
                    return res.send({ message: "lỗi không xác định" })
                }
                // lỗi
                if (err) {
                    res.status(404)
                    return res.json()
                }
                // result = true : tài khoản và mật khẩu đúng, false ngược lại
                if (result) {
                    const payload = {
                        _id: user._id,
                        username: user.username,
                        fullname: user.fullname
                    }
                    const accessToken = signToken(payload, process.env.TOKEN_SECRET || '', process.env.TOKEN_EXPIRESIN || '');
                    let refreshToken = '';
                    // kiem tra xem refreshToken trong db co hop le hay khong, neu khong tao cai moi va luu vao db
                    try {
                        const user = await UserModel.findOne({ _id: payload._id }, { refreshToken: 1 });
                        if (!user) return res.status(401).json('Unauthorized');
                        await verifyToken(user.refreshToken, process.env.REFRESH_TOKEN_SECRET || '');
                        refreshToken = user.refreshToken;
                    } catch (error) {
                        refreshToken = signToken(payload, process.env.REFRESH_TOKEN_SECRET || '', process.env.REFRESH_TOKEN_EXPIRESIN || '');
                        await UserModel.updateOne({ _id: payload._id }, { refreshToken });
                    }
                    return res.status(200).json({ accessToken, refreshToken })
                }
                res.status(404)
                return res.json({ message: "Tài khoản hoặc mật khẩu không đúng" })
            })
        })
})
//----------------------------------------------------------------------
// gợi ý kết bạn
Router.get('/api/user/search', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const removeUnesseseryData = (data) => {
        if (data instanceof Array) {
            const result = data.map(user => {
                return {
                    id: user.id.toString(),
                    username: user.username,
                    fullname: user.fullname
                }
            })
            return result
        }
        return []
    }
    try {
        const userID = req.auth?._id.toString() as string
        const { fullname, lastid, random } = req.query
        const limit = 10
        if (random) {
            return await new Promise(async (rs, rj) => {
                if (lastid) {
                    const users = await UserModel.find({ '_id': { $gt: lastid, $ne: userID } }).limit(limit)
                    const result = removeUnesseseryData(users)
                    return res.status(200).json(result)
                }
                let users = await UserModel.find({ '_id': { $ne: userID } }).limit(limit)
                const result = removeUnesseseryData(users)
                return res.status(200).json(result)
            })
                .catch(err => {
                    return res.status(403).json({ message: "Lỗi param" })
                })
        }
        return new Promise(async (rs, rej) => {
            if (!lastid) {
                const user = await UserModel.find({ '_id': { $ne: userID }, fullname: { $regex: `^${fullname}` } }).limit(limit)
                let result = removeUnesseseryData(user)
                return res.status(200).json(result)
            }
            const user = await UserModel.find({ '_id': { $gt: lastid, $ne: userID }, fullname: { $regex: `^${fullname}` } }).limit(limit)
            let result = removeUnesseseryData(user)
            return res.status(200).json(result)
        })
            .catch(err => {
                return res.status(403).json({ message: "Lỗi param" })
            })

    } catch (err) {
        return res.status(500).json({ message: "Lỗi Hệ thống" })
    }

})
Router.get('/api/user/similarname/:name', async (req, res) => {
    const name = req.params.name
    const user = await UserModel.find({ username: { $regex: `^${name}` } }).limit(10)
    let result: Object[] = []
    for (let i = 0; i < user.length; i++) {
        result.push({
            id: user[i]._id.toString(),
            username: user[i].username,
            fullname: user[i].fullname
        })
    }
    return res.status(200).json(result)
})

Router.get('/api/user/randomuser', async (req, res) => {
    let offsetid;
    let limit;
    if (req.query.offsetid) {
        try {
            offsetid = req.query.offsetid
            limit = req.query.limit
        }
        catch (err) {
            return res.status(403).send({ message: "query err" })
        }
        const users = await UserModel.find({ '_id': { $gt: new mongoose.Types.ObjectId(offsetid) } }).limit(limit)
        res.status(200)
        return res.send(users)
    }
    try {
        limit = req.query.limit ? req.query.limit : 5
        const user = await UserModel.find({}).limit(limit)
        const result: Object[] = []

        for (let i = 0; i < user.length; i++) {
            const temp = new Object({
                id: user[i]._id.toString(),
                username: user[i].username,
                fullname: user[i].fullname
            })
            result.push(temp)
        }
        res.status(200)
        return res.send(result)
    } catch (err) {
        res.status(500)
        return res.send({ message: "Lỗi" })
    }
})
export default Router;