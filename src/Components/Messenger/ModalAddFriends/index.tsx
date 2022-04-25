import { useState } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';

import TextField from '@src/Components/Layout/TextField';
import Button from '@src/Components/Layout/Button';
import Modal from '@src/Components/Layout/Modal';
import Checkbox from '@src/Components/Layout/Checkbox';
import User from './User';

import IconSearch from '@src/styles/svg/search.svg';

type TProps = {
  isRecommend?: boolean,
  isShow?: boolean,
  onClose?: () => void
}
const ModalFriends: React.FC<TProps> = ({
  isRecommend = false,
  isShow = false,
  onClose = () => { }
}) => {

  const hiddenRecommendFriends = useState(false);
  const checkboxState = useState(false);
  if (typeof window !== 'undefined') hiddenRecommendFriends.attach(Persistence('hidden-recommend-friends'));
  const showState = useState(JSON.parse(JSON.stringify(hiddenRecommendFriends.value)));

  const handleClose = () => {
    showState.set(true)
    if (checkboxState.get()) hiddenRecommendFriends.set(true);
  }
  return (
    <Modal isShow={!isRecommend ? isShow : !showState.get()} onClose={!isRecommend ? onClose : handleClose} size="md">
      <Modal.Header>
        Hãy thêm bạn để trò truyện
      </Modal.Header>
      <Modal.Body>
        <TextField icon={<IconSearch />} placeholder="Tìm kiếm..." />
        <div style={{ margin: "-10px" }}>
          <User />
          <User />
          <User />
        </div>
      </Modal.Body>
      <Modal.Footer align={isRecommend ? "between" : "right"}>
        {
          isRecommend && (
            <Checkbox
              type="checkbox"
              checked={checkboxState.get()}
              onChange={() => checkboxState.set(!checkboxState.get())}
              label="Không hiển thị lại"
            />
          )
        }
        <Button onClick={!isRecommend ? onClose : handleClose}> Đóng </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalFriends;