import useListMessage, { useMessage, useSignalSend } from '@src/hooks/useListMessage';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import useListGroup, { useGroup } from '@src/hooks/useListGroup';
import { defaultMessage } from '@src/constants/message.constant';
import { FormEvent, useRef, useState } from 'react';
import randomChars from 'server/helpers/randomChars';
import useUser from '@src/hooks/useUser';
import useSocket from '@src/hooks/useSocket';
import EmojiPicker, { SKIN_TONE_MEDIUM_LIGHT } from 'emoji-picker-react';
import { useOnClickOutside } from '@src/hooks/useOnClickOutside';

import IconImageGallery from '@src/styles/svg/image-gallery.svg';
import IconSmile from '@src/styles/svg/smile.svg';
import IconSend from '@src/styles/svg/send-message.svg';
import IconClose from '@src/styles/svg/icons8-close.svg';
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
  const [files, setFiles] = useState<File[]>([]);
  const [blobs, setBlobs] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [isShowEmoij, setShowEmoij] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputFilesRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(divRef, () => setShowEmoij(false));

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
        _id: 'sending' + randomID,
        sender: user._id.get(),
        msg: {
          type: 'text',
          value: value
        },
        images: blobs
      }
      listMessage.add(msg);
      setBlobs([]);
      message.data.set(defaultMessage());
      const formData = new FormData();
      formData.append('message', value);
      for (const f of files) {
        formData.append('images', f);
      }
      await instance.post(`/api/message/${roomID}/send-message`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-exclude-socket-id': socket?.id!
        }
      }).then((res) => {
        listGroup.updateMessage({ message: res.data, user: user.data.get(), room: group.data.get() });
        listMessage.updateMessage(res.data, 'sending' + randomID);
      }).catch((error) => {
        console.log(error);
        listMessage.updateMessage({ ...msg, _id: 'error' + randomID }, 'sending' + randomID);
      });
      setFiles([]);
      signalSend.set(randomChars(5));
      setSending(false);
    } catch (error) {
      console.log(error);
    }
  }

  const handleDeleteFile = (index: number) => {
    setFiles(f => {
      f.splice(index, 1);
      return [...f];
    });
    setBlobs(f => {
      f.splice(index, 1);
      return [...f];
    });
  }
  return (
    <div className={styles.wrapper}>
      {
        blobs.length > 0 && (
          <div className={styles.listImage}>
            {
              blobs.map((url, index) => (
                <div className={styles.image} key={url}>
                  <img src={url} width="64" height="64" />
                  <span onClick={() => handleDeleteFile(index)}> <IconClose /> </span>
                </div>
              ))
            }
          </div>
        )
      }
      <input ref={inputFilesRef} type="file" accept=".jpg,.png,.gif" onChange={(e) => {
        const listFile = Array.from(Array(e.target.files?.length || 0).keys()).map((i) => e.target.files?.item(i)).filter(c => c) as File[];
        setFiles(listFile);
        setBlobs(listFile.map(f => URL.createObjectURL(f)));
        inputRef.current?.focus();
      }} multiple hidden />
      <div className={styles.inputBox}>
        <div className={styles.advancedMessage}>
          <button onClick={(e) => {
            inputFilesRef.current?.click()
          }}> <IconImageGallery /> </button>
          <div className={styles.emoij} ref={divRef}>
            <button onClick={(e) => setShowEmoij(true)}>
              <IconSmile />
            </button>
            <div className={styles.popover} style={{ display: isShowEmoij ? 'block' : 'none' }}>
              <EmojiPicker
                onEmojiClick={(event, value) => {
                  message.data.msg.set((m) => ({ type: m.type, value: m.value + value.emoji }));
                  inputRef.current?.focus();
                }}
                disableAutoFocus={true}
                skinTone={SKIN_TONE_MEDIUM_LIGHT}
                groupNames={{ smileys_people: 'PEOPLE' }}
                native
              />
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className={styles.inputMessage}>
          <input
            ref={inputRef}
            placeholder="Enter your message..."
            value={message.get().msg.value}
            onChange={(e) => message.data.msg.set({ type: 'text', value: e.target.value })}
          />
          <div className={styles.btnSend}>
            <button type="submit"> <IconSend /> </button>
          </div>
        </form>
      </div>
    </div>

  )
}

export default InputBox;