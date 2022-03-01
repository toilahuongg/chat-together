import express from 'express';
import passport from 'passport';
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


export default Router;