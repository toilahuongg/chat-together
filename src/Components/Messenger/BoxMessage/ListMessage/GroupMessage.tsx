import Avatar from '@src/Components/Layout/Avatar';
import { classNames } from '@src/helpers/classNames';
import useUser from '@src/hooks/useUser';
import { IGroupMessage } from 'server/types/message.type';
import styles from './list-message.module.scss';
import Message from './Message';

type TProps = {
  data: IGroupMessage
}
const GroupMessage: React.FC<TProps> = ({ data }) => {
  const user = useUser();
  const className = ['message'];
  const isCurrentUser = user._id.get() === data.sender;
  if (isCurrentUser) className.push('current');
  return (
    <div className={classNames(styles, className)}>
      <Avatar
        width={40}
        height={40}
        src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random() * 25 + 65))}&background=random`}
        alt="Avatar"
        hidden={isCurrentUser}
      />
      <div className={styles.groupContent}>
        {data.messages.length && (data.messages.length > 1 ?
          data.messages.map(message => <Message key={message._id} data={message} />)
          : (
            <div className={classNames(styles, ['content', 'single'])}>
              {data.messages[0].msg.value}
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default GroupMessage;