import React, { useContext, createContext, useEffect, useCallback } from 'react';
import socketIOClient, { Socket } from 'socket.io-client';

import useAuth from '@src/hooks/useAuth';
import useUser from '@src/hooks/useUser';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { useState } from '@hookstate/core';
import Loading from './Layout/Loading';
import ModalAddFriends from './Messenger/ModalAddFriends';
import Messenger from './Messenger';
import INotification from 'server/types/notification.type';
import { updatePendingFriendsState } from '@src/hooks/useFriends';
import randomChars from 'server/helpers/randomChars';

const SocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(undefined)

export const useSocket = () => {
    return useContext(SocketContext)
}


const AppProvider = ({ children }) => {
    const { accessToken, isAuth, setAccessToken, setRefreshToken } = useAuth();
    const user = useUser();
    const updatePendingFriends = useState(updatePendingFriendsState);
    const loadingState = useState(true);
    const [socket, setSocket] = React.useState<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(undefined)
    const getUser = useCallback(async () => {
        try {
            loadingState.set(true);
            await user.getCurrentUser();
            socket?.emit("logged-in", accessToken);
            loadingState.set(false);
        } catch (error) {
            console.log(error);
            loadingState.set(false);
            setAccessToken('');
            setRefreshToken('');
        }
    }, [socket]);

    useEffect(() => {
        setSocket(socketIOClient(process.env.NEXT_PUBLIC_APP_URL || ''));
    }, [])

    useEffect(() => {
        if (socket) {
            socket.on('new-notification', (noti: INotification) => {
                if (noti.infoNoti.nt === 'friend-request') {
                    user.pendingFriendRequest.merge([{ userID: noti.infoNoti.userSent, notificationID: noti._id }]);
                    updatePendingFriends.set(randomChars(8));
                }
            });
            if (isAuth) getUser();
        }
        else loadingState.set(false);
    }, [socket, isAuth, getUser]);

    return loadingState.get() ? <Loading fullScreen/> : (
        <SocketContext.Provider value={socket}>
            { isAuth ? (
                <Messenger>
                    {children}
                </Messenger>
            ) : children }
            { isAuth && user.friends.length < 5 && (
              <ModalAddFriends isRecommend/>
            )}
        </SocketContext.Provider>
    );
}

export default AppProvider;