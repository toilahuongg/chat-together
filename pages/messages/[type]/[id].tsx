import { useState } from '@hookstate/core';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Avatar from '@src/Components/Layout/Avatar';
import InputBox from '@src/Components/Messenger/BoxMessage/InputBox';
import ListMessage from '@src/Components/Messenger/BoxMessage/ListMessage';
import withAuth from '@src/Components/withAuth';
import { showGroupSettingState } from '@src/hooks/useGroupSetting';
import IconSettings from '@src/styles/svg/settings.svg';
import IconUser3 from '@src/styles/svg/user3.svg';

import styles from './message.module.scss';
import useListGroup, { useGroup } from '@src/hooks/useListGroup';
import { useListUserOfGroup } from '@src/hooks/useFriends';
import useUser from '@src/hooks/useUser';
import Head from 'next/head';
import useListMessage from '@src/hooks/useListMessage';
import Loading from '@src/Components/Layout/Loading';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import IRoom from 'server/types/room.type';

const Message = () => {
  const router = useRouter();
  const { id, type } = router.query;
  const user = useUser();
  const instance = useFetchAuth();
  const showGroupSetting = useState(showGroupSettingState);
  const { findPrivateByUserID, findById } = useListGroup();
  const group = useGroup();
  const listUserOfGroup = useListUserOfGroup();
  const [loading, setLoading] = React.useState(false);
  const listMessage = useListMessage();
  const { name, name2, isGroup } = group.get();
  const groupName = isGroup ? name : name2[user._id.get() as string];
  useEffect(() => {
    showGroupSetting.set(true);
  }, []);
  useEffect(() => {
    listMessage.list.set([]);
    if (id && type) {
      (async () => {
        setLoading(true);
        let g: IRoom | undefined;
        if (type === 'r') {
          g = findById(id as string);
        } else {
          g = findPrivateByUserID(id as string);
        }
        if (!g) {
          router.push("/404");
          return;
        }
        const response = await instance.get(`/api/room/${g._id}/users`);
        listUserOfGroup.list.set(response.data);
        group.data.set(g);
        await listMessage.getListMessage(g._id);
        setLoading(false);
      })();
    }
  }, [id, type]);
  return (
    <>
      <Head>
        <title> {groupName || 'Chat together'} </title>
      </Head>
      {
        loading ? <Loading /> : (
          <>
            <div className={styles.group}>
              <div className={styles.nav}>
                <div className={styles.navLeft}>
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random() * 25 + 65))}&background=random`}
                    alt="avatar"
                    width={58}
                    height={58}
                  />
                  <div className={styles.infoGroup}>
                    <div className={styles.title}>{groupName}</div>
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
            </div>
            {
              showGroupSetting.get() && (
                <div className={styles.settings}>
                  Hello
                </div>
              )
            }
          </>
        )
      }
    </>
  );
}

export default withAuth(Message);