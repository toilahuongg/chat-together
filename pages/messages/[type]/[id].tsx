import { useState } from '@hookstate/core';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Avatar from '@src/Components/Layout/Avatar';
import InputBox from '@src/Components/Messenger/BoxMessage/InputBox';
import ListMessage from '@src/Components/Messenger/BoxMessage/ListMessage';
import withAuth from '@src/Components/withAuth';
import { showGroupSettingState } from '@src/hooks/useGroupSetting';
import GroupSettings from '@src/Components/Messenger/GroupSettings';
import useListGroup, { useGroup } from '@src/hooks/useListGroup';
import { useListUserOfGroup } from '@src/hooks/useFriends';
import useUser from '@src/hooks/useUser';
import useListMessage from '@src/hooks/useListMessage';
import Loading from '@src/Components/Layout/Loading';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import IRoom from 'server/types/room.type';

import IconUser3 from '@src/styles/svg/user3.svg';
import IconSettings from '@src/styles/svg/settings.svg';
import styles from './message.module.scss';

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
  const { name, infoUsers, isGroup, avatar } = group.get();
  const groupName = isGroup ? name : infoUsers[user._id.get() as string]?.fullname;
  const groupAvatar = isGroup ? avatar : infoUsers[user._id.get() as string]?.avatar;
  useEffect(() => {
    showGroupSetting.set(true);
  }, []);
  useEffect(() => {
    listMessage.list.set([]);
    const axiosCancelSource = axios.CancelToken.source();
    if (id && type) {
      (async () => {
        try {
          setLoading(true);
          let g: IRoom | null;
          if (type === 'r') {
            g = await instance.get(`/api/room/${id}`, { cancelToken: axiosCancelSource.token }).then(res => res.data);
          } else {
            g = await instance.get(`/api/room/${id}/private`, { cancelToken: axiosCancelSource.token }).then(res => res.data);
          }
          if (!g) {
            router.push("/");
            return;
          }
          group.data.set(g);
          const response = await instance.get(`/api/room/${g._id}/users`, { cancelToken: axiosCancelSource.token });
          listUserOfGroup.list.set(response.data);
          setLoading(false);
        } catch (error) {
          console.log(error);
          router.push('/');
        }
      })();
    }

    return () => {
      axiosCancelSource.cancel();
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
                    src={groupAvatar || `/images/group-default.jpg`}
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
                  <GroupSettings />
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