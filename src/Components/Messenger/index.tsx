import { useState } from "@hookstate/core";

import Nav from "./Nav";
import ListGroup from "./ListGroup";
import ModalFriends from "./ModalFriends";
import { showFriendsState } from "@src/hooks/useFriends";

import styles from './messenger.module.scss';
import { useEffect, useRef } from "react";

type TProps = {
	children: React.ReactNode
}
const Messenger: React.FC<TProps> = ({ children }) => {
	const isMounted = useRef(false);
	const showModalFriends = useState(showFriendsState);

	useEffect(() => {
		isMounted.current = false;
		return () => {
			isMounted.current = true;
		}
	}, []);
	return (
		<>
			<Nav />
			<div className={styles.container}>
			<ListGroup />
				{children}
			</div>
			{showModalFriends.get() && <ModalFriends isShow={showModalFriends.get()} onClose={() => !isMounted.current && showModalFriends.set(false)} />}

		</>
	)
}

export default Messenger;