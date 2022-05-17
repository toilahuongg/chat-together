import React, { useEffect } from 'react';
import { useState } from '@hookstate/core';

import useAuth from '@src/hooks/useAuth';
import useUser from '@src/hooks/useUser';
import Loading from './Layout/Loading';
import ModalAddFriends from './Messenger/ModalAddFriends';
import Messenger from './Messenger';
import useSocket, { SocketContext } from '@src/hooks/useSocket';
import { IUser } from 'server/types/user.type';
import { useFriends, useFriendsRequestSent, usePendingFriendsRequest } from '@src/hooks/useFriends';

const AppProvider = ({ children }) => {
    const { isAuth, setAccessToken, setRefreshToken } = useAuth();
    const socket = useSocket();
    const user = useUser();
    const friends = useFriends();
    const pendingFriendsRequest = usePendingFriendsRequest();
    const friendsRequestSent = useFriendsRequestSent();

    const loadingState = useState(true);
    const getUser = async () => {
        try {
            loadingState.set(true);
            await user.getCurrentUser();
            loadingState.set(false);
        } catch (error) {
            console.log(error);
            loadingState.set(false);
            setAccessToken('');
            setRefreshToken('');
        }
    }

    useEffect(() => {
        if (isAuth) getUser();
        else loadingState.set(false);
    }, [isAuth]);

    useEffect(() => {
        //* Start: Gửi lời mời kết bạn (A gửi lời mời kết bạn đến B)*//
        // 1. Người gửi đi
        socket.on('friend-request-sent', (userData: IUser) => {
            user.addFriendRequestSent(userData._id);
            friendsRequestSent.add(userData);
        });
        // 2. Người nhận
        socket.on('pending-friend-request', (userData: IUser) => {
            user.addPendingFriendRequest(userData._id);
            pendingFriendsRequest.add(userData);
        });
        //* End: Gửi lời mời kết bạn *//

        //* Start: Huỷ lời mời kết bạn đã gửi đi (A gửi lời mời kết bạn đến B, A huỷ lời mời) *//
        // 1. Các socket của A cập nhật
        socket.on('retake-friend-request-sent', ({ userID }) => {
            user.removeFriendRequestSent(userID);
            friendsRequestSent.delete(userID);
        });
        // 2. Các socket của B cập nhật
        socket.on('retake-pending-friend-request', ({ userID }) => {
            user.removePendingFriendRequest(userID);
            pendingFriendsRequest.delete(userID);
        });
        //* End: Huỷ lời mời kết bạn đã gửi đi *//

        //* Start: Chấp nhận lời mời kết bạn (B gửi lời mời kết bạn đến A, A đồng ý)*//
        // 1. Các socket của A cập nhật
        socket.on('accept-pending-friend-request', (userData: IUser) => {
            user.removePendingFriendRequest(userData._id);
            pendingFriendsRequest.delete(userData._id);
            user.addFriend(userData._id);
            friends.add(userData);
        });
        // 2. Các socket của B cập nhật
        socket.on('accept-friend-request-sent', (userData: IUser) => {
            user.removeFriendRequestSent(userData._id);
            friendsRequestSent.delete(userData._id);
            user.addFriend(userData._id);
            friends.add(userData);
        });
        //* End: Chấp nhận lời mời kết bạn *//

        //* Start: Không chấp nhận (B gửi lời mời kết bạn đến A, A không chấp nhận) *//
        // 1. Các socket của A cập nhật
        socket.on('denie-pending-friend-request', ({ userID }) => {
            user.removePendingFriendRequest(userID);
            pendingFriendsRequest.delete(userID);
        });
        // 2. Các socket của B cập nhật
        socket.on('denie-friend-request-sent', ({ userID }) => {
            user.removeFriendRequestSent(userID);
            friendsRequestSent.delete(userID);
        });
        //* End: Không chấp nhận *//

        //* Start: Huỷ kết bạn (A và B là bạn bè, A huỷ kế bạn) *//
        // 1. Các socket của A, B cập nhật
        socket.on('unfriend', ({ userID }) => {
            user.removeFriend(userID);
            friends.delete(userID);
        });
        //* End: Huỷ kết bạn *//
    }, []);
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