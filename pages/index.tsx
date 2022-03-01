import { useSocket } from '@src/Components/SocketProvider';
import type { NextPage } from 'next'
import { useEffect } from 'react';
import instance from '@src/helpers/instance';
const Home: NextPage = () => {
  const socket = useSocket();
  useEffect(() => {
    if (socket) {
      socket.on("messages", (data) => console.log(data));
      socket.on("users-online", (data) => console.log(data));
      (async () => {
        const response = await instance.get('/api/user/profile');
        const { _id } = response.data;
        socket.emit("logged-in", _id);
      })()
    }
  }, [socket]);
  return (
    <>
      OKE
    </>
  )
}

export default Home
