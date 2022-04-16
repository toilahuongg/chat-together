import { Schema, model } from "mongoose";
import RoomModel, {Room} from "./room.model";
import config from '../helpers/config';
const NotificationSchema = new Schema({
    userID: {
        type: String,
        required: true
    },
    infoNoti: {
        nt          : String,
        userSent    : String,
        accepted    : Boolean,
    },
    view: {
        type: Boolean,
        default: false
    },
    body: {
        type: Object,
        default: {}
    }
},{timestamps:true})
const NotificationModel = model('notification', NotificationSchema)
export default NotificationModel
class Notification {
    static async getNotificationByID(){

    }
    static async getNotificationByRange(start:string|boolean, limit, userID){
        if(!start) return await NotificationModel.find({userID: userID}).limit(limit)
        return await NotificationModel.find({_id: {$gt: start}, userID: userID})
                    .sort({createAt: -1})
                    .limit(limit)
    }
    static async sendNotificationRequireAddRoomMember(ownerID: string, userRequsetAddID: string, userAddID: string, roomID: string) {
        const body = {
            userAddID: userAddID,
            roomID: roomID
        }
        const notification = await new NotificationModel({
            userID: ownerID,
            infoNoti: {
                nt: "request-add-room-member",
                userSent: userRequsetAddID,
                accepted: false
            },
            body: {
                ...body
            }
        })
        await notification.save()
    }
    static async acceptRequireAddMember(ownerID: string, userRequestAddMemberID:string, userAddID: string, roomID: string) {
        const notificaiton = await NotificationModel.findOne({
                                                    userID: ownerID,
                                                    'infoNoti.nt': "request-add-room-member",
                                                    'infoNoti.userSent': userRequestAddMemberID,
                                                    'body.userAddID': userAddID,
                                                    'body.roomID': roomID })
        if(!notificaiton) throw new Error("Yêu cầu này ko tồn tại")
        notificaiton.infoNoti.accepted = true
        await notificaiton.save()
        await Room.addMoreUserToGroup(userAddID, roomID ,ownerID)
        const room = await Room.getRoomById(roomID)
        await Room.updateLastChange(room)
    } 
}
export {Notification}
