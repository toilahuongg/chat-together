import { createState, State, useState } from "@hookstate/core";
import { defaultUser } from "@src/contants/user.contant";
import instance from "@src/helpers/instance";
import axios from "axios";
import { IUser } from "server/types/user.type";

const addElement = (list: State<string[]>, id: string) => {
    list.set(l => {
        if (!l.some(_id => _id === id)) l.push(id);
        return l;
    });
}
const removeElement = (list: State<string[]>, id: string) => {
    list.set(l => {
        return l.filter(_id => _id !== id);
    })
}
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
            s.set({ ...defaultUser(), ...res.data });
            resolve(res.data);
        })
            .catch(err => reject(err))
    ),
    addFriend: function(id: string) { return addElement(s.friends, id)},
    removeFriend: function(id: string) { return removeElement(s.friends, id)},
    addFriendRequestSent: function(id: string) { return addElement(s.friendRequestSent, id)},
    removeFriendRequestSent: function(id: string) { return removeElement(s.friendRequestSent, id)},
    addPendingFriendRequest: function(id: string) { return addElement(s.pendingFriendRequest, id)},
    removePendingFriendRequest: function(id: string) { return removeElement(s.pendingFriendRequest, id)},
    checkUserInFriendRequestSent: (id: string) => {
        return s.friendRequestSent.some(userID => userID.get() === id);
    }
});

export const useUser = () => wrapState(useState(userState))

export default useUser;