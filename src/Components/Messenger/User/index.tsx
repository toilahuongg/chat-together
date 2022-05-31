import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import Avatar from '@src/Components/Layout/Avatar';
import Button from '@src/Components/Layout/Button';
import { IUser } from 'server/types/user.type';

import styles from './user.module.scss';
import { useFetchAuth } from '@src/hooks/useFetchAuth';
import Checkbox from '@src/Components/Layout/Checkbox';
import useSocket from '@src/hooks/useSocket';

type TProps = {
  type: 'friends-request-sent' | 'pending-friends-request' | 'friends' | 'checkbox',
  data: IUser,
  isFriendRequestSent?: boolean,
  isChecked?: boolean,
  onUpdate: (userID: string, unaccept?: boolean) => void
}

const User: React.FC<TProps> = ({ data, type, isFriendRequestSent = false, isChecked = false, onUpdate }) => {
  const socket = useSocket();
  const instance = useFetchAuth();
  const isMounted = useRef(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingUnaccept, setLoadingUnaccept] = React.useState(false);
  const handleFriendsRequestSent = async () => {
    if (isMounted.current) return;
    try {
      setLoading(true);
      await instance.post(`/api/friend/${isFriendRequestSent ? 'retake-friend-request' : 'friend-request'}/${data._id}`, {}, {
        headers: {
          'x-exclude-socket-id': socket?.id!
        }
      });
      onUpdate(data._id);
    } catch (error: any) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.message) toast.error(error.response.data.message);
      else toast.error('Lỗi hệ thống! Vui lòng thử lại');
    } finally {
      setLoading(false);
    }

  }

  const handleAcceptFriend = async () => {
    if (isMounted.current) return;
    try {
      setLoading(true);
      await instance.post(`/api/friend/accept-friend-request/${data._id}`, {}, {
        headers: {
          'x-exclude-socket-id': socket?.id!
        }
      });
      onUpdate(data._id);
    } catch (error: any) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.message) toast.error(error.response.data.message);
      else toast.error('Lỗi hệ thống! Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  }

  const handleUnAcceptFriend = async () => {
    if (isMounted.current) return;
    try {
      setLoadingUnaccept(true);
      await instance.post(`/api/friend/denie-friend-request/${data._id}`, {}, {
        headers: {
          'x-exclude-socket-id': socket?.id!
        }
      });
      onUpdate(data._id, true);
    } catch (error: any) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.message) toast.error(error.response.data.message);
      else toast.error('Lỗi hệ thống! Vui lòng thử lại');
    } finally {
      setLoadingUnaccept(false);
    }
  }

  const handleUnFriend = async () => {
    if (isMounted.current) return;
    try {
      setLoading(true);
      await instance.post(`/api/friend/unfriend/${data._id}`, {}, {
        headers: {
          'x-exclude-socket-id': socket?.id!
        }
      });
      onUpdate(data._id);
    } catch (error: any) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.message) toast.error(error.response.data.message);
      else toast.error('Lỗi hệ thống! Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    isMounted.current = false;
    return () => {
      isMounted.current = true;
    }
  }, []);
  return (
    <div className={styles.item}>
      <Avatar
        width={48}
        height={48}
        src={`https://ui-avatars.com/api/?name=${String.fromCharCode(Math.floor(Math.random() * 25 + 65))}&background=random`}
        alt="Avatar"
      />
      <div className={styles.user}>
        <div className={styles.name}>{data.fullname}</div>
        {type !== 'checkbox' && <div className={styles.status}>Tôi rất vui khi chúng ta trở thành bạn bè</div>}
      </div>
      <div className={styles.action}>
        {type === 'pending-friends-request' && (
          <>
            <Button
              variable="primary"
              onClick={handleAcceptFriend}
              loading={loading}
            >
              Chấp nhận
            </Button>
            <Button
              variable="outline-primary"
              onClick={handleUnAcceptFriend}
              loading={loadingUnaccept}
            >
              Không chấp nhận
            </Button>
          </>
        )}
        {type === 'friends-request-sent' && (
          <Button
            variable={isFriendRequestSent ? "primary" : "outline-primary"}
            onClick={handleFriendsRequestSent}
            loading={loading}
          >
            {isFriendRequestSent ? 'Huỷ lời mời' : 'Kết bạn'}
          </Button>
        )}
        {type === 'friends' && (
          <Button
            variable="primary"
            onClick={handleUnFriend}
            loading={loading}
          >
            Huỷ kết bạn
          </Button>
        )}
        {type === 'checkbox' && (
          <Checkbox checked={isChecked} onChange={() => onUpdate(data._id)} />
        )}
      </div>
    </div>
  )
}

export default User;