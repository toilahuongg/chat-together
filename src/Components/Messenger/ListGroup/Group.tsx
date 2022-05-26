import Link from 'next/link';
import Avatar from '@src/Components/Layout/Avatar';
import IRoom from "server/types/room.type";

import IconMore from '@src/styles/svg/more.svg';
import styles from './list-group.module.scss';

type TProps = {
	data: IRoom
	userID: string
}
const Group: React.FC<TProps> = ({ data, userID }) => {
	const { _id, name, name2, isGroup, userIDs } = data;
	return (
		<div className={styles.group}>
			<Avatar
				src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random()*25 + 65))}&background=random`}
				alt="avatar"
			/>
			<div className={styles.infoGroup}>
				<div className={styles.title}>
					<Link href={`/messages/${isGroup ? 'r/'+_id : 'u/' + userIDs.find(id => id !== userID)}`}><a>
						{ isGroup ? name : name2[userID] } 
					</a></Link>
				</div>
				<div className={styles.message}>Vũ Bá Hướng: Oke nhé nhé nhé nhé nhé nhé</div>
			</div>
			<div className={styles.moreInfo}>
				<p className={styles.time}> 1 giờ</p>
				<button> <IconMore width="16" viewBox="0 0 20 4" /> </button>
			</div>
		</div>
	)
}

export default Group;