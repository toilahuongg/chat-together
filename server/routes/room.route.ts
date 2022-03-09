import express from 'express';
import passport from 'passport';
import UserModel from '../models/user.model';
import RoomModel from '../models/room.model';

const Router = express.Router();

Router.post('/api/room/:id', passport.authenticate('jwt', { session: false  }), async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;
    if (!req.auth) return res.status(401).json('Unauthorized');
    if (type === 'u') {
        const room = await RoomModel.findOne({ userIDs: { $in: [ id, req.auth._id ] }, isGroup: false }).lean();
        if (room) return res.json(room);
        const newRoom = await RoomModel.create({
            isGroup: false,
            name: '',
            userIDs: [id, req.auth._id],
            settings: {}
        });
        return res.json(newRoom);
    }
    return res.json();
});
/**
 * Lấy về toàn bộ room mà user tham gia
 */
Router.get('/api/getroompaticipate',passport.authenticate('jwt', { session: false  }), async (req, res) => {
    // kiểm tra user
    try{
        if(!req.auth) {
            res.status(401)
            return res.send("unauthentication")
        }
        const userID:string = req.auth._id.toString()
        // kiểm tra user có tồn tại hay không
        const user = UserModel.findOne({_id: userID})
        if(!user) {
            res.status(404)
            return res.send({nessage: "Lỗi"})
        }
        // lấy phòng
        const rooms =await RoomModel.find({userIDs: {"$in" : `${userID}`}}).sort({ createdAt: -1})
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