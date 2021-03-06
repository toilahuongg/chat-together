import Button from '@src/Components/Layout/Button';
import Modal from '@src/Components/Layout/Modal';
import React from 'react';
import useUser from '@src/hooks/useUser';
import Tabs from '@src/Components/Layout/Tabs';
import ChangeAvatar from '../../ChangeAvatar';
import { Area } from 'react-easy-crop';
import getCroppedImg from '@src/helpers/cropImage';
import TextField from '@src/Components/Layout/TextField';
import { useState } from '@hookstate/core';
import { defaultUser } from '@src/constants/user.constant';
import { IUser } from 'server/types/user.type';
import { validateConfirmPassword, validateEmail, validateFullname, validatePassword, validatePhone } from '@src/validators/user.validator';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import useSocket from '@src/hooks/useSocket';

type TProps = {
  isShow: boolean,
  onClose: () => void
}
const ModalUpdateProfile: React.FC<TProps> = ({
  isShow = false,
  onClose = () => { }
}) => {
  const user = useUser();
  const socket = useSocket();
  const instance = useFetchAuth();
  const errorState = useState({ ...defaultUser(), confirmPassword: '' });
  const cloneDataUser = useState(JSON.parse(JSON.stringify(user.data.get())) as IUser);
  const [selected, setSelected] = React.useState('general');
  const [newPassword, setNewPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);

  const handleSave = async () => {
    setLoading(true);
    const {croppedImage, width, height} = await getCroppedImg(
      cloneDataUser.avatar.get() || '',
      croppedAreaPixels,
    );
    const rawData = cloneDataUser.get();
    const formData = new FormData();
    formData.append('width', ''+width);
    formData.append('height', ''+height);
    formData.append('fullname', rawData.fullname);
    formData.append('email', rawData.email);
    formData.append('phone', rawData.phone);
    formData.append('password', rawData.password);
    formData.append('newPassword', newPassword);
    formData.append('image', croppedImage);
    const response = await instance.put('/api/user/update-profile', formData, {
      headers: { "Content-Type": "multipart/form-data", 'x-exclude-socket-id': socket?.id! }
    });
    user.data.set(response.data);
    setLoading(false);
    onClose();
  }

  const tabs  = [{
    id: 'general',
    label: 'Th??ng tin chung'
  }];
  if (!user.isSocial.get()) tabs.push({
    id: 'change-password',
    label: 'M???t kh???u'
  });
  tabs.push({
    id: 'avatar',
    label: 'Avatar'
  });
  
  return (
    <Modal isShow={isShow} onClose={onClose} size="lg">
      <Modal.Header>
        C???p nh???t th??ng tin
      </Modal.Header>
      <Modal.Body>
        <Tabs
          tabs={tabs}
          selected={selected}
          onSelect={(val: string) => setSelected(val)}
        />
        {selected === 'general' && (
          <>
            <TextField
              label="H??? v?? t??n"
              value={cloneDataUser.fullname.get()}
              onChange={cloneDataUser.fullname.set}
              onKeyUp={(e) => validateFullname((e.target as any).value, errorState.fullname)}
              errorMessage={errorState.fullname.get()}
              plain
            />
            <TextField
              label="Email"
              type="email"
              value={cloneDataUser.email.get()}
              onChange={cloneDataUser.email.set}
              onKeyUp={(e) => validateEmail((e.target as any).value, errorState.email)}
              errorMessage={errorState.email.get()}
              plain
            />
            <TextField
              label="S??? ??i???n tho???i"
              value={cloneDataUser.phone.get()}
              onChange={cloneDataUser.phone.set}
              onKeyUp={(e) => validatePhone((e.target as any).value, errorState.phone)}
              errorMessage={errorState.phone.get()}
              plain
            />
          </>
        )}
        {selected === 'change-password' && !user.isSocial.get() && (
          <>
            <TextField
              label="M???t kh???u c??"
              type="password"
              value={cloneDataUser.password.get()}
              onChange={cloneDataUser.password.set}
              plain
            />
            <TextField
              label="M???t kh???u m???i"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              onKeyUp={(e) => validatePassword((e.target as any).value, errorState.password)}
              errorMessage={errorState.password.get()}
              plain
            />
            <TextField
              label="Nh???p l???i m???t kh???u"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onKeyUp={(e) => validateConfirmPassword((e.target as any).value, user.password.get(), errorState.confirmPassword)}
              errorMessage={errorState.confirmPassword.get()}
              plain
            />
          </>
        )}
        {selected === 'avatar' && (
          <ChangeAvatar
            image={cloneDataUser.avatar.get() || ''}
            setImage={(val) => cloneDataUser.avatar.set(val)}
            cropped={croppedAreaPixels}
            setCropped={setCroppedAreaPixels}
          />
        )}
      </Modal.Body>
      <Modal.Footer align="right">
        <Button onClick={onClose}> ????ng </Button>
        <Button onClick={handleSave} variable="primary" loading={loading}> L??u </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalUpdateProfile;