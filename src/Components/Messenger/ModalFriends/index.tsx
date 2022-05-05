import { useState } from '@hookstate/core';

import Button from '@src/Components/Layout/Button';
import Modal from '@src/Components/Layout/Modal';
import React, { useEffect, useRef } from 'react';
import Tabs from '@src/Components/Layout/Tabs';
import TextField from '@src/Components/Layout/TextField';
import useUser, { friendsSentState, friendsState, pendingFriendsState } from '@src/hooks/useUser';
import instance from '@src/helpers/instance';
import User from '../User';
import randomChars from 'server/helpers/randomChars';
import Loading from '@src/Components/Layout/Loading';

import IconSearch from '@src/styles/svg/search.svg';

type TProps = {
  isShow?: boolean,
  onClose?: () => void
}
const ModalFriends: React.FC<TProps> = ({
  isShow = false,
  onClose = () => { }
}) => {
  const userState = useUser();

  const pendingFriends = useState(pendingFriendsState);
  const friendsSent = useState(friendsSentState);
  const friends = useState(friendsState);


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
      if (!unmount.current) pendingFriends.set(data);
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
      if (!unmount.current) friendsSent.set(data);
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
      if (!unmount.current) friends.set(data);
      setLoadingFriend(false);
    })()
    return () => {
      unmount.current = true;
    }
  }, []);

  const handleUpdatePendingRequest = (userID: string, unaccept?: boolean) => {
    userState.removePendingFriendRequest(userID);
    const user = pendingFriends.find(({ _id }) => _id.get() === userID);
    if (!unaccept && user) {
      userState.friends.merge([userID]);
      friends.set(f => [...f, {...user.get()}])
    }
    pendingFriends.set(current => current.filter(({ _id }) => _id !== userID));
  }

  const handleUpdateFriendRequestSent = (userID: string) => {
    userState.removeFriendRequestSent(userID);
    friendsSent.set(current => current.filter(({ _id }) => _id !== userID));
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
            loadingPending ? <Loading /> : pendingFriends.map(user => (
              <User
                key={user._id.get() + randomChars(8)}
                type="pending-friends-request"
                data={user.get()}
                onUpdate={handleUpdatePendingRequest}
              />
            ))
          )}
          {selectedTab.get() === 'friends-request-sent' && (
            loadingSent ? <Loading /> : friendsSent.map(user => (
              <User
                key={user._id.get() + randomChars(8)}
                type="friends-request-sent"
                data={user.get()}
                isFriendRequestSent={true}
                onUpdate={handleUpdateFriendRequestSent}
              />
            ))
          )}
          {selectedTab.get() === 'friends' && (
            loadingSent ? <Loading /> : friends.map(user => (
              <User
                key={user._id.get() + randomChars(8)}
                type="friends"
                data={user.get()}
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