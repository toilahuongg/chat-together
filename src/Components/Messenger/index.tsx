import { useState } from "@hookstate/core";

import Nav from "./Nav";
import ListGroup from "./ListGroup";
import { showGroupSettingState } from "@src/hooks/useGroupSetting";
import { showListGroupState } from "@src/hooks/useListGroup";
import ModalFriends from "./ModalFriends";
import { showFriendsState } from "@src/hooks/useFriends";

import styles from './messenger.module.scss';

type TProps = {
	children: React.ReactNode
}
const Messenger: React.FC<TProps> = ({ children }) => {
	const showGroupSetting = useState(showGroupSettingState);
	const showListGroup = useState(showListGroupState);
	const showModalFriends = useState(showFriendsState);
	return (
		<>
			<Nav />
			<div className={styles.container}>
				{showListGroup.get() && (
					<ListGroup />
				)}
				<div className={styles.group}>
					{children}
				</div>
				{
					showGroupSetting.get() && (
						<div className={styles.settings}>
							Hello
						</div>
					)
				}
			</div>
			{ showModalFriends.get() && <ModalFriends isShow={showModalFriends.get()} onClose={() => showModalFriends.set(false)} />}
			
		</>
	)
}

export default Messenger;