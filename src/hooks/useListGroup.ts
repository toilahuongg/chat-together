import { createState, Downgraded, State, useState } from "@hookstate/core";
import { defaultGroup } from "@src/contants/group.contant";
import { AxiosInstance } from "axios";
import IRoom from "server/types/room.type";
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


const listGroupState = createState<IRoom[]>([]);
const wrapListGroupState = (s: State<IRoom[]>, instance: AxiosInstance) => ({
  ...s,
  list: s,
  get: () => s.attach(Downgraded).get(),
  getListGroup: (): Promise<IRoom[]> => new Promise(
    (resolve, reject) => instance.get('/api/user/rooms/').then(res => {
      s.set(g => {
        const { rooms } = res.data as { rooms: IRoom[] };
        for (const room of rooms) {
          if (!g.some(({ _id }) => _id === room._id)) g.unshift(room);
        }
        return g;
      });
      resolve(res.data);
    })
      .catch(err => reject(err))
  ),
  add: (room: IRoom) => s.set(g => {
    if (!g.some(({ _id }) => _id === room._id)) g.unshift(room);
    return g;
  }),
  findById: (roomID: string) => s.attach(Downgraded).get().find(({ _id }) => _id === roomID),
  findPrivateByUserID: (userID: string) => s.attach(Downgraded).get().find(({ isGroup, userIDs }) => !isGroup &&  userIDs.includes(userID))
});
const useListGroup = () => {
  const instance = useFetchAuth();
  return wrapListGroupState(useState(listGroupState), instance);
}

export default useListGroup;
