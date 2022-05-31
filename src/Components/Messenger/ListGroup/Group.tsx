import Avatar from '@src/Components/Layout/Avatar';
import { IMessageRoom } from "server/types/room.type";

import IconMore from '@src/styles/svg/more.svg';
import styles from './list-group.module.scss';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { classNames } from '@src/helpers/classNames';
import { useMemo } from 'react';

type TProps = {
	data: IMessageRoom
	userID: string,
	updateReaders: (id: string) => void;
}
const Group: React.FC<TProps> = ({ data, userID, updateReaders }) => {
	const router = useRouter();
	const { id, type } = router.query;
	const { _id, name, avatar, infoUsers, isGroup, userIDs, message, user, createdAt } = data;
	const groupName = isGroup ? name : infoUsers[userID]?.fullname;
  const groupAvatar = isGroup ? avatar : infoUsers[userID]?.avatar;
	const className = useMemo(() => {
		const c = ['group'];
		if (message && !message.readers.includes(userID)) c.push('noRead');
		if (type === 'r' && id === _id) c.push('current');
		else if (type === 'u' && !isGroup && userIDs.includes(id as string)) c.push('current');
		return c;
	}, [message, id, type, userIDs])
	return (
		<div className={classNames(styles, className)} onClick={() => {
			updateReaders(_id);
			router.push(`/messages/${isGroup ? 'r/' + _id : 'u/' + userIDs.find(id => id !== userID)}`);
		}}>
			<Avatar
				src={groupAvatar ||'/images/group-default.jpg'}
				alt="avatar"
			/>
			<div className={styles.infoGroup}>
				<div className={styles.title}>
					{groupName}
				</div>
				<div className={styles.message}>
					{(message && user) ?
						(user._id === userID ? 'Bạn' : user.fullname) + ': ' + message.msg.value
						: 'Chưa có tin nhắn'}
				</div>
			</div>
			<div className={styles.moreInfo}>
				<p className={styles.time}> {dayjs(createdAt).fromNow(true)}</p>
				<button> <IconMore width="16" viewBox="0 0 20 4" /> </button>
			</div>
		</div>
	)
}

export default Group;