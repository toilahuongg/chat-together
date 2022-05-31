import ChangeAvatar from "@src/Components/ChangeAvatar";
import Button from "@src/Components/Layout/Button";
import Modal from "@src/Components/Layout/Modal"
import getCroppedImg from "@src/helpers/cropImage";
import { useFetchAuth } from "@src/hooks/useFetchAuth";
import useListGroup, { useGroup } from "@src/hooks/useListGroup";
import useListMessage from '@src/hooks/useListMessage';
import useSocket from "@src/hooks/useSocket";
import { useState } from "react";
import { Area } from "react-easy-crop";

type TProps = {
  isShow: boolean;
  onClose: () => void
}
const ModalChangeAvatar: React.FC<TProps> = ({ isShow, onClose }) => {
  const instance = useFetchAuth();
  const socket = useSocket();
  const group = useGroup();
  const listMessage = useListMessage();
  const listGroup = useListGroup();
  const [avatar, setAvatar] = useState(group.data.get().avatar || '');
  const [isLoading, setLoading] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const handleSave = async () => {
    setLoading(true);
    const { croppedImage, width, height } = await getCroppedImg(
      avatar,
      croppedAreaPixels,
    );
    const formData = new FormData();
    formData.append('width', '' + width);
    formData.append('height', '' + height);
    formData.append('image', croppedImage);
    const response = await instance.put(`/api/room/${group.data.get()._id}/change-avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data", 'x-exclude-socket-id': socket?.id! }
    });
    const { message, user, ...room } = response.data;
    group.data.set(room);
    listMessage.addNotify(message!);
    listGroup.updateGroup({ message, user, ...room});
    setLoading(false);
    onClose();
  }
  return (
    <Modal isShow={isShow} onClose={onClose} size="lg">
      <Modal.Header>
        Đổi tên đoạn chat
      </Modal.Header>
      <Modal.Body>
        <ChangeAvatar
          image={avatar}
          setImage={setAvatar}
          cropped={croppedAreaPixels}
          setCropped={setCroppedAreaPixels}
        />
      </Modal.Body>
      <Modal.Footer align="right">
        <Button onClick={onClose}> Hủy </Button>
        <Button variable="primary" onClick={handleSave} loading={isLoading}> Lưu </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalChangeAvatar;