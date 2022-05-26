import Avatar from '@src/Components/Layout/Avatar';
import { classNames } from '@src/helpers/classNames';
import useUser from '@src/hooks/useUser';
import { IMessage } from 'server/types/message.type';
import styles from './list-message.module.scss';

type TProps = {
  data: IMessage,
}
const Message: React.FC<TProps> = ({ data }) => {
  return (
    <div className={styles.content}>
      {data.msg.value}
    </div>
  )
}

export default Message;