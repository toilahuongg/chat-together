import React, { useEffect } from 'react';

import useAuth from '@src/hooks/useAuth';
import useUser, { friendsSentState, friendsState, pendingFriendsState } from '@src/hooks/useUser';
import { useState } from '@hookstate/core';
import Loading from './Layout/Loading';
import ModalAddFriends from './Messenger/ModalAddFriends';
import Messenger from './Messenger';
import useSocket, { SocketContext } from '@src/hooks/useSocket';
import { IUser } from 'server/types/user.type';

const AppProvider = ({ children }) => {
    const { accessToken, isAuth, setAccessToken, setRefreshToken } = useAuth();
    const socket = useSocket();
    const user = useUser();
    const friends = useState(friendsState);
    const friendsSent = useState(friendsSentState);
    const pendingFriends = useState(pendingFriendsState);

    const loadingState = useState(true);
    const getUser = async () => {
        try {
            loadingState.set(true);
            await user.getCurrentUser();
            socket.emit("logged-in", accessToken);
            loadingState.set(false);
        } catch (error) {
            console.log(error);
            loadingState.set(false);
            setAccessToken('');
            setRefreshToken('');
        }
    }

    useEffect(() => {
        if (isAuth && socket.connected) {
            getUser();
            //* Start: Gửi lời mời kết bạn (A gửi lời mời kết bạn đến B)*//
            // 1. Người gửi đi
            socket.on('friend-request-sent', (userData: IUser) => {
                user.addFriendRequestSent(userData._id);
                friendsSent.merge([userData]);
            });
            // 2. Người nhận
            socket.on('pending-friend-request', (userData: IUser) => {
                user.addPendingFriendRequest(userData._id);
                pendingFriends.merge([userData]);
            });
            //* End: Gửi lời mời kết bạn *//

            //* Start: Huỷ lời mời kết bạn đã gửi đi (A gửi lời mời kết bạn đến B, A huỷ lời mời) *//
            // 1. Các socket của A cập nhật
            socket.on('retake-friend-request-sent', ({ userID }) => {
                user.removeFriendRequestSent(userID);
                friendsSent.set(current => current.filter(({ _id }) => _id !== userID));
            });
            // 2. Các socket của B cập nhật
            socket.on('retake-pending-friend-request', ({ userID }) => {
                user.removePendingFriendRequest(userID);
                pendingFriends.set(current => current.filter(({ _id }) => _id !== userID));
            });
            //* End: Huỷ lời mời kết bạn đã gửi đi *//

            //* Start: Chấp nhận lời mời kết bạn (B gửi lời mời kết bạn đến A, A đồng ý)*//
            // 1. Các socket của A cập nhật
            socket.on('accept-pending-friend-request', (userData: IUser) => {
                user.removePendingFriendRequest(userData._id);
                pendingFriends.set(current => current.filter(({ _id }) => _id !== userData._id));
                user.friends.merge([userData._id]);
                friends.merge([userData]);
            });
            // 2. Các socket của B cập nhật
            socket.on('accept-friend-request-sent', (userData: IUser) => {
                user.removeFriendRequestSent(userData._id);
                friendsSent.set(current => current.filter(({ _id }) => _id !== userData._id));
                user.friends.
                    merge([userData._id]);
                friends.merge([userData]);
            });
            //* End: Chấp nhận lời mời kết bạn *//

            //* Start: Không chấp nhận (B gửi lời mời kết bạn đến A, A không chấp nhận) *//
            // 1. Các socket của A cập nhật
            socket.on('denie-pending-friend-request', ({ userID }) => {
                user.removePendingFriendRequest(userID);
                pendingFriends.set(current => current.filter(({ _id }) => _id !== userID));
            });
            // 2. Các socket của B cập nhật
            socket.on('denie-friend-request-sent', ({ userID }) => {
                user.removeFriendRequestSent(userID);
                friendsSent.set(current => current.filter(({ _id }) => _id !== userID));
            });
            //* End: Không chấp nhận *//
        }
        else loadingState.set(false);
    }, [isAuth, socket]);

    return loadingState.get() ? <Loading fullScreen /> : (
        <SocketContext.Provider value={socket}>
            {isAuth ? (
                <Messenger>
                    {children}
                </Messenger>
            ) : children}
            {isAuth && user.friends.length < 5 && (
                <ModalAddFriends isRecommend />
            )}
        </SocketContext.Provider>
    );
}

export default AppProvider;