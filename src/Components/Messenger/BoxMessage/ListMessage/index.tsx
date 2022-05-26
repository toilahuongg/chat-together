import Message from './Message';

import styles from './list-message.module.scss';
import { useGroup } from '@src/hooks/useListGroup';
import useListMessage from '@src/hooks/useListMessage';
import { useEffect } from 'react';
import GroupMessage from './GroupMessage';
import randomChars from 'server/helpers/randomChars';

const ListMessage = () => {
  const group = useGroup();
  const roomID = group.data._id.get();
  const listMessage = useListMessage();
  useEffect(() => {
    listMessage.list.set([]);
    if (roomID) (async() => {
      await listMessage.getListMessage(roomID);
    })();
  }, [roomID]);
  return (
    <div className={styles.listMessage}>
      { listMessage.list.get().map(gm => <GroupMessage key={gm.sender+randomChars(5)} data={gm} />)}
    </div>
  )
}

export default ListMessage;