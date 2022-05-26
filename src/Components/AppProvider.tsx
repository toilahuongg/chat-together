import React, { useEffect } from 'react';
import { useState } from '@hookstate/core';
import { useRouter } from 'next/router';

import useAuth from '@src/hooks/useAuth';
import useUser from '@src/hooks/useUser';
import { useListUserOfGroup } from '@src/hooks/useFriends';
import Loading from './Layout/Loading';
import ModalAddFriends from './Messenger/ModalAddFriends';
import Messenger from './Messenger';
import useSocket, { SocketContext } from '@src/hooks/useSocket';
import { useProccessSocket } from '@src/hooks/useProccessSocket';
import useListGroup, { useGroup } from '@src/hooks/useListGroup';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import IRoom from 'server/types/room.type';

const AppProvider = ({ children }) => {
    const instance = useFetchAuth();
    const router = useRouter();
    const { id, type } = router.query;
    const { isAuth, setAccessToken, setRefreshToken } = useAuth();
    const socket = useSocket();
    const user = useUser();
    const processSocket = useProccessSocket(socket);
    const loadingState = useState(true);
    const { getListGroup, findPrivateByUserID, findById } = useListGroup();
    const listUserOfGroup = useListUserOfGroup();
    const group = useGroup();

    const getUser = async () => {
        try {
            loadingState.set(true);
            await Promise.all([user.getCurrentUser(), getListGroup()]);
            if (id && type) {
                let g: IRoom|undefined;
                if (type === 'r') {
                    g = findById(id as string);
                } else {
                    g = findPrivateByUserID(id as string);
                }
                if (!g) {
                    router.push("/404");
                    return;
                }
                const response = await instance.get(`/api/room/${g._id}/users`);
                listUserOfGroup.list.set(response.data);
                group.data.set(g); 
            }
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
    }, [isAuth, id, type]);

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