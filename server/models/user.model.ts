import { Schema, model } from 'mongoose';
import { IUser } from '../types/user.type';
const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }, 
    phone: {
        type: String
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

const UserModel = model('users', UserSchema);
export default UserModel;