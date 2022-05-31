import Avatar from '@src/Components/Layout/Avatar';
import { classNames } from '@src/helpers/classNames';
import { useListUserOfGroup } from '@src/hooks/useFriends';
import useUser from '@src/hooks/useUser';
import { IGroupMessage } from 'server/types/message.type';
import styles from './list-message.module.scss';
import Message from './Message';

type TProps = {
  data: IGroupMessage
}
const GroupMessage: React.FC<TProps> = ({ data }) => {
  const user = useUser();
  const listUser = useListUserOfGroup();
  if (data.sender === 'notify') return (
    <div className={styles.notify}>
      {data.messages.map(message => {
        const u = user.data._id.get() === message.sender ? { fullname: 'Bạn'} : listUser.get().find(({ _id }) => _id === message.sender);
        return <div key={message._id}> {u?.fullname}: {message.msg.value} </div>
      })}
    </div>
  )
  const className = ['message'];
  const isCurrentUser = user.data._id.get() === data.sender;
  if (isCurrentUser) className.push('current');
  const u = listUser.get().find(({ _id }) => _id === data.sender);
  return (
    <div className={classNames(styles, className)}>
      <Avatar
        width={40}
        height={40}
        src={u?.avatar || '/images/avatar-default.jpg'}
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