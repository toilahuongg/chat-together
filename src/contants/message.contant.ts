import { IMessage } from "server/types/message.type";

export const defaultMessage = (): IMessage => ({ 
    _id: '',
    msg: {
      type: 'text', 
      value: ''
    },
    roomID: '',
    sender: ''
});