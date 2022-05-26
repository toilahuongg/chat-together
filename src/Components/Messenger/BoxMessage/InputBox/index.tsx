import IconImageGallery from '@src/styles/svg/image-gallery.svg';
import IconSmile from '@src/styles/svg/smile.svg';
import IconSend from '@src/styles/svg/send-message.svg';
import styles from './input-box.module.scss';
import useListMessage, { useMessage } from '@src/hooks/useListMessage';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import { useGroup } from '@src/hooks/useListGroup';
import useSocket from '@src/hooks/useSocket';
import { defaultMessage } from '@src/contants/message.contant';
import { FormEvent } from 'react';
import useUser from '@src/hooks/useUser';

const InputBox = () => {
  const instance = useFetchAuth();
  const message = useMessage();
  const group = useGroup();
  const listMessage = useListMessage();
  const roomID = group.data._id.get();
  const socket = useSocket();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomID) return;
    if (!message.get().msg.value) return;
    try {
      const response = await instance.post(`/api/message/${roomID}/send-message`, {
        message: message.get().msg.value
      })
      listMessage.add(response.data);
      message.data.set(defaultMessage());
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