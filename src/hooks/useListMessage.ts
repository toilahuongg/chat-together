import { createState, Downgraded, State, useState } from "@hookstate/core";
import { defaultMessage } from "@src/contants/message.contant";
import { AxiosInstance } from "axios";
import { IGroupMessage, IMessage } from "server/types/message.type";
import { useFetchAuth } from "./useFetchAuth";


const messageState = createState<IMessage>(defaultMessage());
const wrapMessageState = (s: State<IMessage>, instance: AxiosInstance) => ({
  data: s,
  get: () => s.get()
});
export const useMessage = () => {
  const instance = useFetchAuth();
  return wrapMessageState(useState(messageState), instance);
}

const listMessageState = createState<IGroupMessage[]>([]);
const wrapListMessageState = (s: State<IGroupMessage[]>, instance: AxiosInstance) => ({
  ...s,
  list: s,
  get: () => s.attach(Downgraded).get(),
  getListMessage: (id: string): Promise<IMessage[]> => new Promise(
    (resolve, reject) => instance.get(`api/room/${id}/messages`).then(res => {
      s.set(m => {
        const { messages } = res.data as { messages: IMessage[] };
        for (const message of messages) {
          if (!m.some(g => g.messages.some(({ _id }) => _id === message._id))) {
            if (m.length && m[0].sender === message.sender) m[0].messages.unshift(message);
            else m.unshift({ sender: message.sender, messages: [message]})
          }
        }
        return m;
      });
      resolve(res.data);
    })
      .catch(err => reject(err))
  ),
  add: (message: IMessage) => s.set(m => {
    if (!m.some(g => g.messages.some(({ _id }) => _id === message._id))) {
      if (m.length && m[m.length-1].sender === message.sender) m[m.length-1].messages.push(message);
      else m.push({ sender: message.sender, messages: [message]})
    }
    return m;
  }),
});

const useListMessage = () => {
  const instance = useFetchAuth();
  return wrapListMessageState(useState(listMessageState), instance);
}

export default useListMessage;
