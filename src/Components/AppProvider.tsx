import React, { useEffect } from 'react';
import { useState } from '@hookstate/core';

import useAuth from '@src/hooks/useAuth';
import useUser from '@src/hooks/useUser';
import Loading from './Layout/Loading';
import ModalAddFriends from './Messenger/ModalAddFriends';
import Messenger from './Messenger';
import useSocket, { SocketContext } from '@src/hooks/useSocket';
import { useProccessSocket } from '@src/hooks/useProccessSocket';

const AppProvider = ({ children }) => {
    const { isAuth } = useAuth();
    const socket = useSocket();
    const user = useUser();
    const processSocket = useProccessSocket(socket);
    const loadingState = useState(true);


    const getUser = async () => {
        try {
            loadingState.set(true);
            await user.getCurrentUser();
            loadingState.set(false);
        } catch (error) {
            console.log(error);
            loadingState.set(false);
        }
    }
    useEffect(() => {
        if (isAuth) getUser();
        else loadingState.set(false);
    }, [isAuth]);

    useEffect(() => {
        processSocket();
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