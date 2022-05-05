import { createState, State, useState } from "@hookstate/core";
import { defaultUser } from "@src/contants/user.contant";
import instance from "@src/helpers/instance";
import axios from "axios";
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
    addFriendRequestSent: (id: string) => {
        s.friendRequestSent.set(f => {
            const idx = f.findIndex(userID => userID === id);
            if (idx < 0) f.push(id);
            return f;
        })
    },
    removeFriendRequestSent: (id: string) => {
        s.friendRequestSent.set(f => {
            const idx = f.findIndex(userID => userID === id);
            if (idx >= 0) f.splice(idx, 1);
            return f;
        })
    },
    addPendingFriendRequest: (id: string) => {
        s.pendingFriendRequest.set(p => {
            const idx = p.findIndex(userID => userID === id);
            if (idx < 0) p.push(id);
            return p;
        })
    },
    removePendingFriendRequest: (id: string) => {
        s.pendingFriendRequest.set(p => {
            const idx = p.findIndex(userID => userID === id);
            if (idx >= 0) p.splice(idx, 1);
            return p;
        })
    },
    checkUserInFriendRequestSent: (id: string) => {
        const friendRequestSent = s.friendRequestSent.get();
        return friendRequestSent.some(userID => userID === id);
    }
});

export const useUser = () => wrapState(useState(userState))

export default useUser;