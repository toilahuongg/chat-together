import useListMessage, { useMessage, useSignalSend } from '@src/hooks/useListMessage';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import useListGroup, { useGroup } from '@src/hooks/useListGroup';
import { defaultMessage } from '@src/contants/message.contant';
import { FormEvent, useState } from 'react';
import randomChars from 'server/helpers/randomChars';
import useUser from '@src/hooks/useUser';
import useSocket from '@src/hooks/useSocket';

import IconImageGallery from '@src/styles/svg/image-gallery.svg';
import IconSmile from '@src/styles/svg/smile.svg';
import IconSend from '@src/styles/svg/send-message.svg';
import styles from './input-box.module.scss';

const InputBox = () => {
  const instance = useFetchAuth();
  const socket = useSocket();
  const user = useUser();
  const message = useMessage();
  const group = useGroup();
  const listMessage = useListMessage();
  const listGroup = useListGroup();
  const signalSend = useSignalSend();
  const roomID = group.data._id.get();
  const [sending, setSending] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    if (!roomID) return;
    const value = message.get().msg.value;
    if (!value) return;
    try {
      setSending(true);
      const randomID = randomChars(5);
      const msg: any = {
        ...defaultMessage(),
        _id: 'sending'+randomID,
        sender: user._id.get(),
        msg: {
          type: 'text',
          value: value
        }
      }
      listMessage.add(msg);
      message.data.set(defaultMessage());
      await instance.post(`/api/message/${roomID}/send-message`, {
        message: value
      }, {
        headers: {
          'x-exclude-socket-id': socket?.id!
        }
      }).then((res) => {
        listGroup.updateMessage({ message: res.data, user: user.data.get(), room: group.data.get() });
        listMessage.updateMessage(res.data, 'sending'+randomID);
      }).catch((error) => {
        console.log(error);
        listMessage.updateMessage({ ...msg, _id: 'error'+randomID }, 'sending'+randomID);
      });
      signalSend.set(randomChars(5));
      setSending(false);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.inputBox}>
        <div className={styles.advancedMessage}>
          <button> <IconImageGallery /> </button>
          <button> <IconSmile /> </button>
        </div>
        <div className={styles.inputMessage}>
          <input
            placeholder="Enter your message..."
            value={message.get().msg.value}
            onChange={(e) => message.data.msg.set({ type: 'text', value: e.target.value })}
          />
        </div>
        <div className={styles.btnSend}>
          <button type="submit"> <IconSend /> </button>
        </div>
      </div>
    </form>
  )
}

export default InputBox;