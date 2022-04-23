import { useSocket } from '@src/Components/SocketProvider';
import type { NextPage } from 'next'
import { useEffect } from 'react';
import instance from '@src/helpers/instance';
import GuestHome from '@src/Components/Guest/Home';
import Slider from '@src/Components/Guest/Slider';
import useAuth from '@src/hooks/useAuth';
import Messenger from '@src/Components/Messenger';
const Home: NextPage = () => {
  const socket = useSocket();
  const isAuth = useAuth();
  console.log(isAuth);
  useEffect(() => {
    if (socket && isAuth) {
      socket.on("messages", (data) => console.log(data));
      socket.on("users-online", (data) => console.log(data));
      (async () => {
        const response = await instance.get('/api/user/profile');
        const { _id } = response.data;
        socket.emit("logged-in", _id);
      })()
    }
  }, [socket, isAuth]);
  return isAuth ? <Messenger /> : <GuestHome />;
}

export default Home
