import { useState } from '@hookstate/core';

import Button from '@src/Components/Layout/Button';
import Modal from '@src/Components/Layout/Modal';
import React, { useEffect, useRef } from 'react';
import Tabs from '@src/Components/Layout/Tabs';
import TextField from '@src/Components/Layout/TextField';
import useUser from '@src/hooks/useUser';
import instance from '@src/helpers/instance';
import User from '../User';
import randomChars from 'server/helpers/randomChars';
import Loading from '@src/Components/Layout/Loading';

import IconSearch from '@src/styles/svg/search.svg';
import { useFriends, useFriendsRequestSent, usePendingFriendsRequest } from '@src/hooks/useFriends';

type TProps = {
  isShow?: boolean,
  onClose?: () => void
}
const ModalFriends: React.FC<TProps> = ({
  isShow = false,
  onClose = () => { }
}) => {
  const userState = useUser();

  const friends = useFriends();
  const pendingFriendsRequest = usePendingFriendsRequest(); 
  console.log(pendingFriendsRequest);
  const friendsRequestSent = useFriendsRequestSent();


  const [loadingPending, setLoadingPending] = React.useState(false);
  const [loadingSent, setLoadingSent] = React.useState(false);
  const [loadingFriend, setLoadingFriend] = React.useState(false);
  const tabs = [
    {
      id: 'pending-friends-request',
      label: `Đang chờ xác nhận (${userState.pendingFriendRequest.length})`
    },
    {
      id: 'friends-request-sent',
      label: `Đã gửi đi (${userState.friendRequestSent.length})`
    },
    {
      id: 'friends',
      label: `Bạn bè (${userState.friends.length})`
    },
  ]
  const selectedTab = useState('pending-friends-request');

  const typingTextState = useState("");
  const searchTextState = useState("");
  const unmount = useRef(false);
  const divRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    unmount.current = false;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(async () => {
      if (searchTextState.get() !== typingTextState.get()) {
        searchTextState.set(typingTextState.get());
        if (divRef.current) divRef.current.scrollTop = 0;
      }
    }, 300);
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      unmount.current = true;
    }
  }, [typingTextState.get(), divRef]);

  useEffect(() => {
    unmount.current = false;
    const list = userState.pendingFriendRequest.map(userID => userID.get());
    (async () => {
      setLoadingPending(true);
      const response = await instance.post('/api/user/profile-list', { ids: list });
      const data = response.data;
      if (!unmount.current) pendingFriendsRequest.list.set(data);
      setLoadingPending(false);
    })()
    return () => {
      unmount.current = true;
    }
  }, []);

  useEffect(() => {
    unmount.current = false;
    const list = userState.friendRequestSent.map(userID => userID.get());
    (async () => {
      setLoadingSent(true);
      const response = await instance.post('/api/user/profile-list', { ids: list });
      const data = response.data;
      if (!unmount.current) friendsRequestSent.list.set(data);
      setLoadingSent(false);
    })()
    return () => {
      unmount.current = true;
    }
  }, []);

  useEffect(() => {
    unmount.current = false;
    const list = userState.friends.get();
    (async () => {
      setLoadingFriend(true);
      const response = await instance.post('/api/user/profile-list', { ids: list });
      const data = response.data;
      if (!unmount.current) friends.list.set(data);
      setLoadingFriend(false);
    })()
    return () => {
      unmount.current = true;
    }
  }, []);

  const handleUpdatePendingRequest = (userID: string, unaccept?: boolean) => {
    userState.removePendingFriendRequest(userID);
    const user = pendingFriendsRequest.findById(userID);
    if (!unaccept && user) {
      userState.friends.merge([userID]);
      friends.list.set(f => [...f, {...user.get()}])
    }
    pendingFriendsRequest.delete(userID);
  }

  const handleUpdateFriendRequestSent = (userID: string) => {
    userState.removeFriendRequestSent(userID);
    friendsRequestSent.delete(userID);
  }
  return (
    <Modal isShow={isShow} onClose={onClose} size="lg">
      <Modal.Header>
        Bạn bè
      </Modal.Header>
      <Modal.Body>
        <Tabs
          tabs={tabs}
          selected={selectedTab.get()}
          onSelect={(selected) => {
            selectedTab.set(selected);
            typingTextState.set("");
          }}
        />
        <TextField icon={<IconSearch />} placeholder="Tìm kiếm..." value={typingTextState.get()} onChange={val => typingTextState.set(val)} />
        <div ref={divRef} style={{ height: 300, overflow: "auto" }}>
          {selectedTab.get() === 'pending-friends-request' && (
            loadingPending ? <Loading /> : pendingFriendsRequest.getList.map(user => (
              <User
                key={user._id + randomChars(8)}
                type="pending-friends-request"
                data={user}
                onUpdate={handleUpdatePendingRequest}
              />
            ))
          )}
          {selectedTab.get() === 'friends-request-sent' && (
            loadingSent ? <Loading /> : friendsRequestSent.getList.map(user => (
              <User
                key={user._id + randomChars(8)}
                type="friends-request-sent"
                data={user}
                isFriendRequestSent={true}
                onUpdate={handleUpdateFriendRequestSent}
              />
            ))
          )}
          {selectedTab.get() === 'friends' && (
            loadingSent ? <Loading /> : friends.getList.map(user => (
              <User
                key={user._id + randomChars(8)}
                type="friends"
                data={user}
                onUpdate={() => { }}
              />
            ))
          )}
        </div>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button onClick={onClose}> Đóng </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalFriends;