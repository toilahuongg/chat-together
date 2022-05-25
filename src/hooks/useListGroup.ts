import { createState, Downgraded, State, useState } from "@hookstate/core";
import { defaultGroup } from "@src/contants/group.contant";
import { AxiosInstance } from "axios";
import IRoom from "server/types/room.type";
import { useFetchAuth } from "./useFetchAuth";

export const showListGroupState = createState(true);

const groupState = createState<IRoom>(defaultGroup());
const wrapGroupState = (s: State<IRoom>) => ({
  ...s,
});
export const useGroup = () => {
  return wrapGroupState(useState(groupState));
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
});
const useListGroup = () => {
  const instance = useFetchAuth();
  return wrapListGroupState(useState(listGroupState), instance);
}

export default useListGroup;
