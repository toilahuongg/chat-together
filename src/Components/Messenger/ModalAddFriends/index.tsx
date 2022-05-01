import { useState } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';

import TextField from '@src/Components/Layout/TextField';
import Button from '@src/Components/Layout/Button';
import Modal from '@src/Components/Layout/Modal';
import Checkbox from '@src/Components/Layout/Checkbox';
import User from './User';
import instance from '@src/helpers/instance';
import { IUser } from 'server/types/user.type';

import IconSearch from '@src/styles/svg/search.svg';
import React, { useEffect, useMemo, useRef } from 'react';
import InfiniteScroll from '@src/Components/Layout/InfiniteScroll';
import randomChars from 'server/helpers/randomChars';
import Loading from '@src/Components/Layout/Loading';

type TProps = {
  isRecommend?: boolean,
  isShow?: boolean,
  onClose?: () => void
}
const ModalFriends: React.FC<TProps> = ({
  isRecommend = false,
  isShow = false,
  onClose = () => { }
}) => {
  const unmount = useRef(false);
  const divRef = useRef<HTMLDivElement>(null);
  const hiddenRecommendFriends = useState(false);
  const checkboxState = useState(false);
  if (typeof window !== 'undefined') hiddenRecommendFriends.attach(Persistence('hidden-recommend-friends'));
  const showState = useState(JSON.parse(JSON.stringify(hiddenRecommendFriends.value)));

  const handleClose = () => {
    showState.set(true)
    if (checkboxState.get()) hiddenRecommendFriends.set(true);
  }
  const typingTextState = useState("");
  const searchTextState = useState("");
  const [count, setCount] = React.useState(99);
  const listUserState = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);

  const lastId = useMemo(() => {
    const length = listUserState.length;
    return length ? listUserState[length - 1]._id.get() : null;
  }, [listUserState]);

  const fetchMoreData = async (lastId: null | string = null) => {
    try {
      setLoadingUsers(true);
      const response = await instance.get(`/api/user/search?fullname=${searchTextState.get()}${lastId ? `&lastId=${lastId}` : ''}&isNotFriend=true`);
      const { count, users } = response.data;
      setCount(count)
      if (!unmount.current) listUserState.merge(users);
      setLoadingUsers(false);
    } catch (error) {
      console.log(error);
    }
  }

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    unmount.current = false;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(async () => {
      if (searchTextState.get() !== typingTextState.get()) {
        searchTextState.set(typingTextState.get());
        setLoadingUsers(true);
        const response = await instance.get(`/api/user/search?fullname=${searchTextState.get()}&isNotFriend=true`);
        const { count, users } = response.data;
        setCount(count)
        listUserState.set(users);
        setLoadingUsers(false);
        if (divRef.current) divRef.current.scrollTop = 0;
      }
    }, 300);
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      unmount.current = true;
    }
  }, [typingTextState.get(), divRef]);

  return (
    <Modal isShow={!isRecommend ? isShow : !showState.get()} onClose={!isRecommend ? onClose : handleClose} size="md">
      <Modal.Header>
        Hãy thêm bạn để trò truyện
      </Modal.Header>
      <Modal.Body>
        <TextField icon={<IconSearch />} placeholder="Tìm kiếm..." value={typingTextState.get()} onChange={val => typingTextState.set(val)} />
        <div ref={divRef} style={{ height: 300, overflow: "auto" }}>
          <InfiniteScroll
            next={() => fetchMoreData(lastId)}
            hasMore={listUserState.length < count}
            isLoading={loadingUsers}
            loading={<Loading />}
          >
            {listUserState.map(user => <User key={user._id.get() + randomChars(8)} data={user.get()} />)}
          </InfiniteScroll>
        </div>

      </Modal.Body>
      <Modal.Footer align={isRecommend ? "between" : "right"}>
        {
          isRecommend && (
            <Checkbox
              type="checkbox"
              checked={checkboxState.get()}
              onChange={() => checkboxState.set(!checkboxState.get())}
              label="Không hiển thị lại"
            />
          )
        }
        <Button onClick={!isRecommend ? onClose : handleClose}> Đóng </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalFriends;