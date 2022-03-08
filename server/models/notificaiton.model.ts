import { Schema, model } from "mongoose";
const NotificationSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    infoNoti: {
        nt          : String,
        userSent    : Schema.Types.ObjectId,
        accepted    : Boolean
    },
    view: {
        type: Schema.Types.Boolean,
        default: false
    },
    body: {
        type: Object,
        default: {}
    }
},{timestamps:true})

const NotificationModel = model('notification', NotificationSchema)
export default NotificationModel