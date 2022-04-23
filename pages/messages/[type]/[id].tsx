import InputBox from '@src/Components/Messenger/BoxMessage/InputBox';
import ListMessage from '@src/Components/Messenger/BoxMessage/ListMessage';
import withAuth from '@src/Components/withAuth';
import IconSettings from '@src/styles/svg/settings.svg';
import IconUser3 from '@src/styles/svg/user3.svg';
import styles from './message.module.scss';

const Message = () => {
	const isGroup = true;

  return (
    <>
      <div className={styles.nav}>
        <div className={styles.navLeft}>
          <div className={styles.avatar}>
            <img
              src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random() * 25 + 65))}&background=random`}
              alt="avatar"
            />
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.title}>Đây là tên Grouppppppppppppppppppppppppppppppppppppppppppppppppppppppp</div>
            <div className={styles.onlineStatus}>
              {isGroup ? (
                <>
                  <span><IconUser3 /> </span>
                  <span> 1000 thành viên </span>
                </>
              ) : 'Đang hoạt động'}
            </div>
          </div>
        </div>
        <div className={styles.navRight}>
          <button>
            <IconSettings />
          </button>
        </div>
      </div>
      <ListMessage />
      <InputBox />
    </>
  );
}

export default withAuth(Message);