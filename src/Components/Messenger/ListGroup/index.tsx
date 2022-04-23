import IconSearch from '@src/styles/svg/search.svg';
import IconAddUser from '@src/styles/svg/add-user.svg';
import IconAddGroup from '@src/styles/svg/add-group.svg';
import styles from './list-group.module.scss';
import Group from './Group';

const ListGroup = () => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.wrapperHeader}>
                <div className={styles.header}>
                    <div className={styles.search}>
                        <span className={styles.iconSearch}><IconSearch /></span>
                        <input placeholder="Tìm kiếm..."/>
                    </div>
                    <button className={styles.iconAddUser}> <IconAddUser /> </button>
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
        </div>
    )
}

export default ListGroup;