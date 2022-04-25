import Avatar from '@src/Components/Layout/Avatar';
import Button from '@src/Components/Layout/Button';
import styles from './modal-add-friends.module.scss'

const User = () => {
  return (
    <div className={styles.item}>
      <Avatar
        width={48}
        height={48}
        src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random() * 25 + 65))}&background=random`}
        alt="Avatar"
      />
      <div className={styles.user}>
        <div className={styles.name}>Vũ Bá Hướng</div>
        <div className={styles.status}>Tôi rất vui khi chúng ta trở thành bạn bè</div>
      </div>
      <div className={styles.action}>
        <Button variable="outline-primary"> Kết bạn </Button>
      </div>
    </div>
  )
}

export default User;