import Accordion from "@src/Components/Layout/Accordion"
import ModalRename from './ModalRename';
import { useState } from 'react';

import styles from './group-settings.module.scss';
const GroupSettings = () => {
  const [isShowRename, setShowRename] = useState(false);
  return <>
    <Accordion title="Tùy chỉnh nhóm">
      <div className={styles.list}>
        <div className={styles.item} onClick={() => setShowRename(true)}>
          Đổi tên đoạn chat
        </div>
        <div className={styles.item} onClick={() => setShowRename(true)}>
          Thay đổi ảnh
        </div>
      </div>
    </Accordion>
    {isShowRename && <ModalRename  isShow={isShowRename} onClose={() => setShowRename(false)} /> }
  </>
}

export default GroupSettings;