import express from 'express';
import slug from 'slug';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import bcrypt from 'bcrypt';

import { signToken, verifyToken } from '../helpers/jwt';
import UserModel from '../models/user.model';
import { IUserData } from '../types/user.type';
import randomChars from '../helpers/randomChars';

dotenv.config();
const Router = express.Router();

Router.post('/api/auth/sign-in-with-social', async (req, res) => {
    const { displayName, email } = req.body;
    const userData = await UserModel.findOne({ email }, { _id: 1, fullname: 1, username: 1 }).lean();
    let payload: IUserData = {
        _id: new mongoose.Types.ObjectId(),
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
    console.log(payload)
    const token = signToken(payload, process.env.TOKEN_SECRET || '', process.env.TOKEN_EXPIRESIN || '');
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
    return res.json({ token, refreshToken });
});

Router.post('/api/auth/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
    const { _id, fullname, username } = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET || '') as IUserData;
    const user = await UserModel.findOne({ _id, refreshToken });
    if (!user) return res.status(401).json('Unauthorized');
    const token = signToken({ _id, fullname, username }, process.env.TOKEN_SECRET || '', process.env.TOKEN_EXPIRESIN || '');
    return res.json({ token });
})
Router.get('/api/user/profile', passport.authenticate('jwt', { session: false  }), async (req, res) => {
    return res.json(req.auth);
});

export default Router;