import instance from '@src/helpers/instance';
import useAuth from '@src/hooks/useAuth';
import React, { useContext, createContext, useState, useEffect } from 'react';
import socketIOClient, { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const SocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(undefined)

export const useSocket = () => {
    return useContext(SocketContext)
}


const SocketProvider = ({ children }) => {
    const isAuth = useAuth();
    const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(undefined)

    useEffect(() => {
        setSocket(socketIOClient(process.env.NEXT_PUBLIC_APP_URL || ''));
    }, [])

    useEffect(() => {
        if (socket && isAuth) {
          socket.on("users-online", (data) => console.log(data));
          (async () => {
            const response = await instance.get('/api/user/profile');
            const { _id } = response.data;
            socket.emit("logged-in", _id);
          })()
        }
    }, [socket, isAuth]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketProvider;