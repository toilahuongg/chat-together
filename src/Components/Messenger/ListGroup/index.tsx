import IconSearch from '@src/styles/svg/search.svg';
import IconAddUser from '@src/styles/svg/add-user.svg';
import IconAddGroup from '@src/styles/svg/add-group.svg';
import styles from './list-group.module.scss';
import Group from './Group';
import ModalAddFriends from '../ModalAddFriends';
import { useState } from '@hookstate/core';

const ListGroup = () => {
    const showState = useState(false);
    return (
        <div className={styles.wrapper}>
            <div className={styles.wrapperHeader}>
                <div className={styles.header}>
                    <div className={styles.search}>
                        <span className={styles.iconSearch}><IconSearch /></span>
                        <input placeholder="Tìm kiếm..."/>
                    </div>
                    <button className={styles.iconAddUser} onClick={() => showState.set(true)}> <IconAddUser /> </button>
                    <button className={styles.IconAddGroup}> <IconAddGroup /> </button>
                </div>
            </div>
            <div className={styles.listGroup}>
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
                <Group />
            </div>
            <ModalAddFriends isShow={showState.get()} onClose={() => showState.set(false)} />
        </div>
    )
}

export default ListGroup;