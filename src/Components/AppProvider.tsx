import React, { useContext, createContext, useEffect, useCallback } from 'react';
import socketIOClient, { Socket } from 'socket.io-client';

import useAuth from '@src/hooks/useAuth';
import useUser from '@src/hooks/useUser';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { useState } from '@hookstate/core';
import Loading from './Layout/Loading';
import ModalAddFFriends from './Messenger/ModalAddFriends';
import Messenger from './Messenger';

const SocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(undefined)

export const useSocket = () => {
    return useContext(SocketContext)
}


const AppProvider = ({ children }) => {
    const { isAuth, setAccessToken, setRefreshToken } = useAuth();
    const user = useUser();
    const loadingState = useState(true);
    const [socket, setSocket] = React.useState<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(undefined)
    const getUser = useCallback(async () => {
        try {
            loadingState.set(true);
            const data = await user.getCurrentUser();
            socket?.emit("logged-in", data._id);
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
        if (socket && isAuth) {
            socket.on("users-online", (data) => console.log(data));
            getUser();
        } else loadingState.set(false);
    }, [socket, isAuth]);

    return loadingState.get() ? <Loading /> : (
        <SocketContext.Provider value={socket}>
            { isAuth ? (
                <Messenger>
                    {children}
                </Messenger>
            ) : children }
            { isAuth && !loadingState.get() && user.friends.length < 5 && (
              <ModalAddFFriends isRecommend/>
            )}
        </SocketContext.Provider>
    );
}

export default AppProvider;