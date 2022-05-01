import { useState } from "@hookstate/core";

import Nav from "./Nav";
import ListGroup from "./ListGroup";
import { showGroupSettingState } from "@src/hooks/useGroupSetting";

import styles from './messenger.module.scss';
import { showListGroupState } from "@src/hooks/useListGroup";

type TProps = {
	children: React.ReactNode
}
const Messenger: React.FC<TProps> = ({ children }) => {
	const showGroupSetting = useState(showGroupSettingState);
	const showListGroup = useState(showListGroupState);
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
		</>
	)
}

export default Messenger;