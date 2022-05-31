import Button from "@src/Components/Layout/Button";
import Modal from "@src/Components/Layout/Modal"
import { useFetchAuth } from "@src/hooks/useFetchAuth";
import useListGroup, { useGroup } from "@src/hooks/useListGroup";
import useListMessage from "@src/hooks/useListMessage";
import useSocket from "@src/hooks/useSocket";
import { useState } from "react";
import styles from './modal-rename.module.scss';

type TProps = {
  isShow: boolean;
  onClose: () => void
}
const ModalRename: React.FC<TProps> = ({ isShow, onClose }) => {
  const instance = useFetchAuth();
  const socket = useSocket();
  const group = useGroup();
  const listMessage = useListMessage();
  const listGroup = useListGroup();
  const [name, setName] = useState(group.data.get().name);
  const [isLoading, setLoading] = useState(false);
  const handleSave = async () => {
    setLoading(true);
    const response = await instance.put(`/api/room/${group.data.get()._id}/rename`, { name }, {
      headers: { 'x-exclude-socket-id': socket?.id! }
    });
    const { message, user, ...room } = response.data;
    group.data.set(room);
    listMessage.addNotify(message!);
    listGroup.updateGroup({ message, user, ...room});
    setLoading(false);
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
        <Button variable="primary" onClick={handleSave} loading={isLoading}> Lưu </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalRename;