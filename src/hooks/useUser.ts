import { createState, State, useState } from "@hookstate/core";
import { defaultUser } from "@src/contants/user.contant";
import instance from "@src/helpers/instance";
import axios from "axios";
import INotification from "server/types/notification.type";
import { IUser } from "server/types/user.type";

export const pendingFriendsState = createState<IUser[]>([]);
export const friendsSentState = createState<IUser[]>([]);
export const friendsState = createState<IUser[]>([]);

const userState = createState<IUser>(defaultUser());
const wrapState = (s: State<IUser>) => ({
    ...s,
    loginUser: () => new Promise(
        (resolve, reject) => axios.post('/api/login', s.get()).then(res => resolve(res.data))
        .catch(err => reject(err))
    ),
    registerUser: () => new Promise(
        (resolve, reject) => axios.post('/api/register', s.get()).then(res => resolve(res.data))
        .catch(err => reject(err))
    ),
    getCurrentUser: (): Promise<IUser> => new Promise(
        (resolve, reject) => instance.get('/api/user/profile/').then(res => {
            s.set({ ...defaultUser(), ...res.data});
            resolve(res.data);
        })
        .catch(err => reject(err))
    ),
    updateFriendRequestSent: (noti: INotification) => {
        s.friendRequestSent.set(f => {
            const idx = f.findIndex(({ userID }) => userID === noti.userID);
            if (idx >= 0) f.splice(idx, 1);
            else f.push({ userID: noti.userID, notificationID: noti._id });
            return f;
        })
    },
    updatePendingFriendRequest: (noti: INotification) => {
        s.pendingFriendRequest.set(f => {
            const idx = f.findIndex(({ userID }) => userID === noti.userID);
            if (idx >= 0) f.splice(idx, 1);
            else f.push({ userID: noti.userID, notificationID: noti._id });
            return f;
        })
    },
    checkUserInFriendRequestSent: (userID: string) => {
        const friendRequestSent = s.friendRequestSent.get();
        return friendRequestSent.some(user => user.userID === userID);
    },
    getNotiIdInSent: (userID: string) => {
        const friendRequestSent = s.friendRequestSent.get();
        return friendRequestSent.find(user => user.userID === userID)?.notificationID;
    },
    getNotiIdInPending: (userID: string) => {
        const pendingFriendRequest = s.pendingFriendRequest.get();
        return pendingFriendRequest.find(user => user.userID === userID)?.notificationID;
    }
});

export const useUser = () => wrapState(useState(userState))

export default useUser;