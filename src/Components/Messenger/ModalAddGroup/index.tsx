import { useState } from '@hookstate/core';

import Button from '@src/Components/Layout/Button';
import Modal from '@src/Components/Layout/Modal';
import React, { useEffect, useRef } from 'react';
import useListGroup from '@src/hooks/useListGroup';
import TextField from '@src/Components/Layout/TextField';
import useUser from '@src/hooks/useUser';
import User from '../User';
import Loading from '@src/Components/Layout/Loading';

import IconSearch from '@src/styles/svg/search.svg';
import { useFriends } from '@src/hooks/useFriends';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import useDebounce from '@src/hooks/useDebounce';
import { defaultGroup } from '@src/contants/group.contant';
import { toast } from 'react-toastify';
import useSocket from '@src/hooks/useSocket';

type TProps = {
  isShow: boolean,
  onClose: () => void
}
const ModalAddGroup: React.FC<TProps> = ({
  isShow = false,
  onClose = () => { }
}) => {
  const socket = useSocket();
  const instance = useFetchAuth();
  const userState = useUser();
  const listGroup = useListGroup();

  const friends = useFriends();
  const [loading, setLoading] = React.useState(false);
  const [loadingFriend, setLoadingFriend] = React.useState(false);

  const typingTextState = useState("");
  const group = useState(defaultGroup());
  const userIDs = group.userIDs.get();
  const unmount = useRef(false);
  const divRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(typingTextState.get(), 300);

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

  const handleAddGroup = async () => {
    try {
      setLoading(true);
      const response = await instance.post('/api/room', group.get(), {
        headers: {
          'x-exclude-socket-id': socket?.id!
        }
      });    
      listGroup.add(response.data);
      group.set(defaultGroup());
      onClose();
    } catch (error: any) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }

  }

  return (
    <Modal isShow={isShow} onClose={onClose} size="lg">
      <Modal.Header>
        Tạo nhóm
      </Modal.Header>
      <Modal.Body>
        <TextField label="Tên nhóm" placeholder="Nhập tên nhóm..." value={group.name.get()} onChange={val => group.name.set(val)} plain />
        <TextField label="Thêm bạn vào nhóm" icon={<IconSearch />} placeholder="Tìm kiếm..." value={typingTextState.get()} onChange={val => typingTextState.set(val)} plain />
        <div ref={divRef} style={{ height: 300, overflow: "auto" }}>
          {loadingFriend ? <Loading /> : friends.get().filter(({ fullname }) => fullname.includes(debouncedSearchTerm)).map(user => (
            <User
              key={user._id}
              type="checkbox"
              data={user}
              isChecked={userIDs.includes(user._id)}
              onUpdate={(userID) => group.userIDs.set(u => {
                const idx = u.indexOf(userID);
                if (idx >= 0) u.splice(idx, 1);
                else u.push(userID);
                return u;
              })}
            />
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button onClick={onClose}> Đóng </Button>
        <Button onClick={handleAddGroup} variable="primary" loading={loading}> Tạo </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalAddGroup;