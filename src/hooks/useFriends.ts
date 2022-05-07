import { createState, Downgraded, State, useState } from "@hookstate/core";
import { IUser } from "server/types/user.type";

export const showFriendsState = createState(false);
export const friendsState = createState<IUser[]>([]);
export const friendsRequestSent = createState<IUser[]>([]);
export const pendingFriendsRequestState = createState<IUser[]>([]);

const wrapState = (s: State<IUser[]>) => {
  return {
    list: s,
    get: () => s.attach(Downgraded).get(),
    add: (user: IUser) => s.set(u => {
      if (!u.some(({ _id }) => _id === user._id)) u.push(user);
      return u;
    }),
    delete: (userID: string) => s.set(u => {
      return u.filter(({ _id }) => _id !== userID);
    }),
    findById: (userID: string) => s.attach(Downgraded).get().find(({ _id }) => _id === userID)
  }
};

export const useFriends = () => wrapState(useState(friendsState))
export const usePendingFriendsRequest = () => wrapState(useState(pendingFriendsRequestState))
export const useFriendsRequestSent = () => wrapState(useState(friendsRequestSent))
