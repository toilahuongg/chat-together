import { createState, Downgraded, State, useState } from "@hookstate/core";
import { defaultMessage } from "@src/constants/message.constant";
import { AxiosInstance, CancelToken } from "axios";
import { IGroupMessage, IMessage } from "server/types/message.type";

const signalSend = createState<string>('');
export const useSignalSend = () => useState(signalSend);

const messageState = createState<IMessage>(defaultMessage());
const wrapMessageState = (s: State<IMessage>) => ({
  data: s,
  get: () => s.get()
});
export const useMessage = () => {
  return wrapMessageState(useState(messageState));
}

const listMessageState = createState<IGroupMessage[]>([]);
const wrapListMessageState = (s: State<IGroupMessage[]>) => ({
  ...s,
  list: s,
  get: () => s.attach(Downgraded).get(),
  getListMessage: (instance: AxiosInstance, token: CancelToken, id: string, lastId: string | null) => new Promise(
    (resolve, reject) => instance.get(`api/room/${id}/messages${lastId ? `?lastId=${lastId}` : ''}`, { cancelToken: token }).then(res => {
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
  updateMessage: (message: IMessage, id: string) => s.set(l => {
    for (let i = l.length - 1;  i >= 0; i--) {
      if (l[i].sender !== message.sender) continue;
      for (let j = l[i].messages.length - 1; j >= 0; j--) {
        if (l[i].messages[j]._id === id) {
          l[i].messages[j] = message;
          return l;
        }
      }
    }
    return l;
  }),
  countMessage: () => {
    return s.reduce((prev, current) => prev + current.messages.length,0)
  }
});

const useListMessage = () => {
  return wrapListMessageState(useState(listMessageState));
}

export default useListMessage;
