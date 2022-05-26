import styles from './list-message.module.scss';
import useListMessage from '@src/hooks/useListMessage';
import GroupMessage from './GroupMessage';
import randomChars from 'server/helpers/randomChars';

const ListMessage = () => {
  const listMessage = useListMessage();

  return (
    <div className={styles.listMessage}>
      { listMessage.list.get().map(gm => <GroupMessage key={gm.sender+randomChars(5)} data={gm} />)}
    </div>
  )
}

export default ListMessage;