import { useState } from '@hookstate/core';
import Avatar from '@src/Components/Layout/Avatar';
import useAuth from '@src/hooks/useAuth';
import { showFriendsState } from '@src/hooks/useFriends';
import useListGroup, { showListGroupState } from '@src/hooks/useListGroup';
import useSocket from '@src/hooks/useSocket';
import useUser from '@src/hooks/useUser';
import useWindowSize from '@src/hooks/useWindowSize';
import IconFriends from '@src/styles/svg/friends.svg';
import IconLeftArrow from '@src/styles/svg/left-arrow.svg';
import IconLogout from '@src/styles/svg/log-out.svg';
import IconRightArrow from '@src/styles/svg/right-arrow.svg';
import { useRouter } from 'next/router';
import React from 'react';
import ModalUpdateProfile from '../ModalUpdateProfile';
import styles from './nav.module.scss';


const Nav = () => {
	const size = useWindowSize();
	const socket = useSocket();
	const user = useUser();
	const router = useRouter();
	const { setAccessToken, setRefreshToken } = useAuth();
	const showListGroup = useState(showListGroupState);
	const listGroup = useListGroup();
	const showModalFriends = useState(showFriendsState);
	const [isShow, setShow] = React.useState(false);
	return (
		<>
			<div className={styles.nav}>
				{
					(size.width > 768 || router.pathname !== '/') && (
						<div className={styles.navBar}>
							<button onClick={() => size.width > 768 ? showListGroup.set(!showListGroup.get()) : router.push('/')}>
								{
									size.width > 768 ? (
										showListGroup.get() ? (
											<IconLeftArrow />
										) : (
											<IconRightArrow />
										)
									) : <IconLeftArrow />
								}
							</button>
						</div>
					)
				}

				<div className={styles.logo}>
					CHAT TOGETHER
				</div>
				<div className={styles.multiFeature}>
					<div className={styles.user} onClick={() => setShow(true)}>
						<Avatar
							src={user.data.avatar.get() ? user.data.avatar.get()! : '/images/avatar-default.jpg'}
							alt="avatar"
							width={26}
							height={26}
						/>
						<span> {user.fullname.get()} </span>
					</div>
					<button onClick={() => showModalFriends.set(!showModalFriends.get())}>
						<IconFriends />
						<span className={styles.counter}>{user.pendingFriendRequest.length}</span>
					</button>
					<button onClick={() => {
						setAccessToken('');
						setRefreshToken('');
						listGroup.list.set([]);
						socket.disconnect();
					}}>
						<IconLogout />
					</button>
				</div>
			</div>
			{isShow && <ModalUpdateProfile isShow={isShow} onClose={() => setShow(false)} />}

		</>
	)
}

export default Nav;