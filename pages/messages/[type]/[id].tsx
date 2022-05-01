import { useState } from '@hookstate/core';
import Avatar from '@src/Components/Layout/Avatar';
import InputBox from '@src/Components/Messenger/BoxMessage/InputBox';
import ListMessage from '@src/Components/Messenger/BoxMessage/ListMessage';
import withAuth from '@src/Components/withAuth';
import { showGroupSettingState } from '@src/hooks/useGroupSetting';
import IconSettings from '@src/styles/svg/settings.svg';
import IconUser3 from '@src/styles/svg/user3.svg';
import { useEffect } from 'react';
import styles from './message.module.scss';

const Message = () => {
	const isGroup = true;
  const showGroupSetting = useState(showGroupSettingState);
  useEffect(() => {
    showGroupSetting.set(true);
  }, []);
  return (
    <>
      <div className={styles.nav}>
        <div className={styles.navLeft}>
          <Avatar
            src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random() * 25 + 65))}&background=random`}
            alt="avatar"
            width={58}          
            height={58}          
          />
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
          <button className={showGroupSetting.get() ? styles.active : ""} onClick={() => showGroupSetting.set(!showGroupSetting.get())}>
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