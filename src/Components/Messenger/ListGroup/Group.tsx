import Avatar from '@src/Components/Layout/Avatar';
import { IMessageRoom } from "server/types/room.type";

import IconMore from '@src/styles/svg/more.svg';
import styles from './list-group.module.scss';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

type TProps = {
	data: IMessageRoom
	userID: string
}
const Group: React.FC<TProps> = ({ data, userID }) => {
	const router = useRouter();
	const { _id, name, name2, isGroup, userIDs, message, user, createdAt } = data;
	return (
		<div className={styles.group} onClick={() => router.push(`/messages/${isGroup ? 'r/' + _id : 'u/' + userIDs.find(id => id !== userID)}`)}>
			<Avatar
				src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random() * 25 + 65))}&background=random`}
				alt="avatar"
			/>
			<div className={styles.infoGroup}>
				<div className={styles.title}>
					{isGroup ? name : name2[userID]}
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