import { useState } from '@hookstate/core';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Avatar from '@src/Components/Layout/Avatar';
import InputBox from '@src/Components/Messenger/BoxMessage/InputBox';
import ListMessage from '@src/Components/Messenger/BoxMessage/ListMessage';
import withAuth from '@src/Components/withAuth';
import { showGroupSettingState } from '@src/hooks/useGroupSetting';
import IconSettings from '@src/styles/svg/settings.svg';
import IconUser3 from '@src/styles/svg/user3.svg';

import styles from './message.module.scss';
import { useGroup } from '@src/hooks/useListGroup';
import { useListUserOfGroup } from '@src/hooks/useFriends';
import useUser from '@src/hooks/useUser';

const Message = () => {
  const user = useUser();
  const showGroupSetting = useState(showGroupSettingState);
  const group = useGroup();
  const listUserOfGroup = useListUserOfGroup();
  const { name, name2, isGroup } = group.get();
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
            <div className={styles.title}>{ isGroup ? name : name2[user._id.get() as string]}</div>
            <div className={styles.onlineStatus}>
              {isGroup ? (
                <>
                  <span><IconUser3 /> </span>
                  <span> {listUserOfGroup.list.length} thành viên </span>
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