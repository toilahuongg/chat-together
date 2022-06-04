import * as hookstate from "@hookstate/core";
import Accordion from "@src/Components/Layout/Accordion";
import Avatar from '@src/Components/Layout/Avatar';
import { classNames } from '@src/helpers/classNames';
import { useListUserOfGroup } from '@src/hooks/useFriends';
import { showGroupSettingState } from "@src/hooks/useGroupSetting";
import { useGroup } from "@src/hooks/useListGroup";
import useUser from '@src/hooks/useUser';
import useWindowSize from "@src/hooks/useWindowSize";
import Back from '@src/styles/svg/arrow-left.svg';
import { useRouter } from 'next/router';
import { useState } from "react";
import ModalAddMember from './ModalAddMember';
import ModalChangeAvatar from "./ModalChangeAvatar";
import ModalRename from './ModalRename';

import styles from './group-settings.module.scss';

const GroupSettings = () => {
  const size = useWindowSize();
  const router = useRouter();
  const group = useGroup();
  const userState = useUser();
  const showGroupSetting = hookstate.useState(showGroupSettingState);
  const listUserOfGroup = useListUserOfGroup();
  const [isShowRename, setShowRename] = useState(false);
  const [isShowAvatar, setShowAvatar] = useState(false);
  const [isShowAddMember, setShowAddMember] = useState(false);
  return (
    <>
    {
      size.width < 1300 && (
        <div onClick={() => showGroupSetting.set(false)}><Back /> </div>
      )
    }
      <Accordion title="Tùy chỉnh nhóm">
        {group.data.get().isGroup && (
          <>
            <div className={styles.list}>
              <div className={styles.item} onClick={() => setShowRename(true)}>
                Đổi tên đoạn chat
              </div>
              <div className={styles.item} onClick={() => setShowAvatar(true)}>
                Thay đổi ảnh
              </div>
            </div>
            {isShowRename && <ModalRename isShow={isShowRename} onClose={() => setShowRename(false)} />}
            {isShowAvatar && <ModalChangeAvatar isShow={isShowAvatar} onClose={() => setShowAvatar(false)} />}
          </>
        )}
      </Accordion>
      {group.data.get().isGroup && (
        <Accordion title="Thành viên nhóm">
          <div className={classNames(styles, ['list', 'listUser'])}>
            {
              listUserOfGroup.list.get().map(user => (
                <div key={user._id} className={styles.item} onClick={() => (userState.data.get()._id !== user._id) && router.push('/messages/u/' + user._id)}>
                  <Avatar
                    src={user.avatar || '/images/avatar-default.jpg'}
                    width={36}
                    height={36}
                    alt=""
                  />
                  <div className={styles.fullname}> {user.fullname} </div>
                </div>
              ))
            }
          </div>
          <button className={styles.addMember} onClick={() => setShowAddMember(true)}> Thêm thành viên </button>
          {isShowAddMember && <ModalAddMember isShow={isShowAddMember} onClose={() => setShowAddMember(false)} />}
        </Accordion>
      )}
    </>
  )
}

export default GroupSettings;