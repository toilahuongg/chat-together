import Button from "@src/Components/Layout/Button";
import Modal from "@src/Components/Layout/Modal"
import { useGroup } from "@src/hooks/useListGroup";
import { useState } from "react";
import styles from './modal-rename.module.scss';

type TProps = {
  isShow: boolean;
  onClose: () => void
}
const ModalRename: React.FC<TProps> = ({ isShow, onClose }) => {
  const group = useGroup();
  const [name, setName] = useState(group.data.get().name);
  const handleSave = async () => {
    group.data.name.set(name);
    onClose();
  }
  return (
    <Modal isShow={isShow} onClose={onClose}>
      <Modal.Header>
        Đổi tên đoạn chat
      </Modal.Header>
      <Modal.Body>
        <textarea className={styles.textarea} minLength={1} maxLength={100} value={name} onChange={(e) => setName(e.target.value)}/>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button onClick={onClose}> Hủy </Button>
        <Button variable="primary" onClick={handleSave}> Lưu </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalRename;