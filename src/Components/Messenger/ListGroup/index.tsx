import React, { useEffect, useMemo, useRef } from 'react';
import { useState } from '@hookstate/core';
import Group from './Group';
import ModalAddFriends from '../ModalAddFriends';
import useListGroup, { showListGroupState, useTxtSearchGroup } from '@src/hooks/useListGroup';

import IconSearch from '@src/styles/svg/search.svg';
import IconAddUser from '@src/styles/svg/add-user.svg';
import IconAddGroup from '@src/styles/svg/add-group.svg';
import ModalAddGroup from '../ModalAddGroup';
import Loading from '@src/Components/Layout/Loading';
import useUser from '@src/hooks/useUser';

import styles from './list-group.module.scss';
import InfiniteScroll from '@src/Components/Layout/InfiniteScroll';
import useDebounce from '@src/hooks/useDebounce';
import useWindowSize from '@src/hooks/useWindowSize';
import { useRouter } from 'next/router';

const ListGroup = () => {
	const size = useWindowSize();
	const user = useUser();
	const unmount = useRef(false);
	const router = useRouter();
	let display = 'block';
	const showState = useState(false);
	const showAddGroup = useState(false);
	const [isLoading, setLoading] = React.useState(false);
	const [count, setCount] = React.useState(99);
	const showListGroup = useState(showListGroupState);
	if (size.width > 768) {
		display = showListGroup.get() ? 'block' : 'none';
	} else {
		display = router.pathname === '/' ? 'block' : 'none'
	}
	const { get, updateReaders, getListGroup, list } = useListGroup();
	const searchTextState = useTxtSearchGroup();
	const typingTextState = useState("");
	const debouncedSearchTerm = useDebounce(typingTextState.get(), 300);
	const fetchMoreData = async (lastTime: null | string = null, name: string) => {
		setLoading(true);
		const { count: c } = await getListGroup(lastTime, name) as { count: number };
		setCount(c);
		setLoading(false);
	}
	const lastTime = useMemo(() => {
		const length = list.length;
		return length ? list[length - 1].createdAt.get() : null;
	}, [list]);
	useEffect(
		() => {
			if (searchTextState.get() !== typingTextState.get()) {
				searchTextState.set(debouncedSearchTerm);
				list.set([]);
				fetchMoreData(null, debouncedSearchTerm);
			}
		},
		[debouncedSearchTerm]
	);

	return (
		<div className={styles.wrapper} style={{ display }}>
			<div className={styles.wrapperHeader}>
				<div className={styles.header}>
					<div className={styles.search}>
						<span className={styles.iconSearch}><IconSearch /></span>
						<input placeholder="Tìm kiếm..." value={typingTextState.get()} onChange={e => typingTextState.set(e.target.value)} />
					</div>
					<button className={styles.iconAddUser} onClick={() => !unmount.current && showState.set(true)}> <IconAddUser /> </button>
					<button className={styles.IconAddGroup} onClick={() => !unmount.current && showAddGroup.set(true)}> <IconAddGroup /> </button>
				</div>
			</div>
			<div className={styles.listGroup}>
				<InfiniteScroll
					next={() => fetchMoreData(lastTime, debouncedSearchTerm)}
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
			{showState.get() && <ModalAddFriends isShow={showState.get()} onClose={() => !unmount.current && showState.set(false)} />}
			{showAddGroup.get() && <ModalAddGroup isShow={showAddGroup.get()} onClose={() => !unmount.current && showAddGroup.set(false)} />}
		</div>
	)
}

export default ListGroup;