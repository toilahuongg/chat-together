import { useState } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';


import TextField from '@src/Components/Guest/TextField';
import Modal from '@src/Components/Modal';
import IconSearch from '@src/styles/svg/search.svg';

import styles from './modal-recommend-friends.module.scss';

const ModalRecommendFriends = () => {

  const hiddenRecommendFriends = useState(false);
  if (typeof window !== 'undefined') hiddenRecommendFriends.attach(Persistence('hidden-recommend-friends'));
  const showState = useState(JSON.parse(JSON.stringify(hiddenRecommendFriends.value)));
  return (
    <Modal isShow={!showState.get()} onClose={() => showState.set(true)} size="md">
      <Modal.Header>
        Hãy thêm bạn để trò truyện
      </Modal.Header>
      <Modal.Body>
        <TextField icon={<IconSearch />} />
      </Modal.Body>
      <Modal.Footer align="right">
        <button onClick={() => {
          showState.set(true)
          hiddenRecommendFriends.set(true);
        }}> Không hiển thị lại </button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalRecommendFriends;