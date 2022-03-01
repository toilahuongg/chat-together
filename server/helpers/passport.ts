import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import UserModel from '../models/user.model';

dotenv.config();
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_SECRET,
    passReqToCallback: true
}
passport.use(new JwtStrategy(opts, function(req, payload, done) {
    UserModel.findOne({_id: payload._id}, { _id: 1, fullname: 1, username: 1 }, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            req.auth = user;
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));
