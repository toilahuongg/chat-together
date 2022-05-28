import React, { useEffect, useMemo, useRef } from 'react';
import { useState } from '@hookstate/core';
import Group from './Group';
import ModalAddFriends from '../ModalAddFriends';
import useListGroup, { showListGroupState } from '@src/hooks/useListGroup';

import IconSearch from '@src/styles/svg/search.svg';
import IconAddUser from '@src/styles/svg/add-user.svg';
import IconAddGroup from '@src/styles/svg/add-group.svg';
import ModalAddGroup from '../ModalAddGroup';
import Loading from '@src/Components/Layout/Loading';
import useUser from '@src/hooks/useUser';

import styles from './list-group.module.scss';
import InfiniteScroll from '@src/Components/Layout/InfiniteScroll';

const ListGroup = () => {
    const user = useUser();
    const unmount = useRef(false);
    const showState = useState(false);
    const showAddGroup = useState(false);
    const [isLoading, setLoading] = React.useState(false);
    const [count, setCount] = React.useState(99);
    const showListGroup = useState(showListGroupState);
    const { get, updateReaders, getListGroup, list } = useListGroup();
    const fetchMoreData = async (lastTime: null | string = null) => {
        setLoading(true);
        const { count: c } = await getListGroup(lastTime) as { count: number };
        setCount(c);
        setLoading(false);
      }
      const lastTime = useMemo(() => {
        const length = list.length;
        return length ? list[length-1].createdAt.get() : null;
      }, [list]);
    React.useEffect(() => {
        return () => {
            unmount.current = true;
        };
    }, []);
    return (
        <div className={styles.wrapper} style={{ display: showListGroup.get() ? 'block' : 'none' }}>
            <div className={styles.wrapperHeader}>
                <div className={styles.header}>
                    <div className={styles.search}>
                        <span className={styles.iconSearch}><IconSearch /></span>
                        <input placeholder="Tìm kiếm..." />
                    </div>
                    <button className={styles.iconAddUser} onClick={() => !unmount.current && showState.set(true)}> <IconAddUser /> </button>
                    <button className={styles.IconAddGroup} onClick={() => !unmount.current && showAddGroup.set(true)}> <IconAddGroup /> </button>
                </div>
            </div>
            <div className={styles.listGroup}>
                <InfiniteScroll
                    next={() => fetchMoreData(lastTime)}
                    hasMore={list.length < count}
                    isLoading={isLoading}
                    loading={<Loading />}
                >
                    {get().length ? get().map(group => (
                        <Group
                            updateReaders={(id) => updateReaders(id, user._id.get())}
                            key={group._id}
                            data={group}
                            userID={user._id.get()}
                            />
                    )) : !isLoading && 'Không có group'}
                </InfiniteScroll>
            </div>
            <ModalAddFriends isShow={showState.get()} onClose={() => !unmount.current && showState.set(false)} />
            <ModalAddGroup isShow={showAddGroup.get()} onClose={() => !unmount.current && showAddGroup.set(false)} />
        </div>
    )
}

export default ListGroup;