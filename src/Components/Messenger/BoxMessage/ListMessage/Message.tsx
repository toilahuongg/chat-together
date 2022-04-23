import { classNames } from '@src/helpers/classNames';
import useUser from '@src/hooks/useUser';
import styles from './list-message.module.scss';

type TProps = {
  data: any
}
const Message: React.FC<TProps> = ({ data }) => {
  const user = useUser();
  const className = ['message'];
  const isCurrentUser = user._id.get() === data.userID;
  if (isCurrentUser) className.push('current');
  return (
    <div className={classNames(styles, className)}>
      <div className={styles.avatar}>
        <img
					src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random()*25 + 65))}&background=random`}
					alt="avatar"
				/>
      </div>
      <div className={styles.content}>
        {data.message}
      </div>
    </div>
  )
}

export default Message;