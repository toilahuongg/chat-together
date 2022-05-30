import { createState, Downgraded, State, useState } from "@hookstate/core";
import { defaultGroup } from "@src/constants/group.constant";
import { AxiosInstance } from "axios";
import { IMessage } from "server/types/message.type";
import IRoom, { IMessageRoom } from "server/types/room.type";
import { IUserData } from "server/types/user.type";
import { useFetchAuth } from "./useFetchAuth";

export const showListGroupState = createState(true);

const groupState = createState<IRoom>(defaultGroup());
const wrapGroupState = (s: State<IRoom>, instance: AxiosInstance) => ({
  data: s,
  get: () => s.get(),
  getGroup: (id: string): Promise<IRoom[]> => new Promise(
    (resolve, reject) => instance.get(`/api/room/${id}`).then(res => {
      s.set(res.data);
      resolve(res.data);
    })
      .catch(err => reject(err))
  )
});
export const useGroup = () => {
  const instance = useFetchAuth();
  return wrapGroupState(useState(groupState), instance);
}


const listGroupState = createState<IMessageRoom[]>([]);
const searchTextState = createState<string>('');
export const useTxtSearchGroup = () => useState(searchTextState); 
const wrapListGroupState = (s: State<IMessageRoom[]>, instance: AxiosInstance) => ({
  ...s,
  list: s,
  get: () => s.attach(Downgraded).get().sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()),
  getListGroup: (lastTime: string | null, name?: string) => new Promise(
    (resolve, reject) => instance.get(`/api/user/rooms?name=${name}${lastTime ? `&lastTime=${lastTime}` : ''}`).then(res => {
      s.set(g => {
        const { rooms } = res.data as { rooms: IMessageRoom[] };
        for (const room of rooms) {
          if (!g.some(({ _id }) => _id === room._id)) g.push(room);
        }
        return g;
      });
      resolve(res.data);
    })
      .catch(err => reject(err))
  ),
  add: (room: IMessageRoom) => s.set(g => {
    if (!g.some(({ _id }) => _id === room._id)) g.unshift(room);
    return g;
  }),
  updateMessage: ({ message, user, room }: { message: IMessage, user: IUserData, room: IRoom }) => s.set(g => {
    if (g.some(({ _id }) => _id === room._id))
      return g.map(data => {
        if (data._id === room._id) return {
          ...data,
          message,
          user,
          createdAt: message.createdAt
        }
        return data;
      })
    else {
      g.unshift({
        ...room,
        message,
        user,
        createdAt: message.createdAt
      });
      return g;
    }
  }),
  updateReaders: (id: string, userID: string) => s.set(g => {
    return g.map(data => {
      if (data._id === id && data.message) return {
        ...data,
        message: {
          ...data.message,
          readers: [... new Set([...data.message.readers, userID])]
        }
      }
      return data;
    });
  }),
  findById: (roomID: string) => s.attach(Downgraded).get().find(({ _id }) => _id === roomID),
  findPrivateByUserID: (userID: string) => s.attach(Downgraded).get().find(({ isGroup, userIDs }) => !isGroup && userIDs.includes(userID))
});
const useListGroup = () => {
  const instance = useFetchAuth();
  return wrapListGroupState(useState(listGroupState), instance);
}

export default useListGroup;
