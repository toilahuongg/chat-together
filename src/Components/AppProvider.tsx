import React, { useEffect } from 'react';
import { useState } from '@hookstate/core';

import useAuth from '@src/hooks/useAuth';
import useUser from '@src/hooks/useUser';
import Loading from './Layout/Loading';
import ModalAddFriends from './Messenger/ModalAddFriends';
import Messenger from './Messenger';
import useSocket, { SocketContext } from '@src/hooks/useSocket';
import { useProccessSocket } from '@src/hooks/useProccessSocket';
import useListGroup from '@src/hooks/useListGroup';

const AppProvider = ({ children }) => {
    const { isAuth, setAccessToken, setRefreshToken } = useAuth();
    const socket = useSocket();
    const user = useUser();
    const processSocket = useProccessSocket(socket);
    const loadingState = useState(true);
    const { getListGroup } = useListGroup();

    const getUser = async () => {
        try {
            loadingState.set(true);
            await user.getCurrentUser();
            await getListGroup();
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
        processSocket();
        console.log(socket.id);
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