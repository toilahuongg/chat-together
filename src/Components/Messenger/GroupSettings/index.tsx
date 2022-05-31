import { useState } from 'react';
import Accordion from "@src/Components/Layout/Accordion"
import ModalRename from './ModalRename';
import { useGroup } from "@src/hooks/useListGroup";
import ModalChangeAvatar from "./ModalChangeAvatar";

import styles from './group-settings.module.scss';
const GroupSettings = () => {
  const group = useGroup();
  const [isShowRename, setShowRename] = useState(false);
  const [isShowAvatar, setShowAvatar] = useState(false);
  return <>
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
  </>
}

export default GroupSettings;