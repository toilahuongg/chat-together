import { useState } from '@hookstate/core';

import { showListGroupState } from '@src/hooks/useListGroup';
import { showFriendsState } from '@src/hooks/useFriends';
import useAuth from '@src/hooks/useAuth';
import useSocket from '@src/hooks/useSocket';

import IconLeftArrow from '@src/styles/svg/left-arrow.svg';
import IconRightArrow from '@src/styles/svg/right-arrow.svg';
import IconFriends from '@src/styles/svg/friends.svg';
import IconLogout from '@src/styles/svg/log-out.svg';
import styles from './nav.module.scss';
import useUser from '@src/hooks/useUser';
import Avatar from '@src/Components/Layout/Avatar';
import React from 'react';
import ModalUpdateProfile from '../ModalUpdateProfile';
const Nav = () => {
    const socket = useSocket();
    const user = useUser();
    const { setAccessToken, setRefreshToken } = useAuth();
    const showListGroup = useState(showListGroupState);
    const showModalFriends = useState(showFriendsState);
    const [isShow, setShow] = React.useState(false);
    return (
        <>
            <div className={styles.nav}>
                <div className={styles.navBar}>
                    <button onClick={() => showListGroup.set(!showListGroup.get())}>
                        {
                            showListGroup.get() ? (
                                <IconLeftArrow />
                            ) : (
                                <IconRightArrow />
                            )
                        }
                    </button>
                </div>
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
                        socket.disconnect();
                    }}>
                        <IconLogout />
                    </button>
                </div>
            </div>
            <ModalUpdateProfile isShow={isShow} onClose={() => setShow(false)} />

        </>
    )
}

export default Nav;