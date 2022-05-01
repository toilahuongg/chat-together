import mongoose from "mongoose"
export default interface INotification {
    _id: string,
    userID: string,
    infoNoti: {
      nt: string,
      userSent: string,
      accepted: boolean
    },
    view: boolean,
    body: object
};
export interface INotificationModel extends Omit<INotification, '_id'>, mongoose.Document {};